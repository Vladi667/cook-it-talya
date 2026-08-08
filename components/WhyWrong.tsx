"use client";

import { useMemo, useState } from "react";
import type { CheckResult } from "@/lib/checker";
import { diagnose } from "@/lib/diagnose";
import type { Lang, Pattern, Problem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * "Why was I wrong?" — computed locally from the template's declared pitfalls
 * and the checker's verdict. No model call, no API key, no network, instant.
 *
 * When a diagnosis maps onto a recipe move, the move is named: the student
 * should leave knowing which part of the method broke, not just that this
 * answer was wrong.
 */
export function WhyWrong({
  problem,
  answers,
  results,
  lang,
  pattern,
  defaultOpen = false,
}: {
  problem: Problem;
  answers: Record<string, string>;
  results: Record<string, CheckResult>;
  lang: Lang;
  pattern?: Pattern;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const diagnoses = useMemo(
    () => diagnose(problem, answers, results),
    [problem, answers, results],
  );

  if (diagnoses.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[0.85rem] text-muted underline decoration-rule underline-offset-4 hover:text-accent"
      >
        {t("explainMistake", lang)}
      </button>
    );
  }

  return (
    <section className="rise overflow-hidden rounded-xl border border-wrong/25 bg-raised">
      <div className="plate border-b border-wrong/20 bg-wrong-soft/60 px-5 py-2.5 text-wrong">
        {t("explainMistake", lang)}
      </div>

      <ul className="divide-y divide-rule/60">
        {diagnoses.map((d) => {
          const field = problem.fields.find((f) => f.id === d.fieldId);
          const step = problem.steps.find((s) => s.move !== undefined);
          const move =
            d.kind === "pitfall" && step?.move !== undefined
              ? pattern?.recipe[step.move]
              : undefined;

          return (
            <li key={d.fieldId} className="px-5 py-4">
              {problem.fields.length > 1 && field && (
                <MathText
                  text={field.prompt[lang]}
                  className="plate mb-1.5 text-faint"
                />
              )}
              <MathText
                text={d.text[lang]}
                className="font-serif text-[1.02rem] leading-relaxed text-ink/90"
              />
              {move && (
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <span className="plate shrink-0 text-pattern">
                    ↳ {t("theMethod", lang)}
                  </span>
                  <MathText
                    text={move.move[lang]}
                    className="text-[0.85rem] text-pattern/85"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
