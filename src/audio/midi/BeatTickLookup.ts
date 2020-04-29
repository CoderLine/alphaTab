import { Beat } from '@src/model/Beat';

/**
 * Represents the time period, for which a {@link Beat} is played.
 */
export class BeatTickLookup {
    private _highlightedBeats: Map<number, boolean> = new Map();

    /**
     * Gets or sets the start time in midi ticks at which the given beat is played.
     */
    public start: number = 0;

    /**
     * Gets or sets the end time in midi ticks at which the given beat is played.
     */
    public end: number = 0;

    /**
     * Gets or sets the beat which is played.
     */
    public beat!: Beat;

    /**
     * Gets or sets whether the beat is the placeholder beat for an empty bar.
     */
    public isEmptyBar: boolean = false;

    /**
     * Gets or sets a list of all beats that should be highlighted when
     * the beat of this lookup starts playing.
     */
    public beatsToHighlight: Beat[] = [];

    public highlightBeat(beat: Beat): void {
        if (!this._highlightedBeats.has(beat.id)) {
            this._highlightedBeats.set(beat.id, true);
            this.beatsToHighlight.push(beat);
        }
    }
}
