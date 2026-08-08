import type { Problem, Rng, TemplateDef } from "../types";
import { sample } from "../rng";
import { fracLatex, fracPlain } from "./util";

/**
 * Exponential growth and decay: N(t) = N0 * q^t.
 *
 * Two data points fix q exactly (the gap is chosen so the root is clean), one
 * target is a whole power of q so that time comes out an integer, and a second
 * target is deliberately not, so the answer must be left as a logarithm.
 */
interface Config {
  N0: number;
  qn: number;
  qd: number;
  gap: number; // years between the two given readings
  t1: number; // time of the second reading
  power: number; // target = N0 * q^power
  decay: boolean;
  unit: "years" | "hours";
}

function draw(rng: Rng): Config | null {
  const decay = rng.next() < 0.45;
  const [qn, qd] = decay
    ? rng.pick([
        [1, 2],
        [1, 3],
        [2, 3],
        [3, 4],
        [4, 5],
      ])
    : rng.pick([
        [2, 1],
        [3, 1],
        [5, 2],
        [3, 2],
        [4, 3],
      ]);

  const gap = rng.pick([2, 3]);
  const t1 = gap;
  const power = rng.int(gap + 1, 8);

  // N0 must absorb the denominators so both readings stay whole.
  const N0 = rng.int(2, 9) * qd ** Math.max(gap, power);
  if (N0 > 5_000_000) return null;

  const unit = decay ? "hours" : "years";
  return { N0, qn, qd, gap, t1, power, decay, unit };
}

