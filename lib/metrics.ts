import { BUDGET_SECONDS } from "./budgets";
import { recognitionFor } from "./spot";
import { TEMPLATE_IDS } from "./types";
import type { Attempt, RecognitionStats, TemplateId } from "./types";

/**
 * The exam tests three skills that fail independently, and a single blended
 * "mastery" percentage cannot tell a student which one is costing them marks:
 *
 *   recognition — do you know which method this is, at a glance?
 *   pace        — can you execute it inside the exam's time allocation?
 *   accuracy    — do you get it right FIRST time, with no second go?
 *
 * "You know the methods and you're quick, you're losing marks to slips" and
 * "you're accurate but too slow to finish" need completely different practice.
 */

export interface SkillTriple {
  /** 0..1, or null when there is no evidence yet. */
  recognition: number | null;
  /** Median-ish pace as a multiple of budget; under 1 is faster than the exam. */
  pace: number | null;
  /** First-attempt, no-retry accuracy, 0..1. */
  accuracy: number | null;
}

export interface TemplateMetrics extends SkillTriple {
  templateId: TemplateId;
  solved: number;
  budgetSeconds: number;
  /** Mean seconds actually taken on first attempts. */
  meanSeconds: number | null;
}

/** Attempts count toward accuracy only when they were genuine first tries. */
function firstAttempts(history: Attempt[], id: TemplateId): Attempt[] {
  return history.filter((a) => a.templateId === id && a.attemptNo === 1);
}

export function templateMetrics(
  id: TemplateId,
  history: Attempt[],
  recognition: Record<string, RecognitionStats>,
): TemplateMetrics {
  const budgetSeconds = BUDGET_SECONDS[id];
  const first = firstAttempts(history, id);
  const rec = recognitionFor(recognition, id);

  const meanSeconds = first.length
    ? first.reduce((s, a) => s + a.seconds, 0) / first.length
    : null;

  return {
    templateId: id,
    solved: first.length,
    budgetSeconds,
    meanSeconds,
    recognition: rec.seen > 0 ? rec.correct / rec.seen : null,
    pace: meanSeconds === null ? null : meanSeconds / budgetSeconds,
    // Partial credit is still credit: use the score, not the all-or-nothing flag.
    accuracy: first.length
      ? first.reduce((s, a) => s + a.score, 0) / first.length
      : null,
  };
}

export function allMetrics(
  history: Attempt[],
  recognition: Record<string, RecognitionStats>,
): TemplateMetrics[] {
  return TEMPLATE_IDS.map((id) => templateMetrics(id, history, recognition));
}

/** Aggregate across every type that has any evidence. */
export function overallSkills(
  history: Attempt[],
  recognition: Record<string, RecognitionStats>,
): SkillTriple & { solved: number } {
  const rows = allMetrics(history, recognition);

  const recSeen = TEMPLATE_IDS.reduce(
    (s, id) => s + recognitionFor(recognition, id).seen,
    0,
  );
  const recCorrect = TEMPLATE_IDS.reduce(
    (s, id) => s + recognitionFor(recognition, id).correct,
    0,
  );

  const firsts = history.filter((a) => a.attemptNo === 1);
  const solved = firsts.length;

  // Pace is weighted by budget so a slow long question is not hidden by a
  // fast short one.
  let spent = 0;
  let budgeted = 0;
  for (const r of rows) {
    if (r.meanSeconds === null) continue;
    spent += r.meanSeconds * r.solved;
    budgeted += r.budgetSeconds * r.solved;
  }

  return {
    solved,
    recognition: recSeen ? recCorrect / recSeen : null,
    pace: budgeted ? spent / budgeted : null,
    accuracy: solved
      ? firsts.reduce((s, a) => s + a.score, 0) / solved
      : null,
  };
}

export type SkillKey = "recognition" | "pace" | "accuracy";

/**
 * Which single skill is costing the most, so the app can say what to do next
 * rather than just showing three numbers.
 */
export function weakestSkill(triple: SkillTriple): SkillKey | null {
  const deficits: [SkillKey, number][] = [];
  if (triple.recognition !== null)
    deficits.push(["recognition", 1 - triple.recognition]);
  if (triple.accuracy !== null) deficits.push(["accuracy", 1 - triple.accuracy]);
  // Only over-budget counts as a deficit; being fast is not a problem.
  if (triple.pace !== null) deficits.push(["pace", Math.max(0, triple.pace - 1)]);
  if (deficits.length === 0) return null;
  deficits.sort((a, b) => b[1] - a[1]);
  return deficits[0][1] > 0.08 ? deficits[0][0] : null;
}
