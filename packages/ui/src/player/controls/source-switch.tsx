import React from 'react';
import clsx from 'clsx';
import { playbackPreferences, usePlaybackPreferences, type PlaybackSourcePreference, type PlaybackState } from '../../state/playback';
import { IconWaveform } from '../icons';
import styles from './source-switch.module.scss';

interface SourceSwitchProps {
    playback: PlaybackState;
    /** Icon-only toggle for the phone play bar. */
    compact?: boolean;
}

const NO_BACKING_TRACK = 'This file has no backing track';
const SITE_WIDE = 'Applies to every player on this site';

/**
 * What the player plays right now, backing track or synthesizer, as a switch over the site-wide
 * source preference. Briefly highlights itself when the source changes without the user picking
 * it, e.g. on opening a file without a backing track.
 */
export const SourceSwitch: React.FC<SourceSwitchProps> = ({ playback, compact = false }) => {
    const preferences = usePlaybackPreferences();
    const available = playback.hasBackingTrack;
    const source = playback.target ?? playback.effective;
    const onBackingTrack = source ? source === 'backingTrack' : available && preferences.source === 'backingTrackWhenAvailable';
    const preparing = playback.preparing?.kind === 'backingTrack';

    const picked = React.useRef(false);
    const [flash, setFlash] = React.useState(false);
    const previous = React.useRef(onBackingTrack);
    React.useEffect(() => {
        if (previous.current === onBackingTrack) { return; }
        previous.current = onBackingTrack;
        if (picked.current) {
            picked.current = false;
            return;
        }
        setFlash(true);
    }, [onBackingTrack]);
    React.useEffect(() => {
        if (!flash) { return; }
        const timer = window.setTimeout(() => setFlash(false), 1600);
        return () => window.clearTimeout(timer);
    }, [flash]);

    const pick = (v: PlaybackSourcePreference) => {
        if (v === preferences.source) { return; }
        picked.current = true;
        playbackPreferences.setSource(v);
    };

    if (compact) {
        const label = !available ? NO_BACKING_TRACK : onBackingTrack ? 'Playing the backing track, switch to the synthesizer' : 'Playing the synthesizer, switch to the backing track';
        return (
            <button
                type="button"
                className={clsx(styles.toggle, onBackingTrack && styles.toggleOn, flash && styles.flash)}
                onClick={() => pick(onBackingTrack ? 'synthesizer' : 'backingTrackWhenAvailable')}
                disabled={!available}
                aria-pressed={onBackingTrack}
                aria-label={label}
                title={label}
            >
                <IconWaveform size={14} aria-hidden="true" />
            </button>
        );
    }

    return (
        <div className={clsx(styles.switch, flash && styles.flash)} role="group" aria-label="Playback source">
            <button
                type="button"
                className={clsx(styles.segment, onBackingTrack && styles.segmentActive)}
                onClick={() => pick('backingTrackWhenAvailable')}
                disabled={!available}
                aria-pressed={onBackingTrack}
                title={available ? SITE_WIDE : NO_BACKING_TRACK}
            >
                <span className={clsx(styles.dot, onBackingTrack && styles.dotLive, preparing && styles.dotPreparing)} aria-hidden="true" />
                Backing track
            </button>
            <button
                type="button"
                className={clsx(styles.segment, !onBackingTrack && styles.segmentActive)}
                // Without a backing track this segment only reports the source; picking it must not change the preference.
                onClick={() => available && pick('synthesizer')}
                aria-pressed={!onBackingTrack}
                title={available ? SITE_WIDE : `${NO_BACKING_TRACK}, it always plays the synthesizer`}
            >
                Synth
            </button>
        </div>
    );
};
