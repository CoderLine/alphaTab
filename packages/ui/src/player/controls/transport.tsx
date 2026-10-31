import type React from 'react';
import clsx from 'clsx';
import { usePlayerControls, usePlayerState } from '../PlayerProvider';
import { PlaybackStatusLine } from '../playback-settings';
import { Scrubber } from './scrubber';
import { Slider } from '../primitives/flyout-controls';
import { formatTime } from '../../state/format-time';
import {
    IconCountIn,
    IconMetronome,
    IconPause,
    IconPlay,
    IconRepeat,
    IconStop,
    IconVolume,
} from '../icons';
import { IconButton } from '../primitives/icon-button';
import styles from './transport.module.scss';

const SYNTH_ONLY = 'Needs the synthesizer';

export const Transport: React.FC = () => {
    const state = usePlayerState();
    const controls = usePlayerControls();
    const { playback, view } = state;
    const notReady = !playback.isReadyForPlayback;
    const synthOnly = playback.effective !== null && playback.effective !== 'synthesizer' ? SYNTH_ONLY : null;
    const loopHint = state.loopRangeBars
        ? `bars ${state.loopRangeBars.from + 1}–${state.loopRangeBars.to}`
        : 'whole song; drag-select bars to loop a range';

    return (
        <div className={styles.transport}>
            <div className={styles.row}>
                <button
                    type="button"
                    className={clsx(styles.playBtn, notReady && styles.playBtnPreparing)}
                    onClick={() => controls?.playPause()}
                    disabled={notReady}
                    aria-busy={notReady}
                    aria-label={notReady ? 'Preparing playback' : state.isPlaying ? 'Pause' : 'Play'}
                >
                    {state.isPlaying ? <IconPause size={13} aria-hidden="true" /> : <IconPlay size={13} aria-hidden="true" />}
                </button>
                <IconButton label="Stop" onClick={() => controls?.stop()} disabled={notReady}>
                    <IconStop size={12} aria-hidden="true" />
                </IconButton>
                <span className={styles.time}>{formatTime(state.currentTime)}</span>
                <div className={styles.scrubber}>
                    <Scrubber
                        totalBars={state.totalBars > 0 ? state.totalBars : 64}
                        currentBar={state.currentBar}
                        tempoMarkers={state.tempoMarkers}
                        loopRange={state.loopRangeBars}
                        onSeek={(f) => controls?.seekToFraction(f)}
                    />
                </div>
                <span className={styles.time}>{formatTime(state.endTime)}</span>
                <span className={styles.divider} />
                <div className={styles.toggles}>
                    <IconButton
                        label={`Loop: ${loopHint}`}
                        active={view.looping}
                        aria-pressed={view.looping}
                        onClick={() => controls?.setLoopPlayback(!view.looping)}
                    >
                        <IconRepeat size={14} aria-hidden="true" />
                    </IconButton>
                    <IconButton
                        label={synthOnly ? `Count-in: ${synthOnly}` : 'Count-in'}
                        active={view.countIn}
                        aria-pressed={view.countIn}
                        disabled={!!synthOnly}
                        onClick={() => controls?.setCountInVolume(view.countIn ? 0 : 1)}
                    >
                        <IconCountIn size={14} aria-hidden="true" />
                    </IconButton>
                    <IconButton
                        label={synthOnly ? `Metronome: ${synthOnly}` : 'Metronome'}
                        active={view.metronome}
                        aria-pressed={view.metronome}
                        disabled={!!synthOnly}
                        onClick={() => controls?.setMetronomeVolume(view.metronome ? 0 : 1)}
                    >
                        <IconMetronome size={14} aria-hidden="true" />
                    </IconButton>
                </div>
                <div className={styles.volume}>
                    <IconVolume size={12} aria-hidden="true" />
                    <Slider
                        value={Math.round(view.masterVolume * 100)}
                        min={0}
                        max={100}
                        onChange={(v) => controls?.setMasterVolume(v / 100)}
                        label="Volume"
                    />
                </div>
            </div>
            <PlaybackStatusLine playback={playback} onRetry={() => controls?.retryPlayback()} className={styles.status} />
        </div>
    );
};
