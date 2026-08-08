import type { Rng } from "./types";

/**
 * mulberry32 — small, fast, seedable. Determinism matters: a problem is fully
 * reproducible from (templateId, seed), so exams and history can be replayed
 * without storing the generated problem.
 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const rng: Rng = {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    nonZeroInt(min, max) {
      for (;;) {
        const v = rng.int(min, max);
        if (v !== 0) return v;
      }
    },
    pick: (items) => items[Math.floor(next() * items.length)],
    sign: () => (next() < 0.5 ? -1 : 1),
    shuffle(items) {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
  return rng;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Rejection sampling helper used by every template's sampler. */
export function sample<T>(
  rng: Rng,
  draw: () => T | null,
  maxTries = 500,
): T {
  for (let i = 0; i < maxTries; i++) {
    const v = draw();
    if (v !== null) return v;
  }
  throw new Error("sampler failed to find a valid configuration");
}
