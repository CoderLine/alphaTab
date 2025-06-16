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
    private _tripletFeel: TripletFeel;

    public constructor(tripletFeel: TripletFeel) {
        super(0, 0);
        this._tripletFeel = tripletFeel;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.smuflMetrics.tripletFeelHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        const noteY: number = cy + this.height * NoteHeadGlyph.GraceScale;
        const tupletY: number = noteY + this.renderer.smuflMetrics.tripletFeelYPadding;
        canvas.font = this.renderer.resources.effectFont;
        canvas.fillText('(', cx, cy + this.height * this.renderer.smuflMetrics.tripletFeelBracketsHeightToY);

        const leftNoteX: number = cx + this.renderer.smuflMetrics.tripletFeelLeftNoteXPadding;
        const rightNoteX: number = cx + this.renderer.smuflMetrics.tripletFeelRightNoteXPadding;

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
                canvas.fillCircle(
                    rightNoteX + this.renderer.smuflMetrics.tripletFeelCircleOffset,
                    noteY,
                    this.renderer.smuflMetrics.tripletFeelCircleSize
                );
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

        canvas.fillMusicFontSymbols(
            leftNoteX,
            noteY,
            this.renderer.smuflMetrics.tripletFeelNoteScale,
            leftNoteSymbols,
            false
        );
        canvas.fillText(
            '=',
            cx + this.renderer.smuflMetrics.tripletFeelEqualsOffsetX,
            cy + this.renderer.smuflMetrics.tripletFeelEqualsOffsetY
        );
        canvas.fillMusicFontSymbols(
            rightNoteX,
            noteY,
            this.renderer.smuflMetrics.tripletFeelNoteScale,
            rightNoteSymbols,
            false
        );
        if (rightAugmentationSymbols.length > 0) {
            canvas.fillMusicFontSymbols(
                rightNoteX + this.renderer.smuflMetrics.tripletFeelAugmentationOffsetX,
                noteY,
                this.renderer.smuflMetrics.tripletFeelNoteScale,
                rightAugmentationSymbols,
                false
            );
        }
        if (rightTupletSymbols.length > 0) {
            canvas.fillMusicFontSymbols(
                rightNoteX,
                tupletY,
                this.renderer.smuflMetrics.tripletFeelTupletScale,
                rightTupletSymbols,
                false
            );
        }

        canvas.fillText(
            ')',
            cx + this.renderer.smuflMetrics.tripletFeelCloseParenthesisOffsetX,
            cy + this.height * this.renderer.smuflMetrics.tripletFeelBracketsHeightToY
        );
    }
}
