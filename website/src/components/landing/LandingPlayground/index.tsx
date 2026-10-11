import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { model } from '@coderline/alphatab';
import {
  AlphaTabPlayer,
  useAlphaTabState,
  useAlphaTabControls,
  type TexDiagnostic,
  type TexLoadResult,
} from '@site/src/alphatab-react';
import { AlphaTexEditor, useNearViewport, type AlphaTexEditorHandle } from '@site/src/components/AlphaTexEditor';
import { SectionHeader } from '../section-header';
import { Btn } from '../shared/btn';
import { IconExternalLink, IconFileMusic } from '../shared/icons';
import { NOT_DESKTOP_QUERY, useMediaQuery } from '../shared/use-media-query';
import { PlayerShell, PlayerTab } from '../PlayerShell';
import { PRESETS, type AlphaTexPreset } from './presets';
import styles from './styles.module.scss';

const RENDER_DELAY_MS = 250;

export const LandingPlayground: React.FC = () => {
  const [frameRef, nearViewport] = useNearViewport<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="§ alphaTex · live"
          title="Type music. Hear it. Ship it."
          paragraph="alphaTex is a human-readable text format for music notation. Write it in the browser with completions, inline docs and live diagnostics, then paste it into your CMS or version it in git."
          action={
            <span className={styles.headAction}>
              <Btn to="/docs/playground/playground" variant="secondary" size="sm" iconRight={<IconExternalLink size={11} />}>
                Open full Playground
              </Btn>
            </span>
          }
        />

        <div ref={frameRef}>
          <AlphaTabPlayer settingsPreset="landing">
            <PlaygroundPlayer active={nearViewport} />
          </AlphaTabPlayer>
        </div>

        <div className={styles.mobileCta}>
          <Btn to="/docs/playground/playground" variant="secondary" fullWidth iconRight={<IconExternalLink size={11} />}>
            Open full Playground
          </Btn>
        </div>
      </div>
    </section>
  );
};

interface LoadedTex extends TexLoadResult {
  tex: string;
}

/** Mounts the editor and the renderer only once `active`, so neither costs anything before the section is near. */
const PlaygroundPlayer: React.FC<{ active: boolean }> = ({ active }) => {
  const state = useAlphaTabState();
  const controls = useAlphaTabControls();
  const compact = useMediaQuery(NOT_DESKTOP_QUERY);
  const editorRef = useRef<AlphaTexEditorHandle>(null);

  const [preset, setPreset] = useState<AlphaTexPreset>(PRESETS[0]);
  const [text, setText] = useState(preset.tex);
  const [loaded, setLoaded] = useState<LoadedTex | null>(null);

  useEffect(() => {
    if (!controls) return;
    const timer = setTimeout(() => setLoaded({ tex: text, ...controls.loadTex(text) }), RENDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [controls, text]);

  const selectPreset = (next: AlphaTexPreset) => {
    setPreset(next);
    setText(next.tex);
  };

  const diagnostics = loaded?.diagnostics ?? [];
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const isUpdating = !loaded || loaded.tex !== text || state.isRendering;
  const reveal = (d: TexDiagnostic | undefined) => {
    if (d?.start) editorRef.current?.revealPosition(d.start.line, d.start.col);
  };

  const tabs = PRESETS.map((p) => (
    <PlayerTab
      key={p.id}
      active={p.id === preset.id}
      onClick={() => selectPreset(p)}
      color="var(--at-accent)"
      title={p.label}
    >
      {p.fileName}
    </PlayerTab>
  ));

  const editor = (
    <div className={styles.editorPane}>
      <div className={styles.editorHeader}>
        <IconFileMusic size={11} aria-hidden="true" />
        <span className={styles.editorFileName}>{preset.fileName}</span>
        {text !== preset.tex && (
          <button type="button" className={styles.resetBtn} onClick={() => setText(preset.tex)}>
            Reset
          </button>
        )}
      </div>
      <div className={styles.editorBody}>
        {active && (
          <AlphaTexEditor
            ref={editorRef}
            value={text}
            onChange={setText}
            compact={compact}
            ariaLabel={`alphaTex source: ${preset.fileName}`}
          />
        )}
      </div>
    </div>
  );

  const notationHeader = (
    <div className={styles.renderBar}>
      <RenderStatus
        updating={isUpdating}
        errors={errors}
        warnings={warnings}
        hasScore={!!state.currentScore}
        onReveal={reveal}
      />
      <span className={styles.spacer} />
      <span className={styles.renderMeta}>{describeScore(state.currentScore, state.totalBars)}</span>
    </div>
  );

  const mobileHeader = (
    <>
      <div className={styles.mobilePresetBar}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === preset.id}
            className={styles.mobilePresetPill}
            onClick={() => selectPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {editor}
    </>
  );

  return (
    <PlayerShell
      active={active}
      tabs={tabs}
      sidebar={editor}
      sidebarClassName={styles.editorSidebar}
      notationHeader={notationHeader}
      notationDimmed={errors.length > 0}
      mobileHeader={mobileHeader}
    />
  );
};

interface RenderStatusProps {
  updating: boolean;
  errors: TexDiagnostic[];
  warnings: TexDiagnostic[];
  hasScore: boolean;
  onReveal: (d: TexDiagnostic | undefined) => void;
}

const RenderStatus: React.FC<RenderStatusProps> = ({ updating, errors, warnings, hasScore, onReveal }) => {
  if (errors.length > 0) {
    const first = errors[0];
    return (
      <button
        type="button"
        className={clsx(styles.status, styles.statusError)}
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
    return <span className={styles.status} aria-live="polite">Rendering…</span>;
  }
  if (warnings.length > 0) {
    return (
      <button
        type="button"
        className={clsx(styles.status, styles.statusWarning)}
        onClick={() => onReveal(warnings[0])}
        title={formatDiagnostic(warnings[0])}
        aria-live="polite"
      >
        <span className={styles.statusCount}>✓ Rendered · {plural(warnings.length, 'warning')}</span>
      </button>
    );
  }
  return <span className={clsx(styles.status, styles.statusOk)} aria-live="polite">✓ Rendered</span>;
};

function formatDiagnostic(d: TexDiagnostic): string {
  const at = d.start ? `${d.start.line}:${d.start.col} ` : '';
  return `${at}${d.message}`;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function describeScore(score: model.Score | null, totalBars: number): string {
  if (!score) return '';
  const staves = score.tracks.flatMap((t) => t.staves);
  const standard = staves.some((s) => s.showStandardNotation);
  const tab = staves.some((s) => s.showTablature);
  const notation = standard && tab ? 'standard + tab' : tab ? 'tab' : 'standard';
  const parts = [`♩=${score.tempo}`, plural(totalBars, 'bar')];
  if (score.tracks.length > 1) parts.push(plural(score.tracks.length, 'track'));
  parts.push(notation);
  return parts.join(' · ');
}
