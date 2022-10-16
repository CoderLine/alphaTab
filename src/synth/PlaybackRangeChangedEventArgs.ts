import { PlaybackRange } from '@src/synth/PlaybackRange';

/**
 * Represents the info when the playback range changed.
 */
export class PlaybackRangeChangedEventArgs {
    /**
     * The new playback range.
     */
    public readonly playbackRange: PlaybackRange | null;

    /**
     * Initializes a new instance of the {@link PlaybackRangeChangedEventArgs} class.
     * @param range The range.
     */
    public constructor(playbackRange: PlaybackRange | null) {
        this.playbackRange = playbackRange;
    }
}
