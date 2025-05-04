import type { BeatSubElement } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import type { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import type { ICanvas } from '@src/platform/ICanvas';

export class BeatGlyphBase extends GlyphGroup {
    private _effectGlyphs: Glyph[] = [];
    private _normalGlyphs: Glyph[] = [];

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
        this._effectGlyphs.push(g);
    }

    public addNormal(g: Glyph) {
        super.addGlyph(g);
        this._normalGlyphs.push(g);
    }

    protected get effectElement(): BeatSubElement | undefined {
        return undefined;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintEffects(cx, cy, canvas);
        this.paintNormal(cx, cy, canvas);
    }

    private paintNormal(cx: number, cy: number, canvas: ICanvas) {
        for (const g of this._normalGlyphs) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    private paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = this.effectElement
            ? ElementStyleHelper.beat(canvas, this.effectElement!, this.container.beat)
            : undefined;
        for (const g of this._effectGlyphs) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
