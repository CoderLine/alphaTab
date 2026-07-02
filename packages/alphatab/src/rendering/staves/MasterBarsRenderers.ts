import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

/**
 * This container represents a single column of bar renderers independent from any staves.
 * This container can be used to reorganize renderers into a new staves.
 * @internal
 */
export class MasterBarsRenderers {
    public width: number = 0;
    public isLinkedToPrevious: boolean = false;
    public canWrap: boolean = true;
    public masterBar!: MasterBar;
    public additionalMultiBarRestIndexes: number[] | null = null;

    /**
     * Max fixed overhead (prefix + postfix glyph width) across all staves of this bar.
     * Used by the layout-mode horizontal scaling pass to carve out the fixed-overhead bucket
     * before distributing staff width across bars.
     */
    public maxFixedOverhead: number = 0;

    /**
     * Max natural content width (computedWidth - fixedOverhead) across all staves of this bar.
     * Used as the bar weight when the layout ignores {@link MasterBar.displayScale} (e.g.
     * Page layout with `SystemsLayoutMode.Automatic`).
     */
    public maxContentWidth: number = 0;

    public get lastMasterBarIndex(): number {
        if (this.additionalMultiBarRestIndexes) {
            return this.additionalMultiBarRestIndexes[this.additionalMultiBarRestIndexes.length - 1];
        }
        return this.masterBar.index;
    }

    public renderers: BarRendererBase[] = [];
    public layoutingInfo!: BarLayoutingInfo;
}
