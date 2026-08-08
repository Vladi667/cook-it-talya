import type { Lang, Text } from "./types";

/** Every UI string, in both languages. Math strings live in the templates. */
export const UI = {
  appName: { en: "Cook it Talya", he: "Cook it Talya" },
  tagline: { en: "Bagrut trainer · 5 units", he: "מתרגל בגרות · 5 יחידות" },

  practice: { en: "Practice", he: "תרגול" },
  patterns: { en: "Patterns", he: "תבניות" },
  exam: { en: "Exam", he: "מבחן" },
  progress: { en: "Progress", he: "התקדמות" },

  thePattern: { en: "The pattern", he: "התבנית" },
  patternsTitle: { en: "Patterns", he: "תבניות" },
  patternsIntro: {
    en: "Bagrut questions are rehearsed forms, not puzzles. Six patterns cover the whole paper: learn to recognise each one in five seconds, run its recipe, and the exam becomes bookkeeping.",
    he: "שאלות הבגרות הן תבניות מתורגלות, לא חידות. שש תבניות מכסות את כל השאלון: למדו לזהות כל אחת בחמש שניות, הריצו את השיטה, והמבחן הופך לניהול רישום.",
  },
  howToSpot: { en: "How to spot it", he: "איך לזהות" },
  theMethod: { en: "The method", he: "השיטה" },
  whyItWorks: { en: "Why it works", he: "למה זה עובד" },
  speedTip: { en: "The faster route", he: "הדרך המהירה" },
  watchOut: { en: "Before you write the answer", he: "לפני שכותבים את התשובה" },
  move: { en: "Move", he: "מהלך" },
  studyPattern: { en: "Study this pattern", he: "ללמוד את התבנית" },
  openPattern: { en: "Open the pattern", he: "פתחו את התבנית" },
  patternRecall: {
    en: "Same six moves, every time. Only the numbers change.",
    he: "אותם שישה מהלכים, בכל פעם. רק המספרים משתנים.",
  },

  yourAnswer: { en: "Your answer", he: "התשובה שלך" },
  check: { en: "Check answer", he: "בדיקת תשובה" },
  next: { en: "Next question", he: "שאלה הבאה" },
  skip: { en: "Skip", he: "דילוג" },
  hint: { en: "Hint", he: "רמז" },
  anotherHint: { en: "Another hint", he: "רמז נוסף" },
  hintsExhausted: { en: "No more hints", he: "אין רמזים נוספים" },
  hintN: { en: "Hint", he: "רמז" },

  correct: { en: "Correct", he: "נכון" },
  incorrect: { en: "Not quite", he: "לא מדויק" },
  partial: { en: "Partly correct", he: "נכון חלקית" },
  readAs: { en: "Read as", he: "נקרא כ" },
  expected: { en: "Expected", he: "התשובה הנכונה" },

  tryAgain: { en: "Try again", he: "נסו שוב" },
  secondChance: {
    en: "Read what went wrong, then answer again. Nothing is recorded until you stop.",
    he: "קראו מה השתבש, ואז ענו שוב. שום דבר לא נרשם עד שתפסיקו.",
  },
  attemptN: { en: "Attempt", he: "ניסיון" },
  revealSolution: { en: "Show me the solution", he: "הראו לי את הפתרון" },
  gotItAlone: {
    en: "Second attempt — worked it out yourself.",
    he: "ניסיון שני — פתרתם בעצמכם.",
  },
  solution: { en: "Solution", he: "פתרון" },
  showStep: { en: "Show next step", he: "הצג את השלב הבא" },
  showAllSteps: { en: "Show all steps", he: "הצג את כל השלבים" },
  stepsDone: { en: "That's the full solution.", he: "זהו הפתרון המלא." },
  step: { en: "Step", he: "שלב" },

  explainMistake: { en: "Why was I wrong?", he: "למה טעיתי?" },

  hintSign: {
    en: "Right size, wrong sign — check a minus somewhere.",
    he: "הגודל נכון אך הסימן שגוי — בדקו מינוס כלשהו.",
  },
  hintFactor2: {
    en: "You are off by a factor of 2 — check a ½ in a formula.",
    he: "יש פי 2 הפרש — בדקו ½ באחת הנוסחאות.",
  },
  hintClose: {
    en: "Very close. Check the arithmetic in the last step.",
    he: "קרוב מאוד. בדקו את החישוב בשלב האחרון.",
  },
  hintParse: {
    en: "I couldn't read that. Try forms like sqrt(2), 3/4, ln(x), e^2.",
    he: "לא הצלחתי לקרוא את התשובה. נסו כתיב כמו sqrt(2), 3/4, ln(x), e^2.",
  },
  hintEmpty: { en: "Write something first.", he: "כתבו תשובה תחילה." },
  hintCount: {
    en: "You gave a different number of answers than expected.",
    he: "מספר התשובות שונה מהנדרש.",
  },
  hintArity: {
    en: "A point needs two coordinates: (x, y).",
    he: "נקודה דורשת שני שיעורים: (x, y).",
  },
  hintNotNone: {
    en: "There is one — look again.",
    he: "כן קיים כזה — בדקו שוב.",
  },

  examTitle: { en: "Exam mode", he: "מצב מבחן" },
  examIntro: {
    en: "Six questions, one from each topic. 90 minutes, no hints. Solutions are shown at the end.",
    he: "שש שאלות, אחת מכל נושא. 90 דקות, ללא רמזים. הפתרונות מוצגים בסיום.",
  },
  startExam: { en: "Start exam", he: "התחלת המבחן" },
  resumeExam: { en: "Resume exam", he: "המשך המבחן" },
  submitExam: { en: "Finish and grade", he: "סיום ובדיקה" },
  confirmFinish: {
    en: "Finish the exam and see your score?",
    he: "לסיים את המבחן ולראות את הציון?",
  },
  question: { en: "Question", he: "שאלה" },
  of: { en: "of", he: "מתוך" },
  prev: { en: "Previous", he: "הקודמת" },
  timeLeft: { en: "Time left", he: "זמן שנותר" },
  timeUp: { en: "Time is up.", he: "הזמן נגמר." },
  yourScore: { en: "Your score", he: "הציון שלך" },
  breakdown: { en: "Breakdown", he: "פירוט" },
  newExam: { en: "New exam", he: "מבחן חדש" },
  discardExam: { en: "Discard", he: "ביטול" },
  answered: { en: "answered", he: "נענו" },

  mastery: { en: "Mastery", he: "שליטה" },
  accuracy: { en: "Accuracy", he: "אחוז הצלחה" },
  attempts: { en: "Attempts", he: "ניסיונות" },
  avgTime: { en: "Avg. time", he: "זמן ממוצע" },
  streak: { en: "Streak", he: "רצף" },
  totalSolved: { en: "Problems done", he: "שאלות שנפתרו" },
  weakest: { en: "Focus here next", he: "כדאי להתמקד כאן" },
  noDataYet: {
    en: "Nothing yet — solve a few questions and this fills in.",
    he: "עדיין אין נתונים — פתרו כמה שאלות והמידע יופיע כאן.",
  },
  recent: { en: "Recent", he: "אחרונות" },
  lastSeen: { en: "Last seen", he: "נראה לאחרונה" },
  never: { en: "never", he: "מעולם" },
  today: { en: "today", he: "היום" },
  daysAgo: { en: "d ago", he: "ימים" },
  resetAll: { en: "Reset all progress", he: "איפוס כל ההתקדמות" },
  confirmReset: {
    en: "Delete all progress on this device?",
    he: "למחוק את כל ההתקדמות במכשיר זה?",
  },

  loading: { en: "Loading…", he: "טוען…" },
  seconds: { en: "s", he: "שנ׳" },
  minutes: { en: "min", he: "דק׳" },
} satisfies Record<string, Text>;

export type UiKey = keyof typeof UI;

export function t(key: UiKey, lang: Lang): string {
  return UI[key][lang];
}

/** Picks the right side of any bilingual object. */
export function tx(text: Text, lang: Lang): string {
  return text[lang];
}

export const HINT_KEY_MAP: Record<string, UiKey> = {
  sign: "hintSign",
  factor2: "hintFactor2",
  close: "hintClose",
  parse: "hintParse",
  empty: "hintEmpty",
  count: "hintCount",
  arity: "hintArity",
  notNone: "hintNotNone",
};
