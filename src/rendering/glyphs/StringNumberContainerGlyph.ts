import { ICanvas } from '@src/platform';
import { EffectGlyph } from './EffectGlyph';
import { TuningGlyph } from './TuningGlyph';
import { MusicFontSymbol } from '@src/model';
import { NoteHeadGlyph } from './NoteHeadGlyph';

export class StringNumberContainerGlyph extends EffectGlyph {
    private _strings: Set<number> = new Set<number>();

    public addString(string: number) {
        this._strings.add(string);
    }

    public override doLayout(): void {
        const circleHeight = TuningGlyph.CircleNumberHeight * TuningGlyph.CircleNumberScale;
        this.height = (circleHeight + 3) * this._strings.size;
        this.width = circleHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const tuningLength = this.renderer.bar.staff.tuning.length;

        let y = 0;
        const circleHeight = TuningGlyph.CircleNumberHeight * TuningGlyph.CircleNumberScale;
        for (const s of this._strings) {
            const stringValue = tuningLength - s;
            const symbol = ((MusicFontSymbol.GuitarString1 as number) + stringValue) as MusicFontSymbol;
            canvas.fillMusicFontSymbol(
                cx + this.x + NoteHeadGlyph.NoteHeadHeight / 2,
                cy + this.y + circleHeight + y,
                TuningGlyph.CircleNumberScale,
                symbol,
                true
            );
            y += circleHeight + 3;
        }
    }
}
