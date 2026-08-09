import type {
  Pitfall,
  Problem,
  Rng,
  SolutionStep,
  TemplateDef,
  Text,
  Verification,
} from "../types";
import { sample } from "../rng";
import { coef, fracLatex, fracPlain, paren, signed, signedTerm } from "./util";

/**
 * Full investigation of a function: domain, extrema, asymptotes and a tangent.
 * Three families, each with a hand-derived closed form — the parameters are
 * chosen so critical points and tangents land on clean values.
 */

interface Built {
  /** nerdamer form of f. */
  plain: string;
  latex: string;
  domainExpected: string;
  domainLatex: string;
  extremaExpected: string;
  extremaPrompt: Text;
  /** x-coordinates of the extrema, for the derivative check. */
  extremaX: string[];
  verticalExpected: string;
  horizontalExpected: string;
  /** Where the tangent is taken. */
  x0: string;
  tangentExpected: string;
  steps: SolutionStep[];
  hints: [Text, Text, Text];
  extraChecks: Verification[];
  difficulty: number;
  /** Recognised near-misses, keyed by field id. */
  traps: Partial<Record<
    "domain" | "extrema" | "vertical" | "horizontal" | "tangent",
    Pitfall[]
  >>;
}

/**
 * Using f(x0) as the intercept instead of solving n = f(x0) - m*x0.
 * When slope*x0 = 0 the mistake produces the correct line, so there is
 * nothing to catch and the pitfall is dropped.
 */
function forgotToShift(slope: number, y0: number, x0: number): Pitfall[] {
  if (slope * x0 === 0) return [];
  return [{
    value: `y=${slope}*x+${paren(y0)}`,
    id: "tangent-intercept-unshifted",
    why: {
      en: `You used $f(${x0})=${y0}$ directly as the $y$-intercept. It is the value **at $x=${x0}$**, not at $x=0$: from $y-${y0}=${slope}(x-${x0})$ the intercept is $${y0} - (${slope})(${x0})$.`,
      he: `השתמשתם ב-$f(${x0})=${y0}$ ישירות כנקודת החיתוך עם ציר ה-$y$. זהו הערך **ב-$x=${x0}$** ולא ב-$x=0$: מתוך $y-${y0}=${slope}(x-${x0})$ נקודת החיתוך היא $${y0} - (${slope})(${x0})$.`,
    },
  }];
}

/* --------------------------- family A: a·ln x / x^k --------------------------- */

