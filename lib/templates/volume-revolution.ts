import type { Figure, Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { fracLatex, fracPlain } from "./util";

/**
 * Volumes of revolution by the disc method, in three families chosen so the
 * answer is always a rational multiple of pi:
 *
 *   root   y = sqrt(kx) about the x-axis on [0, h]      V = pi·k·h²/2
 *   between y = c·sqrt(x) and y = c·x/n about the x-axis V = pi·c²·n⁴/6
 *   yaxis  y = x², y = q about the y-axis                V = pi·q²/2
 *
 * Squaring the radius is what removes the root in every case — which is the
 * whole reason these come out clean, and the thing to teach.
 */
type Kind = "root" | "between" | "yaxis";

interface Config {
  kind: Kind;
  k: number;
  h: number;
  c: number;
  n: number;
  q: number;
}

function draw(rng: Rng): Config | null {
  const roll = rng.next();
  if (roll < 0.4) {
    const k = rng.int(1, 6);
    const h = rng.int(2, 6);
    // Keep V = pi k h^2 / 2 a tidy rational.
    return { kind: "root", k, h, c: 0, n: 0, q: 0 };
  }
  if (roll < 0.75) {
    const c = rng.int(1, 3);
    const n = rng.int(1, 5);
    return { kind: "between", k: 0, h: 0, c, n, q: 0 };
  }
  const q = rng.int(2, 9);
  return { kind: "yaxis", k: 0, h: 0, c: 0, n: 0, q };
}

function sampleCurve(
  f: (x: number) => number,
  from: number,
  to: number,
  n = 40,
): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / n;
    return [
      Math.round(x * 1000) / 1000,
      Math.round(f(x) * 1000) / 1000,
    ] as [number, number];
  });
}

