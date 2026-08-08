import type { Problem, Rng, Template } from "../types";
import { sample } from "../rng";
import { fracLatex, signed, signedTerm } from "./util";

/**
 * ∫_c^d (x² + m x + b)/(x + k) dx = V, with V given. Solve for b.
 *
 * Long division gives  x + (m-k) + R/(x+k)  with  R = b - k(m-k), so
 * V = (d²-c²)/2 + (m-k)(d-c) + R·ln((d+k)/(c+k)).
 * Bounds are sampled so that (d+k)/(c+k) is a whole number.
 */
interface Config {
  k: number;
  m: number;
  b: number;
  c: number;
  d: number;
  q: number; // (d+k)/(c+k)
  R: number; // remainder of the division, = b - k(m-k)
  ratNum: number; // twice the rational part of V
}

function draw(rng: Rng): Config | null {
  const k = rng.int(1, 3);
  const c = rng.int(0, 2);
  const q = rng.int(2, 4);
  const d = q * (c + k) - k;
  if (d <= c || d > 10) return null;

  const m = rng.int(-3, 5);
  const b = rng.nonZeroInt(-9, 12);
  const R = b - k * (m - k);
  if (R === 0 || Math.abs(R) > 12) return null;

  const ratNum = d * d - c * c + 2 * (m - k) * (d - c);
  return { k, m, b, c, d, q, R, ratNum };
}

function valueLatex(ratNum: number, R: number, q: number): string {
  const lnPart = `${Math.abs(R) === 1 ? "" : Math.abs(R)}\\ln ${q}`;
  if (ratNum === 0) return `${R < 0 ? "-" : ""}${lnPart}`;
  return `${fracLatex(ratNum, 2)} ${R < 0 ? "-" : "+"} ${lnPart}`;
}

