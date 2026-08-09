import type { TemplateId } from "./types";

/**
 * Realistic exam allocations, in seconds, for one question of each type.
 *
 * These are what turns "slow" from a feeling into a number. They are sized
 * against the real paper — roughly 90 minutes for six questions — and scaled
 * by how many parts each type asks for. A student consistently inside budget
 * on a type has genuinely finished with it; one at 2x budget knows the method
 * but has not automated it.
 */
export const BUDGET_SECONDS: Record<TemplateId, number> = {
  "triangle-bisector": 360,
  "triangle-from-lines": 600,
  "circle-tangent": 540,
  "function-investigation": 720,
  "area-between-curves": 600,
  "reverse-integral": 300,
  optimization: 600,
  limits: 180,
  sequences: 300,
  "growth-decay": 360,
};

/** Under 1 means faster than the exam allocation. */
export function paceRatio(seconds: number, budget: number): number {
  return budget > 0 ? seconds / budget : 1;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
