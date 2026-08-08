"use client";

import type { Figure } from "@/lib/types";

const W = 420;
const H = 260;
const PAD = { l: 30, r: 18, t: 16, b: 28 };

/** Qualitative sketch of a bounded region. Always LTR, like all math. */
export function Sketch({ figure }: { figure: Figure }) {
  const [x0, x1] = figure.xRange;
  const [y0, y1] = figure.yRange;
  const sx = (x: number) =>
    PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) =>
    H - PAD.b - ((y - y0) / (y1 - y0 || 1)) * (H - PAD.t - PAD.b);

  const path = (pts: [number, number][]) =>
    pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");

  return (
    <figure className="graph math-ltr my-6 overflow-x-auto rounded-xl border border-rule/70 bg-raised p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-[420px]"
        role="img"
        aria-label="Sketch of the bounded region"
      >
        {figure.shade && (
          <polygon
            points={path(figure.shade)}
            fill="var(--color-accent)"
            fillOpacity="0.12"
            stroke="none"
          />
        )}

        {/* axes */}
        <line
          x1={sx(x0)}
          y1={sy(0)}
          x2={W - PAD.r + 6}
          y2={sy(0)}
          stroke="var(--color-faint)"
          strokeWidth="1"
        />
        <line
          x1={sx(0)}
          y1={H - PAD.b}
          x2={sx(0)}
          y2={PAD.t - 6}
          stroke="var(--color-faint)"
          strokeWidth="1"
        />
        <text x={W - PAD.r + 8} y={sy(0) + 4} fontSize="11" fill="var(--color-faint)">
          x
        </text>
        <text x={sx(0) - 12} y={PAD.t - 6} fontSize="11" fill="var(--color-faint)">
          y
        </text>

        {figure.curves.map((curve, i) => (
          <polyline
            key={i}
            points={path(curve.points)}
            fill="none"
            stroke={i === 0 ? "var(--color-accent)" : "var(--color-ink)"}
            strokeWidth="1.8"
            strokeDasharray={curve.dashed ? "5 4" : undefined}
            strokeLinecap="round"
          />
        ))}

        {figure.marks?.map((mark, i) => (
          <g key={i}>
            <circle
              cx={sx(mark.x)}
              cy={sy(mark.y)}
              r="3.2"
              fill="var(--color-ink)"
            />
            {mark.label && (
              <text
                x={sx(mark.x) + 7}
                y={sy(mark.y) - 7}
                fontSize="11"
                fill="var(--color-faint)"
              >
                {mark.label}
              </text>
            )}
          </g>
        ))}

        {figure.curves.map((curve, i) => {
          const last = curve.points[curve.points.length - 1];
          if (!curve.label || !last) return null;
          return (
            <text
              key={`label-${i}`}
              x={Math.min(sx(last[0]) + 4, W - PAD.r - 4)}
              y={Math.max(sy(last[1]) - 6, PAD.t + 8)}
              fontSize="11"
              textAnchor="end"
              fill={i === 0 ? "var(--color-accent)" : "var(--color-muted)"}
            >
              {curve.label}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