export const reverseIntegral: Template = {
  id: "reverse-integral",
  topic: "calculus",
  name: {
    en: "Recovering a constant from a definite integral",
    he: "מציאת קבוע מתוך אינטגרל מסוים",
  },
  blurb: {
    en: "Polynomial long division, ln antiderivatives, then solve for the unknown.",
    he: "חילוק פולינומים, פונקציה קדומה עם ln, ופתרון עבור הנעלם.",
  },

  generate(rng: Rng): Problem {
    const { k, m, b, c, d, q, R, ratNum } = sample(rng, () => draw(rng));

    const numerator = `x^2${signedTerm(m, "x")} + b`;
    const denominator = `x + ${k}`;
    const integrand = `\\frac{${numerator}}{${denominator}}`;
    const quotient = m - k === 0 ? "x" : `x ${signed(m - k)}`;
    const kk = k * (m - k);
    const remainder = kk === 0 ? "b" : `b ${signed(-kk)}`;
    const V = valueLatex(ratNum, R, q);

    // Plain (nerdamer) form of the integrand with b substituted, for the
    // numeric integration check.
    const integrandPlain = `(x^2+${m}*x+${b})/(x+${k})`;
    const valuePlain = `${ratNum}/2+${R}*log(${q})`;

    return {
      id: `reverse-integral-${rng.int(0, 1e9)}`,
      templateId: "reverse-integral",
      seed: 0,
      difficulty: 1,
      title: {
        en: "Find the constant in the integral",
        he: "מציאת הקבוע באינטגרל",
      },
      statement: {
        en:
          `The constant $b$ satisfies $$\\int_{${c}}^{${d}} ${integrand}\\,dx = ${V}.$$ ` +
          `Find the value of $b$.`,
        he:
          `הקבוע $b$ מקיים $$\\int_{${c}}^{${d}} ${integrand}\\,dx = ${V}.$$ ` +
          `מצאו את ערכו של $b$.`,
      },
      params: { k, m, b, c, d, q, R },
      fields: [
        {
          id: "b",
          type: "number",
          label: "b =",
          placeholder: "e.g. 5",
          expected: String(b),
          prompt: { en: "The constant $b$", he: "הקבוע $b$" },
          pitfalls:
            kk === 0
              ? []
              : [
                  {
                    value: String(R),
                    why: {
                      en: `You solved for the **remainder** of the division, not for $b$. The $\\ln$ coefficient is $b ${signed(-kk)} = ${R}$, so $b = ${R} ${signed(kk)} = ${b}$.`,
                      he: `פתרתם עבור **השארית** של החילוק ולא עבור $b$. מקדם ה-$\\ln$ הוא $b ${signed(-kk)} = ${R}$, ולכן $b = ${R} ${signed(kk)} = ${b}$.`,
                    },
                  },
                  {
                    value: String(b - 2 * kk),
                    why: {
                      en: `Sign slip on the division remainder: it is $b ${signed(-kk)}$, so recovering $b$ means **adding** $${kk}$ back, not subtracting it.`,
                      he: `טעות סימן בשארית החילוק: השארית היא $b ${signed(-kk)}$, ולכן כדי לשחזר את $b$ יש **להוסיף** $${kk}$ ולא לחסר.`,
                    },
                  },
                ],
        },
      ],
      hints: [
        {
          en: "The degree of the numerator is higher than the degree of the denominator — you cannot integrate it as it stands.",
          he: "דרגת המונה גבוהה מדרגת המכנה — אי אפשר לבצע אינטגרציה כמו שהוא.",
        },
        {
          en: "Divide first. After the division you get a polynomial plus a constant over $x+" + k + "$, and only that last piece produces a $\\ln$ term — which is where $b$ survives.",
          he: "בצעו קודם חילוק. לאחר החילוק מתקבל פולינום ועוד קבוע חלקי $x+" + k + "$, ורק החלק האחרון נותן איבר $\\ln$ — ושם $b$ נשמר.",
        },
        {
          en: `Long division gives $$${integrand.replace("b", "b")} = ${quotient} + \\frac{${remainder}}{x+${k}}.$$ Now integrate term by term.`,
          he: `חילוק ארוך נותן $$${integrand} = ${quotient} + \\frac{${remainder}}{x+${k}}.$$ כעת בצעו אינטגרציה איבר-איבר.`,
        },
      ],
      steps: [
        {
          title: { en: "Polynomial long division", he: "חילוק פולינומים" },
          body: {
            en: `The numerator has the higher degree, so divide: $$${integrand} = ${quotient} + \\frac{${remainder}}{x+${k}}.$$`,
            he: `דרגת המונה גבוהה יותר, ולכן מחלקים: $$${integrand} = ${quotient} + \\frac{${remainder}}{x+${k}}.$$`,
          },
        },
        {
          title: { en: "Antiderivative", he: "פונקציה קדומה" },
          body: {
            en: `$$F(x)=\\frac{x^2}{2}${signedTerm(m - k, "x")} + \\left(${remainder}\\right)\\ln(x+${k}).$$ The logarithm is legitimate here because $x+${k}>0$ on $[${c},${d}]$.`,
            he: `$$F(x)=\\frac{x^2}{2}${signedTerm(m - k, "x")} + \\left(${remainder}\\right)\\ln(x+${k}).$$ הלוגריתם מוגדר כי $x+${k}>0$ בקטע $[${c},${d}]$.`,
          },
        },
        {
          title: { en: "Evaluate the bounds", he: "הצבת הגבולות" },
          body: {
            en: `$$F(${d})-F(${c}) = ${fracLatex(ratNum, 2)} + \\left(${remainder}\\right)\\ln\\frac{${d + k}}{${c + k}} = ${fracLatex(ratNum, 2)} + \\left(${remainder}\\right)\\ln ${q}.$$`,
            he: `$$F(${d})-F(${c}) = ${fracLatex(ratNum, 2)} + \\left(${remainder}\\right)\\ln\\frac{${d + k}}{${c + k}} = ${fracLatex(ratNum, 2)} + \\left(${remainder}\\right)\\ln ${q}.$$`,
          },
        },
        {
          title: { en: "Solve for $b$", he: "פתרון עבור $b$" },
          body: {
            en: `Set that equal to $${V}$. The rational parts already agree, so $${remainder} = ${R}$, giving $$b = ${b}.$$`,
            he: `משווים לביטוי $${V}$. החלקים הרציונליים כבר שווים, ולכן $${remainder} = ${R}$, ומכאן $$b = ${b}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "integral",
          label: "the integral with the solved b hits the given value",
          terms: [
            { expr: integrandPlain, variable: "x", from: String(c), to: String(d) },
          ],
          expected: valuePlain,
        },
        {
          kind: "numeric",
          label: "remainder is consistent with the division",
          expr: `${b}-${k}*(${m}-${k})`,
          expected: String(R),
        },
      ],
    };
  },
};
