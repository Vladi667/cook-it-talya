import type { Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import type { Figure } from "../types";

/**
 * Extremal word problems. Two families, both engineered so the critical point
 * and the optimal value are whole numbers:
 *
 *  box:      an open box folded from a square sheet of side 6m, cutting x from
 *            each corner. V = x(6m-2x)^2, V' = (6m-2x)(6m-6x) -> x = m, V = 16m^3.
 *  parabola: the largest rectangle under y = 3bk^2 - bx^2 with its base on the
 *            x-axis. A = 2x(3bk^2 - bx^2), A' = 6bk^2 - 6bx^2 -> x = k,
 *            giving a 2k by 2bk^2 rectangle of area 4bk^3.
 */
interface Config {
  kind: "box" | "parabola";
  m: number; // box: sheet side = 6m
  b: number; // parabola: vertical scale
  k: number; // parabola: half-width at the optimum
}

function draw(rng: Rng): Config | null {
  if (rng.next() < 0.5) {
    return { kind: "box", m: rng.int(1, 8), b: 0, k: 0 };
  }
  return { kind: "parabola", m: 0, b: rng.int(1, 4), k: rng.int(1, 5) };
}

export const optimization: TemplateDef = {
  id: "optimization",
  topic: "calculus",
  name: { en: "Extremal problems", he: "בעיות קיצון" },
  blurb: {
    en: "Name the variable, build the quantity, differentiate, check the domain.",
    he: "בחירת משתנה, בניית הביטוי, גזירה, ובדיקת התחום.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    if (cfg.kind === "box") {
      const { m } = cfg;
      const a = 6 * m; // sheet side
      const x = m; // cut size at the optimum
      const base = a - 2 * x; // = 4m
      const V = x * base * base; // = 16 m^3

      return {
        id: `optimization-box-${rng.int(0, 1e9)}`,
        templateId: "optimization",
        seed: 0,
        difficulty: 3,
        title: { en: "Largest open box", he: "תיבה פתוחה בנפח מרבי" },
        statement: {
          en:
            `An open box is folded from a square sheet of card of side $${a}\\ \\text{cm}$ ` +
            `by cutting a square of side $x$ from each corner and turning up the sides. ` +
            `Find the value of $x$ that maximises the volume, and that maximum volume.`,
          he:
            `תיבה פתוחה מקופלת מגיליון קרטון ריבועי שאורך צלעו $${a}\\ \\text{ס״מ}$ ` +
            `על ידי גזירת ריבוע שאורך צלעו $x$ מכל פינה וקיפול הדפנות כלפי מעלה. ` +
            `מצאו את הערך של $x$ שעבורו הנפח מרבי, ואת הנפח המרבי.`,
        },
        params: { kind: "box", a, x, V },
        fields: [
          {
            id: "x",
            type: "number",
            label: "x =",
            expected: String(x),
            placeholder: "e.g. 2",
            prompt: { en: "Cut size $x$ (cm)", he: "אורך הגזירה $x$ (ס״מ)" },
            pitfalls: [
              {
                value: String(3 * m),
                why: {
                  en: `$V'(x)=(${a}-2x)(${a}-6x)$ has two roots. The root $x=${3 * m}$ comes from $${a}-2x=0$, where the base has shrunk to nothing and the volume is **zero** — it is the minimum, not the maximum. The one you want is $${a}-6x=0$.`,
                  he: `לנגזרת $V'(x)=(${a}-2x)(${a}-6x)$ יש שני שורשים. השורש $x=${3 * m}$ מגיע מ-$${a}-2x=0$, שם הבסיס מתאפס והנפח **אפס** — זהו המינימום ולא המקסימום. הדרוש הוא $${a}-6x=0$.`,
                },
              },
            ],
          },
          {
            id: "V",
            type: "number",
            label: "V =",
            expected: String(V),
            placeholder: "e.g. 128",
            prompt: {
              en: "Maximum volume (cm³)",
              he: "הנפח המרבי (סמ״ק)",
            },
            // For m = 1 the base area happens to equal the volume, so there
            // would be nothing to catch.
            pitfalls: base * base === V ? [] : [
              {
                value: String(base * base),
                why: {
                  en: `That is the **area** of the base, $\\left(${a}-2x\\right)^2$. The volume still needs the height, which is the cut $x=${x}$.`,
                  he: `זהו **שטח** הבסיס, $\\left(${a}-2x\\right)^2$. לנפח חסר עדיין הגובה, שהוא הגזירה $x=${x}$.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "Draw the flat sheet with the four corner squares removed. What are the three dimensions of the folded box, in terms of $x$?",
            he: "שרטטו את הגיליון השטוח ללא ארבעת ריבועי הפינות. מהם שלושת מימדי התיבה המקופלת, במונחי $x$?",
          },
          {
            en: `The height is $x$ and the base is a square of side $${a}-2x$, so $V(x)=x\\left(${a}-2x\\right)^2$. The domain is $0<x<${a / 2}$, since the base must be positive.`,
            he: `הגובה הוא $x$ והבסיס ריבוע שצלעו $${a}-2x$, ולכן $V(x)=x\\left(${a}-2x\\right)^2$. התחום הוא $0<x<${a / 2}$, שכן הבסיס חייב להיות חיובי.`,
          },
          {
            en: `Differentiate as a product and take out the common factor: $V'(x)=\\left(${a}-2x\\right)\\left(${a}-6x\\right)$. Only one of the two roots lies strictly inside the domain and gives a positive volume.`,
            he: `גזרו כמכפלה והוציאו גורם משותף: $V'(x)=\\left(${a}-2x\\right)\\left(${a}-6x\\right)$. רק אחד משני השורשים נמצא ממש בתוך התחום ונותן נפח חיובי.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Variable and domain", he: "משתנה ותחום" },
            body: {
              en: `Let $x$ be the side of the corner square. Cutting $x$ from both ends of each side leaves a base of side $${a}-2x$, so we need $${a}-2x>0$ and $x>0$: the domain is $$0<x<${a / 2}.$$`,
              he: `נסמן ב-$x$ את צלע ריבוע הפינה. גזירת $x$ משני קצוות כל צלע משאירה בסיס שצלעו $${a}-2x$, ולכן נדרש $${a}-2x>0$ וגם $x>0$: התחום הוא $$0<x<${a / 2}.$$`,
            },
          },
          {
            move: 1,
            title: { en: "Volume as one function of $x$", he: "הנפח כפונקציה של $x$" },
            body: {
              en: `The folded height is $x$ and the base is square: $$V(x)=x\\left(${a}-2x\\right)^2 = 4x^3 - ${4 * a}x^2 + ${a * a}x.$$`,
              he: `הגובה לאחר הקיפול הוא $x$ והבסיס ריבועי: $$V(x)=x\\left(${a}-2x\\right)^2 = 4x^3 - ${4 * a}x^2 + ${a * a}x.$$`,
            },
          },
          {
            move: 2,
            title: { en: "Differentiate and solve", he: "גזירה ופתרון" },
            body: {
              en: `$$V'(x)=12x^2-${8 * a}x+${a * a}=\\left(${a}-2x\\right)\\left(${a}-6x\\right)=0 \\;\\Rightarrow\\; x=${3 * m}\\ \\text{or}\\ x=${x}.$$`,
              he: `$$V'(x)=12x^2-${8 * a}x+${a * a}=\\left(${a}-2x\\right)\\left(${a}-6x\\right)=0 \\;\\Rightarrow\\; x=${3 * m}\\ \\text{או}\\ x=${x}.$$`,
            },
          },
          {
            move: 3,
            title: { en: "Which root is the maximum?", he: "איזה שורש הוא המקסימום?" },
            body: {
              en: `$x=${3 * m}$ sits at the edge of the domain, where the base vanishes and $V=0$. At $x=${x}$ the derivative changes from positive to negative, so it is a maximum.`,
              he: `הערך $x=${3 * m}$ נמצא בקצה התחום, שם הבסיס מתאפס ו-$V=0$. ב-$x=${x}$ הנגזרת עוברת מחיובית לשלילית, ולכן זהו מקסימום.`,
            },
          },
          {
            move: 4,
            title: { en: "Answer the question asked", he: "מענה על השאלה שנשאלה" },
            body: {
              en: `$$V(${x})=${x}\\cdot\\left(${a}-${2 * x}\\right)^2=${x}\\cdot${base}^2=${V}\\ \\text{cm}^3.$$`,
              he: `$$V(${x})=${x}\\cdot\\left(${a}-${2 * x}\\right)^2=${x}\\cdot${base}^2=${V}\\ \\text{סמ״ק}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "derivative",
            label: "V'(x) vanishes at the claimed optimum",
            expr: `x*(${a}-2*x)^2`,
            variable: "x",
            at: String(x),
            expected: "0",
          },
          {
            kind: "derivative",
            label: "it is a maximum (V'' < 0)",
            expr: `x*(${a}-2*x)^2`,
            variable: "x",
            at: String(x),
            order: 2,
            expected: String(24 * x - 8 * a),
          },
          {
            kind: "numeric",
            label: "the maximum volume matches",
            expr: `${x}*(${a}-2*${x})^2`,
            expected: String(V),
          },
          {
            kind: "numeric",
            label: "the optimum beats a nearby interior point",
            expr: `${V}-(${x + 1})*(${a}-2*(${x + 1}))^2`,
            expected: "positive",
          },
        ],
      };
    }

    // parabola family
    const { b, k } = cfg;
    const c = 3 * b * k * k; // y = c - b x^2
    const halfWidth = k;
    const height = 2 * b * k * k;
    const area = 4 * b * k ** 3;
    const root = Math.sqrt(c / b); // x-intercept = k*sqrt(3)

    const figure: Figure = {
      xRange: [-root * 1.15, root * 1.15],
      yRange: [0, c * 1.1],
      curves: [
        {
          points: Array.from({ length: 61 }, (_, i) => {
            const xx = -root + (2 * root * i) / 60;
            return [
              Math.round(xx * 1000) / 1000,
              Math.round((c - b * xx * xx) * 1000) / 1000,
            ] as [number, number];
          }),
          label: "y=c−bx²",
        },
      ],
      shade: [
        [-halfWidth, 0],
        [-halfWidth, height],
        [halfWidth, height],
        [halfWidth, 0],
      ],
      marks: [{ x: halfWidth, y: height, label: `(${halfWidth}, ${height})` }],
    };

    return {
      id: `optimization-parabola-${rng.int(0, 1e9)}`,
      templateId: "optimization",
      seed: 0,
      difficulty: 3,
      title: { en: "Largest inscribed rectangle", he: "מלבן חסום בשטח מרבי" },
      statement: {
        en:
          `A rectangle has its base on the $x$-axis and its two upper vertices on the parabola ` +
          `$$y = ${c} - ${b === 1 ? "" : b}x^2.$$ ` +
          `Find the dimensions of the rectangle of largest area, and that largest area.`,
        he:
          `בסיסו של מלבן מונח על ציר ה-$x$ ושני קודקודיו העליונים נמצאים על הפרבולה ` +
          `$$y = ${c} - ${b === 1 ? "" : b}x^2.$$ ` +
          `מצאו את מידות המלבן ששטחו מרבי, ואת השטח המרבי.`,
      },
      params: { kind: "parabola", b, k, c, area },
      figure,
      fields: [
        {
          id: "x",
          type: "number",
          label: "x =",
          expected: String(halfWidth),
          placeholder: "e.g. 2",
          prompt: {
            en: "The $x$ of the upper-right vertex",
            he: "שיעור ה-$x$ של הקודקוד הימני העליון",
          },
        },
        {
          id: "dims",
          type: "point",
          placeholder: "(width, height)",
          expected: `(${2 * halfWidth},${height})`,
          prompt: {
            en: "Dimensions (width, height)",
            he: "מידות (רוחב, גובה)",
          },
          pitfalls: [
            {
              value: `(${halfWidth},${height})`,
              why: {
                en: `The rectangle is symmetric about the $y$-axis, so its width is $2x = ${2 * halfWidth}$, not $x$. This is the single most common slip in this question type.`,
                he: `המלבן סימטרי ביחס לציר ה-$y$, ולכן רוחבו $2x = ${2 * halfWidth}$ ולא $x$. זו הטעות הנפוצה ביותר בשאלות מסוג זה.`,
              },
            },
          ],
        },
        {
          id: "area",
          type: "number",
          label: "S =",
          expected: String(area),
          placeholder: "e.g. 32",
          prompt: { en: "Maximum area", he: "השטח המרבי" },
          pitfalls: [
            {
              value: String(halfWidth * height),
              why: {
                en: `You used $x$ as the width instead of $2x$. The area is $2x\\cdot y = ${2 * halfWidth}\\cdot${height}=${area}$.`,
                he: `השתמשתם ב-$x$ כרוחב במקום ב-$2x$. השטח הוא $2x\\cdot y = ${2 * halfWidth}\\cdot${height}=${area}$.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: "Sketch it. If the upper-right vertex is $(x, y)$, symmetry about the $y$-axis fixes the whole rectangle — and note how wide it really is.",
          he: "שרטטו. אם הקודקוד הימני העליון הוא $(x, y)$, הסימטריה ביחס לציר ה-$y$ קובעת את כל המלבן — ושימו לב מה רוחבו באמת.",
        },
        {
          en: `The vertex lies on the parabola, so its height is $y = ${c} - ${b === 1 ? "" : b}x^2$ and the width is $2x$. That makes the area a single function of $x$.`,
          he: `הקודקוד נמצא על הפרבולה, ולכן גובהו $y = ${c} - ${b === 1 ? "" : b}x^2$ והרוחב $2x$. כך השטח הופך לפונקציה של $x$ בלבד.`,
        },
        {
          en: `$S(x)=2x\\left(${c}-${b === 1 ? "" : b}x^2\\right)$ on $0<x<${Number(root.toFixed(3))}$. Differentiate and set to zero.`,
          he: `$S(x)=2x\\left(${c}-${b === 1 ? "" : b}x^2\\right)$ בתחום $0<x<${Number(root.toFixed(3))}$. גזרו והשוו לאפס.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Variable and domain", he: "משתנה ותחום" },
          body: {
            en: `Let $(x,y)$ be the upper-right vertex, $x>0$. It must lie above the axis and on the parabola, so $x$ runs between $0$ and the positive root of $${c}-${b === 1 ? "" : b}x^2=0$.`,
            he: `נסמן ב-$(x,y)$ את הקודקוד הימני העליון, $x>0$. עליו להיות מעל הציר ועל הפרבולה, ולכן $x$ נע בין $0$ לשורש החיובי של $${c}-${b === 1 ? "" : b}x^2=0$.`,
          },
        },
        {
          move: 1,
          title: { en: "Area as one function of $x$", he: "השטח כפונקציה של $x$" },
          body: {
            en: `By symmetry the width is $2x$ and the height is $y$: $$S(x)=2x\\left(${c}-${b === 1 ? "" : b}x^2\\right)=${2 * c}x-${2 * b}x^3.$$`,
            he: `מסימטריה הרוחב הוא $2x$ והגובה $y$: $$S(x)=2x\\left(${c}-${b === 1 ? "" : b}x^2\\right)=${2 * c}x-${2 * b}x^3.$$`,
          },
        },
        {
          move: 2,
          title: { en: "Differentiate and solve", he: "גזירה ופתרון" },
          body: {
            en: `$$S'(x)=${2 * c}-${6 * b}x^2=0 \\;\\Rightarrow\\; x^2=${k * k} \\;\\Rightarrow\\; x=${halfWidth}$$ (the negative root is outside the domain).`,
            he: `$$S'(x)=${2 * c}-${6 * b}x^2=0 \\;\\Rightarrow\\; x^2=${k * k} \\;\\Rightarrow\\; x=${halfWidth}$$ (השורש השלילי מחוץ לתחום).`,
          },
        },
        {
          move: 3,
          title: { en: "Confirm it is a maximum", he: "אישור שזהו מקסימום" },
          body: {
            en: `$S''(x)=-${12 * b}x$, which is negative for $x>0$. So $x=${halfWidth}$ is a maximum.`,
            he: `$S''(x)=-${12 * b}x$, שלילית עבור $x>0$. לכן $x=${halfWidth}$ הוא מקסימום.`,
          },
        },
        {
          move: 4,
          title: { en: "Answer the question asked", he: "מענה על השאלה שנשאלה" },
          body: {
            en: `Height $y=${c}-${b === 1 ? "" : b}\\cdot${k * k}=${height}$, width $2x=${2 * halfWidth}$, so the rectangle is $${2 * halfWidth}\\times${height}$ with area $$S=${area}.$$`,
            he: `הגובה $y=${c}-${b === 1 ? "" : b}\\cdot${k * k}=${height}$, הרוחב $2x=${2 * halfWidth}$, ולכן המלבן הוא $${2 * halfWidth}\\times${height}$ ושטחו $$S=${area}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "derivative",
          label: "S'(x) vanishes at the claimed optimum",
          expr: `2*x*(${c}-${b}*x^2)`,
          variable: "x",
          at: String(halfWidth),
          expected: "0",
        },
        {
          kind: "derivative",
          label: "it is a maximum (S'' < 0)",
          expr: `2*x*(${c}-${b}*x^2)`,
          variable: "x",
          at: String(halfWidth),
          order: 2,
          expected: String(-12 * b * halfWidth),
        },
        {
          kind: "numeric",
          label: "the vertex lies on the parabola",
          expr: `${c}-${b}*${halfWidth}^2`,
          expected: String(height),
        },
        {
          kind: "numeric",
          label: "the maximum area matches",
          expr: `2*${halfWidth}*${height}`,
          expected: String(area),
        },
        {
          kind: "numeric",
          label: "the optimum beats a nearby interior point",
          expr: `${area}-2*(${halfWidth + 0.5})*(${c}-${b}*(${halfWidth + 0.5})^2)`,
          expected: "positive",
        },
      ],
    };
  },
};
