import { MidiUtils } from '@src/midi/MidiUtils';
import type { Automation } from '@src/model/Automation';
import type { Beat } from '@src/model/Beat';
import type { Fermata } from '@src/model/Fermata';
// biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
import type { Bar } from '@src/model/Bar';
import type { KeySignature } from '@src/model/KeySignature';
import type { KeySignatureType } from '@src/model/KeySignatureType';
import type { RepeatGroup } from '@src/model/RepeatGroup';
import type { Score } from '@src/model/Score';
import type { Section } from '@src/model/Section';
import { TripletFeel } from '@src/model/TripletFeel';
import type { Direction } from '@src/model/Direction';

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
     * Whether the masterbar is has any changes applied to it (e.g. tempo changes, time signature changes etc)
     * The first bar is always considered changed due to initial setup of values. It does not consider
     * elements like whether the tempo really changes to the previous bar.
     */
    public get hasChanges() {
        if (this.index === 0) {
            return false;
        }

        const hasChangesToPrevious =
            this.timeSignatureCommon !== this.previousMasterBar!.timeSignatureCommon ||
            this.timeSignatureNumerator !== this.previousMasterBar!.timeSignatureNumerator ||
            this.timeSignatureDenominator !== this.previousMasterBar!.timeSignatureDenominator ||
            this.tripletFeel !== this.previousMasterBar!.tripletFeel;
        if (hasChangesToPrevious) {
            return true;
        }

        return (
            this.alternateEndings !== 0 ||
            this.isRepeatStart ||
            this.isRepeatEnd ||
            this.isFreeTime ||
            this.isSectionStart ||
            this.tempoAutomations.length > 0 ||
            this.syncPoints && this.syncPoints!.length > 0 ||
            (this.fermata !== null && this.fermata!.size > 0) ||
            (this.directions !== null && this.directions!.size > 0) ||
            this.isAnacrusis
        );
    }

    /**
     * The key signature used on all bars.
     * @deprecated Use key signatures on bar level
     */
    public get keySignature(): KeySignature {
        return this.score.tracks[0].staves[0].bars[this.index].keySignature;
    }

    /**
     * The key signature used on all bars.
     * @deprecated Use key signatures on bar level
     */
    public set keySignature(value: KeySignature) {
        this.score.tracks[0].staves[0].bars[this.index].keySignature = value;
    }

    /**
     * The type of key signature (major/minor)
     * @deprecated Use key signatures on bar level
     */
    public get keySignatureType(): KeySignatureType {
        return this.score.tracks[0].staves[0].bars[this.index].keySignatureType;
    }

    /**
     * The type of key signature (major/minor)
     * @deprecated Use key signatures on bar level
     */
    public set keySignatureType(value: KeySignatureType) {
        this.score.tracks[0].staves[0].bars[this.index].keySignatureType = value;
    }

    /**
     * Gets or sets whether a double bar is shown for this masterbar.
     * @deprecated Use {@link Bar.barLineLeft} and {@link Bar.barLineRight}
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
     * The sync points for this master bar to synchronize the alphaTab time axis with the
     * external backing track audio.
     * @json_add addSyncPoint
     */
    public syncPoints: Automation[] | undefined;

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
            for (const track of this.score.tracks) {
                for (const staff of track.staves) {
                    const barDuration: number =
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
    public addDirection(direction: Direction): void {
        if (this.directions == null) {
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

    /**
     * Adds the given sync point to the list of sync points for this bar.
     * @param syncPoint  The sync point to add.
     */
    public addSyncPoint(syncPoint: Automation) {
        if (!this.syncPoints) {
            this.syncPoints = [];
        }
        this.syncPoints!.push(syncPoint);
    }
}
