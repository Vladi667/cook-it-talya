"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";
import { CLEARED_THRESHOLD, isOpen, rankedTraps, TRAPS } from "@/lib/traps";
import { MathText } from "./MathText";

/**
 * The personal error profile: the specific mistakes this student keeps making,
 * ranked. "You are weak at analytic geometry" is not actionable; "you have
 * swapped the section-formula weights five times" is.
 */
export function TrapProfile({ limit = 5 }: { limit?: number }) {
  const lang = useApp((s) => s.lang);
  const traps = useApp((s) => s.traps);
  const ranked = useMemo(() => rankedTraps(traps).slice(0, limit), [traps, limit]);

  if (ranked.length === 0) return null;

  return (
    <section>
      <h2 className="plate mb-3 text-faint">{t("yourTraps", lang)}</h2>
      <ul className="divide-y divide-rule/70 overflow-hidden rounded-xl border border-rule bg-raised">
        {ranked.map((trap) => {
          const meta = TRAPS[trap.id];
          if (!meta) return null;
          const open = isOpen(trap);
          return (
            <li key={trap.id} className="flex items-start gap-3 px-4 py-3">
              <span
                aria-hidden
                className={`mt-[0.45em] h-2 w-2 shrink-0 rounded-full ${
                  open ? "bg-wrong" : "bg-accent"
                }`}
              />
              <div className="min-w-0 flex-1">
                <MathText
                  text={meta.short[lang]}
                  className="font-serif text-[1rem] leading-snug"
                />
                <div className="plate mt-0.5 text-faint">
                  {tx(TEMPLATES[meta.templateId].name, lang)}
                </div>
              </div>
              <span
                className={`plate shrink-0 tabular-nums ${
                  open ? "text-wrong" : "text-accent"
                }`}
              >
                {open
                  ? `×${trap.hits}`
                  : `✓ ${trap.clearedSince}/${CLEARED_THRESHOLD}`}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="plate mt-2 text-faint">{t("trapsHint", lang)}</p>
    </section>
  );
}