export const volumeRevolution: TemplateDef = {
  id: "volume-revolution",
  topic: "calculus",
  name: {
    en: "Volume of revolution",
    he: "נפח גוף סיבוב",
  },
  blurb: {
    en: "Disc method: square the radius, integrate, multiply by π.",
    he: "שיטת הדיסקות: מעלים את הרדיוס בריבוע, מאנטגרלים, וכופלים ב-π.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    /* ------------------------------------------------ y = sqrt(kx) on [0,h] */
    if (cfg.kind === "root") {
      const { k, h } = cfg;
      const volNum = k * h * h; // V = pi * k h^2 / 2
      const volPlain = `pi*${fracPlain(volNum, 2)}`;
      const volLatex = `${fracLatex(volNum, 2)}\\pi`;
      const curveLatex = k === 1 ? "\\sqrt{x}" : `\\sqrt{${k}x}`;

      const figure: Figure = {
        xRange: [0, h * 1.1],
        yRange: [0, Math.sqrt(k * h) * 1.25],
        curves: [
          {
            points: sampleCurve((x) => Math.sqrt(k * x), 0, h),
            label: `y=${k === 1 ? "√x" : `√(${k}x)`}`,
          },
        ],
        shade: [...sampleCurve((x) => Math.sqrt(k * x), 0, h, 30), [h, 0], [0, 0]],
        marks: [{ x: h, y: Math.sqrt(k * h), label: `x=${h}` }],
      };

      return {
        id: `volume-revolution-root-${rng.int(0, 1e9)}`,
        templateId: "volume-revolution",
        seed: 0,
        difficulty: 2,
        title: { en: "Volume of revolution", he: "נפח גוף סיבוב" },
        statement: {
          en:
            `The region bounded by the curve $y=${curveLatex}$, the $x$-axis and the line $x=${h}$ ` +
            `is rotated about the **$x$-axis**. Find the volume of the solid of revolution.`,
          he:
            `התחום החסום על ידי העקום $y=${curveLatex}$, ציר ה-$x$ והישר $x=${h}$ ` +
            `מסובב סביב **ציר ה-$x$**. חשבו את נפח גוף הסיבוב.`,
        },
        params: { kind: "root", k, h },
        figure,
        fields: [
          {
            id: "V",
            type: "expression",
            label: "V =",
            placeholder: "e.g. 8pi",
            expected: volPlain,
            prompt: { en: "Volume", he: "נפח" },
            pitfalls: [
              {
                value: fracPlain(volNum, 2),
                id: "vol-missing-pi",
                why: {
                  en: `The integral is right but the $\\pi$ has been dropped. The disc at $x$ has area $\\pi y^2$, so $V=\\pi\\int y^2\\,dx = ${volLatex}$.`,
                  he: `האינטגרל נכון אך ה-$\\pi$ נשמט. שטח הדיסקה ב-$x$ הוא $\\pi y^2$, ולכן $V=\\pi\\int y^2\\,dx = ${volLatex}$.`,
                },
              },
              {
                // treating the solid as a cylinder of radius y(h): pi*k*h*h,
                // which is exactly twice the true volume
                value: `pi*${k * h * h}`,
                id: "vol-treated-as-cylinder",
                why: {
                  en: `That is the volume of a **cylinder** of radius $y(${h})$ — it assumes the radius never changes. The solid tapers to a point at the origin, which is exactly why it has to be integrated; the true volume is half as much.`,
                  he: `זהו נפח של **גליל** ברדיוס $y(${h})$ — הנחה שהרדיוס אינו משתנה. הגוף מתחדד עד לנקודה בראשית, ובדיוק לכן יש לאנטגרל; הנפח האמיתי הוא מחצית מכך.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "Slice the solid perpendicular to the axis of rotation. Each slice is a disc — what is its radius at position $x$?",
            he: "חתכו את הגוף בניצב לציר הסיבוב. כל פרוסה היא דיסקה — מהו רדיוסה בנקודה $x$?",
          },
          {
            en: "The radius is $y$, so the disc has area $\\pi y^2$ and $V=\\pi\\int_0^{" + h + "} y^2\\,dx$.",
            he: "הרדיוס הוא $y$, ולכן שטח הדיסקה הוא $\\pi y^2$ ומתקיים $V=\\pi\\int_0^{" + h + "} y^2\\,dx$.",
          },
          {
            en: `Squaring removes the root entirely: $y^2=${k === 1 ? "x" : `${k}x`}$, so the integral is of a straight line.`,
            he: `ההעלאה בריבוע מסלקת את השורש לגמרי: $y^2=${k === 1 ? "x" : `${k}x`}$, ולכן האינטגרל הוא של ישר.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Axis and variable", he: "ציר ומשתנה" },
            body: {
              en: `Rotation is about the $x$-axis, so slice perpendicular to it and integrate with respect to $x$, from $0$ to $${h}$.`,
              he: `הסיבוב הוא סביב ציר ה-$x$, ולכן חותכים בניצב לו ומאנטגרלים לפי $x$, מ-$0$ עד $${h}$.`,
            },
          },
          {
            move: 1,
            title: { en: "Square the radius", he: "העלאת הרדיוס בריבוע" },
            body: {
              en: `Each disc has radius $y=${curveLatex}$, so $$y^2=${k === 1 ? "x" : `${k}x`}$$ — the root is gone before any integration happens.`,
              he: `לכל דיסקה רדיוס $y=${curveLatex}$, ולכן $$y^2=${k === 1 ? "x" : `${k}x`}$$ — השורש נעלם עוד לפני האינטגרציה.`,
            },
          },
          {
            move: 3,
            title: { en: "Integrate", he: "אינטגרציה" },
            body: {
              en: `$$V=\\pi\\int_{0}^{${h}}${k === 1 ? "x" : `${k}x`}\\,dx=\\pi\\left[\\frac{${k === 1 ? "" : k}x^2}{2}\\right]_{0}^{${h}}=${volLatex}.$$`,
              he: `$$V=\\pi\\int_{0}^{${h}}${k === 1 ? "x" : `${k}x`}\\,dx=\\pi\\left[\\frac{${k === 1 ? "" : k}x^2}{2}\\right]_{0}^{${h}}=${volLatex}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "integral",
            label: "numeric disc integral matches the closed form",
            terms: [
              { expr: `${k}*x`, variable: "x", from: "0", to: String(h) },
            ],
            expected: fracPlain(volNum, 2),
          },
        ],
      };
    }

    /* ------------------------------- between y = c·sqrt(x) and y = c·x/n --- */
    if (cfg.kind === "between") {
      const { c, n } = cfg;
      const xi = n * n; // they meet at x = n^2
      const yi = c * n;
      const volNum = c * c * n ** 4; // V = pi c^2 n^4 / 6
      const volPlain = `pi*${fracPlain(volNum, 6)}`;
      const volLatex = `${fracLatex(volNum, 6)}\\pi`;

      const outer = c === 1 ? "\\sqrt{x}" : `${c}\\sqrt{x}`;
      const inner = n === 1 ? (c === 1 ? "x" : `${c}x`) : `\\frac{${c === 1 ? "" : c}x}{${n}}`;

      const figure: Figure = {
        xRange: [0, xi * 1.12],
        yRange: [0, yi * 1.25],
        curves: [
          {
            points: sampleCurve((x) => c * Math.sqrt(x), 0, xi),
            label: `y=${c === 1 ? "√x" : `${c}√x`}`,
          },
          {
            points: [
              [0, 0],
              [xi, yi],
            ],
            label: `y=${c === 1 ? "" : c}x/${n}`,
          },
        ],
        shade: [
          ...sampleCurve((x) => c * Math.sqrt(x), 0, xi, 30),
          [xi, yi],
          [0, 0],
        ],
        marks: [{ x: xi, y: yi, label: `(${xi}, ${yi})` }],
      };

      return {
        id: `volume-revolution-between-${rng.int(0, 1e9)}`,
        templateId: "volume-revolution",
        seed: 0,
        difficulty: 3,
        title: { en: "Volume of revolution", he: "נפח גוף סיבוב" },
        statement: {
          en:
            `The region enclosed between the curve $y=${outer}$ and the line $y=${inner}$ ` +
            `is rotated about the **$x$-axis**. Find the coordinates of the point where they meet, ` +
            `and the volume of the resulting solid.`,
          he:
            `התחום הכלוא בין העקום $y=${outer}$ לישר $y=${inner}$ ` +
            `מסובב סביב **ציר ה-$x$**. מצאו את שיעורי נקודת המפגש שלהם, ` +
            `ואת נפח גוף הסיבוב המתקבל.`,
        },
        params: { kind: "between", c, n },
        figure,
        fields: [
          {
            id: "intersection",
            type: "point",
            placeholder: "(x, y)",
            expected: `(${xi},${yi})`,
            prompt: {
              en: "Where the curve meets the line (other than the origin)",
              he: "נקודת המפגש של העקום והישר (מלבד הראשית)",
            },
          },
          {
            id: "V",
            type: "expression",
            label: "V =",
            placeholder: "e.g. 8pi/3",
            expected: volPlain,
            prompt: { en: "Volume", he: "נפח" },
            pitfalls: [
              {
                value: fracPlain(volNum, 6),
                id: "vol-between-missing-pi",
                why: {
                  en: `The integral is right but the $\\pi$ has been dropped: $V=\\pi\\int\\left(R^2-r^2\\right)dx=${volLatex}$.`,
                  he: `האינטגרל נכון אך ה-$\\pi$ נשמט: $V=\\pi\\int\\left(R^2-r^2\\right)dx=${volLatex}$.`,
                },
              },
              {
                // (R - r)^2 instead of R^2 - r^2
                value: `pi*${fracPlain(c * c * n ** 4, 30)}`,
                id: "vol-difference-squared",
                why: {
                  en: "You squared the difference. A washer's area is $\\pi R^2-\\pi r^2$, which is **not** $\\pi(R-r)^2$ — subtract the squares, do not square the subtraction.",
                  he: "העליתם את ההפרש בריבוע. שטח טבעת הוא $\\pi R^2-\\pi r^2$, וזה **אינו** $\\pi(R-r)^2$ — חסרו את הריבועים, אל תעלו את ההפרש בריבוע.",
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "First find where the two graphs meet — that fixes the limits of integration.",
            he: "מצאו תחילה היכן שני הגרפים נפגשים — זה קובע את גבולות האינטגרציה.",
          },
          {
            en: "Rotating a region between two curves gives washers, not discs: each slice has an outer radius and a hole.",
            he: "סיבוב תחום שבין שני עקומים יוצר טבעות ולא דיסקות: לכל פרוסה רדיוס חיצוני וחור פנימי.",
          },
          {
            en: `$V=\\pi\\int_{0}^{${xi}}\\left[\\left(${outer}\\right)^2-\\left(${inner}\\right)^2\\right]dx$. Both squares are simple: $${c * c}x$ and a quadratic.`,
            he: `$V=\\pi\\int_{0}^{${xi}}\\left[\\left(${outer}\\right)^2-\\left(${inner}\\right)^2\\right]dx$. שני הריבועים פשוטים: $${c * c}x$ וריבועי.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Where they meet", he: "נקודת המפגש" },
            body: {
              en: `$${outer}=${inner}$. Squaring gives $${c * c}x=\\frac{${c * c}x^2}{${n * n}}$, so $x=0$ or $x=${xi}$, and the upper meeting point is $$\\left(${xi},\\ ${yi}\\right).$$`,
              he: `$${outer}=${inner}$. העלאה בריבוע נותנת $${c * c}x=\\frac{${c * c}x^2}{${n * n}}$, ולכן $x=0$ או $x=${xi}$, ונקודת המפגש העליונה היא $$\\left(${xi},\\ ${yi}\\right).$$`,
            },
          },
          {
            move: 1,
            title: { en: "Washers, not discs", he: "טבעות ולא דיסקות" },
            body: {
              en: `On $[0,${xi}]$ the curve is above the line, so each slice is a washer: outer radius $${outer}$, inner radius $${inner}$. Its area is $\\pi\\left(R^2-r^2\\right)$.`,
              he: `בקטע $[0,${xi}]$ העקום נמצא מעל הישר, ולכן כל פרוסה היא טבעת: רדיוס חיצוני $${outer}$, רדיוס פנימי $${inner}$. שטחה $\\pi\\left(R^2-r^2\\right)$.`,
            },
          },
          {
            move: 3,
            title: { en: "Integrate", he: "אינטגרציה" },
            body: {
              en: `$$V=\\pi\\int_{0}^{${xi}}\\left[${c * c}x-\\frac{${c * c}x^2}{${n * n}}\\right]dx=\\pi\\left[\\frac{${c * c}x^2}{2}-\\frac{${c * c}x^3}{${3 * n * n}}\\right]_{0}^{${xi}}=${volLatex}.$$`,
              he: `$$V=\\pi\\int_{0}^{${xi}}\\left[${c * c}x-\\frac{${c * c}x^2}{${n * n}}\\right]dx=\\pi\\left[\\frac{${c * c}x^2}{2}-\\frac{${c * c}x^3}{${3 * n * n}}\\right]_{0}^{${xi}}=${volLatex}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "numeric",
            label: "the meeting point is on both graphs",
            expr: `${c}*sqrt(${xi})-${c}*${xi}/${n}`,
            expected: "0",
          },
          {
            kind: "integral",
            label: "numeric washer integral matches the closed form",
            terms: [
              {
                expr: `${c * c}*x-${c * c}*x^2/${n * n}`,
                variable: "x",
                from: "0",
                to: String(xi),
              },
            ],
            expected: fracPlain(volNum, 6),
          },
        ],
      };
    }

    /* --------------------------------- y = x^2 and y = q about the y-axis --- */
    const { q } = cfg;
    const volNum = q * q; // V = pi q^2 / 2
    const volPlain = `pi*${fracPlain(volNum, 2)}`;
    const volLatex = `${fracLatex(volNum, 2)}\\pi`;
    const edge = Math.sqrt(q);

    const figure: Figure = {
      xRange: [0, edge * 1.2],
      yRange: [0, q * 1.15],
      curves: [
        { points: sampleCurve((x) => x * x, 0, edge), label: "y=x²" },
        {
          points: [
            [0, q],
            [Math.round(edge * 1000) / 1000, q],
          ],
          label: `y=${q}`,
        },
      ],
      shade: [[0, 0], ...sampleCurve((x) => x * x, 0, edge, 30), [0, q]],
      marks: [{ x: edge, y: q, label: `y=${q}` }],
    };

    return {
      id: `volume-revolution-yaxis-${rng.int(0, 1e9)}`,
      templateId: "volume-revolution",
      seed: 0,
      difficulty: 3,
      title: { en: "Volume of revolution", he: "נפח גוף סיבוב" },
      statement: {
        en:
          `The region bounded by the parabola $y=x^2$, the $y$-axis and the line $y=${q}$ ` +
          `is rotated about the **$y$-axis**. Find the volume of the solid of revolution.`,
        he:
          `התחום החסום על ידי הפרבולה $y=x^2$, ציר ה-$y$ והישר $y=${q}$ ` +
          `מסובב סביב **ציר ה-$y$**. חשבו את נפח גוף הסיבוב.`,
      },
      params: { kind: "yaxis", q },
      figure,
      fields: [
        {
          id: "V",
          type: "expression",
          label: "V =",
          placeholder: "e.g. 8pi",
          expected: volPlain,
          prompt: { en: "Volume", he: "נפח" },
          pitfalls: [
            {
              value: fracPlain(volNum, 2),
              id: "vol-yaxis-missing-pi",
              why: {
                en: `The integral is right but the $\\pi$ has been dropped: $V=\\pi\\int_0^{${q}}x^2\\,dy=${volLatex}$.`,
                he: `האינטגרל נכון אך ה-$\\pi$ נשמט: $V=\\pi\\int_0^{${q}}x^2\\,dy=${volLatex}$.`,
              },
            },
            {
              // integrated dx instead of dy: pi * int_0^sqrt(q) x^4 dx
              //                            = pi * q^(5/2) / 5
              value: `pi*${q * q}*sqrt(${q})/5`,
              id: "vol-wrong-variable",
              why: {
                en: `Rotation about the **$y$-axis** means slicing perpendicular to $y$, so the integration is $dy$, not $dx$. Rewrite the radius as a function of $y$: here $x^2=y$ directly.`,
                he: `סיבוב סביב **ציר ה-$y$** פירושו חיתוך בניצב ל-$y$, ולכן האינטגרציה היא $dy$ ולא $dx$. כתבו מחדש את הרדיוס כפונקציה של $y$: כאן פשוט $x^2=y$.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "The axis of rotation is the $y$-axis this time. Which variable should you be slicing along?",
          he: "ציר הסיבוב הפעם הוא ציר ה-$y$. לפי איזה משתנה יש לחתוך?",
        },
        {
          en: "Slice perpendicular to $y$: each disc has radius $x$ and area $\\pi x^2$, so $V=\\pi\\int x^2\\,dy$.",
          he: "חתכו בניצב ל-$y$: לכל דיסקה רדיוס $x$ ושטח $\\pi x^2$, ולכן $V=\\pi\\int x^2\\,dy$.",
        },
        {
          en: `From $y=x^2$ the radius squared is simply $x^2=y$, so the integrand is $y$ and the limits run from $0$ to $${q}$.`,
          he: `מתוך $y=x^2$ הרדיוס בריבוע הוא פשוט $x^2=y$, ולכן האינטגרנד הוא $y$ והגבולות מ-$0$ עד $${q}$.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Axis and variable", he: "ציר ומשתנה" },
          body: {
            en: `Rotation about the $y$-axis, so slice perpendicular to $y$ and integrate $dy$, from $y=0$ to $y=${q}$.`,
            he: `הסיבוב סביב ציר ה-$y$, ולכן חותכים בניצב ל-$y$ ומאנטגרלים לפי $dy$, מ-$y=0$ עד $y=${q}$.`,
          },
        },
        {
          move: 1,
          title: { en: "Square the radius", he: "העלאת הרדיוס בריבוע" },
          body: {
            en: `The radius of each disc is $x$, and from $y=x^2$ we get $$x^2=y$$ — no inversion needed, the square is already what we want.`,
            he: `הרדיוס של כל דיסקה הוא $x$, ומתוך $y=x^2$ מתקבל $$x^2=y$$ — אין צורך בהיפוך, הריבוע הוא בדיוק מה שדרוש.`,
          },
        },
        {
          move: 3,
          title: { en: "Integrate", he: "אינטגרציה" },
          body: {
            en: `$$V=\\pi\\int_{0}^{${q}}y\\,dy=\\pi\\left[\\frac{y^2}{2}\\right]_{0}^{${q}}=${volLatex}.$$`,
            he: `$$V=\\pi\\int_{0}^{${q}}y\\,dy=\\pi\\left[\\frac{y^2}{2}\\right]_{0}^{${q}}=${volLatex}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "integral",
          label: "numeric disc integral in y matches the closed form",
          terms: [{ expr: "y", variable: "y", from: "0", to: String(q) }],
          expected: fracPlain(volNum, 2),
        },
      ],
    };
  },
};
