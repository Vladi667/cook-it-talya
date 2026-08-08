import type { Problem, Rng, Template } from "../types";
import { sample } from "../rng";
import { coef, cross, gcd, paren, signed, signedTerm } from "./util";

type P = [number, number];

/**
 * Built backwards from a lattice circle: pick a centre with integer
 * coordinates and a radius whose square has many lattice points, then choose
 * three of them as the triangle. That makes the circumcentre exact and the
 * perpendicular bisectors integer-coefficient lines.
 */
const RADII = [25, 50, 65, 85, 125, 169];

function latticePoints(r2: number): P[] {
  const out: P[] = [];
  const lim = Math.floor(Math.sqrt(r2));
  for (let i = -lim; i <= lim; i++) {
    const j2 = r2 - i * i;
    const j = Math.round(Math.sqrt(j2));
    if (j * j === j2) {
      out.push([i, j]);
      if (j !== 0) out.push([i, -j]);
    }
  }
  return out;
}

/** ax + by = c, reduced, with the leading coefficient positive. */
function reduceLine(a: number, b: number, c: number): [number, number, number] {
  const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1;
  let [x, y, z] = [a / g, b / g, c / g];
  const lead = x !== 0 ? x : y;
  if (lead < 0) [x, y, z] = [-x, -y, -z];
  return [x, y, z];
}

function lineLatex(a: number, b: number, c: number): string {
  const head = a !== 0 ? coef(a, "x") : coef(b, "y");
  const tail = a !== 0 ? signedTerm(b, "y") : "";
  return `${head}${tail} = ${c}`;
}

/** Perpendicular bisector of PQ: 2(Q-P)·X = |Q|^2 - |P|^2. */
function perpBisector(p: P, q: P): [number, number, number] {
  return reduceLine(
    2 * (q[0] - p[0]),
    2 * (q[1] - p[1]),
    q[0] ** 2 + q[1] ** 2 - (p[0] ** 2 + p[1] ** 2),
  );
}

interface Config {
  O: P;
  r2: number;
  A: P;
  B: P;
  C: P;
  l1: [number, number, number];
  l2: [number, number, number];
}

function draw(rng: Rng): Config | null {
  const r2 = rng.pick(RADII);
  const O: P = [rng.int(-4, 4), rng.int(-4, 4)];
  const offsets = latticePoints(r2);
  if (offsets.length < 6) return null;

  const chosen = rng.shuffle(offsets).slice(0, 3);
  const [A, B, C] = chosen.map((o) => [O[0] + o[0], O[1] + o[1]] as P);

  if (cross(A, B, C) === 0) return null;
  if ([...A, ...B, ...C].some((v) => Math.abs(v) > 18)) return null;

  const l1 = perpBisector(A, B);
  const l2 = perpBisector(A, C);
  // The two bisectors must be genuinely different lines.
  if (l1[0] === l2[0] && l1[1] === l2[1] && l1[2] === l2[2]) return null;
  if ([...l1, ...l2].some((v) => Math.abs(v) > 60)) return null;

  return { O, r2, A, B, C, l1, l2 };
}

/** Reflection of P in the line ax + by = c. */
function reflect(p: P, [a, b, c]: [number, number, number]): P {
  const d = (a * p[0] + b * p[1] - c) / (a * a + b * b);
  return [p[0] - 2 * a * d, p[1] - 2 * b * d];
}

