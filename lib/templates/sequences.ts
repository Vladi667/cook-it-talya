import type { Pitfall, Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { fracLatex, fracPlain, paren, signed } from "./util";

/**
 * Arithmetic and geometric sequences. Two terms are given; recover the
 * difference or ratio, walk back to the first term, then sum.
 *
 * Parameters are chosen so the ratio comes out of an exact k-th root and
 * every sum is rational.
 */

interface Arith {
  kind: "arith";
  a1: number;
  d: number;
  m: number;
  n: number;
  k: number; // how many terms to sum
}

interface Geo {
  kind: "geo";
  a1: number;
  qn: number; // ratio numerator
  qd: number; // ratio denominator
  m: number;
  n: number;
  k: number;
  infinite: boolean;
}

type Config = Arith | Geo;

function drawArith(rng: Rng): Config | null {
  const a1 = rng.nonZeroInt(-12, 15);
  const d = rng.nonZeroInt(-7, 9);
  const m = rng.int(2, 5);
  const n = m + rng.int(2, 6);
  const k = rng.pick([10, 12, 15, 20, 25, 30]);
  if (Math.abs(a1 + (n - 1) * d) > 200) return null;
  return { kind: "arith", a1, d, m, n, k };
}

function drawGeo(rng: Rng): Config | null {
  // The gap between the two given terms is the power the ratio is raised to.
  const gap = rng.pick([2, 3]);
  const infinite = rng.next() < 0.45;

  let qn: number, qd: number;
  if (infinite) {
    // |q| < 1 so the infinite sum converges.
    [qn, qd] = rng.pick([
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [-1, 2],
      [-1, 3],
      [-2, 3],
    ]);
  } else {
    [qn, qd] = rng.pick([
      [2, 1],
      [3, 1],
      [4, 1],
      [-2, 1],
      [-3, 1],
      [1, 2],
      [1, 3],
    ]);
  }
  // A negative ratio raised to an even gap loses its sign — unrecoverable.
  if (qn < 0 && gap % 2 === 0) return null;

  const a1 = rng.nonZeroInt(-6, 12) * (qd === 1 ? 1 : qd ** 2);
  if (Math.abs(a1) > 200 || a1 === 0) return null;

  const m = rng.int(2, 4);
  const n = m + gap;
  const k = rng.pick([5, 6, 7, 8]);
  return { kind: "geo", a1, qn, qd, m, n, k, infinite };
}

function draw(rng: Rng): Config | null {
  return rng.next() < 0.5 ? drawArith(rng) : drawGeo(rng);
}

export const sequences: TemplateDef = {
  id: "sequences",
  topic: "algebra",
  name: { en: "Sequences", he: "סדרות" },
  blurb: {
    en: "Two terms fix the difference or ratio; then walk back and sum.",
    he: "שני איברים קובעים את ההפרש או המנה; משם חוזרים אחורה ומסכמים.",
  },

  generate(rng: Rng): Problem {
    const cfg = sample(rng, () => draw(rng));

    if (cfg.kind === "arith") {
      const { a1, d, m, n, k } = cfg;
      const am = a1 + (m - 1) * d;
      const an = a1 + (n - 1) * d;
      const sk = (k * (2 * a1 + (k - 1) * d)) / 2;

      return {
        id: `sequences-arith-${rng.int(0, 1e9)}`,
        templateId: "sequences",
        seed: 0,
        difficulty: 1,
        title: { en: "Arithmetic sequence", he: "סדרה חשבונית" },
        statement: {
          en:
            `In an arithmetic sequence, $a_{${m}} = ${am}$ and $a_{${n}} = ${an}$. ` +
            `Find the common difference $d$, the first term $a_1$, and the sum of the first $${k}$ terms.`,
          he:
            `בסדרה חשבונית נתון $a_{${m}} = ${am}$ וגם $a_{${n}} = ${an}$. ` +
            `מצאו את ההפרש $d$, את האיבר הראשון $a_1$, ואת סכום $${k}$ האיברים הראשונים.`,
        },
        params: { kind: "arith", a1, d, m, n, k },
        fields: [
          {
            id: "d",
            type: "number",
            label: "d =",
            expected: String(d),
            placeholder: "e.g. 4",
            prompt: { en: "Common difference $d$", he: "ההפרש $d$" },
            pitfalls: [
              {
                value: fracPlain(an - am, n - m + 1),
                id: "seq-steps-not-terms",
                why: {
                  en: `There are $${n} - ${m} = ${n - m}$ **steps** between $a_{${m}}$ and $a_{${n}}$, not $${n - m + 1}$. Count the gaps, not the terms.`,
                  he: `יש $${n} - ${m} = ${n - m}$ **צעדים** בין $a_{${m}}$ ל-$a_{${n}}$, ולא $${n - m + 1}$. ספרו את המרווחים, לא את האיברים.`,
                },
              },
            ],
          },
          {
            id: "a1",
            type: "number",
            label: "a₁ =",
            expected: String(a1),
            placeholder: "e.g. -3",
            prompt: { en: "First term $a_1$", he: "האיבר הראשון $a_1$" },
            // Walking back correctly from your own d still shows the method.
            followsFrom: {
              fields: ["d"],
              expected: (prior) => {
                const theirD = prior.d?.[0];
                if (theirD === undefined) return null;
                return `${am}-${m - 1}*(${theirD})`;
              },
            },
            pitfalls: [
              {
                value: String(am - m * d),
                id: "seq-off-by-one",
                why: {
                  en: `Off by one step. $a_{${m}} = a_1 + (${m}-1)d$, so you subtract $${m - 1}d$, not $${m}d$.`,
                  he: `סטייה של צעד אחד. מתקיים $a_{${m}} = a_1 + (${m}-1)d$, ולכן מחסרים $${m - 1}d$ ולא $${m}d$.`,
                },
              },
            ],
          },
          {
            id: "sum",
            type: "number",
            label: `S_${k} =`,
            expected: String(sk),
            placeholder: "e.g. 210",
            prompt: {
              en: `Sum of the first $${k}$ terms`,
              he: `סכום $${k}$ האיברים הראשונים`,
            },
            followsFrom: {
              fields: ["a1", "d"],
              expected: (prior) => {
                const theirA1 = prior.a1?.[0];
                const theirD = prior.d?.[0];
                if (theirA1 === undefined || theirD === undefined) return null;
                return `${k}/2*(2*(${theirA1})+(${k}-1)*(${theirD}))`;
              },
            },
            pitfalls: [
              {
                value: String(k * (2 * a1 + k * d) / 2),
                id: "seq-sum-last-term",
                why: {
                  en: `The last term of the sum is $a_{${k}} = a_1 + (${k}-1)d$, so the bracket is $2a_1 + (${k}-1)d$ — one $d$ fewer than you used.`,
                  he: `האיבר האחרון בסכום הוא $a_{${k}} = a_1 + (${k}-1)d$, ולכן בסוגריים $2a_1 + (${k}-1)d$ — $d$ אחד פחות ממה שהשתמשתם.`,
                },
              },
            ],
          },
        ],
        hints: [
          {
            en: "In an arithmetic sequence every step adds the same $d$. How many steps separate the two terms you were given?",
            he: "בסדרה חשבונית כל צעד מוסיף אותו $d$. כמה צעדים מפרידים בין שני האיברים הנתונים?",
          },
          {
            en: `$a_{${n}} - a_{${m}} = (${n}-${m})d$. That single line gives $d$ immediately.`,
            he: `$a_{${n}} - a_{${m}} = (${n}-${m})d$. השורה הזו נותנת מיד את $d$.`,
          },
          {
            en: `With $d$ known, walk back: $a_1 = a_{${m}} - (${m}-1)d$. Then $S_n=\\frac{n}{2}\\left[2a_1+(n-1)d\\right]$.`,
            he: `כאשר $d$ ידוע, חוזרים אחורה: $a_1 = a_{${m}} - (${m}-1)d$. לאחר מכן $S_n=\\frac{n}{2}\\left[2a_1+(n-1)d\\right]$.`,
          },
        ],
        steps: [
          {
            move: 0,
            title: { en: "Which kind of sequence?", he: "איזה סוג סדרה?" },
            body: {
              en: `It is arithmetic, so consecutive terms differ by a constant $d$ and $a_j = a_1 + (j-1)d$.`,
              he: `הסדרה חשבונית, ולכן ההפרש בין איברים עוקבים קבוע ומתקיים $a_j = a_1 + (j-1)d$.`,
            },
          },
          {
            move: 1,
            title: { en: "Isolate $d$", he: "בידוד $d$" },
            body: {
              en: `$$a_{${n}}-a_{${m}} = (${n}-${m})d \\;\\Rightarrow\\; ${an} - ${paren(am)} = ${n - m}d \\;\\Rightarrow\\; d = ${d}.$$`,
              he: `$$a_{${n}}-a_{${m}} = (${n}-${m})d \\;\\Rightarrow\\; ${an} - ${paren(am)} = ${n - m}d \\;\\Rightarrow\\; d = ${d}.$$`,
            },
          },
          {
            move: 2,
            title: { en: "Walk back to $a_1$", he: "חזרה אל $a_1$" },
            body: {
              en: `$$a_1 = a_{${m}} - (${m}-1)d = ${am} - ${m - 1}\\cdot${paren(d)} = ${a1}.$$`,
              he: `$$a_1 = a_{${m}} - (${m}-1)d = ${am} - ${m - 1}\\cdot${paren(d)} = ${a1}.$$`,
            },
          },
          {
            move: 3,
            title: { en: "Sum", he: "סכום" },
            body: {
              en: `$$S_{${k}}=\\frac{${k}}{2}\\left[2\\cdot${paren(a1)}+(${k}-1)\\cdot${paren(d)}\\right]=${sk}.$$`,
              he: `$$S_{${k}}=\\frac{${k}}{2}\\left[2\\cdot${paren(a1)}+(${k}-1)\\cdot${paren(d)}\\right]=${sk}.$$`,
            },
          },
        ],
        verification: [
          {
            kind: "numeric",
            label: "the m-th term matches",
            expr: `${a1}+(${m}-1)*${paren(d)}`,
            expected: String(am),
          },
          {
            kind: "numeric",
            label: "the n-th term matches",
            expr: `${a1}+(${n}-1)*${paren(d)}`,
            expected: String(an),
          },
          {
            kind: "numeric",
            label: "the sum matches the closed form",
            expr: `${k}/2*(2*${paren(a1)}+(${k}-1)*${paren(d)})`,
            expected: String(sk),
          },
        ],
      };
    }

    // geometric
    const { a1, qn, qd, m, n, k, infinite } = cfg;
    const gap = n - m;
    const qLatex = qd === 1 ? String(qn) : fracLatex(qn, qd);
    const qPlain = fracPlain(qn, qd);
    const q = qn / qd;

    const amS = fracPlain(a1 * qn ** (m - 1), qd ** (m - 1));
    const anS = fracPlain(a1 * qn ** (n - 1), qd ** (n - 1));
    const amL = fracLatex(a1 * qn ** (m - 1), qd ** (m - 1));
    const anL = fracLatex(a1 * qn ** (n - 1), qd ** (n - 1));

    // S_k = a1 (q^k - 1)/(q - 1); S_inf = a1/(1-q)
    const sumPlain = infinite
      ? fracPlain(a1 * qd, qd - qn)
      : fracPlain(a1 * (qn ** k - qd ** k), qd ** (k - 1) * (qn - qd));
    const sumLatex = infinite
      ? fracLatex(a1 * qd, qd - qn)
      : fracLatex(a1 * (qn ** k - qd ** k), qd ** (k - 1) * (qn - qd));

    const sumPrompt = infinite
      ? { en: "Sum to infinity $S_\\infty$", he: "הסכום עד אינסוף $S_\\infty$" }
      : {
          en: `Sum of the first $${k}$ terms`,
          he: `סכום $${k}$ האיברים הראשונים`,
        };

    const sumPitfalls: Pitfall[] = infinite
      ? [
          {
            value: fracPlain(a1 * qd, qd + qn),
            id: "seq-infinite-sign",
            why: {
              en: `The formula is $S_\\infty=\\frac{a_1}{1-q}$, not $\\frac{a_1}{1+q}$. With $q=${qLatex}$ the denominator is $1-${qLatex}$.`,
              he: `הנוסחה היא $S_\\infty=\\frac{a_1}{1-q}$ ולא $\\frac{a_1}{1+q}$. עבור $q=${qLatex}$ המכנה הוא $1-${qLatex}$.`,
            },
          },
        ]
      : [];

    return {
      id: `sequences-geo-${rng.int(0, 1e9)}`,
      templateId: "sequences",
      seed: 0,
      difficulty: 2,
      title: { en: "Geometric sequence", he: "סדרה הנדסית" },
      statement: {
        en:
          `In a geometric sequence, $a_{${m}} = ${amL}$ and $a_{${n}} = ${anL}$. ` +
          `Find the common ratio $q$, the first term $a_1$, and ` +
          (infinite
            ? `the sum of the infinite series.`
            : `the sum of the first $${k}$ terms.`),
        he:
          `בסדרה הנדסית נתון $a_{${m}} = ${amL}$ וגם $a_{${n}} = ${anL}$. ` +
          `מצאו את המנה $q$, את האיבר הראשון $a_1$, ואת ` +
          (infinite
            ? `סכום הטור האינסופי.`
            : `סכום $${k}$ האיברים הראשונים.`),
      },
      params: { kind: "geo", a1, qn, qd, m, n, k, infinite: String(infinite) },
      fields: [
        {
          id: "q",
          type: "number",
          label: "q =",
          expected: qPlain,
          placeholder: "e.g. 1/2",
          prompt: { en: "Common ratio $q$", he: "המנה $q$" },
          pitfalls: [
            {
              // q^gap: the ratio between the two given terms, mistaken for q
              value: fracPlain(qn ** gap, qd ** gap),
              id: "seq-ratio-is-power",
              why: {
                en: `That is $q^{${gap}}$, the ratio between the two given terms — not $q$ itself. There are $${gap}$ steps between them, so take the ${gap === 2 ? "square" : "cube"} root.`,
                he: `זהו $q^{${gap}}$, היחס בין שני האיברים הנתונים — לא $q$ עצמו. יש ביניהם $${gap}$ צעדים, ולכן יש להוציא שורש ${gap === 2 ? "ריבועי" : "שלישי"}.`,
              },
            },
          ],
        },
        {
          id: "a1",
          type: "number",
          label: "a₁ =",
          expected: String(a1),
          placeholder: "e.g. 8",
          prompt: { en: "First term $a_1$", he: "האיבר הראשון $a_1$" },
        },
        {
          id: "sum",
          type: "number",
          label: infinite ? "S∞ =" : `S_${k} =`,
          expected: sumPlain,
          placeholder: "e.g. 32/3",
          prompt: sumPrompt,
          pitfalls: sumPitfalls,
        },
      ],
      hints: [
        {
          en: "Consecutive terms have a constant **ratio** here, not a constant difference. Divide the two given terms.",
          he: "כאן היחס בין איברים עוקבים קבוע, ולא ההפרש. חלקו את שני האיברים הנתונים.",
        },
        {
          en: `$\\frac{a_{${n}}}{a_{${m}}} = q^{${gap}}$, because there are $${gap}$ steps between them.`,
          he: `$\\frac{a_{${n}}}{a_{${m}}} = q^{${gap}}$, כי יש ביניהם $${gap}$ צעדים.`,
        },
        {
          en: infinite
            ? `Take the ${gap === 2 ? "square" : "cube"} root for $q$, walk back with $a_1=\\frac{a_{${m}}}{q^{${m - 1}}}$, then use $S_\\infty=\\frac{a_1}{1-q}$, which is valid because $|q|<1$.`
            : `Take the ${gap === 2 ? "square" : "cube"} root for $q$, walk back with $a_1=\\frac{a_{${m}}}{q^{${m - 1}}}$, then use $S_n=\\frac{a_1\\left(q^{n}-1\\right)}{q-1}$.`,
          he: infinite
            ? `הוציאו שורש ${gap === 2 ? "ריבועי" : "שלישי"} עבור $q$, חזרו אחורה עם $a_1=\\frac{a_{${m}}}{q^{${m - 1}}}$, ואז השתמשו ב-$S_\\infty=\\frac{a_1}{1-q}$, שתקף כי $|q|<1$.`
            : `הוציאו שורש ${gap === 2 ? "ריבועי" : "שלישי"} עבור $q$, חזרו אחורה עם $a_1=\\frac{a_{${m}}}{q^{${m - 1}}}$, ואז השתמשו ב-$S_n=\\frac{a_1\\left(q^{n}-1\\right)}{q-1}$.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Which kind of sequence?", he: "איזה סוג סדרה?" },
          body: {
            en: `It is geometric: consecutive terms have a constant ratio, and $a_j = a_1 q^{\\,j-1}$.`,
            he: `הסדרה הנדסית: היחס בין איברים עוקבים קבוע, ומתקיים $a_j = a_1 q^{\\,j-1}$.`,
          },
        },
        {
          move: 1,
          title: { en: "Isolate $q$", he: "בידוד $q$" },
          body: {
            en: `$$\\frac{a_{${n}}}{a_{${m}}} = q^{${gap}} = \\frac{${anL}}{${amL}} \\;\\Rightarrow\\; q = ${qLatex}.$$`,
            he: `$$\\frac{a_{${n}}}{a_{${m}}} = q^{${gap}} = \\frac{${anL}}{${amL}} \\;\\Rightarrow\\; q = ${qLatex}.$$`,
          },
        },
        {
          move: 2,
          title: { en: "Walk back to $a_1$", he: "חזרה אל $a_1$" },
          body: {
            en: `$$a_1 = \\frac{a_{${m}}}{q^{${m - 1}}} = ${a1}.$$`,
            he: `$$a_1 = \\frac{a_{${m}}}{q^{${m - 1}}} = ${a1}.$$`,
          },
        },
        {
          move: 3,
          title: { en: "Sum", he: "סכום" },
          body: {
            en: infinite
              ? `Since $|q| = \\left|${qLatex}\\right| < 1$ the series converges: $$S_\\infty=\\frac{a_1}{1-q}=\\frac{${a1}}{1-${qLatex}}=${sumLatex}.$$`
              : `$$S_{${k}}=\\frac{a_1\\left(q^{${k}}-1\\right)}{q-1}=${sumLatex}.$$`,
            he: infinite
              ? `מכיוון ש-$|q| = \\left|${qLatex}\\right| < 1$ הטור מתכנס: $$S_\\infty=\\frac{a_1}{1-q}=\\frac{${a1}}{1-${qLatex}}=${sumLatex}.$$`
              : `$$S_{${k}}=\\frac{a_1\\left(q^{${k}}-1\\right)}{q-1}=${sumLatex}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "the m-th term matches",
          expr: `${a1}*(${qPlain})^(${m}-1)`,
          expected: amS,
        },
        {
          kind: "numeric",
          label: "the n-th term matches",
          expr: `${a1}*(${qPlain})^(${n}-1)`,
          expected: anS,
        },
        {
          kind: "numeric",
          label: "the sum matches the closed form",
          expr: infinite
            ? `${a1}/(1-(${qPlain}))`
            : `${a1}*((${qPlain})^${k}-1)/((${qPlain})-1)`,
          expected: sumPlain,
        },
      ],
    };
  },
};
