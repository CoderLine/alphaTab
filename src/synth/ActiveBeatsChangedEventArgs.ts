import { Beat } from '@src/model/Beat';

/**
 * Represents the information related to the beats actively being played now.
 */
export class ActiveBeatsChangedEventArgs {
    /**
     * Gets the size before the resizing happened.
     */
    public activeBeats: Beat[];

    public constructor(activeBeats: Beat[]) {
        this.activeBeats = activeBeats;
    }
}