export const triangleFromLines: Template = {
  id: "triangle-from-lines",
  topic: "analytic-geometry",
  name: {
    en: "Triangle from its perpendicular bisectors",
    he: "משולש מתוך אנכים אמצעיים",
  },
  blurb: {
    en: "Reflection in a line, intersecting bisectors, and the circumscribed circle.",
    he: "שיקוף ביחס לישר, חיתוך אנכים אמצעיים, ומעגל חוסם.",
  },

  generate(rng: Rng): Problem {
    const { O, r2, A, B, C, l1, l2 } = sample(rng, () => draw(rng));

    // Sanity: the construction guarantees these, and the tests re-check them.
    const Br = reflect(A, l1);
    const Cr = reflect(A, l2);

    const circlePlain = `(x-${paren(O[0])})^2+(y-${paren(O[1])})^2=${r2}`;
    const circleLatex = `\\left(x ${signed(-O[0])}\\right)^2 + \\left(y ${signed(-O[1])}\\right)^2 = ${r2}`;

    const l1Tex = lineLatex(...l1);
    const l2Tex = lineLatex(...l2);
    const mid = (p: P, q: P) =>
      `\\left(${(p[0] + q[0]) / 2},\\ ${(p[1] + q[1]) / 2}\\right)`;

    const rLatex =
      Number.isInteger(Math.sqrt(r2)) ? String(Math.sqrt(r2)) : `\\sqrt{${r2}}`;

    return {
      id: `triangle-from-lines-${rng.int(0, 1e9)}`,
      templateId: "triangle-from-lines",
      seed: 0,
      difficulty: 3,
      title: {
        en: "Reconstruct the triangle",
        he: "שחזור המשולש",
      },
      statement: {
        en:
          `In triangle $ABC$ the vertex is $A(${A[0]},\\ ${A[1]})$. ` +
          `The perpendicular bisector of $AB$ is $$\\ell_1:\\ ${l1Tex}$$ and the perpendicular bisector of $AC$ is $$\\ell_2:\\ ${l2Tex}$$ ` +
          `Find the coordinates of $B$ and $C$, and the equation of the circle circumscribing the triangle.`,
        he:
          `במשולש $ABC$ נתון הקודקוד $A(${A[0]},\\ ${A[1]})$. ` +
          `האנך האמצעי לצלע $AB$ הוא $$\\ell_1:\\ ${l1Tex}$$ והאנך האמצעי לצלע $AC$ הוא $$\\ell_2:\\ ${l2Tex}$$ ` +
          `מצאו את שיעורי הקודקודים $B$ ו-$C$, ואת משוואת המעגל החוסם את המשולש.`,
      },
      params: { A, B, C, O, r2, l1, l2 },
      fields: [
        {
          id: "B",
          type: "point",
          label: "B =",
          placeholder: "(x, y)",
          expected: `(${B[0]},${B[1]})`,
          prompt: { en: "Vertex $B$", he: "הקודקוד $B$" },
          pitfalls: [
            {
              value: `(${(A[0] + B[0]) / 2},${(A[1] + B[1]) / 2})`,
              why: {
                en: "That is the foot of the perpendicular on $\\ell_1$ — the **midpoint** of $AB$. You are halfway there: continue the same distance again past the foot to land on $B$.",
                he: "זו רגל האנך על $\\ell_1$ — **אמצע** $AB$. הגעתם לחצי הדרך: המשיכו את אותו מרחק שוב מעבר לרגל כדי להגיע ל-$B$.",
              },
            },
          ],
        },
        {
          id: "C",
          type: "point",
          label: "C =",
          placeholder: "(x, y)",
          expected: `(${C[0]},${C[1]})`,
          prompt: { en: "Vertex $C$", he: "הקודקוד $C$" },
          pitfalls: [
            {
              value: `(${(A[0] + C[0]) / 2},${(A[1] + C[1]) / 2})`,
              why: {
                en: "That is the **midpoint** of $AC$, i.e. the foot of the perpendicular on $\\ell_2$. Reflecting means going the same distance again beyond the foot.",
                he: "זהו **אמצע** $AC$, כלומר רגל האנך על $\\ell_2$. שיקוף פירושו להמשיך את אותו מרחק שוב מעבר לרגל.",
              },
            },
            {
              value: `(${B[0]},${B[1]})`,
              why: {
                en: "That is $B$ — you reflected across $\\ell_1$ twice. $C$ comes from reflecting $A$ across the **second** bisector $\\ell_2$.",
                he: "זהו $B$ — שיקפתם פעמיים ביחס ל-$\\ell_1$. הנקודה $C$ מתקבלת משיקוף $A$ ביחס לאנך ה**שני**, $\\ell_2$.",
              },
            },
          ],
        },
        {
          id: "circle",
          type: "equation",
          placeholder: "(x-a)^2+(y-b)^2=r^2",
          expected: circlePlain,
          prompt: {
            en: "Equation of the circumscribed circle",
            he: "משוואת המעגל החוסם",
          },
          pitfalls: [
            {
              value: `(x-${paren(O[0])})^2+(y-${paren(O[1])})^2=sqrt(${r2})`,
              why: {
                en: `The right-hand side is $R^2$, not $R$. You found $R=${rLatex}$ correctly, so square it: the equation ends in $=${r2}$.`,
                he: `האגף הימני הוא $R^2$ ולא $R$. מצאתם נכון $R=${rLatex}$, ולכן העלו בריבוע: המשוואה מסתיימת ב-$=${r2}$.`,
              },
            },
            ...(O[0] === 0 && O[1] === 0
              ? []
              : [
                  {
                    value: `(x+${paren(O[0])})^2+(y+${paren(O[1])})^2=${r2}`,
                    why: {
                      en: `Signs are inverted. In $\\left(x-a\\right)^2+\\left(y-b\\right)^2=R^2$ the centre is $(a,b)$, so a centre of $(${O[0]},\\ ${O[1]})$ gives $${circleLatex}$.`,
                      he: `הסימנים הפוכים. בביטוי $\\left(x-a\\right)^2+\\left(y-b\\right)^2=R^2$ המרכז הוא $(a,b)$, ולכן מרכז $(${O[0]},\\ ${O[1]})$ נותן $${circleLatex}$.`,
                    },
                  },
                ]),
          ],
        },
      ],
      hints: [
        {
          en: "A perpendicular bisector of $AB$ is exactly the set of points equidistant from $A$ and $B$ — so $B$ is the mirror image of $A$ in $\\ell_1$.",
          he: "האנך האמצעי ל-$AB$ הוא בדיוק אוסף הנקודות במרחק שווה מ-$A$ ומ-$B$ — ולכן $B$ הוא שיקוף של $A$ ביחס ל-$\\ell_1$.",
        },
        {
          en: "To reflect a point in a line: drop a perpendicular from the point to the line, find the foot, and go the same distance again. The centre of the circumscribed circle is where the two bisectors meet.",
          he: "כדי לשקף נקודה ביחס לישר: הורידו אנך מהנקודה לישר, מצאו את הרגל, והמשיכו את אותו מרחק. מרכז המעגל החוסם הוא נקודת המפגש של שני האנכים.",
        },
        {
          en: `The perpendicular from $A$ to $\\ell_1$ has direction $(${l1[0]},\\ ${l1[1]})$. Its foot is the midpoint of $AB$, which gives $B$ directly. Then solve $\\ell_1$ and $\\ell_2$ together for the centre.`,
          he: `לאנך מ-$A$ ל-$\\ell_1$ יש כיוון $(${l1[0]},\\ ${l1[1]})$. הרגל שלו היא אמצע $AB$, ומכאן מתקבל $B$ ישירות. לאחר מכן פתרו יחד את $\\ell_1$ ו-$\\ell_2$ כדי למצוא את המרכז.`,
        },
      ],
      steps: [
        {
          title: { en: "Reflect $A$ in $\\ell_1$ to get $B$", he: "שיקוף $A$ ביחס ל-$\\ell_1$ לקבלת $B$" },
          body: {
            en: `$\\ell_1$ is the perpendicular bisector of $AB$, so $B$ is the reflection of $A$ in it. The normal direction of $\\ell_1$ is $(${l1[0]},\\ ${l1[1]})$; reflecting $A(${A[0]},\\ ${A[1]})$ gives $$B(${Br[0]},\\ ${Br[1]}).$$ Check: the midpoint of $AB$ is ${mid(A, B)}, and it satisfies $\\ell_1$.`,
            he: `$\\ell_1$ הוא האנך האמצעי ל-$AB$, ולכן $B$ הוא השיקוף של $A$ ביחס אליו. כיוון הנורמל של $\\ell_1$ הוא $(${l1[0]},\\ ${l1[1]})$; שיקוף $A(${A[0]},\\ ${A[1]})$ נותן $$B(${Br[0]},\\ ${Br[1]}).$$ בדיקה: אמצע $AB$ הוא ${mid(A, B)}, והוא מקיים את $\\ell_1$.`,
          },
        },
        {
          title: { en: "Reflect $A$ in $\\ell_2$ to get $C$", he: "שיקוף $A$ ביחס ל-$\\ell_2$ לקבלת $C$" },
          body: {
            en: `The same reflection in $\\ell_2$, whose normal is $(${l2[0]},\\ ${l2[1]})$, gives $$C(${Cr[0]},\\ ${Cr[1]}),$$ with midpoint of $AC$ at ${mid(A, C)}.`,
            he: `אותו שיקוף ביחס ל-$\\ell_2$, שהנורמל שלו הוא $(${l2[0]},\\ ${l2[1]})$, נותן $$C(${Cr[0]},\\ ${Cr[1]}),$$ כאשר אמצע $AC$ הוא ${mid(A, C)}.`,
          },
        },
        {
          title: { en: "Circumcentre", he: "מרכז המעגל החוסם" },
          body: {
            en: `The circumcentre is equidistant from all three vertices, so it lies on both bisectors. Solving $$\\begin{cases}${l1Tex}\\\\ ${l2Tex}\\end{cases}$$ gives $$O(${O[0]},\\ ${O[1]}).$$`,
            he: `מרכז המעגל החוסם נמצא במרחק שווה משלושת הקודקודים, ולכן הוא על שני האנכים. פתרון המערכת $$\\begin{cases}${l1Tex}\\\\ ${l2Tex}\\end{cases}$$ נותן $$O(${O[0]},\\ ${O[1]}).$$`,
          },
        },
        {
          title: { en: "Radius and equation", he: "רדיוס ומשוואה" },
          body: {
            en: `$R = OA = \\sqrt{(${A[0]}-${paren(O[0])})^2+(${A[1]}-${paren(O[1])})^2} = ${rLatex}$, and the circle is $$${circleLatex}.$$ It passes through $B$ and $C$ as well, since $OB=OC=${rLatex}$.`,
            he: `$R = OA = \\sqrt{(${A[0]}-${paren(O[0])})^2+(${A[1]}-${paren(O[1])})^2} = ${rLatex}$, ומשוואת המעגל היא $$${circleLatex}.$$ המעגל עובר גם דרך $B$ ו-$C$, שכן $OB=OC=${rLatex}$.`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "A is on the circle",
          expr: `(${A[0]}-${paren(O[0])})^2+(${A[1]}-${paren(O[1])})^2`,
          expected: String(r2),
        },
        {
          kind: "numeric",
          label: "B is on the circle",
          expr: `(${B[0]}-${paren(O[0])})^2+(${B[1]}-${paren(O[1])})^2`,
          expected: String(r2),
        },
        {
          kind: "numeric",
          label: "C is on the circle",
          expr: `(${C[0]}-${paren(O[0])})^2+(${C[1]}-${paren(O[1])})^2`,
          expected: String(r2),
        },
        {
          kind: "numeric",
          label: "midpoint of AB lies on l1",
          expr: `${l1[0]}*(${(A[0] + B[0]) / 2})+${l1[1]}*(${(A[1] + B[1]) / 2})`,
          expected: String(l1[2]),
        },
        {
          kind: "numeric",
          label: "AB is perpendicular to l1",
          expr: `(${B[0]}-${paren(A[0])})*${l1[1]}-(${B[1]}-${paren(A[1])})*${l1[0]}`,
          expected: "0",
        },
        {
          kind: "numeric",
          label: "midpoint of AC lies on l2",
          expr: `${l2[0]}*(${(A[0] + C[0]) / 2})+${l2[1]}*(${(A[1] + C[1]) / 2})`,
          expected: String(l2[2]),
        },
        {
          kind: "numeric",
          label: "AC is perpendicular to l2",
          expr: `(${C[0]}-${paren(A[0])})*${l2[1]}-(${C[1]}-${paren(A[1])})*${l2[0]}`,
          expected: "0",
        },
        {
          kind: "numeric",
          label: "reflecting A in l1 reproduces B",
          expr: `(${Br[0]}-${paren(B[0])})^2+(${Br[1]}-${paren(B[1])})^2`,
          expected: "0",
        },
        {
          kind: "numeric",
          label: "reflecting A in l2 reproduces C",
          expr: `(${Cr[0]}-${paren(C[0])})^2+(${Cr[1]}-${paren(C[1])})^2`,
          expected: "0",
        },
      ],
    };
  },
};
