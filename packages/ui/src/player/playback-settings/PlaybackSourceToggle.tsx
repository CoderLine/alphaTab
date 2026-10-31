import React from 'react';
import { playbackPreferences, usePlaybackPreferences, type PlaybackSourcePreference } from '../../state/playback';
import { Segmented } from '../primitives/segmented';

const OPTIONS: { v: PlaybackSourcePreference; l: string }[] = [
    { v: 'backingTrackWhenAvailable', l: 'Backing track' },
    { v: 'synthesizer', l: 'Synthesizer' },
];

/** The site-wide playback source preference, wherever it is offered. */
export function PlaybackSourceToggle(): React.ReactElement {
    const preferences = usePlaybackPreferences();
    return (
        <Segmented<PlaybackSourcePreference>
            value={preferences.source}
            onChange={(v) => playbackPreferences.setSource(v)}
            options={OPTIONS}
            label="Playback source (site-wide)"
        />
    );
}
