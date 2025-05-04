import { TextBaseline } from '@src/platform/ICanvas';
import { Duration } from '@src/model/Duration';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * Describes an instrument articulation which is used for percussions.
 * @json
 * @json_strict
 */
export class InstrumentArticulation {
    /**
     * Gets or sets the type of the element for which this articulation is for.
     */
    public elementType: string;
    /**
     * The line the note head should be shown for standard notation.
     *
     * @remarks
     * This value is a bit special and its semantics are adopted from Guitar Pro:
     * Staff lines are actually "steps" including lines and spaces on the staff.
     * 1 means the note is on the top line of the staff and from there its counting downwards.
     */
    public staffLine: number;
    /**
     * Gets or sets the note head to display by default.
     */
    public noteHeadDefault: MusicFontSymbol;
    /**
     * Gets or sets the note head to display for half duration notes.
     */
    public noteHeadHalf: MusicFontSymbol;
    /**
     * Gets or sets the note head to display for whole duration notes.
     */
    public noteHeadWhole: MusicFontSymbol;
    /**
     * Gets or sets which additional technique symbol should be placed for the note head.
     */
    public techniqueSymbol: MusicFontSymbol;
    /**
     * Gets or sets where the technique symbol should be placed.
     */
    public techniqueSymbolPlacement: TextBaseline;

    /**
     * Gets or sets which midi key to use when playing the note.
     */
    public outputMidiNumber: number;

    public constructor(
        elementType: string = '',
        staffLine: number = 0,
        outputMidiNumber: number = 0,
        noteHeadDefault: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadHalf: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadWhole: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbol: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbolPlacement: TextBaseline = TextBaseline.Middle
    ) {
        this.elementType = elementType;
        this.outputMidiNumber = outputMidiNumber;
        this.staffLine = staffLine;
        this.noteHeadDefault = noteHeadDefault;
        this.noteHeadHalf = noteHeadHalf !== MusicFontSymbol.None ? noteHeadHalf : noteHeadDefault;
        this.noteHeadWhole = noteHeadWhole !== MusicFontSymbol.None ? noteHeadWhole : noteHeadDefault;
        this.techniqueSymbol = techniqueSymbol;
        this.techniqueSymbolPlacement = techniqueSymbolPlacement;
    }

    public getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.Whole:
                return this.noteHeadWhole;
            case Duration.Half:
                return this.noteHeadHalf;
            default:
                return this.noteHeadDefault;
        }
    }
}
