import { Clef } from '@src/model/Clef';
import { MasterBar } from '@src/model/MasterBar';
import { Ottavia } from '@src/model/Ottavia';
import { SimileMark } from '@src/model/SimileMark';
import { Staff } from '@src/model/Staff';
import { Voice } from '@src/model/Voice';
import { Settings } from '@src/Settings';

/**
 * A bar is a single block within a track, also known as Measure.
 * @json
 */
export class Bar {
    private static _globalBarId: number = 0;

    /**
     * Gets or sets the unique id of this bar.
     */
    public id: number = Bar._globalBarId++;

    /**
     * Gets or sets the zero-based index of this bar within the staff.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the next bar that comes after this bar.
     * @json_ignore
     */
    public nextBar: Bar | null = null;

    /**
     * Gets or sets the previous bar that comes before this bar.
     * @json_ignore
     */
    public previousBar: Bar | null = null;

    /**
     * Gets or sets the clef on this bar.
     */
    public clef: Clef = Clef.G2;

    /**
     * Gets or sets the ottava applied to the clef.
     */
    public clefOttava: Ottavia = Ottavia.Regular;

    /**
     * Gets or sets the reference to the parent staff.
     * @json_ignore
     */
    public staff!: Staff;

    /**
     * Gets or sets the list of voices contained in this bar.
     * @json_add addVoice
     */
    public voices: Voice[] = [];

    /**
     * Gets or sets the simile mark on this bar.
     */
    public simileMark: SimileMark = SimileMark.None;

    /**
     * Gets a value indicating whether this bar contains multiple voices with notes. 
     * @json_ignore
     */
    public isMultiVoice: boolean = false;


    public get masterBar(): MasterBar {
        return this.staff.track.score.masterBars[this.index];
    }

    public get isEmpty(): boolean {
        for (let i: number = 0, j: number = this.voices.length; i < j; i++) {
            if (!this.voices[i].isEmpty) {
                return false;
            }
        }
        return true;
    }

    public addVoice(voice: Voice): void {
        voice.bar = this;
        voice.index = this.voices.length;
        this.voices.push(voice);
    }

    public finish(settings: Settings): void {
        this.isMultiVoice = false;
        for (let i: number = 0, j: number = this.voices.length; i < j; i++) {
            let voice: Voice = this.voices[i];
            voice.finish(settings);
            if(i > 0 && !voice.isEmpty) {
                this.isMultiVoice = true;
            }
        }
    }

    public calculateDuration(): number {
        let duration: number = 0;
        for (let voice of this.voices) {
            let voiceDuration: number = voice.calculateDuration();
            if (voiceDuration > duration) {
                duration = voiceDuration;
            }
        }
        return duration;
    }
}
