/**
 * Core domain types.
 *
 * ARCHITECTURAL CONSTRAINT (do not change without asking):
 * Problems are produced by parametrized templates with closed-form solvers.
 * A template = sampler + validity check + symbolic solver + ordered steps.
 * No LLM is ever in the problem-generation or answer-checking path.
 */

export type Lang = "en" | "he";

/** Every user-facing string in the math layer is bilingual. */
export type Text = Record<Lang, string>;

export const TEMPLATE_IDS = [
  "triangle-bisector",
  "triangle-from-lines",
  "circle-tangent",
  "function-investigation",
  "area-between-curves",
  "reverse-integral",
  "optimization",
  "limits",
  "sequences",
  "growth-decay",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type Topic = "analytic-geometry" | "calculus" | "algebra";

/**
 * How an answer field is compared. Never string equality — see lib/checker.ts.
 * - expression: symbolic equivalence (2x+3 === (4x+6)/2)
 * - number:     expression with no free variables
 * - point:      (a, b) compared component-wise
 * - points:     an unordered collection of points
 * - set:        an unordered collection of scalars
 * - equation:   compared up to a nonzero scalar multiple of (lhs - rhs)
 * - domain:     parsed into a canonical union of intervals
 * - none:       literal "none"/"אין" answers (e.g. no vertical asymptote)
 */
export type AnswerType =
  | "expression"
  | "number"
  | "point"
  | "points"
  | "set"
  | "equation"
  | "domain";

/**
 * A wrong answer students actually produce, paired with the reason.
 * This is what powers the "why was I wrong?" explainer — deterministically,
 * with no model call and no API key.
 */
export interface Pitfall {
  /** The wrong answer, written in the field's own answer syntax. */
  value: string;
  why: Text;
}

export interface AnswerField {
  id: string;
  prompt: Text;
  type: AnswerType;
  /** Canonical correct answer, in nerdamer-parseable syntax. */
  expected: string;
  /** Recognised near-misses, checked in order. */
  pitfalls?: Pitfall[];
  /** Free variables the expression may contain, for the numeric fallback. */
  vars?: string[];
  /** Sampling window for the numeric fallback, when the default (-3..3) is bad. */
  sampleRange?: [number, number];
  placeholder?: string;
  /** Rendered next to the input, e.g. "AD =". */
  label?: string;
}

export interface SolutionStep {
  title: Text;
  /** May contain inline math delimited by $...$ and display math by $$...$$. */
  body: Text;
  /**
   * Index into the template's recipe. This is the pedagogical hinge: it shows
   * the student that this concrete line is an instance of a general move they
   * will make again on every question of this type.
   */
  move?: number;
}

/**
 * What a strong student actually carries into the exam: not worked examples,
 * but the ability to recognise a question type in seconds and run a rehearsed
 * sequence of moves. One per template.
 */
export interface Pattern {
  /** Short name for the method itself, e.g. "Section point + distance". */
  method: Text;
  /** The 5-second recognition cues. If you see these, it is this pattern. */
  signature: Text[];
  /**
   * Literal phrases that actually occur in this template's statements — the
   * words a student should be scanning for. Highlighted after a recognition
   * drill so the cue is learned from the real wording, not a paraphrase.
   * A test asserts every generated statement contains at least one.
   */
  triggers: Record<Lang, string[]>;
  /** The reusable sequence. Identical every time — only the numbers change. */
  recipe: { move: Text; detail: Text }[];
  /** One paragraph: the reason the recipe is valid, not just that it works. */
  whyItWorks: Text;
  /** The shortcut that saves real minutes under exam pressure. */
  speedTip: Text;
  /** Check these before you write the final line. */
  watchOut: Text[];
}

/**
 * Machine-checkable claims a template makes about the problem it just built.
 * The test suite evaluates these independently of the closed-form solver
 * (numeric integration, numeric limits, nerdamer's own differentiation), which
 * is what lets us assert "100 random samples are correctly solved".
 */
export type Verification =
  | { kind: "numeric"; label: string; expr: string; expected: string; tol?: number }
  | {
      kind: "limit";
      label: string;
      expr: string;
      variable: string;
      /** A number, or "inf" / "-inf". */
      to: string;
      expected: string;
    }
  | {
      kind: "derivative";
      label: string;
      expr: string;
      variable: string;
      at: string;
      order?: number;
      expected: string;
    }
  | {
      kind: "integral";
      label: string;
      terms: { expr: string; variable: string; from: string; to: string }[];
      expected: string;
    };

/** A qualitative sketch, in data coordinates. Purely presentational. */
export interface Figure {
  xRange: [number, number];
  yRange: [number, number];
  curves: {
    points: [number, number][];
    label?: string;
    dashed?: boolean;
  }[];
  /** Closed polygon of the region under discussion. */
  shade?: [number, number][];
  marks?: { x: number; y: number; label?: string }[];
}

export interface Problem {
  id: string;
  templateId: TemplateId;
  seed: number;
  title: Text;
  /** Question text. May contain $...$ / $$...$$ math. */
  statement: Text;
  fields: AnswerField[];
  steps: SolutionStep[];
  /** Exactly three, escalating: nudge -> method -> first step. */
  hints: [Text, Text, Text];
  /** Rough difficulty 1..3, used only for display. */
  difficulty: number;
  /** The sampled parameters, kept for debugging and replay. */
  params: Record<string, number | number[] | string>;
  /** Optional sketch shown next to the statement. */
  figure?: Figure;
  /** Independent checks on the closed-form solution. */
  verification: Verification[];
}

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform integer in [min, max] excluding 0. */
  nonZeroInt(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** +1 or -1. */
  sign(): number;
  shuffle<T>(items: readonly T[]): T[];
}

export interface Template {
  id: TemplateId;
  topic: Topic;
  name: Text;
  blurb: Text;
  /** The transferable method. Attached in lib/templates/index.ts. */
  pattern: Pattern;
  /**
   * Must return a fully-solved, non-degenerate problem.
   * Implementations use rejection sampling internally until the validity
   * check passes, so this never returns a degenerate case.
   */
  generate(rng: Rng): Problem;
}

/**
 * What a template file exports. The pattern lives in lib/patterns.ts (the
 * teaching layer, edited as one piece) and is attached in templates/index.ts.
 */
export type TemplateDef = Omit<Template, "pattern">;

/* ------------------------------------------------------------------ */
/* Progress + attempt records                                          */
/* ------------------------------------------------------------------ */

export interface FieldResult {
  fieldId: string;
  correct: boolean;
  input: string;
  normalizedInput: string;
}

export interface Attempt {
  id: string;
  templateId: TemplateId;
  seed: number;
  /** Epoch ms. */
  at: number;
  /** Seconds spent on the question. */
  seconds: number;
  /** True only when every field was correct. */
  correct: boolean;
  /** Fraction of fields correct, 0..1. */
  score: number;
  hintsUsed: number;
  mode: "practice" | "exam";
  fields: FieldResult[];
}

export interface TemplateStats {
  templateId: TemplateId;
  attempts: number;
  correct: number;
  /** Sum of per-attempt scores, for partial credit. */
  scoreSum: number;
  totalSeconds: number;
  lastSeen: number | null;
  /** Consecutive fully-correct attempts. */
  streak: number;
}

/**
 * Only the seed is stored — the problem is regenerated from it on load, which
 * keeps saved exams tiny and guarantees they replay identically.
 */
export interface ExamQuestion {
  templateId: TemplateId;
  seed: number;
  answers: Record<string, string>;
}

export interface ExamState {
  id: string;
  startedAt: number;
  durationSeconds: number;
  questions: ExamQuestion[];
  index: number;
  finishedAt: number | null;
}

/**
 * Recognition is tracked separately from solving. A student can know every
 * method and still be slow because they cannot tell at a glance which one to
 * reach for — blending the two into a single mastery number hides that.
 */
export interface RecognitionStats {
  templateId: TemplateId;
  seen: number;
  correct: number;
  /** Total milliseconds spent deciding, for the median-time readout. */
  totalMs: number;
}

export interface AppData {
  version: 1;
  lang: Lang;
  stats: Record<string, TemplateStats>;
  recognition: Record<string, RecognitionStats>;
  history: Attempt[];
  exam: ExamState | null;
}
