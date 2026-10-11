'use client';

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type { model } from '@coderline/alphatab';
import {
    AlphaTabPlayer,
    useAlphaTabState,
    useAlphaTabControls,
} from '@site/src/alphatab-react';
import {
    IconVolume,
    IconCaret,
    IconExternalLink,
    IconWaveform,
} from '../shared/icons';
import { PlayerShell, PlayerTab } from '../PlayerShell';
import { DEMO_FILES } from './demo-files';
import styles from './styles.module.scss';

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

export const LandingPlayerStage: React.FC = () => (
    <AlphaTabPlayer>
        <LandingPlayerStageInner />
    </AlphaTabPlayer>
);

const LandingPlayerStageInner: React.FC = () => {
    const state = useAlphaTabState();
    const controls = useAlphaTabControls();

    const [activeFileIndex, setActiveFileIndex] = React.useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    const activeFile = DEMO_FILES[activeFileIndex];
    React.useEffect(() => {
        if (!controls) return;
        controls.loadSource(activeFile.source).catch((err) => {
            console.error('[LandingPlayerStage] Failed to load score', err);
        });
    }, [controls, activeFile]);

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

    const renderedTrackIndexes = React.useMemo(
        () => new Set(state.renderedTracks.map((t) => t.index)),
        [state.renderedTracks],
    );
    const onTrackClick = (track: model.Track) => controls?.renderTracks([track]);
    const onFileTabClick = (i: number) => {
        if (i !== activeFileIndex) setActiveFileIndex(i);
    };

    const tabs = (
        <>
            {DEMO_FILES.map((f, i) => (
                <PlayerTab
                    key={i}
                    active={i === activeFileIndex}
                    onClick={() => onFileTabClick(i)}
                    color={f.trackColor}
                    className={clsx(i >= 3 && styles.fileTabHideOnTablet)}
                >
                    <span>{f.label}</span>
                    {f.source.backingTrack && (
                        <IconWaveform size={11} className={styles.fileTabBadge} aria-label="Has a backing track" />
                    )}
                    {i === activeFileIndex && <span className={styles.fileTabClose}>×</span>}
                </PlayerTab>
            ))}
            <span className={styles.fileTabOverflow}>+1</span>
            <span className={styles.fileTabSpacer} />
            <Link to="/docs/playground/playground" className={styles.openLink}>
                <span className={styles.openLinkFull}>Open in Playground</span>
                <span className={styles.openLinkShort}>Playground</span>
                <IconExternalLink size={10} aria-hidden="true" />
            </Link>
        </>
    );

    const sidebar = (
        <>
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
        </>
    );

    const mobileHeader = (
        <>
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
        </>
    );

    const mobileFooter = (
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
    );

    return (
        <PlayerShell
            tabs={tabs}
            sidebar={sidebar}
            sidebarClassName={clsx(styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed)}
            notationMessage={!score && `Loading ${activeFile.label}…`}
            mobileHeader={mobileHeader}
            mobileFooter={mobileFooter}
        />
    );
};
