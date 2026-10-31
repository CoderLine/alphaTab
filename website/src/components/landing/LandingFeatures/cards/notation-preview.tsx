import React from 'react';
import { GLYPH, Glyph, TabClef } from './smufl';

type Kind = 'standard' | 'tab' | 'drum' | 'numbered';

const W = 120;
const H = 40;
const INK = 'var(--at-ink)';

/** Glyph widths in font units. */
const ADVANCE = { noteheadBlack: 295, noteheadHalf: 295, noteheadX: 290 };

/**
 * The phrase every preview shows: four eighths and an E minor half-note chord.
 * `step` counts diatonic steps above E4, `string`/`fret` assume standard guitar tuning
 * at written pitch, `digit` is the jiǎnpǔ degree in 1 = C.
 */
const MELODY = [
  { step: 0, string: 4, fret: 2, digit: 3 },
  { step: 1, string: 4, fret: 3, digit: 4 },
  { step: 2, string: 3, fret: 0, digit: 5 },
  { step: 3, string: 3, fret: 2, digit: 6 },
];
const CHORD = [
  { step: 0, string: 4, fret: 2 },
  { step: 2, string: 3, fret: 0 },
  { step: 4, string: 2, fret: 0 },
];

const PAIRS = [0, 2];
const noteX = (i: number) => 26 + i * 13;
const CHORD_X = 86;
const END_X = 117;
const LINE_W = 0.7;
const STEM_W = 0.75;

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto' }} aria-hidden="true">
    {children}
  </svg>
);

const StaffLines: React.FC<{ top: number; gap: number; count: number }> = ({ top, gap, count }) => (
  <g stroke={INK} strokeWidth={LINE_W}>
    {Array.from({ length: count }, (_, i) => (
      <line key={i} x1={2} x2={END_X} y1={top + i * gap} y2={top + i * gap} />
    ))}
  </g>
);

const FinalBarLine: React.FC<{ y1: number; y2: number }> = ({ y1, y2 }) => (
  <g fill={INK}>
    <rect x={END_X - 4.4} y={y1} width={0.9} height={y2 - y1} />
    <rect x={END_X - 2.4} y={y1} width={2.4} height={y2 - y1} />
  </g>
);

