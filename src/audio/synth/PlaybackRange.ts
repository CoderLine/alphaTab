/**
 * Represents a range of the song that should be played.
 */
export class PlaybackRange {
    /**
     * The position in midi ticks from where the song should start.
     */
    public startTick: number = 0;

    /**
     * The position in midi ticks to where the song should be played.
     */
    public endTick: number = 0;
}
