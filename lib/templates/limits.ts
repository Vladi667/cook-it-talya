import type { Pitfall, Problem, Rng, SolutionStep, TemplateDef, Text } from "../types";
import { fracLatex, fracPlain } from "./util";

/** The classic error on every a/b family: reading the ratio upside down. */
function invertedRatio(a: number, b: number): Pitfall[] {
  // a/b and b/a coincide when |a| = |b|, so there would be nothing to catch.
  if (Math.abs(a) === Math.abs(b) || a === 0 || b === 0) return [];
  return [
    {
      value: fracPlain(b, a),
      id: "limit-ratio-inverted",
      why: {
        en: `The ratio is upside down. The coefficient from the **numerator** goes on top: the numerator contributes $${a}$ and the denominator $${b}$, so the limit is $${fracLatex(a, b)}$.`,
        he: `היחס הפוך. המקדם מה**מונה** נמצא למעלה: המונה תורם $${a}$ והמכנה $${b}$, ולכן הגבול הוא $${fracLatex(a, b)}$.`,
      },
    },
  ];
}

/**
 * Limits that need simplification before substitution: log rules,
 * e^ln cancellation, the standard e-limit, and L'Hopital as the fallback.
 * Every family has a closed-form answer, so nothing is ever approximated.
 */
interface Family {
  key: string;
  /** LaTeX of the expression under the limit. */
  latex: (p: number[]) => string;
  /** nerdamer form, for the numeric limit check. */
  plain: (p: number[]) => string;
  /** Where x goes: "0" | "1" | "e" | "inf". */
  to: string;
  toLatex: string;
  answerPlain: (p: number[]) => string;
  answerLatex: (p: number[]) => string;
  sample: (rng: Rng) => number[];
  steps: (p: number[]) => SolutionStep[];
  hints: (p: number[]) => [Text, Text, Text];
  pitfalls?: (p: number[]) => Pitfall[];
}

