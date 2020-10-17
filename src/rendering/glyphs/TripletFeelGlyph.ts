import { Font } from '@src/model/Font';
import { TripletFeel } from '@src/model/TripletFeel';
import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export enum TripletFeelGlyphBarType {
    Full,
    PartialLeft,
    PartialRight
}

export class TripletFeelGlyph extends EffectGlyph {
    private static readonly NoteScale: number = 0.4;
    private static readonly NoteHeight: number = 12;
    private static readonly NoteSeparation: number = 12;
    private static readonly BarHeight: number = 2;
    private static readonly BarSeparation: number = 3;

    private _tripletFeel: TripletFeel;

    public constructor(tripletFeel: TripletFeel) {
        super(0, 0);
        this._tripletFeel = tripletFeel;
    }

    public doLayout(): void {
        super.doLayout();
        this.height = 25 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        let noteY: number = cy + this.height * NoteHeadGlyph.GraceScale;
        canvas.font = this.renderer.resources.effectFont;
        canvas.fillText('(', cx, cy + this.height * 0.3);
        let leftNoteX: number = cx + 10 * this.scale;
        let rightNoteX: number = cx + 40 * this.scale;
        switch (this._tripletFeel) {
            case TripletFeel.NoTripletFeel:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [TripletFeelGlyphBarType.Full]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [TripletFeelGlyphBarType.Full]);
                break;
            case TripletFeel.Triplet8th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [TripletFeelGlyphBarType.Full]);
                canvas.fillMusicFontSymbol(rightNoteX, noteY, TripletFeelGlyph.NoteScale, MusicFontSymbol.NoteQuarterUp, false);
                canvas.fillMusicFontSymbol(rightNoteX + TripletFeelGlyph.NoteSeparation * this.scale, noteY, TripletFeelGlyph.NoteScale, MusicFontSymbol.NoteEighthUp, false);
                this.renderTriplet(rightNoteX, cy, canvas);
                break;
            case TripletFeel.Triplet16th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.Full
                ]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.PartialRight
                ]);
                this.renderTriplet(rightNoteX, cy, canvas);
                break;
            case TripletFeel.Dotted8th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [TripletFeelGlyphBarType.Full]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.PartialRight
                ]);
                canvas.fillCircle(rightNoteX + 9 * this.scale, noteY, this.scale);
                break;
            case TripletFeel.Dotted16th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.Full
                ]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.PartialRight
                ]);
                canvas.fillCircle(rightNoteX + 9 * this.scale, noteY, this.scale);
                break;
            case TripletFeel.Scottish8th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [TripletFeelGlyphBarType.Full]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.PartialLeft
                ]);
                canvas.fillCircle(rightNoteX + TripletFeelGlyph.NoteSeparation * this.scale + 8 * this.scale, noteY, this.scale);
                break;
            case TripletFeel.Scottish16th:
                this.renderBarNote(leftNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.Full
                ]);
                this.renderBarNote(rightNoteX, noteY, TripletFeelGlyph.NoteScale, canvas, [
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.Full,
                    TripletFeelGlyphBarType.PartialLeft
                ]);
                canvas.fillCircle(rightNoteX + TripletFeelGlyph.NoteSeparation * this.scale + 8 * this.scale, noteY, this.scale);
                break;
        }
        canvas.fillText('=', cx + 30 * this.scale, cy + 5 * this.scale);
        canvas.fillText(')', cx + 65 * this.scale, cy + this.height * 0.3);
    }

    private renderBarNote(
        cx: number,
        noteY: number,
        noteScale: number,
        canvas: ICanvas,
        bars: TripletFeelGlyphBarType[]
    ): void {
        canvas.fillMusicFontSymbol(cx, noteY, noteScale, MusicFontSymbol.NoteQuarterUp, false);
        let partialBarWidth: number = (TripletFeelGlyph.NoteSeparation / 2) * this.scale;
        for (let i: number = 0; i < bars.length; i++) {
            switch (bars[i]) {
                case TripletFeelGlyphBarType.Full:
                    canvas.fillRect(
                        cx + 4 * this.scale,
                        noteY - TripletFeelGlyph.NoteHeight * this.scale + TripletFeelGlyph.BarSeparation * this.scale * i,
                        TripletFeelGlyph.NoteSeparation * this.scale,
                        TripletFeelGlyph.BarHeight * this.scale
                    );
                    break;
                case TripletFeelGlyphBarType.PartialLeft:
                    canvas.fillRect(
                        cx + 4 * this.scale,
                        noteY - TripletFeelGlyph.NoteHeight * this.scale + TripletFeelGlyph.BarSeparation * this.scale * i,
                        partialBarWidth,
                        TripletFeelGlyph.BarHeight * this.scale
                    );
                    break;
                case TripletFeelGlyphBarType.PartialRight:
                    canvas.fillRect(
                        cx + 4 * this.scale + partialBarWidth,
                        noteY - TripletFeelGlyph.NoteHeight * this.scale + TripletFeelGlyph.BarSeparation * this.scale * i,
                        partialBarWidth,
                        TripletFeelGlyph.BarHeight * this.scale
                    );
                    break;
            }
        }
        canvas.fillMusicFontSymbol(cx + TripletFeelGlyph.NoteSeparation * this.scale, noteY, noteScale, MusicFontSymbol.NoteQuarterUp, false);
    }

    private renderTriplet(cx: number, cy: number, canvas: ICanvas): void {
        cy += 2 * this.scale;
        let font: Font = this.renderer.resources.effectFont;
        canvas.font = new Font(font.family, font.size * 0.8, font.style);
        let rightX: number = cx + TripletFeelGlyph.NoteSeparation * this.scale + 3 * this.scale;
        canvas.beginPath();
        canvas.moveTo(cx, cy + 3 * this.scale);
        canvas.lineTo(cx, cy);
        canvas.lineTo(cx + 5 * this.scale, cy);
        canvas.moveTo(rightX + 5 * this.scale, cy + 3 * this.scale);
        canvas.lineTo(rightX + 5 * this.scale, cy);
        canvas.lineTo(rightX, cy);
        canvas.stroke();
        canvas.fillText('3', cx + 7 * this.scale, cy - 10 * this.scale);
        canvas.font = font;
    }
}
