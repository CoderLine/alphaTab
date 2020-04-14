export class Spring {
    public timePosition: number = 0;
    public longestDuration: number = 0;
    public smallestDuration: number = 0;
    public force: number = 0;
    public springConstant: number = 0;

    public get springWidth(): number {
        return this.preSpringWidth + this.postSpringWidth;
    }

    public preSpringWidth: number = 0;
    public postSpringWidth: number = 0;
    public allDurations: number[] = [];
}
