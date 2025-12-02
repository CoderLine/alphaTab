import type { Beat } from '@coderline/alphatab/model/Beat';

/**
 * Represents the information related to the beats actively being played now.
 * @public
 */
export class ActiveBeatsChangedEventArgs {
    /**
     * The currently active beats across all tracks and voices.
     */
    public activeBeats: Beat[];

    public constructor(activeBeats: Beat[]) {
        this.activeBeats = activeBeats;
    }
}
