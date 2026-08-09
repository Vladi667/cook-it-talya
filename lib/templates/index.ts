import type { Problem, Template, TemplateDef, TemplateId } from "../types";
import { makeRng } from "../rng";
import { PATTERNS } from "../patterns";
import { BUDGET_SECONDS } from "../budgets";
import { triangleBisector } from "./triangle-bisector";
import { triangleFromLines } from "./triangle-from-lines";
import { circleTangent } from "./circle-tangent";
import { functionInvestigation } from "./function-investigation";
import { polynomialInvestigation } from "./polynomial-investigation";
import { areaBetweenCurves } from "./area-between-curves";
import { volumeRevolution } from "./volume-revolution";
import { reverseIntegral } from "./reverse-integral";
import { optimization } from "./optimization";
import { limits } from "./limits";
import { sequences } from "./sequences";
import { growthDecay } from "./growth-decay";
import { probability } from "./probability";
import { trigonometry } from "./trigonometry";

/** Order here is the order shown on the Progress and Patterns screens. */
const DEFS: TemplateDef[] = [
  triangleBisector,
  triangleFromLines,
  circleTangent,
  functionInvestigation,
  polynomialInvestigation,
  areaBetweenCurves,
  volumeRevolution,
  reverseIntegral,
  optimization,
  limits,
  sequences,
  growthDecay,
  probability,
  trigonometry,
];

/** Each template carries its transferable method alongside its generator. */
export const TEMPLATE_LIST: Template[] = DEFS.map((def) => ({
  ...def,
  pattern: PATTERNS[def.id],
  budgetSeconds: BUDGET_SECONDS[def.id],
}));

export const TEMPLATES = Object.fromEntries(
  TEMPLATE_LIST.map((t) => [t.id, t]),
) as Record<TemplateId, Template>;

/** Only these can be generated — the adaptive picker must not stray outside. */
export const REGISTERED_TEMPLATE_IDS: TemplateId[] = TEMPLATE_LIST.map(
  (t) => t.id,
);

/** Deterministic: the same (templateId, seed) always rebuilds the same problem. */
export function generateProblem(templateId: TemplateId, seed: number): Problem {
  const template = TEMPLATES[templateId];
  if (!template) throw new Error(`unknown template: ${templateId}`);
  const problem = template.generate(makeRng(seed));
  return { ...problem, seed, id: `${templateId}:${seed}` };
}