/** Beam as a parallelogram hanging below its top edge from (x1, y1) to (x2, y2). */
const Beam: React.FC<{ x1: number; y1: number; x2: number; y2: number; thickness: number }> = ({
  x1,
  y1,
  x2,
  y2,
  thickness,
}) => <polygon points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + thickness} ${x1},${y1 + thickness}`} />;

const Standard: React.FC = () => {
  const s = 5;
  const top = 10;
  const bottom = top + 4 * s;
  const y = (step: number) => bottom - (step * s) / 2;
  const headW = (ADVANCE.noteheadBlack / 250) * s;
  const stemX = (x: number) => x + headW - STEM_W;
  const chordTop = y(CHORD[CHORD.length - 1].step);

  return (
    <Svg>
      <StaffLines top={top} gap={s} count={5} />
      <FinalBarLine y1={top} y2={bottom} />
      <g fill={INK}>
        <Glyph d={GLYPH.gClef} x={3} y={y(2)} space={s} />

        {MELODY.map((n, i) => (
          <Glyph key={i} d={GLYPH.noteheadBlack} x={noteX(i)} y={y(n.step)} space={s} />
        ))}
        {PAIRS.map((i) => {
          const a = y(MELODY[i].step);
          const b = y(MELODY[i + 1].step);
          const slope = Math.max(-s / 2, Math.min(s / 2, (b - a) * 0.6));
          const yA = a <= b ? a - 3.25 * s : b - 3.25 * s - slope;
          const yB = yA + slope;
          return (
            <g key={i}>
              <rect x={stemX(noteX(i))} y={yA} width={STEM_W} height={a - yA - 0.6} />
              <rect x={stemX(noteX(i + 1))} y={yB} width={STEM_W} height={b - yB - 0.6} />
              <Beam x1={stemX(noteX(i))} y1={yA} x2={stemX(noteX(i + 1)) + STEM_W} y2={yB} thickness={0.5 * s} />
            </g>
          );
        })}

        {CHORD.map((n, i) => (
          <Glyph key={i} d={GLYPH.noteheadHalf} x={CHORD_X} y={y(n.step)} space={s} />
        ))}
        <rect x={stemX(CHORD_X)} y={chordTop - 3.25 * s} width={STEM_W} height={y(0) - chordTop + 3.25 * s - 0.6} />
      </g>
    </Svg>
  );
};

const Tab: React.FC = () => {
  const gap = 6;
  const top = 4;
  const bottom = top + 5 * gap;
  const fontSize = 7.4;
  const digitW = fontSize * 0.56;
  const stringY = (string: number) => top + (string - 1) * gap;
  const center = (x: number) => x + 3;

  const frets = [
    ...MELODY.map((n, i) => ({ ...n, x: center(noteX(i)) })),
    ...CHORD.map((n) => ({ ...n, x: center(CHORD_X) })),
  ];

  const stringSegments = (string: number) => {
    const segments: [number, number][] = [];
    let start = 2;
    for (const f of frets.filter((f) => f.string === string)) {
      const half = (String(f.fret).length * digitW) / 2 + 1.2;
      segments.push([start, f.x - half]);
      start = f.x + half;
    }
    segments.push([start, END_X]);
    return segments;
  };

  return (
    <Svg>
      <g stroke={INK} strokeWidth={LINE_W}>
        {[1, 2, 3, 4, 5, 6].map((string) =>
          stringSegments(string).map(([x1, x2], i) => (
            <line key={`${string}-${i}`} x1={x1} x2={x2} y1={stringY(string)} y2={stringY(string)} />
          )),
        )}
      </g>
      <FinalBarLine y1={top} y2={bottom} />
      <g fill={INK}>
        <TabClef x={4} top={top} bottom={bottom} />
      </g>
      <g fill={INK} fontFamily="Arial, Helvetica, sans-serif" fontSize={fontSize} textAnchor="middle">
        {frets.map((f, i) => (
          <text key={i} x={f.x} y={stringY(f.string) + fontSize * 0.36}>
            {f.fret}
          </text>
        ))}
      </g>
    </Svg>
  );
};

const Drum: React.FC = () => {
  const s = 5;
  const top = 15;
  const bottom = top + 4 * s;
  const y = (step: number) => bottom - (step * s) / 2;
  const hiHat = y(9);
  const crash = y(10);
  const snare = y(5);
  const kick = y(1);
  const xW = (ADVANCE.noteheadX / 250) * s;
  const stemX = (x: number) => x + xW - STEM_W;
  const beamTop = 1;

  const lowest = (i: number) => (i === 0 ? kick : i === 2 ? snare : hiHat);

  return (
    <Svg>
      <StaffLines top={top} gap={s} count={5} />
      <FinalBarLine y1={top} y2={bottom} />
      <g fill={INK}>
        <Glyph d={GLYPH.percussionClef} x={4} y={y(4)} space={s} />

        {MELODY.map((_, i) => (
          <g key={i}>
            <Glyph d={GLYPH.noteheadX} x={noteX(i)} y={hiHat} space={s} />
            {i === 0 && <Glyph d={GLYPH.noteheadBlack} x={noteX(i) - 0.02 * s} y={kick} space={s} />}
            {i === 2 && <Glyph d={GLYPH.noteheadBlack} x={noteX(i) - 0.02 * s} y={snare} space={s} />}
            <rect
              x={stemX(noteX(i))}
              y={beamTop}
              width={STEM_W}
              height={lowest(i) - beamTop - (lowest(i) === hiHat ? 0.4 * s : 0.6)}
            />
          </g>
        ))}
        {PAIRS.map((i) => (
          <Beam key={i} x1={stemX(noteX(i))} y1={beamTop} x2={stemX(noteX(i + 1)) + STEM_W} y2={beamTop} thickness={0.5 * s} />
        ))}

        <rect x={CHORD_X - 0.4 * s} y={crash - 0.08 * s} width={xW + 0.8 * s} height={0.16 * s} />
        <Glyph d={GLYPH.noteheadX} x={CHORD_X} y={crash} space={s} />
        <Glyph d={GLYPH.noteheadBlack} x={CHORD_X - 0.02 * s} y={kick} space={s} />
        <rect x={stemX(CHORD_X)} y={beamTop} width={STEM_W} height={kick - beamTop - 0.6} />
        <Glyph d={GLYPH.restQuarter} x={101} y={y(4)} space={s} />
      </g>
    </Svg>
  );
};

const Numbered: React.FC = () => {
  const fontSize = 12.5;
  const baseline = 27;
  const x = (i: number) => 14 + i * 14;
  const chordX = 82;

  return (
    <Svg>
      <FinalBarLine y1={baseline - 13} y2={baseline + 7} />
      <g fill={INK} fontFamily="Arial, Helvetica, sans-serif">
        <text x={3} y={8} fontSize={7}>
          1 = C
        </text>
        <g fontSize={fontSize} textAnchor="middle">
          {MELODY.map((n, i) => (
            <text key={i} x={x(i)} y={baseline}>
              {n.digit}
            </text>
          ))}
          <text x={chordX} y={baseline}>
            3
          </text>
        </g>
        {PAIRS.map((i) => (
          <rect key={i} x={x(i) - 4.2} y={baseline + 3.6} width={x(i + 1) - x(i) + 8.4} height={1.3} />
        ))}
        <rect x={chordX + 12} y={baseline - 5} width={7} height={1.6} />
      </g>
    </Svg>
  );
};

export const NotationPreview: React.FC<{ kind: Kind }> = ({ kind }) => {
  switch (kind) {
    case 'standard':
      return <Standard />;
    case 'tab':
      return <Tab />;
    case 'drum':
      return <Drum />;
    case 'numbered':
      return <Numbered />;
  }
};
