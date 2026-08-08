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
  applicationName: "Cook it Talya",
  appleWebApp: {
    capable: true,
    title: "Cook it Talya",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2e9",
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available (never trap a student who needs to enlarge a
  // formula); this only stops the auto-zoom on focus, which the 16px input
  // rule already handles.
  maximumScale: 5,
  viewportFit: "cover",
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
        <main className="mx-auto w-full max-w-[46rem] px-5 pt-6 pb-10 sm:px-8 sm:pt-9 sm:pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
