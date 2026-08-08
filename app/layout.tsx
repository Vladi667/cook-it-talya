import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Hydrate } from "@/components/Hydrate";

/** Both faces carry Latin and Hebrew, so the type does not change on toggle. */
const question = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700"],
  variable: "--font-question",
  display: "swap",
});

const ui = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cook it Talya — Bagrut math trainer",
  description:
    "Practice engine for Israeli 5-unit Bagrut mathematics: generated exam questions, step-by-step solutions, and drilling that adapts to your weak areas.",
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${question.variable} ${ui.variable}`}>
      <body className="min-h-dvh antialiased">
        <Hydrate />
        <Header />
        <main className="mx-auto max-w-3xl px-5 pt-8 pb-24 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
