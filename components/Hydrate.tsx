"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

/**
 * Loads persisted state once, after mount, so the server-rendered markup and
 * the first client render agree (localStorage is not available during SSR).
 */
export function Hydrate() {
  const hydrate = useApp((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Register the offline worker after the page is interactive, never before.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
