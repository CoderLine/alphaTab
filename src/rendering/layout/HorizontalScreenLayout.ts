import { MasterBar } from '@src/model/MasterBar';
import { Score } from '@src/model/Score';
import { TextAlign } from '@src/platform/ICanvas';
import { InternalSystemsLayoutMode, ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { StaffSystem } from '@src/rendering/staves/StaffSystem';
import { Logger } from '@src/Logger';
import { SystemsLayoutMode } from '@src/DisplaySettings';

export class HorizontalScreenLayoutPartialInfo {
    public x: number = 0;
    public width: number = 0;
    public masterBars: MasterBar[] = [];
}

/**
 * This layout arranges the bars all horizontally
 */
export class HorizontalScreenLayout extends ScoreLayout {
    private _system: StaffSystem | null = null;
    private _pagePadding: number[] | null = null;

    public get name(): string {
        return 'HorizontalScreen';
    }

    public constructor(renderer: ScoreRenderer) {
        super(renderer);
    }

    public get supportsResize(): boolean {
        return false;
    }

    public get firstBarX(): number {
        let x = this._pagePadding![0];
        if (this._system) {
            x += this._system.accoladeWidth;
        }
        return x;
    }

    public doResize(): void {
        // not supported
    }

    protected doLayoutAndRender(): void {
        this._pagePadding = this.renderer.settings.display.padding;

        switch (this.renderer.settings.display.systemsLayoutMode) {
            case SystemsLayoutMode.Automatic:
                this.systemsLayoutMode = InternalSystemsLayoutMode.Automatic;
                break;
            case SystemsLayoutMode.UseModelLayout:
                this.systemsLayoutMode = InternalSystemsLayoutMode.FromModelWithWidths;
                break;
        }

        if (!this._pagePadding) {
            this._pagePadding = [0, 0, 0, 0];
        }
        if (this._pagePadding.length === 1) {
            this._pagePadding = [
                this._pagePadding[0],
                this._pagePadding[0],
                this._pagePadding[0],
                this._pagePadding[0]
            ];
        } else if (this._pagePadding.length === 2) {
            this._pagePadding = [
                this._pagePadding[0],
                this._pagePadding[1],
                this._pagePadding[0],
                this._pagePadding[1]
            ];
        }
        let score: Score = this.renderer.score!;

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
        this._system = this.createEmptyStaffSystem();
        this._system.isLast = true;
        this._system.x = this._pagePadding[0];
        this._system.y = this._pagePadding[1];
        let countPerPartial: number = this.renderer.settings.display.barCountPerPartial;
        let partials: HorizontalScreenLayoutPartialInfo[] = [];
        let currentPartial: HorizontalScreenLayoutPartialInfo = new HorizontalScreenLayoutPartialInfo();
        let renderX = 0;
        while (currentBarIndex <= endBarIndex) {
            let result = this._system.addBars(this.renderer.tracks!, currentBarIndex);

            if (result) {
                // if we detect that the new renderer is linked to the previous
                // renderer, we need to put it into the previous partial
                if (currentPartial.masterBars.length === 0 && result.isLinkedToPrevious && partials.length > 0) {
                    let previousPartial: HorizontalScreenLayoutPartialInfo = partials[partials.length - 1];
                    previousPartial.masterBars.push(score.masterBars[currentBarIndex]);
                    previousPartial.width += result.width;
                    renderX += result.width;
                    currentPartial.x += renderX;
                } else {
                    currentPartial.masterBars.push(score.masterBars[currentBarIndex]);
                    currentPartial.width += result.width;
                    // no targetPartial here because previous partials already handled this code
                    if (currentPartial.masterBars.length >= countPerPartial) {
                        if (partials.length === 0) {
                            // respect accolade and on first partial
                            currentPartial.width += this._system.accoladeWidth + this._pagePadding[0];
                        }
                        renderX += currentPartial.width;
                        partials.push(currentPartial);
                        Logger.debug(
                            this.name,
                            'Finished partial from bar ' +
                                currentPartial.masterBars[0].index +
                                ' to ' +
                                currentPartial.masterBars[currentPartial.masterBars.length - 1].index,
                            null
                        );
                        currentPartial = new HorizontalScreenLayoutPartialInfo();
                        currentPartial.x = renderX;
                    }
                }
            }
            currentBarIndex++;
        }
        // don't miss the last partial if not empty
        if (currentPartial.masterBars.length > 0) {
            if (partials.length === 0) {
                currentPartial.width += this._system.accoladeWidth + this._pagePadding[0];
            }
            partials.push(currentPartial);
            Logger.debug(
                this.name,
                'Finished partial from bar ' +
                    currentPartial.masterBars[0].index +
                    ' to ' +
                    currentPartial.masterBars[currentPartial.masterBars.length - 1].index,
                null
            );
        }
        this.finalizeStaffSystem();
        this.height = Math.floor(this._system.y + this._system.height);
        this.width = this._system.x + this._system.width + this._pagePadding[2];
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
                    'Rendering partial from bar ' +
                        partial.masterBars[0].index +
                        ' to ' +
                        partial.masterBars[partial.masterBars.length - 1].index,
                    null
                );
                this._system!!.paintPartial(
                    -renderX,
                    this._system!.y,
                    canvas,
                    partialBarIndex,
                    partial.masterBars.length
                );
            });

            currentBarIndex += partial.masterBars.length;
        }

        this.height = this.layoutAndRenderAnnotation(this.height) + this._pagePadding[3];
    }

    private finalizeStaffSystem() {
        this._system!.scaleToWidth(this._system!.width);
        this._system!.finalizeSystem();
    }
}
