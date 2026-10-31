import React, { useEffect, useRef, useState } from 'react';
import {
  PlayerProvider,
  usePlayerState,
  usePlayerControls,
  type TexDiagnostic,
  type TexLoadResult,
  AlphaTexEditor,
  useNearViewport,
  type AlphaTexEditorHandle,
  RenderStatus,
  describeScore,
  IconExternalLink,
  IconFileMusic,
  NOT_DESKTOP_QUERY,
  useMediaQuery,
} from '@coderline/alphatab-ui';
import { SectionHeader } from '../section-header';
import { Btn } from '../shared/btn';
import { PLAYER_SHELL_SETTINGS, PlayerShell, PlayerTab } from '../PlayerShell';
import { usePlaygroundLink } from '@site/src/components/Playground/open-in-playground';
import { PRESETS, type AlphaTexPreset } from './presets';
import styles from './styles.module.scss';

const RENDER_DELAY_MS = 250;

export const LandingPlayground: React.FC = () => {
  const [frameRef, nearViewport] = useNearViewport<HTMLDivElement>();
  const [preset, setPreset] = useState<AlphaTexPreset>(PRESETS[0]);
  const [text, setText] = useState(preset.tex);
  const selectPreset = (next: AlphaTexPreset) => {
    setPreset(next);
    setText(next.tex);
  };
  // Unedited presets get a short link; edited text travels compressed in the URL.
  const playgroundTarget = text === preset.tex ? { sample: `tex-${preset.id}` } : { tex: text };
  const playgroundLink = usePlaygroundLink(playgroundTarget, { sample: `tex-${preset.id}` });
  const openPlayground = (fullWidth: boolean, small: boolean) => (
    <Btn
      to={playgroundLink.href}
      onClick={playgroundLink.onClick}
      variant="secondary"
      size={small ? 'sm' : undefined}
      fullWidth={fullWidth}
      iconRight={<IconExternalLink size={11} />}
    >
      Open in Playground
    </Btn>
  );

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="§ alphaTex · live"
          title="Type music. Hear it. Ship it."
          paragraph="alphaTex is a human-readable text format for music notation. Write it in the browser with completions, inline docs and live diagnostics, then paste it into your CMS or version it in git."
          action={
            <span className={styles.headAction}>{openPlayground(false, true)}</span>
          }
        />

        <div ref={frameRef}>
          <PlayerProvider settingsPreset="landing" settings={PLAYER_SHELL_SETTINGS}>
            <PlaygroundPlayer active={nearViewport} preset={preset} onSelectPreset={selectPreset} text={text} onTextChange={setText} />
          </PlayerProvider>
        </div>

        <div className={styles.mobileCta}>{openPlayground(true, false)}</div>
      </div>
    </section>
  );
};

interface LoadedTex extends TexLoadResult {
  tex: string;
}

interface PlaygroundPlayerProps {
  active: boolean;
  preset: AlphaTexPreset;
  onSelectPreset: (preset: AlphaTexPreset) => void;
  text: string;
  onTextChange: (text: string) => void;
}

/** Mounts the editor and the renderer only once `active`, so neither costs anything before the section is near. */
const PlaygroundPlayer: React.FC<PlaygroundPlayerProps> = ({ active, preset, onSelectPreset: selectPreset, text, onTextChange: setText }) => {
  const state = usePlayerState();
  const controls = usePlayerControls();
  const compact = useMediaQuery(NOT_DESKTOP_QUERY);
  const editorRef = useRef<AlphaTexEditorHandle>(null);

  const [loaded, setLoaded] = useState<LoadedTex | null>(null);

  useEffect(() => {
    if (!controls) { return; }
    const timer = setTimeout(() => setLoaded({ tex: text, ...controls.loadTex(text) }), RENDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [controls, text]);

  const diagnostics = loaded?.diagnostics ?? [];
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const isUpdating = !loaded || loaded.tex !== text || state.isRendering;
  const reveal = (d: TexDiagnostic | undefined) => {
    if (d?.start) { editorRef.current?.revealPosition(d.start.line, d.start.col); }
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
