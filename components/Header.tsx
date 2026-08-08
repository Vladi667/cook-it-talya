"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

const NAV = [
  { href: "/", key: "practice" as const },
  { href: "/exam", key: "exam" as const },
  { href: "/progress", key: "progress" as const },
];

export function Header() {
  const pathname = usePathname();
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);

  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group shrink-0">
          <div className="font-serif text-[1.15rem] leading-none font-medium tracking-tight">
            {t("appName", lang)}
          </div>
          <div className="mt-1 text-[0.68rem] tracking-wide text-faint uppercase">
            {t("tagline", lang)}
          </div>
        </Link>

        <nav className="ms-auto flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-[0.82rem] transition-colors ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t(item.key, lang)}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "he" : "en")}
            className="ms-1 rounded-full border border-line px-2.5 py-1.5 text-[0.72rem] font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label={lang === "en" ? "עברית" : "English"}
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
