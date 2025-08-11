import { TripletFeel } from '@src/model/TripletFeel';
import { CanvasHelper, TextAlign, TextBaseline, type ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

enum TripletFeelNoteGroup {
    EighthEighth = 0,
    SixteenthSixteenth = 1,
    QuarterTripletEighthTriplet = 2,
    EighthSixteenthTriplet = 3,
    EighthDottedSixteenth = 4,
    SixteenthDottedThirtySecond = 5,
    SixteenthEighthDotted = 6,
    ThirtySecondSixteenthDotted = 7
}

export class TripletFeelGlyph extends EffectGlyph {
    private _tripletFeel: TripletFeel;
    private _tupletHeight: number = 0;
    private _tupletPadding: number = 0;

    public constructor(tripletFeel: TripletFeel) {
        super(0, 0);
        this._tripletFeel = tripletFeel;
    }

    public override doLayout(): void {
        super.doLayout();
        const noteScale = this.renderer.smuflMetrics.tempoNoteScale;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.MetNoteQuarterUp)! * noteScale;

        this._tupletHeight = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.Tuplet3)! * noteScale;
        this._tupletPadding = this.renderer.smuflMetrics.tripletFeelTripletPadding;
        this.height += this._tupletHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;

        let leftNotes = TripletFeelNoteGroup.EighthEighth;
        let rightNotes = TripletFeelNoteGroup.EighthEighth;

        switch (this._tripletFeel) {
            case TripletFeel.NoTripletFeel:
                leftNotes = TripletFeelNoteGroup.EighthEighth;
                rightNotes = TripletFeelNoteGroup.EighthEighth;
                break;
            case TripletFeel.Triplet8th:
                leftNotes = TripletFeelNoteGroup.EighthEighth;
                rightNotes = TripletFeelNoteGroup.QuarterTripletEighthTriplet;
                break;
            case TripletFeel.Triplet16th:
                leftNotes = TripletFeelNoteGroup.SixteenthSixteenth;
                rightNotes = TripletFeelNoteGroup.EighthSixteenthTriplet;
                break;
            case TripletFeel.Dotted8th:
                leftNotes = TripletFeelNoteGroup.EighthEighth;
                rightNotes = TripletFeelNoteGroup.EighthDottedSixteenth;
                break;
            case TripletFeel.Dotted16th:
                leftNotes = TripletFeelNoteGroup.SixteenthSixteenth;
                rightNotes = TripletFeelNoteGroup.SixteenthDottedThirtySecond;
                break;
            case TripletFeel.Scottish8th:
                leftNotes = TripletFeelNoteGroup.EighthEighth;
                rightNotes = TripletFeelNoteGroup.SixteenthEighthDotted;
                break;
            case TripletFeel.Scottish16th:
                leftNotes = TripletFeelNoteGroup.SixteenthSixteenth;
                rightNotes = TripletFeelNoteGroup.ThirtySecondSixteenthDotted;
                break;
        }

        const noteScale = this.renderer.smuflMetrics.tempoNoteScale;
        const noteY: number =
            cy + this.renderer.smuflMetrics.glyphTop.get(MusicFontSymbol.MetNoteQuarterUp)! * noteScale;

        const textY: number = cy + this.height;

        const b = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Bottom;
        canvas.font = this.renderer.resources.effectFont;

        canvas.fillText('(', cx, textY);
        cx += canvas.measureText('( ').width;

        cx = this.drawGroup(cx, noteY + this._tupletHeight, canvas, leftNotes);

        canvas.fillText(' = ', cx, textY);
        cx += canvas.measureText(' = ').width;

        cx = this.drawGroup(cx, noteY + this._tupletHeight, canvas, rightNotes);

        canvas.fillText(' )', cx, textY);

        canvas.textBaseline = b;
    }

    private drawGroup(cx: number, cy: number, canvas: ICanvas, group: TripletFeelNoteGroup) {
        const noteScale = this.renderer.smuflMetrics.tempoNoteScale;

        let leftNote: MusicFontSymbol[] = [];
        let rightNote: MusicFontSymbol[] = [];

        const beams: TextAlign[] = [];

        let tuplet = MusicFontSymbol.None;

        switch (group) {
            case TripletFeelNoteGroup.EighthEighth:
                beams.push(TextAlign.Center);
                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [MusicFontSymbol.MetNoteQuarterUp];
                break;
            case TripletFeelNoteGroup.SixteenthSixteenth:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Center);

                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [MusicFontSymbol.MetNoteQuarterUp];
                break;

            case TripletFeelNoteGroup.QuarterTripletEighthTriplet:
                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [MusicFontSymbol.MetNote8thUp];

                tuplet = MusicFontSymbol.Tuplet3;

                break;
            case TripletFeelNoteGroup.EighthSixteenthTriplet:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Right);

                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [MusicFontSymbol.MetNoteQuarterUp];

                tuplet = MusicFontSymbol.Tuplet3;

                break;
            case TripletFeelNoteGroup.EighthDottedSixteenth:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Right);

                leftNote = [
                    MusicFontSymbol.MetNoteQuarterUp,
                    MusicFontSymbol.Space,
                    MusicFontSymbol.MetAugmentationDot
                ];
                rightNote = [MusicFontSymbol.MetNoteQuarterUp];

                break;
            case TripletFeelNoteGroup.SixteenthDottedThirtySecond:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Right);

                leftNote = [
                    MusicFontSymbol.MetNoteQuarterUp,
                    MusicFontSymbol.Space,
                    MusicFontSymbol.MetAugmentationDot
                ];
                rightNote = [MusicFontSymbol.MetNoteQuarterUp];

                break;
            case TripletFeelNoteGroup.SixteenthEighthDotted:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Left);

                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [
                    MusicFontSymbol.MetNoteQuarterUp,
                    MusicFontSymbol.Space,
                    MusicFontSymbol.MetAugmentationDot
                ];

                break;
            case TripletFeelNoteGroup.ThirtySecondSixteenthDotted:
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Center);
                beams.push(TextAlign.Left);

                leftNote = [MusicFontSymbol.MetNoteQuarterUp];
                rightNote = [
                    MusicFontSymbol.MetNoteQuarterUp,
                    MusicFontSymbol.Space,
                    MusicFontSymbol.MetAugmentationDot
                ];

                break;
        }

        const noteSpacing = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! * noteScale;
        const beamStartX = cx + noteSpacing - this.renderer.smuflMetrics.stemThickness * noteScale;
        const beamEndX = beamStartX + noteSpacing * 2 + this.renderer.smuflMetrics.stemThickness * noteScale;
        const beamHeight = this.renderer.smuflMetrics.tempoNoteScale * this.renderer.smuflMetrics.beamThickness;
        const beamSpacing = this.renderer.smuflMetrics.tempoNoteScale * this.renderer.smuflMetrics.beamSpacing;

        const brokenBeamWidth = this.renderer.smuflMetrics.brokenBeamWidth * noteScale;
        let beamY =
            cy -
            this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.MetNoteQuarterUp)! * noteScale +
            beamHeight;

        if (tuplet !== MusicFontSymbol.None) {
            const tupletLeftX = cx;
            const tupletRightX = beamEndX;
            const tupletCenterX = (tupletLeftX + tupletRightX) / 2;

            const tupletY = beamY - this._tupletHeight - this._tupletPadding;
            const tupletTop = this.renderer.smuflMetrics.glyphTop.get(tuplet)! * noteScale;
            const tupletWidth = this.renderer.smuflMetrics.glyphWidths.get(tuplet)! * noteScale;

            CanvasHelper.fillMusicFontSymbolSafe(canvas, tupletCenterX, tupletY + tupletTop, noteScale, tuplet, true);

            const numberLeftX = tupletCenterX - tupletWidth / 2 - this._tupletPadding;
            const numberRightX = tupletCenterX + tupletWidth / 2 + this._tupletPadding;
            const halfTuplet = this._tupletHeight / 2;
            const l = canvas.lineWidth;
            canvas.beginPath();
            canvas.moveTo(cx, tupletY + halfTuplet + halfTuplet);
            canvas.lineTo(cx, tupletY + halfTuplet);
            canvas.lineTo(numberLeftX, tupletY + halfTuplet);

            canvas.moveTo(numberRightX, tupletY + halfTuplet);
            canvas.lineTo(beamEndX, tupletY + halfTuplet);
            canvas.lineTo(beamEndX, tupletY + halfTuplet + halfTuplet);

            canvas.lineWidth = this.renderer.smuflMetrics.tupletBracketThickness * noteScale;
            canvas.stroke();
            canvas.lineWidth = l;
        }

        canvas.fillMusicFontSymbols(cx, cy, noteScale, leftNote, false);
        cx += noteSpacing;

        cx += noteSpacing;

        canvas.fillMusicFontSymbols(cx, cy, noteScale, rightNote, false);
        cx += noteSpacing;
        if (
            rightNote[rightNote.length - 1] === MusicFontSymbol.MetAugmentationDot ||
            rightNote[0] === MusicFontSymbol.MetNote8thUp
        ) {
            cx += noteSpacing;
        }

        for (const b of beams) {
            switch (b) {
                case TextAlign.Left:
                    canvas.fillRect(beamStartX, beamY, brokenBeamWidth, beamHeight);
                    break;
                case TextAlign.Center:
                    canvas.fillRect(beamStartX, beamY, beamEndX - beamStartX, beamHeight);
                    break;
                case TextAlign.Right:
                    canvas.fillRect(beamEndX - brokenBeamWidth, beamY, brokenBeamWidth, beamHeight);
                    break;
            }
            beamY += beamHeight + beamSpacing;
        }

        return cx;
    }
}
