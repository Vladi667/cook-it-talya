import type { Figure, Problem, Rng, Template } from "../types";
import { sample } from "../rng";
import { fracLatex, fracPlain, signed } from "./util";

/**
 * Area of a region bounded by a root curve, a straight line (or a second root
 * curve) and the x-axis. The parameters are chosen so the intersection lands
 * on a lattice point and the area comes out rational.
 *
 * Family "line":  y = j·sqrt(x)  and  y = x - p,  with p = w(w-j).
 *   They meet at (w^2, jw), the line meets the x-axis at p, and
 *   Area = j·w^2·(4w - 3j) / 6.
 *
 * Family "roots": y = c·sqrt(x)  and  y = c·sqrt(a-x),  with a = 2m^2.
 *   They meet at (m^2, cm) and Area = 4·c·m^3 / 3.
 */

type Kind = "line" | "roots";

interface Config {
  kind: Kind;
  // family "line"
  j: number;
  w: number;
  p: number;
  // family "roots"
  c: number;
  m: number;
  a: number;
}

function draw(rng: Rng): Config | null {
  if (rng.next() < 0.55) {
    const j = rng.int(1, 3);
    const w = rng.int(j + 1, 6);
    const p = w * (w - j);
    if (p <= 0) return null;
    return { kind: "line", j, w, p, c: 0, m: 0, a: 0 };
  }
  const c = rng.int(1, 3);
  const m = rng.int(1, 4);
  return { kind: "roots", j: 0, w: 0, p: 0, c, m, a: 2 * m * m };
}

