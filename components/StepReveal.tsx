"use client";

import { useState } from "react";
import type { Lang, SolutionStep } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * Steps are revealed one at a time so a student can stop as soon as they see
 * where they went wrong, instead of being handed the whole answer.
 */
export function StepReveal({
  steps,
  lang,
  initial = 1,
}: {
  steps: SolutionStep[];
  lang: Lang;
  initial?: number;
}) {
  const [shown, setShown] = useState(initial);
  const done = shown >= steps.length;

  return (
    <div>
      <ol className="space-y-5">
        {steps.slice(0, shown).map((step, i) => (
          <li key={i} className="rise">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-[0.7rem] tracking-wider text-faint uppercase">
                {t("step", lang)} {i + 1}
              </span>
              <MathText
                text={step.title[lang]}
                className="font-serif text-[1rem] font-medium"
              />
            </div>
            <MathText
              text={step.body[lang]}
              className="font-serif text-[1.02rem] leading-relaxed text-ink/90"
            />
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!done ? (
          <>
            <button
              type="button"
              onClick={() => setShown((s) => s + 1)}
              className="rounded-full bg-accent px-4 py-2 text-[0.85rem] font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("showStep", lang)}
            </button>
            <button
              type="button"
              onClick={() => setShown(steps.length)}
              className="text-[0.85rem] text-muted underline underline-offset-4 hover:text-ink"
            >
              {t("showAllSteps", lang)}
            </button>
            <span className="text-[0.78rem] text-faint">
              {shown}/{steps.length}
            </span>
          </>
        ) : (
          <span className="text-[0.82rem] text-faint">{t("stepsDone", lang)}</span>
        )}
      </div>
    </div>
  );
}
