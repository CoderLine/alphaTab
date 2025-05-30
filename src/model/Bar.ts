import { Clef } from '@src/model/Clef';
import type { MasterBar } from '@src/model/MasterBar';
import { Ottavia } from '@src/model/Ottavia';
import { SimileMark } from '@src/model/SimileMark';
import type { Staff } from '@src/model/Staff';
import type { Voice } from '@src/model/Voice';
import type { Settings } from '@src/Settings';
import { ElementStyle } from '@src/model/ElementStyle';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';

/**
 * The different pedal marker types.
 */
export enum SustainPedalMarkerType {
    /**
     * Indicates that the pedal should be pressed from this time on.
     */
    Down = 0,
    /**
     * Indicates that the pedal should be held on this marker (used when the pedal is held for the whole bar)
     */
    Hold = 1,
    /**
     * indicates that the pedal should be lifted up at this time.
     */
    Up = 2
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
    StandardNotationRepeats = 0,

    /**
     * The repeat signs on the guitar tab staff.
     */
    GuitarTabsRepeats = 1,

    /**
     * The repeat signs on the slash staff.
     */
    SlashRepeats = 2,

    /**
     * The repeat signs on the numbered notation staff.
     */
    NumberedRepeats = 3,

    /**
     * The bar numbers on the standard notation staff.
     */
    StandardNotationBarNumber = 4,

    /**
     * The bar numbers on the guitar tab staff.
     */
    GuitarTabsBarNumber = 5,

    /**
     * The bar numbers on the slash staff.
     */
    SlashBarNumber = 6,

    /**
     * The bar numbers on the numbered notation staff.
     */
    NumberedBarNumber = 7,

    /**
     * The bar lines on the standard notation staff.
     */
    StandardNotationBarLines = 8,

    /**
     * The bar lines on the guitar tab staff.
     */
    GuitarTabsBarLines = 9,

    /**
     * The bar lines on the slash staff.
     */
    SlashBarLines = 10,

    /**
     * The bar lines on the numbered notation staff.
     */
    NumberedBarLines = 11,

    /**
     * The clefs on the standard notation staff.
     */
    StandardNotationClef = 12,

    /**
     * The clefs on the guitar tab staff.
     */
    GuitarTabsClef = 13,

    /**
     * The key signatures on the standard notation staff.
     */
    StandardNotationKeySignature = 14,

    /**
     * The key signatures on the numbered notation staff.
     */
    NumberedKeySignature = 15,

    /**
     * The time signatures on the standard notation staff.
     */
    StandardNotationTimeSignature = 16,

    /**
     * The time signatures on the guitar tab staff.
     */
    GuitarTabsTimeSignature = 17,

    /**
     * The time signatures on the slash staff.
     */
    SlashTimeSignature = 18,

    /**
     * The time signature on the numbered notation staff.
     */
    NumberedTimeSignature = 19,

    /**
     * The staff lines on the standard notation staff.
     */
    StandardNotationStaffLine = 20,

    /**
     * The staff lines on the guitar tab staff.
     */
    GuitarTabsStaffLine = 21,

    /**
     * The staff lines on the slash staff.
     */
    SlashStaffLine = 22,

    /**
     * The staff lines on the numbered notation staff.
     */
    NumberedStaffLine = 23
}

/**
 * Defines the custom styles for bars.
 * @json
 * @json_strict
 */
export class BarStyle extends ElementStyle<BarSubElement> {}

/**
 * Lists all bar line styles.
 */
