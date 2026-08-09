import { makeRng, randomSeed } from "./rng";
import { fracLatex, fracPlain, paren, signed, signedTerm } from "./templates/util";
import type { AnswerType, Lang, Rng, Text } from "./types";

/**
 * Quick-fire micro-drills.
 *
 * Every full question in this app takes minutes. That is the wrong grain for
 * building automaticity: the recipes all decompose into the same handful of
 * atoms, and when those atoms cost zero thought the whole question gets fast —
 * and the *pattern* becomes visible, because the mechanics stop consuming
 * attention.
 *
 * Ten items, sixty seconds, one atom at a time. These are the scales.
 */

export const MICRO_IDS = [
  "distance",
  "complete-square",
  "long-division",
  "differentiate",
  "solve-power",
  "sequence-step",
  "log-simplify",
] as const;

export type MicroId = (typeof MICRO_IDS)[number];

export interface MicroItem {
  atomId: MicroId;
  /** LaTeX, shown large and alone. */
  prompt: string;
  expected: string;
  type: AnswerType;
  placeholder: string;
}

export interface MicroAtom {
  id: MicroId;
  name: Text;
  /** Where this atom shows up in the full questions. */
  usedIn: Text;
  build(rng: Rng): MicroItem;
}

const PYTHAG: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [20, 21, 29],
];

