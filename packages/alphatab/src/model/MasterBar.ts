import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Automation } from '@coderline/alphatab/model/Automation';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Direction } from '@coderline/alphatab/model/Direction';
import type { Duration } from '@coderline/alphatab/model/Duration';
import type { Fermata } from '@coderline/alphatab/model/Fermata';
import type { KeySignature } from '@coderline/alphatab/model/KeySignature';
import type { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import type { RepeatGroup } from '@coderline/alphatab/model/RepeatGroup';
import type { Score } from '@coderline/alphatab/model/Score';
import type { Section } from '@coderline/alphatab/model/Section';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';

/**
 * Defines the custom beaming rules which define how beats are beamed together or split apart
 * during the automatic beaming when displayed.
 * @json
 * @json_strict
 * @public
 *
 * @remarks
 * The beaming logic works like this:
 *
 * The time axis of the bar is sliced into even chunks. The chunk-size is defined by the respective group definition.
 * Within these chunks groups can then be placed spanning 1 or more chunks.
 *
 * If beats start within the same "group" they are beamed together.
 */
export class BeamingRules {
    /**
     * The the group for a given "longest duration" within the bar.
     * @remarks
     * The map key is the duration to which the bar will be sliced into.
     * The map value defines the "groups" placed within the sliced.
     */
    public groups = new Map<Duration, number[]>();

    /**
     * @internal
     * @json_ignore
     */
    public uniqueId: string = '';

    /**
     * @internal
     * @json_ignore
     */
    public masterBar: MasterBar | undefined;

    /**
     * @internal
     */
    public finish(masterBar: MasterBar) {
        this.masterBar = masterBar;
        let uniqueId = '';
        for (const [k, v] of this.groups) {
            if (uniqueId.length > 0) {
                uniqueId += '__';
            }
            uniqueId += k;

            // trim of 0s at the end of the group
            let lastZero = v.length;
            for (let i = v.length - 1; i >= 0; i--) {
                if (v[i] === 0) {
                    lastZero = i;
                } else {
                    break;
                }
            }

            if (lastZero < v.length) {
                v.splice(lastZero, v.length - lastZero);
            }

            uniqueId += `_${v.join('_')}`;
        }
        this.uniqueId = uniqueId;
    }
}

/**
 * The MasterBar stores information about a bar which affects
 * all tracks.
 * @json
 * @json_strict
 * @public
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
            (this.syncPoints && this.syncPoints!.length > 0) ||
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
     * Defines the custom beaming rules which should be applied to this bar and all bars following.
     */
    public beamingRules?: BeamingRules;

    /**
     * The actual (custom) beaming rules to use for this bar if any were specified.
     * @json_ignore
     * @internal
     */
    public actualBeamingRules?: BeamingRules;

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
        if (beat.index === 0 && fermataMap.has(0)) {
            return fermataMap.get(0)!;
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

    public finish(sharedDataBag: Map<string, unknown>) {
        this.beamingRules?.finish(this);

        let actualBeamingRules = this.beamingRules;

        if (this.index > 0) {
            this.start = this.previousMasterBar!.start + this.previousMasterBar!.calculateDuration();

            // clear out equal rules to reduce memory consumption.
            const previousRules = sharedDataBag.has('beamingRules')
                ? (sharedDataBag.get('beamingRules')! as BeamingRules)
                : undefined;

            if (previousRules && previousRules.uniqueId === this.beamingRules?.uniqueId) {
                this.beamingRules = undefined;
                actualBeamingRules = previousRules;
            }
        }
        this.actualBeamingRules = actualBeamingRules;

        if (this.beamingRules) {
            sharedDataBag.set('beamingRules', this.beamingRules);
        }
    }
}
