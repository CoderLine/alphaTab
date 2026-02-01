import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { CanvasHelper, type ICanvas, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class NumberedKeySignatureGlyph extends EffectGlyph {
    private _keySignature: KeySignature;
    private _keySignatureType: KeySignatureType;

    private _text: string = '';
    private _accidental: AccidentalType = AccidentalType.None;
    private _accidentalOffset: number = 0;
    private _padding: number = 0;

    public constructor(x: number, y: number, keySignature: KeySignature, keySignatureType: KeySignatureType) {
        super(x, y);
        this._keySignature = keySignature;
        this._keySignatureType = keySignatureType;
    }

    public override doLayout(): void {
        super.doLayout();
        let text = '';
        let text2 = '';
        let accidental = AccidentalType.None;
        switch (this._keySignatureType) {
            case KeySignatureType.Major:
                text = '1 = ';
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
                text = '6 = ';
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
        const settings = this.renderer.settings;
        const res = settings.display.resources;
        c.font = res.numberedNotationFont;
        this._accidentalOffset = c.measureText(text).width;
        const fullSize = c.measureText(text + text2);
        this._padding =
            this.renderer.index === 0 ? settings.display.firstStaffPaddingLeft : settings.display.staffPaddingLeft;
        this.width = this._padding + fullSize.width;
        this.height = fullSize.height;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.NumberedKeySignature, this.renderer.bar);

        const res = this.renderer.resources;
        canvas.font = res.numberedNotationFont;
        canvas.textBaseline = TextBaseline.Alphabetic;
        canvas.fillText(this._text, cx + this.x + this._padding, cy + this.y + this.height);

        if (this._accidental !== AccidentalType.None) {
            CanvasHelper.fillMusicFontSymbolSafe(
                canvas,
                cx + this.x + this._padding + this._accidentalOffset,
                cy + this.y + this.height,
                1,
                AccidentalGlyph.getMusicSymbol(this._accidental),
                false
            );
        }
    }
}
