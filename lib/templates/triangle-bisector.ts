import type { Problem, Rng, Template } from "../types";
import { sample } from "../rng";
import {
  cross,
  dist2,
  fracLatex,
  fracPlain,
  paren,
  radicalLatex,
  radicalPlain,
} from "./util";

type P = [number, number];

/**
 * Direction vectors with integer length, so |AB| and |AC| come out whole and
 * the angle-bisector length stays a clean sqrt(rational).
 */
const DIRS: { d: P; len: number; scales: number[] }[] = [
  { d: [3, 4], len: 5, scales: [1, 2, 3] },
  { d: [4, 3], len: 5, scales: [1, 2, 3] },
  { d: [5, 12], len: 13, scales: [1] },
  { d: [12, 5], len: 13, scales: [1] },
  { d: [8, 15], len: 17, scales: [1] },
  { d: [15, 8], len: 17, scales: [1] },
  { d: [1, 0], len: 1, scales: [4, 5, 6, 8, 10, 12] },
  { d: [0, 1], len: 1, scales: [4, 5, 6, 8, 10, 12] },
];

interface Config {
  A: P;
  B: P;
  C: P;
  b: number; // |AC|
  c: number; // |AB|
  a2: number; // |BC|^2
  D: P;
  Dn: [number, number]; // numerators of D over (b + c)
}

function draw(rng: Rng): Config | null {
  const A: P = [rng.int(-6, 6), rng.int(-6, 6)];

  const pickLeg = (): { P: P; len: number } => {
    const dir = rng.pick(DIRS);
    const s = rng.pick(dir.scales);
    return {
      P: [dir.d[0] * s * rng.sign(), dir.d[1] * s * rng.sign()],
      len: dir.len * s,
    };
  };

  const legB = pickLeg();
  const legC = pickLeg();
  const B: P = [A[0] + legB.P[0], A[1] + legB.P[1]];
  const C: P = [A[0] + legC.P[0], A[1] + legC.P[1]];
  const c = legB.len;
  const b = legC.len;

  if (cross(A, B, C) === 0) return null; // degenerate triangle
  if (b === c) return null; // isoceles: the bisector is also the median
  if (b < 4 || c < 4 || b > 20 || c > 20) return null;
  if ([...B, ...C].some((v) => Math.abs(v) > 16)) return null;

  // D = (b*B + c*C) / (b + c)  — from BD/DC = AB/AC = c/b
  const s = b + c;
  const Dn: [number, number] = [b * B[0] + c * C[0], b * B[1] + c * C[1]];
  const D: P = [Dn[0] / s, Dn[1] / s];

  // Keep the printed fractions readable.
  const denom = (n: number) => {
    let g = Math.abs(n);
    let h = s;
    while (h) [g, h] = [h, g % h];
    return s / (g || 1);
  };
  if (denom(Dn[0]) > 12 || denom(Dn[1]) > 12) return null;

  const a2 = dist2(B, C);
  return { A, B, C, b, c, a2, D, Dn };
}

