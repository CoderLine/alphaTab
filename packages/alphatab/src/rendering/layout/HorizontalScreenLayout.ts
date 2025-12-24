import { Logger } from '@coderline/alphatab/Logger';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Score } from '@coderline/alphatab/model/Score';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { ScoreLayout } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { MasterBarsRenderers } from '@coderline/alphatab/rendering/staves/MasterBarsRenderers';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';

/**
 * @internal
 */
export class HorizontalScreenLayoutPartialInfo {
    public x: number = 0;
    public width: number = 0;
    public masterBars: MasterBar[] = [];
    public results: MasterBarsRenderers[] = [];
}

/**
 * This layout arranges the bars all horizontally
 * @internal
 */
export class HorizontalScreenLayout extends ScoreLayout {
    private _system: StaffSystem | null = null;

    public get name(): string {
        return 'HorizontalScreen';
    }

    public get supportsResize(): boolean {
        return false;
    }

    public get firstBarX(): number {
        let x = this.pagePadding![0];
        if (this._system) {
            x += this._system.accoladeWidth;
        }
        return x;
    }

    public doResize(): void {
        // not supported
    }

    protected doLayoutAndRender(): void {
        const score: Score = this.renderer.score!;

        let startIndex: number = this.renderer.settings.display.startBar;
        startIndex--; // map to array index

        startIndex = Math.min(score.masterBars.length - 1, Math.max(0, startIndex));
        let currentBarIndex: number = startIndex;
        let endBarIndex: number = this.renderer.settings.display.barCount;
        if (endBarIndex <= 0) {
            endBarIndex = score.masterBars.length;
        }
        endBarIndex = startIndex + endBarIndex - 1; // map count to array index

        endBarIndex = Math.min(score.masterBars.length - 1, Math.max(0, endBarIndex));
        this._system = this.createEmptyStaffSystem(0);
        this._system.isLast = true;
        this._system.x = this.pagePadding![0];
        this._system.y = this.pagePadding![1];
        const countPerPartial: number = this.renderer.settings.display.barCountPerPartial;
        const partials: HorizontalScreenLayoutPartialInfo[] = [];
        let currentPartial: HorizontalScreenLayoutPartialInfo = new HorizontalScreenLayoutPartialInfo();
        while (currentBarIndex <= endBarIndex) {
            const multiBarRestInfo = this.multiBarRestInfo;
            const additionalMultiBarsRestBarIndices: number[] | null =
                multiBarRestInfo !== null && multiBarRestInfo.has(currentBarIndex)
                    ? multiBarRestInfo.get(currentBarIndex)!
                    : null;

            const result = this._system.addBars(
                this.renderer.tracks!,
                currentBarIndex,
                additionalMultiBarsRestBarIndices
            );

            // complete partial if its full and we are not linked
            if (currentPartial.masterBars.length >= countPerPartial && !result.isLinkedToPrevious) {
                currentPartial = this._completePartial(partials, currentPartial);
            }

            this._scaleBars(result);

            currentPartial.results.push(result);
            currentPartial.masterBars.push(score.masterBars[currentBarIndex]);
            currentPartial.width += result.width;
            currentBarIndex++;
        }

        // don't miss the last partial if not empty
        if (currentPartial.masterBars.length > 0) {
            this._completePartial(partials, currentPartial);
        }
        this._finalizeStaffSystem();

        this.height = Math.floor(this._system.y + this._system.height);
        this.width = this._system.x + this._system.width + this.pagePadding![2];
        currentBarIndex = 0;

        let x = 0;
        for (let i: number = 0; i < partials.length; i++) {
            const partial: HorizontalScreenLayoutPartialInfo = partials[i];

            const e = new RenderFinishedEventArgs();
            e.x = x;
            e.y = 0;
            e.totalWidth = this.width;
            e.totalHeight = this.height;
            e.width = partial.width;
            e.height = this.height;
            e.firstMasterBarIndex = partial.masterBars[0].index;
            e.lastMasterBarIndex = partial.masterBars[partial.masterBars.length - 1].index;

            x += partial.width;

            // pull to local scope for lambda
            const partialBarIndex = currentBarIndex;
            const partialIndex = i;
            this._system.buildBoundingsLookup(0, 0);
            this.registerPartial(e, canvas => {
                let renderX: number = this._system!.getBarX(partial.masterBars[0].index) + this._system!.accoladeWidth;
                if (partialIndex === 0) {
                    renderX -= this._system!.x + this._system!.accoladeWidth;
                }

                canvas.color = this.renderer.settings.display.resources.mainGlyphColor;
                canvas.textAlign = TextAlign.Left;
                Logger.debug(
                    this.name,
                    `Rendering partial from bar ${partial.masterBars[0].index} to ${partial.masterBars[partial.masterBars.length - 1].index}`,
                    null
                );
                this._system!.paintPartial(
                    -renderX,
                    this._system!.y,
                    canvas,
                    partialBarIndex,
                    partial.masterBars.length
                );
            });

            currentBarIndex += partial.masterBars.length;
        }

        this.height = this.layoutAndRenderBottomScoreInfo(this.height);
        this.height = this.layoutAndRenderAnnotation(this.height);

        this.height += this.pagePadding![3];

        this.height *= this.renderer.settings.display.scale;
    }

    private _scaleBars(result: MasterBarsRenderers) {
        result.width = 0;
        this._system!.width -= result.width;
        for (const r of result.renderers) {
            const barDisplayWidth =
                r.staff!.system.staves.length > 1 ? r.bar.masterBar.displayWidth : r.bar.displayWidth;
            if (barDisplayWidth > 0) {
                r.scaleToWidth(barDisplayWidth);
            }
            const w = r.x + r.width;
            if (w > result.width) {
                result.width = w;
            }
        }
        this._system!.width += result.width;
    }

    private _completePartial(
        partials: HorizontalScreenLayoutPartialInfo[],
        currentPartial: HorizontalScreenLayoutPartialInfo
    ) {
        if (partials.length === 0) {
            // respect accolade and on first partial
            currentPartial.width += this._system!.accoladeWidth + this.pagePadding![0];
        }

        partials.push(currentPartial);
        Logger.debug(
            this.name,
            `Finished partial from bar ${currentPartial.masterBars[0].index} to ${currentPartial.masterBars[currentPartial.masterBars.length - 1].index}`,
            null
        );

        // start new partial
        const newPartial = new HorizontalScreenLayoutPartialInfo();
        newPartial.x = currentPartial.x + currentPartial.width;
        return newPartial;
    }

    private _finalizeStaffSystem() {
        // TODO: lift alignrenderers to this level
        this._system!.alignRenderers();
        this._system!.finalizeSystem();
    }
}
