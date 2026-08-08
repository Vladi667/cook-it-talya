"use client";

import { useState } from "react";
import type { Lang, Pattern, SolutionStep } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * Steps are revealed one at a time so a student can stop as soon as they see
 * where they went wrong. Each step is labelled with the recipe move it
 * instantiates — the point being that this specific line is not a one-off,
 * it is move 3 of a method they will run again on the next question.
 */
export function StepReveal({
  steps,
  lang,
  pattern,
  initial = 1,
}: {
  steps: SolutionStep[];
  lang: Lang;
  pattern?: Pattern;
  initial?: number;
}) {
  const [shown, setShown] = useState(initial);
  const done = shown >= steps.length;

  return (
    <div>
      <ol className="space-y-6">
        {steps.slice(0, shown).map((step, i) => {
          const move =
            step.move !== undefined ? pattern?.recipe[step.move] : undefined;
          return (
            <li key={i} className="rise flex gap-4">
              <span
                aria-hidden
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule bg-raised font-mono text-[0.7rem] text-muted"
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                {move && (
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="plate shrink-0 text-pattern">
                      {t("move", lang)} {(step.move ?? 0) + 1}
                    </span>
                    <MathText
                      text={move.move[lang]}
                      className="text-[0.85rem] text-pattern/85"
                    />
                  </div>
                )}
                <MathText
                  text={step.title[lang]}
                  className="font-serif text-[1.04rem] font-medium"
                />
                <MathText
                  text={step.body[lang]}
                  className="mt-1 font-serif text-[1.03rem] leading-relaxed text-ink/90"
                />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!done ? (
          <>
            <button
              type="button"
              onClick={() => setShown((s) => s + 1)}
              className="rounded-lg bg-accent px-4 py-2 text-[0.85rem] font-medium text-paper transition-opacity hover:opacity-90"
            >
              {t("showStep", lang)}
            </button>
            <button
              type="button"
              onClick={() => setShown(steps.length)}
              className="text-[0.84rem] text-muted underline decoration-rule underline-offset-4 hover:text-ink"
            >
              {t("showAllSteps", lang)}
            </button>
            <span className="plate ms-auto text-faint">
              {shown}/{steps.length}
            </span>
          </>
        ) : (
          <span className="plate text-faint">{t("stepsDone", lang)}</span>
        )}
      </div>
    </div>
  );
}
