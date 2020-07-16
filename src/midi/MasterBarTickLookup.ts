import { BeatTickLookup } from '@src/midi/BeatTickLookup';
import { MasterBar } from '@src/model/MasterBar';

/**
 * Represents the time period, for which all bars of a {@link MasterBar} are played.
 */
export class MasterBarTickLookup {
    /**
     * Gets or sets the start time in midi ticks at which the MasterBar is played.
     */
    public start: number = 0;

    /**
     * Gets or sets the end time in midi ticks at which the MasterBar is played.
     */
    public end: number = 0;

    /**
     * Gets or sets the current tempo when the MasterBar is played.
     */
    public tempo: number = 0;

    /**
     * Gets or sets the MasterBar which is played.
     */
    public masterBar!: MasterBar;

    /**
     * Gets or sets the list of {@link BeatTickLookup} object which define the durations
     * for all {@link Beats} played within the period of this MasterBar.
     */
    public beats: BeatTickLookup[] = [];

    /**
     * Gets or sets the {@link MasterBarTickLookup} of the next masterbar in the {@link Score}
     */
    public nextMasterBar: MasterBarTickLookup | null = null;

    /**
     * Performs the neccessary finalization steps after all information was written.
     */
    public finish(): void {
        this.beats.sort((a, b) => {
            return a.start - b.start;
        });
    }

    /**
     * Adds a new {@link BeatTickLookup} to the list of played beats during this MasterBar period.
     * @param beat
     */
    public addBeat(beat: BeatTickLookup): void {
        this.beats.push(beat);
    }
}
