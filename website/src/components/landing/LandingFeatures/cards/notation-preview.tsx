import React from 'react';

type Kind = 'standard' | 'tab' | 'drum' | 'numbered';

const W = 170;
const H = 32;

export const NotationPreview: React.FC<{ kind: Kind }> = ({ kind }) => {
  if (kind === 'standard') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={4} x2={W - 4} y1={6 + i * 5} y2={6 + i * 5} stroke="var(--at-ink)" strokeWidth={0.5} />
        ))}
        <text x={4} y={24} fontFamily="Georgia, serif" fontSize="22" fill="var(--at-ink)">
          𝄞
        </text>
        <text x={28} y={16} fontFamily="Georgia, serif" fontSize="8" fontWeight="700" fill="var(--at-ink)">
          4
        </text>
        <text x={28} y={26} fontFamily="Georgia, serif" fontSize="8" fontWeight="700" fill="var(--at-ink)">
          4
        </text>
        {[
          { x: 46, y: 14 },
          { x: 66, y: 10 },
          { x: 86, y: 16 },
          { x: 110, y: 12 },
          { x: 132, y: 18 },
          { x: 152, y: 14 },
        ].map((n, i) => (
          <g key={i}>
            <ellipse cx={n.x} cy={n.y} rx={2.2} ry={1.6} fill="var(--at-ink)" transform={`rotate(-20 ${n.x} ${n.y})`} />
            <line x1={n.x + 2} y1={n.y - 1} x2={n.x + 2} y2={n.y - 12} stroke="var(--at-ink)" strokeWidth={0.6} />
          </g>
        ))}
        <line x1={48} y1={2} x2={154} y2={2} stroke="var(--at-ink)" strokeWidth={1.4} />
      </svg>
    );
  }
  if (kind === 'tab') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={14} x2={W - 4} y1={4 + i * 4.5} y2={4 + i * 4.5} stroke="var(--at-ink)" strokeWidth={0.45} opacity={0.85} />
        ))}
        <text x={2} y={11} fontFamily="Georgia, serif" fontSize="6.5" fontWeight="700" fill="var(--at-ink)">T</text>
        <text x={2} y={19} fontFamily="Georgia, serif" fontSize="6.5" fontWeight="700" fill="var(--at-ink)">A</text>
        <text x={2} y={27} fontFamily="Georgia, serif" fontSize="6.5" fontWeight="700" fill="var(--at-ink)">B</text>
        {[
          { x: 26, y: 13, n: 7 },
          { x: 50, y: 22, n: 5 },
          { x: 74, y: 18, n: 3 },
          { x: 96, y: 9, n: 12 },
          { x: 124, y: 17, n: 0 },
          { x: 148, y: 22, n: 5 },
        ].map((f, i) => (
          <g key={i}>
            <rect x={f.x - 5} y={f.y - 5} width={String(f.n).length * 5 + 4} height={8} fill="var(--at-bg)" />
            <text x={f.x - 3} y={f.y + 1.5} fontFamily="var(--at-font-mono)" fontSize="7" fontWeight="600" fill="var(--at-ink)">
              {f.n}
            </text>
          </g>
        ))}
      </svg>
    );
  }
  if (kind === 'drum') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={14} x2={W - 4} y1={6 + i * 5} y2={6 + i * 5} stroke="var(--at-ink)" strokeWidth={0.5} />
        ))}
        <line x1={5} x2={5} y1={6} y2={26} stroke="var(--at-ink)" strokeWidth={1.6} />
        <line x1={9} x2={9} y1={6} y2={26} stroke="var(--at-ink)" strokeWidth={1.6} />
        {[26, 46, 66, 86, 106, 126, 146].map((x, i) => (
          <g key={`hh-${i}`} transform={`translate(${x}, 3)`}>
            <line x1={-2} y1={-2} x2={2} y2={2} stroke="var(--at-ink)" strokeWidth={1} />
            <line x1={-2} y1={2} x2={2} y2={-2} stroke="var(--at-ink)" strokeWidth={1} />
          </g>
        ))}
        {[36, 76, 116].map((x, i) => (
          <ellipse key={`sn-${i}`} cx={x} cy={16} rx={2.4} ry={1.8} fill="var(--at-ink)" />
        ))}
        {[36, 116].map((x, i) => (
          <ellipse key={`bd-${i}`} cx={x} cy={26} rx={2.4} ry={1.8} fill="var(--at-ink)" />
        ))}
        {[26, 46, 66, 86, 106, 126, 146].map((x, i) => (
          <line key={`st-${i}`} x1={x} y1={3} x2={x} y2={-2} stroke="var(--at-ink)" strokeWidth={0.7} />
        ))}
      </svg>
    );
  }
  // numbered (jiǎnpǔ)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden="true">
      {[
        { n: '1', x: 14, top: 0 },
        { n: '2', x: 32, top: 0 },
        { n: '3', x: 50, top: 0 },
        { n: '5', x: 68, top: 1 },
        { n: '6', x: 88, top: 1, under: 1 },
        { n: '5', x: 108, top: 1, under: 1 },
        { n: '3', x: 126, top: 0, under: 1 },
        { n: '·', x: 144, top: 0 },
        { n: '1', x: 156, top: 1 },
      ].map((b, i) => (
        <g key={i}>
          {b.top > 0 && <circle cx={b.x} cy={4} r={0.9} fill="var(--at-ink)" />}
          <text x={b.x} y={20} fontFamily="var(--at-font-mono)" fontSize="12" fontWeight="600" fill="var(--at-ink)" textAnchor="middle">
            {b.n}
          </text>
          {b.under !== undefined && b.under > 0 && (
            <line x1={b.x - 4} x2={b.x + 4} y1={24} y2={24} stroke="var(--at-ink)" strokeWidth={0.8} />
          )}
        </g>
      ))}
      <line x1={78} x2={78} y1={8} y2={22} stroke="var(--at-ink)" strokeWidth={0.4} opacity={0.5} />
      <line x1={138} x2={138} y1={8} y2={22} stroke="var(--at-ink)" strokeWidth={0.4} opacity={0.5} />
    </svg>
  );
};
