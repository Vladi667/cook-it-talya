"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CheckResult } from "@/lib/checker";
import { loadChecker, warmChecker } from "@/lib/lazyChecker";
import { generateProblem, REGISTERED_TEMPLATE_IDS, TEMPLATES } from "@/lib/templates";
import { randomSeed } from "@/lib/rng";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import type { Attempt, ExamState, Problem } from "@/lib/types";
import { StepReveal } from "@/components/StepReveal";

const WhyWrong = dynamic(
  () => import("@/components/WhyWrong").then((m) => m.WhyWrong),
  { ssr: false },
);
import { AnswerFields, Statement, TopicLine } from "@/components/QuestionView";
import { ActionBar } from "@/components/ActionBar";

const QUESTION_COUNT = 6;
const DURATION_SECONDS = 90 * 60;

export default function ExamPage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);
  const exam = useApp((s) => s.exam);
  const setExam = useApp((s) => s.setExam);
  const setExamAnswer = useApp((s) => s.setExamAnswer);
  const gotoExamQuestion = useApp((s) => s.gotoExamQuestion);
  const recordAttempt = useApp((s) => s.recordAttempt);

  const [now, setNow] = useState(() => Date.now());

  // Regenerated from the stored seeds — never persisted.
  const problems = useMemo<Problem[]>(
    () =>
      exam
        ? exam.questions.map((q) => generateProblem(q.templateId, q.seed))
        : [],
    [exam],
  );

  const running = !!exam && exam.finishedAt === null;
  const remaining = exam
    ? Math.max(
        0,
        exam.startedAt + exam.durationSeconds * 1000 - now,
      )
    : 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const finish = useCallback(
    async () => {
      if (!exam || exam.finishedAt !== null) return;
      const { checkAnswer } = await loadChecker();
      const at = Date.now();
      const perQuestion = Math.round(
        (at - exam.startedAt) / 1000 / exam.questions.length,
      );
      exam.questions.forEach((q, i) => {
        const problem = problems[i];
        const results = problem.fields.map((f) =>
          checkAnswer(q.answers[f.id] ?? "", f.expected, f.type, {
            vars: f.vars,
            sampleRange: f.sampleRange,
          }),
        );
        const correctCount = results.filter((r) => r.correct).length;
        const attempt: Attempt = {
          id: `${problem.id}@${at}#${i}`,
          templateId: q.templateId,
          seed: q.seed,
          at,
          seconds: perQuestion,
          correct: correctCount === problem.fields.length,
          score: correctCount / problem.fields.length,
          hintsUsed: 0,
          mode: "exam",
          fields: problem.fields.map((f, k) => ({
            fieldId: f.id,
            correct: results[k].correct,
            input: q.answers[f.id] ?? "",
            normalizedInput: results[k].normalizedInput,
          })),
        };
        recordAttempt(attempt);
      });
      setExam({ ...exam, finishedAt: at });
    },
    [exam, problems, recordAttempt, setExam],
  );

  // Hard stop when the clock runs out.
  useEffect(() => {
    if (running && remaining === 0) void finish();
  }, [running, remaining, finish]);

  useEffect(() => {
    warmChecker();
  }, []);

  if (!ready) return <p className="text-sm text-faint">{t("loading", lang)}</p>;

  if (!exam) {
    return (
      <ExamIntro
        onStart={() => {
          setExam(newExam());
          setNow(Date.now());
        }}
      />
    );
  }

  if (exam.finishedAt !== null) {
    return (
      <ExamResults
        exam={exam}
        problems={problems}
        onNew={() => {
          setExam(newExam());
          setNow(Date.now());
        }}
      />
    );
  }

  const problem = problems[exam.index];
  const answered = exam.questions.filter((q) =>
    Object.values(q.answers).some((v) => v.trim()),
  ).length;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 border-b border-rule pb-3">
        <span className="text-[0.78rem] text-muted">
          {t("question", lang)} {exam.index + 1} {t("of", lang)}{" "}
          {exam.questions.length} · {answered} {t("answered", lang)}
        </span>
        <span
          className={`font-mono text-[0.95rem] tabular-nums ${
            remaining < 5 * 60 * 1000 ? "text-wrong" : "text-muted"
          }`}
        >
          {formatClock(remaining)}
        </span>
      </div>

      <nav className="flex flex-wrap gap-1.5">
        {exam.questions.map((q, i) => {
          const done = Object.values(q.answers).some((v) => v.trim());
          return (
            <button
              key={i}
              type="button"
              onClick={() => gotoExamQuestion(i)}
              className={`tap flex items-center justify-center rounded-lg border text-[0.85rem] transition-colors sm:h-9 sm:min-h-0 sm:w-9 sm:min-w-0 ${
                i === exam.index
                  ? "border-accent bg-accent text-paper"
                  : done
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-rule text-muted hover:border-accent"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      <section>
        <TopicLine problem={problem} lang={lang} />
        <Statement problem={problem} lang={lang} />
      </section>

      <AnswerFields
        problem={problem}
        lang={lang}
        answers={exam.questions[exam.index].answers}
        results={null}
        onChange={(fieldId, value) =>
          setExamAnswer(exam.index, fieldId, value)
        }
      />

      <ActionBar>
        <button
          type="button"
          disabled={exam.index === 0}
          onClick={() => gotoExamQuestion(exam.index - 1)}
          className="tap rounded-lg border border-rule px-4 text-[0.85rem] text-muted disabled:opacity-40 sm:py-2"
        >
          ←
        </button>
        <button
          type="button"
          disabled={exam.index === exam.questions.length - 1}
          onClick={() => gotoExamQuestion(exam.index + 1)}
          className="tap flex-1 rounded-lg border border-rule px-4 text-[0.85rem] text-muted disabled:opacity-40 sm:flex-none sm:py-2"
        >
          {t("next", lang)} →
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("confirmFinish", lang))) void finish();
          }}
          className="tap ms-auto rounded-lg bg-ink px-5 text-[0.88rem] font-medium text-paper sm:py-2.5"
        >
          {t("submitExam", lang)}
        </button>
      </ActionBar>
    </div>
  );
}

function newExam(): ExamState {
  const order = shuffled(REGISTERED_TEMPLATE_IDS).slice(0, QUESTION_COUNT);
  return {
    id: `exam-${Date.now()}`,
    startedAt: Date.now(),
    durationSeconds: DURATION_SECONDS,
    index: 0,
    finishedAt: null,
    questions: order.map((templateId) => ({
      templateId,
      seed: randomSeed(),
      answers: {},
    })),
  };
}

function shuffled<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function ExamIntro({ onStart }: { onStart: () => void }) {
  const lang = useApp((s) => s.lang);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium">{t("examTitle", lang)}</h1>
      <p className="max-w-prose font-serif text-[1.05rem] leading-relaxed text-ink/85">
        {t("examIntro", lang)}
      </p>
      <ul className="space-y-1.5 text-[0.9rem] text-muted">
        {REGISTERED_TEMPLATE_IDS.map((id) => (
          <li key={id}>· {tx(TEMPLATES[id].name, lang)}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="rounded-full bg-accent px-6 py-3 text-[0.95rem] font-medium text-white transition-opacity hover:opacity-90"
      >
        {t("startExam", lang)}
      </button>
    </div>
  );
}

function ExamResults({
  exam,
  problems,
  onNew,
}: {
  exam: ExamState;
  problems: Problem[];
  onNew: () => void;
}) {
  const lang = useApp((s) => s.lang);

  type Graded = {
    problem: Problem;
    answers: Record<string, string>;
    results: Record<string, CheckResult>;
    score: number;
  };
  const [graded, setGraded] = useState<Graded[] | null>(null);

  // Grading needs the CAS, which is loaded on demand.
  useEffect(() => {
    let cancelled = false;
    void loadChecker().then(({ checkAnswer }) => {
      if (cancelled) return;
      setGraded(
        exam.questions.map((q, i) => {
          const problem = problems[i];
          const results: Record<string, CheckResult> = {};
          for (const f of problem.fields) {
            results[f.id] = checkAnswer(
              q.answers[f.id] ?? "",
              f.expected,
              f.type,
              { vars: f.vars, sampleRange: f.sampleRange },
            );
          }
          const correct = problem.fields.filter(
            (f) => results[f.id].correct,
          ).length;
          return {
            problem,
            answers: q.answers,
            results,
            score: correct / problem.fields.length,
          };
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [exam, problems]);

  if (!graded) return <p className="plate text-faint">{t("loading", lang)}</p>;

  const overall = Math.round(
    (graded.reduce((sum, g) => sum + g.score, 0) / graded.length) * 100,
  );

  return (
    <div className="space-y-9">
      <section>
        <h1 className="font-serif text-2xl font-medium">
          {t("yourScore", lang)}
        </h1>
        <div className="mt-3 font-serif text-5xl tabular-nums">{overall}</div>
      </section>

      <section>
        <h2 className="mb-3 text-[0.72rem] tracking-wider text-faint uppercase">
          {t("breakdown", lang)}
        </h2>
        <ul className="divide-y divide-rule border-y border-rule">
          {graded.map((g, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <span className="font-serif text-[0.98rem]">
                {i + 1}. {tx(TEMPLATES[g.problem.templateId].name, lang)}
              </span>
              <span
                className={`shrink-0 font-mono text-[0.82rem] tabular-nums ${
                  g.score === 1
                    ? "text-accent"
                    : g.score > 0
                      ? "text-muted"
                      : "text-wrong"
                }`}
              >
                {Math.round(g.score * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-10">
        {graded.map((g, i) => (
          <div key={i} className="space-y-4">
            <div className="text-[0.7rem] tracking-wider text-faint uppercase">
              {t("question", lang)} {i + 1}
            </div>
            <Statement problem={g.problem} lang={lang} />
            <AnswerFields
              problem={g.problem}
              lang={lang}
              answers={g.answers}
              results={g.results}
              onChange={() => {}}
            />
            {g.score < 1 && (
              <WhyWrong
                problem={g.problem}
                answers={g.answers}
                results={g.results}
                lang={lang}
              />
            )}
            <div className="border-t border-rule pt-5">
              <StepReveal
                steps={g.problem.steps}
                lang={lang}
                initial={g.score === 1 ? 0 : 1}
              />
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={onNew}
        className="rounded-full bg-accent px-6 py-3 text-[0.95rem] font-medium text-white"
      >
        {t("newExam", lang)}
      </button>
    </div>
  );
}
