import type { AppData } from "./types";

/**
 * Everything that persists goes through this interface. v1 ships the
 * localStorage implementation; a Supabase-backed one can be dropped in by
 * swapping the export at the bottom of this file — no app code changes.
 */
export interface StorageAdapter {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

export const STORAGE_KEY = "cook-it-talya:v1";

export function emptyData(): AppData {
  return {
    version: 1,
    lang: "en",
    stats: {},
    recognition: {},
    traps: {},
    history: [],
    exam: null,
  };
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private key: string = STORAGE_KEY) {}

  async load(): Promise<AppData | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.version !== 1) return null;
      // History is capped on write, but be defensive about hand-edited data.
      return { ...emptyData(), ...parsed };
    } catch {
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      /* quota exceeded / private mode — progress is best-effort in v1 */
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.key);
  }
}

/** In-memory adapter, used by tests and by SSR. */
export class MemoryStorageAdapter implements StorageAdapter {
  private data: AppData | null = null;
  async load() {
    return this.data;
  }
  async save(data: AppData) {
    this.data = data;
  }
  async clear() {
    this.data = null;
  }
}

export const storage: StorageAdapter =
  typeof window === "undefined"
    ? new MemoryStorageAdapter()
    : new LocalStorageAdapter();
