import { TextBaseline } from "@src/platform/ICanvas";
import { Duration } from "./Duration";
import { MusicFontSymbol } from "./MusicFontSymbol";

export class InstrumentArticulation {
    public name: string = "";
    public staffLine: number;
    public noteHeadDefault: MusicFontSymbol;
    public noteHeadHalf: MusicFontSymbol;
    public noteHeadWhole: MusicFontSymbol;
    public techniqueSymbol: MusicFontSymbol;
    public techniqueSymbolPlacement: TextBaseline;
    public outputMidiNumber: number;

    public constructor(staffLine: number = 0,
        outputMidiNumber: number = 0,
        noteHeadDefault: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadHalf: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadWhole: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbol: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbolPlacement: TextBaseline = TextBaseline.Middle) {
        this.outputMidiNumber = outputMidiNumber;
        this.staffLine = staffLine;
        this.noteHeadDefault = noteHeadDefault;
        this.noteHeadHalf = noteHeadHalf !== MusicFontSymbol.None ? noteHeadHalf : noteHeadDefault;
        this.noteHeadWhole = noteHeadWhole !== MusicFontSymbol.None ? noteHeadWhole : noteHeadDefault;
        this.techniqueSymbol = techniqueSymbol;
        this.techniqueSymbolPlacement = techniqueSymbolPlacement;
    }

    public static copyTo(src: any, dst: InstrumentArticulation) {
        dst.outputMidiNumber = src.outputMidiNumber;
        dst.staffLine = src.staffLine;
        dst.noteHeadDefault = src.noteHeadDefault;
        dst.noteHeadHalf = src.noteHeadHalf;
        dst.noteHeadWhole = src.noteHeadWhole;
        dst.techniqueSymbol = src.techniqueSymbol;
        dst.techniqueSymbolPlacement = src.techniqueSymbolPlacement;
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