import { Clef } from '@src/model/Clef';
import { MasterBar } from '@src/model/MasterBar';
import { Ottavia } from '@src/model/Ottavia';
import { SimileMark } from '@src/model/SimileMark';
import { Staff } from '@src/model/Staff';
import { Voice } from '@src/model/Voice';
import { Settings } from '@src/Settings';
import { ElementStyle } from './ElementStyle';

/**
 * The different pedal marker types.
 */
export enum SustainPedalMarkerType {
    /**
     * Indicates that the pedal should be pressed from this time on.
     */
    Down,
    /**
     * Indicates that the pedal should be held on this marker (used when the pedal is held for the whole bar)
     */
    Hold,
    /**
     * indicates that the pedal should be lifted up at this time.
     */
    Up
}

/**
 * A marker on whether a sustain pedal starts or ends.
 * @json
 * @json_strict
 */
export class SustainPedalMarker {
    /**
     * The relative position of pedal markers within the bar.
     */
    public ratioPosition: number = 0;
    /**
     * Whether what should be done with the pedal at this point
     */
    public pedalType: SustainPedalMarkerType = SustainPedalMarkerType.Down;

    /**
     * THe bar to which this marker belongs to.
     * @json_ignore
     */
    public bar!: Bar;

    /**
     * The next pedal marker for linking the related markers together to a "down -> hold -> up" or "down -> up" sequence.
     * Always null for "up" markers.
     * @json_ignore
     */
    public nextPedalMarker: SustainPedalMarker | null = null;

    /**
     * The previous pedal marker for linking the related markers together to a "down -> hold -> up" or "down -> up" sequence.
     * Always null for "down" markers.
     * @json_ignore
     */
    public previousPedalMarker: SustainPedalMarker | null = null;
}

/**
 * Lists all graphical sub elements within a {@link Bar} which can be styled via {@link Bar.style}
 */
export enum BarSubElement {
    /**
     * The repeat signs on the standard notation staff.
     */
    StandardNotationRepeats,

    /**
     * The repeat signs on the guitar tab staff.
     */
    GuitarTabsRepeats,

    /**
     * The repeat signs on the slash staff.
     */
    SlashRepeats,

    /**
     * The repeat signs on the numbered notation staff.
     */
    NumberedRepeats,

    /**
     * The bar numbers on the standard notation staff.
     */
    StandardNotationBarNumber,

    /**
     * The bar numbers on the guitar tab staff.
     */
    GuitarTabsBarNumber,

    /**
     * The bar numbers on the slash staff.
     */
    SlashBarNumber,

    /**
     * The bar numbers on the numbered notation staff.
     */
    NumberedBarNumber,

    /**
     * The bar separator lines on the standard notation staff.
     */
    StandardNotationBarSeparator,

    /**
     * The bar separator lines on the guitar tab staff.
     */
    GuitarTabsBarSeparator,

    /**
     * The bar separator lines on the slash staff.
     */
    SlashBarSeparator,

    /**
     * The bar separator lines on the numbered notation staff.
     */
    NumberedBarSeparator,

    /**
     * The clefs on the standard notation staff.
     */
    StandardNotationClef,

    /**
     * The clefs on the guitar tab staff.
     */
    GuitarTabsClef,

    /**
     * The key signatures on the standard notation staff.
     */
    StandardNotationKeySignature,

    /**
     * The key signatures on the numbered notation staff.
     */
    NumberedKeySignature,

    /**
     * The time signatures on the standard notation staff.
     */
    StandardNotationTimeSignature,

    /**
     * The time signatures on the guitar tab staff.
     */
    GuitarTabsTimeSignature,

    /**
     * The time signatures on the slash staff.
     */
    SlashTimeSignature,

    /**
     * The time signature on the numbered notation staff.
     */
    NumberedTimeSignature,

    /**
     * The staff lines on the standard notation staff.
     */
    StandardNotationStaffLine,

    /**
     * The staff lines on the guitar tab staff.
     */
    GuitarTabsStaffLine,

    /**
     * The staff lines on the slash staff.
     */
    SlashStaffLine,

    /**
     * The staff lines on the numbered notation staff.
     */
    NumberedStaffLine
}

