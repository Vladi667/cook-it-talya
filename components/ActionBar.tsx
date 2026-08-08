"use client";

/**
 * Primary actions pinned to the bottom of the viewport on a phone, where the
 * thumb already is, and inline on a desktop where it would just be a floating
 * bar for no reason. Bleeds to the screen edges and clears the home indicator.
 */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-10 -mx-5 mt-2 border-t border-rule/70 bg-paper/95 px-5 pt-3 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none">
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}