function samplePolyline(
  f: (x: number) => number,
  from: number,
  to: number,
  n = 48,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    pts.push([round(x), round(f(x))]);
  }
  return pts;
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export const areaBetweenCurves: Template = {
  id: "area-between-curves",
  topic: "calculus",
  name: {
    en: "Area between curves",
    he: "שטח בין עקומים",
  },
  blurb: {
    en: "Find the intersection, split the region, integrate each piece.",
    he: "מציאת נקודת החיתוך, פיצול התחום, ואינטגרציה על כל חלק.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    if (cfg.kind === "line") {
      const { j, w, p } = cfg;
      const xi = w * w;
      const yi = j * w;
      const areaNum = j * w * w * (4 * w - 3 * j);
      const areaPlain = fracPlain(areaNum, 6);
      const areaLatex = fracLatex(areaNum, 6);

      const curveLatex = j === 1 ? "\\sqrt{x}" : `\\sqrt{${j * j}x}`;
      const curvePlain = `${j}*sqrt(x)`;
      const lineLatex = `x ${signed(-p)}`;

      const figure: Figure = {
        xRange: [0, xi * 1.12],
        yRange: [0, yi * 1.25],
        curves: [
          {
            points: samplePolyline((x) => j * Math.sqrt(x), 0, xi * 1.12),
            label: "y=" + (j === 1 ? "√x" : `√(${j * j}x)`),
          },
          {
            points: [
              [p, 0],
              [round(xi * 1.12), round(xi * 1.12 - p)],
            ],
            label: `y=x−${p}`,
          },
        ],
        shade: [
          ...samplePolyline((x) => j * Math.sqrt(x), 0, xi, 36),
          [p, 0],
          [0, 0],
        ],
        marks: [
          { x: xi, y: yi, label: `(${xi}, ${yi})` },
          { x: p, y: 0, label: `${p}` },
        ],
      };

      return {
        id: `area-between-curves-line-${rng.int(0, 1e9)}`,
        templateId: "area-between-curves",
        seed: 0,
        difficulty: 3,
        title: { en: "Area of the bounded region", he: "שטח התחום החסום" },
        statement: {
          en:
            `The curve $y=${curveLatex}$ and the line $y=${lineLatex}$ are given. ` +
            `Sketch the region bounded by the curve, the line and the positive $x$-axis, ` +
            `and find its area.`,
          he:
            `נתונים העקום $y=${curveLatex}$ והישר $y=${lineLatex}$. ` +
            `שרטטו את התחום החסום על ידי העקום, הישר וחלקו החיובי של ציר ה-$x$, ` +
            `וחשבו את שטחו.`,
        },
        params: { kind: "line", j, w, p },
        figure,
        fields: [
          {
            id: "intersection",
            type: "point",
            placeholder: "(x, y)",
            expected: `(${xi},${yi})`,
            prompt: {
              en: "Intersection of the curve and the line",
              he: "נקודת החיתוך של העקום והישר",
            },
          },
          {
            id: "split",
            type: "number",
            placeholder: "x = ...",
            expected: String(p),
            prompt: {
              en: "The $x$ where the lower boundary changes",
              he: "ערך ה-$x$ שבו משתנה הגבול התחתון",
            },
          },
          {
            id: "area",
            type: "number",
            label: "S =",
            placeholder: "e.g. 10/3",
            expected: areaPlain,
            prompt: { en: "Area of the region", he: "שטח התחום" },
            pitfalls: [
              {
                // integrating (curve - line) across the whole interval
                value: fracPlain(3 * w ** 4 - 2 * j * w ** 3, 6),
                why: {
                  en: `You integrated $\\left(\\text{curve}-\\text{line}\\right)$ across the whole interval $[0,${xi}]$. That is wrong on $[0,${p}]$: there the line is **below the $x$-axis**, so subtracting it adds area that is not part of the region. Split at $x=${p}$.`,
                  he: `חישבתם אינטגרל של $\\left(\\text{עקום}-\\text{ישר}\\right)$ על כל הקטע $[0,${xi}]$. זה שגוי בקטע $[0,${p}]$: שם הישר נמצא **מתחת לציר ה-$x$**, ולכן חיסורו מוסיף שטח שאינו שייך לתחום. פצלו ב-$x=${p}$.`,
                },
              },
              {
                // area under the curve alone
                value: fracPlain(2 * j * w ** 3, 3),
                why: {
                  en: `That is the area under the curve alone, from $0$ to $${xi}$. You still have to remove the triangle between the line, the $x$-axis and $x=${xi}$, whose area is $${fracPlain(j * j * w * w, 2)}$.`,
                  he: `זהו השטח שמתחת לעקום בלבד, מ-$0$ עד $${xi}$. עדיין יש להחסיר את המשולש שבין הישר, ציר ה-$x$ ו-$x=${xi}$, ששטחו $${fracPlain(j * j * w * w, 2)}$.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "Sketch it first. The line crosses the $x$-axis before it meets the curve, so the region does not have a single formula all the way across.",
            he: "שרטטו קודם. הישר חותך את ציר ה-$x$ לפני שהוא פוגש את העקום, ולכן לתחום אין נוסחה אחת לכל אורכו.",
          },
          {
            en: `Up to $x=${p}$ the region sits between the curve and the $x$-axis; from $x=${p}$ onwards its lower edge is the line. Split the integral there.`,
            he: `עד $x=${p}$ התחום נמצא בין העקום לציר ה-$x$; מ-$x=${p}$ והלאה הגבול התחתון הוא הישר. פצלו שם את האינטגרל.`,
          },
          {
            en: `Solve $${curveLatex}=${lineLatex}$ by squaring: the intersection is $(${xi},\\ ${yi})$. Then compute $\\int_0^{${p}}${curveLatex}\\,dx+\\int_{${p}}^{${xi}}\\left(${curveLatex}-\\left(${lineLatex}\\right)\\right)dx$.`,
            he: `פתרו $${curveLatex}=${lineLatex}$ על ידי העלאה בריבוע: נקודת החיתוך היא $(${xi},\\ ${yi})$. לאחר מכן חשבו $\\int_0^{${p}}${curveLatex}\\,dx+\\int_{${p}}^{${xi}}\\left(${curveLatex}-\\left(${lineLatex}\\right)\\right)dx$.`,
          },
        ],
        steps: [
          {
            title: { en: "Intersection", he: "נקודת חיתוך" },
            body: {
              en: `Set $${curveLatex}=x ${signed(-p)}$ and square: $${j * j}x = \\left(x ${signed(-p)}\\right)^2$, i.e. $x^2 - ${2 * p + j * j}x + ${p * p}=0$, whose relevant root is $x=${xi}$. So the curve and the line meet at $(${xi},\\ ${yi})$. The line meets the $x$-axis at $x=${p}$.`,
              he: `נשווה $${curveLatex}=x ${signed(-p)}$ ונעלה בריבוע: $${j * j}x = \\left(x ${signed(-p)}\\right)^2$, כלומר $x^2 - ${2 * p + j * j}x + ${p * p}=0$, והשורש הרלוונטי הוא $x=${xi}$. לכן העקום והישר נפגשים ב-$(${xi},\\ ${yi})$. הישר חותך את ציר ה-$x$ ב-$x=${p}$.`,
            },
          },
          {
            title: { en: "Split the region", he: "פיצול התחום" },
            body: {
              en: `The upper boundary is the curve throughout. The lower boundary is the $x$-axis on $[0,${p}]$ and the line on $[${p},${xi}]$ — so the area is a sum of two integrals.`,
              he: `הגבול העליון הוא העקום לכל אורך התחום. הגבול התחתון הוא ציר ה-$x$ בקטע $[0,${p}]$ והישר בקטע $[${p},${xi}]$ — ולכן השטח הוא סכום של שני אינטגרלים.`,
            },
          },
          {
            title: { en: "Integrate", he: "אינטגרציה" },
            body: {
              en: `$$S=\\int_{0}^{${p}}${curveLatex}\\,dx+\\int_{${p}}^{${xi}}\\left[${curveLatex}-\\left(x ${signed(-p)}\\right)\\right]dx,$$ using $\\int ${curveLatex}\\,dx = \\frac{2${j === 1 ? "" : j}}{3}x^{3/2}$.`,
              he: `$$S=\\int_{0}^{${p}}${curveLatex}\\,dx+\\int_{${p}}^{${xi}}\\left[${curveLatex}-\\left(x ${signed(-p)}\\right)\\right]dx,$$ תוך שימוש ב-$\\int ${curveLatex}\\,dx = \\frac{2${j === 1 ? "" : j}}{3}x^{3/2}$.`,
            },
          },
          {
            title: { en: "Sum", he: "סכימה" },
            body: {
              en: `The $x^{3/2}$ terms at $x=${p}$ cancel between the two integrals, and what is left is rational: $$S=${areaLatex}.$$`,
              he: `האיברים מסוג $x^{3/2}$ ב-$x=${p}$ מצטמצמים בין שני האינטגרלים, והתוצאה רציונלית: $$S=${areaLatex}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "numeric",
            label: "intersection is on the curve",
            expr: `${j}*sqrt(${xi})`,
            expected: String(yi),
          },
          {
            kind: "numeric",
            label: "intersection is on the line",
            expr: `${xi}-${p}`,
            expected: String(yi),
          },
          {
            kind: "integral",
            label: "numeric area matches the closed form",
            terms: [
              { expr: curvePlain, variable: "x", from: "0", to: String(p) },
              {
                expr: `${curvePlain}-(x-${p})`,
                variable: "x",
                from: String(p),
                to: String(xi),
              },
            ],
            expected: areaPlain,
          },
        ],
      };
    }

    // family "roots"
    const { c, m, a } = cfg;
    const xi = m * m;
    const yi = c * m;
    const areaNum = 4 * c * m ** 3;
    const areaPlain = fracPlain(areaNum, 3);
    const areaLatex = fracLatex(areaNum, 3);

    const f1 = c === 1 ? "\\sqrt{x}" : `${c}\\sqrt{x}`;
    const f2 = c === 1 ? `\\sqrt{${a}-x}` : `${c}\\sqrt{${a}-x}`;
    const f1Plain = `${c}*sqrt(x)`;
    const f2Plain = `${c}*sqrt(${a}-x)`;

    const figure: Figure = {
      xRange: [0, a],
      yRange: [0, yi * 1.25],
      curves: [
        { points: samplePolyline((x) => c * Math.sqrt(x), 0, xi), label: `y=${c === 1 ? "√x" : c + "√x"}` },
        {
          points: samplePolyline((x) => c * Math.sqrt(a - x), xi, a),
          label: `y=${c === 1 ? "" : c}√(${a}−x)`,
        },
      ],
      shade: [
        ...samplePolyline((x) => c * Math.sqrt(x), 0, xi, 30),
        ...samplePolyline((x) => c * Math.sqrt(a - x), xi, a, 30),
        [0, 0],
      ],
      marks: [{ x: xi, y: yi, label: `(${xi}, ${yi})` }],
    };

    return {
      id: `area-between-curves-roots-${rng.int(0, 1e9)}`,
      templateId: "area-between-curves",
      seed: 0,
      difficulty: 2,
      title: { en: "Area of the bounded region", he: "שטח התחום החסום" },
      statement: {
        en:
          `The curves $y=${f1}$ and $y=${f2}$ are given. ` +
          `Sketch the region they bound together with the $x$-axis, and find its area.`,
        he:
          `נתונים העקומים $y=${f1}$ ו-$y=${f2}$. ` +
          `שרטטו את התחום שהם חוסמים יחד עם ציר ה-$x$, וחשבו את שטחו.`,
      },
      params: { kind: "roots", c, m, a },
      figure,
      fields: [
        {
          id: "intersection",
          type: "point",
          placeholder: "(x, y)",
          expected: `(${xi},${yi})`,
          prompt: {
            en: "Intersection of the two curves",
            he: "נקודת החיתוך של שני העקומים",
          },
        },
        {
          id: "area",
          type: "number",
          label: "S =",
          placeholder: "e.g. 32/3",
          expected: areaPlain,
          prompt: { en: "Area of the region", he: "שטח התחום" },
          pitfalls: [
            {
              value: fracPlain(areaNum, 6),
              why: {
                en: `That is only the left half — the part under $y=${f1}$ up to $x=${xi}$. The region continues under the second curve all the way to $x=${a}$, and by symmetry that half has the same area, so double it.`,
                he: `זהו רק החצי השמאלי — החלק שמתחת ל-$y=${f1}$ עד $x=${xi}$. התחום ממשיך מתחת לעקום השני עד $x=${a}$, ומסימטריה לחצי הזה אותו שטח, ולכן יש להכפיל ב-2.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "The two curves are mirror images of each other. Where do they cross?",
          he: "שני העקומים הם שיקוף זה של זה. היכן הם נחתכים?",
        },
        {
          en: `They meet where $x = ${a}-x$. To the left of that the upper curve is the first one; to the right it is the second — so the area splits into two integrals.`,
          he: `הם נפגשים כאשר $x = ${a}-x$. משמאל לנקודה זו העקום העליון הוא הראשון, ומימין — השני, ולכן השטח מתפצל לשני אינטגרלים.`,
        },
        {
          en: `The intersection is at $x=${xi}$. By symmetry the two pieces have equal area, so $S = 2\\int_{0}^{${xi}}${f1}\\,dx$.`,
          he: `נקודת החיתוך היא ב-$x=${xi}$. מסימטריה שני החלקים שווים בשטחם, ולכן $S = 2\\int_{0}^{${xi}}${f1}\\,dx$.`,
        },
      ],
      steps: [
        {
          title: { en: "Intersection", he: "נקודת חיתוך" },
          body: {
            en: `$${f1}=${f2}$ gives $x=${a}-x$, so $x=${xi}$ and $y=${yi}$: the curves meet at $(${xi},\\ ${yi})$. The first curve starts at the origin, the second reaches the $x$-axis at $x=${a}$.`,
            he: `מהמשוואה $${f1}=${f2}$ נובע $x=${a}-x$, ולכן $x=${xi}$ ו-$y=${yi}$: העקומים נפגשים ב-$(${xi},\\ ${yi})$. העקום הראשון יוצא מהראשית, והשני מגיע לציר ה-$x$ ב-$x=${a}$.`,
          },
        },
        {
          title: { en: "Split the region", he: "פיצול התחום" },
          body: {
            en: `The upper boundary changes at $x=${xi}$: it is $${f1}$ before, and $${f2}$ after. The lower boundary is the $x$-axis throughout.`,
            he: `הגבול העליון משתנה ב-$x=${xi}$: לפניו $${f1}$, ואחריו $${f2}$. הגבול התחתון הוא ציר ה-$x$ לכל האורך.`,
          },
        },
        {
          title: { en: "Integrate", he: "אינטגרציה" },
          body: {
            en: `$$S=\\int_{0}^{${xi}}${f1}\\,dx+\\int_{${xi}}^{${a}}${f2}\\,dx = ${fracLatex(areaNum, 6)} + ${fracLatex(areaNum, 6)} = ${areaLatex}.$$ The two halves are equal by the symmetry about $x=${xi}$.`,
            he: `$$S=\\int_{0}^{${xi}}${f1}\\,dx+\\int_{${xi}}^{${a}}${f2}\\,dx = ${fracLatex(areaNum, 6)} + ${fracLatex(areaNum, 6)} = ${areaLatex}.$$ שני החצאים שווים בגלל הסימטריה סביב $x=${xi}$.`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "intersection is on both curves",
          expr: `${c}*sqrt(${xi})-${c}*sqrt(${a}-${xi})`,
          expected: "0",
        },
        {
          kind: "integral",
          label: "numeric area matches the closed form",
          terms: [
            { expr: f1Plain, variable: "x", from: "0", to: String(xi) },
            { expr: f2Plain, variable: "x", from: String(xi), to: String(a) },
          ],
          expected: areaPlain,
        },
      ],
    };
  },
};
