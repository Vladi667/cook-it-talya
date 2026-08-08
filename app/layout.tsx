import type { Metadata, Viewport } from "next";
import {
  Frank_Ruhl_Libre,
  IBM_Plex_Mono,
  IBM_Plex_Sans_Hebrew,
} from "next/font/google";
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

const ui = IBM_Plex_Sans_Hebrew({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

/** Plate numbers, labels and metadata — the printed-monograph voice. */
const plate = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plate",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cook it Talya — Bagrut math trainer",
  description:
    "Practice engine for Israeli 5-unit Bagrut mathematics: generated exam questions, step-by-step solutions, and drilling that adapts to your weak areas.",
};

export const viewport: Viewport = {
  themeColor: "#f6f2e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${question.variable} ${ui.variable} ${plate.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <Hydrate />
        <Header />
        <main className="mx-auto w-full max-w-[46rem] px-5 pt-9 pb-28 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
