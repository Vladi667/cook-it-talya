import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cook it Talya — Bagrut math trainer",
    short_name: "Cook it Talya",
    description:
      "Practice engine for Israeli 5-unit Bagrut mathematics: generated questions, pattern recognition, and drilling that adapts to your weak areas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f2e9",
    theme_color: "#f6f2e9",
    categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
