import { Beat } from './Beat';

/**
 * Represents a group of grace beats that belong together
 */
export class GraceGroup {
    /**
     * All beats within this group.
     */
    public beats: Beat[] = [];

    /**
     * Gets a unique ID for this grace group.
     */
    public id: string = 'empty';

    /**
     * true if the grace beat are followed by a normal beat within the same
     * bar. 
     */
    public isComplete: boolean = false;

    /**
     * Adds a new beat to this group
     * @param beat The beat to add
     */
    public addBeat(beat: Beat) {
        if (this.beats.length === 0) {
            this.id = beat.absoluteDisplayStart + "_" + beat.voice.index;
        }
        beat.graceIndex = this.beats.length;
        beat.graceGroup = this;
        this.beats.push(beat);
    }
}
