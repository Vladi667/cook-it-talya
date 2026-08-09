"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

const NAV = [
  { href: "/", key: "practice" as const, short: "navPractice" as const },
  { href: "/spot", key: "spot" as const, short: "navSpot" as const },
  { href: "/patterns", key: "patterns" as const, short: "navPatterns" as const },
  { href: "/exam", key: "exam" as const, short: "navExam" as const },
  { href: "/progress", key: "progress" as const, short: "navProgress" as const },
];

/** The app mark: a circle with its tangent, and the point of contact. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <line
        x1="2"
        y1="7"
        x2="22"
        y2="7"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="11.5"
        cy="14.5"
        r="6.5"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <circle cx="11.5" cy="7" r="2.4" fill="var(--color-pattern)" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);

  return (
    <header className="sticky top-0 z-20 border-b border-rule/70 bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[46rem] items-center gap-3 px-5 py-2 sm:px-8 sm:py-3.5">
        <Link
          href="/"
          aria-label="Cook it Talya"
          className="flex min-h-[44px] shrink-0 items-center justify-center leading-none sm:flex-col sm:justify-center"
        >
          {/* Five nav items plus a wordmark do not fit across 375px, so the
              brand collapses to its mark on a phone. */}
          <Mark className="h-7 w-7 sm:hidden" />
          <span className="hidden sm:block">
            <span className="block font-serif text-[1.08rem] font-medium tracking-tight">
              Cook it Talya
            </span>
            <span className="plate mt-1 block text-faint">
              {t("tagline", lang)}
            </span>
          </span>
        </Link>

        <nav className="ms-auto flex items-center gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[44px] items-center px-2 text-[0.8rem] transition-colors sm:px-3 sm:text-[0.83rem] ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="sm:hidden">{t(item.short, lang)}</span>
                <span className="hidden sm:inline">{t(item.key, lang)}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-[1px] h-[2px] bg-accent sm:inset-x-3"
                  />
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "he" : "en")}
            className="tap ms-1 flex items-center justify-center rounded-md border border-rule font-mono text-[0.7rem] text-muted transition-colors hover:border-accent hover:text-accent sm:min-h-0 sm:min-w-0 sm:px-2 sm:py-1.5"
            aria-label={lang === "en" ? "עברית" : "English"}
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
