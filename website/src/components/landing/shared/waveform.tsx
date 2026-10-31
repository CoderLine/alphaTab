import React from 'react';

interface WaveformProps {
  width?: number;
  height?: number;
  bars?: number;
  seed?: number;
  progress?: number; // 0..1, portion drawn in accent color
  className?: string;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffff) / 0xffff;
  };
}

export const Waveform: React.FC<WaveformProps> = ({
  width = 600,
  height = 40,
  bars = 120,
  seed = 3,
  progress = 0.35,
  className,
}) => {
  const r = React.useMemo(() => rng(seed), [seed]);
  const bw = width / bars;
  const cells = Array.from({ length: bars }, (_, i) => {
    const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
    const h = Math.max(2, height * env * (0.4 + r() * 0.6));
    const y = (height - h) / 2;
    return { i, h, y };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: `${height}px` }}
    >
      {cells.map(({ i, h, y }) => {
        const past = i / bars < progress;
        return (
          <rect
            key={i}
            x={i * bw + bw * 0.2}
            y={y}
            width={bw * 0.6}
            height={h}
            fill={past ? 'var(--at-accent)' : 'var(--at-muted)'}
            opacity={past ? 0.9 : 0.55}
          />
        );
      })}
    </svg>
  );
};
