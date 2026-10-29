import type { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
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

    /**
     * Whether horizontal space was added via {@link placeSpacing}, which makes the glyph non-empty.
     */
    private _hasSpacing = false;

    public container!: BeatContainerGlyph;
    public computedWidth: number = 0;

    public constructor() {
        super(0, 0);
    }

    /**
     * The glyph laid out first and painted after the effects (note heads, rests), held outside of {@link glyphs}.
     */
    protected get mainGlyph(): Glyph | null {
        return null;
    }

    public override get isEmpty(): boolean {
        return this.mainGlyph === null && !this._hasSpacing && super.isEmpty;
    }

    public override getBoundingBoxTop(): number {
        const top = super.getBoundingBoxTop();
        const main = this.mainGlyph;
        return main ? ModelUtils.minBoundingBox(main.getBoundingBoxTop(), top) : top;
    }

    public override getBoundingBoxBottom(): number {
        const bottom = super.getBoundingBoxBottom();
        const main = this.mainGlyph;
        return main ? ModelUtils.maxBoundingBox(main.getBoundingBoxBottom(), bottom) : bottom;
    }

    public override doLayout(): void {
        // left to right layout
        let w: number = 0;
        const main = this.mainGlyph;
        if (main) {
            main.x = 0;
            main.renderer = this.renderer;
            main.doLayout();
            w = main.width;
        }
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

    /**
     * Starts a left-to-right placement with {@link placeNormal}, {@link placeEffect} and {@link placeSpacing},
     * an alternative to adding all glyphs and calling {@link doLayout}. Every glyph must be complete when placed.
     */
    protected beginPlacement() {
        this.width = 0;
        this.computedWidth = 0;
    }

    /**
     * Adds the glyph via {@link addNormal} and lays it out right of everything placed before.
     */
    protected placeNormal(g: Glyph) {
        this.addNormal(g);
        this._place(g);
    }

    /**
     * Adds the glyph via {@link addEffect} and lays it out right of everything placed before.
     */
    protected placeEffect(g: Glyph) {
        this.addEffect(g);
        this._place(g);
    }

    /**
     * Adds empty horizontal space right of everything placed before.
     */
    protected placeSpacing(width: number) {
        this._hasSpacing = true;
        this.width += width;
        this.computedWidth = this.width;
    }

    private _place(g: Glyph) {
        g.x = this.width;
        g.renderer = this.renderer;
        g.doLayout();
        this.width += g.width;
        this.computedWidth = this.width;
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
        const x = cx + this.x;
        const y = cy + this.y;
        const main = this.mainGlyph;
        if (main) {
            main.paint(x, y, canvas);
        }
        const glyphs = this.glyphs;
        if (!glyphs) {
            return;
        }
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
