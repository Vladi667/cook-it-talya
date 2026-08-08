"use client";

import { useState } from "react";
import type { Lang, Problem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * The ONLY place an LLM is involved. It never produces or checks answers —
 * the problem, the solution and the verdict are all already computed. It is
 * handed the correct solution and only diagnoses the student's slip, so an
 * approximate answer here is acceptable.
 */
export function ExplainButton({
  problem,
  answers,
  lang,
}: {
  problem: Problem;
  answers: Record<string, string>;
  lang: Lang;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [text, setText] = useState("");

  const ask = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang,
          statement: problem.statement[lang],
          steps: problem.steps.map((s) => s.body[lang]),
          fields: problem.fields.map((f) => ({
            prompt: f.prompt[lang],
            expected: f.expected,
            given: answers[f.id] ?? "",
          })),
        }),
      });
      if (!res.ok) {
        setText(t("explainUnavailable", lang));
        setState("error");
        return;
      }
      const data = (await res.json()) as { text?: string };
      setText(data.text ?? t("explainUnavailable", lang));
      setState("done");
    } catch {
      setText(t("explainUnavailable", lang));
      setState("error");
    }
  };

  if (state === "idle") {
    return (
      <section>
        <button
          type="button"
          onClick={ask}
          className="text-[0.85rem] text-muted underline underline-offset-4 hover:text-accent"
        >
          {t("explainMistake", lang)}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-raised px-4 py-3">
      {state === "loading" ? (
        <span className="text-[0.85rem] text-faint">{t("explaining", lang)}</span>
      ) : (
        <MathText
          text={text}
          className="font-serif text-[1rem] leading-relaxed text-ink/90"
        />
      )}
    </section>
  );
}
