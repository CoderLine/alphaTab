import { Beat } from '@src/model/Beat';

/**
 * Represents the time period, for which one or multiple {@link Beat}s are played
 */
export class BeatTickLookup {
    private _highlightedBeats: Map<number, boolean> = new Map();

    /**
     * Gets or sets the start time in midi ticks at which the given beat is played.
     */
    public start: number;

    /**
     * Gets or sets the end time in midi ticks at which the given beat is played.
     */
    public end: number;

    /**
     * Gets or sets a list of all beats that should be highlighted when
     * the beat of this lookup starts playing. This might not mean 
     * the beats start at this position.
     */
    public highlightedBeats: Beat[] = [];

    /**
     * Gets the next BeatTickLookup which comes after this one and is in the same
     * MasterBarTickLookup.
     */
    public nextBeat: BeatTickLookup | null = null;

    /**
     * Gets the preivous BeatTickLookup which comes before this one and is in the same
     * MasterBarTickLookup.
     */
    public previousBeat: BeatTickLookup | null = null;

    /**
     * Gets the tick duration of this lookup.
     */
    public get duration(): number {
        return this.end - this.start;
    }

    public constructor(start:number, end:number) {
        this.start = start;
        this.end = end;
    }

    /**
     * Marks the given beat as highlighed as part of this lookup.
     * @param beat The beat to add.
     */
    public highlightBeat(beat: Beat): void {
        if(beat.isEmpty) {
            return;
        }
        if (!this._highlightedBeats.has(beat.id)) {
            this._highlightedBeats.set(beat.id, true);
            this.highlightedBeats.push(beat);
        }
    }

    /**
     * Looks for the first visible beat which starts at this lookup so it can be used for cursor placement.
     * @param visibleTracks The visible tracks.
     * @returns The first beat which is visible according to the given tracks or null.
     */
    public getVisibleBeatAtStart(visibleTracks: Set<number>): Beat | null {
        for (const b of this.highlightedBeats) {
            if (b.playbackStart == this.start && visibleTracks.has(b.voice.bar.staff.track.index)) {
                return b;
            }
        }
        return null;
    }
}