function familyLog(rng: Rng): Built | null {
  const a = rng.nonZeroInt(-3, 3);
  const k = rng.pick([1, 1, 1, 2]);

  const plain = `${a}*log(x)/x^${k}`;
  const latex =
    k === 1
      ? `\\frac{${coef(a, "\\ln x")}}{x}`
      : `\\frac{${coef(a, "\\ln x")}}{x^{${k}}}`;

  // f' = a(1 - k ln x) / x^(k+1); zero at x = e^(1/k)
  const xc = k === 1 ? "e" : `sqrt(e)`;
  const xcLatex = k === 1 ? "e" : "\\sqrt{e}";
  const yc = fracPlain(a, k) + "/e";
  const ycLatex = k === 1 ? `\\frac{${a}}{e}` : `\\frac{${a}}{2e}`;
  const isMax = a > 0;

  // Tangent at x = 1: f(1) = 0, f'(1) = a  =>  y = a(x - 1)
  const tangent = `${a}*x+${paren(-a)}`;
  const tangentLatex = `y = ${coef(a, "x")} ${signed(-a)}`;

  const steps: SolutionStep[] = [
    {
      move: 0,
      title: { en: "Domain", he: "תחום הגדרה" },
      body: {
        en: `$\\ln x$ requires $x>0$, and that already excludes $x=0$ in the denominator. So the domain is $x>0$.`,
        he: `הביטוי $\\ln x$ מחייב $x>0$, וזה כבר פוסל את $x=0$ במכנה. לכן תחום ההגדרה הוא $x>0$.`,
      },
    },
    {
      move: 2,
      title: { en: "Derivative", he: "נגזרת" },
      body: {
        en: `Quotient rule: $$f'(x)=\\frac{${a}\\cdot\\frac{1}{x}\\cdot x^{${k}} - ${coef(a, "\\ln x")}\\cdot ${k}x^{${k - 1}}}{x^{${2 * k}}}=\\frac{${coef(a, "")}\\left(1-${k === 1 ? "" : k}\\ln x\\right)}{x^{${k + 1}}}.$$`,
        he: `לפי כלל המנה: $$f'(x)=\\frac{${a}\\cdot\\frac{1}{x}\\cdot x^{${k}} - ${coef(a, "\\ln x")}\\cdot ${k}x^{${k - 1}}}{x^{${2 * k}}}=\\frac{${coef(a, "")}\\left(1-${k === 1 ? "" : k}\\ln x\\right)}{x^{${k + 1}}}.$$`,
      },
    },
    {
      move: 2,
      title: { en: "Extremum", he: "נקודת קיצון" },
      body: {
        en: `$f'(x)=0$ when $${k === 1 ? "" : k}\\ln x = 1$, i.e. $x=${xcLatex}$. The denominator $x^{${k + 1}}$ is positive on the domain, so $f'$ changes sign exactly as $1-${k === 1 ? "" : k}\\ln x$ does: ${isMax ? "positive then negative — a maximum" : "negative then positive — a minimum"}. The point is $$\\left(${xcLatex},\\ ${ycLatex}\\right).$$`,
        he: `$f'(x)=0$ כאשר $${k === 1 ? "" : k}\\ln x = 1$, כלומר $x=${xcLatex}$. המכנה $x^{${k + 1}}$ חיובי בתחום, ולכן $f'$ מחליפה סימן בדיוק כמו $1-${k === 1 ? "" : k}\\ln x$: ${isMax ? "חיובי ואז שלילי — מקסימום" : "שלילי ואז חיובי — מינימום"}. הנקודה היא $$\\left(${xcLatex},\\ ${ycLatex}\\right).$$`,
      },
    },
    {
      move: 3,
      title: { en: "Asymptotes", he: "אסימפטוטות" },
      body: {
        en: `As $x\\to0^{+}$, $\\ln x\\to-\\infty$ and $x^{${k}}\\to0^{+}$, so $f(x)\\to${a > 0 ? "-" : "+"}\\infty$: the line $x=0$ is a vertical asymptote. As $x\\to\\infty$ the power beats the logarithm, so $f(x)\\to0$ and $y=0$ is a horizontal asymptote. There is no oblique asymptote.`,
        he: `כאשר $x\\to0^{+}$ מתקיים $\\ln x\\to-\\infty$ וגם $x^{${k}}\\to0^{+}$, ולכן $f(x)\\to${a > 0 ? "-" : "+"}\\infty$: הישר $x=0$ הוא אסימפטוטה אנכית. כאשר $x\\to\\infty$ החזקה גוברת על הלוגריתם, ולכן $f(x)\\to0$ ו-$y=0$ היא אסימפטוטה אופקית. אין אסימפטוטה משופעת.`,
      },
    },
    {
      move: 4,
      title: { en: "Tangent at $x=1$", he: "משיק ב-$x=1$" },
      body: {
        en: `$f(1)=0$ because $\\ln 1 = 0$, and $f'(1)=${a}$. Point-slope: $y-0=${a}(x-1)$, so $$${tangentLatex}.$$`,
        he: `$f(1)=0$ שכן $\\ln 1 = 0$, וגם $f'(1)=${a}$. לפי נקודה-שיפוע: $y-0=${a}(x-1)$, ולכן $$${tangentLatex}.$$`,
      },
    },
  ];

  return {
    plain,
    latex,
    domainExpected: "x>0",
    domainLatex: "x>0",
    extremaExpected: `(${xc},${yc})`,
    extremaPrompt: {
      en: isMax ? "The maximum point" : "The minimum point",
      he: isMax ? "נקודת המקסימום" : "נקודת המינימום",
    },
    extremaX: [xc],
    verticalExpected: "x=0",
    horizontalExpected: "y=0",
    x0: "1",
    tangentExpected: `y=${tangent}`,
    steps,
    difficulty: 2,
    traps: {
      domain: [
        {
          value: "x!=0",
          id: "domain-log-nonzero",
          why: {
            en: "You only excluded the zero of the denominator. $\\ln x$ is undefined for **every** $x\\leq 0$, not just at $0$, so the domain is $x>0$.",
            he: "פסלתם רק את אפס המכנה. הביטוי $\\ln x$ אינו מוגדר עבור **כל** $x\\leq 0$, לא רק ב-$0$, ולכן תחום ההגדרה הוא $x>0$.",
          },
        },
        {
          value: "x>=0",
          id: "domain-log-closed",
          why: {
            en: "$\\ln 0$ is undefined, so $0$ itself must be excluded: the domain is open, $x>0$.",
            he: "הביטוי $\\ln 0$ אינו מוגדר, ולכן יש לפסול גם את $0$ עצמו: התחום פתוח, $x>0$.",
          },
        },
      ],
      tangent: forgotToShift(a, 0, 1),
      horizontal: [
        {
          value: "none",
          id: "asymptote-log-none",
          why: {
            en: "There is one. As $x\\to\\infty$ the power in the denominator grows faster than $\\ln x$, so $f(x)\\to 0$ and $y=0$ is a horizontal asymptote.",
            he: "כן קיימת. כאשר $x\\to\\infty$ החזקה במכנה גדלה מהר יותר מ-$\\ln x$, ולכן $f(x)\\to 0$ ו-$y=0$ היא אסימפטוטה אופקית.",
          },
        },
      ],
    },
    hints: [
      {
        en: "Start with the domain — the logarithm decides it, not the denominator.",
        he: "התחילו מתחום ההגדרה — הלוגריתם קובע אותו, לא המכנה.",
      },
      {
        en: "Use the quotient rule. After simplifying, the numerator of $f'$ is a constant times $1-" + (k === 1 ? "" : k) + "\\ln x$.",
        he: "השתמשו בכלל המנה. לאחר פישוט, המונה של $f'$ הוא קבוע כפול $1-" + (k === 1 ? "" : k) + "\\ln x$.",
      },
      {
        en: `Set $${k === 1 ? "" : k}\\ln x = 1$ to find the critical point, and remember $\\ln 1 = 0$ makes the tangent at $x=1$ very easy.`,
        he: `פתרו $${k === 1 ? "" : k}\\ln x = 1$ כדי למצוא את נקודת הקיצון, וזכרו ש-$\\ln 1 = 0$ מקל מאוד על המשיק ב-$x=1$.`,
      },
    ],
    extraChecks: [
      {
        kind: "limit",
        label: "horizontal asymptote y=0",
        expr: plain,
        variable: "x",
        to: "inf",
        expected: "0",
      },
    ],
  };
}

