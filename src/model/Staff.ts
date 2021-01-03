import { Bar } from '@src/model/Bar';
import { Chord } from '@src/model/Chord';
import { Track } from '@src/model/Track';
import { Settings } from '@src/Settings';
import { Tuning } from './Tuning';

/**
 * This class describes a single staff within a track. There are instruments like pianos
 * where a single track can contain multiple staffs.
 * @json
 */
export class Staff {
    /**
     * Gets or sets the zero-based index of this staff within the track.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the reference to the track this staff belongs to.
     * @json_ignore
     */
    public track!: Track;

    /**
     * Gets or sets a list of all bars contained in this staff.
     * @json_add addBar
     */
    public bars: Bar[] = [];

    /**
     * Gets or sets a list of all chords defined for this staff. {@link Beat.chordId} refers to entries in this lookup.
     * @json_add addChord
     */
    public chords: Map<string, Chord> = new Map<string, Chord>();

    /**
     * Gets or sets the fret on which a capo is set.
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
    public stringTuning: Tuning = new Tuning("", [], false);

    /**
     * Get or set the values of the related guitar tuning.
     */
    public get tuning(): number[] {
        return this.stringTuning.tunings;
    }

    /**
     * Gets or sets the name of the tuning.
     */
    public get tuningName(): string {
        return this.stringTuning.name;
    }

    public get isStringed(): boolean {
        return this.stringTuning.tunings.length > 0;
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

    /**
     * The number of lines shown for the standard notation. 
     * For some percussion instruments this number might vary. 
     */
    public standardNotationLineCount: number = 5;

    public finish(settings: Settings): void {
        this.stringTuning.finish();
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
