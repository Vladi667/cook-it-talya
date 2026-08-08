import type { Problem, Template, TemplateId } from "../types";
import { makeRng } from "../rng";
import { triangleBisector } from "./triangle-bisector";
import { triangleFromLines } from "./triangle-from-lines";
import { functionInvestigation } from "./function-investigation";
import { areaBetweenCurves } from "./area-between-curves";
import { reverseIntegral } from "./reverse-integral";
import { limits } from "./limits";

/** Order here is the order shown on the Progress screen. */
export const TEMPLATE_LIST: Template[] = [
  triangleBisector,
  triangleFromLines,
  functionInvestigation,
  areaBetweenCurves,
  reverseIntegral,
  limits,
];

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
