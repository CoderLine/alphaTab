import { MasterBar } from '@src/model/MasterBar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';

/**
 * This container represents a single column of bar renderers independent from any staves.
 * This container can be used to reorganize renderers into a new staves.
 */
export class MasterBarsRenderers {
    public width: number = 0;
    public isLinkedToPrevious: boolean = false;
    public canWrap: boolean = true;
    public masterBar!: MasterBar;
    public renderers: BarRendererBase[] = [];
    public layoutingInfo!: BarLayoutingInfo;
}
