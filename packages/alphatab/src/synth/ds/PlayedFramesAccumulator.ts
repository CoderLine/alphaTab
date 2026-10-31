/**
 * Collects the frames played per audio render quantum and decides when they are reported to the synthesizer.
 * @internal
 */
export class PlayedFramesAccumulator {
    /**
     * The value returned by {@link add} and {@link flush} when nothing is to be reported.
     */
    public static readonly NothingToReport: number = -1;

    private readonly _intervalFrames: number;
    private _renderedFrames: number = 0;
    private _playedFrames: number = 0;

    /**
     * @param intervalFrames The number of rendered frames after which the played frames are reported.
     * With 0 every quantum is reported, including quanta without played frames.
     */
    public constructor(intervalFrames: number) {
        this._intervalFrames = intervalFrames;
    }

    /**
     * Adds one render quantum.
     * @param renderedFrames The frames rendered in this quantum.
     * @param playedFrames The frames of it which were filled with synthesized audio.
     * @returns The played frames to report, or {@link NothingToReport}.
     * Reports are due once the interval elapsed, and immediately when the quantum was not filled completely.
     */
    public add(renderedFrames: number, playedFrames: number): number {
        this._renderedFrames += renderedFrames;
        this._playedFrames += playedFrames;
        if (this._intervalFrames <= 0) {
            return this.flush();
        }
        if (this._renderedFrames < this._intervalFrames && playedFrames === renderedFrames) {
            return PlayedFramesAccumulator.NothingToReport;
        }
        const played = this.flush();
        return played > 0 ? played : PlayedFramesAccumulator.NothingToReport;
    }

    /**
     * Ends the current interval.
     * @returns The played frames which were not reported yet.
     */
    public flush(): number {
        const played = this._playedFrames;
        this._renderedFrames = 0;
        this._playedFrames = 0;
        return played;
    }
}
