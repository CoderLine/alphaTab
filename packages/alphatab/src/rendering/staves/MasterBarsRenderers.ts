import type { MasterBar } from '@src/model/MasterBar';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';

/**
 * This container represents a single column of bar renderers independent from any staves.
 * This container can be used to reorganize renderers into a new staves.
 */
export class MasterBarsRenderers {
    public width: number = 0;
    public isLinkedToPrevious: boolean = false;
    public canWrap: boolean = true;
    public masterBar!: MasterBar;
    public additionalMultiBarRestIndexes: number[] | null = null;

    public get lastMasterBarIndex(): number {
        if (this.additionalMultiBarRestIndexes) {
            return this.additionalMultiBarRestIndexes[this.additionalMultiBarRestIndexes.length - 1];
        }
        return this.masterBar.index;
    }

    public renderers: BarRendererBase[] = [];
    public layoutingInfo!: BarLayoutingInfo;
}
