import { TEMPLATE_IDS, type Problem, type Rng, type TemplateId } from "./types";
import { generateProblem, REGISTERED_TEMPLATE_IDS } from "./templates";
import { makeRng, randomSeed } from "./rng";
import type { RecognitionStats } from "./types";

/**
 * "Spot the pattern": a question stem with no answer fields, and the single
 * question — which method is this?
 *
 * Recognition is a separate skill from solving, and it is the one that makes a
 * student fast: speed in the exam comes from never re-deriving *which* method
 * to reach for. Twenty of these take three minutes.
 */

export const CHOICE_COUNT = 4;
export const ROUND_LENGTH = 10;

/**
 * Which types are genuinely mistakable for each other. Random distractors make
 * the drill trivial — "is this a limit or a triangle?" teaches nothing. These
 * pairs share surface features: the word "tangent", the word "bisector", a
 * ratio to recover, an integral sign.
 */
export const CONFUSABLE: Record<TemplateId, TemplateId[]> = {
  "triangle-bisector": ["triangle-from-lines", "circle-tangent"],
  "triangle-from-lines": ["triangle-bisector", "circle-tangent"],
  // both talk about a "tangent"
  "circle-tangent": ["function-investigation", "triangle-from-lines"],
  // both are "investigate this function": the giveaway is domain vs roots
  "function-investigation": ["polynomial-investigation", "circle-tangent"],
  "polynomial-investigation": ["function-investigation", "optimization"],
  // both integrate a region; one asks for area, the other spins it
  "area-between-curves": ["volume-revolution", "reverse-integral"],
  "volume-revolution": ["area-between-curves", "reverse-integral"],
  "reverse-integral": ["area-between-curves", "limits"],
  optimization: ["polynomial-investigation", "area-between-curves"],
  limits: ["reverse-integral", "growth-decay"],
  // both: recover a ratio from two readings, then use it
  sequences: ["growth-decay", "limits"],
  "growth-decay": ["sequences", "limits"],
};

export interface SpotItem {
  /** Only the statement is shown — no fields, no figure. */
  problem: Problem;
  correct: TemplateId;
  choices: TemplateId[];
}

/** Weighted so the templates you misread come up more often. */
export function pickSpotTemplate(
  recognition: Record<string, RecognitionStats>,
  random: () => number,
  avoid?: TemplateId,
): TemplateId {
  const weights = REGISTERED_TEMPLATE_IDS.map((id) => {
    const s = recognition[id];
    const accuracy = s && s.seen > 0 ? s.correct / s.seen : 0;
    const evidence = s ? Math.min(1, s.seen / 6) : 0;
    // Unseen types are worth showing; badly-read types are worth showing more.
    let w = 1 + 2.5 * (1 - accuracy) * evidence + (evidence < 1 ? 1.2 : 0);
    if (id === avoid) w *= 0.3;
    return { id, w };
  });
  const total = weights.reduce((sum, x) => sum + x.w, 0);
  let r = random() * total;
  for (const x of weights) {
    r -= x.w;
    if (r <= 0) return x.id;
  }
  return weights[weights.length - 1].id;
}

/** Builds one drill item. Deterministic in `seed`. */
export function makeSpotItem(
  correct: TemplateId,
  seed: number,
): SpotItem {
  const rng: Rng = makeRng(seed);
  const problem = generateProblem(correct, seed);

  const pool = REGISTERED_TEMPLATE_IDS.filter((id) => id !== correct);
  const confusable = (CONFUSABLE[correct] ?? []).filter((id) =>
    pool.includes(id),
  );

  const distractors: TemplateId[] = [];
  // Confusable ones first — the drill should live at the boundaries.
  for (const id of rng.shuffle(confusable)) {
    if (distractors.length >= CHOICE_COUNT - 2) break;
    distractors.push(id);
  }
  for (const id of rng.shuffle(pool)) {
    if (distractors.length >= CHOICE_COUNT - 1) break;
    if (!distractors.includes(id)) distractors.push(id);
  }

  return {
    problem,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
  };
}

export function makeRound(
  recognition: Record<string, RecognitionStats>,
  length = ROUND_LENGTH,
): SpotItem[] {
  const items: SpotItem[] = [];
  let previous: TemplateId | undefined;
  for (let i = 0; i < length; i++) {
    const id = pickSpotTemplate(recognition, Math.random, previous);
    previous = id;
    items.push(makeSpotItem(id, randomSeed()));
  }
  return items;
}

export function emptyRecognition(templateId: TemplateId): RecognitionStats {
  return { templateId, seen: 0, correct: 0, totalMs: 0 };
}

export function recognitionFor(
  recognition: Record<string, RecognitionStats>,
  id: TemplateId,
): RecognitionStats {
  return recognition[id] ?? emptyRecognition(id);
}

/** Overall recognition accuracy across every type that has been seen. */
export function recognitionAccuracy(
  recognition: Record<string, RecognitionStats>,
): { seen: number; correct: number; accuracy: number; medianMs: number } {
  let seen = 0;
  let correct = 0;
  let ms = 0;
  for (const id of TEMPLATE_IDS) {
    const s = recognition[id];
    if (!s) continue;
    seen += s.seen;
    correct += s.correct;
    ms += s.totalMs;
  }
  return {
    seen,
    correct,
    accuracy: seen ? correct / seen : 0,
    medianMs: seen ? ms / seen : 0,
  };
}
