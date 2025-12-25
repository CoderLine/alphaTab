import { SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { VerticalLayoutBase } from '@coderline/alphatab/rendering/layout/VerticalLayoutBase';

/**
 * This layout arranges the bars into a fixed width and dynamic height region.
 * @internal
 */
export class PageViewLayout extends VerticalLayoutBase {
    public get name(): string {
        return 'PageView';
    }

    protected override getBarsPerSystem(systemIndex: number) {
        let barsPerRow: number = this.renderer.settings.display.barsPerRow;

        if (this.renderer.settings.display.systemsLayoutMode === SystemsLayoutMode.UseModelLayout) {
            barsPerRow = ModelUtils.getSystemLayout(this.renderer.score!, systemIndex, this.renderer.tracks!);
        }

        return barsPerRow;
    }

    protected override get shouldApplyBarScale(): boolean {
        return this.renderer.settings.display.systemsLayoutMode === SystemsLayoutMode.UseModelLayout;
    }
}
