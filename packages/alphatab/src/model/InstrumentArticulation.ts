
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';


/**
 * This public enum lists all base line modes
 * @public
 */
export enum TechniqueSymbolPlacement {
    /**
     * Symbol is shown above
     */
    Above = 0,
    /**
     * Symbol is shown inside.
     */
    Inside = 1,
    /**
     * Symbol is shown below.
     */
    Below = 2,
    /**
     * Symbol is shown outside.
     */
    Outside = 3
}

/**
 * Describes an instrument articulation which is used for percussions.
 * @json
 * @json_strict
 * @public
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
    public techniqueSymbolPlacement: TechniqueSymbolPlacement;

    /**
     * Gets or sets which midi key to use when playing the note.
     */
    public outputMidiNumber: number;

    /**
     * Gets or sets the input MIDI number for this articulation.
     */
    public inputMidiNumber: number;

    /**
     * Gets or sets the RSE sound path for playback (e.g., 'stick.hit.hit').
     */
    public outputRSESound: string;

    /**
     * Gets or sets the soundbank name for the element (e.g., 'Master-Snare').
     */
    public soundbankName: string;

    /**
     * Gets or sets the display name for this articulation (e.g., 'Snare (hit)').
     */
    public articulationName: string;

    /**
     * Gets or sets the display name for the element (e.g., 'Snare').
     */
    public elementName: string;

    public constructor(
        elementName: string = '',
        elementType: string = '',
        articulationName: string = '',
        staffLine: number = 0,
        inputMidiNumber: number = 0,
        outputMidiNumber: number = 0,
        outputRSESound: string = '',
        soundbankName: string = '',
        noteHeadDefault: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadHalf: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadWhole: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbol: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbolPlacement: TechniqueSymbolPlacement = TechniqueSymbolPlacement.Outside,
    ) {
        this.elementName = elementName;
        this.elementType = elementType;
        this.articulationName = articulationName;
        this.staffLine = staffLine;
        this.inputMidiNumber = inputMidiNumber;
        this.outputMidiNumber = outputMidiNumber;
        this.outputRSESound = outputRSESound;
        this.soundbankName = soundbankName;
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
