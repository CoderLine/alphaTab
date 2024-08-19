import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { NoteHeadGlyph } from './NoteHeadGlyph';
import { Glyph } from './Glyph';

export class NumberedNoteHeadGlyph extends Glyph {
    public static readonly NoteHeadHeight: number = 17;
    public static readonly NoteHeadWidth: number = 12;

    private _isGrace: boolean;
    private _number: string;

    public constructor(x: number, y: number, number: string, isGrace: boolean) {
        super(x, y);
        this._isGrace = isGrace;
        this._number = number;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const res = this.renderer.resources;
        canvas.font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Left;
        canvas.fillText(this._number.toString(), cx + this.x, cy + this.y);
    }

    public override doLayout(): void {
        const scale: number = (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        this.width = NumberedNoteHeadGlyph.NoteHeadWidth * scale;
        this.height = NumberedNoteHeadGlyph.NoteHeadHeight * scale;
    }
}