export const MICRO_ATOMS: Record<MicroId, MicroAtom> = {
  distance: {
    id: "distance",
    name: { en: "Distance between points", he: "מרחק בין נקודות" },
    usedIn: {
      en: "Every analytic-geometry question opens with this.",
      he: "כל שאלה בגיאומטריה אנליטית נפתחת בזה.",
    },
    build(rng) {
      const [dx, dy, d] = rng.pick(PYTHAG);
      const sx = rng.sign();
      const sy = rng.sign();
      const x1 = rng.int(-8, 8);
      const y1 = rng.int(-8, 8);
      const x2 = x1 + dx * sx;
      const y2 = y1 + dy * sy;
      return {
        atomId: "distance",
        prompt: `AB,\\quad A(${x1},\\ ${y1}),\\ B(${x2},\\ ${y2})`,
        expected: String(d),
        type: "number",
        placeholder: "e.g. 13",
      };
    },
  },

  "complete-square": {
    id: "complete-square",
    name: { en: "Complete the square", he: "השלמה לריבוע" },
    usedIn: {
      en: "Turns a circle's general form into its centre and radius.",
      he: "הופך צורה כללית של מעגל למרכז ולרדיוס.",
    },
    build(rng) {
      const h = rng.nonZeroInt(-9, 9);
      // x^2 + 2hx + ? is a perfect square when ? = h^2
      return {
        atomId: "complete-square",
        prompt: `x^2 ${signed(2 * h)}x + \\;?\\; = (x ${signed(h)})^2`,
        expected: String(h * h),
        type: "number",
        placeholder: "e.g. 25",
      };
    },
  },

  "long-division": {
    id: "long-division",
    name: { en: "Divide, find the remainder", he: "חילוק ומציאת שארית" },
    usedIn: {
      en: "Rational functions and reverse-integral questions both start here.",
      he: "פונקציות רציונליות ושאלות אינטגרל הפוך מתחילות כאן.",
    },
    build(rng) {
      const k = rng.nonZeroInt(-5, 5);
      const m = rng.int(-4, 6);
      const c = rng.nonZeroInt(-9, 12);
      // x^2 + m x + c = (x + k)(x + (m - k)) + (c - k(m - k))
      const remainder = c - k * (m - k);
      return {
        atomId: "long-division",
        prompt: `\\frac{x^2${signedTerm(m, "x")} ${signed(c)}}{x ${signed(k)}}\\quad\\text{remainder}=?`,
        expected: String(remainder),
        type: "number",
        placeholder: "e.g. -3",
      };
    },
  },

  differentiate: {
    id: "differentiate",
    name: { en: "Differentiate", he: "גזירה" },
    usedIn: {
      en: "Extrema, tangents and every optimisation question.",
      he: "קיצון, משיקים וכל שאלת קיצון.",
    },
    build(rng) {
      const kind = rng.pick(["poly", "root", "log", "quotient"] as const);
      if (kind === "poly") {
        const a = rng.nonZeroInt(-4, 5);
        const b = rng.nonZeroInt(-6, 6);
        return {
          atomId: "differentiate",
          prompt: `f(x)=${a}x^3${signedTerm(b, "x^2")},\\quad f'(x)=?`,
          expected: `${3 * a}*x^2+${paren(2 * b)}*x`,
          type: "expression",
          placeholder: "e.g. 9x^2-4x",
        };
      }
      if (kind === "root") {
        const a = rng.int(2, 9);
        return {
          atomId: "differentiate",
          prompt: `f(x)=${a}\\sqrt{x},\\quad f'(x)=?`,
          expected: `${a}/(2*sqrt(x))`,
          type: "expression",
          placeholder: "e.g. 3/(2sqrt(x))",
        };
      }
      if (kind === "log") {
        const a = rng.nonZeroInt(-5, 6);
        return {
          atomId: "differentiate",
          prompt: `f(x)=${a}\\ln x,\\quad f'(x)=?`,
          expected: `${a}/x`,
          type: "expression",
          placeholder: "e.g. 4/x",
        };
      }
      const a = rng.int(2, 9);
      return {
        atomId: "differentiate",
        prompt: `f(x)=\\frac{${a}}{x},\\quad f'(x)=?`,
        expected: `-${a}/x^2`,
        type: "expression",
        placeholder: "e.g. -5/x^2",
      };
    },
  },

  "solve-power": {
    id: "solve-power",
    name: { en: "Solve for the base", he: "פתרון עבור הבסיס" },
    usedIn: {
      en: "Geometric ratios and growth factors are both this step.",
      he: "מנות הנדסיות ומקדמי גדילה — שניהם השלב הזה.",
    },
    build(rng) {
      const n = rng.pick([2, 3]);
      const useFraction = rng.next() < 0.4;
      if (useFraction) {
        const [p, q] = rng.pick([
          [1, 2],
          [1, 3],
          [2, 3],
          [3, 4],
        ]);
        return {
          atomId: "solve-power",
          prompt: `q^{${n}}=${fracLatex(p ** n, q ** n)},\\quad q=?`,
          expected: fracPlain(p, q),
          type: "number",
          placeholder: "e.g. 1/2",
        };
      }
      const q = rng.int(2, 5) * (n === 3 && rng.next() < 0.4 ? -1 : 1);
      return {
        atomId: "solve-power",
        prompt: `q^{${n}}=${q ** n},\\quad q=?`,
        expected: String(q),
        type: "number",
        placeholder: "e.g. 3",
      };
    },
  },

  "sequence-step": {
    id: "sequence-step",
    name: { en: "Steps between terms", he: "צעדים בין איברים" },
    usedIn: {
      en: "The off-by-one that costs most marks in sequences.",
      he: "הסטייה באחד שגובה הכי הרבה נקודות בסדרות.",
    },
    build(rng) {
      const a1 = rng.nonZeroInt(-10, 12);
      const d = rng.nonZeroInt(-6, 8);
      const m = rng.int(2, 5);
      const n = m + rng.int(2, 6);
      const am = a1 + (m - 1) * d;
      const an = a1 + (n - 1) * d;
      return {
        atomId: "sequence-step",
        prompt: `a_{${m}}=${am},\\ a_{${n}}=${an},\\quad d=?`,
        expected: String(d),
        type: "number",
        placeholder: "e.g. 4",
      };
    },
  },

  "log-simplify": {
    id: "log-simplify",
    name: { en: "Simplify logs and powers", he: "פישוט לוגים וחזקות" },
    usedIn: {
      en: "Half of all limits collapse at this step.",
      he: "מחצית מהגבולות קורסים בשלב הזה.",
    },
    build(rng) {
      const kind = rng.pick(["eln", "lnpow", "lndiv", "lne"] as const);
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      if (kind === "eln")
        return {
          atomId: "log-simplify",
          prompt: `e^{\\ln ${a}}=?`,
          expected: String(a),
          type: "number",
          placeholder: "e.g. 7",
        };
      if (kind === "lne")
        return {
          atomId: "log-simplify",
          prompt: `\\ln\\left(e^{${a}}\\right)=?`,
          expected: String(a),
          type: "number",
          placeholder: "e.g. 5",
        };
      if (kind === "lnpow")
        return {
          atomId: "log-simplify",
          prompt: `\\ln\\left(x^{${a}}\\right)=?\\;\\cdot\\ln x`,
          expected: String(a),
          type: "number",
          placeholder: "e.g. 3",
        };
      return {
        atomId: "log-simplify",
        prompt: `\\ln ${a * b}-\\ln ${b}=\\ln\\;?`,
        expected: String(a),
        type: "number",
        placeholder: "e.g. 4",
      };
    },
  },
};

export const MICRO_ROUND = 10;

export function makeMicroItem(atomId: MicroId, seed: number): MicroItem {
  return MICRO_ATOMS[atomId].build(makeRng(seed));
}

export function makeMicroRound(
  atomId: MicroId,
  length = MICRO_ROUND,
): MicroItem[] {
  return Array.from({ length }, () => makeMicroItem(atomId, randomSeed()));
}

export function atomName(atomId: MicroId, lang: Lang): string {
  return MICRO_ATOMS[atomId].name[lang];
}
