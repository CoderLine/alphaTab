import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Tuning } from '@src/model/Tuning';
import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import type { Color } from '@src/model/Color';

export class TuningGlyph extends GlyphGroup {
    private _tuning: Tuning;
    private _trackLabel: string;

    public colorOverride?: Color;

    public constructor(x: number, y: number, tuning: Tuning, trackLabel: string) {
        super(x, y);
        this._tuning = tuning;
        this._trackLabel = trackLabel;
        this.glyphs = [];
    }

    public override doLayout() {
        if (this.glyphs!.length > 0) {
            return;
        }
        this.createGlyphs(this._tuning);
        for (const g of this.glyphs!) {
            g.renderer = this.renderer;
            g.doLayout();
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }
        super.paint(cx, cy, canvas);
        canvas.color = c;
    }

    private createGlyphs(tuning: Tuning): void {
        const res = this.renderer.resources;
        this.height = 0;

        // Track name
        if (this._trackLabel.length > 0) {
            const trackName = new TextGlyph(0, this.height, this._trackLabel, res.effectFont, TextAlign.Left);
            trackName.renderer = this.renderer;
            trackName.doLayout();
            this.height += trackName.height;
            this.addGlyph(trackName);
        }

        // Name
        if (tuning.name.length > 0) {
            const tuningName = new TextGlyph(0, this.height, tuning.name, res.effectFont, TextAlign.Left);
            tuningName.renderer = this.renderer;
            tuningName.doLayout();
            this.height += tuningName.height;
            this.addGlyph(tuningName);
        }

        const circleScale = this.renderer.smuflMetrics.tuningGlyphCircleNumberScale;
        const circleHeight = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.GuitarString0)! * circleScale;

        this.renderer.scoreRenderer.canvas!.font = res.effectFont;
        const stringColumnWidth =
            (circleHeight + this.renderer.scoreRenderer.canvas!.measureText(' = Gb').width) *
            res.smuflMetrics.tuningGlyphStringColumnScale;

        this.width = Math.max(
            this.renderer.scoreRenderer.canvas!.measureText(this._trackLabel).width,
            Math.max(this.renderer.scoreRenderer.canvas!.measureText(tuning.name).width, 2 * stringColumnWidth)
        );

        if (!tuning.isStandard) {
            // Strings
            const stringsPerColumn: number = Math.ceil(tuning.tunings.length / 2.0) | 0;
            let currentX: number = 0;
            const topY = this.height;
            let currentY: number = topY;
            for (let i: number = 0, j: number = tuning.tunings.length; i < j; i++) {
                const symbol = ((MusicFontSymbol.GuitarString0 as number) + (i + 1)) as MusicFontSymbol;
                this.addGlyph(new MusicFontGlyph(currentX, currentY + circleHeight, circleScale, symbol));

                const str: string = ` = ${Tuning.getTextForTuning(tuning.tunings[i], false)}`;
                this.addGlyph(
                    new TextGlyph(
                        currentX + circleHeight,
                        currentY + circleHeight / 2,
                        str,
                        res.effectFont,
                        TextAlign.Left,
                        TextBaseline.Middle
                    )
                );
                currentY += circleHeight * 1.5;
                const bottomY = currentY;
                if (this.height < bottomY) {
                    this.height = bottomY;
                }

                if (i === stringsPerColumn - 1) {
                    currentY = topY;
                    currentX += stringColumnWidth;
                }
            }
        }
    }
}