const FAMILIES: Family[] = [
  {
    key: "exp-over-sin",
    to: "0",
    toLatex: "x \\to 0",
    sample: (r) => [r.nonZeroInt(-5, 6), r.nonZeroInt(-5, 6)],
    latex: ([a, b]) => `\\frac{e^{${a}x}-1}{\\sin(${b}x)}`,
    plain: ([a, b]) => `(e^(${a}*x)-1)/sin(${b}*x)`,
    answerPlain: ([a, b]) => fracPlain(a, b),
    answerLatex: ([a, b]) => fracLatex(a, b),
    pitfalls: ([a, b]) => invertedRatio(a, b),
    steps: ([a, b]) => [
      {
        move: 0,
        title: { en: "Try substitution", he: "ניסיון הצבה" },
        body: {
          en: `Substituting $x=0$ gives $\\frac{e^{0}-1}{\\sin 0}=\\frac{0}{0}$ — an indeterminate form, so substitution alone is not enough.`,
          he: `הצבת $x=0$ נותנת $\\frac{e^{0}-1}{\\sin 0}=\\frac{0}{0}$ — צורה לא מוגדרת, ולכן הצבה בלבד אינה מספיקה.`,
        },
      },
      {
        move: 3,
        title: { en: "Use the standard limits", he: "שימוש בגבולות היסודיים" },
        body: {
          en: `Write it so the two standard limits $\\lim_{t\\to0}\\frac{e^{t}-1}{t}=1$ and $\\lim_{t\\to0}\\frac{\\sin t}{t}=1$ appear: $$\\frac{e^{${a}x}-1}{\\sin(${b}x)}=\\frac{e^{${a}x}-1}{${a}x}\\cdot\\frac{${b}x}{\\sin(${b}x)}\\cdot\\frac{${a}}{${b}}.$$`,
          he: `נכתוב כך ששני הגבולות היסודיים $\\lim_{t\\to0}\\frac{e^{t}-1}{t}=1$ ו-$\\lim_{t\\to0}\\frac{\\sin t}{t}=1$ יופיעו: $$\\frac{e^{${a}x}-1}{\\sin(${b}x)}=\\frac{e^{${a}x}-1}{${a}x}\\cdot\\frac{${b}x}{\\sin(${b}x)}\\cdot\\frac{${a}}{${b}}.$$`,
        },
      },
      {
        move: 3,
        title: { en: "Take the limit", he: "חישוב הגבול" },
        body: {
          en: `The first two factors tend to $1$, so the limit is $$${fracLatex(a, b)}.$$ (L'Hopital gives the same in one line: $\\frac{${a}e^{${a}x}}{${b}\\cos(${b}x)}\\to${fracLatex(a, b)}$.)`,
          he: `שני הגורמים הראשונים שואפים ל-$1$, ולכן הגבול הוא $$${fracLatex(a, b)}.$$ (כלל לופיטל נותן את אותו הדבר: $\\frac{${a}e^{${a}x}}{${b}\\cos(${b}x)}\\to${fracLatex(a, b)}$.)`,
        },
      },
    ],
    hints: ([a, b]) => [
      {
        en: "Substituting straight away gives $\\frac{0}{0}$. What standard limits do you know for $e^t-1$ and $\\sin t$ near $0$?",
        he: "הצבה ישירה נותנת $\\frac{0}{0}$. אילו גבולות יסודיים אתם מכירים עבור $e^t-1$ ו-$\\sin t$ ליד $0$?",
      },
      {
        en: "Both $\\frac{e^{t}-1}{t}$ and $\\frac{\\sin t}{t}$ tend to $1$. Multiply and divide to build them.",
        he: "גם $\\frac{e^{t}-1}{t}$ וגם $\\frac{\\sin t}{t}$ שואפים ל-$1$. הכפילו וחלקו כדי לבנות אותם.",
      },
      {
        en: `Multiply and divide by $${a}x$ and by $${b}x$; everything except $\\frac{${a}}{${b}}$ tends to $1$.`,
        he: `הכפילו וחלקו ב-$${a}x$ וב-$${b}x$; כל הגורמים פרט ל-$\\frac{${a}}{${b}}$ שואפים ל-$1$.`,
      },
    ],
  },

  {
    key: "log-over-exp",
    to: "0",
    toLatex: "x \\to 0",
    sample: (r) => [r.nonZeroInt(-4, 6), r.nonZeroInt(-4, 6)],
    latex: ([a, b]) => `\\frac{\\ln(1+${a}x)}{e^{${b}x}-1}`,
    plain: ([a, b]) => `log(1+${a}*x)/(e^(${b}*x)-1)`,
    answerPlain: ([a, b]) => fracPlain(a, b),
    answerLatex: ([a, b]) => fracLatex(a, b),
    pitfalls: ([a, b]) => invertedRatio(a, b),
    steps: ([a, b]) => [
      {
        move: 1,
        title: { en: "Classify the form", he: "זיהוי הצורה" },
        body: {
          en: `At $x=0$: $\\ln(1)=0$ and $e^{0}-1=0$, so this is $\\frac{0}{0}$.`,
          he: `ב-$x=0$: $\\ln(1)=0$ וגם $e^{0}-1=0$, כלומר צורה $\\frac{0}{0}$.`,
        },
      },
      {
        move: 3,
        title: { en: "Rebuild the standard limits", he: "בניית הגבולות היסודיים" },
        body: {
          en: `$$\\frac{\\ln(1+${a}x)}{e^{${b}x}-1}=\\frac{\\ln(1+${a}x)}{${a}x}\\cdot\\frac{${b}x}{e^{${b}x}-1}\\cdot\\frac{${a}}{${b}},$$ using $\\lim_{t\\to0}\\frac{\\ln(1+t)}{t}=1$ and $\\lim_{t\\to0}\\frac{e^{t}-1}{t}=1$.`,
          he: `$$\\frac{\\ln(1+${a}x)}{e^{${b}x}-1}=\\frac{\\ln(1+${a}x)}{${a}x}\\cdot\\frac{${b}x}{e^{${b}x}-1}\\cdot\\frac{${a}}{${b}},$$ תוך שימוש ב-$\\lim_{t\\to0}\\frac{\\ln(1+t)}{t}=1$ וב-$\\lim_{t\\to0}\\frac{e^{t}-1}{t}=1$.`,
        },
      },
      {
        move: 3,
        title: { en: "Result", he: "תוצאה" },
        body: {
          en: `The limit equals $$${fracLatex(a, b)}.$$`,
          he: `הגבול שווה ל-$$${fracLatex(a, b)}.$$`,
        },
      },
    ],
    hints: ([a, b]) => [
      {
        en: "Direct substitution gives $\\frac{0}{0}$.",
        he: "הצבה ישירה נותנת $\\frac{0}{0}$.",
      },
      {
        en: "Near zero, $\\ln(1+t)\\approx t$ and $e^{t}-1\\approx t$. Make both ratios explicit.",
        he: "ליד אפס מתקיים $\\ln(1+t)\\approx t$ וגם $e^{t}-1\\approx t$. בנו במפורש את שני היחסים.",
      },
      {
        en: `Multiply and divide by $${a}x$ and $${b}x$; what is left is $\\frac{${a}}{${b}}$.`,
        he: `הכפילו וחלקו ב-$${a}x$ וב-$${b}x$; מה שנשאר הוא $\\frac{${a}}{${b}}$.`,
      },
    ],
  },

  {
    key: "e-limit",
    to: "inf",
    toLatex: "x \\to \\infty",
    sample: (r) => [r.nonZeroInt(-4, 5), r.int(1, 4)],
    latex: ([a, b]) => `\\left(1+\\frac{${a}}{x}\\right)^{${b}x}`,
    plain: ([a, b]) => `(1+${a}/x)^(${b}*x)`,
    answerPlain: ([a, b]) => (a * b === 0 ? "1" : `e^(${a * b})`),
    answerLatex: ([a, b]) => (a * b === 1 ? "e" : `e^{${a * b}}`),
    pitfalls: ([a, b]) =>
      a + b === a * b
        ? []
        : [
            {
              value: `e^(${a + b})`,
              id: "limit-exponents-added",
              why: {
                en: `The exponents **multiply**, they do not add. Substituting $t=\\frac{x}{${a}}$ turns the power $${b}x$ into $${a}\\cdot${b}\\cdot t$, so the answer is $e^{${a * b}}$.`,
                he: `המעריכים **מוכפלים** ולא מתחברים. ההצבה $t=\\frac{x}{${a}}$ הופכת את החזקה $${b}x$ ל-$${a}\\cdot${b}\\cdot t$, ולכן התשובה היא $e^{${a * b}}$.`,
              },
            },
          ],
    steps: ([a, b]) => [
      {
        move: 1,
        title: { en: "Recognise the form", he: "זיהוי הצורה" },
        body: {
          en: `The base tends to $1$ and the exponent to $\\infty$: the indeterminate form $1^{\\infty}$, which is exactly the $e$-limit pattern $\\lim_{t\\to\\infty}\\left(1+\\frac{1}{t}\\right)^{t}=e$.`,
          he: `הבסיס שואף ל-$1$ והמעריך ל-$\\infty$: הצורה הלא מוגדרת $1^{\\infty}$, שהיא בדיוק תבנית הגבול $\\lim_{t\\to\\infty}\\left(1+\\frac{1}{t}\\right)^{t}=e$.`,
        },
      },
      {
        move: 3,
        title: { en: "Match the pattern", he: "התאמה לתבנית" },
        body: {
          en: `Substitute $t=\\frac{x}{${a}}$, so $$\\left(1+\\frac{${a}}{x}\\right)^{${b}x}=\\left[\\left(1+\\frac{1}{t}\\right)^{t}\\right]^{${a}\\cdot${b}}.$$`,
          he: `נציב $t=\\frac{x}{${a}}$, ולכן $$\\left(1+\\frac{${a}}{x}\\right)^{${b}x}=\\left[\\left(1+\\frac{1}{t}\\right)^{t}\\right]^{${a}\\cdot${b}}.$$`,
        },
      },
      {
        move: 3,
        title: { en: "Result", he: "תוצאה" },
        body: {
          en: `The bracket tends to $e$, so the limit is $$e^{${a}\\cdot${b}}=${a * b === 1 ? "e" : `e^{${a * b}}`}.$$`,
          he: `הביטוי בסוגריים שואף ל-$e$, ולכן הגבול הוא $$e^{${a}\\cdot${b}}=${a * b === 1 ? "e" : `e^{${a * b}}`}.$$`,
        },
      },
    ],
    hints: ([a, b]) => [
      {
        en: "The base goes to $1$ and the power goes to $\\infty$ — that is not $1$, it is an indeterminate form.",
        he: "הבסיס שואף ל-$1$ והחזקה ל-$\\infty$ — זה אינו $1$, אלא צורה לא מוגדרת.",
      },
      {
        en: "Reshape it into $\\left(1+\\frac{1}{t}\\right)^{t}$ raised to some power.",
        he: "עצבו מחדש לצורה $\\left(1+\\frac{1}{t}\\right)^{t}$ בחזקת משהו.",
      },
      {
        en: `With $t=\\frac{x}{${a}}$ the exponent becomes $${a}\\cdot${b}\\cdot t$, so the answer is $e^{${a * b}}$.`,
        he: `עם $t=\\frac{x}{${a}}$ המעריך הופך ל-$${a}\\cdot${b}\\cdot t$, ולכן התשובה היא $e^{${a * b}}$.`,
      },
    ],
  },

  {
    key: "one-minus-cos",
    to: "0",
    toLatex: "x \\to 0",
    sample: (r) => [r.int(1, 5), r.nonZeroInt(-4, 5)],
    latex: ([a, b]) => `\\frac{1-\\cos(${a}x)}{${b}x^{2}}`,
    plain: ([a, b]) => `(1-cos(${a}*x))/(${b}*x^2)`,
    answerPlain: ([a, b]) => fracPlain(a * a, 2 * b),
    answerLatex: ([a, b]) => fracLatex(a * a, 2 * b),
    pitfalls: ([a, b]) => [
      {
        value: fracPlain(a * a, b),
        id: "limit-lost-half",
        why: {
          en: `You lost the factor $\\frac{1}{2}$. The identity is $1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$, and the half-angle squares to $\\frac{${a}^2}{4}$ — combining the $2$ and the $\\frac{1}{4}$ leaves $\\frac{${a}^2}{2\\cdot${b}}$.`,
          he: `איבדתם את הגורם $\\frac{1}{2}$. הזהות היא $1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$, וחצי הזווית בריבוע נותן $\\frac{${a}^2}{4}$ — שילוב ה-$2$ עם ה-$\\frac{1}{4}$ משאיר $\\frac{${a}^2}{2\\cdot${b}}$.`,
        },
      },
    ],
    steps: ([a, b]) => [
      {
        move: 1,
        title: { en: "Classify", he: "זיהוי" },
        body: {
          en: `Substitution gives $\\frac{0}{0}$.`,
          he: `הצבה נותנת $\\frac{0}{0}$.`,
        },
      },
      {
        move: 2,
        title: { en: "Half-angle identity", he: "זהות חצי הזווית" },
        body: {
          en: `Use $1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$: $$\\frac{2\\sin^{2}\\left(\\frac{${a}x}{2}\\right)}{${b}x^{2}} = \\frac{2}{${b}}\\left(\\frac{\\sin\\left(\\frac{${a}x}{2}\\right)}{\\frac{${a}x}{2}}\\right)^{2}\\cdot\\frac{${a}^{2}}{4}.$$`,
          he: `נשתמש בזהות $1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$: $$\\frac{2\\sin^{2}\\left(\\frac{${a}x}{2}\\right)}{${b}x^{2}} = \\frac{2}{${b}}\\left(\\frac{\\sin\\left(\\frac{${a}x}{2}\\right)}{\\frac{${a}x}{2}}\\right)^{2}\\cdot\\frac{${a}^{2}}{4}.$$`,
        },
      },
      {
        move: 3,
        title: { en: "Result", he: "תוצאה" },
        body: {
          en: `The squared ratio tends to $1$, leaving $$\\frac{${a}^{2}}{2\\cdot${b}}=${fracLatex(a * a, 2 * b)}.$$`,
          he: `היחס בריבוע שואף ל-$1$, ונשאר $$\\frac{${a}^{2}}{2\\cdot${b}}=${fracLatex(a * a, 2 * b)}.$$`,
        },
      },
    ],
    hints: ([a]) => [
      {
        en: "$\\frac{0}{0}$ again — but there is a trig identity that turns $1-\\cos$ into a square.",
        he: "שוב $\\frac{0}{0}$ — אך קיימת זהות טריגונומטרית שהופכת את $1-\\cos$ לריבוע.",
      },
      {
        en: "$1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$, and $\\frac{\\sin t}{t}\\to1$.",
        he: "$1-\\cos\\theta = 2\\sin^{2}\\frac{\\theta}{2}$, וגם $\\frac{\\sin t}{t}\\to1$.",
      },
      {
        en: `With $\\theta=${a}x$ you get $2\\sin^{2}\\left(\\frac{${a}x}{2}\\right)$ on top; divide and multiply by $\\left(\\frac{${a}x}{2}\\right)^{2}$.`,
        he: `עם $\\theta=${a}x$ מתקבל במונה $2\\sin^{2}\\left(\\frac{${a}x}{2}\\right)$; חלקו והכפילו ב-$\\left(\\frac{${a}x}{2}\\right)^{2}$.`,
      },
    ],
  },

  {
    key: "log-at-e",
    to: "e",
    toLatex: "x \\to e",
    sample: (r) => [r.nonZeroInt(-5, 6)],
    latex: ([a]) => `\\frac{${a === 1 ? "" : a}\\ln x - ${a}}{x-e}`,
    plain: ([a]) => `(${a}*log(x)-${a})/(x-e)`,
    answerPlain: ([a]) => `${a}/e`,
    answerLatex: ([a]) => (a === 1 ? "\\frac{1}{e}" : `\\frac{${a}}{e}`),
    pitfalls: ([a]) => [
      {
        value: `${a}*e`,
        id: "limit-e-in-numerator",
        why: {
          en: `The derivative of $\\ln x$ is $\\frac{1}{x}$, not $x$. Evaluated at $x=e$ that is $\\frac{1}{e}$, so the limit is $\\frac{${a}}{e}$ — the $e$ belongs in the denominator.`,
          he: `הנגזרת של $\\ln x$ היא $\\frac{1}{x}$ ולא $x$. בהצבה $x=e$ מתקבל $\\frac{1}{e}$, ולכן הגבול הוא $\\frac{${a}}{e}$ — ה-$e$ שייך למכנה.`,
        },
      },
    ],
    steps: ([a]) => [
      {
        move: 1,
        title: { en: "Classify", he: "זיהוי" },
        body: {
          en: `At $x=e$: $\\ln e = 1$, so the numerator is $${a}-${a}=0$ and the denominator is $0$. Indeterminate $\\frac{0}{0}$.`,
          he: `ב-$x=e$: $\\ln e = 1$, ולכן המונה הוא $${a}-${a}=0$ והמכנה $0$. צורה לא מוגדרת $\\frac{0}{0}$.`,
        },
      },
      {
        move: 3,
        title: { en: "Recognise a derivative", he: "זיהוי נגזרת" },
        body: {
          en: `Factor $${a}$ out: $$${a}\\cdot\\frac{\\ln x-\\ln e}{x-e},$$ which is exactly the definition of the derivative of $\\ln x$ at $x=e$.`,
          he: `נוציא $${a}$ גורם משותף: $$${a}\\cdot\\frac{\\ln x-\\ln e}{x-e},$$ וזו בדיוק הגדרת הנגזרת של $\\ln x$ בנקודה $x=e$.`,
        },
      },
      {
        move: 3,
        title: { en: "Result", he: "תוצאה" },
        body: {
          en: `Since $(\\ln x)'=\\frac{1}{x}$, the value at $x=e$ is $\\frac{1}{e}$, so the limit is $$${a === 1 ? "\\frac{1}{e}" : `\\frac{${a}}{e}`}.$$`,
          he: `מכיוון ש-$(\\ln x)'=\\frac{1}{x}$, הערך ב-$x=e$ הוא $\\frac{1}{e}$, ולכן הגבול הוא $$${a === 1 ? "\\frac{1}{e}" : `\\frac{${a}}{e}`}.$$`,
        },
      },
    ],
    hints: ([a]) => [
      {
        en: "What is $\\ln e$? Check the form first.",
        he: "כמה זה $\\ln e$? בדקו קודם את הצורה.",
      },
      {
        en: "$\\frac{f(x)-f(e)}{x-e}$ as $x\\to e$ is a derivative in disguise.",
        he: "הביטוי $\\frac{f(x)-f(e)}{x-e}$ כאשר $x\\to e$ הוא נגזרת בתחפושת.",
      },
      {
        en: `Write the numerator as $${a}(\\ln x-\\ln e)$; the limit is $${a}\\cdot(\\ln x)'\\big|_{x=e}$.`,
        he: `כתבו את המונה כ-$${a}(\\ln x-\\ln e)$; הגבול הוא $${a}\\cdot(\\ln x)'\\big|_{x=e}$.`,
      },
    ],
  },

  {
    key: "log-difference",
    to: "inf",
    toLatex: "x \\to \\infty",
    sample: (r) => [r.int(1, 5), r.int(1, 6)],
    latex: ([a, b]) =>
      `${a === 1 ? "" : a}x\\left[\\ln(x+${b})-\\ln x\\right]`,
    plain: ([a, b]) => `${a}*x*(log(x+${b})-log(x))`,
    answerPlain: ([a, b]) => String(a * b),
    answerLatex: ([a, b]) => String(a * b),
    pitfalls: ([a, b]) =>
      a === 1
        ? []
        : [
            {
              value: String(b),
              id: "limit-dropped-coefficient",
              why: {
                en: `You dropped the outer coefficient. $\\ln\\left(1+\\frac{${b}}{x}\\right)^{x}\\to ${b}$ is right, but the whole expression is $${a}$ times that, giving $${a * b}$.`,
                he: `השמטתם את המקדם החיצוני. נכון ש-$\\ln\\left(1+\\frac{${b}}{x}\\right)^{x}\\to ${b}$, אך הביטוי כולו הוא פי $${a}$ מכך, ולכן $${a * b}$.`,
              },
            },
          ],
    steps: ([a, b]) => [
      {
        move: 2,
        title: { en: "Combine the logarithms", he: "איחוד הלוגריתמים" },
        body: {
          en: `$\\ln(x+${b})-\\ln x=\\ln\\frac{x+${b}}{x}=\\ln\\left(1+\\frac{${b}}{x}\\right)$, so the expression is $${a}x\\ln\\left(1+\\frac{${b}}{x}\\right)$ — the form $\\infty\\cdot 0$.`,
          he: `$\\ln(x+${b})-\\ln x=\\ln\\frac{x+${b}}{x}=\\ln\\left(1+\\frac{${b}}{x}\\right)$, ולכן הביטוי הוא $${a}x\\ln\\left(1+\\frac{${b}}{x}\\right)$ — הצורה $\\infty\\cdot 0$.`,
        },
      },
      {
        move: 3,
        title: { en: "Move the power inside", he: "הכנסת החזקה פנימה" },
        body: {
          en: `$${a}x\\ln\\left(1+\\frac{${b}}{x}\\right)=${a}\\ln\\left(1+\\frac{${b}}{x}\\right)^{x}$, and the inner expression tends to $e^{${b}}$.`,
          he: `$${a}x\\ln\\left(1+\\frac{${b}}{x}\\right)=${a}\\ln\\left(1+\\frac{${b}}{x}\\right)^{x}$, והביטוי הפנימי שואף ל-$e^{${b}}$.`,
        },
      },
      {
        move: 3,
        title: { en: "Result", he: "תוצאה" },
        body: {
          en: `$${a}\\ln e^{${b}}=${a}\\cdot${b}=${a * b}$, so the limit is $$${a * b}.$$`,
          he: `$${a}\\ln e^{${b}}=${a}\\cdot${b}=${a * b}$, ולכן הגבול הוא $$${a * b}.$$`,
        },
      },
    ],
    hints: ([, b]) => [
      {
        en: "A difference of logarithms is the logarithm of a quotient.",
        he: "הפרש לוגריתמים הוא לוגריתם של מנה.",
      },
      {
        en: "After combining you get $\\infty\\cdot 0$. Pull the $x$ inside the logarithm as a power.",
        he: "לאחר האיחוד מתקבלת הצורה $\\infty\\cdot 0$. הכניסו את $x$ ללוגריתם כחזקה.",
      },
      {
        en: `$\\left(1+\\frac{${b}}{x}\\right)^{x}\\to e^{${b}}$, and $\\ln e^{${b}}=${b}$.`,
        he: `$\\left(1+\\frac{${b}}{x}\\right)^{x}\\to e^{${b}}$, וגם $\\ln e^{${b}}=${b}$.`,
      },
    ],
  },

  {
    key: "log-power-at-one",
    to: "1",
    toLatex: "x \\to 1",
    sample: (r) => [r.int(1, 6), r.int(1, 5)],
    latex: ([a, b]) => `\\frac{\\ln\\left(x^{${a}}\\right)}{x^{${b}}-1}`,
    plain: ([a, b]) => `log(x^${a})/(x^${b}-1)`,
    answerPlain: ([a, b]) => fracPlain(a, b),
    answerLatex: ([a, b]) => fracLatex(a, b),
    pitfalls: ([a, b]) => invertedRatio(a, b),
    steps: ([a, b]) => [
      {
        move: 2,
        title: { en: "Simplify with log rules", he: "פישוט בעזרת חוקי לוגריתמים" },
        body: {
          en: `$\\ln\\left(x^{${a}}\\right)=${a}\\ln x$. At $x=1$ both numerator and denominator vanish, so the form is $\\frac{0}{0}$.`,
          he: `$\\ln\\left(x^{${a}}\\right)=${a}\\ln x$. ב-$x=1$ גם המונה וגם המכנה מתאפסים, ולכן הצורה היא $\\frac{0}{0}$.`,
        },
      },
      {
        move: 3,
        title: { en: "L'Hopital", he: "כלל לופיטל" },
        body: {
          en: `Differentiate top and bottom: $$\\frac{${a}/x}{${b}x^{${b - 1}}}=\\frac{${a}}{${b}x^{${b}}}.$$`,
          he: `נגזור מונה ומכנה: $$\\frac{${a}/x}{${b}x^{${b - 1}}}=\\frac{${a}}{${b}x^{${b}}}.$$`,
        },
      },
      {
        move: 0,
        title: { en: "Substitute", he: "הצבה" },
        body: {
          en: `Now $x=1$ is legal and gives $$${fracLatex(a, b)}.$$`,
          he: `כעת ההצבה $x=1$ חוקית ונותנת $$${fracLatex(a, b)}.$$`,
        },
      },
    ],
    hints: ([a]) => [
      {
        en: "First use a logarithm rule to pull the power down.",
        he: "השתמשו קודם בחוק לוגריתמים כדי להוריד את החזקה.",
      },
      {
        en: `$\\ln\\left(x^{${a}}\\right)=${a}\\ln x$; then check the form at $x=1$.`,
        he: `$\\ln\\left(x^{${a}}\\right)=${a}\\ln x$; לאחר מכן בדקו את הצורה ב-$x=1$.`,
      },
      {
        en: "It is $\\frac{0}{0}$, so L'Hopital applies: differentiate numerator and denominator separately.",
        he: "זו צורה $\\frac{0}{0}$, ולכן ניתן להפעיל את כלל לופיטל: גזרו בנפרד את המונה ואת המכנה.",
      },
    ],
  },

  {
    key: "e-ln-cancel",
    to: "0",
    toLatex: "x \\to 0",
    sample: (r) => [r.nonZeroInt(-5, 6), r.nonZeroInt(-4, 5)],
    latex: ([a, b]) => `\\frac{e^{\\ln(1+${a}x)}-1}{${b}x}`,
    plain: ([a, b]) => `(e^(log(1+${a}*x))-1)/(${b}*x)`,
    answerPlain: ([a, b]) => fracPlain(a, b),
    answerLatex: ([a, b]) => fracLatex(a, b),
    pitfalls: ([a, b]) => invertedRatio(a, b),
    steps: ([a, b]) => [
      {
        move: 2,
        title: { en: "Cancel $e$ against $\\ln$", he: "צמצום $e$ מול $\\ln$" },
        body: {
          en: `$e^{\\ln u}=u$ whenever $u>0$, so $e^{\\ln(1+${a}x)}=1+${a}x$ near $x=0$. No calculus needed yet.`,
          he: `מתקיים $e^{\\ln u}=u$ עבור $u>0$, ולכן $e^{\\ln(1+${a}x)}=1+${a}x$ בסביבת $x=0$. עדיין לא נדרש חשבון דיפרנציאלי.`,
        },
      },
      {
        move: 2,
        title: { en: "Simplify", he: "פישוט" },
        body: {
          en: `The expression collapses to $$\\frac{(1+${a}x)-1}{${b}x}=\\frac{${a}x}{${b}x}=${fracLatex(a, b)}$$ for every $x\\neq0$.`,
          he: `הביטוי מצטמצם ל-$$\\frac{(1+${a}x)-1}{${b}x}=\\frac{${a}x}{${b}x}=${fracLatex(a, b)}$$ עבור כל $x\\neq0$.`,
        },
      },
      {
        move: 0,
        title: { en: "Substitute", he: "הצבה" },
        body: {
          en: `The function is constant away from $0$, so the limit is $$${fracLatex(a, b)}.$$`,
          he: `הפונקציה קבועה מחוץ ל-$0$, ולכן הגבול הוא $$${fracLatex(a, b)}.$$`,
        },
      },
    ],
    hints: () => [
      {
        en: "Do not reach for L'Hopital — look at $e^{\\ln(\\ldots)}$ first.",
        he: "אל תמהרו לכלל לופיטל — הסתכלו קודם על $e^{\\ln(\\ldots)}$.",
      },
      {
        en: "$e$ and $\\ln$ are inverse functions: $e^{\\ln u}=u$.",
        he: "$e$ ו-$\\ln$ הן פונקציות הופכיות: $e^{\\ln u}=u$.",
      },
      {
        en: "After cancelling, the numerator is a linear expression and the whole fraction is constant.",
        he: "לאחר הצמצום המונה הוא ביטוי לינארי והשבר כולו קבוע.",
      },
    ],
  },
];

