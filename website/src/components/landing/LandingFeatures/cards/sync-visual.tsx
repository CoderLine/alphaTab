import React from 'react';

const W = 380;
const H = 110;
const cursorX = W * 0.42;
const labelW = 38;
const rowH = 14;
const rowGap = 6;
const startY = 14;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffff) / 0xffff;
  };
}

export const SyncVisual: React.FC = () => {
  const rndAudio = React.useMemo(() => rng(11), []);
  const rndSynth = React.useMemo(() => rng(23), []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      {['video', 'audio', 'synth', 'score'].map((label, i) => {
        const y = startY + i * (rowH + rowGap);
        return (
          <text key={label} x={0} y={y + rowH * 0.72} fontFamily="var(--at-font-mono)" fontSize="9" fill="var(--at-muted)">
            {label}
          </text>
        );
      })}

      {/* video */}
      {(() => {
        const y = startY;
        const x0 = labelW;
        const w = W - x0;
        const frames = 10;
        const fw = w / frames;
        return Array.from({ length: frames }).map((_, i) => {
          const x = x0 + i * fw;
          const past = x + fw / 2 < cursorX;
          return (
            <g key={i}>
              <rect
                x={x + 1}
                y={y}
                width={fw - 2}
                height={rowH}
                fill={past ? 'var(--at-accent-soft-strong)' : 'var(--at-surface-alt)'}
                stroke="var(--at-line)"
                strokeWidth={0.5}
                rx={1.5}
              />
              <rect x={x + fw * 0.4} y={y + 2} width={fw * 0.2} height={1} fill="var(--at-muted)" opacity={0.45} />
              <rect x={x + fw * 0.4} y={y + rowH - 3} width={fw * 0.2} height={1} fill="var(--at-muted)" opacity={0.45} />
            </g>
          );
        });
      })()}

      {/* audio */}
      {(() => {
        const y = startY + (rowH + rowGap);
        const x0 = labelW;
        const w = W - x0;
        const bars = 56;
        const bw = w / bars;
        return Array.from({ length: bars }).map((_, i) => {
          const x = x0 + i * bw;
          const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
          const h = Math.max(1.5, rowH * env * (0.4 + rndAudio() * 0.6));
          const past = x < cursorX;
          return (
            <rect
              key={i}
              x={x + bw * 0.2}
              y={y + (rowH - h) / 2}
              width={Math.max(0.8, bw * 0.6)}
              height={h}
              fill={past ? 'var(--at-accent)' : 'var(--at-muted)'}
              opacity={past ? 0.85 : 0.45}
              rx={0.5}
            />
          );
        });
      })()}

      {/* synth */}
      {(() => {
        const y = startY + (rowH + rowGap) * 2;
        const x0 = labelW;
        const w = W - x0;
        const notes = 18;
        const step = w / notes;
        return Array.from({ length: notes }).map((_, i) => {
          const x = x0 + i * step + step * 0.4;
          const past = x < cursorX;
          const yShift = (rndSynth() - 0.5) * (rowH * 0.4);
          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={y + rowH * 0.5 + yShift}
                y2={y + 1}
                stroke={past ? 'var(--at-accent)' : 'var(--at-muted)'}
                strokeWidth={0.7}
                opacity={past ? 0.85 : 0.45}
              />
              <circle cx={x} cy={y + rowH * 0.5 + yShift} r={1.8} fill={past ? 'var(--at-accent)' : 'var(--at-muted)'} opacity={past ? 0.95 : 0.6} />
            </g>
          );
        });
      })()}

      {/* score */}
      {(() => {
        const y = startY + (rowH + rowGap) * 3;
        const x0 = labelW;
        const w = W - x0;
        return (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={x0} x2={x0 + w} y1={y + 2 + i * 2.4} y2={y + 2 + i * 2.4} stroke="var(--at-muted)" strokeWidth={0.4} opacity={0.5} />
            ))}
            {[3, 5, 7, 9, 12, 14, 15, 17].map((fret, i) => {
              const cx = x0 + (i / 8) * w + w * 0.06;
              const past = cx < cursorX;
              return (
                <g key={i}>
                  <rect x={cx - 4} y={y + 4} width={8} height={6} fill="var(--at-surface)" opacity={past ? 0.95 : 0.7} />
                  <text
                    x={cx}
                    y={y + 9}
                    fontFamily="var(--at-font-mono)"
                    fontSize="6.5"
                    fontWeight="600"
                    fill={past ? 'var(--at-accent)' : 'var(--at-muted)'}
                    textAnchor="middle"
                  >
                    {fret}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* cursor */}
      <line x1={cursorX} x2={cursorX} y1={startY - 4} y2={startY + (rowH + rowGap) * 4 - rowGap + 2} stroke="var(--at-accent)" strokeWidth={1.2} />
      <circle cx={cursorX} cy={startY - 4} r={2.6} fill="var(--at-accent)" />

      <g transform={`translate(${cursorX + 6}, ${startY - 6})`}>
        <rect x={0} y={0} width={70} height={10} fill="var(--at-accent)" opacity={0.12} rx={2} />
        <text x={4} y={7.5} fontFamily="var(--at-font-mono)" fontSize="7" fontWeight="600" fill="var(--at-accent)">
          in sync · 00:38
        </text>
      </g>
    </svg>
  );
};
