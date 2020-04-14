import { Bar } from '@src/model/Bar';
import { Chord } from '@src/model/Chord';
import { Track } from '@src/model/Track';
import { Settings } from '@src/Settings';

/**
 * This class describes a single staff within a track. There are instruments like pianos
 * where a single track can contain multiple staffs.
 */
export class Staff {
    /**
     * Gets or sets the zero-based index of this staff within the track.
     */
    public index: number = 0;

    /**
     * Gets or sets the reference to the track this staff belongs to.
     */
    public track!: Track;

    /**
     * Gets or sets a list of all bars contained in this staff.
     */
    public bars: Bar[] = [];

    /**
     * Gets or sets a list of all chords defined for this staff. {@link Beat.chordId} refers to entries in this lookup.
     */
    public chords: Map<string, Chord> = new Map();

    /**
     * Gets or sets the fret on which a capo is set. s
     */
    public capo: number = 0;

    /**
     * Gets or sets the number of semitones this track should be
     * transposed. This applies to rendering and playback.
     */
    public transpositionPitch: number = 0;

    /**
     * Gets or sets the number of semitones this track should be
     * transposed. This applies only to rendering.
     */
    public displayTranspositionPitch: number = 0;

    /**
     * Get or set the guitar tuning of the guitar. This tuning also indicates the number of strings shown in the
     * guitar tablature. Unlike the {@link Note.string} property this array directly represents
     * the order of the tracks shown in the tablature. The first item is the most top tablature line.
     */
    public tuning: Int32Array = new Int32Array(0);

    /**
     * Gets or sets the name of the tuning.
     */
    public tuningName: string = "";

    public get isStringed(): boolean {
        return this.tuning.length > 0;
    }

    /**
     * Gets or sets whether the tabs are shown.
     */
    public showTablature: boolean = true;

    /**
     * Gets or sets whether the standard notation is shown.
     */
    public showStandardNotation: boolean = true;

    /**
     * Gets or sets whether the staff contains percussion notation
     */
    public isPercussion: boolean = false;

    public static copyTo(src: Staff, dst: Staff): void {
        dst.capo = src.capo;
        dst.index = src.index;
        dst.tuning = new Int32Array(src.tuning);
        dst.transpositionPitch = src.transpositionPitch;
        dst.displayTranspositionPitch = src.displayTranspositionPitch;
        dst.showStandardNotation = src.showStandardNotation;
        dst.showTablature = src.showTablature;
        dst.isPercussion = src.isPercussion;
    }

    public finish(settings: Settings): void {
        for (let i: number = 0, j: number = this.bars.length; i < j; i++) {
            this.bars[i].finish(settings);
        }
    }

    public addChord(chordId: string, chord: Chord): void {
        chord.staff = this;
        this.chords.set(chordId, chord);
    }

    public addBar(bar: Bar): void {
        let bars: Bar[] = this.bars;
        bar.staff = this;
        bar.index = bars.length;
        if (bars.length > 0) {
            bar.previousBar = bars[bars.length - 1];
            bar.previousBar.nextBar = bar;
        }
        bars.push(bar);
    }
}
