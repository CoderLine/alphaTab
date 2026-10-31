import React from 'react';
import { TabClef } from './smufl';

const W = 340;
const H = 84;
const INK = 'var(--at-ink)';

const TOP = 22;
const GAP = 10;
const BOTTOM = TOP + 5 * GAP;
const LINE_W = 0.8;
const FONT_SIZE = 11;
const DIGIT_W = FONT_SIZE * 0.56;

/** Bar line positions; bar `i` spans `BAR_LINES[i]..BAR_LINES[i + 1]`. */
const BAR_LINES = [28, 183, 338];

/** Am and C arpeggios in eighths: `[string, fret]` with string 1 = high e. */
const BARS: [number, number][][] = [
  [[5, 0], [4, 2], [3, 2], [2, 1], [1, 0], [2, 1], [3, 2], [4, 2]],
  [[5, 3], [4, 2], [3, 0], [2, 1], [1, 0], [2, 1], [3, 0], [4, 2]],
];

const NOTES = BARS.flatMap((bar, b) =>
  bar.map(([string, fret], i) => ({ bar: b, string, fret, x: BAR_LINES[b] + 14 + i * 18 })),
);

const SELECTION = { from: 4, to: 13 };
const PLAYING = 10;
const HALF_BEAT = 9;
const LOOP_Y = 5;
const LOOP_LABEL_W = 34;

const stringY = (string: number) => TOP + (string - 1) * GAP;

const stringSegments = (string: number) => {
  const segments: [number, number][] = [];
  let start = 2;
  for (const n of NOTES.filter((n) => n.string === string)) {
    const half = (String(n.fret).length * DIGIT_W) / 2 + 2;
    segments.push([start, n.x - half]);
    start = n.x + half;
  }
  segments.push([start, W - 2]);
  return segments;
};

export const CursorSelection: React.FC = () => {
  const playing = NOTES[PLAYING];
  const selX1 = NOTES[SELECTION.from].x - HALF_BEAT;
  const selX2 = NOTES[SELECTION.to].x + HALF_BEAT;
  const overlayTop = TOP - 7;
  const overlayBottom = BOTTOM + 7;
  const cursorX = playing.x - HALF_BEAT + 1;
  const loopLabelX = (selX1 + selX2) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto' }} aria-hidden="true">
      <rect x={selX1} y={overlayTop} width={selX2 - selX1} height={overlayBottom - overlayTop} fill="var(--at-accent-soft-strong)" />

      <g fill="var(--at-accent)">
        <rect x={selX1} y={LOOP_Y} width={loopLabelX - LOOP_LABEL_W / 2 - selX1} height={1.5} />
        <rect x={loopLabelX + LOOP_LABEL_W / 2} y={LOOP_Y} width={selX2 - loopLabelX - LOOP_LABEL_W / 2} height={1.5} />
        <rect x={selX1} y={LOOP_Y} width={1.5} height={overlayTop - LOOP_Y} />
        <rect x={selX2 - 1.5} y={LOOP_Y} width={1.5} height={overlayTop - LOOP_Y} />
        <text x={loopLabelX} y={LOOP_Y + 3.6} fontFamily="var(--at-font-mono)" fontSize={10} textAnchor="middle">
          loop
        </text>
      </g>

      <g stroke={INK} strokeWidth={LINE_W}>
        {[1, 2, 3, 4, 5, 6].map((string) =>
          stringSegments(string).map(([x1, x2], i) => (
            <line key={`${string}-${i}`} x1={x1} x2={x2} y1={stringY(string)} y2={stringY(string)} />
          )),
        )}
      </g>
      <g fill={INK}>
        <rect x={2} y={TOP} width={1} height={BOTTOM - TOP} />
        {BAR_LINES.slice(1).map((x) => (
          <rect key={x} x={x - 0.5} y={TOP} width={1} height={BOTTOM - TOP} />
        ))}
        <TabClef x={8} top={TOP} bottom={BOTTOM} />
      </g>

      <g fontFamily="Arial, Helvetica, sans-serif" fontSize={FONT_SIZE} textAnchor="middle">
        {NOTES.map((n, i) => (
          <text
            key={i}
            x={n.x}
            y={stringY(n.string) + FONT_SIZE * 0.36}
            fill={i === PLAYING ? 'var(--at-accent)' : INK}
            fontWeight={i === PLAYING ? 700 : 400}
          >
            {n.fret}
          </text>
        ))}
      </g>

      <rect x={cursorX - 1.25} y={overlayTop - 3} width={2.5} height={overlayBottom - overlayTop + 6} fill="var(--at-cursor)" />
    </svg>
  );
};
