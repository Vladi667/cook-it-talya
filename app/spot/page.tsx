"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";
import { makeRound, recognitionAccuracy, recognitionFor, ROUND_LENGTH, type SpotItem } from "@/lib/spot";
import type { TemplateId } from "@/lib/types";
import { MathText } from "@/components/MathText";
import { ActionBar } from "@/components/ActionBar";

/**
 * Recognition drill. The statement only — no answer fields, no figure (a
 * figure would give the type away without any reading) — and one question:
 * which method is this?
 */
export default function SpotPage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);
  const recognition = useApp((s) => s.recognition);
  const recordRecognition = useApp((s) => s.recordRecognition);

  const [round, setRound] = useState<SpotItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TemplateId | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const shownAt = useRef(Date.now());
  const roundMs = useRef(0);

  const overall = useMemo(() => recognitionAccuracy(recognition), [recognition]);

  const begin = useCallback(() => {
    setRound(makeRound(recognition));
    setIndex(0);
    setPicked(null);
    setResults([]);
    roundMs.current = 0;
    shownAt.current = Date.now();
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = round?.[index];

  const answer = (choice: TemplateId) => {
    if (!item || picked) return;
    const ms = Date.now() - shownAt.current;
    roundMs.current += ms;
    const correct = choice === item.correct;
    setPicked(choice);
    setResults((r) => [...r, correct]);
    recordRecognition(item.correct, correct, ms);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
    shownAt.current = Date.now();
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (!ready) return <p className="plate text-faint">{t("loading", lang)}</p>;

  /* ---------------------------------------------------------------- intro */
  if (!round) {
    return (
      <div className="stagger space-y-8">
        <header>
          <div className="plate text-pattern">{t("spotTitle", lang)}</div>
          <p className="mt-3 max-w-prose font-serif text-[1.1rem] leading-relaxed text-ink/90">
            {t("spotIntro", lang)}
          </p>
        </header>

        {overall.seen > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-rule py-4">
            <Stat
              label={t("recognition", lang)}
              value={`${Math.round(overall.accuracy * 100)}%`}
            />
            <Stat
              label={`${t("perItem", lang)}`}
              value={`${(overall.medianMs / 1000).toFixed(1)}s`}
            />
            <Stat label={t("attempts", lang)} value={String(overall.seen)} />
          </div>
        )}

        <Link
          href="/quick"
          className="flex items-center gap-4 rounded-xl border border-rule bg-raised px-5 py-4 transition-colors hover:border-accent"
        >
          <div className="min-w-0">
            <div className="plate text-accent">{t("quick", lang)}</div>
            <p className="mt-1 font-serif text-[0.98rem] leading-snug text-muted">
              {t("quickIntro", lang).split(".")[1]?.trim() ??
                t("quick", lang)}
            </p>
          </div>
          <span aria-hidden className="ms-auto text-accent">
            →
          </span>
        </Link>

        <ActionBar>
          <button
            type="button"
            onClick={begin}
            className="tap w-full rounded-lg bg-pattern px-6 text-[0.95rem] font-medium text-paper transition-opacity hover:opacity-90 sm:w-auto sm:py-3"
          >
            {t("startRound", lang)} · {ROUND_LENGTH}
          </button>
        </ActionBar>
      </div>
    );
  }

  /* -------------------------------------------------------------- summary */
  if (!item) {
    const score = results.filter(Boolean).length;
    const weak = round
      .map((it, i) => ({ id: it.correct, ok: results[i] }))
      .filter((r) => !r.ok)
      .map((r) => r.id);
    const unique = [...new Set(weak)];

    return (
      <div className="stagger space-y-8">
        <header>
          <div className="plate text-faint">{t("roundDone", lang)}</div>
          <div className="mt-2 font-serif text-5xl tabular-nums">
            {score}
            <span className="text-faint">/{results.length}</span>
          </div>
          <p className="plate mt-2 text-faint">
            {(roundMs.current / 1000 / Math.max(1, results.length)).toFixed(1)}s{" "}
            {t("perItem", lang)}
          </p>
        </header>

        {unique.length > 0 && (
          <section>
            <div className="plate mb-3 text-faint">{t("weakest", lang)}</div>
            <ul className="space-y-2">
              {unique.map((id) => {
                const s = recognitionFor(recognition, id);
                return (
                  <li
                    key={id}
                    className="flex items-baseline gap-3 rounded-lg border border-rule bg-raised px-4 py-3"
                  >
                    <span className="font-serif text-[1rem]">
                      {tx(TEMPLATES[id].name, lang)}
                    </span>
                    <span className="plate ms-auto shrink-0 text-faint tabular-nums">
                      {s.seen ? Math.round((s.correct / s.seen) * 100) : 0}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <ActionBar>
          <button
            type="button"
            onClick={begin}
            className="tap flex-1 rounded-lg bg-pattern px-6 text-[0.95rem] font-medium text-paper sm:flex-none sm:py-3"
          >
            {t("againRound", lang)}
          </button>
          <Link
            href="/"
            className="tap flex items-center px-3 text-[0.85rem] text-muted underline decoration-rule underline-offset-4"
          >
            {t("toPractice", lang)} →
          </Link>
        </ActionBar>
      </div>
    );
  }

  /* ----------------------------------------------------------------- item */
  const pattern = TEMPLATES[item.correct].pattern;
  const answered = picked !== null;
  const wasRight = picked === item.correct;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="plate text-faint">
          {index + 1}/{round.length}
        </span>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-sunken">
          <div
            className="h-full rounded-full bg-pattern transition-[width] duration-300"
            style={{ width: `${(index / round.length) * 100}%` }}
          />
        </div>
        <span className="plate tabular-nums text-faint">
          {results.filter(Boolean).length}✓
        </span>
      </div>

      <section key={index} className="rise">
        <MathText
          text={item.problem.statement[lang]}
          highlight={answered ? pattern.triggers[lang] : undefined}
          className="font-serif text-[1.08rem] leading-relaxed sm:text-[1.15rem]"
        />
      </section>

      {!answered && (
        <p className="plate text-faint">{t("whichPattern", lang)}</p>
      )}

      <ul className="space-y-2">
        {item.choices.map((id) => {
          const isCorrect = id === item.correct;
          const isPicked = id === picked;
          const tone = !answered
            ? "border-rule bg-raised hover:border-pattern"
            : isCorrect
              ? "border-accent bg-accent-soft text-accent"
              : isPicked
                ? "border-wrong bg-wrong-soft text-wrong"
                : "border-rule bg-raised opacity-50";
          return (
            <li key={id}>
              <button
                type="button"
                disabled={answered}
                onClick={() => answer(id)}
                className={`tap w-full rounded-xl border px-4 py-3 text-start font-serif text-[1rem] transition-colors ${tone}`}
              >
                {tx(TEMPLATES[id].name, lang)}
                {answered && isCorrect && " ✓"}
                {answered && isPicked && !isCorrect && " ✗"}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <section className="rise space-y-4 rounded-xl border border-pattern/25 bg-raised px-4 py-4">
          <div className="plate text-pattern">{t("theCues", lang)}</div>
          <MathText
            text={pattern.method[lang]}
            className="font-serif text-[1.04rem] text-pattern"
          />
          <ul className="space-y-1.5">
            {pattern.signature.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.62em] h-[3px] w-[3px] shrink-0 bg-pattern"
                />
                <MathText
                  text={s[lang]}
                  className="font-serif text-[0.98rem] leading-relaxed"
                />
              </li>
            ))}
          </ul>
          {!wasRight && (
            <Link
              href="/patterns"
              className="plate inline-block text-faint underline decoration-rule underline-offset-4 hover:text-pattern"
            >
              {t("studyPattern", lang)} →
            </Link>
          )}
        </section>
      )}

      {answered && (
        <ActionBar>
          <button
            type="button"
            onClick={next}
            autoFocus
            className="tap w-full rounded-lg bg-ink px-6 text-[0.95rem] font-medium text-paper sm:w-auto sm:py-3"
          >
            {index + 1 === round.length ? t("roundDone", lang) : t("next", lang)}{" "}
            →
          </button>
        </ActionBar>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl tabular-nums">{value}</div>
      <div className="plate mt-0.5 text-faint">{label}</div>
    </div>
  );
}
