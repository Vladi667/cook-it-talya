"use client";

import { useMemo, useState } from "react";
import type { CheckResult } from "@/lib/checker";
import { diagnose } from "@/lib/diagnose";
import type { Lang, Problem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * "Why was I wrong?" — computed locally from the template's declared pitfalls
 * and the checker's verdict. No model call, no API key, no network, instant.
 */
export function WhyWrong({
  problem,
  answers,
  results,
  lang,
}: {
  problem: Problem;
  answers: Record<string, string>;
  results: Record<string, CheckResult>;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const diagnoses = useMemo(
    () => diagnose(problem, answers, results),
    [problem, answers, results],
  );

  if (diagnoses.length === 0) return null;

  if (!open) {
    return (
      <section>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[0.85rem] text-muted underline underline-offset-4 hover:text-accent"
        >
          {t("explainMistake", lang)}
        </button>
      </section>
    );
  }

  return (
    <section className="rise space-y-4 rounded-xl border border-line bg-raised px-4 py-4">
      {diagnoses.map((d) => {
        const field = problem.fields.find((f) => f.id === d.fieldId);
        return (
          <div key={d.fieldId}>
            {problem.fields.length > 1 && field && (
              <MathText
                text={field.prompt[lang]}
                className="mb-1 text-[0.72rem] tracking-wider text-faint uppercase"
              />
            )}
            <MathText
              text={d.text[lang]}
              className="font-serif text-[1rem] leading-relaxed text-ink/90"
            />
          </div>
        );
      })}
    </section>
  );
}
