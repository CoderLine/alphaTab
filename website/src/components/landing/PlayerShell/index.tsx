import React from 'react';
import clsx from 'clsx';
import {
    AlphaTabCanvas,
    useAlphaTabState,
    useAlphaTabControls,
} from '@site/src/alphatab-react';
import { PlaybackStatusLine } from '@site/src/components/PlaybackSettings';
import {
    IconPlay,
    IconPause,
    IconVolume,
    IconSettings,
    IconMaximize,
    IconMinimize,
} from '../shared/icons';
import { formatTime } from '../shared/format-time';
import { PHONE_QUERY, useMediaQuery } from '../shared/use-media-query';
import { Scrubber } from './scrubber';
import { SettingsFlyout, type SettingsFlyoutState, type SettingsFlyoutHandlers } from './settings-flyout';
import { useMaximize } from './use-maximize';
import styles from './styles.module.scss';

const DEFAULT_VOLUME_PCT = 80;

export interface PlayerShellProps {
    /** Tab row attached to the top of the frame (tablet and desktop). */
    tabs?: React.ReactNode;
    /** Left column of the frame (tablet and desktop). */
    sidebar: React.ReactNode;
    /** Sizing and surface of the sidebar column. */
    sidebarClassName?: string;
    /** Bar above the notation, in both layouts. */
    notationHeader?: React.ReactNode;
    /** Centered over the notation, e.g. while a score loads. */
    notationMessage?: React.ReactNode;
    /** Fades the notation, e.g. while it no longer matches its source. */
    notationDimmed?: boolean;
    /** Phone layout: inside the card, above the notation. */
    mobileHeader?: React.ReactNode;
    /** Phone layout: below the card; hidden while maximized. */
    mobileFooter?: React.ReactNode;
    /** The notation canvas (and with it the alphaTab API) is mounted only while `true`. */
    active?: boolean;
}

/**
 * The landing pages' player frame: notation, transport, settings flyout and
 * maximize, with slots for the page-specific content. Must be rendered inside
 * `<AlphaTabPlayer>`.
 */
