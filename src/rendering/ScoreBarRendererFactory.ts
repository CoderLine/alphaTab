import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

/**
 * This Factory procudes ScoreBarRenderer instances
 */
export class ScoreBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return ScoreBarRenderer.StaffId;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new ScoreBarRenderer(renderer, bar);
    }

    public constructor() {
        super();
    }
}
