import { Beat } from '@src/model/Beat';

/**
 * Represents the information related to the beats actively being played now.
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
