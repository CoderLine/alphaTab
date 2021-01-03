import { Tuning } from '@src/model/Tuning';
import { TextAlign } from '@src/platform/ICanvas';
import { RowContainerGlyph } from './RowContainerGlyph';
import { TuningGlyph } from './TuningGlyph';

export class TuningContainerGlyph extends RowContainerGlyph {
    public constructor(x: number, y: number) {
        super(x, y, TextAlign.Left);
    }

    public addTuning(tuning: Tuning, trackLabel: string): void {
        if (tuning.tunings.length > 0) {
            let tuningGlyph: TuningGlyph = new TuningGlyph(0, 0, tuning, trackLabel);
            tuningGlyph.renderer = this.renderer;
            tuningGlyph.doLayout();
            this.glyphs!.push(tuningGlyph);
        }
    }
}
