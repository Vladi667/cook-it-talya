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

  "circle-tangent": {
    method: {
      en: "Complete the square, then let the radius do the work",
      he: "השלימו לריבוע, ואז תנו לרדיוס לעבוד",
    },
    signature: [
      {
        en: "A circle written as $x^2+y^2+Dx+Ey+F=0$ — the **general form**",
        he: "מעגל הכתוב בצורה $x^2+y^2+Dx+Ey+F=0$ — ה**צורה הכללית**",
      },
      {
        en: "A tangent is mentioned, or a point outside the circle",
        he: "מוזכר משיק, או נקודה מחוץ למעגל",
      },
    ],
    recipe: [
      {
        move: {
          en: "Complete the square on $x$ and on $y$",
          he: "השלימו לריבוע ב-$x$ וב-$y$",
        },
        detail: {
          en: "Half the coefficient, square it, add to both sides. You end at $\\left(x-p\\right)^2+\\left(y-q\\right)^2=R^2$ — centre $(p,q)$, radius $R$. Nothing else can start until this is done.",
          he: "חצי מהמקדם, בריבוע, מוסיפים לשני האגפים. מגיעים ל-$\\left(x-p\\right)^2+\\left(y-q\\right)^2=R^2$ — מרכז $(p,q)$, רדיוס $R$. שום דבר אחר לא מתחיל לפני כן.",
        },
      },
      {
        move: {
          en: "Confirm the point sits on the circle",
          he: "ודאו שהנקודה על המעגל",
        },
        detail: {
          en: "Substitute it. If it satisfies the equation it is a point of tangency; if it does not, it is an external point and you are being asked for a length instead.",
          he: "הציבו אותה. אם היא מקיימת את המשוואה זו נקודת השקה; אם לא, זו נקודה חיצונית ומבקשים מכם אורך.",
        },
      },
      {
        move: {
          en: "The radius **is** the normal to the tangent",
          he: "הרדיוס **הוא** הנורמל למשיק",
        },
        detail: {
          en: "A tangent meets the radius at a right angle, so $\\vec{OA}=(u,v)$ gives the tangent's coefficients directly: $ux+vy=c$. No slopes, no quadratics.",
          he: "המשיק פוגש את הרדיוס בזווית ישרה, ולכן $\\vec{OA}=(u,v)$ נותן ישירות את מקדמי המשיק: $ux+vy=c$. בלי שיפועים ובלי משוואות ריבועיות.",
        },
      },
      {
        move: { en: "Fix the constant through the point", he: "קבעו את הקבוע דרך הנקודה" },
        detail: {
          en: "Substitute the point of tangency to get $c$. One substitution, done.",
          he: "הציבו את נקודת ההשקה כדי לקבל את $c$. הצבה אחת, וזהו.",
        },
      },
      {
        move: {
          en: "Tangent length by Pythagoras",
          he: "אורך המשיק לפי פיתגורס",
        },
        detail: {
          en: "The external point, the centre and the point of contact form a right angle **at the contact point**, so $PT=\\sqrt{PO^2-R^2}$.",
          he: "הנקודה החיצונית, המרכז ונקודת ההשקה יוצרים זווית ישרה **בנקודת ההשקה**, ולכן $PT=\\sqrt{PO^2-R^2}$.",
        },
      },
    ],
    whyItWorks: {
      en: "Every circle fact in this question descends from one property: the tangent is perpendicular to the radius at the point of contact. That single right angle gives you the tangent's direction for free, and it is also the right angle in the triangle you use for the tangent length. Students who reach for slopes and discriminants are solving a much harder problem than the one in front of them.",
      he: "כל עובדה על המעגל בשאלה הזו נובעת מתכונה אחת: המשיק מאונך לרדיוס בנקודת ההשקה. הזווית הישרה הבודדת הזו נותנת בחינם את כיוון המשיק, והיא גם הזווית הישרה במשולש שמשמש לחישוב אורך המשיק. מי שפונה לשיפועים ולדיסקרימיננטות פותר בעיה קשה בהרבה מזו שלפניו.",
    },
    speedTip: {
      en: "Never find the tangent by substituting a line into the circle and forcing the discriminant to zero — that is a quadratic in the slope and it fails outright for a vertical tangent. The normal-vector form $u\\left(x-p\\right)+v\\left(y-q\\right)=R^2$ is one line and never breaks.",
      he: "לעולם אל תמצאו את המשיק על ידי הצבת ישר במעגל ואילוץ הדיסקרימיננטה לאפס — זו משוואה ריבועית בשיפוע והיא נכשלת לגמרי במשיק אנכי. הצורה עם וקטור הנורמל $u\\left(x-p\\right)+v\\left(y-q\\right)=R^2$ היא שורה אחת ואף פעם לא נשברת.",
    },
    watchOut: [
      {
        en: "The centre is $\\left(-\\frac{D}{2},-\\frac{E}{2}\\right)$ — the signs flip.",
        he: "המרכז הוא $\\left(-\\frac{D}{2},-\\frac{E}{2}\\right)$ — הסימנים מתהפכים.",
      },
      {
        en: "Completing the square leaves $R^2$, not $R$. Take the root.",
        he: "השלמה לריבוע משאירה $R^2$ ולא $R$. הוציאו שורש.",
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

  optimization: {
    method: {
      en: "One variable, one function, then differentiate",
      he: "משתנה אחד, פונקציה אחת, ואז גזירה",
    },
    signature: [
      {
        en: "The words **largest**, **smallest**, **maximum** or **minimum** attached to a shape or a cost",
        he: "המילים **הגדול ביותר**, **הקטן ביותר**, **מרבי** או **מזערי** לצד צורה או עלות",
      },
      {
        en: "A constraint tying two quantities together — a fixed perimeter, a fixed sheet, a curve the point must sit on",
        he: "אילוץ הקושר שני גדלים — היקף קבוע, גיליון נתון, או עקום שהנקודה חייבת להיות עליו",
      },
    ],
    recipe: [
      {
        move: {
          en: "Name the variable and write its domain",
          he: "בחרו משתנה ורשמו את תחומו",
        },
        detail: {
          en: "Choose the length that everything else can be measured against, and immediately write the inequality it must satisfy. The domain is where half the marks hide.",
          he: "בחרו את האורך שדרכו אפשר למדוד את כל השאר, ורשמו מיד את אי-השוויון שעליו לקיים. בתחום ההגדרה מסתתרת מחצית מהנקודות.",
        },
      },
      {
        move: {
          en: "Use the constraint to reach **one** variable",
          he: "השתמשו באילוץ כדי להגיע ל**משתנה אחד**",
        },
        detail: {
          en: "The constraint exists precisely so you can eliminate the second unknown. Substitute it in until the quantity is a function of your variable alone.",
          he: "האילוץ קיים בדיוק כדי לאפשר לסלק את הנעלם השני. הציבו אותו עד שהגודל הופך לפונקציה של המשתנה שלכם בלבד.",
        },
      },
      {
        move: { en: "Differentiate and solve $=0$", he: "גזרו ופתרו $=0$" },
        detail: {
          en: "Factor rather than expand where you can — the factored derivative shows both roots at once, and usually one of them is the degenerate case.",
          he: "העדיפו פירוק לגורמים על פני פתיחת סוגריים — הנגזרת המפורקת מראה את שני השורשים בבת אחת, ובדרך כלל אחד מהם הוא המקרה המנוון.",
        },
      },
      {
        move: {
          en: "Reject the roots outside the domain, confirm the rest",
          he: "פסלו שורשים מחוץ לתחום, ואשרו את השאר",
        },
        detail: {
          en: "A root sitting at the edge of the domain usually gives zero area or zero volume. Confirm the survivor with the sign of $f'$ or with $f''$.",
          he: "שורש היושב על קצה התחום נותן בדרך כלל שטח או נפח אפס. אשרו את הנותר לפי סימן $f'$ או לפי $f''$.",
        },
      },
      {
        move: {
          en: "Answer the question that was actually asked",
          he: "ענו על השאלה שבאמת נשאלה",
        },
        detail: {
          en: "You solved for $x$; the question probably wanted the area, the volume, or both dimensions. Substitute back. Marks are routinely lost on this last line.",
          he: "פתרתם עבור $x$; השאלה כנראה ביקשה שטח, נפח, או את שתי המידות. הציבו בחזרה. בשורה האחרונה הזו נאבדות נקודות בקביעות.",
        },
      },
    ],
    whyItWorks: {
      en: "An extremum of a smooth quantity on an interval is either at a point where the derivative vanishes or at an endpoint — there is nowhere else for it to be. So the whole method is: reduce to one variable so a derivative exists at all, find where it is zero, and check the ends. The modelling is the hard part; the calculus is three lines.",
      he: "ערך קיצון של גודל חלק בקטע נמצא או בנקודה שבה הנגזרת מתאפסת או בקצה — אין מקום אחר. לכן כל השיטה היא: לצמצם למשתנה אחד כדי שבכלל תהיה נגזרת, למצוא היכן היא מתאפסת, ולבדוק את הקצוות. המידול הוא החלק הקשה; החדו״א הוא שלוש שורות.",
    },
    speedTip: {
      en: "When the quantity is a product like $x\\left(a-2x\\right)^2$, differentiate **without expanding**: the product rule leaves a common factor, and the factored form $\\left(a-2x\\right)\\left(a-6x\\right)$ hands you both roots instantly. Expanding first turns a ten-second job into a quadratic-formula job.",
      he: "כאשר הגודל הוא מכפלה כמו $x\\left(a-2x\\right)^2$, גזרו **בלי לפתוח סוגריים**: כלל המכפלה משאיר גורם משותף, והצורה המפורקת $\\left(a-2x\\right)\\left(a-6x\\right)$ נותנת מיד את שני השורשים. פתיחת סוגריים הופכת עבודה של עשר שניות לעבודה עם נוסחת השורשים.",
    },
    watchOut: [
      {
        en: "A rectangle symmetric about the $y$-axis has width $2x$, not $x$.",
        he: "למלבן הסימטרי ביחס לציר ה-$y$ יש רוחב $2x$, לא $x$.",
      },
      {
        en: "Reject the root that makes a length zero — it is the minimum.",
        he: "פסלו את השורש שמאפס אורך — הוא המינימום.",
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

  sequences: {
    method: {
      en: "Count the steps, then walk back to the first term",
      he: "ספרו את הצעדים, ואז חזרו אל האיבר הראשון",
    },
    signature: [
      {
        en: "Two terms are given by their **index**, like $a_3$ and $a_7$",
        he: "שני איברים נתונים לפי ה**מקום** שלהם, כמו $a_3$ ו-$a_7$",
      },
      {
        en: "A sum of the first $n$ terms, or a sum to infinity, is requested",
        he: "נדרש סכום $n$ האיברים הראשונים, או סכום עד אינסוף",
      },
    ],
    recipe: [
      {
        move: {
          en: "Difference or ratio? Decide first",
          he: "הפרש או מנה? החליטו קודם",
        },
        detail: {
          en: "Subtract the given terms; divide them. Whichever gives something clean tells you the type, and the type fixes every formula you will use.",
          he: "חסרו את האיברים הנתונים; חלקו אותם. מה שנותן תוצאה נקייה מגלה את הסוג, והסוג קובע את כל הנוסחאות.",
        },
      },
      {
        move: { en: "Count the **steps**, not the terms", he: "ספרו **צעדים**, לא איברים" },
        detail: {
          en: "From $a_m$ to $a_n$ there are $n-m$ steps. So $a_n-a_m=(n-m)d$, or $\\frac{a_n}{a_m}=q^{\\,n-m}$. This off-by-one is the most expensive mistake in the topic.",
          he: "מ-$a_m$ ל-$a_n$ יש $n-m$ צעדים. לכן $a_n-a_m=(n-m)d$, או $\\frac{a_n}{a_m}=q^{\\,n-m}$. הסטייה של אחד כאן היא הטעות היקרה ביותר בנושא.",
        },
      },
      {
        move: { en: "Walk back to $a_1$", he: "חזרו אל $a_1$" },
        detail: {
          en: "$a_1=a_m-(m-1)d$, or $a_1=\\frac{a_m}{q^{\\,m-1}}$. Again $m-1$ steps, not $m$. Every sum formula is written in terms of $a_1$, so this is not optional.",
          he: "$a_1=a_m-(m-1)d$, או $a_1=\\frac{a_m}{q^{\\,m-1}}$. שוב $m-1$ צעדים ולא $m$. כל נוסחת סכום כתובה במונחי $a_1$, ולכן זה אינו שלב אופציונלי.",
        },
      },
      {
        move: { en: "Apply the matching sum formula", he: "הפעילו את נוסחת הסכום המתאימה" },
        detail: {
          en: "$S_n=\\frac{n}{2}\\left[2a_1+(n-1)d\\right]$, or $S_n=\\frac{a_1\\left(q^n-1\\right)}{q-1}$, or $S_\\infty=\\frac{a_1}{1-q}$ — the last one **only** if $|q|<1$.",
          he: "$S_n=\\frac{n}{2}\\left[2a_1+(n-1)d\\right]$, או $S_n=\\frac{a_1\\left(q^n-1\\right)}{q-1}$, או $S_\\infty=\\frac{a_1}{1-q}$ — האחרונה **רק** אם $|q|<1$.",
        },
      },
    ],
    whyItWorks: {
      en: "A sequence of this kind is completely determined by two numbers: where it starts and how it moves. Two given terms are two equations, which is exactly enough to pin both down. Once you see the whole topic as “find the two parameters, then quote a formula”, there is nothing left to memorise beyond the formulas themselves.",
      he: "סדרה מסוג זה נקבעת לחלוטין על ידי שני מספרים: היכן היא מתחילה וכיצד היא מתקדמת. שני איברים נתונים הם שתי משוואות, וזה בדיוק מספיק כדי לקבע את שניהם. ברגע שרואים את כל הנושא כ״מצא את שני הפרמטרים, ואז צטט נוסחה״, לא נשאר מה לשנן מעבר לנוסחאות עצמן.",
    },
    speedTip: {
      en: "Do not build a system of two equations in $a_1$ and $d$ and solve it — subtracting the two given terms eliminates $a_1$ in one line and hands you $d$ immediately. The same trick divides out $a_1$ in the geometric case.",
      he: "אל תבנו מערכת של שתי משוואות ב-$a_1$ וב-$d$ ותפתרו אותה — חיסור שני האיברים הנתונים מסלק את $a_1$ בשורה אחת ונותן מיד את $d$. אותו טריק מצמצם את $a_1$ במקרה ההנדסי.",
    },
    watchOut: [
      {
        en: "$a_n=a_1+(n-1)d$ — the coefficient is $n-1$, never $n$.",
        he: "$a_n=a_1+(n-1)d$ — המקדם הוא $n-1$, לעולם לא $n$.",
      },
      {
        en: "$S_\\infty$ exists only when $|q|<1$. Check before quoting it.",
        he: "$S_\\infty$ קיים רק כאשר $|q|<1$. בדקו לפני שמצטטים.",
      },
    ],
  },

  "growth-decay": {
    method: {
      en: "Two readings fix the model; logarithms invert it",
      he: "שתי מדידות קובעות את המודל; לוגריתמים הופכים אותו",
    },
    signature: [
      {
        en: "A quantity described as growing or decaying by a **fixed percentage or factor** per unit time",
        he: "גודל המתואר כגדל או דועך ב**אחוז או מקדם קבוע** ליחידת זמן",
      },
      {
        en: "Words like half-life, doubling time, or “after how long will it reach…”",
        he: "מונחים כמו זמן מחצית חיים, זמן הכפלה, או ״כעבור כמה זמן יגיע ל…״",
      },
    ],
    recipe: [
      {
        move: { en: "Write $N(t)=N_0q^{\\,t}$", he: "רשמו $N(t)=N_0q^{\\,t}$" },
        detail: {
          en: "Substituting $t=0$ gives $N(0)=N_0$, so the initial reading is $N_0$ with no work at all. Read it straight off the question.",
          he: "הצבת $t=0$ נותנת $N(0)=N_0$, ולכן המדידה ההתחלתית היא $N_0$ ללא כל חישוב. קראו אותה ישירות מהשאלה.",
        },
      },
      {
        move: { en: "Use a second reading to find $q$", he: "השתמשו במדידה שנייה למציאת $q$" },
        detail: {
          en: "One more data point gives $q^{\\,t}=\\frac{N_1}{N_0}$. Take the $t$-th root — stopping at $q^{\\,t}$ is the classic half-answer.",
          he: "נקודת מידע נוספת נותנת $q^{\\,t}=\\frac{N_1}{N_0}$. הוציאו שורש מסדר $t$ — עצירה ב-$q^{\\,t}$ היא חצי-התשובה הקלאסית.",
        },
      },
      {
        move: { en: "Invert with logarithms", he: "הפכו בעזרת לוגריתמים" },
        detail: {
          en: "To find a time, isolate the power and take $\\ln$ of both sides: $t=\\frac{\\ln\\left(M/N_0\\right)}{\\ln q}$. Any base works, as long as you use the same one twice.",
          he: "כדי למצוא זמן, בודדו את החזקה וקחו $\\ln$ משני האגפים: $t=\\frac{\\ln\\left(M/N_0\\right)}{\\ln q}$. כל בסיס מתאים, כל עוד משתמשים באותו בסיס פעמיים.",
        },
      },
      {
        move: { en: "Sanity-check the direction and the units", he: "בדקו את הכיוון ואת היחידות" },
        detail: {
          en: "Growth means $q>1$ and decay means $q<1$; a decay answer with $q>1$ is wrong before you check anything else. Then confirm the time is in the units the question used.",
          he: "גדילה פירושה $q>1$ ודעיכה $q<1$; תשובת דעיכה עם $q>1$ שגויה עוד לפני בדיקה נוספת. לאחר מכן ודאו שהזמן ביחידות שבהן השתמשה השאלה.",
        },
      },
    ],
    whyItWorks: {
      en: "Exponential change means the quantity is multiplied by the same factor in every equal interval — that is the whole definition, and it is why only two readings are ever needed. The logarithm is simply the operation that undoes “raise to the power $t$”, which is why it appears the moment the unknown moves into the exponent.",
      he: "שינוי מעריכי פירושו שהגודל מוכפל באותו מקדם בכל מרווח שווה — זו כל ההגדרה, ולכן די תמיד בשתי מדידות. הלוגריתם הוא פשוט הפעולה ההופכית ל״העלאה בחזקת $t$״, ולכן הוא מופיע ברגע שהנעלם עובר למעריך.",
    },
    speedTip: {
      en: "Before reaching for a calculator, check whether the target is a whole power of $q$. If $\\frac{M}{N_0}=q^{\\,k}$ the logarithms cancel outright and $t=k$ — exact, instant, and no rounding to lose marks on.",
      he: "לפני שפונים למחשבון, בדקו אם היעד הוא חזקה שלמה של $q$. אם $\\frac{M}{N_0}=q^{\\,k}$ הלוגריתמים מצטמצמים לגמרי ומתקבל $t=k$ — מדויק, מיידי, וללא עיגול שיעלה בנקודות.",
    },
    watchOut: [
      {
        en: "$\\ln\\frac{A}{B}=\\ln A-\\ln B$, which is **not** $\\frac{\\ln A}{\\ln B}$.",
        he: "$\\ln\\frac{A}{B}=\\ln A-\\ln B$, וזה **אינו** $\\frac{\\ln A}{\\ln B}$.",
      },
      {
        en: "A drop of $20\\%$ means $q=0.8$, not $q=0.2$.",
        he: "ירידה של $20\\%$ פירושה $q=0.8$, לא $q=0.2$.",
      },
    ],
  },
};
