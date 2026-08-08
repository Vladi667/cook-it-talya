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
  return null;
}
