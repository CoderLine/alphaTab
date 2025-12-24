import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { VerticalLayoutBase } from '@coderline/alphatab/rendering/layout/VerticalLayoutBase';

/**
 * This layout arranges the bars into a fixed width and dynamic height region
 * respecting the systems layout specified in the data model.
 * @internal
 */
export class ParchmentLayout extends VerticalLayoutBase {
    public get name(): string {
        return 'Parchment';
    }

    protected override getBarsPerSystem(systemIndex: number) {
        return ModelUtils.getSystemLayout(this.renderer.score!, systemIndex, this.renderer.tracks!);
    }

    protected override get shouldApplyBarScale(): boolean {
        return true;
    }
}
