"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

const NAV = [
  { href: "/", key: "practice" as const },
  { href: "/patterns", key: "patterns" as const },
  { href: "/exam", key: "exam" as const },
  { href: "/progress", key: "progress" as const },
];

export function Header() {
  const pathname = usePathname();
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);

  return (
    <header className="sticky top-0 z-20 border-b border-rule/70 bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[46rem] items-center gap-3 px-5 py-2 sm:px-8 sm:py-3.5">
        <Link
          href="/"
          className="flex min-h-[44px] shrink-0 flex-col justify-center leading-none"
        >
          <div className="font-serif text-[1rem] font-medium tracking-tight sm:text-[1.08rem]">
            Cook it Talya
          </div>
          {/* The tagline is a nicety; on a phone the vertical space is not. */}
          <div className="plate mt-1 hidden text-faint sm:block">
            {t("tagline", lang)}
          </div>
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
                {t(item.key, lang)}
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
