import type * as CheckerModule from "./checker";

/**
 * nerdamer is ~300 kB and is needed only when an answer is *checked*, never to
 * render a question. On a phone that is the difference between a page that
 * paints immediately and one that waits on a CAS.
 *
 * So it loads on demand, and is warmed during idle time while the student is
 * still reading the question — by the time they submit it is already there.
 */
type Checker = typeof CheckerModule;

let loaded: Checker | null = null;
let pending: Promise<Checker> | null = null;

export function loadChecker(): Promise<Checker> {
  if (loaded) return Promise.resolve(loaded);
  if (!pending) {
    pending = import("./checker").then((m) => {
      loaded = m;
      return m;
    });
  }
  return pending;
}

/** Non-blocking prefetch. Safe to call repeatedly. */
export function warmChecker(): void {
  if (typeof window === "undefined" || loaded || pending) return;
  const start = () => void loadChecker();
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
    }
  ).requestIdleCallback;
  if (ric) ric(start, { timeout: 2500 });
  else window.setTimeout(start, 800);
}
