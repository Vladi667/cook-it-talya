"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckResult } from "@/lib/checker";
import { checkAnswer } from "@/lib/checker";
import { generateProblem, REGISTERED_TEMPLATE_IDS } from "@/lib/templates";
import { pickNextTemplate } from "@/lib/mastery";
import { randomSeed } from "@/lib/rng";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Attempt, Problem, TemplateId } from "@/lib/types";
import { MathText } from "@/components/MathText";
import { StepReveal } from "@/components/StepReveal";
import { WhyWrong } from "@/components/WhyWrong";
import {
  AnswerFields,
  Statement,
  TopicLine,
} from "@/components/QuestionView";

export default function PracticePage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);
  const stats = useApp((s) => s.stats);
  const recordAttempt = useApp((s) => s.recordAttempt);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, CheckResult> | null>(
    null,
  );
  const [hintLevel, setHintLevel] = useState(0);
  const [checking, setChecking] = useState(false);

  const startedAt = useRef(Date.now());
  const lastTemplate = useRef<TemplateId | undefined>(undefined);

  const nextProblem = useCallback(() => {
    const templateId = pickNextTemplate(stats, Date.now(), {
      avoid: lastTemplate.current,
      available: REGISTERED_TEMPLATE_IDS,
    });
    lastTemplate.current = templateId;
    setProblem(generateProblem(templateId, randomSeed()));
    setAnswers({});
    setResults(null);
    setHintLevel(0);
    startedAt.current = Date.now();
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [stats]);

  useEffect(() => {
    if (ready && !problem) nextProblem();
  }, [ready, problem, nextProblem]);

  const submit = () => {
    if (!problem || results || checking) return;
    setChecking(true);
    // Checking is synchronous but can take a beat on the heavier symbolic
    // comparisons; yield first so the button state paints.
    setTimeout(() => {
      const next: Record<string, CheckResult> = {};
      for (const field of problem.fields) {
        next[field.id] = checkAnswer(
          answers[field.id] ?? "",
          field.expected,
          field.type,
          { vars: field.vars, sampleRange: field.sampleRange },
        );
      }
      const correctCount = Object.values(next).filter((r) => r.correct).length;
      const attempt: Attempt = {
        id: `${problem.id}@${Date.now()}`,
        templateId: problem.templateId,
        seed: problem.seed,
        at: Date.now(),
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        correct: correctCount === problem.fields.length,
        score: correctCount / problem.fields.length,
        hintsUsed: hintLevel,
        mode: "practice",
        fields: problem.fields.map((f) => ({
          fieldId: f.id,
          correct: next[f.id].correct,
          input: answers[f.id] ?? "",
          normalizedInput: next[f.id].normalizedInput,
        })),
      };
      setResults(next);
      recordAttempt(attempt);
      setChecking(false);
    }, 0);
  };

  if (!ready || !problem) {
    return <p className="text-sm text-faint">{t("loading", lang)}</p>;
  }

  const graded = !!results;
  const allCorrect =
    graded && Object.values(results).every((r) => r.correct);
  const someCorrect = graded && Object.values(results).some((r) => r.correct);

  return (
    <div className="space-y-8">
      <section>
        <TopicLine problem={problem} lang={lang} />
        <Statement problem={problem} lang={lang} />
      </section>

      {hintLevel > 0 && (
        <section className="space-y-3 border-s-2 border-accent/30 ps-4">
          {problem.hints.slice(0, hintLevel).map((h, i) => (
            <div key={i} className="rise">
              <div className="text-[0.7rem] tracking-wider text-faint uppercase">
                {t("hintN", lang)} {i + 1}
              </div>
              <MathText
                text={h[lang]}
                className="font-serif text-[1rem] leading-relaxed text-ink/85"
              />
            </div>
          ))}
        </section>
      )}

      <section>
        <AnswerFields
          problem={problem}
          lang={lang}
          answers={answers}
          results={results}
          onChange={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
          onSubmit={submit}
        />
      </section>

      {!graded ? (
        <section className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={checking}
            className="w-full rounded-full bg-accent px-6 py-3 text-[0.95rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {t("check", lang)}
          </button>

          {hintLevel < 3 ? (
            <button
              type="button"
              onClick={() => setHintLevel((h) => h + 1)}
              className="rounded-full border border-line px-4 py-2.5 text-[0.88rem] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {hintLevel === 0 ? t("hint", lang) : t("anotherHint", lang)}
            </button>
          ) : (
            <span className="text-[0.8rem] text-faint">
              {t("hintsExhausted", lang)}
            </span>
          )}

          <button
            type="button"
            onClick={nextProblem}
            className="ms-auto text-[0.85rem] text-faint underline underline-offset-4 hover:text-muted"
          >
            {t("skip", lang)}
          </button>
        </section>
      ) : (
        <>
          <section
            className={`rounded-xl px-4 py-3 text-[0.95rem] font-medium ${
              allCorrect
                ? "bg-accent-soft text-accent"
                : "bg-wrong-soft text-wrong"
            }`}
          >
            {allCorrect
              ? `✓ ${t("correct", lang)}`
              : someCorrect
                ? t("partial", lang)
                : `✗ ${t("incorrect", lang)}`}
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="mb-4 font-serif text-[1.05rem] font-medium">
              {t("solution", lang)}
            </h2>
            <StepReveal steps={problem.steps} lang={lang} />
          </section>

          {!allCorrect && (
            <WhyWrong
              problem={problem}
              answers={answers}
              results={results}
              lang={lang}
            />
          )}

          <section>
            <button
              type="button"
              onClick={nextProblem}
              className="w-full rounded-full bg-ink px-6 py-3 text-[0.95rem] font-medium text-paper transition-opacity hover:opacity-90 sm:w-auto"
            >
              {t("next", lang)} →
            </button>
          </section>
        </>
      )}
    </div>
  );
}
