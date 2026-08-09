import type { Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { coef, paren, signed, signedTerm } from "./util";

type P = [number, number];

/**
 * Circle given in general form; find centre and radius by completing the
 * square, the tangent at a point on it, and the tangent length from an
 * external point.
 *
 * Built backwards so every number is whole: the radius is a leg of a
 * Pythagorean triple, the external point sits at the hypotenuse distance, and
 * the point of tangency is a lattice point on the circle.
 */
const RADII = [5, 10, 13, 15, 20, 25];

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

interface Config {
  O: P;
  R: number;
  A: P; // point of tangency, on the circle
  Pt: P; // external point
  tangentLength: number;
}

function draw(rng: Rng): Config | null {
  const R = rng.pick(RADII);
  const O: P = [rng.int(-5, 5), rng.int(-5, 5)];

  const onCircle = latticePoints(R * R);
  if (onCircle.length < 8) return null;
  const off = rng.pick(onCircle);
  const A: P = [O[0] + off[0], O[1] + off[1]];

  // Need s with R^2 + s^2 a perfect square, and lattice points at that radius.
  const options: { s: number; d2: number }[] = [];
  for (let s = 2; s <= 40; s++) {
    const d2 = R * R + s * s;
    const d = Math.round(Math.sqrt(d2));
    if (d * d === d2 && latticePoints(d2).length >= 4) options.push({ s, d2 });
  }
  if (options.length === 0) return null;
  const { s, d2 } = rng.pick(options);

  const pOff = rng.pick(latticePoints(d2));
  const Pt: P = [O[0] + pOff[0], O[1] + pOff[1]];

  if ([...A, ...Pt].some((v) => Math.abs(v) > 34)) return null;
  // The tangency point must not coincide with the foot of OP.
  if (A[0] === Pt[0] && A[1] === Pt[1]) return null;

  return { O, R, A, Pt, tangentLength: s };
}

export const circleTangent: TemplateDef = {
  id: "circle-tangent",
  topic: "analytic-geometry",
  name: {
    en: "Circle: centre, tangent, tangent length",
    he: "מעגל: מרכז, משיק ואורך משיק",
  },
  blurb: {
    en: "Complete the square, then use the radius as the normal to the tangent.",
    he: "השלמה לריבוע, ואז שימוש ברדיוס כנורמל למשיק.",
  },

  generate(rng: Rng): Problem {
    const { O, R, A, Pt, tangentLength } = sample(rng, () => draw(rng));
    const [p, q] = O;
    const R2 = R * R;

    // General form: x^2 + y^2 - 2px - 2qy + (p^2 + q^2 - R^2) = 0
    const D = -2 * p;
    const E = -2 * q;
    const F = p * p + q * q - R2;
    const general = `x^2 + y^2${signedTerm(D, "x")}${signedTerm(E, "y")} ${signed(F)} = 0`;

    // Tangent at A: u(x - p) + v(y - q) = R^2, with (u, v) = A - O
    const u = A[0] - p;
    const v = A[1] - q;
    const rhs = R2 + u * p + v * q;
    const tangentPlain = `${u}*x+${paren(v)}*y=${rhs}`;
    const tangentLatex = `${coef(u, "x")}${signedTerm(v, "y")} = ${rhs}`;

    const PO2 = (Pt[0] - p) ** 2 + (Pt[1] - q) ** 2;

    return {
      id: `circle-tangent-${rng.int(0, 1e9)}`,
      templateId: "circle-tangent",
      seed: 0,
      difficulty: 2,
      title: { en: "Circle and tangent", he: "מעגל ומשיק" },
      statement: {
        en:
          `A circle is given by $$${general}$$ ` +
          `and the point $A(${A[0]},\\ ${A[1]})$ lies on it. ` +
          `Find the centre and the radius of the circle, the equation of the tangent to the circle at $A$, ` +
          `and the length of the tangent segment drawn from the external point $P(${Pt[0]},\\ ${Pt[1]})$.`,
        he:
          `נתון מעגל שמשוואתו $$${general}$$ ` +
          `והנקודה $A(${A[0]},\\ ${A[1]})$ נמצאת עליו. ` +
          `מצאו את מרכז המעגל ואת רדיוסו, את משוואת המשיק למעגל בנקודה $A$, ` +
          `ואת אורך קטע המשיק היוצא מהנקודה החיצונית $P(${Pt[0]},\\ ${Pt[1]})$.`,
      },
      params: { O, R, A, P: Pt, tangentLength },
      fields: [
        {
          id: "centre",
          type: "point",
          label: "O =",
          placeholder: "(x, y)",
          expected: `(${p},${q})`,
          prompt: { en: "Centre of the circle", he: "מרכז המעגל" },
          pitfalls: [
            {
              value: `(${-p},${-q})`,
              id: "circle-centre-signs",
              why: {
                en: `Sign slip. From $x^2 ${signed(D)}x$ the centre coordinate is $-\\frac{${D}}{2} = ${p}$ — you negated it twice.`,
                he: `טעות סימן. מתוך $x^2 ${signed(D)}x$ שיעור המרכז הוא $-\\frac{${D}}{2} = ${p}$ — הפכתם את הסימן פעמיים.`,
              },
            },
          ],
        },
        {
          id: "radius",
          type: "number",
          label: "R =",
          placeholder: "e.g. 5",
          expected: String(R),
          prompt: { en: "Radius", he: "רדיוס" },
          pitfalls: [
            {
              value: String(R2),
              id: "circle-radius-squared",
              why: {
                en: `That is $R^2$. Completing the square leaves $R^2 = ${R2}$ on the right, so the radius itself is $\\sqrt{${R2}} = ${R}$.`,
                he: `זהו $R^2$. השלמה לריבוע משאירה $R^2 = ${R2}$ באגף ימין, ולכן הרדיוס עצמו הוא $\\sqrt{${R2}} = ${R}$.`,
              },
            },
          ],
        },
        {
          id: "tangent",
          type: "equation",
          placeholder: "ax + by = c",
          expected: tangentPlain,
          prompt: { en: "Tangent at $A$", he: "המשיק בנקודה $A$" },
          pitfalls: [
            {
              value: `${v}*x+${paren(-u)}*y=${v * A[0] - u * A[1]}`,
              id: "circle-tangent-parallel",
              why: {
                en: "That line passes through $A$ but is **parallel** to the radius, not perpendicular to it. The radius vector is the tangent's normal — use it as the coefficients, not as the direction.",
                he: "הישר הזה עובר דרך $A$ אך **מקביל** לרדיוס ולא מאונך לו. וקטור הרדיוס הוא הנורמל של המשיק — השתמשו בו כמקדמים, לא ככיוון.",
              },
            },
          ],
        },
        {
          id: "tangentLength",
          type: "number",
          label: "PT =",
          placeholder: "e.g. 12",
          expected: String(tangentLength),
          prompt: {
            en: "Length of the tangent from $P$",
            he: "אורך המשיק מהנקודה $P$",
          },
          pitfalls: [
            {
              value: String(Math.round(Math.sqrt(PO2))),
              id: "circle-length-to-centre",
              why: {
                en: `That is $PO$, the distance to the **centre**. The tangent is a leg of the right triangle $POT$, so $PT=\\sqrt{PO^2-R^2}=\\sqrt{${PO2}-${R2}}=${tangentLength}$.`,
                he: `זהו $PO$, המרחק אל ה**מרכז**. המשיק הוא ניצב במשולש ישר הזווית $POT$, ולכן $PT=\\sqrt{PO^2-R^2}=\\sqrt{${PO2}-${R2}}=${tangentLength}$.`,
              },
            },
            {
              value: String(PO2 - R2),
              id: "circle-length-squared",
              why: {
                en: `That is $PT^2$. One square root short — $PT=${tangentLength}$.`,
                he: `זהו $PT^2$. חסר שורש אחד — $PT=${tangentLength}$.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "The equation is in general form. Group the $x$ terms and the $y$ terms and complete the square on each before anything else.",
          he: "המשוואה נתונה בצורה כללית. קבצו את איברי $x$ ואת איברי $y$ והשלימו כל קבוצה לריבוע לפני כל דבר אחר.",
        },
        {
          en: "A tangent is perpendicular to the radius at the point of contact. So the vector from the centre to $A$ is exactly the normal of the tangent line.",
          he: "המשיק מאונך לרדיוס בנקודת ההשקה. לכן הווקטור מהמרכז אל $A$ הוא בדיוק הנורמל של ישר המשיק.",
        },
        {
          en: `The radius vector is $\\left(${u},\\ ${v}\\right)$, so the tangent is $${coef(u, "x")}${signedTerm(v, "y")} = c$ with $c$ fixed by passing through $A$. For the length, $P$, the centre and the point of contact form a right angle at the contact point.`,
          he: `וקטור הרדיוס הוא $\\left(${u},\\ ${v}\\right)$, ולכן המשיק הוא $${coef(u, "x")}${signedTerm(v, "y")} = c$ כאשר $c$ נקבע מהמעבר דרך $A$. לגבי האורך — $P$, המרכז ונקודת ההשקה יוצרים זווית ישרה בנקודת ההשקה.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Complete the square", he: "השלמה לריבוע" },
          body: {
            en: `Group and complete: $$\\left(x^2${signedTerm(D, "x")}\\right)+\\left(y^2${signedTerm(E, "y")}\\right) = ${-F}$$ $$\\left(x${signed(-p)}\\right)^2+\\left(y${signed(-q)}\\right)^2 = ${R2}.$$ So the centre is $O(${p},\\ ${q})$ and the radius is $R=${R}$.`,
            he: `נקבץ ונשלים: $$\\left(x^2${signedTerm(D, "x")}\\right)+\\left(y^2${signedTerm(E, "y")}\\right) = ${-F}$$ $$\\left(x${signed(-p)}\\right)^2+\\left(y${signed(-q)}\\right)^2 = ${R2}.$$ לכן המרכז הוא $O(${p},\\ ${q})$ והרדיוס $R=${R}$.`,
          },
        },
        {
          move: 2,
          title: { en: "The radius is the normal", he: "הרדיוס הוא הנורמל" },
          body: {
            en: `$\\vec{OA} = \\left(${u},\\ ${v}\\right)$. Since the tangent at $A$ is perpendicular to $OA$, this vector is the tangent's normal, so the tangent has the form $${coef(u, "x")}${signedTerm(v, "y")} = c$.`,
            he: `$\\vec{OA} = \\left(${u},\\ ${v}\\right)$. מאחר שהמשיק ב-$A$ מאונך ל-$OA$, הווקטור הזה הוא הנורמל של המשיק, ולכן צורת המשיק היא $${coef(u, "x")}${signedTerm(v, "y")} = c$.`,
          },
        },
        {
          move: 3,
          title: { en: "Fix the constant", he: "קביעת הקבוע" },
          body: {
            en: `Substitute $A(${A[0]},\\ ${A[1]})$: $c = ${u}\\cdot${paren(A[0])} ${v < 0 ? "-" : "+"} ${Math.abs(v)}\\cdot${paren(A[1])} = ${rhs}$, giving $$${tangentLatex}.$$`,
            he: `נציב $A(${A[0]},\\ ${A[1]})$: $c = ${u}\\cdot${paren(A[0])} ${v < 0 ? "-" : "+"} ${Math.abs(v)}\\cdot${paren(A[1])} = ${rhs}$, ומתקבל $$${tangentLatex}.$$`,
          },
        },
        {
          move: 4,
          title: { en: "Tangent length by Pythagoras", he: "אורך המשיק לפי פיתגורס" },
          body: {
            en: `The tangent meets the radius at a right angle, so $POT$ is right-angled at the point of contact $T$: $$PT=\\sqrt{PO^2-R^2}=\\sqrt{${PO2}-${R2}}=\\sqrt{${PO2 - R2}}=${tangentLength}.$$`,
            he: `המשיק פוגש את הרדיוס בזווית ישרה, ולכן המשולש $POT$ ישר זווית בנקודת ההשקה $T$: $$PT=\\sqrt{PO^2-R^2}=\\sqrt{${PO2}-${R2}}=\\sqrt{${PO2 - R2}}=${tangentLength}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "A lies on the circle",
          expr: `(${A[0]}-${paren(p)})^2+(${A[1]}-${paren(q)})^2`,
          expected: String(R2),
        },
        {
          kind: "numeric",
          label: "the general form matches the centre/radius form",
          // Bases must be parenthesised: "-3^2" parses as -(3^2).
          expr: `${paren(A[0])}^2+${paren(A[1])}^2+${D}*${paren(A[0])}+${E}*${paren(A[1])}+${paren(F)}`,
          expected: "0",
        },
        {
          kind: "numeric",
          label: "the tangent passes through A",
          expr: `${u}*${paren(A[0])}+${paren(v)}*${paren(A[1])}`,
          expected: String(rhs),
        },
        {
          kind: "numeric",
          label: "distance from the centre to the tangent equals R",
          // Equality here is exactly the statement that the line is tangent.
          expr: `abs(${u}*${paren(p)}+${paren(v)}*${paren(q)}-${rhs})/sqrt(${paren(u)}^2+${paren(v)}^2)`,
          expected: String(R),
        },
        {
          kind: "numeric",
          label: "tangent length satisfies Pythagoras",
          expr: `sqrt(${PO2}-${R2})`,
          expected: String(tangentLength),
        },
        {
          kind: "numeric",
          label: "P is outside the circle",
          expr: `${PO2}-${R2}`,
          expected: "positive",
        },
      ],
    };
  },
};