/* ------------------- family B: (x^2 + c)/(x + p), c = m^2 - p^2 ------------------- */

function familyRational(rng: Rng): Built | null {
  const p = rng.nonZeroInt(-5, 5);
  const m = rng.int(2, 5);
  const c = m * m - p * p;
  if (c === 0) return null;

  const plain = `(x^2+${paren(c)})/(x+${paren(p)})`;
  const latex = `\\frac{x^2 ${signed(c)}}{x ${signed(p)}}`;

  // f = (x + p) + m^2/(x + p) - 2p  =>  f' = 1 - m^2/(x+p)^2
  const xMin = -p + m;
  const xMax = -p - m;
  const yMin = 2 * m - 2 * p;
  const yMax = -2 * m - 2 * p;

  // Tangent at x0 = 1 - p  (so that x0 + p = 1)
  const x0 = 1 - p;
  const y0 = 1 + m * m - 2 * p;
  const slope = 1 - m * m;
  const intercept = 2 * m * m - p - m * m * p;

  const steps: SolutionStep[] = [
    {
      move: 0,
      title: { en: "Domain", he: "תחום הגדרה" },
      body: {
        en: `The denominator vanishes at $x=${-p}$, so the domain is all $x\\neq ${-p}$.`,
        he: `המכנה מתאפס ב-$x=${-p}$, ולכן תחום ההגדרה הוא כל $x\\neq ${-p}$.`,
      },
    },
    {
      move: 1,
      title: { en: "Split off the asymptote", he: "הפרדת האסימפטוטה" },
      body: {
        en: `Long division makes everything easier: $$f(x)=x ${signed(-p)} + \\frac{${m * m}}{x ${signed(p)}}.$$ The fraction tends to $0$ at infinity, so $y = x ${signed(-p)}$ is an oblique asymptote, and $x=${-p}$ is a vertical one.`,
        he: `חילוק ארוך מפשט הכול: $$f(x)=x ${signed(-p)} + \\frac{${m * m}}{x ${signed(p)}}.$$ השבר שואף ל-$0$ באינסוף, ולכן $y = x ${signed(-p)}$ היא אסימפטוטה משופעת, ו-$x=${-p}$ היא אנכית.`,
      },
    },
    {
      move: 2,
      title: { en: "Extrema", he: "נקודות קיצון" },
      body: {
        en: `$$f'(x)=1-\\frac{${m * m}}{\\left(x ${signed(p)}\\right)^2}=0 \\iff \\left(x ${signed(p)}\\right)^2 = ${m * m} \\iff x = ${xMax}\\ \\text{or}\\ x = ${xMin}.$$ Substituting back: a maximum at $(${xMax},\\ ${yMax})$ and a minimum at $(${xMin},\\ ${yMin})$ — the usual arrangement for this shape, with the maximum on the left branch.`,
        he: `$$f'(x)=1-\\frac{${m * m}}{\\left(x ${signed(p)}\\right)^2}=0 \\iff \\left(x ${signed(p)}\\right)^2 = ${m * m} \\iff x = ${xMax}\\ \\text{או}\\ x = ${xMin}.$$ בהצבה חזרה: מקסימום ב-$(${xMax},\\ ${yMax})$ ומינימום ב-$(${xMin},\\ ${yMin})$ — הסידור הרגיל לצורה כזו, כשהמקסימום על הענף השמאלי.`,
      },
    },
    {
      move: 4,
      title: { en: `Tangent at $x=${x0}$`, he: `משיק ב-$x=${x0}$` },
      body: {
        en: `$x=${x0}$ was chosen so that $x ${signed(p)} = 1$: then $f(${x0})=${y0}$ and $f'(${x0})=1-${m * m}=${slope}$. Point-slope gives $$y = ${coef(slope, "x")} ${signed(intercept)}.$$`,
        he: `הנקודה $x=${x0}$ נבחרה כך ש-$x ${signed(p)} = 1$: אז $f(${x0})=${y0}$ וגם $f'(${x0})=1-${m * m}=${slope}$. לפי נקודה-שיפוע: $$y = ${coef(slope, "x")} ${signed(intercept)}.$$`,
      },
    },
  ];

  return {
    plain,
    latex,
    domainExpected: `x!=${-p}`,
    domainLatex: `x \\neq ${-p}`,
    extremaExpected: `(${xMax},${yMax}),(${xMin},${yMin})`,
    extremaPrompt: {
      en: "The extremum points",
      he: "נקודות הקיצון",
    },
    extremaX: [String(xMax), String(xMin)],
    verticalExpected: `x=${-p}`,
    horizontalExpected: `y=x ${signed(-p)}`,
    x0: String(x0),
    tangentExpected: `y=${slope}*x+${paren(intercept)}`,
    steps,
    difficulty: 3,
    traps: {
      domain: [
        {
          value: "all",
          id: "domain-rational-all",
          why: {
            en: `The denominator $x ${signed(p)}$ vanishes at $x=${-p}$, so that single point must be excluded: $x\\neq ${-p}$.`,
            he: `המכנה $x ${signed(p)}$ מתאפס ב-$x=${-p}$, ולכן יש לפסול את הנקודה הבודדת הזו: $x\\neq ${-p}$.`,
          },
        },
      ],
      vertical: [
        {
          value: `x=${p}`,
          id: "asymptote-vertical-sign",
          why: {
            en: `Sign slip. The asymptote is where the denominator is zero: solve $x ${signed(p)} = 0$, which gives $x = ${-p}$, not $x = ${p}$.`,
            he: `טעות סימן. האסימפטוטה היא במקום שבו המכנה מתאפס: פתרו $x ${signed(p)} = 0$, ומתקבל $x = ${-p}$ ולא $x = ${p}$.`,
          },
        },
      ],
      horizontal: [
        {
          value: "y=0",
          id: "asymptote-rational-horizontal",
          why: {
            en: "The numerator has the higher degree, so $f$ does not settle to a finite value — there is no horizontal asymptote. Divide first, and the quotient is the **oblique** asymptote.",
            he: "דרגת המונה גבוהה יותר, ולכן $f$ אינה מתייצבת על ערך סופי — אין אסימפטוטה אופקית. חלקו תחילה, והמנה היא האסימפטוטה ה**משופעת**.",
          },
        },
        {
          value: "none",
          id: "asymptote-rational-none",
          why: {
            en: "There is one, but it is slanted rather than horizontal. Long division splits $f$ into a linear part plus a fraction that dies at infinity — the linear part is the asymptote.",
            he: "כן קיימת, אך היא משופעת ולא אופקית. חילוק ארוך מפרק את $f$ לחלק לינארי ועוד שבר שמתאפס באינסוף — החלק הלינארי הוא האסימפטוטה.",
          },
        },
      ],
      tangent: forgotToShift(slope, y0, x0),
    },
    hints: [
      {
        en: "The numerator has the higher degree — divide before you differentiate. The quotient is the asymptote.",
        he: "דרגת המונה גבוהה יותר — חלקו לפני שגוזרים. המנה היא האסימפטוטה.",
      },
      {
        en: `After the division $f(x)=x ${signed(-p)} + \\frac{${m * m}}{x ${signed(p)}}$, so $f'(x)=1-\\frac{${m * m}}{\\left(x ${signed(p)}\\right)^2}$.`,
        he: `לאחר החילוק $f(x)=x ${signed(-p)} + \\frac{${m * m}}{x ${signed(p)}}$, ולכן $f'(x)=1-\\frac{${m * m}}{\\left(x ${signed(p)}\\right)^2}$.`,
      },
      {
        en: `Solve $\\left(x ${signed(p)}\\right)^2=${m * m}$; there are two solutions, and one is a maximum while the other is a minimum.`,
        he: `פתרו $\\left(x ${signed(p)}\\right)^2=${m * m}$; יש שני פתרונות, אחד מקסימום והשני מינימום.`,
      },
    ],
    extraChecks: [
      {
        kind: "limit",
        label: "f(x) - (x - p) vanishes at infinity, i.e. the oblique asymptote",
        expr: `${plain}-(x ${signed(-p)})`,
        variable: "x",
        to: "inf",
        expected: "0",
      },
    ],
  };
}

