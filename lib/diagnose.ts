import { checkAnswer, type CheckResult } from "./checker";
import type { AnswerField, Problem, Text } from "./types";

/**
 * Deterministic "why was I wrong?" — no LLM, no API key, no network.
 *
 * Everything needed is already known: the correct answer, the student's
 * parsed input, the ordered solution steps, and the pitfalls each template
 * declares. Rules are tried most-specific first.
 */

export type DiagnosisKind =
  | "empty"
  | "syntax"
  | "pitfall"
  | "crossfield"
  | "sign"
  | "factor2"
  | "close"
  | "count"
  | "step";

export interface Diagnosis {
  fieldId: string;
  kind: DiagnosisKind;
  text: Text;
  /** Set when a named pitfall matched, so repeat offences can be counted. */
  trapId?: string;
}

export function diagnoseField(
  problem: Problem,
  field: AnswerField,
  input: string,
  result: CheckResult,
): Diagnosis | null {
  if (result.correct) return null;
  const make = (
    kind: DiagnosisKind,
    text: Text,
    trapId?: string,
  ): Diagnosis => ({
    fieldId: field.id,
    kind,
    text,
    trapId,
  });

  const trimmed = (input ?? "").trim();

  if (!trimmed)
    return make("empty", {
      en: "You left this part blank. Even a partial attempt is worth writing down — in the Bagrut, method earns marks.",
      he: "החלק הזה נשאר ריק. גם ניסיון חלקי שווה לרשום — בבגרות הדרך מזכה בנקודות.",
    });

  if (result.hint === "parse")
    return make("syntax", {
      en: "I could not read that. Write roots as $\\texttt{sqrt(2)}$ or $\\texttt{2\\^{}0.5}$, fractions as $\\texttt{3/4}$, logs as $\\texttt{ln(x)}$, and powers with $\\texttt{\\^{}}$.",
      he: "לא הצלחתי לקרוא את התשובה. כתבו שורשים כ-$\\texttt{sqrt(2)}$ או $\\texttt{2\\^{}0.5}$, שברים כ-$\\texttt{3/4}$, לוגריתמים כ-$\\texttt{ln(x)}$, וחזקות עם $\\texttt{\\^{}}$.",
    });

  // 1. A mistake this template knows about by name.
  for (const pitfall of field.pitfalls ?? []) {
    if (matches(trimmed, pitfall.value, field))
      return make("pitfall", pitfall.why, pitfall.id);
  }

  // 2. The right answer — to a different part of the question.
  for (const other of problem.fields) {
    if (other.id === field.id) continue;
    if (matches(trimmed, other.expected, other)) {
      return make("crossfield", {
        en: `That is the correct answer to a different part of this question — “${plain(other.prompt.en)}”. Re-read what this part is asking for.`,
        he: `זו התשובה הנכונה לחלק אחר של השאלה — ״${plain(other.prompt.he)}״. קראו שוב מה נדרש בחלק הזה.`,
      });
    }
  }

  // 3. Shape-of-the-error hints from the checker.
  if (result.hint === "sign")
    return make("sign", {
      en: "The magnitude is right but the sign is not. Track the minus signs — most often one is dropped when substituting a negative coordinate or when subtracting the lower bound.",
      he: "הגודל נכון אך הסימן לא. עקבו אחרי סימני המינוס — לרוב אחד מהם נופל בהצבת שיעור שלילי או בחיסור הגבול התחתון.",
    });

  if (result.hint === "factor2")
    return make("factor2", {
      en: "You are off by a factor of exactly 2 — look for a $\\frac{1}{2}$ that was dropped or applied twice (a midpoint, a triangle area, or the $\\frac{1}{2}$ in an antiderivative).",
      he: "יש הפרש של פי 2 בדיוק — חפשו $\\frac{1}{2}$ שנשמט או הוחל פעמיים (אמצע קטע, שטח משולש, או ה-$\\frac{1}{2}$ בפונקציה קדומה).",
    });

  if (result.hint === "close")
    return make("close", {
      en: "Very close — the method is right and the slip is arithmetic. Redo the final substitution carefully.",
      he: "קרוב מאוד — הדרך נכונה והטעות היא חשבונית. בצעו שוב בזהירות את ההצבה האחרונה.",
    });

  if (result.hint === "count" || result.hint === "arity")
    return make("count", {
      en: "You gave a different number of answers than this part expects. Check whether it asks for one object or several.",
      he: "מספר התשובות שונה מהנדרש בחלק הזה. בדקו אם מבקשים עצם אחד או כמה.",
    });

  // 4. Nothing specific matched: point at where the work for this part starts.
  const step = problem.steps[0];
  return make("step", {
    en: `No standard slip matches this one, so the divergence is earlier in the method. Start from “${plain(step.title.en)}” below and check each line against your own.`,
    he: `אף טעות אופיינית לא מתאימה כאן, ולכן ההבדל נמצא מוקדם יותר בדרך. התחילו מ״${plain(step.title.he)}״ שלמטה והשוו כל שורה לשלכם.`,
  });
}

export function diagnose(
  problem: Problem,
  answers: Record<string, string>,
  results: Record<string, CheckResult>,
): Diagnosis[] {
  const out: Diagnosis[] = [];
  for (const field of problem.fields) {
    const result = results[field.id];
    if (!result) continue;
    const d = diagnoseField(problem, field, answers[field.id] ?? "", result);
    if (d) out.push(d);
  }
  return out;
}

function matches(input: string, candidate: string, field: AnswerField): boolean {
  try {
    return checkAnswer(input, candidate, field.type, {
      vars: field.vars,
      sampleRange: field.sampleRange,
    }).correct;
  } catch {
    return false;
  }
}

/** Strips inline math delimiters so a prompt can be quoted inside a sentence. */
function plain(text: string): string {
  return text.replace(/\$/g, "").trim();
}
