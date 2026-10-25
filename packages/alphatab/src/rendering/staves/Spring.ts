/**
 * @internal
 */
export class Spring {
    public timePosition: number = 0;
    public longestDuration: number = 0;
    public smallestDuration: number = 0;
    public force: number = 0;
    public springConstant: number = 0;

    /**
     * The minimum distance from this spring's on-time position to the next spring
     * (or to the bar end for the last spring) at which no content overlaps.
     */
    public minWidth: number = 0;

    public get springWidth(): number {
        return this.preSpringWidth + this.postSpringWidth;
    }

    public preBeatWidth: number = 0;
    public graceBeatWidth: number = 0;

    public postSpringWidth: number = 0;
    public get preSpringWidth() {
        return this.preBeatWidth + this.graceBeatWidth;
    }

    public allDurations: Set<number> = new Set<number>();
}
