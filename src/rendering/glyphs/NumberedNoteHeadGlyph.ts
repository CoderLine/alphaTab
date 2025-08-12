import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { type Beat, BeatSubElement } from '@src/model/Beat';
import { NoteSubElement } from '@src/model/Note';

export class NumberedNoteHeadGlyph extends Glyph {
    private _isGrace: boolean;
    private _beat: Beat;
    private _number: string;

    public constructor(x: number, y: number, number: string, isGrace: boolean, beat: Beat) {
        super(x, y);
        this._isGrace = isGrace;
        this._number = number;
        this._beat = beat;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = this._beat.isRest
            ? ElementStyleHelper.beat(canvas, BeatSubElement.NumberedRests, this._beat)
            : this._beat.notes.length > 0
              ? ElementStyleHelper.note(canvas, NoteSubElement.NumberedNumber, this._beat.notes[0])
              : undefined;

        const res = this.renderer.resources;
        canvas.font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Left;
        canvas.fillText(this._number.toString(), cx + this.x, cy + this.y);
    }

    public override doLayout(): void {
        const res = this.renderer.resources;
        const font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        const c = this.renderer.scoreRenderer.canvas!;
        c.font = font;
        const size =  c.measureText(`${this._number}`);
        this.height = size.height;
        this.width = size.width;
    }
}