/* ----------------------- family C: (x - 3t^2)·sqrt(x) ----------------------- */

function familyRoot(rng: Rng): Built | null {
  const t = rng.int(1, 4);
  const a = 3 * t * t;

  const plain = `(x-${a})*sqrt(x)`;
  const latex = `\\left(x - ${a}\\right)\\sqrt{x}`;

  // f' = 3(x - t^2) / (2 sqrt(x));  min at x = t^2, value -2t^3
  const xMin = t * t;
  const yMin = -2 * t ** 3;

  // Tangent at x0 = 9t^2: f = 18t^3, f' = 4t
  const x0 = 9 * t * t;
  const y0 = 18 * t ** 3;
  const slope = 4 * t;
  const intercept = -18 * t ** 3;

  const steps: SolutionStep[] = [
    {
      move: 0,
      title: { en: "Domain", he: "תחום הגדרה" },
      body: {
        en: `$\\sqrt{x}$ needs $x\\geq 0$, and nothing else restricts it, so the domain is $x\\geq 0$.`,
        he: `הביטוי $\\sqrt{x}$ מחייב $x\\geq 0$, ואין מגבלה נוספת, ולכן תחום ההגדרה הוא $x\\geq 0$.`,
      },
    },
    {
      move: 2,
      title: { en: "Derivative", he: "נגזרת" },
      body: {
        en: `Product rule: $$f'(x)=\\sqrt{x}+\\frac{x-${a}}{2\\sqrt{x}}=\\frac{2x + x - ${a}}{2\\sqrt{x}}=\\frac{3\\left(x-${xMin}\\right)}{2\\sqrt{x}}.$$`,
        he: `לפי כלל המכפלה: $$f'(x)=\\sqrt{x}+\\frac{x-${a}}{2\\sqrt{x}}=\\frac{2x + x - ${a}}{2\\sqrt{x}}=\\frac{3\\left(x-${xMin}\\right)}{2\\sqrt{x}}.$$`,
      },
    },
    {
      move: 2,
      title: { en: "Extremum", he: "נקודת קיצון" },
      body: {
        en: `On $x>0$ the denominator is positive, so the sign of $f'$ follows $x-${xMin}$: negative then positive, a minimum at $$\\left(${xMin},\\ ${yMin}\\right).$$`,
        he: `עבור $x>0$ המכנה חיובי, ולכן סימן $f'$ נקבע על ידי $x-${xMin}$: שלילי ואז חיובי, כלומר מינימום בנקודה $$\\left(${xMin},\\ ${yMin}\\right).$$`,
      },
    },
    {
      move: 3,
      title: { en: "Asymptotes", he: "אסימפטוטות" },
      body: {
        en: `The function is defined and continuous on all of $[0,\\infty)$, so there is no vertical asymptote. As $x\\to\\infty$ it grows without bound and $\\frac{f(x)}{x}\\to\\infty$, so there is no horizontal or oblique asymptote either.`,
        he: `הפונקציה מוגדרת ורציפה בכל $[0,\\infty)$, ולכן אין אסימפטוטה אנכית. כאשר $x\\to\\infty$ היא גדלה ללא גבול ו-$\\frac{f(x)}{x}\\to\\infty$, ולכן אין גם אסימפטוטה אופקית או משופעת.`,
      },
    },
    {
      move: 4,
      title: { en: `Tangent at $x=${x0}$`, he: `משיק ב-$x=${x0}$` },
      body: {
        en: `$f(${x0})=\\left(${x0}-${a}\\right)\\sqrt{${x0}} = ${y0}$ and $f'(${x0})=\\frac{3\\left(${x0}-${xMin}\\right)}{2\\sqrt{${x0}}}=${slope}$, so $$y = ${coef(slope, "x")} ${signed(intercept)}.$$`,
        he: `$f(${x0})=\\left(${x0}-${a}\\right)\\sqrt{${x0}} = ${y0}$ וגם $f'(${x0})=\\frac{3\\left(${x0}-${xMin}\\right)}{2\\sqrt{${x0}}}=${slope}$, ולכן $$y = ${coef(slope, "x")} ${signed(intercept)}.$$`,
      },
    },
  ];

  return {
    plain,
    latex,
    domainExpected: "x>=0",
    domainLatex: "x \\geq 0",
    extremaExpected: `(${xMin},${yMin})`,
    extremaPrompt: { en: "The minimum point", he: "נקודת המינימום" },
    extremaX: [String(xMin)],
    verticalExpected: "none",
    horizontalExpected: "none",
    x0: String(x0),
    tangentExpected: `y=${slope}*x+${paren(intercept)}`,
    steps,
    difficulty: 2,
    traps: {
      domain: [
        {
          value: "x>0",
          id: "domain-root-open",
          why: {
            en: "$\\sqrt{0}=0$ is perfectly well defined, so $x=0$ belongs to the domain. The interval is closed at the left: $x\\geq 0$.",
            he: "הביטוי $\\sqrt{0}=0$ מוגדר היטב, ולכן $x=0$ שייך לתחום. הקטע סגור משמאל: $x\\geq 0$.",
          },
        },
      ],
      extrema: [
        {
          value: `(${xMin},${-2 * t ** 3 * -1})`,
          id: "extremum-sign",
          why: {
            en: `The $x$ is right but the $y$ has the wrong sign. At $x=${xMin}$ the factor $\\left(x-${a}\\right)$ is **negative**, so $f(${xMin})=\\left(${xMin}-${a}\\right)\\cdot${t}=${yMin}$.`,
            he: `ערך ה-$x$ נכון אך הסימן של $y$ שגוי. ב-$x=${xMin}$ הגורם $\\left(x-${a}\\right)$ הוא **שלילי**, ולכן $f(${xMin})=\\left(${xMin}-${a}\\right)\\cdot${t}=${yMin}$.`,
          },
        },
      ],
      tangent: forgotToShift(slope, y0, x0),
    },
    hints: [
      {
        en: "The square root fixes the domain immediately.",
        he: "השורש קובע מיד את תחום ההגדרה.",
      },
      {
        en: "Differentiate as a product, then put the two terms over the common denominator $2\\sqrt{x}$.",
        he: "גזרו כמכפלה, ולאחר מכן אחדו את שני האיברים למכנה משותף $2\\sqrt{x}$.",
      },
      {
        en: `The numerator simplifies to $3\\left(x-${xMin}\\right)$, so the only critical point is $x=${xMin}$.`,
        he: `המונה מצטמצם ל-$3\\left(x-${xMin}\\right)$, ולכן נקודת הקיצון היחידה היא $x=${xMin}$.`,
      },
    ],
    extraChecks: [],
  };
}

