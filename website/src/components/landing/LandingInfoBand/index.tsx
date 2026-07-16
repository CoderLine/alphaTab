import React from 'react';
import { useGithubStars } from '../use-github-stars';
import styles from './styles.module.scss';

interface FormatItem {
  name: string;
  meta: string;
  color: string;
}

interface Stat {
  n: string;
  l: string;
  s: string;
}

const READS: FormatItem[] = [
  { name: 'Guitar Pro', meta: '.gp3 — .gp8', color: 'var(--at-accent)' },
  { name: 'MusicXML', meta: '.musicxml / .mxl', color: 'var(--at-track-purple)' },
  { name: 'Capella', meta: '.capx', color: 'var(--at-track-green)' },
  { name: 'alphaTex', meta: 'native syntax', color: 'var(--at-track-orange)' },
];

const EXPORTS: FormatItem[] = [
  { name: 'MIDI', meta: 'binary export', color: 'var(--at-muted)' },
  { name: 'PDF', meta: 'print-ready', color: 'var(--at-muted)' },
  { name: 'SVG', meta: 'live + static', color: 'var(--at-muted)' },
  { name: 'Canvas', meta: 'live runtime', color: 'var(--at-muted)' },
];

const PROJECT_START_YEAR = 2010;

function buildStats(githubStars: string): Stat[] {
  const years = Math.max(1, new Date().getFullYear() - PROJECT_START_YEAR);
  return [
    { n: String(years), l: 'years in production', s: `since ${PROJECT_START_YEAR}` },
    { n: '3', l: 'native runtimes', s: 'JS · .NET · Kotlin' },
    { n: '1', l: 'core, every platform', s: 'web · desktop · mobile' },
    // Live GitHub star count, sourced from shields.io with a build-time fallback.
    // See src/components/landing/use-github-stars.ts.
    { n: githubStars || '—', l: 'GitHub stars', s: 'MPL-2.0' },
  ];
}

const FormatList: React.FC<{ label: string; items: FormatItem[]; withDot?: boolean; labelColor?: string }> = ({
  label,
  items,
  withDot = true,
  labelColor,
}) => (
  <div className={styles.formatList}>
    <div className={styles.formatLabelRow}>
      <span className={styles.formatLabel} style={labelColor ? { color: labelColor } : undefined}>
        {label}
      </span>
      <span className={styles.formatRule} />
    </div>
    <div className={styles.formatItems}>
      {items.map((f, i) => (
        <div key={i} className={styles.formatItem}>
          {withDot && <span className={styles.formatDot} style={{ background: f.color }} />}
          <span className={styles.formatName}>{f.name}</span>
          <span className={styles.formatMeta}>{f.meta}</span>
        </div>
      ))}
    </div>
  </div>
);

export const LandingInfoBand: React.FC = () => {
  const githubStars = useGithubStars();
  const stats = buildStats(githubStars);
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.formatsGrid}>
          <FormatList label="Reads" items={READS} withDot labelColor="var(--at-accent)" />
          <div className={styles.pivot}>
            <span className={styles.pivotLine} />
            <span className={styles.pivotChip}>alphaTab</span>
          </div>
          <FormatList label="Exports" items={EXPORTS} withDot={false} labelColor="var(--at-muted)" />
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statsLabel}>At a glance</div>
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={i} className={styles.stat}>
                <div className={styles.statNum}>{s.n}</div>
                <div className={styles.statLabel}>{s.l}</div>
                <div className={styles.statMeta}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
