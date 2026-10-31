import React from 'react';
import { GLYPH, Glyph } from './smufl';
import styles from './reflow.module.scss';

/** Quarter-note pitches per bar, in diatonic steps above the bottom staff line. */
const BARS = [
  [2, 3, 4, 2],
  [5, 4, 3, 1],
  [0, 2, 4, 6],
  [7, 6, 5, 4],
  [3, 4, 5, 7],
  [6, 4, 2, 0],
];
const TRACKED_BAR = 4;

const STOPS = [
  { label: 'phone', at: 42 },
  { label: 'tablet', at: 70 },
  { label: 'desktop', at: 100 },
];

const SPACE = 3.5;
const ROW_H = 27;
const STAFF_TOP = 7;
const STAFF_BOTTOM = STAFF_TOP + 4 * SPACE;
const CLEF_W = 14;
const MIN_BAR_W = 46;
const HEAD_W = (295 / 250) * SPACE;
const STEM_W = 0.6;
const STEM_LEN = 3.5 * SPACE;
const INK = 'var(--at-ink)';

const noteY = (step: number) => STAFF_BOTTOM - (step * SPACE) / 2;

const StaffLines: React.FC = () => (
  <g stroke="var(--reflow-staff-line)" strokeWidth={0.7}>
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1="0" x2="100%" y1={STAFF_TOP + i * SPACE} y2={STAFF_TOP + i * SPACE} />
    ))}
  </g>
);

/** A quarter note centred on `x`. */
const Note: React.FC<{ step: number; x: string }> = ({ step, x }) => {
  const y = noteY(step);
  const up = step < 4;
  const left = -HEAD_W / 2;
  return (
    <svg x={x} overflow="visible">
      <Glyph d={GLYPH.noteheadBlack} x={left} y={y} space={SPACE} />
      {up ? (
        <rect x={left + HEAD_W - STEM_W} y={y - STEM_LEN} width={STEM_W} height={STEM_LEN - 0.6} />
      ) : (
        <rect x={left} y={y + 0.6} width={STEM_W} height={STEM_LEN - 0.6} />
      )}
    </svg>
  );
};

/** One system: a clef column of fixed width, then `bars.length` bars at the shared bar width. */
const System: React.FC<{ first: number; count: number; perRow: number }> = ({ first, count, perRow }) => {
  const pct = (bar: number, within = 0) => `${((bar + within) / count) * 100}%`;
  return (
    <div className={styles.system}>
      <svg width={CLEF_W} height={ROW_H} overflow="visible">
        <StaffLines />
        <g fill={INK}>
          <rect x={0} y={STAFF_TOP} width={0.8} height={STAFF_BOTTOM - STAFF_TOP} />
          <Glyph d={GLYPH.gClef} x={2} y={noteY(2)} space={SPACE} />
        </g>
      </svg>
      <svg
        height={ROW_H}
        overflow="visible"
        style={{ width: `calc((100% - ${CLEF_W}px) * ${count / perRow})` }}
      >
        <StaffLines />
        {first <= TRACKED_BAR && TRACKED_BAR < first + count && (
          <rect
            x={pct(TRACKED_BAR - first)}
            y={STAFF_TOP - 4}
            width={pct(1)}
            height={STAFF_BOTTOM - STAFF_TOP + 8}
            fill="var(--at-accent-soft-strong)"
          />
        )}
        {Array.from({ length: count }, (_, b) => {
          const bar = first + b;
          return (
            <g key={bar} fill={bar === TRACKED_BAR ? 'var(--at-accent)' : INK}>
              {BARS[bar].map((step, n) => (
                <Note key={n} step={step} x={pct(b, (n + 0.5) / 4)} />
              ))}
            </g>
          );
        })}
        <g stroke={INK} strokeWidth={0.8}>
          {Array.from({ length: count }, (_, b) => (
            <line key={b} x1={pct(b + 1)} x2={pct(b + 1)} y1={STAFF_TOP} y2={STAFF_BOTTOM} />
          ))}
        </g>
      </svg>
    </div>
  );
};

export const Reflow: React.FC = () => {
  const pageRef = React.useRef<HTMLDivElement>(null);
  const [perRow, setPerRow] = React.useState(BARS.length);

  React.useEffect(() => {
    const page = pageRef.current;
    if (!page || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const fit = Math.floor((entry.contentRect.width - CLEF_W) / MIN_BAR_W);
      const next = Math.min(BARS.length, Math.max(2, fit));
      setPerRow((current) => (current === next ? current : next));
    });
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  const systems = Array.from({ length: Math.ceil(BARS.length / perRow) }, (_, i) => i * perRow);

  return (
    <div className={styles.reflow} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.frame}>
          <div className={styles.chrome}>
            <span />
            <span />
            <span />
          </div>
          <div ref={pageRef} className={styles.page}>
            <div className={styles.title} />
            {systems.map((first) => (
              <System key={first} first={first} count={Math.min(perRow, BARS.length - first)} perRow={perRow} />
            ))}
          </div>
          <div className={styles.grip} />
        </div>
      </div>
      <div className={styles.ruler}>
        {STOPS.map((s) => (
          <span key={s.label} className={`${styles.stop} ${styles[s.label]}`} style={{ left: `${s.at}%` }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};
