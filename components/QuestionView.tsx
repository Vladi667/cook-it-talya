"use client";

import type { CheckResult } from "@/lib/checker";
import type { AnswerField, Lang, Problem } from "@/lib/types";
import { t, tx, HINT_KEY_MAP, UI } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";
import { MathText } from "./MathText";
import { AnswerInput } from "./AnswerInput";
import { Sketch } from "./Sketch";

export function TopicLine({ problem, lang }: { problem: Problem; lang: Lang }) {
  const template = TEMPLATES[problem.templateId];
  return (
    <div className="plate flex items-center gap-2 text-faint">
      <span className="text-muted">{tx(template.name, lang)}</span>
      <span aria-hidden className="text-rule">
        ·
      </span>
      <span aria-label={`difficulty ${problem.difficulty} of 3`}>
        <span className="text-accent">{"●".repeat(problem.difficulty)}</span>
        <span className="text-rule">{"●".repeat(3 - problem.difficulty)}</span>
      </span>
    </div>
  );
}

export function Statement({
  problem,
  lang,
}: {
  problem: Problem;
  lang: Lang;
}) {
  return (
    <>
      <MathText
        text={problem.statement[lang]}
        className="mt-3 font-serif text-[1.15rem] leading-relaxed sm:text-[1.22rem]"
      />
      {problem.figure && <Sketch figure={problem.figure} />}
    </>
  );
}

/** The answer fields, plus per-field verdict once the question is graded. */
export function AnswerFields({
  problem,
  lang,
  answers,
  results,
  onChange,
  onSubmit,
}: {
  problem: Problem;
  lang: Lang;
  answers: Record<string, string>;
  results: Record<string, CheckResult> | null;
  onChange: (fieldId: string, value: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="space-y-6">
      {problem.fields.map((field, i) => {
        const result = results?.[field.id];
        return (
          <div key={field.id}>
            <AnswerInput
              field={field}
              lang={lang}
              value={answers[field.id] ?? ""}
              disabled={!!results}
              autoFocus={i === 0 && !results}
              status={
                result ? (result.correct ? "correct" : "incorrect") : undefined
              }
              onChange={(v) => onChange(field.id, v)}
              onSubmit={onSubmit}
            />
            {result && <FieldVerdict field={field} result={result} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

function FieldVerdict({
  field,
  result,
  lang,
}: {
  field: AnswerField;
  result: CheckResult;
  lang: Lang;
}) {
  const hintKey = result.hint ? HINT_KEY_MAP[result.hint] : undefined;

  const followThrough = (result as { followThrough?: boolean }).followThrough;

  return (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.85rem]">
      <span
        className={
          result.correct
            ? "font-medium text-accent"
            : followThrough
              ? "font-medium text-pattern"
              : "font-medium text-wrong"
        }
      >
        {result.correct
          ? `✓ ${t("correct", lang)}`
          : followThrough
            ? `~ ${t("followThrough", lang)}`
            : `✗ ${t("incorrect", lang)}`}
      </span>

      {followThrough && (
        <span className="text-muted">{t("followThroughNote", lang)}</span>
      )}

      {!result.correct && !followThrough && (
        <>
          <span className="text-muted">
            {t("expected", lang)}:{" "}
            <span className="math-ltr font-serif text-ink">
              <MathText text={`$${toLatexish(field.expected)}$`} className="inline" />
            </span>
          </span>
          {hintKey && <span className="text-faint">{UI[hintKey][lang]}</span>}
        </>
      )}
    </div>
  );
}

/**
 * The canonical answers are stored in nerdamer syntax; this is a light cosmetic
 * pass so they render as math rather than as code. Correctness never depends
 * on it — the checker always compares the nerdamer form.
 */
export function toLatexish(expr: string): string {
  return expr
    .replace(/\*/g, " \\cdot ")
    .replace(/sqrt\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/\blog\(/g, "\\ln(")
    .replace(/\bpi\b/g, "\\pi")
    .replace(/infinity/g, "\\infty")
    .replace(/\^\(([^()]*)\)/g, "^{$1}")
    .replace(/>=/g, "\\ge ")
    .replace(/<=/g, "\\le ")
    .replace(/!=/g, "\\ne ");
}
