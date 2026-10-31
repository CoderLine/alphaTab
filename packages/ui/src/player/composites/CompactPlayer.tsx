import clsx from 'clsx';
import type React from 'react';
import { formatTime } from '../../state/format';
import { Scrubber } from '../controls/scrubber';
import { IconPause, IconPlay } from '../icons';
import { PlayerHost, PlayerProvider, type PlayerProviderProps, usePlayerControls, usePlayerState } from '../PlayerProvider';
import { PlaybackStatusLine } from '../playback-settings/PlaybackStatusLine';
import styles from './compact-player.module.scss';

export interface CompactPlayerProps extends Omit<PlayerProviderProps, 'children'> {
    className?: string;
    /** Class of the element the score renders into, e.g. to bound its height. */
    scoreClassName?: string;
    /** Draggable handles on the selected playback range. */
    withSelectionHandles?: boolean;
}

function CompactTransport() {
    const state = usePlayerState();
    const controls = usePlayerControls();
    const notReady = !state.playback.isReadyForPlayback;
    return (
        <>
            <div className={styles.transport}>
                <button
                    type="button"
                    className={styles.play}
                    onClick={() => controls?.playPause()}
                    disabled={notReady}
                    aria-busy={notReady}
                    aria-label={notReady ? 'Preparing playback' : state.isPlaying ? 'Pause' : 'Play'}>
                    {state.isPlaying ? <IconPause size={12} aria-hidden="true" /> : <IconPlay size={12} aria-hidden="true" />}
                </button>
                <span className={styles.time}>{formatTime(state.currentTime)}</span>
                <div className={styles.scrubber}>
                    <Scrubber
                        compact
                        totalBars={state.totalBars > 0 ? state.totalBars : 64}
                        currentBar={state.currentBar}
                        loopRange={state.loopRangeBars}
                        onSeek={f => controls?.seekToFraction(f)}
                        onSeekBar={b => controls?.seekToBar(b)}
                    />
                </div>
                <span className={styles.time}>{formatTime(state.endTime)}</span>
            </div>
            <PlaybackStatusLine
                playback={state.playback}
                onRetry={() => controls?.retryPlayback()}
                className={styles.status}
            />
        </>
    );
}

/**
 * A score with a single-line transport (play, position, scrubber, duration) for embedding in
 * documents. With `player={false}` only the score renders.
 */
export const CompactPlayer: React.FC<CompactPlayerProps> = ({
    className,
    scoreClassName,
    withSelectionHandles,
    ...playerProps
}) => (
    <PlayerProvider {...playerProps}>
        <div className={clsx(styles.player, className)}>
            {playerProps.player !== false && <CompactTransport />}
            <PlayerHost className={scoreClassName} withSelectionHandles={withSelectionHandles} />
        </div>
    </PlayerProvider>
);
