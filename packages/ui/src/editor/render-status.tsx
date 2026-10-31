import React from 'react';
import clsx from 'clsx';
import type { model } from '@coderline/alphatab';
import type { TexDiagnostic } from '../state/store';
import styles from './render-status.module.scss';

export interface RenderStatusProps {
  updating: boolean;
  errors: TexDiagnostic[];
  warnings: TexDiagnostic[];
  hasScore: boolean;
  onReveal: (d: TexDiagnostic | undefined) => void;
  /** `code` for the dark editor surface. */
  surface?: 'page' | 'code';
}

/** One-line summary of the last alphaTex render; errors and warnings jump to their position via `onReveal`. */
export const RenderStatus: React.FC<RenderStatusProps> = ({ updating, errors, warnings, hasScore, onReveal, surface = 'page' }) => {
  const onCode = surface === 'code' && styles.onCode;
  if (errors.length > 0) {
    const first = errors[0];
    return (
      <button
        type="button"
        className={clsx(styles.status, styles.statusError, onCode)}
        onClick={() => onReveal(first)}
        title={formatDiagnostic(first)}
        aria-live="polite"
      >
        <span className={styles.statusCount}>{plural(errors.length, 'error')}</span>
        <span className={styles.statusDetail}>{formatDiagnostic(first)}</span>
        <span className={styles.statusNote}>{hasScore ? '· showing last valid render' : '· nothing to render'}</span>
      </button>
    );
  }
  if (updating) {
    return <span className={clsx(styles.status, onCode)} aria-live="polite">Rendering…</span>;
  }
  if (warnings.length > 0) {
    return (
      <button
        type="button"
        className={clsx(styles.status, styles.statusWarning, onCode)}
        onClick={() => onReveal(warnings[0])}
        title={formatDiagnostic(warnings[0])}
        aria-live="polite"
      >
        <span className={styles.statusCount}>✓ Rendered · {plural(warnings.length, 'warning')}</span>
      </button>
    );
  }
  return <span className={clsx(styles.status, styles.statusOk, onCode)} aria-live="polite">✓ Rendered</span>;
};

export function formatDiagnostic(d: TexDiagnostic): string {
  const at = d.start ? `${d.start.line}:${d.start.col} ` : '';
  return `${at}${d.message}`;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/** `♩=120 · 16 bars · 2 tracks · standard + tab` */
export function describeScore(score: model.Score | null, totalBars: number): string {
  if (!score) { return ''; }
  const staves = score.tracks.flatMap((t) => t.staves);
  const standard = staves.some((s) => s.showStandardNotation);
  const tab = staves.some((s) => s.showTablature);
  const notation = standard && tab ? 'standard + tab' : tab ? 'tab' : 'standard';
  const parts = [`♩=${score.tempo}`, plural(totalBars, 'bar')];
  if (score.tracks.length > 1) { parts.push(plural(score.tracks.length, 'track')); }
  parts.push(notation);
  return parts.join(' · ');
}
