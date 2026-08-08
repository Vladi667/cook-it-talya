"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckResult } from "@/lib/checker";
import { checkAnswer } from "@/lib/checker";
import {
  generateProblem,
  REGISTERED_TEMPLATE_IDS,
  TEMPLATES,
} from "@/lib/templates";
import { pickNextTemplate } from "@/lib/mastery";
import { randomSeed } from "@/lib/rng";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import type { Attempt, Problem, TemplateId } from "@/lib/types";
import { MathText } from "@/components/MathText";
import { StepReveal } from "@/components/StepReveal";
import { WhyWrong } from "@/components/WhyWrong";
import { PatternCard } from "@/components/PatternCard";
import { AnswerFields, Statement, TopicLine } from "@/components/QuestionView";

/** A second attempt still counts, but not for full mastery credit. */
const RETRY_CREDIT = 0.65;

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
  const [attempt, setAttempt] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [checking, setChecking] = useState(false);

  const startedAt = useRef(Date.now());
  const recorded = useRef(false);
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
    setAttempt(1);
    setRevealed(false);
    setHintLevel(0);
    recorded.current = false;
    startedAt.current = Date.now();
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [stats]);

  useEffect(() => {
    if (ready && !problem) nextProblem();
  }, [ready, problem, nextProblem]);

  const record = useCallback(
    (
      p: Problem,
      graded: Record<string, CheckResult>,
      attemptNo: number,
      allCorrect: boolean,
    ) => {
      if (recorded.current) return;
      recorded.current = true;
      const correctCount = Object.values(graded).filter((r) => r.correct).length;
      const ratio = correctCount / p.fields.length;
      recordAttempt({
        id: `${p.id}@${Date.now()}`,
        templateId: p.templateId,
        seed: p.seed,
        at: Date.now(),
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        correct: allCorrect,
        score: attemptNo === 1 ? ratio : ratio * RETRY_CREDIT,
        hintsUsed: hintLevel,
        mode: "practice",
        fields: p.fields.map((f) => ({
          fieldId: f.id,
          correct: graded[f.id].correct,
          input: answers[f.id] ?? "",
          normalizedInput: graded[f.id].normalizedInput,
        })),
      } satisfies Attempt);
    },
    [answers, hintLevel, recordAttempt],
  );

  const submit = () => {
    if (!problem || results || checking) return;
    setChecking(true);
    setTimeout(() => {
      const graded: Record<string, CheckResult> = {};
      for (const field of problem.fields) {
        graded[field.id] = checkAnswer(
          answers[field.id] ?? "",
          field.expected,
          field.type,
          { vars: field.vars, sampleRange: field.sampleRange },
        );
      }
      const allCorrect = Object.values(graded).every((r) => r.correct);
      setResults(graded);
      setChecking(false);
      // A first wrong attempt is a teaching moment, not a verdict: nothing is
      // written down until the student either succeeds or gives up.
      if (allCorrect || attempt === 2) {
        record(problem, graded, attempt, allCorrect);
        if (allCorrect || attempt === 2) setRevealed(allCorrect ? false : true);
      }
    }, 0);
  };

  const retry = () => {
    setResults(null);
    setAttempt(2);
  };

  const giveUp = () => {
    if (problem && results) record(problem, results, attempt, false);
    setRevealed(true);
  };

  if (!ready || !problem) {
    return <p className="plate text-faint">{t("loading", lang)}</p>;
  }

  const template = TEMPLATES[problem.templateId];
  const graded = !!results;
  const allCorrect = graded && Object.values(results).every((r) => r.correct);
  const someCorrect = graded && Object.values(results).some((r) => r.correct);
  const canRetry = graded && !allCorrect && attempt === 1 && !revealed;
  const finished = graded && (allCorrect || revealed);

  return (
    <div className="space-y-9">
      <section className="stagger space-y-0">
        <TopicLine problem={problem} lang={lang} />
        <Statement problem={problem} lang={lang} />
      </section>

      {hintLevel > 0 && (
        <section className="space-y-3.5 border-s-2 border-accent/25 ps-4">
          {problem.hints.slice(0, hintLevel).map((h, i) => (
            <div key={i} className="rise">
              <div className="plate text-faint">
                {t("hintN", lang)} {i + 1}
              </div>
              <MathText
                text={h[lang]}
                className="mt-0.5 font-serif text-[1.02rem] leading-relaxed text-ink/85"
              />
            </div>
          ))}
        </section>
      )}

      <section>
        {attempt === 2 && !graded && (
          <div className="plate mb-4 text-pattern">
            {t("attemptN", lang)} 2 — {t("secondChance", lang)}
          </div>
        )}
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
            className="w-full rounded-lg bg-accent px-6 py-3 text-[0.95rem] font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {t("check", lang)}
          </button>

          {hintLevel < 3 ? (
            <button
              type="button"
              onClick={() => setHintLevel((h) => h + 1)}
              className="rounded-lg border border-rule px-4 py-2.5 text-[0.87rem] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {hintLevel === 0 ? t("hint", lang) : t("anotherHint", lang)}
            </button>
          ) : (
            <span className="plate text-faint">{t("hintsExhausted", lang)}</span>
          )}

          <button
            type="button"
            onClick={nextProblem}
            className="plate ms-auto text-faint hover:text-muted"
          >
            {t("skip", lang)}
          </button>
        </section>
      ) : (
        <div className="space-y-8">
          <section
            className={`stamp rounded-xl px-4 py-3 font-serif text-[1rem] ${
              allCorrect
                ? "bg-accent-soft text-accent"
                : "bg-wrong-soft text-wrong"
            }`}
          >
            {allCorrect
              ? attempt === 1
                ? `✓ ${t("correct", lang)}`
                : `✓ ${t("gotItAlone", lang)}`
              : someCorrect
                ? t("partial", lang)
                : `✗ ${t("incorrect", lang)}`}
          </section>

          {!allCorrect && (
            <WhyWrong
              problem={problem}
              answers={answers}
              results={results}
              lang={lang}
              pattern={template.pattern}
              defaultOpen
            />
          )}

          {canRetry && (
            <section className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="rounded-lg bg-accent px-5 py-2.5 text-[0.9rem] font-medium text-paper transition-opacity hover:opacity-90"
              >
                ↺ {t("tryAgain", lang)}
              </button>
              <button
                type="button"
                onClick={giveUp}
                className="text-[0.85rem] text-muted underline decoration-rule underline-offset-4 hover:text-ink"
              >
                {t("revealSolution", lang)}
              </button>
            </section>
          )}

          {finished && (
            <>
              <section>
                <div className="rule-cap mb-5" />
                <div className="plate mb-4 text-faint">
                  {t("solution", lang)}
                </div>
                <StepReveal
                  steps={problem.steps}
                  lang={lang}
                  pattern={template.pattern}
                  initial={allCorrect ? 0 : 1}
                />
              </section>

              <section className="space-y-2">
                <PatternCard
                  pattern={template.pattern}
                  lang={lang}
                  title={tx(template.name, lang)}
                  defaultOpen={false}
                  compact={allCorrect}
                />
                <p className="plate text-faint">{t("patternRecall", lang)}</p>
              </section>

              <section>
                <button
                  type="button"
                  onClick={nextProblem}
                  className="w-full rounded-lg bg-ink px-6 py-3 text-[0.95rem] font-medium text-paper transition-opacity hover:opacity-90 sm:w-auto"
                >
                  {t("next", lang)} →
                </button>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
