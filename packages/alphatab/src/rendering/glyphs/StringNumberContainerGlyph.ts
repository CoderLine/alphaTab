import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { Note } from '@coderline/alphatab/model/Note';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';

/**
 * @internal
 */
export class StringNumberContainerGlyph extends EffectGlyph {
    // top to bottom: highest note first
    private _strings: number[] = [];
    private _pitches: number[] = [];

    public addString(string: number, pitch: number) {
        if (this._strings.indexOf(string) >= 0) {
            return;
        }
        this._strings.push(string);
        this._pitches.push(pitch);
        let i = this._strings.length - 1;
        while (
            i > 0 &&
            (this._pitches[i - 1] < pitch || (this._pitches[i - 1] === pitch && this._strings[i - 1] < string))
        ) {
            this._strings[i] = this._strings[i - 1];
            this._pitches[i] = this._pitches[i - 1];
            i--;
        }
        this._strings[i] = string;
        this._pitches[i] = pitch;
    }

    public override doLayout(): void {
        const circleHeight =
            this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GuitarString0)! * this.renderer.smuflMetrics.tuningGlyphCircleNumberScale;
        this.height = (circleHeight + this.renderer.smuflMetrics.stringNumberCirclePadding) * this._strings.length;
        this.width = circleHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const stringCount = Note.getStringCount(this.renderer.bar.staff);

        let y = 0;
        const circleHeight =
            this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GuitarString0)! * this.renderer.smuflMetrics.tuningGlyphCircleNumberScale;
        for (const s of this._strings) {
            const stringValue = stringCount - s;
            const symbol = ((MusicFontSymbol.GuitarString1 as number) + stringValue) as MusicFontSymbol;
            CanvasHelper.fillMusicFontSymbolSafe(canvas,
                cx + this.x,
                cy + this.y + circleHeight + y,
                this.renderer.smuflMetrics.tuningGlyphCircleNumberScale,
                symbol,
                true
            );
            y += circleHeight + this.renderer.smuflMetrics.stringNumberCirclePadding;
        }
    }
}