export const growthDecay: TemplateDef = {
  id: "growth-decay",
  topic: "algebra",
  name: { en: "Growth and decay", he: "גדילה ודעיכה" },
  blurb: {
    en: "Two readings fix the model; logarithms invert it to find the time.",
    he: "שתי מדידות קובעות את המודל; לוגריתמים הופכים אותו למציאת הזמן.",
  },

  generate(rng: Rng): Problem {
    const { N0, qn, qd, t1, power, decay, unit } = sample(rng, () => draw(rng));

    const qPlain = fracPlain(qn, qd);
    const qLatex = qd === 1 ? String(qn) : fracLatex(qn, qd);

    // Second reading, exact.
    const N1n = N0 * qn ** t1;
    const N1 = N1n / qd ** t1;

    // A target that is a whole power of q, so the time is an integer.
    const targetExact = (N0 * qn ** power) / qd ** power;

    // A target that is not, so the answer must stay logarithmic.
    const oddTarget = decay ? Math.round(N0 / 7) : N0 * 7;
    const oddTime = `log(${oddTarget}/${N0})/log(${qPlain})`;
    const oddTimeLatex = `\\dfrac{\\ln\\left(\\frac{${oddTarget}}{${N0}}\\right)}{\\ln\\left(${qLatex}\\right)}`;

    const unitEn = unit === "years" ? "years" : "hours";
    const unitHe = unit === "years" ? "שנים" : "שעות";
    const noun = decay
      ? { en: "the mass of a sample (in grams)", he: "מסת הדגימה (בגרמים)" }
      : { en: "the population of a colony", he: "גודל המושבה" };

    return {
      id: `growth-decay-${rng.int(0, 1e9)}`,
      templateId: "growth-decay",
      seed: 0,
      difficulty: 2,
      title: {
        en: decay ? "Exponential decay" : "Exponential growth",
        he: decay ? "דעיכה מעריכית" : "גדילה מעריכית",
      },
      statement: {
        en:
          `A quantity changes exponentially, so that ${noun.en} after $t$ ${unitEn} is $N(t)=N_0\\cdot q^{\\,t}$. ` +
          `At $t=0$ it measures $${N0}$, and after $${t1}$ ${unitEn} it measures $${N1}$. ` +
          `Find the ${decay ? "decay" : "growth"} factor $q$ per ${unit === "years" ? "year" : "hour"}, ` +
          `the time at which the quantity reaches $${targetExact}$, ` +
          `and the time at which it reaches $${oddTarget}$ (leave this one as an exact expression).`,
        he:
          `גודל משתנה באופן מעריכי, כך ש${noun.he} לאחר $t$ ${unitHe} הוא $N(t)=N_0\\cdot q^{\\,t}$. ` +
          `ב-$t=0$ נמדד הערך $${N0}$, ולאחר $${t1}$ ${unitHe} נמדד הערך $${N1}$. ` +
          `מצאו את מקדם ה${decay ? "דעיכה" : "גדילה"} $q$ ל${unit === "years" ? "שנה" : "שעה"}, ` +
          `את הזמן שבו הגודל מגיע ל-$${targetExact}$, ` +
          `ואת הזמן שבו הוא מגיע ל-$${oddTarget}$ (השאירו ביטוי מדויק).`,
      },
      params: { N0, qn, qd, t1, power, decay: String(decay) },
      fields: [
        {
          id: "q",
          type: "number",
          label: "q =",
          expected: qPlain,
          placeholder: "e.g. 3/2",
          prompt: {
            en: `${decay ? "Decay" : "Growth"} factor $q$`,
            he: `מקדם ה${decay ? "דעיכה" : "גדילה"} $q$`,
          },
          pitfalls: [
            {
              value: fracPlain(N1n, N0 * qd ** t1),
              why: {
                en: `That is $q^{${t1}}$ — the factor over the whole $${t1}$ ${unitEn}, not per ${unit === "years" ? "year" : "hour"}. Take the ${t1 === 2 ? "square" : "cube"} root.`,
                he: `זהו $q^{${t1}}$ — המקדם עבור כל $${t1}$ ה${unitHe}, ולא ל${unit === "years" ? "שנה" : "שעה"}. הוציאו שורש ${t1 === 2 ? "ריבועי" : "שלישי"}.`,
              },
            },
            {
              value: fracPlain(qd, qn),
              why: {
                en: `That is $\\frac{1}{q}$ — the factor upside down. Check the direction: the quantity ${decay ? "falls, so $q<1$" : "rises, so $q>1$"}.`,
                he: `זהו $\\frac{1}{q}$ — המקדם הפוך. בדקו את הכיוון: הגודל ${decay ? "יורד, ולכן $q<1$" : "עולה, ולכן $q>1$"}.`,
              },
            },
          ],
        },
        {
          id: "tExact",
          type: "number",
          label: "t =",
          expected: String(power),
          placeholder: "e.g. 5",
          prompt: {
            en: `Time to reach $${targetExact}$ (${unitEn})`,
            he: `הזמן להגיע ל-$${targetExact}$ (${unitHe})`,
          },
        },
        {
          id: "tLog",
          type: "expression",
          label: "t =",
          expected: oddTime,
          placeholder: "ln(...)/ln(...)",
          prompt: {
            en: `Time to reach $${oddTarget}$, exactly`,
            he: `הזמן להגיע ל-$${oddTarget}$, במדויק`,
          },
          pitfalls: [
            {
              value: `log(${oddTarget})/log(${N0})`,
              why: {
                en: "$\\ln$ of a quotient is a **difference** of logs, not a quotient of logs: $\\ln\\frac{A}{B}=\\ln A-\\ln B$, which is not $\\frac{\\ln A}{\\ln B}$.",
                he: "$\\ln$ של מנה הוא **הפרש** לוגריתמים ולא מנה של לוגריתמים: $\\ln\\frac{A}{B}=\\ln A-\\ln B$, וזה אינו $\\frac{\\ln A}{\\ln B}$.",
              },
            },
          ],
        },
      ],
      hints: [
        {
          en: `At $t=0$ the model gives $N(0)=N_0$, so the first reading hands you $N_0$ directly. Substitute the second reading to get an equation in $q$ alone.`,
          he: `ב-$t=0$ המודל נותן $N(0)=N_0$, ולכן המדידה הראשונה נותנת מיד את $N_0$. הציבו את המדידה השנייה כדי לקבל משוואה ב-$q$ בלבד.`,
        },
        {
          en: `$${N1} = ${N0}\\cdot q^{${t1}}$, so $q^{${t1}} = \\frac{${N1}}{${N0}}$. Take the ${t1 === 2 ? "square" : "cube"} root — do not stop at $q^{${t1}}$.`,
          he: `$${N1} = ${N0}\\cdot q^{${t1}}$, ולכן $q^{${t1}} = \\frac{${N1}}{${N0}}$. הוציאו שורש ${t1 === 2 ? "ריבועי" : "שלישי"} — אל תעצרו ב-$q^{${t1}}$.`,
        },
        {
          en: `To invert $N_0q^{\\,t}=M$, divide then take $\\ln$ of both sides: $t=\\frac{\\ln\\left(M/N_0\\right)}{\\ln q}$. When $M/N_0$ happens to be a whole power of $q$, the logs cancel and $t$ is an integer.`,
          he: `כדי להפוך את $N_0q^{\\,t}=M$, חלקו ואז קחו $\\ln$ משני האגפים: $t=\\frac{\\ln\\left(M/N_0\\right)}{\\ln q}$. כאשר $M/N_0$ הוא חזקה שלמה של $q$, הלוגריתמים מצטמצמים ו-$t$ שלם.`,
        },
      ],
      steps: [
        {
          move: 0,
          title: { en: "Set up the model", he: "בניית המודל" },
          body: {
            en: `$N(t)=N_0\\cdot q^{\\,t}$. Substituting $t=0$ gives $N(0)=N_0$, so directly $$N_0=${N0}.$$`,
            he: `$N(t)=N_0\\cdot q^{\\,t}$. הצבת $t=0$ נותנת $N(0)=N_0$, ולכן ישירות $$N_0=${N0}.$$`,
          },
        },
        {
          move: 1,
          title: { en: "Use the second reading for $q$", he: "שימוש במדידה השנייה עבור $q$" },
          body: {
            en: `$$${N1}=${N0}\\cdot q^{${t1}} \\;\\Rightarrow\\; q^{${t1}}=${fracLatex(N1n, N0 * qd ** t1)} \\;\\Rightarrow\\; q=${qLatex}.$$ ${decay ? "As expected for decay, $q<1$." : "As expected for growth, $q>1$."}`,
            he: `$$${N1}=${N0}\\cdot q^{${t1}} \\;\\Rightarrow\\; q^{${t1}}=${fracLatex(N1n, N0 * qd ** t1)} \\;\\Rightarrow\\; q=${qLatex}.$$ ${decay ? "כצפוי בדעיכה, $q<1$." : "כצפוי בגדילה, $q>1$."}`,
          },
        },
        {
          move: 2,
          title: { en: "Invert with logarithms", he: "היפוך בעזרת לוגריתמים" },
          body: {
            en: `From $${N0}\\cdot q^{\\,t}=M$ we get $q^{\\,t}=\\frac{M}{${N0}}$ and hence $$t=\\frac{\\ln\\left(M/${N0}\\right)}{\\ln q}.$$ For $M=${targetExact}$ the quotient is exactly $q^{${power}}$, so the logarithms cancel and $t=${power}$.`,
            he: `מתוך $${N0}\\cdot q^{\\,t}=M$ נובע $q^{\\,t}=\\frac{M}{${N0}}$ ולכן $$t=\\frac{\\ln\\left(M/${N0}\\right)}{\\ln q}.$$ עבור $M=${targetExact}$ המנה היא בדיוק $q^{${power}}$, ולכן הלוגריתמים מצטמצמים ומתקבל $t=${power}$.`,
          },
        },
        {
          move: 3,
          title: { en: "Answer in the units asked", he: "מענה ביחידות הנדרשות" },
          body: {
            en: `For $M=${oddTarget}$ the quotient is not a whole power of $q$, so the exact answer stays logarithmic: $$t=${oddTimeLatex}\\ \\text{${unitEn}}.$$`,
            he: `עבור $M=${oddTarget}$ המנה אינה חזקה שלמה של $q$, ולכן התשובה המדויקת נשארת לוגריתמית: $$t=${oddTimeLatex}\\ \\text{${unitHe}}.$$`,
          },
        },
      ],
      verification: [
        {
          kind: "numeric",
          label: "the second reading is reproduced by the model",
          expr: `${N0}*(${qPlain})^${t1}`,
          expected: String(N1),
        },
        {
          kind: "numeric",
          label: "the exact target is hit at the claimed time",
          expr: `${N0}*(${qPlain})^${power}`,
          expected: String(targetExact),
        },
        {
          kind: "numeric",
          label: "the logarithmic time hits its target",
          expr: `${N0}*(${qPlain})^(${oddTime})`,
          expected: String(oddTarget),
        },
        {
          kind: "numeric",
          label: "the direction of change is consistent",
          expr: decay ? `1-(${qPlain})` : `(${qPlain})-1`,
          expected: "positive",
        },
      ],
    };
  },
};
