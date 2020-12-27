import { MidiUtils } from '@src/midi/MidiUtils';
import { Automation } from '@src/model/Automation';
import { Beat } from '@src/model/Beat';
import { Fermata } from '@src/model/Fermata';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { RepeatGroup } from '@src/model/RepeatGroup';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { TripletFeel } from '@src/model/TripletFeel';

/**
 * The MasterBar stores information about a bar which affects
 * all tracks.
 * @json
 */
export class MasterBar {
    public static readonly MaxAlternateEndings: number = 8;
    /**
     * Gets or sets the bitflag for the alternate endings. Each bit defines for which repeat counts
     * the bar is played.
     */
    public alternateEndings: number = 0;

    /**
     * Gets or sets the next masterbar in the song.
     * @json_ignore
     */
    public nextMasterBar: MasterBar | null = null;

    /**
     * Gets or sets the next masterbar in the song.
     * @json_ignore
     */
    public previousMasterBar: MasterBar | null = null;

    /**
     * Gets the zero based index of the masterbar.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the key signature used on all bars.
     */
    public keySignature: KeySignature = KeySignature.C;

    /**
     * Gets or sets the type of key signature (major/minor)
     */
    public keySignatureType: KeySignatureType = KeySignatureType.Major;

    /**
     * Gets or sets whether a double bar is shown for this masterbar.
     */
    public isDoubleBar: boolean = false;

    /**
     * Gets or sets whether a repeat section starts on this masterbar.
     */
    public isRepeatStart: boolean = false;

    public get isRepeatEnd(): boolean {
        return this.repeatCount > 0;
    }

    /**
     * Gets or sets the number of repeats for the current repeat section.
     */
    public repeatCount: number = 0;

    /**
     * Gets or sets the repeat group this bar belongs to.
     * @json_ignore
     */
    public repeatGroup!: RepeatGroup;

    /**
     * Gets or sets the time signature numerator.
     */
    public timeSignatureNumerator: number = 4;

    /**
     * Gets or sets the time signature denominiator.
     */
    public timeSignatureDenominator: number = 4;

    /**
     * Gets or sets whether this is bar has a common time signature.
     */
    public timeSignatureCommon: boolean = false;

    /**
     * Gets or sets the triplet feel that is valid for this bar.
     */
    public tripletFeel: TripletFeel = TripletFeel.NoTripletFeel;

    /**
     * Gets or sets the new section information for this bar.
     */
    public section: Section | null = null;

    public get isSectionStart(): boolean {
        return !!this.section;
    }

    /**
     * Gets or sets the tempo automation for this bar.
     */
    public tempoAutomation: Automation | null = null;

    /**
     * Gets or sets the reference to the score this song belongs to.
     * @json_ignore
     */
    public score!: Score;

    /**
     * Gets or sets the fermatas for this bar. The key is the offset of the fermata in midi ticks.
     */
    public fermata: Map<number, Fermata> = new Map<number, Fermata>();

    /**
     * The timeline position of the voice within the whole score. (unit: midi ticks)
     */
    public start: number = 0;

    /**
     * Gets or sets a value indicating whether the master bar is an anacrusis (aka. pickup bar)
     */
    public isAnacrusis: boolean = false;

    /**
     * Calculates the time spent in this bar. (unit: midi ticks)
     */
    public calculateDuration(respectAnacrusis:boolean = true): number {
        if (this.isAnacrusis && respectAnacrusis) {
            let duration: number = 0;
            for (let track of this.score.tracks) {
                for (let staff of track.staves) {
                    let barDuration: number = this.index < staff.bars.length
                        ? staff.bars[this.index].calculateDuration()
                        : 0;
                    if (barDuration > duration) {
                        duration = barDuration;
                    }
                }
            }
            return duration;
        }
        return this.timeSignatureNumerator * MidiUtils.valueToTicks(this.timeSignatureDenominator);
    }

    /**
     * Adds a fermata to the masterbar.
     * @param offset The offset of the fermata within the bar in midi ticks.
     * @param fermata The fermata.
     */
    public addFermata(offset: number, fermata: Fermata): void {
        this.fermata.set(offset, fermata);
    }

    /**
     * Gets the fermata for a given beat.
     * @param beat The beat to get the fermata for.
     * @returns
     */
    public getFermata(beat: Beat): Fermata | null {
        if (this.fermata.has(beat.playbackStart)) {
            return this.fermata.get(beat.playbackStart)!;
        }
        return null;
    }
}
