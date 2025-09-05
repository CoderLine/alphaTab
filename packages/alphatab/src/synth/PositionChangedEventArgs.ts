/**
 * Represents the info when the time in the synthesizer changes.
 */
export class PositionChangedEventArgs {
    /**
     * The current time position within the song in milliseconds.
     */
    public readonly currentTime: number;

    /**
     * The total length of the song in milliseconds.
     */
    public readonly endTime: number;

    /**
     * The current time position within the song in midi ticks.
     */
    public readonly currentTick: number;

    /**
     * The total length of the song in midi ticks.
     */
    public readonly endTick: number;

    /**
     * Whether the position changed because of time seeking.
     * @since 1.2.0
     */
    public isSeek: boolean;

    /**
     * The original tempo in which alphaTab internally would be playing right now.
     */
    public originalTempo: number = 0;

    /**
     * The modified tempo in which the actual playback is happening (e.g. due to playback speed or external audio synchronization)
     */
    public modifiedTempo: number = 0;

    /**
     * Initializes a new instance of the {@link PositionChangedEventArgs} class.
     * @param currentTime The current time.
     * @param endTime The end time.
     * @param currentTick The current tick.
     * @param endTick The end tick.
     * @param isSeek Whether the time was seeked.
     */
    public constructor(
        currentTime: number,
        endTime: number,
        currentTick: number,
        endTick: number,
        isSeek: boolean,
        originalTempo: number,
        modifiedTempo: number
    ) {
        this.currentTime = currentTime;
        this.endTime = endTime;
        this.currentTick = currentTick;
        this.endTick = endTick;
        this.isSeek = isSeek;
        this.originalTempo = originalTempo;
        this.modifiedTempo = modifiedTempo;
    }
}
