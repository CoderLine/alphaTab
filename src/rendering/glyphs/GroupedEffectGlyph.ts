import type { Beat } from '@src/model/Beat';
import type { ICanvas } from '@src/platform/ICanvas';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { BeatXPosition } from '@src/rendering/BeatXPosition';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export abstract class GroupedEffectGlyph extends EffectGlyph {
    protected endPosition: BeatXPosition;
    protected forceGroupedRendering: boolean = false;
    protected endOnBarLine: boolean = false;

    protected constructor(endPosition: BeatXPosition) {
        super();
        this.endPosition = endPosition;
    }

    public get isLinkedWithPrevious(): boolean {
        return !!this.previousGlyph && this.previousGlyph.renderer.staff.system === this.renderer.staff.system;
    }

    public get isLinkedWithNext(): boolean {
        return (
            !!this.nextGlyph &&
            this.nextGlyph.renderer.isFinalized &&
            this.nextGlyph.renderer.staff.system === this.renderer.staff.system
        );
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // if we are linked with the previous, the first glyph of the group will also render this one.
        if (this.isLinkedWithPrevious) {
            return;
        }
        // we are not linked with any glyph therefore no expansion is required, we render a simple glyph.
        if (!this.isLinkedWithNext && !this.forceGroupedRendering) {
            this.paintNonGrouped(cx, cy, canvas);
            return;
        }
        // find last linked glyph that can be
        let lastLinkedGlyph: GroupedEffectGlyph;
        if (!this.isLinkedWithNext && this.forceGroupedRendering) {
            lastLinkedGlyph = this;
        } else {
            lastLinkedGlyph = this.nextGlyph as GroupedEffectGlyph;
            while (lastLinkedGlyph.isLinkedWithNext) {
                lastLinkedGlyph = lastLinkedGlyph.nextGlyph as GroupedEffectGlyph;
            }
        }
        // use start position of next beat when possible
        const endBeatRenderer: BarRendererBase = lastLinkedGlyph.renderer;
        const endBeat: Beat = lastLinkedGlyph.beat!;
        const position: BeatXPosition = this.endPosition;
        // calculate end X-position
        const cxRenderer: number = cx - this.renderer.x;
        const endX: number = this.calculateEndX(endBeatRenderer, endBeat, cxRenderer, position);
        this.paintGrouped(cx, cy, endX, canvas);
    }

    protected calculateEndX(
        endBeatRenderer: BarRendererBase,
        endBeat: Beat | null,
        cx: number,
        endPosition: BeatXPosition
    ): number {
        if (!endBeat) {
            return cx + endBeatRenderer.x + this.x + this.width;
        }
        return cx + endBeatRenderer.x + endBeatRenderer.getBeatX(endBeat, endPosition);
    }

    protected paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        const cxRenderer: number = cx - this.renderer.x;
        const endX: number = this.calculateEndX(this.renderer, this.beat, cxRenderer, this.endPosition);
        this.paintGrouped(cx, cy, endX, canvas);
    }

    protected abstract paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void;
}
