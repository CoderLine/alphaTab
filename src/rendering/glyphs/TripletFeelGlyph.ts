import { TripletFeel } from '@src/model/TripletFeel';
import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export enum TripletFeelGlyphBarType {
    Full = 0,
    PartialLeft = 1,
    PartialRight = 2
}

export class TripletFeelGlyph extends EffectGlyph {
    private static readonly NoteScale: number = 0.5;
    private static readonly TupletScale: number = 0.7;

    private _tripletFeel: TripletFeel;

    public constructor(tripletFeel: TripletFeel) {
        super(0, 0);
        this._tripletFeel = tripletFeel;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = 25;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        const noteY: number = cy + this.height * NoteHeadGlyph.GraceScale;
        const tupletY: number = noteY + 8;
        canvas.font = this.renderer.resources.effectFont;
        canvas.fillText('(', cx, cy + this.height * 0.3);

        const leftNoteX: number = cx + 10;
        const rightNoteX: number = cx + 40;

        let leftNoteSymbols: MusicFontSymbol[] = [];
        let rightAugmentationSymbols: MusicFontSymbol[] = [];
        let rightNoteSymbols: MusicFontSymbol[] = [];
        let rightTupletSymbols: MusicFontSymbol[] = [];

        switch (this._tripletFeel) {
            case TripletFeel.NoTripletFeel:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                break;
            case TripletFeel.Triplet8th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.Space,
                    MusicFontSymbol.NoteEighthUp
                ];

                rightTupletSymbols = [
                    MusicFontSymbol.TextTupletBracketStartLongStem,
                    MusicFontSymbol.TextTuplet3LongStem,
                    MusicFontSymbol.TextTupletBracketEndLongStem
                ];
                break;
            case TripletFeel.Triplet16th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac16thLongStem
                ];

                rightTupletSymbols = [
                    MusicFontSymbol.TextTupletBracketStartLongStem,
                    MusicFontSymbol.TextTuplet3LongStem,
                    MusicFontSymbol.TextTupletBracketEndLongStem
                ];
                break;
            case TripletFeel.Dotted8th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                rightAugmentationSymbols = [MusicFontSymbol.TextAugmentationDot];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac16thLongStem
                ];
                break;
            case TripletFeel.Dotted16th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont16thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac16thLongStem
                ];

                rightAugmentationSymbols = [MusicFontSymbol.TextAugmentationDot];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont16thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac32ndLongStem
                ];
                canvas.fillCircle(rightNoteX + 9, noteY, 1);
                break;
            case TripletFeel.Scottish8th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont8thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem
                ];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont16thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac8thLongStem,
                    MusicFontSymbol.TextAugmentationDot
                ];
                break;
            case TripletFeel.Scottish16th:
                leftNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont16thBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac16thLongStem
                ];

                rightNoteSymbols = [
                    MusicFontSymbol.TextBlackNoteLongStem,
                    MusicFontSymbol.TextCont32ndBeamLongStem,
                    MusicFontSymbol.TextBlackNoteFrac16thLongStem,
                    MusicFontSymbol.TextAugmentationDot
                ];
                break;
        }

        canvas.fillMusicFontSymbols(leftNoteX, noteY, TripletFeelGlyph.NoteScale, leftNoteSymbols, false);
        canvas.fillText('=', cx + 32, cy + 5);
        canvas.fillMusicFontSymbols(rightNoteX, noteY, TripletFeelGlyph.NoteScale, rightNoteSymbols, false);
        if (rightAugmentationSymbols.length > 0) {
            canvas.fillMusicFontSymbols(
                rightNoteX + 7,
                noteY,
                TripletFeelGlyph.NoteScale,
                rightAugmentationSymbols,
                false
            );
        }
        if (rightTupletSymbols.length > 0) {
            canvas.fillMusicFontSymbols(rightNoteX, tupletY, TripletFeelGlyph.TupletScale, rightTupletSymbols, false);
        }

        canvas.fillText(')', cx + 65, cy + this.height * 0.3);
    }
}
