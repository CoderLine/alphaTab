import React from 'react';

export interface TabNotationProps {
  width?: number;
  height?: number;
  measures?: number;
  highlight?: boolean;
  showStandard?: boolean;
  showTab?: boolean;
  cursor?: number; // 0..1 — horizontal playback cursor
  /** Decorative SVGs get aria-hidden; meaningful ones get a role + label. */
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
}

interface Event {
  string: number;
  fret: number;
  pitch: number;
  sharp: boolean;
  t: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffff) / 0xffff;
  };
}

export const TabNotation: React.FC<TabNotationProps> = ({
  width = 1100,
  height = 220,
  measures = 6,
  highlight = true,
  showStandard = true,
  showTab = true,
  cursor = 0.18,
  decorative = true,
  ariaLabel,
  className,
}) => {
  const padL = 56;
  const padR = 24;
  const usable = width - padL - padR;
  const measureW = usable / measures;

  const stdTop = showStandard ? 14 : 0;
  const stdLineGap = 7;
  const stdH = showStandard ? stdLineGap * 4 : 0;
  const tabTop = stdTop + stdH + (showStandard && showTab ? 30 : 0);
  const tabLineGap = 9;
  const tabH = showTab ? tabLineGap * 5 : 0;

  const measureData = React.useMemo<Event[][]>(() => {
    const r = rng(7 + measures * 13);
    return Array.from({ length: measures }, () => {
      const beats = 4 + Math.floor(r() * 3);
      return Array.from({ length: beats }, (_, bi) => ({
        string: 1 + Math.floor(r() * 5),
        fret: Math.floor(r() * 17),
        pitch: 2 + Math.floor(r() * 6),
        sharp: r() > 0.78,
        t: bi / beats + (r() - 0.5) * 0.03,
      }));
    });
  }, [measures]);

  const hlX = padL;
  const hlW = measureW;
  const cursorX = padL + usable * cursor;

  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img', 'aria-label': ariaLabel ?? 'Tab notation preview' };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      {...a11y}
    >
      <rect width={width} height={height} fill="var(--at-surface)" />

      {highlight && (
        <rect
          x={hlX}
          y={stdTop - 6}
          width={hlW}
          height={tabTop + tabH - stdTop + 12}
          fill="var(--at-highlight)"
        />
      )}

      {showStandard && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={padL - 8}
              x2={width - padR + 8}
              y1={stdTop + i * stdLineGap}
              y2={stdTop + i * stdLineGap}
              stroke="var(--at-ink)"
              strokeWidth={0.7}
            />
          ))}
          <text x={padL - 14} y={stdTop + 12} fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="var(--at-ink)">4</text>
          <text x={padL - 14} y={stdTop + 25} fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="var(--at-ink)">4</text>
          {measureData.map((events, mi) => (
            <g key={mi}>
              {events.map((e, bi) => {
                const x = padL + mi * measureW + e.t * measureW * 0.9 + 6;
                const y = stdTop + e.pitch * (stdLineGap / 2) - 2;
                return (
                  <g key={bi}>
                    <ellipse cx={x} cy={y} rx={3} ry={2.3} fill="var(--at-ink)" transform={`rotate(-22 ${x} ${y})`} />
                    <line x1={x + 2.5} y1={y - 1} x2={x + 2.5} y2={y - 18} stroke="var(--at-ink)" strokeWidth={0.9} />
                    {e.sharp && (
                      <text x={x - 9} y={y + 3} fontSize="10" fontFamily="serif" fontWeight="700" fill="var(--at-ink)">
                        ♯
                      </text>
                    )}
                  </g>
                );
              })}
              {events.length > 1 && (
                <line
                  x1={padL + mi * measureW + events[0].t * measureW * 0.9 + 8.5}
                  x2={padL + mi * measureW + events[events.length - 1].t * measureW * 0.9 + 8.5}
                  y1={stdTop - 12}
                  y2={stdTop - 12}
                  stroke="var(--at-ink)"
                  strokeWidth={2.4}
                />
              )}
            </g>
          ))}
          {Array.from({ length: measures + 1 }).map((_, i) => (
            <line
              key={i}
              x1={padL + i * measureW}
              x2={padL + i * measureW}
              y1={stdTop}
              y2={stdTop + stdH}
              stroke="var(--at-ink)"
              strokeWidth={0.9}
            />
          ))}
        </g>
      )}

      {showTab && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1={padL - 8}
              x2={width - padR + 8}
              y1={tabTop + i * tabLineGap}
              y2={tabTop + i * tabLineGap}
              stroke="var(--at-ink)"
              strokeWidth={0.6}
              opacity={0.85}
            />
          ))}
          <g fontFamily="Georgia, serif" fontWeight="700" fontSize="11" fill="var(--at-ink)">
            <text x={padL - 24} y={tabTop + 8}>T</text>
            <text x={padL - 24} y={tabTop + 22}>A</text>
            <text x={padL - 24} y={tabTop + 36}>B</text>
          </g>
          {measureData.map((events, mi) => (
            <g key={mi}>
              {events.map((e, bi) => {
                const x = padL + mi * measureW + e.t * measureW * 0.9 + 6;
                const y = tabTop + e.string * tabLineGap + 3.5;
                const w = String(e.fret).length * 6 + 4;
                return (
                  <g key={bi}>
                    <rect x={x - 6} y={y - 7} width={w} height={11} fill="var(--at-surface)" />
                    <text x={x - 4} y={y + 1} fontSize="10" fontFamily="var(--at-font-mono)" fontWeight="600" fill="var(--at-ink)">
                      {e.fret}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          {Array.from({ length: measures + 1 }).map((_, i) => (
            <line
              key={i}
              x1={padL + i * measureW}
              x2={padL + i * measureW}
              y1={tabTop}
              y2={tabTop + tabH}
              stroke="var(--at-ink)"
              strokeWidth={0.9}
            />
          ))}
        </g>
      )}

      <line
        x1={cursorX}
        x2={cursorX}
        y1={stdTop - 8}
        y2={tabTop + tabH + 8}
        stroke="var(--at-accent)"
        strokeWidth={1.6}
        opacity={0.85}
      />
      {Array.from({ length: measures }).map((_, i) => (
        <text
          key={i}
          x={padL + i * measureW + 4}
          y={stdTop - 16}
          fontFamily="var(--at-font-mono)"
          fontSize="9"
          fill="var(--at-accent)"
          fontWeight="600"
        >
          {13 + i}
        </text>
      ))}
    </svg>
  );
};
