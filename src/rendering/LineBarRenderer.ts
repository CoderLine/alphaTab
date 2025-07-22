import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NotationMode } from '@src/NotationSettings';
import { FlagGlyph } from '@src/rendering/glyphs/FlagGlyph';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { BarLineGlyph } from '@src/rendering/glyphs/BarLineGlyph';
import { RepeatCountGlyph } from '@src/rendering/glyphs/RepeatCountGlyph';
import { BarNumberGlyph } from '@src/rendering/glyphs/BarNumberGlyph';
import { type Beat, BeatBeamingMode, type BeatSubElement } from '@src/model/Beat';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import type { BarSubElement } from '@src/model/Bar';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import type { TupletGroup } from '@src/model/TupletGroup';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { BeatXPosition } from '@src/rendering/BeatXPosition';

/**
 * This is a base class for any bar renderer which renders music notation on a staff
 * with lines like Standard Notation, Guitar Tablatures and Slash Notation.
 *
 * This base class takes care of the typical bits like drawing lines,
 * allowing note positioning and creating glyphs like repeats, bar numbers etc..
 */
export abstract class LineBarRenderer extends BarRendererBase {
    protected firstLineY: number = 0;
    private _startSpacing = false;
    protected tupletSize: number = 0;

    public get lineOffset(): number {
        return this.lineSpacing;
    }

    public get tupletOffset(): number {
        return this.smuflMetrics.oneStaffSpace * 0.5;
    }

    public abstract get lineSpacing(): number;
    public abstract get heightLineCount(): number;
    public abstract get drawnLineCount(): number;

    protected get topGlyphOverflow() {
        return this.smuflMetrics.oneStaffSpace;
    }

    protected get bottomGlyphOverflow() {
        return this.smuflMetrics.oneStaffSpace;
    }

    protected initLineBasedSizes() {
        this.topPadding = this.topGlyphOverflow;
        this.bottomPadding = this.bottomGlyphOverflow;
        this.height = this.lineOffset * (this.heightLineCount - 1) + this.topPadding + this.bottomPadding;
    }

    protected override updateSizes(): void {
        this.initLineBasedSizes();
        this.adjustSizes();
        this.updateFirstLineY();

        super.updateSizes();
    }

    protected adjustSizes() {
        // adjusted in subclasses
    }

    protected updateFirstLineY() {
        const fullLineHeight = this.lineOffset * (this.heightLineCount - 1);
        const actualLineHeight = (this.drawnLineCount - 1) * this.lineOffset;
        this.firstLineY = ((this.topPadding + (fullLineHeight - actualLineHeight) / 2) | 0);
    }

    public override doLayout(): void {
        this.initLineBasedSizes();
        this.updateFirstLineY();
        this.tupletSize = this.smuflMetrics.glyphHeights.get(MusicFontSymbol.Tuplet0)!;
        super.doLayout();
    }

    public getLineY(line: number) {
        return this.firstLineY + this.getLineHeight(line);
    }

    public getLineHeight(line: number): number {
        return this.lineOffset * line;
    }

    // private static readonly Random Random = new Random();
    protected override paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        super.paintBackground(cx, cy, canvas);
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        //
        // draw string lines
        //

        this.paintStaffLines(cx, cy, canvas);

