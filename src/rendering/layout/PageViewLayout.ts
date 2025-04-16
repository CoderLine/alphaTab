import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import type { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { InternalSystemsLayoutMode, ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import type { MasterBarsRenderers } from '@src/rendering/staves/MasterBarsRenderers';
import type { StaffSystem } from '@src/rendering/staves/StaffSystem';
import type { RenderingResources } from '@src/RenderingResources';
import { Logger } from '@src/Logger';
import { SystemsLayoutMode } from '@src/DisplaySettings';
import { ScoreSubElement } from '@src/model/Score';

/**
 * This layout arranges the bars into a fixed width and dynamic height region.
 */
export class PageViewLayout extends ScoreLayout {
    private _systems: StaffSystem[] = [];
    private _allMasterBarRenderers: MasterBarsRenderers[] = [];
    private _barsFromPreviousSystem: MasterBarsRenderers[] = [];

    public get name(): string {
        return 'PageView';
    }

    protected doLayoutAndRender(): void {
        switch (this.renderer.settings.display.systemsLayoutMode) {
            case SystemsLayoutMode.Automatic:
                this.systemsLayoutMode = InternalSystemsLayoutMode.Automatic;
                break;
            case SystemsLayoutMode.UseModelLayout:
                this.systemsLayoutMode = InternalSystemsLayoutMode.FromModelWithScale;
                break;
        }

        let y: number = this.pagePadding![1];
        this.width = this.renderer.width;
        this._allMasterBarRenderers = [];
        //
        // 1. Score Info
        y = this.layoutAndRenderScoreInfo(y, -1);
        //
        // 2. Tunings
        y = this.layoutAndRenderTunings(y, -1);
        //
        // 3. Chord Diagrms
        y = this.layoutAndRenderChordDiagrams(y, -1);
        //
        // 4. One result per StaffSystem
        y = this.layoutAndRenderScore(y);

        y = this.layoutAndRenderBottomScoreInfo(y);

        y = this.layoutAndRenderAnnotation(y);

        this.height = (y + this.pagePadding![3]) * this.renderer.settings.display.scale;
    }

    public get supportsResize(): boolean {
        return true;
    }

    public get firstBarX(): number {
        let x = this.pagePadding![0];
        if (this._systems.length > 0) {
            x += this._systems[0].accoladeWidth;
        }
        return x;
    }

    public doResize(): void {
        let y: number = this.pagePadding![1];
        this.width = this.renderer.width;
        const oldHeight: number = this.height;
        //
        // 1. Score Info
        y = this.layoutAndRenderScoreInfo(y, oldHeight);
        //
        // 2. Tunings
        y = this.layoutAndRenderTunings(y, oldHeight);
        //
        // 3. Chord Digrams
        y = this.layoutAndRenderChordDiagrams(y, oldHeight);
        //
        // 4. One result per StaffSystem
        y = this.resizeAndRenderScore(y, oldHeight);

        y = this.layoutAndRenderBottomScoreInfo(y);

        y = this.layoutAndRenderAnnotation(y);

        this.height = (y + this.pagePadding![3]) * this.renderer.settings.display.scale;
    }

    private layoutAndRenderTunings(y: number, totalHeight: number = -1): number {
        if (!this.tuningGlyph) {
            return y;
        }

        const res: RenderingResources = this.renderer.settings.display.resources;
        this.tuningGlyph.x = this.pagePadding![0];
        this.tuningGlyph.width = this.scaledWidth;
        this.tuningGlyph.doLayout();

        const tuningHeight = Math.round(this.tuningGlyph.height);

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.scaledWidth;
        e.height = tuningHeight;
        e.totalWidth = this.scaledWidth;
        e.totalHeight = totalHeight < 0 ? y + e.height : totalHeight;

        this.registerPartial(e, (canvas: ICanvas) => {
            canvas.color = res.scoreInfoColor;
            canvas.textAlign = TextAlign.Center;
            this.tuningGlyph!.paint(0, 0, canvas);
        });

        return y + tuningHeight;
    }

    private layoutAndRenderChordDiagrams(y: number, totalHeight: number = -1): number {
        if (!this.chordDiagrams) {
            return y;
        }
        const res: RenderingResources = this.renderer.settings.display.resources;
        this.chordDiagrams.width = this.scaledWidth;
        this.chordDiagrams.doLayout();

        const diagramHeight = Math.round(this.chordDiagrams.height);

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.scaledWidth;
        e.height = diagramHeight;
        e.totalWidth = this.scaledWidth;
        e.totalHeight = totalHeight < 0 ? y + diagramHeight : totalHeight;

        this.registerPartial(e, (canvas: ICanvas) => {
            canvas.color = res.scoreInfoColor;
            canvas.textAlign = TextAlign.Center;
            this.chordDiagrams!.paint(0, 0, canvas);
        });

        return y + diagramHeight;
    }

    private layoutAndRenderScoreInfo(y: number, totalHeight: number = -1): number {
        Logger.debug(this.name, 'Layouting score info');

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;

        let infoHeight = 0;

        const res: RenderingResources = this.renderer.settings.display.resources;

        const scoreInfoGlyphs: TextGlyph[] = [];

        for (const [scoreElement, _notationElement] of ScoreLayout.HeaderElements.value) {
            if (this.headerGlyphs.has(scoreElement)) {
                const glyph: TextGlyph = this.headerGlyphs.get(scoreElement)!;
                glyph.y = infoHeight;
                this.alignScoreInfoGlyph(glyph);

                let lineHeight = glyph.font.size;

                // words and music on same line if not aligned on same side
                if (scoreElement === ScoreSubElement.Words) {
                    if (this.headerGlyphs.has(ScoreSubElement.Music)) {
                        const musicGlyph = this.headerGlyphs.get(ScoreSubElement.Music)!;
                        if (musicGlyph.textAlign !== glyph.textAlign) {
                            lineHeight = 0;
                        }
                    }
                }

                infoHeight += lineHeight;

                scoreInfoGlyphs.push(glyph);
            }
        }

        if (scoreInfoGlyphs.length > 0) {
            infoHeight = Math.floor(infoHeight + 17);
            e.width = this.scaledWidth;
            e.height = infoHeight;
            e.totalWidth = this.scaledWidth;
            e.totalHeight = totalHeight < 0 ? y + e.height : totalHeight;
            this.registerPartial(e, (canvas: ICanvas) => {
                canvas.color = res.scoreInfoColor;
                canvas.textAlign = TextAlign.Center;
                for (const g of scoreInfoGlyphs) {
                    g.paint(0, 0, canvas);
                }
            });
        }

        return y + infoHeight;
    }

    private resizeAndRenderScore(y: number, oldHeight: number): number {
        // if we have a fixed number of bars per row, we only need to refit them.
        const barsPerRowActive =
            this.renderer.settings.display.barsPerRow > 0 ||
            this.systemsLayoutMode === InternalSystemsLayoutMode.FromModelWithScale;

        if (barsPerRowActive) {
            for (let i: number = 0; i < this._systems.length; i++) {
                const system: StaffSystem = this._systems[i];
                this.fitSystem(system);
                y += this.paintSystem(system, oldHeight);
            }
        } else {
            this._systems = [];
            let currentIndex: number = 0;
            const maxWidth: number = this.maxWidth;
            let system: StaffSystem = this.createEmptyStaffSystem();
            system.index = this._systems.length;
            system.x = this.pagePadding![0];
            system.y = y;
            while (currentIndex < this._allMasterBarRenderers.length) {
                // if the current renderer still has space in the current system add it
                // also force adding in case the system is empty
                let renderers: MasterBarsRenderers | null = this._allMasterBarRenderers[currentIndex];
                if (system.width + renderers!.width <= maxWidth || system.masterBarsRenderers.length === 0) {
                    system.addMasterBarRenderers(this.renderer.tracks!, renderers!);
                    // move to next system
                    currentIndex++;
                } else {
                    // if we cannot wrap on the current bar, we remove the last bar
                    // (this might even remove multiple ones until we reach a bar that can wrap);
                    while (renderers && !renderers.canWrap && system.masterBarsRenderers.length > 1) {
                        renderers = system.revertLastBar();
                        currentIndex--;
                    }
                    // in case we do not have space, we create a new system
                    system.isFull = true;
                    system.isLast = this.lastBarIndex === system.lastBarIndex;
                    this._systems.push(system);
                    this.fitSystem(system);
                    y += this.paintSystem(system, oldHeight);
                    // note: we do not increase currentIndex here to have it added to the next system
                    system = this.createEmptyStaffSystem();
                    system.index = this._systems.length;
                    system.x = this.pagePadding![0];
                    system.y = y;
                }
            }
            system.isLast = this.lastBarIndex === system.lastBarIndex;
            // don't forget to finish the last system
            this.fitSystem(system);
            y += this.paintSystem(system, oldHeight);
        }
        return y;
    }

    private layoutAndRenderScore(y: number): number {
        const startIndex: number = this.firstBarIndex;
        let currentBarIndex: number = startIndex;
        const endBarIndex: number = this.lastBarIndex;

        this._systems = [];
        while (currentBarIndex <= endBarIndex) {
            // create system and align set proper coordinates
            const system: StaffSystem = this.createStaffSystem(currentBarIndex, endBarIndex);
            this._systems.push(system);
            system.x = this.pagePadding![0];
            system.y = y;
            currentBarIndex = system.lastBarIndex + 1;
            // finalize system (sizing etc).
            this.fitSystem(system);
            Logger.debug(
                this.name,
                `Rendering partial from bar ${system.firstBarIndex} to ${system.lastBarIndex}`,
                null
            );
            y += this.paintSystem(system, y);
        }
        return y;
    }

    private paintSystem(system: StaffSystem, totalHeight: number): number {
        // paint into canvas
        const height: number = Math.floor(system.height);

        const args: RenderFinishedEventArgs = new RenderFinishedEventArgs();
        args.x = 0;
        args.y = system.y;
        args.totalWidth = this.scaledWidth;
        args.totalHeight = totalHeight;
        args.width = this.scaledWidth;
        args.height = height;
        args.firstMasterBarIndex = system.firstBarIndex;
        args.lastMasterBarIndex = system.lastBarIndex;

        system.buildBoundingsLookup(0, 0);
        this.registerPartial(args, canvas => {
            this.renderer.canvas!.color = this.renderer.settings.display.resources.mainGlyphColor;
            this.renderer.canvas!.textAlign = TextAlign.Left;
            // NOTE: we use this negation trick to make the system paint itself to 0/0 coordinates
            // since we use partial drawing
            system.paint(0, -(args.y / this.renderer.settings.display.scale), canvas);
        });

        // calculate coordinates for next system
        return height;
    }

    /**
     * Realignes the bars in this line according to the available space
     */
    private fitSystem(system: StaffSystem): void {
        if (system.isFull || system.width > this.maxWidth || this.renderer.settings.display.justifyLastSystem) {
            system.scaleToWidth(this.maxWidth);
        } else {
            system.scaleToWidth(system.width);
        }
        system.finalizeSystem();
    }

    private getBarsPerSystem(rowIndex: number) {
        let barsPerRow: number = this.renderer.settings.display.barsPerRow;

        if (this.systemsLayoutMode === InternalSystemsLayoutMode.FromModelWithScale) {
            let defaultSystemsLayout: number;
            let systemsLayout: number[];
            if (this.renderer.tracks!.length > 1) {
                // multi track applies
                defaultSystemsLayout = this.renderer.score!.defaultSystemsLayout;
                systemsLayout = this.renderer.score!.systemsLayout;
            } else {
                defaultSystemsLayout = this.renderer.tracks![0].defaultSystemsLayout;
                systemsLayout = this.renderer.tracks![0].systemsLayout;
            }

            barsPerRow = rowIndex < systemsLayout.length ? systemsLayout[rowIndex] : defaultSystemsLayout;
        }

        return barsPerRow;
    }

    private createStaffSystem(currentBarIndex: number, endIndex: number): StaffSystem {
        const system: StaffSystem = this.createEmptyStaffSystem();
        system.index = this._systems.length;
        const barsPerRow: number = this.getBarsPerSystem(system.index);
        const maxWidth: number = this.maxWidth;
        const end: number = endIndex + 1;

        let barIndex = currentBarIndex;
        while (barIndex < end) {
            if (this._barsFromPreviousSystem.length > 0) {
                for (const renderer of this._barsFromPreviousSystem) {
                    system.addMasterBarRenderers(this.renderer.tracks!, renderer);
                    barIndex = renderer.lastMasterBarIndex;
                }
            } else {
                const multiBarRestInfo = this.multiBarRestInfo;
                const additionalMultiBarsRestBarIndices: number[] | null =
                    multiBarRestInfo !== null && multiBarRestInfo.has(barIndex)
                        ? multiBarRestInfo.get(barIndex)!
                        : null;

                const renderers = system.addBars(this.renderer.tracks!, barIndex, additionalMultiBarsRestBarIndices);
                this._allMasterBarRenderers.push(renderers);
                barIndex = renderers.lastMasterBarIndex;
            }
            this._barsFromPreviousSystem = [];
            let systemIsFull: boolean = false;
            // can bar placed in this line?
            if (barsPerRow === -1 && system.width >= maxWidth && system.masterBarsRenderers.length !== 0) {
                systemIsFull = true;
            } else if (system.masterBarsRenderers.length === barsPerRow + 1) {
                systemIsFull = true;
            }
            if (systemIsFull) {
                let reverted = system.revertLastBar();
                if (reverted) {
                    this._barsFromPreviousSystem.push(reverted);
                    while (reverted && !reverted.canWrap && system.masterBarsRenderers.length > 1) {
                        reverted = system.revertLastBar();
                        if (reverted) {
                            this._barsFromPreviousSystem.push(reverted);
                        }
                    }
                }
                system.isFull = true;
                system.isLast = false;
                this._barsFromPreviousSystem.reverse();
                return system;
            }
            // do we need a line break after this bar
            let anyTrackNeedsLineBreak = false;
            let allTracksNeedLineBreak = true;
            for (const track of this.renderer.tracks!) {
                if (track.lineBreaks && track.lineBreaks!.has(barIndex + 1)) {
                    anyTrackNeedsLineBreak = true;
                } else {
                    allTracksNeedLineBreak = false;
                }
            }

            if (anyTrackNeedsLineBreak && allTracksNeedLineBreak) {
                system.isFull = true;
                system.isLast = false;
                return system;
            }
            system.x = 0;
            barIndex++;
        }
        system.isLast = endIndex === system.lastBarIndex;
        return system;
    }

    private get maxWidth(): number {
        return this.scaledWidth - this.pagePadding![0] - this.pagePadding![2];
    }
}
