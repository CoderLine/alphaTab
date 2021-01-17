/**
 * Represents the info when the time in the synthesizer changes.
 */
export class PositionChangedEventArgs {
    /**
     * Gets a value indicating whether the position changed because of time seeking.
     */
    public isSeek: boolean;

    /**
     * Gets the current time in milliseconds.
     */
    public readonly currentTime: number;

    /**
     * Gets the length of the played song in milliseconds.
     */
    public readonly endTime: number;

    /**
     * Gets the current time in midi ticks.
     */
    public readonly currentTick: number;

    /**
     * Gets the length of the played song in midi ticks.
     */
    public readonly endTick: number;

    /**
     * Initializes a new instance of the {@link PositionChangedEventArgs} class.
     * @param currentTime The current time.
     * @param endTime The end time.
     * @param currentTick The current tick.
     * @param endTick The end tick.
     * @param isSeek Whether the time was seeked.
     */
    public constructor(currentTime: number, endTime: number, currentTick: number, endTick: number, isSeek:boolean) {
        this.currentTime = currentTime;
        this.endTime = endTime;
        this.currentTick = currentTick;
        this.endTick = endTick;
        this.isSeek = isSeek;
    }
}
