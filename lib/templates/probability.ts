import type { Pitfall, Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { fracLatex, fracPlain } from "./util";

/**
 * Two families, both worked in exact integer fractions so nothing is ever
 * rounded:
 *
 *   tree     pick one of two boxes, then a ball. Law of total probability,
 *            then Bayes to reverse the conditioning.
 *   binomial n independent trials at probability p: exactly k, and at least one.
 */
type Kind = "tree" | "binomial";

interface Config {
  kind: Kind;
  // tree
  a: number; // P(box 1) = a / b
  b: number;
  r1: number;
  n1: number;
  r2: number;
  n2: number;
  // binomial
  n: number;
  k: number;
  p: number; // P(success) = p / q
  q: number;
}

function choose(n: number, k: number): number {
  let out = 1;
  for (let i = 1; i <= k; i++) out = (out * (n - i + 1)) / i;
  return Math.round(out);
}

function draw(rng: Rng): Config | null {
  if (rng.next() < 0.55) {
    const [a, b] = rng.pick([
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [2, 5],
      [3, 5],
      [1, 2],
    ]);
    const n1 = rng.pick([4, 5, 6, 8, 10]);
    const n2 = rng.pick([4, 5, 6, 8, 10]);
    const r1 = rng.int(1, n1 - 1);
    const r2 = rng.int(1, n2 - 1);
    // The two boxes must actually differ, or the conditioning is vacuous.
    if (r1 * n2 === r2 * n1) return null;
    return { kind: "tree", a, b, r1, n1, r2, n2, n: 0, k: 0, p: 0, q: 0 };
  }

  const n = rng.int(4, 6);
  const k = rng.int(1, n - 1);
  const [p, q] = rng.pick([
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [2, 5],
    [3, 5],
  ]);
  return { kind: "binomial", a: 0, b: 0, r1: 0, n1: 0, r2: 0, n2: 0, n, k, p, q };
}

export const probability: TemplateDef = {
  id: "probability",
  topic: "probability",
  name: { en: "Probability", he: "הסתברות" },
  blurb: {
    en: "Tree diagrams, total probability, Bayes and the binomial model.",
    he: "דיאגרמות עץ, הסתברות שלמה, בייס והתפלגות בינומית.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    /* --------------------------------------------------- two-box tree ----- */
    if (cfg.kind === "tree") {
      const { a, b, r1, n1, r2, n2 } = cfg;
      const w1 = a; // weight of box 1, over b
      const w2 = b - a;

      // P(red) = [a·r1·n2 + (b-a)·r2·n1] / (b·n1·n2)
      const redNum = a * r1 * n2 + w2 * r2 * n1;
      const redDen = b * n1 * n2;
      const redPlain = fracPlain(redNum, redDen);
      const redLatex = fracLatex(redNum, redDen);

      // P(box 1 | red) = a·r1·n2 / (that numerator)
      const bayesNum = a * r1 * n2;
      const bayesPlain = fracPlain(bayesNum, redNum);
      const bayesLatex = fracLatex(bayesNum, redNum);

      const pBox1 = fracLatex(a, b);
      const pBox2 = fracLatex(w2, b);

      const treePitfalls: Pitfall[] = [];
      // An unweighted average only differs from the truth when the boxes are
      // not chosen equally often.
      if (2 * a !== b) {
        treePitfalls.push({
          value: fracPlain(r1 * n2 + r2 * n1, 2 * n1 * n2),
          id: "prob-unweighted-average",
          why: {
            en: `You averaged the two box probabilities as if each box were equally likely. They are not: box 1 is chosen with probability $${pBox1}$ and box 2 with $${pBox2}$, so each branch must be **weighted** by how often you go down it.`,
            he: `מיצעתם את שתי ההסתברויות כאילו שני הכדים נבחרים באותה תדירות. הם לא: כד 1 נבחר בהסתברות $${pBox1}$ וכד 2 בהסתברות $${pBox2}$, ולכן יש **לשקלל** כל ענף לפי תדירות המעבר בו.`,
          },
        });
      }

      return {
        id: `probability-tree-${rng.int(0, 1e9)}`,
        templateId: "probability",
        seed: 0,
        difficulty: 2,
        title: { en: "Two boxes", he: "שני כדים" },
        statement: {
          en:
            `Box 1 contains $${r1}$ red balls out of $${n1}$; box 2 contains $${r2}$ red balls out of $${n2}$. ` +
            `A box is chosen at random — box 1 with probability $${pBox1}$ and box 2 with probability $${pBox2}$ — ` +
            `and then one ball is drawn from it. ` +
            `Find the probability that the ball drawn is red, and the probability that it came from box 1 given that it is red.`,
          he:
            `בכד 1 יש $${r1}$ כדורים אדומים מתוך $${n1}$; בכד 2 יש $${r2}$ כדורים אדומים מתוך $${n2}$. ` +
            `בוחרים כד באקראי — כד 1 בהסתברות $${pBox1}$ וכד 2 בהסתברות $${pBox2}$ — ` +
            `ומוציאים ממנו כדור אחד. ` +
            `מצאו את ההסתברות שהכדור שהוצא אדום, ואת ההסתברות שהוא הגיע מכד 1 בהינתן שהוא אדום.`,
        },
        params: { kind: "tree", a, b, r1, n1, r2, n2 },
        fields: [
          {
            id: "red",
            type: "number",
            label: "P(red) =",
            placeholder: "e.g. 7/20",
            expected: redPlain,
            prompt: {
              en: "Probability the ball is red",
              he: "ההסתברות שהכדור אדום",
            },
            pitfalls: treePitfalls,
          },
          {
            id: "bayes",
            type: "number",
            label: "P(1|red) =",
            placeholder: "e.g. 3/7",
            expected: bayesPlain,
            prompt: {
              en: "Probability it came from box 1, given it is red",
              he: "ההסתברות שהגיע מכד 1, בהינתן שהוא אדום",
            },
            pitfalls: [
              // P(red|box1) coincides with the posterior when redNum = a·n1·n2,
              // and a trap that equals the answer teaches nothing.
              ...(r1 * redNum === n1 * bayesNum
                ? []
                : [
              {
                value: fracPlain(r1, n1),
                id: "prob-conditional-inverted",
                why: {
                  en: `That is $P(\\text{red}\\mid\\text{box 1})$ — the conditioning is the wrong way round. You are told the ball **is** red and asked which box it came from, so the red event goes in the denominator: $P(\\text{box 1}\\mid\\text{red})=\\frac{P(\\text{box 1}\\cap\\text{red})}{P(\\text{red})}$.`,
                  he: `זהו $P(\\text{אדום}\\mid\\text{כד 1})$ — ההתניה הפוכה. נתון שהכדור **אדום** ונשאלתם מאיזה כד הגיע, ולכן מאורע ה״אדום״ נמצא במכנה: $P(\\text{כד 1}\\mid\\text{אדום})=\\frac{P(\\text{כד 1}\\cap\\text{אדום})}{P(\\text{אדום})}$.`,
                },
              },
                  ]),
              {
                value: fracPlain(a, b),
                id: "prob-ignored-evidence",
                why: {
                  en: `That is $P(\\text{box 1})$ before any ball was drawn. The colour is evidence: seeing a red ball changes how likely each box is, which is exactly what the conditional asks you to compute.`,
                  he: `זו $P(\\text{כד 1})$ לפני שהוצא כדור כלשהו. הצבע הוא ראיה: ראיית כדור אדום משנה את הסיכוי של כל כד, וזה בדיוק מה שההסתברות המותנית מבקשת לחשב.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "Draw the tree. The first split is which box, the second is which colour — every path to a red ball is one branch of the first stage followed by one of the second.",
            he: "שרטטו את העץ. הפיצול הראשון הוא באיזה כד, השני הוא איזה צבע — כל מסלול לכדור אדום הוא ענף בשלב הראשון ואחריו ענף בשלב השני.",
          },
          {
            en: `Multiply along each path and add the paths: $P(\\text{red})=${pBox1}\\cdot\\frac{${r1}}{${n1}}+${pBox2}\\cdot\\frac{${r2}}{${n2}}$.`,
            he: `הכפילו לאורך כל מסלול וחברו את המסלולים: $P(\\text{אדום})=${pBox1}\\cdot\\frac{${r1}}{${n1}}+${pBox2}\\cdot\\frac{${r2}}{${n2}}$.`,
          },
          {
            en: `For the second part, the red ball is already given. Divide the one path you care about by the total: $\\frac{${pBox1}\\cdot\\frac{${r1}}{${n1}}}{P(\\text{red})}$.`,
            he: `בחלק השני הכדור האדום כבר נתון. חלקו את המסלול הרלוונטי בסך הכול: $\\frac{${pBox1}\\cdot\\frac{${r1}}{${n1}}}{P(\\text{אדום})}$.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Draw the tree", he: "שרטוט העץ" },
            body: {
              en: `Stage one: box 1 with probability $${pBox1}$, box 2 with $${pBox2}$. Stage two: red with probability $\\frac{${r1}}{${n1}}$ from box 1, and $\\frac{${r2}}{${n2}}$ from box 2.`,
              he: `שלב ראשון: כד 1 בהסתברות $${pBox1}$, כד 2 בהסתברות $${pBox2}$. שלב שני: אדום בהסתברות $\\frac{${r1}}{${n1}}$ מכד 1, ו-$\\frac{${r2}}{${n2}}$ מכד 2.`,
            },
          },
          {
            move: 1,
            title: { en: "Multiply along, add across", he: "כפל לאורך, חיבור לרוחב" },
            body: {
              en: `$$P(\\text{red})=${pBox1}\\cdot\\frac{${r1}}{${n1}}+${pBox2}\\cdot\\frac{${r2}}{${n2}}=${redLatex}.$$`,
              he: `$$P(\\text{אדום})=${pBox1}\\cdot\\frac{${r1}}{${n1}}+${pBox2}\\cdot\\frac{${r2}}{${n2}}=${redLatex}.$$`,
            },
          },
          {
            move: 2,
            title: { en: "Reverse the conditioning", he: "היפוך ההתניה" },
            body: {
              en: `The red ball is given, so restrict to the red paths and take the share belonging to box 1: $$P(\\text{box 1}\\mid\\text{red})=\\frac{${pBox1}\\cdot\\frac{${r1}}{${n1}}}{${redLatex}}=${bayesLatex}.$$`,
              he: `הכדור האדום נתון, ולכן מצטמצמים למסלולים האדומים ולוקחים את החלק השייך לכד 1: $$P(\\text{כד 1}\\mid\\text{אדום})=\\frac{${pBox1}\\cdot\\frac{${r1}}{${n1}}}{${redLatex}}=${bayesLatex}.$$`,
            },
          },
          {
            move: 3,
            title: { en: "Sanity check", he: "בדיקת היגיון" },
            body: {
              en: `Both answers are between $0$ and $1$, and $P(\\text{box 1}\\mid\\text{red})+P(\\text{box 2}\\mid\\text{red})=1$ — the red ball came from somewhere.`,
              he: `שתי התשובות בין $0$ ל-$1$, ומתקיים $P(\\text{כד 1}\\mid\\text{אדום})+P(\\text{כד 2}\\mid\\text{אדום})=1$ — הכדור האדום הגיע מאיזשהו מקום.`,
            },
          },
        ],
        verification: [
          {
            kind: "numeric",
            label: "total probability equals the weighted branches",
            expr: `${a}/${b}*${r1}/${n1}+${w2}/${b}*${r2}/${n2}`,
            expected: redPlain,
          },
          {
            kind: "numeric",
            label: "red and not-red sum to one",
            expr: `${redPlain}+(${a}/${b}*${n1 - r1}/${n1}+${w2}/${b}*${n2 - r2}/${n2})`,
            expected: "1",
          },
          {
            kind: "numeric",
            label: "the two posteriors sum to one",
            expr: `${bayesPlain}+(${w2}*${r2}*${n1})/${redNum}`,
            expected: "1",
          },
          {
            kind: "numeric",
            label: "the posterior is a probability",
            expr: `1-(${bayesPlain})`,
            expected: "positive",
          },
        ],
      };
    }

    /* ----------------------------------------------------- binomial ------ */
    const { n, k, p, q } = cfg;
    const fail = q - p;
    const exactNum = choose(n, k) * p ** k * fail ** (n - k);
    const exactDen = q ** n;
    const exactPlain = fracPlain(exactNum, exactDen);
    const exactLatex = fracLatex(exactNum, exactDen);

    const atLeastNum = q ** n - fail ** n;
    const atLeastPlain = fracPlain(atLeastNum, exactDen);
    const atLeastLatex = fracLatex(atLeastNum, exactDen);

    const pLatex = fracLatex(p, q);
    const failLatex = fracLatex(fail, q);

    return {
      id: `probability-binomial-${rng.int(0, 1e9)}`,
      templateId: "probability",
      seed: 0,
      difficulty: 2,
      title: { en: "Repeated trials", he: "ניסויים חוזרים" },
      statement: {
        en:
          `An experiment succeeds with probability $${pLatex}$, independently each time, and is repeated $${n}$ times. ` +
          `Find the probability of exactly $${k}$ successes, and the probability of at least one success.`,
        he:
          `ניסוי מצליח בהסתברות $${pLatex}$, באופן בלתי תלוי בכל פעם, וחוזרים עליו $${n}$ פעמים. ` +
          `מצאו את ההסתברות לבדיוק $${k}$ הצלחות, ואת ההסתברות לפחות להצלחה אחת.`,
      },
      params: { kind: "binomial", n, k, p, q },
      fields: [
        {
          id: "exact",
          type: "number",
          label: `P(${k}) =`,
          placeholder: "e.g. 27/128",
          expected: exactPlain,
          prompt: {
            en: `Probability of exactly $${k}$ successes`,
            he: `ההסתברות לבדיוק $${k}$ הצלחות`,
          },
          pitfalls: [
            {
              value: fracPlain(p ** k * fail ** (n - k), exactDen),
              id: "prob-missing-coefficient",
              why: {
                en: `That is the probability of **one particular** sequence — say the first $${k}$ trials succeeding and the rest failing. But the successes can fall in any positions, and there are $\\binom{${n}}{${k}}=${choose(n, k)}$ ways to choose them, so multiply by that.`,
                he: `זו ההסתברות ל**סדר מסוים אחד** — למשל $${k}$ הניסויים הראשונים מצליחים והשאר נכשלים. אך ההצלחות יכולות ליפול בכל מקום, ויש $\\binom{${n}}{${k}}=${choose(n, k)}$ דרכים לבחור אותן, ולכן יש להכפיל בכך.`,
              },
            },
          ],
        },
        {
          id: "atLeast",
          type: "number",
          label: "P(≥1) =",
          placeholder: "e.g. 15/16",
          expected: atLeastPlain,
          prompt: {
            en: "Probability of at least one success",
            he: "ההסתברות לפחות להצלחה אחת",
          },
          pitfalls:
            2 * p === q
              ? []
              : [
                  {
                    value: fracPlain(exactDen - p ** n, exactDen),
                    id: "prob-at-least-one-complement",
                    why: {
                      en: `The complement of "at least one success" is "**no** successes" — that is $${n}$ **failures**, not $${n}$ successes. So subtract $\\left(${failLatex}\\right)^{${n}}$, not $\\left(${pLatex}\\right)^{${n}}$.`,
                      he: `המשלים של ״לפחות הצלחה אחת״ הוא ״**אפס** הצלחות״ — כלומר $${n}$ **כישלונות**, לא $${n}$ הצלחות. לכן יש לחסר $\\left(${failLatex}\\right)^{${n}}$ ולא $\\left(${pLatex}\\right)^{${n}}$.`,
                    },
                  },
                ],
        },
      ],
      hints: [
        {
          en: "The trials are independent and identical, and you are counting successes — that is the binomial model.",
          he: "הניסויים בלתי תלויים וזהים, וסופרים הצלחות — זהו המודל הבינומי.",
        },
        {
          en: `$P(\\text{exactly }k)=\\binom{${n}}{k}p^{k}(1-p)^{${n}-k}$. The binomial coefficient counts the orders in which the successes can occur.`,
          he: `$P(\\text{בדיוק }k)=\\binom{${n}}{k}p^{k}(1-p)^{${n}-k}$. המקדם הבינומי סופר את הסדרים האפשריים של ההצלחות.`,
        },
        {
          en: `"At least one" is much easier through its complement: $1-P(\\text{none})=1-\\left(${failLatex}\\right)^{${n}}$. Never sum the cases one by one.`,
          he: `״לפחות אחת״ קל בהרבה דרך המשלים: $1-P(\\text{אף אחת})=1-\\left(${failLatex}\\right)^{${n}}$. אין לסכם את המקרים אחד-אחד.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Recognise the model", he: "זיהוי המודל" },
          body: {
            en: `$${n}$ independent repetitions, each succeeding with the same probability $${pLatex}$, counting how many succeed: binomial.`,
            he: `$${n}$ חזרות בלתי תלויות, כל אחת מצליחה באותה הסתברות $${pLatex}$, וסופרים כמה הצליחו: התפלגות בינומית.`,
          },
        },
        {
          move: 1,
          title: { en: "Exactly $k$", he: "בדיוק $k$" },
          body: {
            en: `$$P=\\binom{${n}}{${k}}\\left(${pLatex}\\right)^{${k}}\\left(${failLatex}\\right)^{${n - k}}=${exactLatex}.$$`,
            he: `$$P=\\binom{${n}}{${k}}\\left(${pLatex}\\right)^{${k}}\\left(${failLatex}\\right)^{${n - k}}=${exactLatex}.$$`,
          },
        },
        {
          move: 2,
          title: { en: "At least one, via the complement", he: "לפחות אחת, דרך המשלים" },
          body: {
            en: `$$P(\\geq 1)=1-P(0)=1-\\left(${failLatex}\\right)^{${n}}=${atLeastLatex}.$$`,
            he: `$$P(\\geq 1)=1-P(0)=1-\\left(${failLatex}\\right)^{${n}}=${atLeastLatex}.$$`,
          },
        },
        {
          move: 3,
          title: { en: "Sanity check", he: "בדיקת היגיון" },
          body: {
            en: `Both are between $0$ and $1$, and "at least one" must be the larger of the two unless $${k}$ successes is the only way to succeed.`,
            he: `שתיהן בין $0$ ל-$1$, ו״לפחות אחת״ חייבת להיות הגדולה מבין השתיים, אלא אם $${k}$ הצלחות הן הדרך היחידה להצליח.`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "exactly-k matches the binomial formula",
          expr: `${choose(n, k)}*(${p}/${q})^${k}*(${fail}/${q})^${n - k}`,
          expected: exactPlain,
        },
        {
          kind: "numeric",
          label: "at-least-one is the complement of none",
          expr: `1-(${fail}/${q})^${n}`,
          expected: atLeastPlain,
        },
        {
          kind: "numeric",
          label: "the whole distribution sums to one",
          expr: Array.from(
            { length: n + 1 },
            (_, i) =>
              `${choose(n, i)}*(${p}/${q})^${i}*(${fail}/${q})^${n - i}`,
          ).join("+"),
          expected: "1",
        },
        {
          kind: "numeric",
          label: "both answers are probabilities",
          expr: `(1-(${exactPlain}))*(1-(${atLeastPlain}))`,
          expected: "positive",
        },
      ],
    };
  },
};
