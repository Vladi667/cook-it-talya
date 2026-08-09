import type { Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { paren, signed } from "./util";

/**
 * The classic 582 polynomial investigation, built so that EVERYTHING lands on
 * an integer — which normally fights itself: a cubic with nice roots usually
 * has ugly extrema, and vice versa.
 *
 * The resolution is a repeated root. For
 *
 *     f(x) = a(x - r)^2 (x - s)   with   s = r + 3u,
 *
 * we get  f'(x) = 3a(x - r)(x - t)  with  t = r + 2u, and
 *
 *     roots       x = r (double), x = r + 3u
 *     maximum     (r, 0)
 *     minimum     (r + 2u, -4a·u^3)
 *     inflection  (r + u, -2a·u^3)
 *
 * all integers. The 3u spacing is exactly what makes the thirds cancel.
 */
interface Config {
  a: number;
  r: number;
  u: number;
}

function draw(rng: Rng): Config | null {
  const a = rng.pick([1, 1, 2, 3]);
  const u = rng.int(1, 3);
  const r = rng.int(-4, 4);
  const s = r + 3 * u;
  if (Math.abs(s) > 10) return null;
  // Keep the y-intercept readable.
  if (Math.abs(a * r * r * (r + 3 * u)) > 400) return null;
  return { a, r, u };
}

export const polynomialInvestigation: TemplateDef = {
  id: "polynomial-investigation",
  topic: "calculus",
  name: {
    en: "Polynomial investigation",
    he: "חקירת פולינום",
  },
  blurb: {
    en: "Roots, extrema, inflection and monotonicity of a cubic.",
    he: "שורשים, קיצון, פיתול ותחומי עלייה של פולינום ממעלה שלישית.",
  },

  generate(rng: Rng): Problem {
    const { a, r, u } = sample(rng, () => draw(rng));
    const s = r + 3 * u; // the simple root
    const t = r + 2 * u; // the minimum
    const infX = r + u;

    const minY = -4 * a * u ** 3;
    const infY = -2 * a * u ** 3;
    const yIntercept = a * r * r * (0 - s); // f(0)

    const aTex = a === 1 ? "" : String(a);
    const fLatex = `f(x)=${aTex}\\left(x ${signed(-r)}\\right)^2\\left(x ${signed(-s)}\\right)`;
    const fPlain = `${a}*(x-${paren(r)})^2*(x-${paren(s)})`;

    const increasing = `x<${r} or x>${t}`;
    const decreasing = `${r}<x<${t}`;

    return {
      id: `polynomial-investigation-${rng.int(0, 1e9)}`,
      templateId: "polynomial-investigation",
      seed: 0,
      difficulty: 3,
      title: { en: "Polynomial investigation", he: "חקירת פולינום" },
      statement: {
        en:
          `Given the function $$${fLatex}.$$ ` +
          `Find its intersections with the $x$-axis and with the $y$-axis, its minimum point, ` +
          `its point of inflection, and the intervals on which it is increasing.`,
        he:
          `נתונה הפונקציה $$${fLatex}.$$ ` +
          `מצאו את נקודות החיתוך עם ציר ה-$x$ ועם ציר ה-$y$, את נקודת המינימום, ` +
          `את נקודת הפיתול, ואת תחומי העלייה של הפונקציה.`,
      },
      params: { a, r, u, s, t },
      fields: [
        {
          id: "roots",
          type: "set",
          placeholder: "e.g. -2, 4",
          expected: `${r},${s}`,
          prompt: {
            en: "The $x$ values where the graph meets the $x$-axis",
            he: "ערכי ה-$x$ שבהם הגרף פוגש את ציר ה-$x$",
          },
          pitfalls: [
            {
              value: `${r},${t}`,
              id: "poly-roots-are-criticals",
              why: {
                en: `Those are the $x$ values of the **extrema**, not the intersections. The graph meets the axis where $f(x)=0$, which the factored form gives immediately: $x=${r}$ (a double root, where the graph touches and turns) and $x=${s}$.`,
                he: `אלה ערכי ה-$x$ של **נקודות הקיצון**, לא של החיתוכים. הגרף פוגש את הציר כאשר $f(x)=0$, והצורה המפורקת נותנת זאת מיד: $x=${r}$ (שורש כפול, שם הגרף משיק ומתהפך) ו-$x=${s}$.`,
              },
            },
          ],
        },
        {
          id: "yIntercept",
          type: "number",
          label: "f(0) =",
          placeholder: "e.g. -16",
          expected: String(yIntercept),
          prompt: {
            en: "The $y$ value where the graph meets the $y$-axis",
            he: "ערך ה-$y$ שבו הגרף פוגש את ציר ה-$y$",
          },
          // When the double root sits at the origin f(0) is 0, and a sign slip
          // has nothing to flip.
          pitfalls: yIntercept === 0 ? [] : [
            {
              value: String(-yIntercept),
              id: "poly-y-intercept-sign",
              why: {
                en: `Sign slip. $f(0)=${aTex || 1}\\cdot\\left(0 ${signed(-r)}\\right)^2\\left(0 ${signed(-s)}\\right)$ — the squared bracket is positive, so the sign comes entirely from $\\left(0 ${signed(-s)}\\right) = ${-s}$.`,
                he: `טעות סימן. $f(0)=${aTex || 1}\\cdot\\left(0 ${signed(-r)}\\right)^2\\left(0 ${signed(-s)}\\right)$ — הסוגר בריבוע חיובי, ולכן הסימן נקבע כולו על ידי $\\left(0 ${signed(-s)}\\right) = ${-s}$.`,
              },
            },
          ],
        },
        {
          id: "minimum",
          type: "point",
          placeholder: "(x, y)",
          expected: `(${t},${minY})`,
          prompt: { en: "The minimum point", he: "נקודת המינימום" },
          pitfalls: [
            {
              value: `(${r},0)`,
              id: "poly-min-is-max",
              why: {
                en: `That is the local **maximum**. At the double root $x=${r}$ the graph touches the axis and turns back down; the minimum is the other root of $f'$, at $x=${t}$.`,
                he: `זו נקודת ה**מקסימום** המקומית. בשורש הכפול $x=${r}$ הגרף משיק לציר ומתהפך כלפי מטה; המינימום הוא השורש השני של $f'$, ב-$x=${t}$.`,
              },
            },
            {
              value: `(${t},0)`,
              id: "poly-min-not-substituted",
              why: {
                en: `The $x$ is right, but you stopped before substituting back. A point needs both coordinates: $f(${t})=${minY}$.`,
                he: `ערך ה-$x$ נכון, אך עצרתם לפני ההצבה חזרה. לנקודה דרושים שני שיעורים: $f(${t})=${minY}$.`,
              },
            },
          ],
        },
        {
          id: "inflection",
          type: "point",
          placeholder: "(x, y)",
          expected: `(${infX},${infY})`,
          prompt: { en: "The point of inflection", he: "נקודת הפיתול" },
          pitfalls: [
            {
              value: `(${infX},0)`,
              id: "poly-inflection-not-substituted",
              why: {
                en: `$x=${infX}$ is right — that is where $f''=0$ — but substitute it back: $f(${infX})=${infY}$.`,
                he: `הערך $x=${infX}$ נכון — שם $f''=0$ — אך יש להציב חזרה: $f(${infX})=${infY}$.`,
              },
            },
          ],
        },
        {
          id: "increasing",
          type: "domain",
          placeholder: "e.g. x<1 or x>5",
          expected: increasing,
          prompt: {
            en: "Where the function is increasing",
            he: "תחומי העלייה של הפונקציה",
          },
          pitfalls: [
            {
              value: decreasing,
              id: "poly-increasing-flipped",
              why: {
                en: `That is where the function **decreases**. Between the maximum at $x=${r}$ and the minimum at $x=${t}$ the graph falls; it rises on either side of that stretch.`,
                he: `זהו התחום שבו הפונקציה **יורדת**. בין המקסימום ב-$x=${r}$ למינימום ב-$x=${t}$ הגרף יורד; הוא עולה משני צדי הקטע הזה.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "The function is already factored, so the intersections with the $x$-axis can be read straight off. Note that one bracket is squared — what does the graph do there?",
          he: "הפונקציה כבר מפורקת לגורמים, ולכן נקודות החיתוך עם ציר ה-$x$ נקראות ישירות. שימו לב שאחד הסוגריים בריבוע — מה עושה הגרף שם?",
        },
        {
          en: `Differentiate as a product and take out the common factor $\\left(x ${signed(-r)}\\right)$: it leaves $f'(x)=${3 * a}\\left(x ${signed(-r)}\\right)\\left(x ${signed(-t)}\\right)$.`,
          he: `גזרו כמכפלה והוציאו גורם משותף $\\left(x ${signed(-r)}\\right)$: מתקבל $f'(x)=${3 * a}\\left(x ${signed(-r)}\\right)\\left(x ${signed(-t)}\\right)$.`,
        },
        {
          en: `The two roots of $f'$ are $x=${r}$ and $x=${t}$. For the inflection, differentiate once more: $f''$ is linear, and vanishes exactly halfway between them.`,
          he: `שני השורשים של $f'$ הם $x=${r}$ ו-$x=${t}$. עבור הפיתול גזרו פעם נוספת: $f''$ לינארית ומתאפסת בדיוק באמצע ביניהם.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Intersections", he: "נקודות חיתוך" },
          body: {
            en: `The factored form gives the $x$-axis intersections at once: $f(x)=0$ when $x=${r}$ (a **double** root — the graph touches the axis and turns) or $x=${s}$. For the $y$-axis, $$f(0)=${aTex || 1}\\cdot(${-r})^2\\cdot(${-s})=${yIntercept}.$$`,
            he: `הצורה המפורקת נותנת מיד את החיתוכים עם ציר ה-$x$: $f(x)=0$ כאשר $x=${r}$ (שורש **כפול** — הגרף משיק לציר ומתהפך) או $x=${s}$. עבור ציר ה-$y$: $$f(0)=${aTex || 1}\\cdot(${-r})^2\\cdot(${-s})=${yIntercept}.$$`,
          },
        },
        {
          move: 1,
          title: { en: "Differentiate", he: "גזירה" },
          body: {
            en: `Product rule, then take out $\\left(x ${signed(-r)}\\right)$: $$f'(x)=${a}\\left(x ${signed(-r)}\\right)\\left[2\\left(x ${signed(-s)}\\right)+\\left(x ${signed(-r)}\\right)\\right]=${3 * a}\\left(x ${signed(-r)}\\right)\\left(x ${signed(-t)}\\right).$$`,
            he: `כלל המכפלה, ואז הוצאת $\\left(x ${signed(-r)}\\right)$: $$f'(x)=${a}\\left(x ${signed(-r)}\\right)\\left[2\\left(x ${signed(-s)}\\right)+\\left(x ${signed(-r)}\\right)\\right]=${3 * a}\\left(x ${signed(-r)}\\right)\\left(x ${signed(-t)}\\right).$$`,
          },
        },
        {
          move: 2,
          title: { en: "Extrema from the sign of $f'$", he: "קיצון לפי סימן $f'$" },
          body: {
            en: `$f'=0$ at $x=${r}$ and $x=${t}$. The product of two linear factors is positive outside the roots and negative between them, so $f$ rises, falls, then rises: a maximum at $(${r},\\ 0)$ and a minimum at $$\\left(${t},\\ ${minY}\\right).$$`,
            he: `$f'=0$ ב-$x=${r}$ וב-$x=${t}$. מכפלת שני גורמים לינאריים חיובית מחוץ לשורשים ושלילית ביניהם, ולכן $f$ עולה, יורדת, ואז עולה: מקסימום ב-$(${r},\\ 0)$ ומינימום ב-$$\\left(${t},\\ ${minY}\\right).$$`,
          },
        },
        {
          move: 3,
          title: { en: "Inflection", he: "נקודת פיתול" },
          body: {
            en: `$f''(x)=${6 * a}\\left(x ${signed(-infX)}\\right)$, which changes sign at $x=${infX}$ — halfway between the two extrema, as it always is for a cubic. Substituting back, $$\\left(${infX},\\ ${infY}\\right).$$`,
            he: `$f''(x)=${6 * a}\\left(x ${signed(-infX)}\\right)$, ומחליפה סימן ב-$x=${infX}$ — באמצע בין שתי נקודות הקיצון, כמו תמיד בפולינום ממעלה שלישית. בהצבה חזרה: $$\\left(${infX},\\ ${infY}\\right).$$`,
          },
        },
        {
          move: 4,
          title: { en: "Where it increases", he: "תחומי עלייה" },
          body: {
            en: `$f'>0$ outside the two roots, so the function increases on $$x<${r}\\quad\\text{and}\\quad x>${t},$$ and decreases between them.`,
            he: `$f'>0$ מחוץ לשני השורשים, ולכן הפונקציה עולה בתחומים $$x<${r}\\quad\\text{וגם}\\quad x>${t},$$ ויורדת ביניהם.`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "the double root is a root",
          expr: fPlain.replace(/x/g, `(${r})`),
          expected: "0",
        },
        {
          kind: "numeric",
          label: "the simple root is a root",
          expr: fPlain.replace(/x/g, `(${s})`),
          expected: "0",
        },
        {
          kind: "numeric",
          label: "y-intercept",
          expr: fPlain.replace(/x/g, "(0)"),
          expected: String(yIntercept),
        },
        {
          kind: "derivative",
          label: "f' vanishes at the double root (it is also a turning point)",
          expr: fPlain,
          variable: "x",
          at: String(r),
          expected: "0",
        },
        {
          kind: "derivative",
          label: "f' vanishes at the minimum",
          expr: fPlain,
          variable: "x",
          at: String(t),
          expected: "0",
        },
        {
          kind: "derivative",
          label: "the minimum really is a minimum (f'' > 0)",
          expr: fPlain,
          variable: "x",
          at: String(t),
          order: 2,
          expected: String(6 * a * u),
        },
        {
          kind: "numeric",
          label: "value at the minimum",
          expr: fPlain.replace(/x/g, `(${t})`),
          expected: String(minY),
        },
        {
          kind: "derivative",
          label: "f'' vanishes at the inflection",
          expr: fPlain,
          variable: "x",
          at: String(infX),
          order: 2,
          expected: "0",
        },
        {
          kind: "numeric",
          label: "value at the inflection",
          expr: fPlain.replace(/x/g, `(${infX})`),
          expected: String(infY),
        },
      ],
    };
  },
};
