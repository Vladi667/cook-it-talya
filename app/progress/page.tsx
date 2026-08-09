"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { TEMPLATES, TEMPLATE_LIST } from "@/lib/templates";
import { daysSince, mastery, statsFor, weakestTemplate } from "@/lib/mastery";
import { allMetrics, overallSkills, weakestSkill } from "@/lib/metrics";
import { formatClock } from "@/lib/budgets";
import { TrapProfile } from "@/components/TrapProfile";

export default function ProgressPage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);
  const stats = useApp((s) => s.stats);
  const recognition = useApp((s) => s.recognition);
  const history = useApp((s) => s.history);
  const resetAll = useApp((s) => s.resetAll);

  const now = Date.now();
  const skills = useMemo(
    () => overallSkills(history, recognition),
    [history, recognition],
  );
  const rows = useMemo(
    () => allMetrics(history, recognition),
    [history, recognition],
  );
  const focus = weakestSkill(skills);

  if (!ready) return <p className="plate text-faint">{t("loading", lang)}</p>;

  const total = TEMPLATE_LIST.reduce(
    (sum, tpl) => sum + statsFor(stats, tpl.id).attempts,
    0,
  );
  const weakest = weakestTemplate(stats, now);

  if (total === 0 && skills.recognition === null) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-medium">{t("progress", lang)}</h1>
        <p className="text-[0.95rem] text-muted">{t("noDataYet", lang)}</p>
      </div>
    );
  }

  const focusText =
    focus === "recognition"
      ? t("focusRecognition", lang)
      : focus === "pace"
        ? t("focusPace", lang)
        : focus === "accuracy"
          ? t("focusAccuracy", lang)
          : t("allGood", lang);

  return (
    <div className="stagger space-y-10">
      <section>
        <h1 className="font-serif text-2xl font-medium">{t("progress", lang)}</h1>

        {/* The three skills the exam actually tests, kept apart. */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Skill
            label={t("recognition", lang)}
            value={
              skills.recognition === null
                ? t("noEvidence", lang)
                : `${Math.round(skills.recognition * 100)}%`
            }
            tone={toneFor(skills.recognition, 0.85, 0.65)}
            href="/spot"
          />
          <Skill
            label={t("pace", lang)}
            value={
              skills.pace === null
                ? t("noEvidence", lang)
                : `${skills.pace.toFixed(2)}×`
            }
            hint={t("ofBudget", lang)}
            tone={
              skills.pace === null
                ? "flat"
                : skills.pace <= 1
                  ? "good"
                  : skills.pace <= 1.4
                    ? "mid"
                    : "bad"
            }
          />
          <Skill
            label={t("firstTime", lang)}
            value={
              skills.accuracy === null
                ? t("noEvidence", lang)
                : `${Math.round(skills.accuracy * 100)}%`
            }
            tone={toneFor(skills.accuracy, 0.85, 0.6)}
          />
        </div>

        <p className="mt-4 font-serif text-[1.02rem] leading-relaxed text-ink/85">
          {focusText}
        </p>
      </section>

      <TrapProfile />

      {weakest && (
        <section className="rounded-xl border border-rule bg-raised px-4 py-3">
          <div className="plate text-faint">{t("weakest", lang)}</div>
          <div className="mt-1 font-serif text-[1.05rem]">
            {tx(TEMPLATES[weakest].name, lang)}
          </div>
          <p className="mt-1 text-[0.85rem] text-muted">
            {tx(TEMPLATES[weakest].blurb, lang)}
          </p>
        </section>
      )}

      <section>
        <h2 className="plate mb-4 text-faint">{t("perType", lang)}</h2>
        <ul className="space-y-5">
          {rows.map((row) => {
            const tpl = TEMPLATES[row.templateId];
            const s = statsFor(stats, row.templateId);
            const m = mastery(s, now);
            return (
              <li key={row.templateId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[1rem]">
                    {tx(tpl.name, lang)}
                  </span>
                  <span className="plate shrink-0 text-faint tabular-nums">
                    {Math.round(m * 100)}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{ width: `${Math.max(m * 100, m > 0 ? 3 : 0)}%` }}
                  />
                </div>

                <div className="plate mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-faint tabular-nums">
                  <span>
                    {t("recognition", lang)}:{" "}
                    {row.recognition === null
                      ? "—"
                      : `${Math.round(row.recognition * 100)}%`}
                  </span>
                  <span>
                    {t("pace", lang)}:{" "}
                    {row.meanSeconds === null
                      ? "—"
                      : `${formatClock(row.meanSeconds)} / ${formatClock(row.budgetSeconds)}`}
                  </span>
                  <span>
                    {t("firstTime", lang)}:{" "}
                    {row.accuracy === null
                      ? "—"
                      : `${Math.round(row.accuracy * 100)}%`}
                  </span>
                  {s.lastSeen !== null && (
                    <span>
                      {t("lastSeen", lang)}: {formatAge(s.lastSeen, now, lang)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {total > 0 && (
        <section className="border-t border-rule pt-6">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("confirmReset", lang))) resetAll();
            }}
            className="tap text-[0.82rem] text-faint underline decoration-rule underline-offset-4 hover:text-wrong"
          >
            {t("resetAll", lang)}
          </button>
        </section>
      )}
    </div>
  );
}

type Tone = "good" | "mid" | "bad" | "flat";

function toneFor(v: number | null, good: number, bad: number): Tone {
  if (v === null) return "flat";
  if (v >= good) return "good";
  return v >= bad ? "mid" : "bad";
}

function Skill({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: Tone;
  href?: string;
}) {
  const colour =
    tone === "good"
      ? "text-accent"
      : tone === "bad"
        ? "text-wrong"
        : tone === "mid"
          ? "text-pattern"
          : "text-faint";

  const body = (
    <div className="rounded-xl border border-rule bg-raised px-3 py-3">
      <div className={`font-serif text-[1.55rem] tabular-nums ${colour}`}>
        {value}
      </div>
      <div className="plate mt-1 leading-tight text-faint">{label}</div>
      {hint && <div className="plate text-faint/70">{hint}</div>}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
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
  return lang === "he"
    ? `לפני ${d} ${t("daysAgo", lang)}`
    : `${d}${t("daysAgo", lang)}`;
}
