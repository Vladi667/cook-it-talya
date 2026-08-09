import { TEMPLATE_IDS, type TemplateId, type TemplateStats } from "./types";

/**
 * Spaced repetition keyed on the TEMPLATE TYPE, not individual questions —
 * every question is freshly generated, so there is nothing to repeat verbatim.
 */

const DAY = 86_400_000;
/** Mastery decays with a 10-day half-life once you stop practising a type. */
export const HALF_LIFE_DAYS = 10;
/** No template ever drops out of the rotation entirely. */
export const SELECTION_FLOOR = 0.35;

export function emptyStats(templateId: TemplateId): TemplateStats {
  return {
    templateId,
    attempts: 0,
    correct: 0,
    scoreSum: 0,
    totalSeconds: 0,
    lastSeen: null,
    streak: 0,
  };
}

export function statsFor(
  stats: Record<string, TemplateStats>,
  id: TemplateId,
): TemplateStats {
  return stats[id] ?? emptyStats(id);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function daysSince(lastSeen: number | null, now: number): number {
  if (lastSeen === null) return Infinity;
  return Math.max(0, (now - lastSeen) / DAY);
}

/** Exponential forgetting term in [0, 1]. */
export function recency(lastSeen: number | null, now: number): number {
  const d = daysSince(lastSeen, now);
  if (!Number.isFinite(d)) return 0;
  return Math.pow(0.5, d / HALF_LIFE_DAYS);
}

/**
 * Mastery in [0, 1] = accuracy, discounted by how little evidence we have,
 * and decayed toward a floor as the memory goes stale.
 */
export function mastery(s: TemplateStats, now: number): number {
  if (s.attempts === 0) return 0;
  const accuracy = s.scoreSum / s.attempts;
  const confidence = 1 - Math.exp(-s.attempts / 4);
  const r = recency(s.lastSeen, now);
  return clamp01(accuracy * confidence * (0.45 + 0.55 * r));
}

/** Selection weight: low mastery and staleness both pull a template forward. */
export function selectionWeight(s: TemplateStats, now: number): number {
  const m = mastery(s, now);
  const staleness = s.lastSeen === null ? 1 : 1 - recency(s.lastSeen, now);
  return SELECTION_FLOOR + 3 * (1 - m) ** 2 + 1.5 * staleness;
}

export interface NextPick {
  templateId: TemplateId;
  weight: number;
}

/**
 * Weighted sample over the available templates. `avoid` (usually the template
 * just seen) is de-weighted rather than removed, so a short rotation still
 * varies, and the floor keeps every type reachable.
 */
export function pickNextTemplate(
  stats: Record<string, TemplateStats>,
  now: number,
  opts: {
    random?: () => number;
    avoid?: TemplateId;
    available?: readonly TemplateId[];
    /** Extra weight per template from unresolved traps, see lib/traps.ts. */
    trapPressure?: (id: TemplateId) => number;
  } = {},
): TemplateId {
  const {
    random = Math.random,
    avoid,
    available = TEMPLATE_IDS,
    trapPressure,
  } = opts;

  const weights: NextPick[] = available.map((id) => {
    let w = selectionWeight(statsFor(stats, id), now);
    // A trap you keep falling for should bring its question type back sooner.
    if (trapPressure) w += 1.2 * trapPressure(id);
    if (id === avoid && available.length > 1) w *= 0.25;
    return { templateId: id, weight: w };
  });

  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let r = random() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.templateId;
  }
  return weights[weights.length - 1].templateId;
}

/** Lowest-mastery template that has actually been attempted. */
export function weakestTemplate(
  stats: Record<string, TemplateStats>,
  now: number,
): TemplateId | null {
  const seen = TEMPLATE_IDS.map((id) => statsFor(stats, id)).filter(
    (s) => s.attempts > 0,
  );
  if (seen.length === 0) return null;
  return seen.reduce((worst, s) =>
    mastery(s, now) < mastery(worst, now) ? s : worst,
  ).templateId;
}

export function applyAttempt(
  s: TemplateStats,
  opts: { correct: boolean; score: number; seconds: number; at: number },
): TemplateStats {
  return {
    ...s,
    attempts: s.attempts + 1,
    correct: s.correct + (opts.correct ? 1 : 0),
    scoreSum: s.scoreSum + opts.score,
    totalSeconds: s.totalSeconds + opts.seconds,
    lastSeen: opts.at,
    streak: opts.correct ? s.streak + 1 : 0,
  };
}
