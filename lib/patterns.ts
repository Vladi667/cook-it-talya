import type { Pattern, TemplateId } from "./types";

/**
 * The teaching layer.
 *
 * Bagrut questions are not puzzles — they are rehearsed forms. A student who
 * recognises the form and runs the recipe finishes in a third of the time of
 * one who re-derives everything. Each entry is written to be memorised: a
 * signature you can spot in five seconds, a fixed sequence of moves, the
 * reason the sequence is valid, and the shortcut that saves exam minutes.
 */
export const PATTERNS: Record<TemplateId, Pattern> = {
  "triangle-bisector": {
    method: {
      en: "Ratio on the opposite side, then one distance",
      he: "יחס על הצלע הנגדית, ואז מרחק אחד",
    },
    signature: [
      {
        en: "Three vertices given as **coordinates**",
        he: "שלושה קודקודים נתונים ב**שיעורים**",
      },
      {
        en: "An **angle bisector** drawn from one vertex to the opposite side",
        he: "**חוצה זווית** מקודקוד אחד אל הצלע הנגדית",
      },
      {
        en: "Asked for the foot of the bisector, its length, or a ratio",
        he: "נדרש למצוא את רגל החוצה, את אורכו, או יחס",
      },
    ],
    recipe: [
      {
        move: {
          en: "Measure the two sides **next to** the bisected angle",
          he: "מדדו את שתי הצלעות ה**סמוכות** לזווית הנחצית",
        },
        detail: {
          en: "Distance formula, twice. Never start with the opposite side — it plays no part until the very end, if at all.",
          he: "נוסחת המרחק, פעמיים. אל תתחילו מהצלע הנגדית — אין לה תפקיד עד הסוף, אם בכלל.",
        },
      },
      {
        move: {
          en: "Write the ratio the bisector cuts",
          he: "רשמו את היחס שהחוצה יוצר",
        },
        detail: {
          en: "$\\frac{BD}{DC}=\\frac{AB}{AC}$. The opposite side is split in the ratio of the two sides beside the angle — that single line is the whole theorem.",
          he: "$\\frac{BD}{DC}=\\frac{AB}{AC}$. הצלע הנגדית מתחלקת ביחס שתי הצלעות שליד הזווית — השורה הזו היא כל המשפט.",
        },
      },
      {
        move: {
          en: "Turn the ratio into a point",
          he: "הפכו את היחס לנקודה",
        },
        detail: {
          en: "A point dividing $BC$ in ratio $m:n$ from $B$ is $\\frac{nB+mC}{m+n}$. Each vertex is weighted by the segment **furthest** from it — that crossing is where marks are lost.",
          he: "נקודה המחלקת את $BC$ ביחס $m:n$ מ-$B$ היא $\\frac{nB+mC}{m+n}$. כל קודקוד מקבל את משקל הקטע ה**רחוק** ממנו — ההצלבה הזו היא מקור הטעויות.",
        },
      },
      {
        move: { en: "One last distance", he: "מרחק אחרון אחד" },
        detail: {
          en: "Distance formula from the vertex to the point you just built. Expect a surd — leave it exact.",
          he: "נוסחת המרחק מהקודקוד אל הנקודה שבניתם. צפו לשורש — השאירו אותו מדויק.",
        },
      },
    ],
    whyItWorks: {
      en: "Triangles $ABD$ and $ACD$ share the same height from $A$ to the line $BC$, so their areas are in the ratio of their bases $BD:DC$. Measured from the bisector instead, they have equal heights, so their areas are in the ratio $AB:AC$. Two expressions for the same ratio — that is the entire proof, and it is worth knowing, because it tells you the theorem cannot possibly involve the third side.",
      he: "למשולשים $ABD$ ו-$ACD$ יש אותו גובה מ-$A$ אל הישר $BC$, ולכן יחס שטחיהם הוא יחס הבסיסים $BD:DC$. אם מודדים ביחס לחוצה במקום זאת, הגבהים שווים, ולכן יחס השטחים הוא $AB:AC$. שני ביטויים לאותו יחס — זו כל ההוכחה, וכדאי להכיר אותה, כי היא מלמדת שהמשפט אינו יכול לערב את הצלע השלישית.",
    },
    speedTip: {
      en: "You never need the **equation** of the bisector. Students lose five minutes finding its slope; the section formula skips straight to the point. And if only the length is asked, $t^2=AB\\cdot AC\\left[1-\\left(\\frac{BC}{AB+AC}\\right)^2\\right]$ gets there without finding the foot at all.",
      he: "לעולם אין צורך ב**משוואת** החוצה. תלמידים מבזבזים חמש דקות על מציאת השיפוע; נוסחת החלוקה מגיעה ישר לנקודה. ואם נדרש רק האורך, $t^2=AB\\cdot AC\\left[1-\\left(\\frac{BC}{AB+AC}\\right)^2\\right]$ מגיע לתשובה בלי למצוא את הרגל כלל.",
    },
    watchOut: [
      {
        en: "The midpoint is the **median**. The bisector only lands there if the triangle is isosceles.",
        he: "האמצע הוא ה**תיכון**. החוצה מגיע לשם רק במשולש שווה שוקיים.",
      },
      {
        en: "The weights cross over. $AC$ multiplies $B$, not $C$.",
        he: "המשקלים מוצלבים. $AC$ מכפיל את $B$, לא את $C$.",
      },
    ],
  },

  "triangle-from-lines": {
    method: {
      en: "Read each bisector as a mirror",
      he: "קראו כל אנך אמצעי כמראה",
    },
    signature: [
      {
        en: "One vertex given, plus **perpendicular bisectors** as line equations",
        he: "קודקוד אחד נתון, ובנוסף **אנכים אמצעיים** כמשוואות ישר",
      },
      {
        en: "Asked for the missing vertices, the circumcentre, or the circumscribed circle",
        he: "נדרש למצוא את הקודקודים החסרים, את מרכז המעגל החוסם, או את המעגל עצמו",
      },
    ],
    recipe: [
      {
        move: {
          en: "Reframe: a perpendicular bisector is a **mirror**",
          he: "מסגור מחדש: אנך אמצעי הוא **מראה**",
        },
        detail: {
          en: "It is the locus of points equidistant from $A$ and $B$, which is exactly the mirror line swapping them. So $B$ is nothing more than $A$ reflected.",
          he: "זהו אוסף הנקודות במרחק שווה מ-$A$ ומ-$B$, כלומר בדיוק ישר המראה שמחליף ביניהם. לכן $B$ אינו אלא $A$ משוקף.",
        },
      },
      {
        move: { en: "Reflect the known vertex", he: "שקפו את הקודקוד הידוע" },
        detail: {
          en: "For $\\ell:\\ ax+by=c$, the normal direction is $(a,b)$. Travel from $A$ along it to the line, then the **same distance again**. Repeat for the second bisector to get the third vertex.",
          he: "עבור $\\ell:\\ ax+by=c$, כיוון הנורמל הוא $(a,b)$. התקדמו מ-$A$ בכיוון זה עד הישר, ואז **אותו מרחק שוב**. חזרו על כך עם האנך השני כדי לקבל את הקודקוד השלישי.",
        },
      },
      {
        move: { en: "Intersect for the centre", he: "חתכו כדי למצוא את המרכז" },
        detail: {
          en: "Solve the two line equations together. Any two perpendicular bisectors meet at the circumcentre — the third carries no new information.",
          he: "פתרו יחד את שתי משוואות הישרים. כל שני אנכים אמצעיים נפגשים במרכז המעגל החוסם — השלישי אינו מוסיף מידע.",
        },
      },
      {
        move: { en: "Radius, then the equation", he: "רדיוס, ואז המשוואה" },
        detail: {
          en: "$R$ is the distance from the centre to any vertex. Write $\\left(x-p\\right)^2+\\left(y-q\\right)^2=R^2$.",
          he: "$R$ הוא המרחק מהמרכז לכל קודקוד. רשמו $\\left(x-p\\right)^2+\\left(y-q\\right)^2=R^2$.",
        },
      },
    ],
    whyItWorks: {
      en: "Every point on the perpendicular bisector of $AB$ is equidistant from $A$ and $B$ — that is its definition, not a consequence. So a point lying on two of them is equidistant from all three vertices, which is precisely what being the centre of the circumscribed circle means. The existence of the circumcentre is not a coincidence to be memorised; it falls out of the definition.",
      he: "כל נקודה על האנך האמצעי ל-$AB$ נמצאת במרחק שווה מ-$A$ ומ-$B$ — זו ההגדרה, לא מסקנה. לכן נקודה הנמצאת על שניים מהם נמצאת במרחק שווה משלושת הקודקודים, וזו בדיוק המשמעות של מרכז המעגל החוסם. קיום המרכז אינו צירוף מקרים שיש לשנן; הוא נובע ישירות מההגדרה.",
    },
    speedTip: {
      en: "Reflecting is far faster than the alternative of setting up “$|PA|=|PB|$ and $P$ on the line” and solving a system. And for the radius, always measure to the vertex you were **given** — its coordinates are exact and small, while the ones you derived carry any slip you made.",
      he: "שיקוף מהיר בהרבה מהחלופה של הצבת ״$|PA|=|PB|$ ו-$P$ על הישר״ ופתרון מערכת. ולרדיוס, מדדו תמיד אל הקודקוד ש**ניתן לכם** — שיעוריו מדויקים וקטנים, בעוד שאלה שחישבתם נושאים כל טעות שנפלה.",
    },
    watchOut: [
      {
        en: "The right-hand side of the circle equation is $R^2$, not $R$.",
        he: "האגף הימני של משוואת המעגל הוא $R^2$, לא $R$.",
      },
      {
        en: "The foot of the perpendicular is only **halfway** to the reflected point.",
        he: "רגל האנך היא רק **חצי הדרך** אל הנקודה המשוקפת.",
      },
    ],
  },

  "function-investigation": {
    method: {
      en: "Domain, simplify, differentiate, read the signs",
      he: "תחום, פישוט, גזירה, קריאת סימנים",
    },
    signature: [
      {
        en: "A single $f(x)$ followed by a **shopping list**: domain, extrema, asymptotes, tangent",
        he: "פונקציה $f(x)$ אחת ואחריה **רשימת דרישות**: תחום, קיצון, אסימפטוטות, משיק",
      },
      {
        en: "The function contains $\\ln$, a fraction, or a root — the thing that restricts the domain",
        he: "הפונקציה מכילה $\\ln$, שבר, או שורש — מה שמגביל את התחום",
      },
    ],
    recipe: [
      {
        move: { en: "Domain first, always", he: "תחום הגדרה — תמיד ראשון" },
        detail: {
          en: "Denominator $\\neq 0$, inside of a root $\\geq 0$, inside of a $\\ln$ $>0$. Every later answer is confined to this set, so getting it wrong poisons everything downstream.",
          he: "מכנה $\\neq 0$, ביטוי בתוך שורש $\\geq 0$, ביטוי בתוך $\\ln$ $>0$. כל תשובה בהמשך מוגבלת לקבוצה הזו, ולכן טעות כאן מרעילה את כל השאר.",
        },
      },
      {
        move: {
          en: "Simplify **before** you differentiate",
          he: "פשטו **לפני** הגזירה",
        },
        detail: {
          en: "Long division on a top-heavy fraction; log rules on $\\ln$ of a product or power. Two minutes here saves ten in the derivative.",
          he: "חילוק ארוך בשבר שדרגת מונהו גבוהה; חוקי לוגריתמים על $\\ln$ של מכפלה או חזקה. שתי דקות כאן חוסכות עשר בנגזרת.",
        },
      },
      {
        move: { en: "$f'=0$, then read the sign", he: "$f'=0$, ואז קראו את הסימן" },
        detail: {
          en: "Solve for the critical points, then decide max or min from the **sign of $f'$ on each side** — usually the denominator is always positive, so only the numerator's sign matters.",
          he: "פתרו כדי למצוא נקודות חשודות, ואז קבעו מקסימום או מינימום לפי **סימן $f'$ משני הצדדים** — לרוב המכנה חיובי תמיד, ולכן רק סימן המונה קובע.",
        },
      },
      {
        move: { en: "Asymptotes from the two ends", he: "אסימפטוטות משני הקצוות" },
        detail: {
          en: "Vertical ones sit at the points the domain excluded. For the far end, the quotient of the long division **is** the horizontal or oblique asymptote — you already computed it in move 2.",
          he: "האנכיות נמצאות בנקודות שהתחום פסל. עבור הקצה הרחוק, מנת החילוק הארוך **היא** האסימפטוטה האופקית או המשופעת — כבר חישבתם אותה במהלך 2.",
        },
      },
      {
        move: { en: "Tangent = point + slope", he: "משיק = נקודה + שיפוע" },
        detail: {
          en: "$y-f(x_0)=f'(x_0)\\left(x-x_0\\right)$. Two numbers, one line. Expand only at the end.",
          he: "$y-f(x_0)=f'(x_0)\\left(x-x_0\\right)$. שני מספרים, ישר אחד. פתחו סוגריים רק בסוף.",
        },
      },
    ],
    whyItWorks: {
      en: "A derivative is a sign, not a number. Once you accept that the only question at a critical point is “what does $f'$ do on either side”, the whole investigation becomes bookkeeping: the domain says where you are allowed to look, $f'$ says where the graph turns, and the limits at the edges say what it approaches. Nothing else is being asked, however long the question looks.",
      he: "נגזרת היא סימן, לא מספר. ברגע שמקבלים שהשאלה היחידה בנקודה חשודה היא ״מה עושה $f'$ משני הצדדים״, כל החקירה הופכת לניהול רישום: התחום אומר היכן מותר להסתכל, $f'$ אומר היכן הגרף מתהפך, והגבולות בקצוות אומרים למה הוא שואף. שום דבר אחר לא נשאל, כמה שהשאלה תיראה ארוכה.",
    },
    speedTip: {
      en: "For a fraction whose numerator is exactly one degree higher than its denominator, **never use the quotient rule**. Long division turns it into a line plus $\\frac{k}{x+a}$: the derivative becomes a one-liner, and the oblique asymptote is handed to you free.",
      he: "בשבר שדרגת מונהו גבוהה בדיוק באחת מדרגת מכנהו, **אל תשתמשו בכלל המנה**. חילוק ארוך הופך אותו לישר ועוד $\\frac{k}{x+a}$: הנגזרת הופכת לשורה אחת, והאסימפטוטה המשופעת ניתנת במתנה.",
    },
    watchOut: [
      {
        en: "$\\sqrt{x}$ **is** defined at $0$; $\\ln x$ is **not**. The bracket differs.",
        he: "$\\sqrt{x}$ **כן** מוגדר ב-$0$; $\\ln x$ **לא**. הסוגר שונה.",
      },
      {
        en: "$f(x_0)$ is the height at $x_0$, not the $y$-intercept.",
        he: "$f(x_0)$ הוא הגובה ב-$x_0$, לא נקודת החיתוך עם ציר ה-$y$.",
      },
    ],
  },

  "area-between-curves": {
    method: {
      en: "Sketch, split, integrate each piece",
      he: "שרטוט, פיצול, אינטגרל לכל חלק",
    },
    signature: [
      {
        en: "Two graphs, or a graph and a line, plus the words **“bounded region”**",
        he: "שני גרפים, או גרף וישר, ובנוסף המילים **״התחום החסום״**",
      },
      {
        en: "The $x$-axis is named as one of the boundaries — that is the hint that the region splits",
        he: "ציר ה-$x$ מוזכר כאחד הגבולות — זה הרמז שהתחום מתפצל",
      },
    ],
    recipe: [
      {
        move: { en: "Sketch it, even badly", he: "שרטטו, גם אם גס" },
        detail: {
          en: "Thirty seconds of drawing decides the entire structure of the answer. Without it you are guessing which curve is on top.",
          he: "שלושים שניות של שרטוט קובעות את כל מבנה הפתרון. בלעדיו אתם מנחשים איזה עקום עליון.",
        },
      },
      {
        move: {
          en: "Find every crossing, including with the axis",
          he: "מצאו כל חיתוך, כולל עם הציר",
        },
        detail: {
          en: "Curve meets curve, and each boundary meets the $x$-axis. These are your candidate split points and integration limits.",
          he: "עקום פוגש עקום, וכל גבול פוגש את ציר ה-$x$. אלה נקודות הפיצול ותחומי האינטגרציה האפשריים.",
        },
      },
      {
        move: {
          en: "Name the upper and lower boundary on **each** sub-interval",
          he: "קבעו מיהו הגבול העליון והתחתון ב**כל** תת-קטע",
        },
        detail: {
          en: "The boundary changes at a split point — that is the only reason the region needed splitting at all. Write it down explicitly before integrating.",
          he: "הגבול מתחלף בנקודת הפיצול — זו הסיבה היחידה שהתחום דרש פיצול. רשמו זאת במפורש לפני האינטגרציה.",
        },
      },
      {
        move: {
          en: "$\\int(\\text{upper}-\\text{lower})$ on each piece, then add",
          he: "$\\int(\\text{עליון}-\\text{תחתון})$ בכל חלק, ואז חברו",
        },
        detail: {
          en: "Areas add. Irrational pieces from the split point usually cancel between the two integrals — if your answer is ugly, suspect a boundary error.",
          he: "שטחים מתחברים. איברים אי-רציונליים מנקודת הפיצול לרוב מצטמצמים בין שני האינטגרלים — אם התשובה מכוערת, חשדו בטעות בגבולות.",
        },
      },
    ],
    whyItWorks: {
      en: "The definite integral adds up the **height of the region**, strip by strip. So the only thing you must know at each $x$ is where the top of the strip is and where the bottom is. A split point is nothing more mysterious than the place where one of those two answers changes — which is why sketching, not integrating, is the hard part of these questions.",
      he: "האינטגרל המסוים מסכם את **גובה התחום**, רצועה אחר רצועה. לכן הדבר היחיד שחייבים לדעת בכל $x$ הוא היכן ראש הרצועה והיכן תחתיתה. נקודת פיצול אינה אלא המקום שבו אחת משתי התשובות הללו משתנה — ולכן החלק הקשה בשאלות אלה הוא השרטוט, לא האינטגרציה.",
    },
    speedTip: {
      en: "When the boundaries are root curves — parabolas lying on their side — integrating **with respect to $y$** often replaces two integrals with one, because in the $y$ direction the region has a single left boundary and a single right boundary all the way up. Look for this before committing to $dx$.",
      he: "כאשר הגבולות הם עקומי שורש — פרבולות שוכבות — אינטגרציה **לפי $y$** מחליפה לעיתים קרובות שני אינטגרלים באחד, כי בכיוון $y$ לתחום יש גבול שמאלי אחד וגבול ימני אחד לכל גובהו. בדקו זאת לפני שמתחייבים ל-$dx$.",
    },
    watchOut: [
      {
        en: "Subtracting a line while it is **below** the axis invents area that is not there.",
        he: "חיסור ישר בזמן שהוא **מתחת** לציר ממציא שטח שאינו קיים.",
      },
      {
        en: "An area is positive. A negative result means the boundaries were the wrong way round.",
        he: "שטח הוא חיובי. תוצאה שלילית פירושה שהגבולות הוחלפו.",
      },
    ],
  },

  "reverse-integral": {
    method: {
      en: "Integrate with the unknown along for the ride",
      he: "אנטגרלו כשהנעלם נוסע יחד",
    },
    signature: [
      {
        en: "A definite integral that **equals a given value**",
        he: "אינטגרל מסוים ה**שווה לערך נתון**",
      },
      {
        en: "An unknown constant sits inside the integrand, and you are asked for it",
        he: "קבוע לא ידוע נמצא בתוך האינטגרנד, ונדרש למצוא אותו",
      },
      {
        en: "The given value usually contains a $\\ln$ — that is where the unknown will surface",
        he: "הערך הנתון מכיל בדרך כלל $\\ln$ — שם הנעלם יצוף",
      },
    ],
    recipe: [
      {
        move: { en: "Fix the integrand first", he: "תקנו קודם את האינטגרנד" },
        detail: {
          en: "If the numerator's degree is at least the denominator's, divide. You cannot integrate a top-heavy fraction as it stands.",
          he: "אם דרגת המונה גבוהה או שווה לדרגת המכנה, חלקו. אי אפשר לאנטגרל שבר כזה כמו שהוא.",
        },
      },
      {
        move: {
          en: "Integrate, treating the unknown as a number",
          he: "אנטגרלו, כשהנעלם מטופל כמספר",
        },
        detail: {
          en: "It is a constant, so it obeys every rule a number does. It will end up as the coefficient of exactly one term.",
          he: "זהו קבוע, ולכן הוא מציית לכל כלל שמספר מציית לו. בסופו של דבר הוא יהיה מקדם של איבר אחד בדיוק.",
        },
      },
      {
        move: { en: "Substitute the bounds", he: "הציבו את הגבולות" },
        detail: {
          en: "$F(\\text{top})-F(\\text{bottom})$. Combine the logs into a single $\\ln$ of a quotient — the bounds are chosen so it comes out whole.",
          he: "$F(\\text{עליון})-F(\\text{תחתון})$. אחדו את הלוגריתמים ל-$\\ln$ יחיד של מנה — הגבולות נבחרו כך שתתקבל תוצאה שלמה.",
        },
      },
      {
        move: {
          en: "Match against the given value",
          he: "השוו מול הערך הנתון",
        },
        detail: {
          en: "Rational part matches rational part, $\\ln$ coefficient matches $\\ln$ coefficient. One linear equation, one line of algebra.",
          he: "החלק הרציונלי מול הרציונלי, מקדם ה-$\\ln$ מול מקדם ה-$\\ln$. משוואה לינארית אחת, שורת אלגברה אחת.",
        },
      },
    ],
    whyItWorks: {
      en: "Integration is linear: $\\int(f+bg)=\\int f+b\\int g$. An unknown constant in the integrand therefore comes out of the integral untouched, as a coefficient. That is why this question can never be harder than a linear equation, no matter how alarming the integral looks — and knowing that in advance is worth more than any amount of computation.",
      he: "אינטגרציה היא לינארית: $\\int(f+bg)=\\int f+b\\int g$. לכן קבוע לא ידוע באינטגרנד יוצא מהאינטגרל ללא שינוי, כמקדם. זו הסיבה שהשאלה הזו לעולם לא תהיה קשה ממשוואה לינארית, כמה שהאינטגרל ייראה מאיים — ולדעת זאת מראש שווה יותר מכל חישוב.",
    },
    speedTip: {
      en: "The unknown rides on the $\\ln$ term and **nowhere else**. So you can ignore the rational half of the calculation entirely, read off the $\\ln$ coefficient on both sides, and solve. Half the arithmetic, half the chances to slip.",
      he: "הנעלם רוכב על איבר ה-$\\ln$ ו**לא על שום איבר אחר**. לכן אפשר להתעלם לגמרי מהחצי הרציונלי של החישוב, לקרוא את מקדם ה-$\\ln$ משני האגפים, ולפתור. חצי מהחשבון, חצי מהסיכויים לטעות.",
    },
    watchOut: [
      {
        en: "The division leaves a **remainder** like $b-k$. That remainder is not $b$.",
        he: "החילוק מותיר **שארית** כמו $b-k$. השארית אינה $b$.",
      },
      {
        en: "Check $x+k>0$ across the interval before writing $\\ln$ without bars.",
        he: "ודאו $x+k>0$ בכל הקטע לפני שכותבים $\\ln$ בלי ערך מוחלט.",
      },
    ],
  },

  limits: {
    method: {
      en: "Substitute, name the form, simplify, then substitute again",
      he: "הציבו, זהו את הצורה, פשטו, והציבו שוב",
    },
    signature: [
      {
        en: "Substitution gives $\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $1^{\\infty}$ or $\\infty\\cdot 0$",
        he: "הצבה נותנת $\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $1^{\\infty}$ או $\\infty\\cdot 0$",
      },
      {
        en: "The expression mixes $e$, $\\ln$ and trig — a deliberate invitation to simplify",
        he: "הביטוי מערבב $e$, $\\ln$ וטריגונומטריה — הזמנה מכוונת לפשט",
      },
    ],
    recipe: [
      {
        move: { en: "Substitute first", he: "הציבו קודם" },
        detail: {
          en: "If it gives a number, you are finished. More marks are lost by skipping this than by any other habit.",
          he: "אם מתקבל מספר — סיימתם. יותר נקודות נאבדות מדילוג על השלב הזה מכל הרגל אחר.",
        },
      },
      {
        move: {
          en: "Name the indeterminate form out loud",
          he: "נקבו בשם הצורה הלא מוגדרת",
        },
        detail: {
          en: "The form dictates the tool. $\\frac{0}{0}$ invites a standard limit or L'Hopital; $1^{\\infty}$ means the $e$-limit; $\\infty\\cdot 0$ means rewrite as a fraction.",
          he: "הצורה קובעת את הכלי. $\\frac{0}{0}$ מזמינה גבול יסודי או לופיטל; $1^{\\infty}$ פירושה גבול ה-$e$; $\\infty\\cdot 0$ פירושה לכתוב מחדש כשבר.",
        },
      },
      {
        move: {
          en: "Simplify with algebra before touching calculus",
          he: "פשטו באלגברה לפני שנוגעים בחדו״א",
        },
        detail: {
          en: "$e^{\\ln u}=u$, $\\ln u^k=k\\ln u$, $\\ln a-\\ln b=\\ln\\frac{a}{b}$. Half these questions collapse entirely at this step.",
          he: "$e^{\\ln u}=u$, $\\ln u^k=k\\ln u$, $\\ln a-\\ln b=\\ln\\frac{a}{b}$. מחצית מהשאלות הללו קורסות לגמרי בשלב הזה.",
        },
      },
      {
        move: {
          en: "Build a standard limit, or fall back on L'Hopital",
          he: "בנו גבול יסודי, או חזרו ללופיטל",
        },
        detail: {
          en: "Multiply and divide to manufacture $\\frac{e^t-1}{t}$, $\\frac{\\sin t}{t}$, $\\frac{\\ln(1+t)}{t}$ or $\\left(1+\\frac{1}{t}\\right)^t$ — each tends to $1$ (or $e$). Only then reach for differentiation.",
          he: "הכפילו וחלקו כדי לייצר $\\frac{e^t-1}{t}$, $\\frac{\\sin t}{t}$, $\\frac{\\ln(1+t)}{t}$ או $\\left(1+\\frac{1}{t}\\right)^t$ — כל אחד שואף ל-$1$ (או ל-$e$). רק אז פנו לגזירה.",
        },
      },
    ],
    whyItWorks: {
      en: "An indeterminate form is not a statement about the limit — it is a statement that substitution alone cannot see it. Every one of these questions is built so that after the right rewriting, the obstruction disappears and substitution simply works. You are not computing a limit; you are removing a disguise.",
      he: "צורה לא מוגדרת אינה אמירה על הגבול — היא אמירה על כך שהצבה לבדה אינה מסוגלת לראות אותו. כל אחת מהשאלות הללו בנויה כך שלאחר הכתיבה מחדש הנכונה, המחסום נעלם והצבה פשוט עובדת. אינכם מחשבים גבול; אתם מסירים תחפושת.",
    },
    speedTip: {
      en: "Prefer building a standard limit over L'Hopital. It is faster, it never loops back on itself the way repeated differentiation can, and it keeps working on forms where L'Hopital needs rearranging first. Reach for the derivative only when nothing factors.",
      he: "העדיפו בניית גבול יסודי על פני לופיטל. זה מהיר יותר, זה לעולם לא נכנס ללולאה כמו גזירה חוזרת, וזה ממשיך לעבוד בצורות שבהן לופיטל דורש סידור מחדש. פנו לנגזרת רק כשדבר אינו מתפרק לגורמים.",
    },
    watchOut: [
      {
        en: "$1^{\\infty}$ is **not** $1$. A base creeping toward $1$ against an exponent racing to infinity is a genuine contest.",
        he: "$1^{\\infty}$ **אינו** $1$. בסיס שמתקרב ל-$1$ מול מעריך ששועט לאינסוף הוא תחרות אמיתית.",
      },
      {
        en: "L'Hopital differentiates numerator and denominator **separately** — it is not the quotient rule.",
        he: "לופיטל גוזר מונה ומכנה **בנפרד** — זה אינו כלל המנה.",
      },
    ],
  },
};