/**
 * Defines the custom styles for bars.
 * @json
 * @json_strict
 */
export class BarStyle extends ElementStyle<BarSubElement> {}

/**
 * A bar is a single block within a track, also known as Measure.
 * @json
 * @json_strict
 */
export class Bar {
    private static _globalBarId: number = 0;

    /**
     * @internal
     */
    public static resetIds() {
        Bar._globalBarId = 0;
    }

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

    /**
     * A relative scale for the size of the bar when displayed. The scale is relative
     * within a single line (system). The sum of all scales in one line make the total width,
     * and then this individual scale gives the relative size.
     */
    public displayScale: number = 1;

    /**
     * An absolute width of the bar to use when displaying in single track display scenarios.
     */
    public displayWidth: number = -1;

    /**
     * The sustain pedal markers within this bar.
     */
    public sustainPedals: SustainPedalMarker[] = [];

    public get masterBar(): MasterBar {
        return this.staff.track.score.masterBars[this.index];
    }

    private _isEmpty: boolean = true;
    private _isRestOnly: boolean = true;

    /**
     * Whether this bar is fully empty (not even having rests).
     */
    public get isEmpty(): boolean {
        return this._isEmpty;
    }

    /**
     * Whether this bar is empty or has only rests.
     */
    public get isRestOnly(): boolean {
        return this._isRestOnly;
    }

    /**
     * The style customizations for this item.
     */
    public style?: BarStyle;

    public addVoice(voice: Voice): void {
        voice.bar = this;
        voice.index = this.voices.length;
        this.voices.push(voice);
    }

    public finish(settings: Settings, sharedDataBag: Map<string, unknown> | null = null): void {
        this.isMultiVoice = false;
        this._isEmpty = true;
        this._isRestOnly = true;
        for (let i: number = 0, j: number = this.voices.length; i < j; i++) {
            let voice: Voice = this.voices[i];
            voice.finish(settings, sharedDataBag);
            if (i > 0 && !voice.isEmpty) {
                this.isMultiVoice = true;
            }

            if (!voice.isEmpty) {
                this._isEmpty = false;
            }

            if (!voice.isRestOnly) {
                this._isRestOnly = false;
            }
        }

        // chain sustain pedal markers (and merge overlaps)
        const sustainPedals = this.sustainPedals;
        if (sustainPedals.length > 0) {
            let previousMarker: SustainPedalMarker | null = null;
            this.sustainPedals = [];

            if (this.previousBar && this.previousBar.sustainPedals.length > 0) {
                previousMarker = this.previousBar.sustainPedals[this.previousBar.sustainPedals.length - 1];
            }

            let isDown = previousMarker !== null && previousMarker.pedalType !== SustainPedalMarkerType.Up;

            for (const marker of sustainPedals) {
                if (previousMarker && previousMarker.pedalType !== SustainPedalMarkerType.Up) {

                    //duplicate or out-of-order markers
                    if(previousMarker.bar === this && marker.ratioPosition <= previousMarker.ratioPosition) {
                        continue;
                    }

                    previousMarker.nextPedalMarker = marker;
                    marker.previousPedalMarker = previousMarker;
                }

                if(isDown && marker.pedalType === SustainPedalMarkerType.Down) {
                    marker.pedalType = SustainPedalMarkerType.Hold;
                }

                marker.bar = this;
                this.sustainPedals.push(marker)
                previousMarker = marker;
            }
        } else if (this.previousBar && this.previousBar.sustainPedals.length > 0) {
            const lastMarker = this.previousBar.sustainPedals[this.previousBar.sustainPedals.length - 1];
            if (lastMarker.pedalType !== SustainPedalMarkerType.Up) {
                // create hold marker if the last marker on the previous bar is not "up"
                const holdMarker = new SustainPedalMarker();
                holdMarker.ratioPosition = 0;
                holdMarker.bar = this;
                holdMarker.pedalType = SustainPedalMarkerType.Hold;
                this.sustainPedals.push(holdMarker);

                lastMarker.nextPedalMarker = holdMarker;
                holdMarker.previousPedalMarker = lastMarker;
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