const FAMILIES = [familyLog, familyRational, familyRoot];

export const functionInvestigation: TemplateDef = {
  id: "function-investigation",
  topic: "calculus",
  name: {
    en: "Function investigation",
    he: "חקירת פונקציה",
  },
  blurb: {
    en: "Domain, extrema, asymptotes and a tangent line, start to finish.",
    he: "תחום הגדרה, קיצון, אסימפטוטות ומשיק — מהתחלה ועד הסוף.",
  },

  generate(rng: Rng): Problem {
    const built = sample(rng, () => rng.pick(FAMILIES)(rng));

    const f = `f(x)=${built.latex}`;

    return {
      id: `function-investigation-${rng.int(0, 1e9)}`,
      templateId: "function-investigation",
      seed: 0,
      difficulty: built.difficulty,
      title: { en: "Function investigation", he: "חקירת פונקציה" },
      statement: {
        en:
          `Given the function $$${f}.$$ ` +
          `Find its domain, its extremum points, all of its asymptotes, ` +
          `and the equation of the tangent to the graph at $x=${built.x0}$.`,
        he:
          `נתונה הפונקציה $$${f}.$$ ` +
          `מצאו את תחום ההגדרה, את נקודות הקיצון, את כל האסימפטוטות, ` +
          `ואת משוואת המשיק לגרף בנקודה שבה $x=${built.x0}$.`,
      },
      params: { f: built.plain },
      fields: [
        {
          id: "domain",
          type: "domain",
          placeholder: "e.g. x>0  or  (0,∞)",
          expected: built.domainExpected,
          prompt: { en: "Domain", he: "תחום הגדרה" },
          pitfalls: built.traps.domain,
        },
        {
          id: "extrema",
          type: "points",
          placeholder: "(x, y)",
          expected: built.extremaExpected,
          prompt: built.extremaPrompt,
          pitfalls: built.traps.extrema,
        },
        {
          id: "vertical",
          type: "equation",
          placeholder: "x = ...  or  none",
          expected: built.verticalExpected,
          prompt: {
            en: "Vertical asymptote (or “none”)",
            he: "אסימפטוטה אנכית (או ״אין״)",
          },
          pitfalls: built.traps.vertical,
        },
        {
          id: "horizontal",
          type: "equation",
          placeholder: "y = ...  or  none",
          expected: built.horizontalExpected,
          prompt: {
            en: "Horizontal or oblique asymptote (or “none”)",
            he: "אסימפטוטה אופקית או משופעת (או ״אין״)",
          },
          pitfalls: built.traps.horizontal,
        },
        {
          id: "tangent",
          type: "equation",
          placeholder: "y = mx + n",
          expected: built.tangentExpected,
          prompt: {
            en: `Tangent at $x=${built.x0}$`,
            he: `משיק ב-$x=${built.x0}$`,
          },
          pitfalls: built.traps.tangent,
        },
      ],
      hints: built.hints,
      steps: built.steps,
      verification: [
        ...built.extremaX.map(
          (x): Verification => ({
            kind: "derivative",
            label: `f'(${x}) = 0 at the claimed extremum`,
            expr: built.plain,
            variable: "x",
            at: x,
            expected: "0",
          }),
        ),
        {
          kind: "derivative",
          label: "tangent slope matches f'",
          expr: built.plain,
          variable: "x",
          at: built.x0,
          expected: tangentSlope(built.tangentExpected),
        },
        {
          kind: "numeric",
          label: "tangent touches the graph at x0",
          expr: `(${built.plain.replace(/x/g, `(${built.x0})`)})-(${tangentAt(
            built.tangentExpected,
            built.x0,
          )})`,
          expected: "0",
        },
        ...built.extraChecks,
      ],
    };
  },
};

/** "y=3*x+5" -> "3" */
function tangentSlope(tangent: string): string {
  const rhs = tangent.split("=")[1];
  const m = /^(.*?)\*x/.exec(rhs);
  return m ? m[1] : "0";
}

/** "y=3*x+5" evaluated at x0, as an expression. */
function tangentAt(tangent: string, x0: string): string {
  const rhs = tangent.split("=")[1];
  return rhs.replace(/x/g, `(${x0})`);
}