        this.paintSimileMark(cx, cy, canvas);
    }

    protected paintStaffLines(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.bar(canvas, this.staffLineBarSubElement, this.bar, true);

        // collect tab note position for spaces
        const spaces: Float32Array[][] = [];
        for (let i: number = 0, j: number = this.drawnLineCount; i < j; i++) {
            spaces.push([]);
        }

        // on multibar rest glyphs we don't have spaces as they are empty
        if (!this.additionalMultiRestBars) {
            this.collectSpaces(spaces);
        }

        // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list
        // but painting relies on ascending X-position
        for (const line of spaces) {
            line.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
        }

        // during system fitting it can happen that we have fraction widths
        // but to have lines until the full end-pixel we round up.
        // this way we avoid holes
        const lineWidth = this.width;
        
        // we want the lines to be exactly virtually aligned with the respective Y-position
        // for note heads to align correctly
        const lineYOffset = this.smuflMetrics.staffLineThickness / 2;

        for (let i: number = 0; i < this.drawnLineCount; i++) {
            const lineY = this.getLineY(i) - lineYOffset;

            let lineX: number = 0;
            for (const line of spaces[i]) {
                canvas.fillRect(
                    cx + this.x + lineX,
                    cy + this.y + lineY,
                    line[0] - lineX,
                    this.smuflMetrics.staffLineThickness
                );
                lineX = line[0] + line[1];
            }
            canvas.fillRect(
                cx + this.x + lineX,
                cy + this.y + lineY,
                lineWidth - lineX,
                this.smuflMetrics.staffLineThickness
            );
        }
    }

    protected collectSpaces(spaces: Float32Array[][]) {
        // override in subclasses
    }

    protected createStartSpacing(): void {
        if (this._startSpacing) {
            return;
        }
        const padding =
            this.index === 0 ? this.settings.display.firstStaffPaddingLeft : this.settings.display.staffPaddingLeft;
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, padding));
        this._startSpacing = true;
    }

    protected paintTuplets(
        cx: number,
        cy: number,
        canvas: ICanvas,
        beatElement: BeatSubElement,
        bracketsAsArcs: boolean = false
    ): void {
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const container = this.getVoiceContainer(voice)!;
                for (const tupletGroup of container.tupletGroups) {
                    this.paintTupletHelper(
                        cx + this.beatGlyphsStart,
                        cy,
                        canvas,
                        tupletGroup,
                        beatElement,
                        bracketsAsArcs
                    );
                }
            }
        }
    }

    protected abstract getBeamDirection(helper: BeamingHelper): BeamDirection;
    protected getTupletBeamDirection(helper: BeamingHelper): BeamDirection {
        return this.getBeamDirection(helper);
    }

    protected abstract calculateBeamYWithDirection(h: BeamingHelper, x: number, direction: BeamDirection): number;

    private paintTupletHelper(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: TupletGroup,
        beatElement: BeatSubElement,
        bracketsAsArcs: boolean
    ): void {
        const res = this.resources;
        const oldAlign: TextAlign = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.color = h.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Middle;
        let s: MusicFontSymbol[];
        const num: number = h.beats[0].tupletNumerator;
        const den: number = h.beats[0].tupletDenominator;
        // list as in Guitar Pro 7. for certain tuplets only the numerator is shown
        if (num === 2 && den === 3) {
            s = [MusicFontSymbol.Tuplet2];
        } else if (num === 3 && den === 2) {
            s = [MusicFontSymbol.Tuplet3];
        } else if (num === 4 && den === 6) {
            s = [MusicFontSymbol.Tuplet4];
        } else if (num === 5 && den === 4) {
            s = [MusicFontSymbol.Tuplet5];
        } else if (num === 6 && den === 4) {
            s = [MusicFontSymbol.Tuplet6];
        } else if (num === 7 && den === 4) {
            s = [MusicFontSymbol.Tuplet7];
        } else if (num === 9 && den === 8) {
            s = [MusicFontSymbol.Tuplet9];
        } else if (num === 10 && den === 8) {
            s = [MusicFontSymbol.Tuplet1, MusicFontSymbol.Tuplet0];
        } else if (num === 11 && den === 8) {
            s = [MusicFontSymbol.Tuplet1, MusicFontSymbol.Tuplet1];
        } else if (num === 12 && den === 8) {
            s = [MusicFontSymbol.Tuplet1, MusicFontSymbol.Tuplet2];
        } else if (num === 13 && den === 8) {
            s = [MusicFontSymbol.Tuplet1, MusicFontSymbol.Tuplet3];
        } else {
            s = [];
            const zero = MusicFontSymbol.Tuplet0 as number;
            if (num > 10) {
                s.push((zero + Math.floor(num / 10)) as MusicFontSymbol);
                s.push((zero + (num - 10)) as MusicFontSymbol);
            } else {
                s.push((zero + num) as MusicFontSymbol);
            }

            s.push(MusicFontSymbol.TupletColon);

            if (den > 10) {
                s.push((zero + Math.floor(den / 10)) as MusicFontSymbol);
                s.push((zero + (den - 10)) as MusicFontSymbol);
            } else {
                s.push((zero + den) as MusicFontSymbol);
            }
        }

        // check if we need to paint simple footer
        const offset: number = this.tupletOffset;
        const size: number = this.tupletSize;

        using _ = ElementStyleHelper.beat(canvas, beatElement, h.beats[0]);

        const l = canvas.lineWidth;
        canvas.lineWidth = this.smuflMetrics.tupletBracketThickness;

        if (h.beats.length === 1 || !h.isFull) {
            for (const beat of h.beats) {
                const beamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(beat.index)!;
                if (!beamingHelper) {
                    continue;
                }

                const direction: BeamDirection = this.getTupletBeamDirection(beamingHelper);

                const tupletX: number = beamingHelper.getBeatLineX(beat);
                let tupletY: number = this.calculateBeamYWithDirection(beamingHelper, tupletX, direction);

                if (direction === BeamDirection.Down) {
                    tupletY += offset + size;
                } else {
                    tupletY -= offset + size;
                }

                canvas.fillMusicFontSymbols(cx + this.x + tupletX, cy + this.y + tupletY, 1, s, true);
            }
        } else {
            const firstBeat: Beat = h.beats[0];
            const lastBeat: Beat = h.beats[h.beats.length - 1];

            let firstNonRestBeat: Beat | null = null;
            let lastNonRestBeat: Beat | null = null;
            for (let i = 0; i < h.beats.length; i++) {
                if (!h.beats[i].isRest) {
                    firstNonRestBeat = h.beats[i];
                    break;
                }
            }
            for (let i = h.beats.length - 1; i >= 0; i--) {
                if (!h.beats[i].isRest) {
                    lastNonRestBeat = h.beats[i];
                    break;
                }
            }

            let isRestOnly = false;
            if (!firstNonRestBeat) {
                firstNonRestBeat = firstBeat;
                isRestOnly = true;
            }

            if (!lastNonRestBeat) {
                lastNonRestBeat = lastBeat;
            }

            //
            // Calculate the overall area of the tuplet bracket
            const firstBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstBeat.index)!;
            const startX: number = this.getBeatX(firstBeat, BeatXPosition.OnNotes) - this.beatGlyphsStart;
            const endX: number = this.getBeatX(lastBeat, BeatXPosition.PostNotes) - this.beatGlyphsStart;

            //
            // calculate the y positions for our bracket
            const firstNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstNonRestBeat.index)!;
            const lastNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastNonRestBeat.index)!;
            const direction = this.getTupletBeamDirection(firstBeamingHelper);
            let startY: number = this.calculateBeamYWithDirection(firstNonRestBeamingHelper, startX, direction);
            let endY: number = this.calculateBeamYWithDirection(lastNonRestBeamingHelper, endX, direction);
            if (isRestOnly) {
                startY = Math.max(startY, endY);
                endY = startY;
            }

            // align line centered in available space
            const shift = offset + size * 0.5;
            if (direction === BeamDirection.Down) {
                startY += shift;
                endY += shift;
            } else {
                startY -= shift;
                endY -= shift;
            }

            //
            // Calculate how many space the text will need
            const sw: number = s.reduce((acc, sym) => acc + res.smuflMetrics.glyphWidths.get(sym)!, 0);
            const sp = res.smuflMetrics.oneStaffSpace * 0.5;

            //
            // Calculate the offsets where to break the bracket
            const middleX: number = (startX + endX) / 2;
            const offset1X: number = middleX - sw / 2 - sp;
            const offset2X: number = middleX + sw / 2 + sp;

            const k: number = (endY - startY) / (endX - startX);
            const d: number = startY - k * startX;
            const offset1Y: number = k * offset1X + d;
            const middleY: number = k * middleX + d;
            const offset2Y: number = k * offset2X + d;

            const angleStartY = direction === BeamDirection.Down ? startY - size * 0.5 : startY + size * 0.5;
            const angleEndY = direction === BeamDirection.Down ? endY - size * 0.5 : endY + size * 0.5;

            //
            // draw the bracket
            const pixelAlignment = canvas.lineWidth % 2 === 0 ? 0 : 0.5;
            cx += pixelAlignment;
            cy += pixelAlignment;

            canvas.beginPath();
            canvas.moveTo(cx + this.x + startX, cy + this.y + angleStartY);
            if (bracketsAsArcs) {
                canvas.quadraticCurveTo(
                    cx + this.x + (offset1X + startX) / 2,
                    cy + this.y + offset1Y,
                    cx + this.x + offset1X,
                    cy + this.y + offset1Y
                );
            } else {
                canvas.lineTo(cx + this.x + startX, cy + this.y + startY);
                canvas.lineTo(cx + this.x + offset1X, cy + this.y + offset1Y);
            }

            canvas.moveTo(cx + this.x + offset2X, cy + this.y + offset2Y);
            if (bracketsAsArcs) {
                canvas.quadraticCurveTo(
                    cx + this.x + (endX + offset2X) / 2,
                    cy + this.y + offset2Y,
                    cx + this.x + endX,
                    cy + this.y + angleEndY
                );
            } else {
                canvas.lineTo(cx + this.x + endX, cy + this.y + endY);
                canvas.lineTo(cx + this.x + endX, cy + this.y + angleEndY);
            }

            canvas.stroke();

            //
            // Draw the string
            canvas.fillMusicFontSymbols(cx + this.x + middleX, cy + this.y + middleY + size * 0.5, 1, s, true);
        }

        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
        canvas.lineWidth = l;
    }

    protected paintBeams(
        cx: number,
        cy: number,
        canvas: ICanvas,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                this.paintBeamHelper(cx + this.beatGlyphsStart, cy, canvas, h, flagsElement, beamsElement);
            }
        }
    }

    public drawBeamHelperAsFlags(h: BeamingHelper): boolean {
        return h.beats.length === 1;
    }

    private paintBeamHelper(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: BeamingHelper,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        canvas.color = h.voice!.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        if (!h.isRestBeamHelper) {
            if (this.drawBeamHelperAsFlags(h)) {
                this.paintFlag(cx, cy, canvas, h, flagsElement);
            } else {
                this.paintBar(cx, cy, canvas, h, beamsElement);
            }
        }
    }

    protected abstract getFlagTopY(beat: Beat, direction: BeamDirection): number;
    protected abstract getFlagBottomY(beat: Beat, direction: BeamDirection): number;
    protected shouldPaintFlag(beat: Beat, h: BeamingHelper): boolean {
        // no flags for bend grace beats
        if (beat.graceType === GraceType.BendGrace) {
            return false;
        }

        if (beat.deadSlapped) {
            return false;
        }

        // we don't have an X-position: cannot paint a flag
        if (!h.hasBeatLineX(beat)) {
            return false;
        }

        // no flags for any grace notes on songbook mode
        if (beat.graceType !== GraceType.None && this.settings.notation.notationMode === NotationMode.SongBook) {
            return false;
        }

        // only flags for durations with stems
        if (
            beat.duration === Duration.Whole ||
            beat.duration === Duration.DoubleWhole ||
            beat.duration === Duration.QuadrupleWhole
        ) {
            return false;
        }

        return true;
    }

    protected paintFlag(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, flagsElement: BeatSubElement): void {
        for (const beat of h.beats) {
            if (!this.shouldPaintFlag(beat, h)) {
                continue;
            }

            const isGrace: boolean = beat.graceType !== GraceType.None;
            //
            // draw line
            //
            const beatLineX: number = h.getBeatLineX(beat);
            const direction: BeamDirection = this.getBeamDirection(h);
            const topY: number = cy + this.y + this.getFlagTopY(beat, direction);
            const bottomY: number = cy + this.y + this.getFlagBottomY(beat, direction);
            let flagY: number = 0;
            if (direction === BeamDirection.Down) {
                flagY = bottomY;
            } else {
                flagY = topY;
            }

            if (!h.hasLine(true, beat)) {
                continue;
            }

            this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, topY, bottomY, canvas);
            this.paintStemEffects(beat, cy + this.y, cx + this.x + beatLineX, topY, bottomY, canvas);

            using _ = ElementStyleHelper.beat(canvas, flagsElement, beat);

            let flagWidth = 0;

            //
            // Draw flag
            //
            if (h.hasFlag(true, beat)) {
                const glyph: FlagGlyph = new FlagGlyph(
                    cx + this.x + beatLineX,
                    flagY,
                    beat.duration,
                    direction,
                    isGrace
                );
                glyph.renderer = this;
                glyph.doLayout();
                glyph.paint(0, 0, canvas);
                flagWidth = glyph.width / 2;
            }

            if (beat.graceType === GraceType.BeforeBeat) {
                if (direction === BeamDirection.Down) {
                    canvas.fillMusicFontSymbol(
                        cx + this.x + beatLineX + flagWidth / 2,
                        (topY + bottomY - this.smuflMetrics.glyphHeights.get(MusicFontSymbol.GraceNoteSlashStemDown)!) /
                            2,
                        NoteHeadGlyph.GraceScale,
                        MusicFontSymbol.GraceNoteSlashStemDown,
                        true
                    );
                } else {
                    canvas.fillMusicFontSymbol(
                        cx + this.x + beatLineX + flagWidth / 2,
                        (topY + bottomY + this.smuflMetrics.glyphHeights.get(MusicFontSymbol.GraceNoteSlashStemUp)!) /
                            2,
                        NoteHeadGlyph.GraceScale,
                        MusicFontSymbol.GraceNoteSlashStemUp,
                        true
                    );
                }
            }
        }
    }

    protected abstract paintBeamingStem(
        beat: Beat,
        cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void;

    protected paintStemEffects(
        beat: Beat,
        _cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        if (beat.isTremolo && !beat.deadSlapped) {
            let tremoloGlyph = MusicFontSymbol.None;
            switch (beat.tremoloSpeed!) {
                case Duration.ThirtySecond:
                    tremoloGlyph = MusicFontSymbol.Tremolo3;
                    break;
                case Duration.Sixteenth:
                    tremoloGlyph = MusicFontSymbol.Tremolo2;
                    break;
                case Duration.Eighth:
                    tremoloGlyph = MusicFontSymbol.Tremolo1;
                    break;
            }

            canvas.fillMusicFontSymbol(x, (topY + bottomY) / 2, 1, tremoloGlyph, false);
        }
    }

    protected getFlagStemSize(duration: Duration, forceMinStem: boolean = false): number {
        let size: number = 0;

        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.Half:
            case Duration.Quarter:
            case Duration.Eighth:
            case Duration.Sixteenth:
            case Duration.ThirtySecond:
            case Duration.SixtyFourth:
            case Duration.OneHundredTwentyEighth:
            case Duration.TwoHundredFiftySixth:
                size = this.smuflMetrics.standardStemLength + this.smuflMetrics.stemFlagOffsets.get(duration)!;
                break;
            default:
                size = forceMinStem ? this.smuflMetrics.standardStemLength : 0;
                break;
        }
        return size;
    }

    protected override recreatePreBeatGlyphs(): void {
        this._startSpacing = false;
        super.recreatePreBeatGlyphs();
    }

    protected abstract getBarLineStart(beat: Beat, direction: BeamDirection): number;

    public calculateBeamY(h: BeamingHelper, x: number): number {
        return this.calculateBeamYWithDirection(h, x, this.getBeamDirection(h));
    }

    protected override createPreBeatGlyphs(): void {
        super.createPreBeatGlyphs();
        this.addPreBeatGlyph(new BarLineGlyph(false));
        this.createLinePreBeatGlyphs();
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getLineHeight(-0.25), this.bar.index + 1));
    }

    protected abstract createLinePreBeatGlyphs(): void;

    protected override createPostBeatGlyphs(): void {
        super.createPostBeatGlyphs();
        const lastBar = this.lastBar;

        this.addPostBeatGlyph(new BarLineGlyph(true));

        if (lastBar.masterBar.isRepeatEnd && lastBar.masterBar.repeatCount > 2) {
            this.addPostBeatGlyph(new RepeatCountGlyph(0, this.getLineHeight(-0.25), this.bar.masterBar.repeatCount));
        }
    }

    public abstract get repeatsBarSubElement(): BarSubElement;
    public abstract get barNumberBarSubElement(): BarSubElement;
    public abstract get barLineBarSubElement(): BarSubElement;
    public abstract get staffLineBarSubElement(): BarSubElement;

    protected paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, beamsElement: BeatSubElement): void {
        const direction: BeamDirection = this.getBeamDirection(h);
        const isGrace: boolean = h.graceType !== GraceType.None;
        const scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
        let barSpacing: number = (this.smuflMetrics.beamSpacing + this.smuflMetrics.beamThickness) * scaleMod;
        let barSize: number = this.smuflMetrics.beamThickness * scaleMod;
        if (direction === BeamDirection.Down) {
            barSpacing = -barSpacing;
            barSize = -barSize;
        }

        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            const beat: Beat = h.beats[i];
            if (!h.hasBeatLineX(beat) || beat.deadSlapped) {
                continue;
            }

            const beatLineX: number = h.getBeatLineX(beat);
            const y1: number = cy + this.y + this.getBarLineStart(beat, direction);

            // ensure we are pixel aligned on the end of the stem to avoid anti-aliasing artifacts
            // when combining stems and beams on sub-pixel level
            const y2: number = (cy + this.y + this.calculateBeamY(h, beatLineX)) | 0;

            if (y1 < y2) {
                this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y1, y2, canvas);
            } else {
                this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y2, y1, canvas);
            }

            using _ = ElementStyleHelper.beat(canvas, beamsElement, beat);

            let fingeringY: number = y2;
            if (direction === BeamDirection.Down) {
                fingeringY += canvas.font.size * 2;
            } else if (i !== 0) {
                fingeringY -= canvas.font.size * 1.5;
            }
            const brokenBarOffset: number = this.smuflMetrics.brokenBeamWidth * scaleMod;
            const barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            const barStart: number = cy + this.y;

            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                let barStartX: number = 0;
                let barEndX: number = 0;
                let barStartY: number = 0;
                let barEndY: number = 0;
                const barY: number = barStart + barIndex * barSpacing;

                //
                // Bar to Next?
                //
                if (i < h.beats.length - 1) {
                    const isFullBarJoin = BeamingHelper.isFullBarJoin(beat, h.beats[i + 1], barIndex);

                    // force two broken bars on secondary (last) beam?
                    if (
                        barIndex === barCount - 1 &&
                        isFullBarJoin &&
                        beat.beamingMode === BeatBeamingMode.ForceSplitOnSecondaryToNext
                    ) {
                        // start part
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );

                        // end part
                        barEndX = h.getBeatLineX(h.beats[i + 1]);
                        barStartX = barEndX - brokenBarOffset;
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    } else {
                        if (isFullBarJoin) {
                            // full bar?
                            barStartX = beatLineX;
                            barEndX = h.getBeatLineX(h.beats[i + 1]);
                        } else if (i === 0 || !BeamingHelper.isFullBarJoin(h.beats[i - 1], beat, barIndex)) {
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        } else {
                            continue;
                        }
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);

                        // ensure we are pixel aligned on the end of the stem to avoid anti-aliasing artifacts
                        // when combining stems and beams on sub-pixel level
                        if (barIndex === 0) {
                            barStartY = barStartY | 0;
                            barEndY = barEndY | 0;
                        }

                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    }
                } else if (i > 0 && !BeamingHelper.isFullBarJoin(beat, h.beats[i - 1], barIndex)) {
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barEndX = beatLineX;
                    barStartY = barY + this.calculateBeamY(h, barStartX);
                    barEndY = barY + this.calculateBeamY(h, barEndX);
                    LineBarRenderer.paintSingleBar(
                        canvas,
                        cx + this.x + barStartX,
                        barStartY,
                        cx + this.x + barEndX,
                        barEndY,
                        barSize
                    );
                }
            }
        }

        if (h.graceType === GraceType.BeforeBeat) {
            const beatLineX: number = h.getBeatLineX(h.beats[0]);
            const flagWidth = this.smuflMetrics.glyphWidths.get(MusicFontSymbol.Flag8thUp)! * NoteHeadGlyph.GraceScale;
            let slashY: number = (cy + this.y + this.calculateBeamY(h, beatLineX)) | 0;
            slashY += barSize + barSpacing;

            if (direction === BeamDirection.Down) {
                canvas.fillMusicFontSymbol(
                    cx + this.x + beatLineX + flagWidth / 2,
                    slashY,
                    NoteHeadGlyph.GraceScale,
                    MusicFontSymbol.GraceNoteSlashStemDown,
                    true
                );
            } else {
                canvas.fillMusicFontSymbol(
                    cx + this.x + beatLineX + flagWidth / 2,
                    slashY,
                    NoteHeadGlyph.GraceScale,
                    MusicFontSymbol.GraceNoteSlashStemUp,
                    true
                );
            }
        }
    }

    protected static paintSingleBar(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        size: number
    ): void {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 + size);
        canvas.lineTo(x1, y1 + size);
        canvas.closePath();
        canvas.fill();
    }
}
