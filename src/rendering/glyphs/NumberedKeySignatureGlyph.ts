import { Glyph } from '@src/rendering/glyphs/Glyph';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { AccidentalType } from '@src/model/AccidentalType';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { KeySignature } from '@src/model/KeySignature';
import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { BarSubElement } from '@src/model/Bar';

export class NumberedKeySignatureGlyph extends Glyph {
    private _keySignature: KeySignature;
    private _keySignatureType: KeySignatureType;

    private _text: string = '';
    private _accidental: AccidentalType = AccidentalType.None;
    private _accidentalOffset: number = 0;

    public constructor(x: number, y: number, keySignature: KeySignature, keySignatureType: KeySignatureType) {
        super(x, y);
        this._keySignature = keySignature;
        this._keySignatureType = keySignatureType;
    }

    public override doLayout(): void {
        super.doLayout();
        const text = '1 = ';
        let text2 = '';
        let accidental = AccidentalType.None;
        switch (this._keySignatureType) {
            case KeySignatureType.Major:
                switch (this._keySignature) {
                    case KeySignature.Cb:
                        text2 = '  C';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Gb:
                        text2 = '  G';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Db:
                        text2 = '  D';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Ab:
                        text2 = '  A';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Eb:
                        text2 = '  E';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Bb:
                        text2 = '  B';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.F:
                        text2 = 'F';
                        break;
                    case KeySignature.C:
                        text2 = 'C';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.G:
                        text2 = 'G';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.D:
                        text2 = 'D';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.A:
                        text2 = 'A';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.E:
                        text2 = 'E';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.B:
                        text2 = 'B';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.FSharp:
                        text2 = '  F';
                        accidental = AccidentalType.Sharp;
                        break;
                    case KeySignature.CSharp:
                        text2 = '  C';
                        accidental = AccidentalType.Sharp;
                        break;
                }
                break;
            case KeySignatureType.Minor:
                switch (this._keySignature) {
                    case KeySignature.Cb:
                        text2 = '  a';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Gb:
                        text2 = '  e';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Db:
                        text2 = '  b';
                        accidental = AccidentalType.Flat;
                        break;
                    case KeySignature.Ab:
                        text2 = 'f';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.Eb:
                        text2 = 'c';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.Bb:
                        text2 = 'g';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.F:
                        text2 = 'd';
                        break;
                    case KeySignature.C:
                        text2 = 'a';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.G:
                        text2 = 'e';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.D:
                        text2 = 'b';
                        accidental = AccidentalType.None;
                        break;
                    case KeySignature.A:
                        text2 = '  f';
                        accidental = AccidentalType.Sharp;
                        break;
                    case KeySignature.E:
                        text2 = '  c';
                        accidental = AccidentalType.Sharp;
                        break;
                    case KeySignature.B:
                        text2 = '  g';
                        accidental = AccidentalType.Sharp;
                        break;
                    case KeySignature.FSharp:
                        text2 = '  d';
                        accidental = AccidentalType.Sharp;
                        break;
                    case KeySignature.CSharp:
                        text2 = '  a';
                        accidental = AccidentalType.Sharp;
                        break;
                }
                break;
        }

        this._text = text + text2;
        this._accidental = accidental;
        const c = this.renderer.scoreRenderer.canvas!;
        const res = this.renderer.resources;
        c.font = res.numberedNotationFont;
        this._accidentalOffset = c.measureText(text).width;
        this.width = c.measureText(text + text2).width;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.NumberedKeySignature, this.renderer.bar);

        const res = this.renderer.resources;
        canvas.font = res.numberedNotationFont;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.fillText(this._text, cx + this.x, cy + this.y);

        if (this._accidental !== AccidentalType.None) {
            canvas.fillMusicFontSymbol(
                cx + this.x + this._accidentalOffset,
                cy + this.y,
                0.7,
                AccidentalGlyph.getMusicSymbol(this._accidental),
                false
            );
        }
    }
}
