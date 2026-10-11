'use client';

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type { model } from '@coderline/alphatab';
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabState,
    useAlphaTabControls,
    type LayoutModeKey,
    type StaveProfileKey,
} from '@site/src/alphatab-react';
import { PlaybackStatusLine } from '@site/src/components/PlaybackSettings';
import {
    IconPlay,
    IconPause,
    IconVolume,
    IconSettings,
    IconCaret,
    IconExternalLink,
    IconWaveform,
} from '../shared/icons';
import { Scrubber } from './scrubber';
import { SettingsFlyout, type SettingsFlyoutState, type SettingsFlyoutHandlers } from './settings-flyout';
import { DEMO_FILES } from './demo-files';
import styles from './styles.module.scss';

const DEFAULT_VOLUME_PCT = 80;

const TRACK_COLORS = [
    'var(--at-accent)',
    'var(--at-track-purple)',
    'var(--at-track-green)',
    'var(--at-track-orange)',
];

const MAJOR_KEY_NAMES: Record<number, string> = {
    [-7]: 'Cb', [-6]: 'Gb', [-5]: 'Db', [-4]: 'Ab', [-3]: 'Eb', [-2]: 'Bb', [-1]: 'F',
    0: 'C',
    1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#',
};
const MINOR_KEY_NAMES: Record<number, string> = {
    [-7]: 'Ab', [-6]: 'Eb', [-5]: 'Bb', [-4]: 'F', [-3]: 'C', [-2]: 'G', [-1]: 'D',
    0: 'A',
    1: 'E', 2: 'B', 3: 'F#', 4: 'C#', 5: 'G#', 6: 'D#', 7: 'A#',
};
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function formatTime(ms: number): string {
    if (!Number.isFinite(ms) || ms <= 0) return '00:00';
    const total = Math.floor(ms / 1000);
    const mm = Math.floor(total / 60).toString().padStart(2, '0');
    const ss = (total % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
}

function formatKey(score: model.Score | null): string {
    const mb = score?.masterBars[0];
    if (!mb) return '—';
    const k = mb.keySignature as unknown as number;
    const type = mb.keySignatureType as unknown as number;
    const isMinor = type === 1;
    const name = (isMinor ? MINOR_KEY_NAMES : MAJOR_KEY_NAMES)[k];
    if (!name) return '—';
    return `${name} ${isMinor ? 'minor' : 'major'}`;
}

function formatTuning(track: model.Track | undefined): string {
    const tuning = track?.staves[0]?.tuning;
    if (!tuning || tuning.length === 0) return '—';
    return tuning.slice().reverse().map((p) => PITCH_CLASSES[((p % 12) + 12) % 12]).join(' ');
}

function formatCapo(track: model.Track | undefined): string {
    const capo = track?.staves[0]?.capo ?? 0;
    return capo > 0 ? String(capo) : '—';
}

function trackColor(index: number): string {
    return TRACK_COLORS[index % TRACK_COLORS.length];
}

function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia('(max-width: 640px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return isMobile;
}

export const LandingPlayerStage: React.FC = () => (
    <AlphaTabPlayer>
        <LandingPlayerStageInner />
    </AlphaTabPlayer>
);

const LandingPlayerStageInner: React.FC = () => {
    const state = useAlphaTabState();
    const controls = useAlphaTabControls();

    const isMobile = useIsMobile();
    const [activeFileIndex, setActiveFileIndex] = React.useState(0);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    const [layoutMode, setLayoutModeLocal] = React.useState<LayoutModeKey>('page');
    const [staveProfile, setStaveProfileLocal] = React.useState<StaveProfileKey>('scoreTab');
    const [zoomPct, setZoomPctLocal] = React.useState(100);
    const [masterVolumePct, setMasterVolumePctLocal] = React.useState(DEFAULT_VOLUME_PCT);
    const [tempoPct, setTempoPctLocal] = React.useState(100);
    const [transposeSt, setTransposeStLocal] = React.useState(0);
    const [countIn, setCountInLocal] = React.useState(false);
    const [metronome, setMetronomeLocal] = React.useState(false);
    const [highlightCursor, setHighlightCursorLocal] = React.useState(true);
    const [loop, setLoopLocal] = React.useState(false);

    const gearRef = React.useRef<HTMLButtonElement>(null);
    const flyoutRef = React.useRef<HTMLDivElement>(null);
    const mobileGearRef = React.useRef<HTMLButtonElement>(null);
    const mobileFlyoutRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!controls) return;
        controls.setMasterVolume(DEFAULT_VOLUME_PCT / 100);
    }, [controls]);

    const activeFile = DEMO_FILES[activeFileIndex];
    React.useEffect(() => {
        if (!controls) return;
        controls.loadSource(activeFile.source).catch((err) => {
            console.error('[LandingPlayerStage] Failed to load score', err);
        });
    }, [controls, activeFile]);

    // Channel transposition lives in the synthesizer instance and is lost when the player is rebuilt.
    const { playback } = state;
    React.useEffect(() => {
        if (playback.effective === 'synthesizer' && playback.isReadyForPlayback && transposeSt !== 0) {
            controls?.setTransposeAllTracks(transposeSt);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls, playback.effective, playback.isReadyForPlayback]);

    React.useEffect(() => {
        if (!settingsOpen) return;
        // The flyout opens upward from the transport bar and can start above the viewport.
        const frame = requestAnimationFrame(() => {
            (flyoutRef.current ?? mobileFlyoutRef.current)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (flyoutRef.current?.contains(t) || mobileFlyoutRef.current?.contains(t)) return;
            if (gearRef.current?.contains(t) || mobileGearRef.current?.contains(t)) return;
            setSettingsOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSettingsOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [settingsOpen]);

    const flyoutState: SettingsFlyoutState = {
        layoutMode, staveProfile, zoomPct, masterVolumePct, tempoPct,
        transposeSt, countIn, metronome, highlightCursor, loop,
        // `to` is exclusive (alphaTab's endTick = start-of-next-bar), so display it as the last-inclusive musical bar without a +1.
        loopHint: state.loopRangeBars ? `m.${state.loopRangeBars.from + 1}–${state.loopRangeBars.to}` : null,
        playback,
    };

    const flyoutHandlers: SettingsFlyoutHandlers = {
        setLayoutMode: (m) => { setLayoutModeLocal(m); controls?.setLayoutMode(m); },
        setStaveProfile: (p) => { setStaveProfileLocal(p); controls?.setStaveProfile(p); },
        setZoomPct: (v) => { setZoomPctLocal(v); controls?.setScale(v / 100); },
        setMasterVolumePct: (v) => { setMasterVolumePctLocal(v); controls?.setMasterVolume(v / 100); },
        setTempoPct: (v) => { setTempoPctLocal(v); controls?.setPlaybackSpeed(v / 100); },
        setTransposeSt: (v) => { setTransposeStLocal(v); controls?.setTransposeAllTracks(v); },
        setCountIn: (b) => { setCountInLocal(b); controls?.setCountInVolume(b ? 1 : 0); },
        setMetronome: (b) => { setMetronomeLocal(b); controls?.setMetronomeVolume(b ? 1 : 0); },
        setHighlightCursor: (b) => { setHighlightCursorLocal(b); controls?.setEnableHighlight(b); },
        setLoop: (b) => {
            setLoopLocal(b);
            controls?.setLoopPlayback(b);
            // Range comes from user drag-select on the score, not this toggle.
        },
        onReset: () => {
            if (!controls) return;
            controls.resetSettings();
            setLayoutModeLocal('page');
            setStaveProfileLocal('scoreTab');
            setZoomPctLocal(100);
            setMasterVolumePctLocal(DEFAULT_VOLUME_PCT);
            controls.setMasterVolume(DEFAULT_VOLUME_PCT / 100);
            setTempoPctLocal(100);
            setTransposeStLocal(0);
            setCountInLocal(false);
            setMetronomeLocal(false);
            setHighlightCursorLocal(true);
            controls.setEnableHighlight(true);
            setLoopLocal(false);
        },
    };

    const score = state.currentScore;
    const scoreTitle = score?.title?.trim() || activeFile.label;
    const scoreArtist = score?.artist?.trim() || '';
    const firstBar = score?.masterBars[0];
    const timeSignature = firstBar
        ? `${firstBar.timeSignatureNumerator}/${firstBar.timeSignatureDenominator}`
        : '4/4';
    const keyText = formatKey(score);
    const firstTrack = score?.tracks[0];
    const tuningStr = formatTuning(firstTrack);
    const capoStr = formatCapo(firstTrack);

    const showSkeleton = !score;
    const onSeekFraction = (f: number) => controls?.seekToFraction(f);
    const renderedTrackIndexes = React.useMemo(
        () => new Set(state.renderedTracks.map((t) => t.index)),
        [state.renderedTracks],
    );
    const onTrackClick = (track: model.Track) => controls?.renderTracks([track]);
    const onFileTabClick = (i: number) => {
        if (i !== activeFileIndex) setActiveFileIndex(i);
    };

    const playDisabled = !playback.isReadyForPlayback;
    const playLabel = playDisabled ? 'Preparing playback' : state.isPlaying ? 'Pause' : 'Play';

    const currentTimeLabel = formatTime(state.currentTime);
    const endTimeLabel = formatTime(state.endTime);
    const totalBarsForScrubber = state.totalBars > 0 ? state.totalBars : 64;

    return (
        <div className={styles.stage}>
            {!isMobile && (
            <div className={styles.desktopOnly}>
                <div className={styles.fileTabRow}>
                    {DEMO_FILES.map((f, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onFileTabClick(i)}
                            className={clsx(
                                styles.fileTab,
                                i === activeFileIndex && styles.fileTabActive,
                                i >= 3 && styles.fileTabHideOnTablet,
                            )}
                            style={{ '--tab-color': f.trackColor } as React.CSSProperties}
                        >
                            <span className={styles.fileTabDot} />
                            <span className={styles.fileTabName}>{f.label}</span>
                            {f.source.backingTrack && (
                                <IconWaveform size={11} className={styles.fileTabBadge} aria-label="Has a backing track" />
                            )}
                            {i === activeFileIndex && <span className={styles.fileTabClose}>×</span>}
                        </button>
                    ))}
                    <span className={styles.fileTabOverflow}>+1</span>
                    <span className={styles.fileTabSpacer} />
                    <Link to="/docs/playground/playground" className={styles.openLink}>
                        <span className={styles.openLinkFull}>Open in Playground</span>
                        <span className={styles.openLinkShort}>Playground</span>
                        <IconExternalLink size={10} aria-hidden="true" />
                    </Link>
                </div>

                <div className={styles.frame}>
                    <aside className={clsx(styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed)}>
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarHeader}>
                                <span className={clsx(styles.sidebarLabel, styles.expandedOnly)}>Score</span>
                                <button
                                    type="button"
                                    className={styles.sidebarToggle}
                                    onClick={() => setSidebarCollapsed((v) => !v)}
                                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                    aria-expanded={!sidebarCollapsed}
                                >
                                    <IconCaret size={10} className={styles.sidebarToggleIcon} aria-hidden="true" />
                                </button>
                            </div>
                            <div className={styles.expandedOnly}>
                                <div className={styles.scoreTitle}>{scoreTitle}</div>
                                {scoreArtist && <div className={styles.scoreMeta}>{scoreArtist}</div>}
                            </div>
                        </div>

                        <div className={styles.sidebarSection}>
                            <div className={clsx(styles.sidebarLabel, styles.expandedOnly)}>Tracks</div>
                            {state.tracks.map((tr, i) => {
                                const active = renderedTrackIndexes.has(tr.index);
                                return (
                                    <button
                                        key={tr.index}
                                        type="button"
                                        onClick={() => onTrackClick(tr)}
                                        className={clsx(
                                            styles.trackRow,
                                            active && styles.trackRowActive,
                                            sidebarCollapsed && styles.trackRowCollapsed,
                                        )}
                                        style={{ '--track-color': trackColor(i) } as React.CSSProperties}
                                        title={sidebarCollapsed ? tr.name : undefined}
                                    >
                                        <span className={styles.trackDot} />
                                        <span className={styles.trackName}>{tr.name}</span>
                                        <span className={styles.trackSpacer} />
                                        {active && <IconVolume size={11} aria-hidden="true" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className={clsx(styles.sidebarSection, styles.expandedOnly)}>
                            <div className={styles.sidebarLabel}>Score details</div>
                            <dl className={styles.detailsList}>
                                <div className={styles.detailRow}>
                                    <dt>Time</dt>
                                    <dd>{timeSignature}</dd>
                                </div>
                                <div className={styles.detailRow}>
                                    <dt>Key</dt>
                                    <dd>{keyText}</dd>
                                </div>
                                <div className={styles.detailRow}>
                                    <dt>Tuning</dt>
                                    <dd className={styles.tuning}>{tuningStr}</dd>
                                </div>
                                <div className={styles.detailRow}>
                                    <dt>Capo</dt>
                                    <dd className={capoStr === '—' ? styles.dim : undefined}>{capoStr}</dd>
                                </div>
                            </dl>
                        </div>
                    </aside>

                    <div className={styles.viewport}>
                        <div className={styles.notationArea}>
                            <AlphaTabCanvas className={styles.notationCanvas} />
                            {showSkeleton && (
                                <div className={styles.notationSkeleton} aria-hidden="true">
                                    Loading {activeFile.label}…
                                </div>
                            )}
                        </div>

                        <div className={styles.timeline}>
                            <button
                                type="button"
                                className={clsx(styles.playBtn, playDisabled && styles.playBtnPreparing)}
                                onClick={() => controls?.playPause()}
                                disabled={playDisabled}
                                aria-busy={playDisabled}
                                aria-label={playLabel}
                            >
                                {state.isPlaying
                                    ? <IconPause size={13} aria-hidden="true" />
                                    : <IconPlay size={13} aria-hidden="true" />}
                            </button>
                            <span className={styles.timeLabel}>{currentTimeLabel}</span>
                            <div className={styles.scrubber}>
                                <Scrubber
                                    totalBars={totalBarsForScrubber}
                                    currentBar={state.currentBar}
                                    tempoMarkers={state.tempoMarkers}
                                    loopRange={state.loopRangeBars}
                                    onSeek={onSeekFraction}
                                />
                            </div>
                            <span className={styles.timeLabel}>{endTimeLabel}</span>
                            <span className={styles.timelineDivider} />
                            <span className={styles.volumeLabel}>
                                <IconVolume size={11} aria-hidden="true" /> {masterVolumePct}
                            </span>
                            <button
                                ref={gearRef}
                                type="button"
                                onClick={() => setSettingsOpen((s) => !s)}
                                className={clsx(styles.gearBtn, settingsOpen && styles.gearBtnOpen)}
                                aria-label="Player settings"
                                aria-expanded={settingsOpen}
                            >
                                <IconSettings size={14} aria-hidden="true" />
                            </button>
                        </div>
                        <PlaybackStatusLine
                            playback={playback}
                            onRetry={() => controls?.retryPlayback()}
                            className={styles.statusRow}
                        />
                    </div>
                </div>

                {settingsOpen && (
                    <div className={styles.flyoutWrap}>
                        <SettingsFlyout
                            ref={flyoutRef}
                            onClose={() => setSettingsOpen(false)}
                            state={flyoutState}
                            handlers={flyoutHandlers}
                        />
                    </div>
                )}
            </div>

            )}

            {isMobile && (
            <div className={styles.mobileOnly}>
                <div className={styles.mobileCard}>
                    <div className={styles.mobileFileBar}>
                        <span className={styles.mobileFileDot} style={{ background: activeFile.trackColor }} />
                        <span className={styles.mobileFileName}>{activeFile.label}</span>
                        {activeFile.source.backingTrack && (
                            <IconWaveform size={11} className={styles.fileTabBadge} aria-label="Has a backing track" />
                        )}
                        <IconCaret size={10} aria-hidden="true" />
                        <span className={styles.mobileFileSpacer} />
                        <span className={styles.mobileFileCount}>
                            {activeFileIndex + 1} of {DEMO_FILES.length}
                        </span>
                    </div>

                    <div className={styles.mobileTrackBar}>
                        {state.tracks.map((tr, i) => {
                            const active = renderedTrackIndexes.has(tr.index);
                            return (
                                <button
                                    key={tr.index}
                                    type="button"
                                    onClick={() => onTrackClick(tr)}
                                    className={clsx(styles.mobileTrackPill, active && styles.mobileTrackPillActive)}
                                    style={{ '--track-color': trackColor(i) } as React.CSSProperties}
                                >
                                    <span className={styles.mobileTrackDot} />
                                    {tr.name}
                                    {active && <IconVolume size={10} aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.mobileNotation}>
                        <AlphaTabCanvas className={styles.notationCanvas} />
                        {showSkeleton && (
                            <div className={styles.notationSkeleton} aria-hidden="true">
                                Loading {activeFile.label}…
                            </div>
                        )}
                    </div>

                    <div className={styles.mobilePlayBar}>
                        <button
                            type="button"
                            className={clsx(styles.mobilePlayBtn, playDisabled && styles.playBtnPreparing)}
                            onClick={() => controls?.playPause()}
                            disabled={playDisabled}
                            aria-busy={playDisabled}
                            aria-label={playLabel}
                        >
                            {state.isPlaying
                                ? <IconPause size={13} aria-hidden="true" />
                                : <IconPlay size={13} aria-hidden="true" />}
                        </button>
                        <span className={styles.timeLabel}>{currentTimeLabel}</span>
                        <div className={styles.mobileScrubber}>
                            <Scrubber
                                totalBars={totalBarsForScrubber}
                                currentBar={state.currentBar}
                                tempoMarkers={state.tempoMarkers}
                                loopRange={state.loopRangeBars}
                                onSeek={onSeekFraction}
                                compact
                            />
                        </div>
                        <span className={styles.timeLabel}>{endTimeLabel}</span>
                        <button
                            ref={mobileGearRef}
                            type="button"
                            onClick={() => setSettingsOpen((s) => !s)}
                            className={clsx(styles.mobileGearBtn, settingsOpen && styles.mobileGearBtnOpen)}
                            aria-label="Player settings"
                            aria-expanded={settingsOpen}
                        >
                            <IconSettings size={14} aria-hidden="true" />
                        </button>
                    </div>
                    <PlaybackStatusLine
                        playback={playback}
                        onRetry={() => controls?.retryPlayback()}
                        className={styles.mobileStatusRow}
                    />
                </div>

                <div className={styles.mobileScoreCard}>
                    <div className={styles.mobileScoreHeader}>
                        <span className={styles.mobileScoreTitle}>{scoreTitle}</span>
                        {scoreArtist && <span className={styles.mobileScoreMeta}>{scoreArtist}</span>}
                    </div>
                    <dl className={styles.mobileDetailsList}>
                        <div className={styles.detailRow}>
                            <dt>time · key</dt>
                            <dd>{timeSignature} · {keyText}</dd>
                        </div>
                        <div className={styles.detailRow}>
                            <dt>tuning</dt>
                            <dd className={styles.tuning}>{tuningStr}</dd>
                        </div>
                        <div className={styles.detailRow}>
                            <dt>capo</dt>
                            <dd className={capoStr === '—' ? styles.dim : undefined}>{capoStr}</dd>
                        </div>
                    </dl>
                </div>

                {settingsOpen && (
                    <div className={styles.mobileFlyoutWrap}>
                        <SettingsFlyout
                            ref={mobileFlyoutRef}
                            onClose={() => setSettingsOpen(false)}
                            state={flyoutState}
                            handlers={flyoutHandlers}
                        />
                    </div>
                )}
            </div>
            )}
        </div>
    );
};
