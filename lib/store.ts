"use client";

import { create } from "zustand";
import { storage, emptyData } from "./storage";
import { applyAttempt, statsFor } from "./mastery";
import { emptyRecognition } from "./spot";
import { emptyTrap } from "./traps";
import type {
  Attempt,
  ExamState,
  Lang,
  RecognitionStats,
  TemplateStats,
  TemplateId,
  TrapStats,
} from "./types";

const HISTORY_CAP = 300;

interface AppStore {
  ready: boolean;
  lang: Lang;
  stats: Record<string, TemplateStats>;
  recognition: Record<string, RecognitionStats>;
  traps: Record<string, TrapStats>;
  history: Attempt[];
  exam: ExamState | null;

  hydrate: () => Promise<void>;
  setLang: (lang: Lang) => void;
  recordAttempt: (attempt: Attempt) => void;
  recordRecognition: (
    templateId: TemplateId,
    correct: boolean,
    ms: number,
  ) => void;
  /** `hit` traps fired this attempt; `avoided` are traps on fields answered right. */
  recordTraps: (
    templateId: TemplateId,
    hit: string[],
    avoided: string[],
  ) => void;
  resetAll: () => void;

  setExam: (exam: ExamState | null) => void;
  setExamAnswer: (index: number, fieldId: string, value: string) => void;
  gotoExamQuestion: (index: number) => void;
}

function persist(get: () => AppStore) {
  const { lang, stats, recognition, traps, history, exam } = get();
  void storage.save({
    version: 1,
    lang,
    stats,
    recognition,
    traps,
    history: history.slice(0, HISTORY_CAP),
    exam,
  });
}

export const useApp = create<AppStore>((set, get) => ({
  ...emptyData(),
  ready: false,

  async hydrate() {
    if (get().ready) return;
    const data = (await storage.load()) ?? emptyData();
    set({ ...data, ready: true });
    applyDocumentLang(data.lang);
  },

  setLang(lang) {
    set({ lang });
    applyDocumentLang(lang);
    persist(get);
  },

  recordAttempt(attempt) {
    const stats = { ...get().stats };
    stats[attempt.templateId] = applyAttempt(
      statsFor(stats, attempt.templateId),
      {
        correct: attempt.correct,
        score: attempt.score,
        seconds: attempt.seconds,
        at: attempt.at,
      },
    );
    set({ stats, history: [attempt, ...get().history].slice(0, HISTORY_CAP) });
    persist(get);
  },

  recordRecognition(templateId, correct, ms) {
    const recognition = { ...get().recognition };
    const prev = recognition[templateId] ?? emptyRecognition(templateId);
    recognition[templateId] = {
      ...prev,
      seen: prev.seen + 1,
      correct: prev.correct + (correct ? 1 : 0),
      totalMs: prev.totalMs + ms,
    };
    set({ recognition });
    persist(get);
  },

  recordTraps(templateId, hit, avoided) {
    if (hit.length === 0 && avoided.length === 0) return;
    const traps = { ...get().traps };
    const at = Date.now();
    for (const id of hit) {
      const prev = traps[id] ?? emptyTrap(id, templateId);
      // Falling for it again reopens the trap.
      traps[id] = { ...prev, hits: prev.hits + 1, lastAt: at, clearedSince: 0 };
    }
    for (const id of avoided) {
      const prev = traps[id];
      if (!prev || prev.hits === 0) continue;
      traps[id] = { ...prev, clearedSince: prev.clearedSince + 1 };
    }
    set({ traps });
    persist(get);
  },

  resetAll() {
    set({ ...emptyData(), lang: get().lang, ready: true });
    persist(get);
  },

  setExam(exam) {
    set({ exam });
    persist(get);
  },

  setExamAnswer(index, fieldId, value) {
    const exam = get().exam;
    if (!exam) return;
    const questions = exam.questions.map((q, i) =>
      i === index ? { ...q, answers: { ...q.answers, [fieldId]: value } } : q,
    );
    set({ exam: { ...exam, questions } });
    persist(get);
  },

  gotoExamQuestion(index) {
    const exam = get().exam;
    if (!exam) return;
    const clamped = Math.max(0, Math.min(exam.questions.length - 1, index));
    set({ exam: { ...exam, index: clamped } });
    persist(get);
  },
}));

/** Language drives both `lang` and `dir` on <html>. */
export function applyDocumentLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
}

export function useLang(): Lang {
  return useApp((s) => s.lang);
}

export type { TemplateId };