export const limits: TemplateDef = {
  id: "limits",
  topic: "calculus",
  name: { en: "Limits", he: "גבולות" },
  blurb: {
    en: "Simplify with log and exponent rules before substituting; L'Hopital as a fallback.",
    he: "פישוט בעזרת חוקי לוגריתמים וחזקות לפני הצבה; כלל לופיטל כמוצא אחרון.",
  },

  generate(rng: Rng): Problem {
    const family = rng.pick(FAMILIES);
    const p = family.sample(rng);

    const expr = family.latex(p);
    const answerPlain = family.answerPlain(p);
    const answerLatex = family.answerLatex(p);
    const display = `\\lim_{${family.toLatex}} ${expr}`;

    return {
      id: `limits-${family.key}-${rng.int(0, 1e9)}`,
      templateId: "limits",
      seed: 0,
      difficulty: 1,
      title: { en: "Evaluate the limit", he: "חישוב הגבול" },
      statement: {
        en: `Evaluate the limit $$${display}.$$ Simplify first — substitution alone will not get you there.`,
        he: `חשבו את הגבול $$${display}.$$ פשטו תחילה — הצבה בלבד לא תספיק.`,
      },
      params: { family: family.key, p },
      fields: [
        {
          id: "L",
          type: "expression",
          label: "L =",
          placeholder: "e.g. 3/2 or e^2",
          expected: answerPlain,
          prompt: { en: "The limit", he: "הגבול" },
          pitfalls: family.pitfalls?.(p) ?? [],
        },
      ],
      hints: family.hints(p),
      steps: family.steps(p),
      // (fields above carry the pitfalls; see the field definition)
      verification: [
        {
          kind: "limit",
          label: `${family.key} converges to the closed form`,
          expr: family.plain(p),
          variable: "x",
          to: family.to,
          expected: answerPlain,
        },
      ],
    };
  },
};

export const LIMIT_FAMILY_KEYS = FAMILIES.map((f) => f.key);
