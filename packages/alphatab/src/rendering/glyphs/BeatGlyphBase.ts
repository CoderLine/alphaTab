import type { BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';

/**
 * @internal
 */
export class BeatGlyphBase extends GlyphGroup {
    /**
     * The glyphs of {@link glyphs} added via {@link addEffect}, painted before all others.
     */
    private _effectGlyphs: Glyph[] | null = null;

    public container!: BeatContainerGlyph;
    public computedWidth: number = 0;

    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        // left to right layout
        let w: number = 0;
        if (this.glyphs) {
            for (let i: number = 0, j: number = this.glyphs.length; i < j; i++) {
                const g: Glyph = this.glyphs[i];
                g.x = w;
                g.renderer = this.renderer;
                g.doLayout();
                w += g.width;
            }
        }
        this.width = w;
        this.computedWidth = w;
    }

    protected noteLoop(action: (note: Note) => void): void {
        for (let i: number = this.container.beat.notes.length - 1; i >= 0; i--) {
            action(this.container.beat.notes[i]);
        }
    }

    public addEffect(g: Glyph) {
        super.addGlyph(g);
        const effectGlyphs = this._effectGlyphs;
        if (!effectGlyphs) {
            this._effectGlyphs = [g];
        } else {
            effectGlyphs.push(g);
        }
    }

    public addNormal(g: Glyph) {
        super.addGlyph(g);
    }

    protected get effectElement(): BeatSubElement | undefined {
        return undefined;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const effectGlyphs = this._effectGlyphs;
        if (effectGlyphs) {
            this._paintEffects(cx, cy, canvas, effectGlyphs);
        }
        this._paintNormal(cx, cy, canvas, effectGlyphs);
    }

    private _paintNormal(cx: number, cy: number, canvas: ICanvas, effectGlyphs: Glyph[] | null) {
        const glyphs = this.glyphs;
        if (!glyphs) {
            return;
        }
        const x = cx + this.x;
        const y = cy + this.y;
        for (let i = 0, j = glyphs.length; i < j; i++) {
            const g = glyphs[i];
            if (effectGlyphs === null || effectGlyphs.indexOf(g) === -1) {
                g.paint(x, y, canvas);
            }
        }
    }

    private _paintEffects(cx: number, cy: number, canvas: ICanvas, glyphs: Glyph[]) {
        const previousColor = this.effectElement
            ? ElementStyleHelper.applyBeat(canvas, this.effectElement!, this.container.beat)
            : undefined;
        try {
            const x = cx + this.x;
            const y = cy + this.y;
            for (let i = 0, j = glyphs.length; i < j; i++) {
                glyphs[i].paint(x, y, canvas);
            }
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }
}