export const PlayerShell: React.FC<PlayerShellProps> = ({
    tabs,
    sidebar,
    sidebarClassName,
    notationHeader,
    notationMessage,
    notationDimmed = false,
    mobileHeader,
    mobileFooter,
    active = true,
}) => {
    const state = useAlphaTabState();
    const controls = useAlphaTabControls();
    const isPhone = useMediaQuery(PHONE_QUERY);
    const [settingsOpen, setSettingsOpen] = React.useState(false);

    const gearRef = React.useRef<HTMLButtonElement>(null);
    const flyoutRef = React.useRef<HTMLDivElement>(null);
    const slotRef = React.useRef<HTMLDivElement>(null);
    const stageRef = React.useRef<HTMLDivElement>(null);

    const maximize = useMaximize({
        slotRef,
        stageRef,
        getCanvas: () => stageRef.current?.querySelector<HTMLElement>(`.${styles.notationCanvas}`) ?? null,
    });

    React.useEffect(() => {
        if (!maximize.isMaximized || settingsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') maximize.collapse();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [maximize.isMaximized, maximize.collapse, settingsOpen]);

    React.useEffect(() => {
        if (!controls) return;
        controls.setMasterVolume(DEFAULT_VOLUME_PCT / 100);
    }, [controls]);

    const { playback, view } = state;

    React.useEffect(() => {
        if (!settingsOpen) return;
        // The flyout opens upward from the transport bar and can start above the viewport.
        const frame = requestAnimationFrame(() => {
            flyoutRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (flyoutRef.current?.contains(t) || gearRef.current?.contains(t)) return;
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
        layoutMode: view.layoutMode,
        staveProfile: view.staveProfile,
        zoomPct: Math.round(view.scale * 100),
        masterVolumePct: Math.round(view.masterVolume * 100),
        tempoPct: Math.round(view.playbackSpeed * 100),
        transposeSt: view.transpose,
        countIn: view.countIn,
        metronome: view.metronome,
        highlightCursor: view.highlight,
        loop: view.looping,
        // `to` is exclusive (alphaTab's endTick = start-of-next-bar), so display it as the last-inclusive musical bar without a +1.
        loopHint: state.loopRangeBars ? `m.${state.loopRangeBars.from + 1}–${state.loopRangeBars.to}` : null,
        playback,
    };

    const flyoutHandlers: SettingsFlyoutHandlers = {
        setLayoutMode: (m) => controls?.setLayoutMode(m),
        setStaveProfile: (p) => controls?.setStaveProfile(p),
        setZoomPct: (v) => controls?.setScale(v / 100),
        setMasterVolumePct: (v) => controls?.setMasterVolume(v / 100),
        setTempoPct: (v) => controls?.setPlaybackSpeed(v / 100),
        setTransposeSt: (v) => controls?.setTransposeAllTracks(v),
        setCountIn: (b) => controls?.setCountInVolume(b ? 1 : 0),
        setMetronome: (b) => controls?.setMetronomeVolume(b ? 1 : 0),
        setHighlightCursor: (b) => controls?.setEnableHighlight(b),
        // The range itself comes from drag-selecting on the score, not from this toggle.
        setLoop: (b) => controls?.setLoopPlayback(b),
        onReset: () => {
            if (!controls) return;
            controls.resetSettings();
            controls.setMasterVolume(DEFAULT_VOLUME_PCT / 100);
        },
    };

    const onSeekFraction = (f: number) => controls?.seekToFraction(f);
    const playDisabled = !playback.isReadyForPlayback;
    const playLabel = playDisabled ? 'Preparing playback' : state.isPlaying ? 'Pause' : 'Play';
    const totalBarsForScrubber = state.totalBars > 0 ? state.totalBars : 64;
    const maximizeLabel = maximize.isMaximized ? 'Exit full page' : 'Maximize player';

    const notation = (
        <>
            {notationHeader}
            <div className={clsx(isPhone ? styles.mobileNotation : styles.notationArea, notationDimmed && styles.notationDimmed)}>
                {active && <AlphaTabCanvas className={styles.notationCanvas} />}
                {notationMessage && (
                    <div className={styles.notationMessage} aria-hidden="true">{notationMessage}</div>
                )}
            </div>
        </>
    );

    const playButton = (
        <button
            type="button"
            className={clsx(isPhone ? styles.mobilePlayBtn : styles.playBtn, playDisabled && styles.playBtnPreparing)}
            onClick={() => controls?.playPause()}
            disabled={playDisabled}
            aria-busy={playDisabled}
            aria-label={playLabel}
        >
            {state.isPlaying ? <IconPause size={13} aria-hidden="true" /> : <IconPlay size={13} aria-hidden="true" />}
        </button>
    );

    const toolButtons = (
        <>
            <button
                ref={gearRef}
                type="button"
                onClick={() => setSettingsOpen((s) => !s)}
                className={clsx(isPhone ? styles.mobileGearBtn : styles.gearBtn, settingsOpen && styles.gearBtnOpen)}
                aria-label="Player settings"
                aria-expanded={settingsOpen}
            >
                <IconSettings size={14} aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={maximize.toggle}
                className={isPhone ? styles.mobileGearBtn : styles.gearBtn}
                aria-label={maximizeLabel}
                title={maximizeLabel}
            >
                {maximize.isMaximized ? <IconMinimize size={14} aria-hidden="true" /> : <IconMaximize size={14} aria-hidden="true" />}
            </button>
        </>
    );

    const flyout = settingsOpen && (
        <div className={isPhone ? styles.mobileFlyoutWrap : styles.flyoutWrap}>
            <SettingsFlyout
                ref={flyoutRef}
                onClose={() => setSettingsOpen(false)}
                state={flyoutState}
                handlers={flyoutHandlers}
            />
        </div>
    );

    const statusLine = (
        <PlaybackStatusLine
            playback={playback}
            onRetry={() => controls?.retryPlayback()}
            className={isPhone ? styles.mobileStatusRow : styles.statusRow}
        />
    );

    return (
        <div ref={slotRef}>
            <div ref={stageRef} className={clsx(styles.stage, maximize.isMaximized && styles.stageMaximized)}>
                {isPhone ? (
                    <div className={styles.mobileLayout}>
                        <div className={styles.mobileCardWrap}>
                            <div className={styles.mobileCard}>
                                {mobileHeader}
                                {notation}
                                <div className={styles.mobilePlayBar}>
                                    {playButton}
                                    <span className={styles.timeLabel}>{formatTime(state.currentTime)}</span>
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
                                    <span className={styles.timeLabel}>{formatTime(state.endTime)}</span>
                                    {toolButtons}
                                </div>
                                {statusLine}
                            </div>
                            {flyout}
                        </div>
                        {mobileFooter && <div className={styles.mobileFooter}>{mobileFooter}</div>}
                    </div>
                ) : (
                    <div className={styles.desktopLayout}>
                        {tabs && <div className={styles.tabRow}>{tabs}</div>}
                        <div className={clsx(styles.frame, tabs && styles.frameWithTabs)}>
                            <aside className={clsx(styles.sidebar, sidebarClassName)}>{sidebar}</aside>
                            <div className={styles.viewport}>
                                {notation}
                                <div className={styles.timeline}>
                                    {playButton}
                                    <span className={styles.timeLabel}>{formatTime(state.currentTime)}</span>
                                    <div className={styles.scrubber}>
                                        <Scrubber
                                            totalBars={totalBarsForScrubber}
                                            currentBar={state.currentBar}
                                            tempoMarkers={state.tempoMarkers}
                                            loopRange={state.loopRangeBars}
                                            onSeek={onSeekFraction}
                                        />
                                    </div>
                                    <span className={styles.timeLabel}>{formatTime(state.endTime)}</span>
                                    <span className={styles.timelineDivider} />
                                    <span className={styles.volumeLabel}>
                                        <IconVolume size={11} aria-hidden="true" /> {flyoutState.masterVolumePct}
                                    </span>
                                    {toolButtons}
                                </div>
                                {statusLine}
                            </div>
                        </div>
                        {flyout}
                    </div>
                )}
            </div>
        </div>
    );
};

interface PlayerTabProps {
    active: boolean;
    onClick: () => void;
    /** Dot color; defaults to the muted ink. */
    color?: string;
    title?: string;
    className?: string;
    children: React.ReactNode;
}

/** A file-style tab for the shell's `tabs` row. */
export const PlayerTab: React.FC<PlayerTabProps> = ({ active, onClick, color, title, className, children }) => (
    <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        title={title}
        className={clsx(styles.tab, active && styles.tabActive, className)}
        style={color ? ({ '--tab-color': color } as React.CSSProperties) : undefined}
    >
        <span className={styles.tabDot} />
        {children}
    </button>
);
