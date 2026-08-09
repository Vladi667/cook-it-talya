import type { TemplateId, Text, TrapStats } from "./types";

/**
 * Every named mistake the app can catch, in one place.
 *
 * Templates declare only the slug; the human label lives here so the error
 * profile can say "you have made this mistake five times" without depending
 * on the wording of any single question.
 */
export interface TrapMeta {
  templateId: TemplateId;
  short: Text;
}

export const TRAPS: Record<string, TrapMeta> = {
  /* ---- triangle-bisector ---- */
  "bisector-midpoint": {
    templateId: "triangle-bisector",
    short: {
      en: "Used the midpoint — that is the median",
      he: "השתמשתם באמצע — זהו התיכון",
    },
  },
  "bisector-weights-swapped": {
    templateId: "triangle-bisector",
    short: {
      en: "Section-formula weights swapped",
      he: "משקלי נוסחת החלוקה הוחלפו",
    },
  },
  "bisector-median-length": {
    templateId: "triangle-bisector",
    short: {
      en: "Measured the median, not the bisector",
      he: "מדדתם את התיכון ולא את החוצה",
    },
  },
  "bisector-forgot-sqrt": {
    templateId: "triangle-bisector",
    short: { en: "Gave $AD^2$ instead of $AD$", he: "נתתם $AD^2$ במקום $AD$" },
  },

  /* ---- triangle-from-lines ---- */
  "reflect-foot-only-b": {
    templateId: "triangle-from-lines",
    short: {
      en: "Stopped at the foot of the perpendicular",
      he: "עצרתם ברגל האנך",
    },
  },
  "reflect-foot-only-c": {
    templateId: "triangle-from-lines",
    short: {
      en: "Stopped at the midpoint instead of reflecting",
      he: "עצרתם באמצע במקום לשקף",
    },
  },
  "reflect-wrong-line": {
    templateId: "triangle-from-lines",
    short: { en: "Reflected across the same line twice", he: "שיקפתם פעמיים באותו ישר" },
  },
  "circumcircle-radius-not-squared": {
    templateId: "triangle-from-lines",
    short: { en: "Wrote $R$ where $R^2$ belongs", he: "כתבתם $R$ במקום $R^2$" },
  },
  "circumcircle-centre-signs": {
    templateId: "triangle-from-lines",
    short: { en: "Centre signs inverted", he: "סימני המרכז הפוכים" },
  },

  /* ---- circle-tangent ---- */
  "circle-centre-signs": {
    templateId: "circle-tangent",
    short: { en: "Centre signs inverted", he: "סימני המרכז הפוכים" },
  },
  "circle-radius-squared": {
    templateId: "circle-tangent",
    short: { en: "Gave $R^2$ instead of $R$", he: "נתתם $R^2$ במקום $R$" },
  },
  "circle-tangent-parallel": {
    templateId: "circle-tangent",
    short: {
      en: "Used the radius as direction, not normal",
      he: "השתמשתם ברדיוס ככיוון ולא כנורמל",
    },
  },
  "circle-length-to-centre": {
    templateId: "circle-tangent",
    short: {
      en: "Measured to the centre, not the tangent",
      he: "מדדתם עד המרכז ולא את המשיק",
    },
  },
  "circle-length-squared": {
    templateId: "circle-tangent",
    short: { en: "Gave $PT^2$ instead of $PT$", he: "נתתם $PT^2$ במקום $PT$" },
  },

  /* ---- function-investigation ---- */
  "tangent-intercept-unshifted": {
    templateId: "function-investigation",
    short: {
      en: "Used $f(x_0)$ as the $y$-intercept",
      he: "השתמשתם ב-$f(x_0)$ כחיתוך ציר $y$",
    },
  },
  "domain-log-nonzero": {
    templateId: "function-investigation",
    short: { en: "$\\ln$ domain: excluded only $0$", he: "תחום $\\ln$: פסלתם רק $0$" },
  },
  "domain-log-closed": {
    templateId: "function-investigation",
    short: { en: "Included $0$ in a $\\ln$ domain", he: "כללתם $0$ בתחום $\\ln$" },
  },
  "asymptote-log-none": {
    templateId: "function-investigation",
    short: { en: "Missed the horizontal asymptote", he: "פספסתם אסימפטוטה אופקית" },
  },
  "domain-rational-all": {
    templateId: "function-investigation",
    short: { en: "Forgot to exclude the pole", he: "שכחתם לפסול את אפס המכנה" },
  },
  "asymptote-vertical-sign": {
    templateId: "function-investigation",
    short: { en: "Vertical asymptote sign flipped", he: "סימן האסימפטוטה האנכית הפוך" },
  },
  "asymptote-rational-horizontal": {
    templateId: "function-investigation",
    short: {
      en: "Called an oblique asymptote horizontal",
      he: "קראתם לאסימפטוטה משופעת אופקית",
    },
  },
  "asymptote-rational-none": {
    templateId: "function-investigation",
    short: { en: "Missed the oblique asymptote", he: "פספסתם אסימפטוטה משופעת" },
  },
  "domain-root-open": {
    templateId: "function-investigation",
    short: { en: "Excluded $0$ from a $\\sqrt{}$ domain", he: "פסלתם $0$ מתחום שורש" },
  },
  "extremum-sign": {
    templateId: "function-investigation",
    short: { en: "Extremum $y$ sign wrong", he: "סימן ה-$y$ בקיצון שגוי" },
  },

  /* ---- area-between-curves ---- */
  "area-no-split": {
    templateId: "area-between-curves",
    short: { en: "Did not split the region", he: "לא פיצלתם את התחום" },
  },
  "area-curve-only": {
    templateId: "area-between-curves",
    short: { en: "Area under the curve only", he: "רק השטח שמתחת לעקום" },
  },
  "area-half-only": {
    templateId: "area-between-curves",
    short: { en: "Only one half of the region", he: "רק חצי מהתחום" },
  },

  /* ---- reverse-integral ---- */
  "integral-remainder-not-b": {
    templateId: "reverse-integral",
    short: { en: "Solved for the remainder, not $b$", he: "פתרתם עבור השארית ולא $b$" },
  },
  "integral-remainder-sign": {
    templateId: "reverse-integral",
    short: { en: "Remainder sign slip", he: "טעות סימן בשארית" },
  },

  /* ---- optimization ---- */
  "opt-degenerate-root": {
    templateId: "optimization",
    short: { en: "Took the degenerate root", he: "בחרתם בשורש המנוון" },
  },
  "opt-base-area-not-volume": {
    templateId: "optimization",
    short: { en: "Gave the base area, not the volume", he: "נתתם שטח בסיס ולא נפח" },
  },
  "opt-width-is-2x": {
    templateId: "optimization",
    short: { en: "Width is $2x$, not $x$", he: "הרוחב הוא $2x$ ולא $x$" },
  },
  "opt-area-width-is-2x": {
    templateId: "optimization",
    short: { en: "Area used $x$ as the width", he: "בשטח השתמשתם ב-$x$ כרוחב" },
  },

  /* ---- limits ---- */
  "limit-ratio-inverted": {
    templateId: "limits",
    short: { en: "Ratio upside down", he: "היחס הפוך" },
  },
  "limit-exponents-added": {
    templateId: "limits",
    short: { en: "Added exponents instead of multiplying", he: "חיברתם מעריכים במקום להכפיל" },
  },
  "limit-lost-half": {
    templateId: "limits",
    short: { en: "Lost the factor $\\frac{1}{2}$", he: "איבדתם את הגורם $\\frac{1}{2}$" },
  },
  "limit-e-in-numerator": {
    templateId: "limits",
    short: { en: "$e$ in the numerator, not denominator", he: "$e$ במונה במקום במכנה" },
  },
  "limit-dropped-coefficient": {
    templateId: "limits",
    short: { en: "Dropped the outer coefficient", he: "השמטתם את המקדם החיצוני" },
  },

  /* ---- sequences ---- */
  "seq-steps-not-terms": {
    templateId: "sequences",
    short: { en: "Counted terms, not steps", he: "ספרתם איברים ולא צעדים" },
  },
  "seq-off-by-one": {
    templateId: "sequences",
    short: { en: "Off by one step to $a_1$", he: "סטייה של צעד אחד עד $a_1$" },
  },
  "seq-sum-last-term": {
    templateId: "sequences",
    short: { en: "Sum used $n$ instead of $n-1$", he: "בסכום השתמשתם ב-$n$ במקום $n-1$" },
  },
  "seq-infinite-sign": {
    templateId: "sequences",
    short: { en: "$S_\\infty$ denominator sign", he: "סימן המכנה ב-$S_\\infty$" },
  },
  "seq-ratio-is-power": {
    templateId: "sequences",
    short: { en: "Gave $q^n$ instead of $q$", he: "נתתם $q^n$ במקום $q$" },
  },

  /* ---- growth-decay ---- */
  "growth-factor-whole-period": {
    templateId: "growth-decay",
    short: { en: "Factor for the whole period, not per unit", he: "מקדם לכל התקופה ולא ליחידה" },
  },
  "growth-factor-inverted": {
    templateId: "growth-decay",
    short: { en: "Factor upside down", he: "המקדם הפוך" },
  },
  "growth-log-quotient": {
    templateId: "growth-decay",
    short: {
      en: "$\\frac{\\ln A}{\\ln B}$ instead of $\\ln\\frac{A}{B}$",
      he: "$\\frac{\\ln A}{\\ln B}$ במקום $\\ln\\frac{A}{B}$",
    },
  },
};