export enum BarLineStyle {
    /**
     * No special custom line style, automatic handling (e.g. last bar might be LightHeavy)
     */
    Automatic = 0,
    Dashed = 1,
    Dotted = 2,
    Heavy = 3,
    HeavyHeavy = 4,
    HeavyLight = 5,
    LightHeavy = 6,
    LightLight = 7,
    None = 8,
    Regular = 9,
    Short = 10,
    Tick = 11
}

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
     * Whether this bar has any changes applied which are not related to the voices in it.
     * (e.g. new key signatures)
     */
    public get hasChanges(): boolean {
        if (this.index === 0) {
            return true;
        }
        const hasChangesToPrevious =
            this.keySignature !== this.previousBar!.keySignature ||
            this.keySignatureType !== this.previousBar!.keySignatureType ||
            this.clef !== this.previousBar!.clef ||
            this.clefOttava !== this.previousBar!.clefOttava;
        if (hasChangesToPrevious) {
            return true;
        }

        return (
            this.simileMark !== SimileMark.None ||
            this.sustainPedals.length > 0 ||
            this.barLineLeft !== BarLineStyle.Automatic ||
            this.barLineRight !== BarLineStyle.Automatic
        );
    }

    /**
     * Whether this bar is empty or has only rests.
     */
    public get isRestOnly(): boolean {
        return this._isRestOnly;
    }

    /**
     * The bar line to draw on the left side of the bar.
     * @remarks
     * Note that the combination with {@link barLineRight} of the previous bar matters.
     * If this bar has a Regular/Automatic style but the previous bar is customized, no additional line is drawn by this bar.
     * If both bars have a custom style, both bar styles are drawn.
     */
    public barLineLeft: BarLineStyle = BarLineStyle.Automatic;

    /**
     * The bar line to draw on the right side of the bar.
     * @remarks
     * Note that the combination with {@link barLineLeft} of the next bar matters.
     * If this bar has a Regular/Automatic style but the next bar is customized, no additional line is drawn by this bar.
     * If both bars have a custom style, both bar styles are drawn.
     */
    public barLineRight: BarLineStyle = BarLineStyle.Automatic;

    /**
     * Gets or sets the key signature used on all bars.
     */
    public keySignature: KeySignature = KeySignature.C;

    /**
     * Gets or sets the type of key signature (major/minor)
     */
    public keySignatureType: KeySignatureType = KeySignatureType.Major;

    /**
     * The bar line to draw on the left side of the bar with an "automatic" type resolved to the actual one.
     * @param isFirstOfSystem  Whether the bar is the first one in the system.
     */
    public getActualBarLineLeft(isFirstOfSystem: boolean): BarLineStyle {
        return Bar.actualBarLine(this, false, isFirstOfSystem);
    }

    /**
     * The bar line to draw on the right side of the bar with an "automatic" type resolved to the actual one.
     * @param isFirstOfSystem  Whether the bar is the first one in the system.
     */
    public getActualBarLineRight(): BarLineStyle {
        return Bar.actualBarLine(this, true, false /* not relevant */);
    }

    private static automaticToActualType(masterBar: MasterBar, isRight: boolean, firstOfSystem: boolean) {
        let actualLineType: BarLineStyle;

        if (isRight) {
            if (masterBar.isRepeatEnd) {
                actualLineType = BarLineStyle.LightHeavy;
            } else if (!masterBar.nextMasterBar) {
                actualLineType = BarLineStyle.LightHeavy;
            } else if (masterBar.isFreeTime) {
                actualLineType = BarLineStyle.Dashed;
            } else if (masterBar.isDoubleBar) {
                actualLineType = BarLineStyle.LightLight;
            } else {
                actualLineType = BarLineStyle.Regular;
            }
        } else {
            if (masterBar.isRepeatStart) {
                actualLineType = BarLineStyle.HeavyLight;
            } else if (firstOfSystem) {
                actualLineType = BarLineStyle.Regular;
            } else {
                actualLineType = BarLineStyle.None;
            }
        }

        return actualLineType;
    }

    private static actualBarLine(bar: Bar, isRight: boolean, firstOfSystem: boolean) {
        const masterBar = bar.masterBar;
        const requestedLineType = isRight ? bar.barLineRight : bar.barLineLeft;

        let actualLineType: BarLineStyle;
        if (requestedLineType === BarLineStyle.Automatic) {
            actualLineType = Bar.automaticToActualType(masterBar, isRight, firstOfSystem);
        } else {
            actualLineType = requestedLineType;
        }

        return actualLineType;
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
            const voice: Voice = this.voices[i];
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

            const isDown = previousMarker !== null && previousMarker.pedalType !== SustainPedalMarkerType.Up;

            for (const marker of sustainPedals) {
                if (previousMarker && previousMarker.pedalType !== SustainPedalMarkerType.Up) {
                    //duplicate or out-of-order markers
                    if (previousMarker.bar === this && marker.ratioPosition <= previousMarker.ratioPosition) {
                        continue;
                    }

                    previousMarker.nextPedalMarker = marker;
                    marker.previousPedalMarker = previousMarker;
                }

                if (isDown && marker.pedalType === SustainPedalMarkerType.Down) {
                    marker.pedalType = SustainPedalMarkerType.Hold;
                }

                marker.bar = this;
                this.sustainPedals.push(marker);
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
        for (const voice of this.voices) {
            const voiceDuration: number = voice.calculateDuration();
            if (voiceDuration > duration) {
                duration = voiceDuration;
            }
        }
        return duration;
    }
}
