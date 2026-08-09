import type { CheckResult } from "./checker";
import { checkAnswer, normalizeExpression, preNormalize } from "./checker";
import nerdamer from "./nerdamer";
import type { Problem } from "./types";

/**
 * Grading with follow-through, the way the exam is actually marked.
 *
 * A student who slips in part (א) and then works part (ב) perfectly from
 * their own wrong value has demonstrated the method. Marking (ב) as simply
 * wrong both understates the score and teaches the wrong lesson — that one
 * early slip ruins everything.
 */

/** Full credit; follow-through is worth most of the marks, not all. */
export const FOLLOW_THROUGH_CREDIT = 0.7;

export interface GradedField extends CheckResult {
  /** True when the answer is right only relative to an earlier wrong answer. */
  followThrough?: boolean;
  /** 1, FOLLOW_THROUGH_CREDIT, or 0. */
  credit: number;
}

/** Pulls the numbers out of an answer: "3" -> [3], "(3,-1)" -> [3,-1]. */
function toNumbers(raw: string): number[] | null {
  const cleaned = preNormalize(raw)
    .replace(/^\s*\(/, "")
    .replace(/\)\s*$/, "");
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const out: number[] = [];
  for (const part of parts) {
    try {
      const v = Number(
        nerdamer(normalizeExpression(part)).evaluate().text("decimals"),
      );
      if (!Number.isFinite(v)) return null;
      out.push(v);
    } catch {
      return null;
    }
  }
  return out;
}

export function gradeProblem(
  problem: Problem,
  answers: Record<string, string>,
): Record<string, GradedField> {
  const graded: Record<string, GradedField> = {};

  // First pass: straight marking against the canonical answer.
  for (const field of problem.fields) {
    const result = checkAnswer(
      answers[field.id] ?? "",
      field.expected,
      field.type,
      { vars: field.vars, sampleRange: field.sampleRange },
    );
    graded[field.id] = { ...result, credit: result.correct ? 1 : 0 };
  }

  // Second pass: rescue wrong answers that follow correctly from the
  // student's own earlier ones.
  for (const field of problem.fields) {
    const rule = field.followsFrom;
    if (!rule || graded[field.id].correct) continue;

    // Only applies when a prerequisite was actually wrong; otherwise a wrong
    // answer here is just wrong.
    if (rule.fields.every((id) => graded[id]?.correct)) continue;

    const prior: Record<string, number[]> = {};
    let usable = true;
    for (const id of rule.fields) {
      const nums = toNumbers(answers[id] ?? "");
      if (!nums) {
        usable = false;
        break;
      }
      prior[id] = nums;
    }
    if (!usable) continue;

    let expected: string | null = null;
    try {
      expected = rule.expected(prior);
    } catch {
      expected = null;
    }
    if (!expected) continue;

    const followed = checkAnswer(
      answers[field.id] ?? "",
      expected,
      field.type,
      { vars: field.vars, sampleRange: field.sampleRange },
    );
    if (followed.correct) {
      graded[field.id] = {
        ...graded[field.id],
        followThrough: true,
        credit: FOLLOW_THROUGH_CREDIT,
      };
    }
  }

  return graded;
}

export function totalCredit(graded: Record<string, GradedField>): number {
  const values = Object.values(graded);
  if (values.length === 0) return 0;
  return values.reduce((sum, g) => sum + g.credit, 0) / values.length;
}
