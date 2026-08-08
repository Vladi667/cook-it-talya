"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { TEMPLATE_LIST } from "@/lib/templates";
import {
  daysSince,
  mastery,
  statsFor,
  weakestTemplate,
} from "@/lib/mastery";

export default function ProgressPage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);
  const stats = useApp((s) => s.stats);
  const history = useApp((s) => s.history);
  const resetAll = useApp((s) => s.resetAll);

  const now = Date.now();
  const rows = useMemo(
    () =>
      TEMPLATE_LIST.map((template) => {
        const s = statsFor(stats, template.id);
        return {
          template,
          s,
          m: mastery(s, now),
          accuracy: s.attempts ? s.scoreSum / s.attempts : 0,
          avg: s.attempts ? s.totalSeconds / s.attempts : 0,
        };
      }),
    [stats, now],
  );

  if (!ready) return <p className="text-sm text-faint">{t("loading", lang)}</p>;

  const total = rows.reduce((sum, r) => sum + r.s.attempts, 0);
  const weakest = weakestTemplate(stats, now);
  const bestStreak = Math.max(0, ...rows.map((r) => r.s.streak));

  const recent = history.slice(0, 12);
  const recentCorrect = recent.filter((a) => a.correct).length;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl font-medium">
          {t("progress", lang)}
        </h1>
        {total === 0 ? (
          <p className="mt-3 text-[0.95rem] text-muted">{t("noDataYet", lang)}</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
            <Stat label={t("totalSolved", lang)} value={String(total)} />
            <Stat
              label={t("accuracy", lang)}
              value={`${Math.round(
                (rows.reduce((sum, r) => sum + r.s.scoreSum, 0) / total) * 100,
              )}%`}
            />
            <Stat label={t("streak", lang)} value={String(bestStreak)} />
          </div>
        )}
      </section>

      {weakest && (
        <section className="rounded-xl border border-rule bg-raised px-4 py-3">
          <div className="text-[0.7rem] tracking-wider text-faint uppercase">
            {t("weakest", lang)}
          </div>
          <div className="mt-1 font-serif text-[1.05rem]">
            {tx(TEMPLATE_LIST.find((x) => x.id === weakest)!.name, lang)}
          </div>
          <p className="mt-1 text-[0.85rem] text-muted">
            {tx(TEMPLATE_LIST.find((x) => x.id === weakest)!.blurb, lang)}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-[0.72rem] tracking-wider text-faint uppercase">
          {t("mastery", lang)}
        </h2>
        <ul className="space-y-5">
          {rows.map(({ template, s, m, accuracy, avg }) => (
            <li key={template.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="font-serif text-[1rem]">
                  {tx(template.name, lang)}
                </span>
                <span className="shrink-0 font-mono text-[0.75rem] text-faint tabular-nums">
                  {Math.round(m * 100)}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-rule/60">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${Math.max(m * 100, m > 0 ? 3 : 0)}%` }}
                />
              </div>

              <div className="mt-1.5 flex flex-wrap gap-x-4 text-[0.75rem] text-faint tabular-nums">
                <span>
                  {t("attempts", lang)}: {s.attempts}
                </span>
                {s.attempts > 0 && (
                  <>
                    <span>
                      {t("accuracy", lang)}: {Math.round(accuracy * 100)}%
                    </span>
                    <span>
                      {t("avgTime", lang)}: {Math.round(avg)}
                      {t("seconds", lang)}
                    </span>
                    <span>
                      {t("lastSeen", lang)}: {formatAge(s.lastSeen, now, lang)}
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-[0.72rem] tracking-wider text-faint uppercase">
            {t("recent", lang)} · {recentCorrect}/{recent.length}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {recent
              .slice()
              .reverse()
              .map((a) => (
                <span
                  key={a.id}
                  title={`${a.templateId} · ${a.seconds}s`}
                  className={`h-6 w-6 rounded-md ${
                    a.correct
                      ? "bg-accent"
                      : a.score > 0
                        ? "bg-accent/40"
                        : "bg-wrong/70"
                  }`}
                />
              ))}
          </div>
        </section>
      )}

      {total > 0 && (
        <section className="border-t border-rule pt-6">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("confirmReset", lang))) resetAll();
            }}
            className="text-[0.82rem] text-faint underline underline-offset-4 hover:text-wrong"
          >
            {t("resetAll", lang)}
          </button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl tabular-nums">{value}</div>
      <div className="mt-0.5 text-[0.72rem] tracking-wide text-faint uppercase">
        {label}
      </div>
    </div>
  );
}

function formatAge(
  lastSeen: number | null,
  now: number,
  lang: "en" | "he",
): string {
  if (lastSeen === null) return t("never", lang);
  const d = Math.floor(daysSince(lastSeen, now));
  if (d === 0) return t("today", lang);
  return lang === "he" ? `לפני ${d} ${t("daysAgo", lang)}` : `${d}${t("daysAgo", lang)}`;
}
