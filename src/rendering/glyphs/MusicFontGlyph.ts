import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { Color } from '@src/model/Color';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    public symbol: MusicFontSymbol;
    public center: boolean = false;
    public colorOverride?: Color;
    public offsetX: number = 0;
    public offsetY: number = 0;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
    }

    public override getBoundingBoxTop(): number {
        const bBoxTop = this.renderer.smuflMetrics.glyphTop.get(this.symbol)!;
        return this.y - this.offsetY - bBoxTop;
    }

    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.get(this.symbol)! * this.glyphScale;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(this.symbol)! * this.glyphScale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.width === 0 && this.height === 0) {
            return;
        }

        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }
        canvas.fillMusicFontSymbol(
            cx + this.x + this.offsetX,
            cy + this.y + this.offsetY,
            this.glyphScale,
            this.symbol,
            this.center
        );
        canvas.color = c;
    }
}

export class MusicFontTextGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    public symbols: MusicFontSymbol[];
    public center: boolean = false;
    public colorOverride?: Color;
    public offsetX: number = 0;
    public offsetY: number = 0;

    public constructor(x: number, y: number, glyphScale: number, symbols: MusicFontSymbol[]) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbols = symbols;
    }

    public override getBoundingBoxTop(): number {
        let bBoxTop = 0;
        for (let i = 0; i < this.symbols.length; i++) {
            const gTop = this.renderer.smuflMetrics.glyphTop.get(this.symbols[i])!;
            if (i === 0 || gTop < bBoxTop) {
                bBoxTop = gTop;
            }
        }
        return this.y - this.offsetY - bBoxTop;
    }

    public override doLayout(): void {
        this.width = 0;
        this.height = 0;
        for (let i = 0; i < this.symbols.length; i++) {
            const gWidth = this.renderer.smuflMetrics.glyphWidths.get(this.symbols[i])! * this.glyphScale;
            const gHeight = this.renderer.smuflMetrics.glyphHeights.get(this.symbols[i])! * this.glyphScale;
            if (i === 0 || gWidth > this.width) {
                this.width = gWidth;
            }
            if (i === 0 || gHeight > this.height) {
                this.height = gHeight;
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.width === 0 && this.height === 0) {
            return;
        }

        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }
        canvas.fillMusicFontSymbols(
            cx + this.x + this.offsetX,
            cy + this.y + this.offsetY,
            this.glyphScale,
            this.symbols,
            this.center
        );
        canvas.color = c;
    }
}
