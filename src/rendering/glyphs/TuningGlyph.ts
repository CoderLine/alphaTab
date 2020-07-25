import { Tuning } from '@src/model/Tuning';
import { TextAlign } from '@src/platform/ICanvas';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { RenderingResources } from '@src/RenderingResources';

export class TuningGlyph extends GlyphGroup {
    private _scale: number = 0;
    private _resources: RenderingResources;
    public height: number = 0;

    public constructor(x: number, y: number, scale: number, resources: RenderingResources, tuning: Tuning) {
        super(x, y);
        this._scale = scale;
        this._resources = resources;
        this.createGlyphs(tuning);
    }

    private createGlyphs(tuning: Tuning): void {
        // Name
        this.addGlyph(new TextGlyph(0, 0, tuning.name, this._resources.effectFont, TextAlign.Left));
        this.height += 15 * this._scale;
        if (!tuning.isStandard) {
            // Strings
            let stringsPerColumn: number = Math.ceil(tuning.tunings.length / 2.0) | 0;
            let currentX: number = 0;
            let currentY: number = this.height;
            for (let i: number = 0, j: number = tuning.tunings.length; i < j; i++) {
                let str: string = '(' + (i + 1) + ') = ' + Tuning.getTextForTuning(tuning.tunings[i], false);
                this.addGlyph(new TextGlyph(currentX, currentY, str, this._resources.effectFont, TextAlign.Left));
                currentY += this.height;
                if (i === stringsPerColumn - 1) {
                    currentY = this.height;
                    currentX += 43 * this._scale;
                }
            }
            this.height += stringsPerColumn * (15 * this._scale);
        }
    }
}
