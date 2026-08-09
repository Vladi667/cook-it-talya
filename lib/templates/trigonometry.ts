import type { Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { radicalLatex, radicalPlain } from "./util";

/**
 * Two families.
 *
 * cosine — the cosine rule with an included angle of 60° or 120°, where
 *   cos C = ±1/2 and c² = a² + b² ∓ ab. The (a, b) pairs are chosen from
 *   Eisenstein triples, so the third side is a whole number; the area and the
 *   circumradius then come out as exact surds in √3.
 *
 * equation — a quadratic in sin x or cos x that factors over the rationals,
 *   solved in degrees on [0°, 360°). Some variants need the Pythagorean
 *   identity applied first, which is the step that is actually being taught.
 */

/** a² + b² − ab = c²  (included angle 60°). */
const TRIPLES_60: [number, number, number][] = [
  [3, 8, 7],
  [5, 8, 7],
  [7, 15, 13],
  [8, 15, 13],
  [5, 21, 19],
  [16, 21, 19],
];

/** a² + b² + ab = c²  (included angle 120°). */
const TRIPLES_120: [number, number, number][] = [
  [3, 5, 7],
  [7, 8, 13],
  [5, 16, 19],
  [11, 24, 31],
];

interface EquationSpec {
  latex: string;
  /** nerdamer form with X standing in for the unknown, in degrees. */
  plain: string;
  solutions: number[];
  /** Set when the Pythagorean identity has to be used before factoring. */
  needsIdentity: boolean;
  factored: string;
  roots: string;
}

const EQUATIONS: EquationSpec[] = [
  {
    latex: "2\\sin^2 x-\\sin x-1=0",
    plain: "2*sin(X*pi/180)^2-sin(X*pi/180)-1",
    solutions: [90, 210, 330],
    needsIdentity: false,
    factored: "\\left(2\\sin x+1\\right)\\left(\\sin x-1\\right)=0",
    roots: "\\sin x=-\\tfrac{1}{2}\\ \\text{or}\\ \\sin x=1",
  },
  {
    latex: "2\\cos^2 x+\\cos x-1=0",
    plain: "2*cos(X*pi/180)^2+cos(X*pi/180)-1",
    solutions: [60, 180, 300],
    needsIdentity: false,
    factored: "\\left(2\\cos x-1\\right)\\left(\\cos x+1\\right)=0",
    roots: "\\cos x=\\tfrac{1}{2}\\ \\text{or}\\ \\cos x=-1",
  },
  {
    latex: "2\\sin^2 x+\\sin x-1=0",
    plain: "2*sin(X*pi/180)^2+sin(X*pi/180)-1",
    solutions: [30, 150, 270],
    needsIdentity: false,
    factored: "\\left(2\\sin x-1\\right)\\left(\\sin x+1\\right)=0",
    roots: "\\sin x=\\tfrac{1}{2}\\ \\text{or}\\ \\sin x=-1",
  },
  {
    latex: "2\\cos^2 x-\\cos x-1=0",
    plain: "2*cos(X*pi/180)^2-cos(X*pi/180)-1",
    solutions: [0, 120, 240],
    needsIdentity: false,
    factored: "\\left(2\\cos x+1\\right)\\left(\\cos x-1\\right)=0",
    roots: "\\cos x=-\\tfrac{1}{2}\\ \\text{or}\\ \\cos x=1",
  },
  {
    latex: "2\\sin^2 x-3\\sin x+1=0",
    plain: "2*sin(X*pi/180)^2-3*sin(X*pi/180)+1",
    solutions: [30, 90, 150],
    needsIdentity: false,
    factored: "\\left(2\\sin x-1\\right)\\left(\\sin x-1\\right)=0",
    roots: "\\sin x=\\tfrac{1}{2}\\ \\text{or}\\ \\sin x=1",
  },
  {
    latex: "2\\cos^2 x-3\\cos x+1=0",
    plain: "2*cos(X*pi/180)^2-3*cos(X*pi/180)+1",
    solutions: [0, 60, 300],
    needsIdentity: false,
    factored: "\\left(2\\cos x-1\\right)\\left(\\cos x-1\\right)=0",
    roots: "\\cos x=\\tfrac{1}{2}\\ \\text{or}\\ \\cos x=1",
  },
  {
    latex: "2\\cos^2 x+3\\sin x-3=0",
    plain: "2*cos(X*pi/180)^2+3*sin(X*pi/180)-3",
    solutions: [30, 90, 150],
    needsIdentity: true,
    factored: "\\left(2\\sin x-1\\right)\\left(\\sin x-1\\right)=0",
    roots: "\\sin x=\\tfrac{1}{2}\\ \\text{or}\\ \\sin x=1",
  },
  {
    latex: "2\\sin^2 x-3\\cos x=0",
    plain: "2*sin(X*pi/180)^2-3*cos(X*pi/180)",
    solutions: [60, 300],
    needsIdentity: true,
    factored: "\\left(2\\cos x-1\\right)\\left(\\cos x+2\\right)=0",
    roots: "\\cos x=\\tfrac{1}{2}\\quad(\\cos x=-2\\ \\text{is impossible})",
  },
];

interface Config {
  kind: "cosine" | "equation";
  a: number;
  b: number;
  c: number;
  angle: 60 | 120;
  eq: number;
}

function draw(rng: Rng): Config | null {
  if (rng.next() < 0.55) {
    const angle = rng.pick([60, 120] as const);
    const [a, b, c] = rng.pick(angle === 60 ? TRIPLES_60 : TRIPLES_120);
    return { kind: "cosine", a, b, c, angle, eq: 0 };
  }
  return {
    kind: "equation",
    a: 0,
    b: 0,
    c: 0,
    angle: 60,
    eq: rng.int(0, EQUATIONS.length - 1),
  };
}

export const trigonometry: TemplateDef = {
  id: "trigonometry",
  topic: "trigonometry",
  name: { en: "Trigonometry", he: "טריגונומטריה" },
  blurb: {
    en: "The cosine rule in a triangle, and trigonometric equations.",
    he: "משפט הקוסינוסים במשולש, ומשוואות טריגונומטריות.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    /* --------------------------------------------------- cosine rule ----- */
    if (cfg.kind === "cosine") {
      const { a, b, c, angle } = cfg;
      const sign = angle === 60 ? "-" : "+";
      const cosLatex = angle === 60 ? "\\tfrac{1}{2}" : "-\\tfrac{1}{2}";

      // Area = (1/2)ab·sin C, and sin 60° = sin 120° = √3/2.
      const areaPlain = radicalPlain(3 * (a * b) ** 2, 4);
      const areaLatex = radicalLatex(3 * (a * b) ** 2, 4);

      // R = c / (2 sin C) = c/√3.
      const rPlain = radicalPlain(3 * c * c, 3);
      const rLatex = radicalLatex(3 * c * c, 3);

      const wrongSign =
        angle === 60 ? a * a + b * b + a * b : a * a + b * b - a * b;

      return {
        id: `trigonometry-cosine-${rng.int(0, 1e9)}`,
        templateId: "trigonometry",
        seed: 0,
        difficulty: 2,
        title: { en: "The cosine rule", he: "משפט הקוסינוסים" },
        statement: {
          en:
            `In triangle $ABC$, $AB=${a}$, $AC=${b}$ and the angle between them is $\\angle A=${angle}^\\circ$. ` +
            `Find the length of the third side $BC$, the area of the triangle, ` +
            `and the radius of the circle circumscribing it.`,
          he:
            `במשולש $ABC$ נתון $AB=${a}$, $AC=${b}$ והזווית ביניהן $\\angle A=${angle}^\\circ$. ` +
            `מצאו את אורך הצלע השלישית $BC$, את שטח המשולש, ` +
            `ואת רדיוס המעגל החוסם אותו.`,
        },
        params: { kind: "cosine", a, b, c, angle },
        fields: [
          {
            id: "side",
            type: "number",
            label: "BC =",
            placeholder: "e.g. 7",
            expected: String(c),
            prompt: { en: "The third side $BC$", he: "הצלע השלישית $BC$" },
            pitfalls: [
              {
                value: `sqrt(${a * a + b * b})`,
                id: "trig-used-pythagoras",
                why: {
                  en: `That is Pythagoras, which only applies when the angle between the sides is $90^\\circ$. Here it is $${angle}^\\circ$, so the cosine rule adds the correction term: $BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cos ${angle}^\\circ$.`,
                  he: `זהו משפט פיתגורס, שתקף רק כאשר הזווית בין הצלעות היא $90^\\circ$. כאן היא $${angle}^\\circ$, ולכן משפט הקוסינוסים מוסיף את איבר התיקון: $BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cos ${angle}^\\circ$.`,
                },
              },
              {
                value: `sqrt(${wrongSign})`,
                id: "trig-cosine-sign",
                why: {
                  en: `Sign slip on $\\cos ${angle}^\\circ=${cosLatex}$. The rule is $c^2=a^2+b^2-2ab\\cos C$, and substituting a ${angle === 120 ? "**negative**" : "positive"} cosine makes the last term ${angle === 120 ? "**add**" : "subtract"}: $c^2=${a}^2+${b}^2${sign}${a}\\cdot${b}=${c * c}$.`,
                  he: `טעות סימן ב-$\\cos ${angle}^\\circ=${cosLatex}$. המשפט הוא $c^2=a^2+b^2-2ab\\cos C$, והצבת קוסינוס ${angle === 120 ? "**שלילי**" : "חיובי"} גורמת לאיבר האחרון ${angle === 120 ? "**להתווסף**" : "להיחסר"}: $c^2=${a}^2+${b}^2${sign}${a}\\cdot${b}=${c * c}$.`,
                },
              },
              {
                value: String(c * c),
                id: "trig-side-squared",
                why: {
                  en: `That is $BC^2$. The cosine rule gives the **square** of the side — take the root: $BC=${c}$.`,
                  he: `זהו $BC^2$. משפט הקוסינוסים נותן את **ריבוע** הצלע — הוציאו שורש: $BC=${c}$.`,
                },
              },
            ],
          },
          {
            id: "area",
            type: "expression",
            label: "S =",
            placeholder: "e.g. 6sqrt(3)",
            expected: areaPlain,
            prompt: { en: "Area of the triangle", he: "שטח המשולש" },
            pitfalls: [
              {
                value: String((a * b) / 2),
                id: "trig-area-no-sine",
                why: {
                  en: `You used $\\frac{1}{2}\\cdot${a}\\cdot${b}$, which is the area only when the angle between the sides is $90^\\circ$. In general $S=\\frac{1}{2}ab\\sin C$, and $\\sin ${angle}^\\circ=\\frac{\\sqrt{3}}{2}$.`,
                  he: `השתמשתם ב-$\\frac{1}{2}\\cdot${a}\\cdot${b}$, שהוא השטח רק כאשר הזווית בין הצלעות היא $90^\\circ$. באופן כללי $S=\\frac{1}{2}ab\\sin C$, ומתקיים $\\sin ${angle}^\\circ=\\frac{\\sqrt{3}}{2}$.`,
                },
              },
            ],
          },
          {
            id: "circumradius",
            type: "expression",
            label: "R =",
            placeholder: "e.g. 7sqrt(3)/3",
            expected: rPlain,
            prompt: {
              en: "Radius of the circumscribed circle",
              he: "רדיוס המעגל החוסם",
            },
            pitfalls: [
              {
                value: radicalPlain(3 * (2 * c) ** 2, 3),
                id: "trig-circumradius-no-half",
                why: {
                  en: `The sine rule is $\\frac{a}{\\sin A}=2R$, not $R$. So $R=\\frac{BC}{2\\sin ${angle}^\\circ}$ — you are out by a factor of two.`,
                  he: `משפט הסינוסים הוא $\\frac{a}{\\sin A}=2R$, ולא $R$. לכן $R=\\frac{BC}{2\\sin ${angle}^\\circ}$ — יש הפרש של פי שתיים.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "Two sides and the angle **between** them is exactly the configuration the cosine rule is for — the sine rule cannot start here, because it needs a side opposite a known angle.",
            he: "שתי צלעות והזווית **שביניהן** היא בדיוק המצב שעבורו נועד משפט הקוסינוסים — משפט הסינוסים אינו יכול להתחיל כאן, כי הוא דורש צלע מול זווית ידועה.",
          },
          {
            en: `$BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cos ${angle}^\\circ$, and $\\cos ${angle}^\\circ=${cosLatex}$.`,
            he: `$BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cos ${angle}^\\circ$, וכן $\\cos ${angle}^\\circ=${cosLatex}$.`,
          },
          {
            en: `For the area use $S=\\frac{1}{2}ab\\sin C$; for the circumradius use the sine rule in the form $\\frac{BC}{\\sin A}=2R$.`,
            he: `לשטח השתמשו ב-$S=\\frac{1}{2}ab\\sin C$; לרדיוס המעגל החוסם השתמשו במשפט הסינוסים בצורה $\\frac{BC}{\\sin A}=2R$.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Pick the right rule", he: "בחירת המשפט הנכון" },
            body: {
              en: `Two sides and the included angle: that is the cosine rule. The sine rule is unusable here because no side is opposite a known angle yet.`,
              he: `שתי צלעות והזווית שביניהן: זהו משפט הקוסינוסים. משפט הסינוסים אינו שמיש כאן כי אף צלע אינה נמצאת מול זווית ידועה בשלב זה.`,
            },
          },
          {
            move: 1,
            title: { en: "The cosine rule", he: "משפט הקוסינוסים" },
            body: {
              en: `$$BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${cosLatex}=${a * a}+${b * b}${sign}${a * b}=${c * c},$$ so $BC=${c}$ — a whole number, which is the usual sign that the angle was chosen to make $\\cos C=\\pm\\frac{1}{2}$.`,
              he: `$$BC^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${cosLatex}=${a * a}+${b * b}${sign}${a * b}=${c * c},$$ ולכן $BC=${c}$ — מספר שלם, וזהו הסימן הרגיל לכך שהזווית נבחרה כך ש-$\\cos C=\\pm\\frac{1}{2}$.`,
            },
          },
          {
            move: 2,
            title: { en: "Area", he: "שטח" },
            body: {
              en: `$$S=\\tfrac{1}{2}\\cdot${a}\\cdot${b}\\cdot\\sin ${angle}^\\circ=\\tfrac{1}{2}\\cdot${a * b}\\cdot\\frac{\\sqrt3}{2}=${areaLatex}.$$`,
              he: `$$S=\\tfrac{1}{2}\\cdot${a}\\cdot${b}\\cdot\\sin ${angle}^\\circ=\\tfrac{1}{2}\\cdot${a * b}\\cdot\\frac{\\sqrt3}{2}=${areaLatex}.$$`,
            },
          },
          {
            move: 3,
            title: { en: "Circumradius", he: "רדיוס המעגל החוסם" },
            body: {
              en: `Sine rule: $\\frac{BC}{\\sin A}=2R$, so $$R=\\frac{${c}}{2\\cdot\\frac{\\sqrt3}{2}}=\\frac{${c}}{\\sqrt3}=${rLatex}.$$`,
              he: `משפט הסינוסים: $\\frac{BC}{\\sin A}=2R$, ולכן $$R=\\frac{${c}}{2\\cdot\\frac{\\sqrt3}{2}}=\\frac{${c}}{\\sqrt3}=${rLatex}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "numeric",
            label: "the cosine rule reproduces the third side",
            expr: `sqrt(${a}^2+${b}^2-2*${a}*${b}*cos(${angle}*pi/180))`,
            expected: String(c),
          },
          {
            kind: "numeric",
            label: "area from two sides and the included angle",
            expr: `0.5*${a}*${b}*sin(${angle}*pi/180)`,
            expected: areaPlain,
          },
          {
            kind: "numeric",
            label: "circumradius from the sine rule",
            expr: `${c}/(2*sin(${angle}*pi/180))`,
            expected: rPlain,
          },
          {
            kind: "numeric",
            label: "the triangle inequality holds",
            expr: `${a}+${b}-${c}`,
            expected: "positive",
          },
        ],
      };
    }

    /* ---------------------------------------------- trig equation -------- */
    const spec = EQUATIONS[cfg.eq];
    const sols = spec.solutions;
    const expected = sols.join(",");

    return {
      id: `trigonometry-equation-${rng.int(0, 1e9)}`,
      templateId: "trigonometry",
      seed: 0,
      difficulty: 2,
      title: { en: "Trigonometric equation", he: "משוואה טריגונומטרית" },
      statement: {
        en:
          `Solve the equation $$${spec.latex}$$ for $0^\\circ \\leq x < 360^\\circ$. ` +
          `Give all solutions in degrees.`,
        he:
          `פתרו את המשוואה $$${spec.latex}$$ בתחום $0^\\circ \\leq x < 360^\\circ$. ` +
          `רשמו את כל הפתרונות במעלות.`,
      },
      params: { kind: "equation", eq: cfg.eq },
      fields: [
        {
          id: "x",
          type: "set",
          placeholder: "e.g. 30, 150, 270",
          expected,
          prompt: {
            en: "All solutions, in degrees",
            he: "כל הפתרונות, במעלות",
          },
          pitfalls: [
            {
              value: String(sols[0]),
              id: "trig-one-solution-only",
              why: {
                en: `That is one solution, but the equation has $${sols.length}$ in this range. Each value of $\\sin$ or $\\cos$ is reached **twice** per revolution (except at the extremes $\\pm1$), so after solving for the ratio you must find every angle that produces it.`,
                he: `זהו פתרון אחד, אך למשוואה יש $${sols.length}$ פתרונות בתחום זה. כל ערך של $\\sin$ או $\\cos$ מתקבל **פעמיים** בסיבוב (פרט לקצוות $\\pm1$), ולכן לאחר פתרון היחס יש למצוא כל זווית שמייצרת אותו.`,
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: spec.needsIdentity
            ? "The equation mixes $\\sin$ and $\\cos$. Use $\\sin^2 x+\\cos^2 x=1$ to rewrite it in terms of a single function before doing anything else."
            : "The equation is a quadratic — but in $\\sin x$ or $\\cos x$, not in $x$. Substitute $t$ for that function and it becomes an ordinary quadratic.",
          he: spec.needsIdentity
            ? "המשוואה מערבבת $\\sin$ ו-$\\cos$. השתמשו ב-$\\sin^2 x+\\cos^2 x=1$ כדי לכתוב אותה מחדש בעזרת פונקציה אחת לפני כל דבר אחר."
            : "המשוואה היא ריבועית — אך ב-$\\sin x$ או ב-$\\cos x$, לא ב-$x$. הציבו $t$ במקום הפונקציה והיא הופכת למשוואה ריבועית רגילה.",
        },
        {
          en: `It factors: $$${spec.factored}$$ giving $${spec.roots}$.`,
          he: `היא מתפרקת לגורמים: $$${spec.factored}$$ ומכאן $${spec.roots}$.`,
        },
        {
          en: "Now find every angle in $[0^\\circ,360^\\circ)$ with those values. Sketch the unit circle if it helps — each horizontal or vertical level meets it twice.",
          he: "כעת מצאו כל זווית בתחום $[0^\\circ,360^\\circ)$ עם הערכים הללו. שרטטו את מעגל היחידה אם זה עוזר — כל גובה אופקי או אנכי פוגש אותו פעמיים.",
        },
      ],
      steps: [
        {
          move: 0,
          title: {
            en: spec.needsIdentity ? "Reduce to one function" : "See the quadratic",
            he: spec.needsIdentity ? "צמצום לפונקציה אחת" : "זיהוי המשוואה הריבועית",
          },
          body: {
            en: spec.needsIdentity
              ? `The equation contains both $\\sin$ and $\\cos$, so it cannot factor as it stands. Replacing one using $\\sin^2 x+\\cos^2 x=1$ leaves a quadratic in a single function.`
              : `Everything is $\\sin x$ or $\\cos x$ and its square, so this is a quadratic in that function — treat it as one and factor.`,
            he: spec.needsIdentity
              ? `המשוואה מכילה גם $\\sin$ וגם $\\cos$, ולכן אינה מתפרקת כמו שהיא. החלפת אחד מהם בעזרת $\\sin^2 x+\\cos^2 x=1$ משאירה משוואה ריבועית בפונקציה אחת.`
              : `הכול מופיע כ-$\\sin x$ או $\\cos x$ וריבועם, ולכן זו משוואה ריבועית בפונקציה הזו — התייחסו אליה ככזו ופרקו לגורמים.`,
          },
        },
        {
          move: 1,
          title: { en: "Factor", he: "פירוק לגורמים" },
          body: {
            en: `$$${spec.factored}$$ so $${spec.roots}$.`,
            he: `$$${spec.factored}$$ ולכן $${spec.roots}$.`,
          },
        },
        {
          move: 2,
          title: { en: "All angles in range", he: "כל הזוויות בתחום" },
          body: {
            en: `Each ratio is reached twice per revolution (once for $\\pm1$), which gives $$x=${sols.join("^\\circ,\\ ")}^\\circ.$$`,
            he: `כל יחס מתקבל פעמיים בסיבוב (פעם אחת עבור $\\pm1$), ומכאן $$x=${sols.join("^\\circ,\\ ")}^\\circ.$$`,
          },
        },
        {
          move: 3,
          title: { en: "Check the range", he: "בדיקת התחום" },
          body: {
            en: `All $${sols.length}$ values lie in $[0^\\circ,360^\\circ)$, and any root outside $[-1,1]$ for the ratio itself would have been rejected as impossible.`,
            he: `כל $${sols.length}$ הערכים נמצאים בתחום $[0^\\circ,360^\\circ)$, וכל שורש של היחס עצמו מחוץ ל-$[-1,1]$ היה נפסל כבלתי אפשרי.`,
          },
        },
      ],
      verification: sols.map((s) => ({
        kind: "numeric" as const,
        label: `x = ${s}° satisfies the equation`,
        expr: spec.plain.replace(/X/g, `(${s})`),
        expected: "0",
      })),
    };
  },
};
