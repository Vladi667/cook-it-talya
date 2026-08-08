"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { TEMPLATE_LIST } from "@/lib/templates";
import { mastery, statsFor } from "@/lib/mastery";
import { PatternCard } from "@/components/PatternCard";
import { MathText } from "@/components/MathText";

/**
 * The study side of the app: all six methods in one place, to be read rather
 * than drilled. Mastery is shown per pattern so it doubles as a revision plan.
 */
export default function PatternsPage() {
  const lang = useApp((s) => s.lang);
  const stats = useApp((s) => s.stats);
  const ready = useApp((s) => s.ready);
  const [openId, setOpenId] = useState<string | null>(TEMPLATE_LIST[0].id);
  const now = Date.now();

  return (
    <div className="stagger space-y-9">
      <header>
        <div className="plate text-pattern">{t("patternsTitle", lang)}</div>
        <p className="mt-3 max-w-prose font-serif text-[1.12rem] leading-relaxed text-ink/90">
          {t("patternsIntro", lang)}
        </p>
      </header>

      <div className="rule-cap" />

      <ul className="space-y-4">
        {TEMPLATE_LIST.map((template, i) => {
          const open = openId === template.id;
          const m = ready ? mastery(statsFor(stats, template.id), now) : 0;

          return (
            <li key={template.id}>
              {!open ? (
                <button
                  type="button"
                  onClick={() => setOpenId(template.id)}
                  className="group w-full rounded-xl border border-rule bg-raised px-5 py-4 text-start transition-colors hover:border-pattern/50"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="plate text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[1.05rem] font-medium">
                      {tx(template.name, lang)}
                    </span>
                    <span className="plate ms-auto shrink-0 text-faint tabular-nums">
                      {Math.round(m * 100)}%
                    </span>
                  </div>
                  <MathText
                    text={template.pattern.method[lang]}
                    className="mt-1 ps-9 font-serif text-[0.98rem] text-pattern"
                  />
                  <div className="mt-2.5 ms-9 h-[3px] overflow-hidden rounded-full bg-sunken">
                    <div
                      className="h-full rounded-full bg-pattern/70 transition-[width] duration-700"
                      style={{ width: `${Math.max(m * 100, m > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </button>
              ) : (
                <div className="rise">
                  <PatternCard
                    pattern={template.pattern}
                    lang={lang}
                    plateNumber={i + 1}
                    title={tx(template.name, lang)}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="plate mt-2 text-faint hover:text-ink"
                  >
                    ▲ {tx(template.name, lang)}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
