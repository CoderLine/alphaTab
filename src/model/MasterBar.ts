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
import { Direction } from './Direction';

/**
 * The MasterBar stores information about a bar which affects
 * all tracks.
 * @json
 * @json_strict
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
     * Gets or sets whether the bar indicates a free time playing.
     */
    public isFreeTime: boolean = false;

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
     * Gets or sets the first tempo automation for this bar.
     * @deprecated Use {@link tempoAutomations}.
     */
    public get tempoAutomation(): Automation | null {
        return this.tempoAutomations.length > 0 ? this.tempoAutomations[0] : null;
    }

    /**
     * Gets or sets all tempo automation for this bar.
     */
    public tempoAutomations: Automation[] = [];

    /**
     * Gets or sets the reference to the score this song belongs to.
     * @json_ignore
     */
    public score!: Score;

    /**
     * Gets or sets the fermatas for this bar. The key is the offset of the fermata in midi ticks.
     * @json_add addFermata
     */
    public fermata: Map<number, Fermata> | null = null;

    /**
     * The timeline position of the voice within the whole score. (unit: midi ticks)
     */
    public start: number = 0;

    /**
     * Gets or sets a value indicating whether the master bar is an anacrusis (aka. pickup bar)
     */
    public isAnacrusis: boolean = false;

    /**
     * Gets a percentual scale for the size of the bars when displayed in a multi-track layout.
     */
    public displayScale: number = 1;

    /**
     * An absolute width of the bar to use when displaying in a multi-track layout.
     */
    public displayWidth: number = -1;

    /**
     * The directions applied to this masterbar.
     * @json_add addDirection
     */
    public directions: Set<Direction> | null = null;

    /**
     * Calculates the time spent in this bar. (unit: midi ticks)
     */
    public calculateDuration(respectAnacrusis: boolean = true): number {
        if (this.isAnacrusis && respectAnacrusis) {
            let duration: number = 0;
            for (let track of this.score.tracks) {
                for (let staff of track.staves) {
                    let barDuration: number =
                        this.index < staff.bars.length ? staff.bars[this.index].calculateDuration() : 0;
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
        let fermataMap = this.fermata;
        if (fermataMap === null) {
            fermataMap = new Map<number, Fermata>();
            this.fermata = fermataMap;
        }
        fermataMap.set(offset, fermata);
    }

    /**
     * Adds a direction to the masterbar.
     * @param direction The direction to add.
     */
    public addDirection(direction:Direction):void {
        if(this.directions == null){
            this.directions = new Set<Direction>();
        }
        this.directions.add(direction);
    }

    /**
     * Gets the fermata for a given beat.
     * @param beat The beat to get the fermata for.
     * @returns
     */
    public getFermata(beat: Beat): Fermata | null {
        const fermataMap = this.fermata;
        if (fermataMap === null) {
            return null;
        }
        if (fermataMap.has(beat.playbackStart)) {
            return fermataMap.get(beat.playbackStart)!;
        }
        return null;
    }
}
