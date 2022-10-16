import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { MasterBarsRenderers } from '@src/rendering/staves/MasterBarsRenderers';
import { StaveGroup } from '@src/rendering/staves/StaveGroup';
import { RenderingResources } from '@src/RenderingResources';
import { Logger } from '@src/Logger';
import { NotationElement } from '@src/NotationSettings';

/**
 * This layout arranges the bars into a fixed width and dynamic height region.
 */
export class PageViewLayout extends ScoreLayout {
    public static PagePadding: number[] = [40, 40, 40, 40];
    public static readonly GroupSpacing: number = 20;
    private _groups: StaveGroup[] = [];
    private _allMasterBarRenderers: MasterBarsRenderers[] = [];
    private _barsFromPreviousGroup: MasterBarsRenderers[] = [];
    private _pagePadding: number[] | null = null;

    public get name(): string {
        return 'PageView';
    }

    public constructor(renderer: ScoreRenderer) {
        super(renderer);
    }

    protected doLayoutAndRender(): void {
        this._pagePadding = this.renderer.settings.display.padding;
        if (!this._pagePadding) {
            this._pagePadding = PageViewLayout.PagePadding;
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
        let y: number = 0;
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
        // 4. One result per StaveGroup
        y = this.layoutAndRenderScore(y);

        y = this.layoutAndRenderAnnotation(y);

        this.height = y + this._pagePadding[3];
    }

    public get supportsResize(): boolean {
        return true;
    }

    public get firstBarX(): number {
        let x = this._pagePadding![0];
        if (this._groups.length > 0) {
            x += this._groups[0].accoladeSpacing;
        }
        return x;
    }

    public doResize(): void {
        let y: number = 0;
        this.width = this.renderer.width;
        let oldHeight: number = this.height;
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
        // 4. One result per StaveGroup
        y = this.resizeAndRenderScore(y, oldHeight);

        y = this.layoutAndRenderAnnotation(y);

        this.height = y + this._pagePadding![3];
    }

    private layoutAndRenderTunings(y: number, totalHeight: number = -1): number {
        if (!this.tuningGlyph) {
            return y;
        }

        let res: RenderingResources = this.renderer.settings.display.resources;
        this.tuningGlyph.x = this._pagePadding![0];
        this.tuningGlyph.width = this.width;
        this.tuningGlyph.doLayout();

        let tuningHeight = this.tuningGlyph.height + 11 * this.scale;

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.width;
        e.height = tuningHeight;
        e.totalWidth = this.width;
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
        this.chordDiagrams.width = this.width;
        this.chordDiagrams.doLayout();

        const diagramHeight = Math.floor(this.chordDiagrams.height);

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.width;
        e.height = diagramHeight;
        e.totalWidth = this.width;
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

        let infoHeight = this._pagePadding![1];

        let scale: number = this.scale;
        let res: RenderingResources = this.renderer.settings.display.resources;
        let centeredGlyphs: NotationElement[] = [
            NotationElement.ScoreTitle,
            NotationElement.ScoreSubTitle,
            NotationElement.ScoreArtist,
            NotationElement.ScoreAlbum,
            NotationElement.ScoreWordsAndMusic
        ];
        for (let i: number = 0; i < centeredGlyphs.length; i++) {
            if (this.scoreInfoGlyphs.has(centeredGlyphs[i])) {
                let glyph: TextGlyph = this.scoreInfoGlyphs.get(centeredGlyphs[i])!;
                glyph.x = this.width / 2;
                glyph.y = infoHeight;
                glyph.textAlign = TextAlign.Center;
                infoHeight += glyph.font.size * scale;
            }
        }
        let musicOrWords: boolean = false;
        let musicOrWordsHeight: number = 0;
        if (this.scoreInfoGlyphs.has(NotationElement.ScoreMusic)) {
            let glyph: TextGlyph = this.scoreInfoGlyphs.get(NotationElement.ScoreMusic)!;
            glyph.x = this.width - this._pagePadding![2];
            glyph.y = infoHeight;
            glyph.textAlign = TextAlign.Right;
            musicOrWords = true;
            musicOrWordsHeight = glyph.font.size * scale;
        }
        if (this.scoreInfoGlyphs.has(NotationElement.ScoreWords)) {
            let glyph: TextGlyph = this.scoreInfoGlyphs.get(NotationElement.ScoreWords)!;
            glyph.x = this._pagePadding![0];
            glyph.y = infoHeight;
            glyph.textAlign = TextAlign.Left;
            musicOrWords = true;
            musicOrWordsHeight = glyph.font.size * scale;
        }
        if (musicOrWords) {
            infoHeight += musicOrWordsHeight;
        }

        infoHeight = Math.floor(infoHeight + 17 * this.scale);

        e.width = this.width;
        e.height = infoHeight;
        e.totalWidth = this.width;
        e.totalHeight = totalHeight < 0 ? y + e.height : totalHeight;
        this.registerPartial(e, (canvas: ICanvas) => {
            canvas.color = res.scoreInfoColor;
            canvas.textAlign = TextAlign.Center;
            for (const g of this.scoreInfoGlyphs.values()) {
                g.paint(0, 0, canvas);
            }
        });

        return y + infoHeight;
    }

    private resizeAndRenderScore(y: number, oldHeight: number): number {
        // if we have a fixed number of bars per row, we only need to refit them.
        if (this.renderer.settings.display.barsPerRow !== -1) {
            for (let i: number = 0; i < this._groups.length; i++) {
                let group: StaveGroup = this._groups[i];
                this.fitGroup(group);
                y += this.paintGroup(group, oldHeight);
            }
        } else {
            this._groups = [];
            let currentIndex: number = 0;
            let maxWidth: number = this.maxWidth;
            let group: StaveGroup = this.createEmptyStaveGroup();
            group.index = this._groups.length;
            group.x = this._pagePadding![0];
            group.y = y;
            while (currentIndex < this._allMasterBarRenderers.length) {
                // if the current renderer still has space in the current group add it
                // also force adding in case the group is empty
                let renderers: MasterBarsRenderers | null = this._allMasterBarRenderers[currentIndex];
                if (group.width + renderers!.width <= maxWidth || group.masterBarsRenderers.length === 0) {
                    group.addMasterBarRenderers(this.renderer.tracks!, renderers!);
                    // move to next group
                    currentIndex++;
                } else {
                    // if we cannot wrap on the current bar, we remove the last bar
                    // (this might even remove multiple ones until we reach a bar that can wrap);
                    while (renderers && !renderers.canWrap && group.masterBarsRenderers.length > 1) {
                        renderers = group.revertLastBar();
                        currentIndex--;
                    }
                    // in case we do not have space, we create a new group
                    group.isFull = true;
                    group.isLast = this.lastBarIndex === group.lastBarIndex;
                    this._groups.push(group);
                    this.fitGroup(group);
                    y += this.paintGroup(group, oldHeight);
                    // note: we do not increase currentIndex here to have it added to the next group
                    group = this.createEmptyStaveGroup();
                    group.index = this._groups.length;
                    group.x = this._pagePadding![0];
                    group.y = y;
                }
            }
            group.isLast = this.lastBarIndex === group.lastBarIndex;
            // don't forget to finish the last group
            this.fitGroup(group);
            y += this.paintGroup(group, oldHeight);
        }
        return y;
    }

    private layoutAndRenderScore(y: number): number {
        let startIndex: number = this.firstBarIndex;
        let currentBarIndex: number = startIndex;
        let endBarIndex: number = this.lastBarIndex;
        this._groups = [];
        while (currentBarIndex <= endBarIndex) {
            // create group and align set proper coordinates
            let group: StaveGroup = this.createStaveGroup(currentBarIndex, endBarIndex);
            this._groups.push(group);
            group.x = this._pagePadding![0];
            group.y = y;
            currentBarIndex = group.lastBarIndex + 1;
            // finalize group (sizing etc).
            this.fitGroup(group);
            Logger.debug(
                this.name,
                'Rendering partial from bar ' + group.firstBarIndex + ' to ' + group.lastBarIndex,
                null
            );
            y += this.paintGroup(group, y);
        }
        return y;
    }

    private paintGroup(group: StaveGroup, totalHeight: number): number {
        // paint into canvas
        let height: number = Math.floor(group.height + 20 * this.scale);

        const args: RenderFinishedEventArgs = new RenderFinishedEventArgs();
        args.x = 0;
        args.y = group.y;
        args.totalWidth = this.width;
        args.totalHeight = totalHeight;
        args.width = this.width;
        args.height = height;
        args.firstMasterBarIndex = group.firstBarIndex;
        args.lastMasterBarIndex = group.lastBarIndex;

        group.buildBoundingsLookup(0, 0);
        this.registerPartial(args, canvas => {
            this.renderer.canvas!.color = this.renderer.settings.display.resources.mainGlyphColor;
            this.renderer.canvas!.textAlign = TextAlign.Left;
            // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates
            // since we use partial drawing
            group.paint(0, -args.y, canvas);
        });

        // calculate coordinates for next group
        totalHeight += height;

        return height;
    }

    /**
     * Realignes the bars in this line according to the available space
     */
    private fitGroup(group: StaveGroup): void {
        if (group.isFull || group.width > this.maxWidth) {
            group.scaleToWidth(this.maxWidth);
        }
        else {
            group.scaleToWidth(group.width);
        }
        group.finalizeGroup();
    }

    private createStaveGroup(currentBarIndex: number, endIndex: number): StaveGroup {
        let group: StaveGroup = this.createEmptyStaveGroup();
        group.index = this._groups.length;
        let barsPerRow: number = this.renderer.settings.display.barsPerRow;
        let maxWidth: number = this.maxWidth;
        let end: number = endIndex + 1;

        let barIndex = currentBarIndex;
        while (barIndex < end) {
            if (this._barsFromPreviousGroup.length > 0) {
                for (let renderer of this._barsFromPreviousGroup) {
                    group.addMasterBarRenderers(this.renderer.tracks!, renderer);
                    barIndex = renderer.masterBar.index;
                }
            } else {
                let renderers: MasterBarsRenderers | null = group.addBars(this.renderer.tracks!, barIndex);
                if (renderers) {
                    this._allMasterBarRenderers.push(renderers);
                }
            }
            this._barsFromPreviousGroup = [];
            let groupIsFull: boolean = false;
            // can bar placed in this line?
            if (barsPerRow === -1 && group.width >= maxWidth && group.masterBarsRenderers.length !== 0) {
                groupIsFull = true;
            } else if (group.masterBarsRenderers.length === barsPerRow + 1) {
                groupIsFull = true;
            }
            if (groupIsFull) {
                let reverted = group.revertLastBar();
                if (reverted) {
                    this._barsFromPreviousGroup.push(reverted);
                    while (reverted && !reverted.canWrap && group.masterBarsRenderers.length > 1) {
                        reverted = group.revertLastBar();
                        if (reverted) {
                            this._barsFromPreviousGroup.push(reverted);
                        }
                    }
                }
                group.isFull = true;
                group.isLast = false;
                this._barsFromPreviousGroup.reverse();
                return group;
            }
            group.x = 0;
            barIndex++;
        }
        group.isLast = endIndex === group.lastBarIndex;
        return group;
    }

    private get maxWidth(): number {
        return this.renderer.width - this._pagePadding![0] - this._pagePadding![2];
    }
}