export const triangleBisector: Template = {
  id: "triangle-bisector",
  topic: "analytic-geometry",
  name: {
    en: "Angle bisector in a triangle",
    he: "חוצה זווית במשולש",
  },
  blurb: {
    en: "Distance formula, the angle bisector theorem, and section points.",
    he: "נוסחת המרחק, משפט חוצה הזווית ונקודת חלוקה.",
  },

  generate(rng: Rng): Problem {
    const { A, B, C, b, c, a2, D, Dn } = sample(rng, () => draw(rng));
    const s = b + c;

    // AD^2 = bc[1 - (a/(b+c))^2]  =>  AD = sqrt(bc((b+c)^2 - a^2)) / (b+c)
    const radicand = b * c * (s * s - a2);
    const adPlain = radicalPlain(radicand, s);
    const adLatex = radicalLatex(radicand, s);

    const Dx = fracPlain(Dn[0], s);
    const Dy = fracPlain(Dn[1], s);
    const DxL = fracLatex(Dn[0], s);
    const DyL = fracLatex(Dn[1], s);

    const P = (name: string, p: [number, number]) =>
      `${name}(${p[0]},\\ ${p[1]})`;
    const coords = `${P("A", A)},\\quad ${P("B", B)},\\quad ${P("C", C)}`;

    // Independent checks, evaluated numerically by the test suite.
    const dxE = `(${Dx})`;
    const dyE = `(${Dy})`;
    const verification: Problem["verification"] = [
      {
        kind: "numeric",
        label: "D lies on line BC",
        expr: `(${B[0]}-${dxE})*(${C[1]}-${dyE})-(${B[1]}-${dyE})*(${C[0]}-${dxE})`,
        expected: "0",
      },
      {
        kind: "numeric",
        label: "AD bisects the angle at A",
        expr:
          `((${B[0]}-${A[0]})*(${dxE}-${A[0]})+(${B[1]}-${A[1]})*(${dyE}-${A[1]}))/${c}` +
          ` - ((${C[0]}-${A[0]})*(${dxE}-${A[0]})+(${C[1]}-${A[1]})*(${dyE}-${A[1]}))/${b}`,
        expected: "0",
      },
      {
        kind: "numeric",
        label: "AD equals the distance from A to D",
        expr: `sqrt((${dxE}-${A[0]})^2+(${dyE}-${A[1]})^2)`,
        expected: adPlain,
      },
      {
        kind: "numeric",
        label: "D lies between B and C",
        expr: `(${dxE}-${B[0]})*(${C[0]}-${dxE})+(${dyE}-${B[1]})*(${C[1]}-${dyE})`,
        expected: "positive",
      },
    ];

    return {
      id: `triangle-bisector-${rng.int(0, 1e9)}`,
      templateId: "triangle-bisector",
      seed: 0,
      difficulty: 2,
      title: {
        en: "Angle bisector in a triangle",
        he: "חוצה זווית במשולש",
      },
      statement: {
        en:
          `In triangle $ABC$ the vertices are $$${coords}$$ ` +
          `$AD$ is the bisector of $\\angle A$, where $D$ lies on side $BC$. ` +
          `Find the coordinates of $D$ and the length of $AD$.`,
        he:
          `במשולש $ABC$ נתונים הקודקודים $$${coords}$$ ` +
          `$AD$ הוא חוצה הזווית $\\angle A$, כאשר $D$ נמצאת על הצלע $BC$. ` +
          `מצאו את שיעורי הנקודה $D$ ואת אורך הקטע $AD$.`,
      },
      params: { A, B, C, b, c, a2 },
      fields: [
        {
          id: "D",
          type: "point",
          label: "D =",
          placeholder: "(x, y)",
          expected: `(${Dx},${Dy})`,
          prompt: {
            en: "Coordinates of $D$",
            he: "שיעורי הנקודה $D$",
          },
          pitfalls: [
            {
              value: `(${fracPlain(B[0] + C[0], 2)},${fracPlain(B[1] + C[1], 2)})`,
              why: {
                en: `That is the midpoint of $BC$ — the foot of the **median**, not the bisector. The bisector only hits the midpoint when $AB=AC$, and here $AB=${c}$ while $AC=${b}$.`,
                he: `זו נקודת האמצע של $BC$ — רגל ה**תיכון**, לא חוצה הזווית. חוצה הזווית פוגע באמצע רק כאשר $AB=AC$, וכאן $AB=${c}$ ואילו $AC=${b}$.`,
              },
            },
            {
              value: `(${fracPlain(c * B[0] + b * C[0], s)},${fracPlain(c * B[1] + b * C[1], s)})`,
              why: {
                en: `The two weights are swapped. From $BD:DC=AB:AC=${c}:${b}$, the point closer to $B$ carries the weight of the **opposite** side, so $D=\\frac{${b}\\cdot B+${c}\\cdot C}{${s}}$ — the $AC$ length multiplies $B$.`,
                he: `שני המשקלים הוחלפו. מתוך $BD:DC=AB:AC=${c}:${b}$, הנקודה הקרובה ל-$B$ נושאת את משקל הצלע **הנגדית**, ולכן $D=\\frac{${b}\\cdot B+${c}\\cdot C}{${s}}$ — אורך $AC$ מוכפל ב-$B$.`,
              },
            },
          ],
        },
        {
          id: "AD",
          type: "expression",
          label: "AD =",
          placeholder: "e.g. 3sqrt(5)/2",
          expected: adPlain,
          prompt: { en: "Length $AD$", he: "אורך $AD$" },
          pitfalls: [
            {
              value: `sqrt((${fracPlain(B[0] + C[0], 2)}-${paren(A[0])})^2+(${fracPlain(B[1] + C[1], 2)}-${paren(A[1])})^2)`,
              why: {
                en: `You measured to the midpoint of $BC$, so this is the length of the **median**, not the bisector. Locate $D$ by the ratio $${c}:${b}$ first, then apply the distance formula.`,
                he: `מדדתם עד אמצע $BC$, ולכן זהו אורך ה**תיכון** ולא חוצה הזווית. מצאו קודם את $D$ לפי היחס $${c}:${b}$, ורק אז הפעילו את נוסחת המרחק.`,
              },
            },
            {
              value: String(radicand) + `/${s * s}`,
              why: {
                en: "That is $AD^2$, not $AD$ — you stopped one step early. Take the square root.",
                he: "זהו $AD^2$ ולא $AD$ — עצרתם שלב אחד מוקדם מדי. הוציאו שורש.",
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "The bisector from $A$ hits $BC$ at the point that splits $BC$ in the ratio of the two sides next to $A$ — not at the midpoint.",
          he: "חוצה הזווית מ-$A$ פוגש את $BC$ בנקודה המחלקת את $BC$ ביחס הצלעות הסמוכות ל-$A$ — ולא באמצע.",
        },
        {
          en: "Angle bisector theorem: $\\frac{BD}{DC}=\\frac{AB}{AC}$. A point dividing $BC$ in the ratio $m:n$ from $B$ is $\\frac{nB+mC}{m+n}$.",
          he: "משפט חוצה הזווית: $\\frac{BD}{DC}=\\frac{AB}{AC}$. נקודה המחלקת את $BC$ ביחס $m:n$ מ-$B$ היא $\\frac{nB+mC}{m+n}$.",
        },
        {
          en: `Start with the distance formula: $AB=${c}$ and $AC=${b}$, so $BD:DC=${c}:${b}$ and $D=\\frac{${b}\\cdot B+${c}\\cdot C}{${s}}$.`,
          he: `התחילו מנוסחת המרחק: $AB=${c}$ ו-$AC=${b}$, ולכן $BD:DC=${c}:${b}$ ומתקיים $D=\\frac{${b}\\cdot B+${c}\\cdot C}{${s}}$.`,
        },
      ],
      steps: [
        {
          title: { en: "Side lengths", he: "אורכי הצלעות" },
          body: {
            en: `Distance formula from $A$: $$AB=\\sqrt{(${B[0]}-${paren(A[0])})^2+(${B[1]}-${paren(A[1])})^2}=${c},\\qquad AC=\\sqrt{(${C[0]}-${paren(A[0])})^2+(${C[1]}-${paren(A[1])})^2}=${b}.$$`,
            he: `נוסחת המרחק מ-$A$: $$AB=\\sqrt{(${B[0]}-${paren(A[0])})^2+(${B[1]}-${paren(A[1])})^2}=${c},\\qquad AC=\\sqrt{(${C[0]}-${paren(A[0])})^2+(${C[1]}-${paren(A[1])})^2}=${b}.$$`,
          },
        },
        {
          title: { en: "Locate the foot $D$", he: "מציאת הנקודה $D$" },
          body: {
            en: `By the angle bisector theorem $BD:DC=AB:AC=${c}:${b}$, so $D$ is the weighted average $$D=\\frac{${b}\\cdot B+${c}\\cdot C}{${b}+${c}}=\\left(${DxL},\\ ${DyL}\\right).$$`,
            he: `לפי משפט חוצה הזווית $BD:DC=AB:AC=${c}:${b}$, ולכן $D$ הוא הממוצע המשוקלל $$D=\\frac{${b}\\cdot B+${c}\\cdot C}{${b}+${c}}=\\left(${DxL},\\ ${DyL}\\right).$$`,
          },
        },
        {
          title: { en: "Length of the bisector", he: "אורך חוצה הזווית" },
          body: {
            en: `Distance formula again, from $A$ to $D$: $$AD=\\sqrt{\\left(${DxL}-(${A[0]})\\right)^2+\\left(${DyL}-(${A[1]})\\right)^2}=${adLatex}.$$ (Equivalently $AD^2=AB\\cdot AC\\left[1-\\left(\\frac{BC}{AB+AC}\\right)^2\\right]$.)`,
            he: `שוב נוסחת המרחק, מ-$A$ ל-$D$: $$AD=\\sqrt{\\left(${DxL}-(${A[0]})\\right)^2+\\left(${DyL}-(${A[1]})\\right)^2}=${adLatex}.$$ (באופן שקול $AD^2=AB\\cdot AC\\left[1-\\left(\\frac{BC}{AB+AC}\\right)^2\\right]$.)`,
          },
        },
      ],
      verification,
    };
  },
};