export function emptyTrap(id: string, templateId: TemplateId): TrapStats {
  return { id, templateId, hits: 0, lastAt: 0, clearedSince: 0 };
}

/** A trap counts as still open until it has been avoided a few times since. */
export const CLEARED_THRESHOLD = 3;

export function isOpen(trap: TrapStats): boolean {
  return trap.clearedSince < CLEARED_THRESHOLD;
}

/** Most-pressing traps first: recent, frequent, and not yet cleared. */
export function rankedTraps(
  traps: Record<string, TrapStats>,
  now = Date.now(),
): TrapStats[] {
  return Object.values(traps)
    .filter((tr) => tr.hits > 0)
    .sort((a, b) => {
      const openDiff = Number(isOpen(b)) - Number(isOpen(a));
      if (openDiff !== 0) return openDiff;
      if (b.hits !== a.hits) return b.hits - a.hits;
      return b.lastAt - a.lastAt;
    })
    .slice(0, 8)
    .filter(() => now >= 0);
}

/** Extra selection weight for templates carrying unresolved traps. */
export function trapPressure(
  traps: Record<string, TrapStats>,
  templateId: TemplateId,
): number {
  let pressure = 0;
  for (const trap of Object.values(traps)) {
    if (trap.templateId !== templateId || !isOpen(trap)) continue;
    pressure += Math.min(3, trap.hits);
  }
  return pressure;
}
