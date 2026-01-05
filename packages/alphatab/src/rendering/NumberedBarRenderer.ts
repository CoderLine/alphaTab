import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { type Bar, BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BarLineGlyph } from '@coderline/alphatab/rendering/glyphs/BarLineGlyph';
import { BarNumberGlyph } from '@coderline/alphatab/rendering/glyphs/BarNumberGlyph';
import {
    NumberedDashBeatContainerGlyph,
    NumberedNoteBeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/NumberedDashBeatContainerGlyph';
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { NumberedBeatContainerGlyph } from '@coderline/alphatab/rendering/NumberedBeatContainerGlyph';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper, BeamingHelperDrawInfo } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using (Jianpu) Numbered Music Notation
 * @internal
 */
export class NumberedBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'numbered';

    public simpleWhammyOverflow: number = 0;

    private _isOnlyNumbered: boolean;
    public shortestDuration = Duration.QuadrupleWhole;

    get dotSpacing(): number {
        return this.smuflMetrics.glyphHeights.get(MusicFontSymbol.AugmentationDot)! * 2;
    }

    public override get repeatsBarSubElement(): BarSubElement {
        return BarSubElement.NumberedRepeats;
    }

    public override get barNumberBarSubElement(): BarSubElement {
        return BarSubElement.NumberedBarNumber;
    }

    public override get barLineBarSubElement(): BarSubElement {
        return BarSubElement.NumberedBarLines;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.NumberedStaffLine;
    }

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this._isOnlyNumbered = !bar.staff.showSlash && !bar.staff.showTablature && !bar.staff.showStandardNotation;
    }

    public override get lineSpacing(): number {
        return this.smuflMetrics.oneStaffSpace;
    }

    public override get heightLineCount(): number {
        return 5;
    }

    public override get drawnLineCount(): number {
        return 0;
    }

    protected override get bottomGlyphOverflow(): number {
        return 0;
    }

    protected override get flagsSubElement(): BeatSubElement {
        return BeatSubElement.NumberedDuration;
    }

    protected override get beamsSubElement(): BeatSubElement {
        return BeatSubElement.NumberedDuration;
    }

    protected override get tupletSubElement(): BeatSubElement {
        return BeatSubElement.NumberedTuplet;
    }

    protected override shouldPaintBeamingHelper(_h: BeamingHelper): boolean {
        return true;
    }

    protected override paintFlag(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: BeamingHelper,
        flagsElement: BeatSubElement
    ): void {
        this.paintBar(cx, cy, canvas, h, flagsElement);
    }

    protected override paintBar(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: BeamingHelper,
        flagsElement: BeatSubElement
    ): void {
        if (h.beats.length === 0 || h.graceType !== GraceType.None) {
            return;
        }
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            const beat: Beat = h.beats[i];

            using _ = ElementStyleHelper.beat(canvas, flagsElement, beat);

            const direction: BeamDirection = this.getBeamDirection(h);
            const isGrace: boolean = h.graceType !== GraceType.None;
            const scaleMod: number = isGrace ? EngravingSettings.GraceScale : 1;

            let barSpacing: number = (this.beamSpacing + this.beamThickness) * scaleMod;
            let barSize = this.beamThickness * scaleMod;
            if (direction === BeamDirection.Down) {
                barSpacing = -barSpacing;
                barSize = -barSize;
            }

            let barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            let beatLineX: number = this.getBeatX(beat, BeatXPosition.PreNotes);

            let barStartX: number = 0;
            let barEndX: number = 0;
            if (i === h.beats.length - 1) {
                barStartX = beatLineX;
                barEndX = this.getBeatX(beat, BeatXPosition.PostNotes);
            } else {
                barStartX = beatLineX;
                barEndX = this.getBeatX(h.beats[i + 1], BeatXPosition.PreNotes);
            }

            const barStart: number = cy + this.y + this.calculateBeamY(h, beatLineX);
            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                const barY: number = barStart + barIndex * barSpacing;

                LineBarRenderer.paintSingleBar(
                    canvas,
                    cx + this.x + barStartX,
                    barY,
                    cx + this.x + barEndX,
                    barY,
                    barSize
                );
            }

            // dashes for additional numbers
            const container = this.voiceContainer.getBeatContainer(beat) as NumberedBeatContainerGlyph | undefined;
            if (container && container.hasAdditionalNumbers) {
                for (const additionalNumber of container.iterateAdditionalNumbers()) {
                    barCount = additionalNumber.barCount;
                    beatLineX =
                        this.beatGlyphsStart +
                        additionalNumber.x +
                        additionalNumber.getBeatX(BeatXPosition.PreNotes, false);
                    for (let barIndex = 0; barIndex < barCount; barIndex++) {
                        const barY: number = barStart + barIndex * barSpacing;
                        const additionalBarEndX =
                            this.beatGlyphsStart +
                            additionalNumber.x +
                            additionalNumber.getBeatX(BeatXPosition.PostNotes, false);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + beatLineX,
                            barY,
                            cx + this.x + additionalBarEndX,
                            barY,
                            barSize
                        );
                    }
                }
            }
        }
    }

    protected override calculateOverflows(rendererTop: number, rendererBottom: number): void {
        super.calculateOverflows(rendererTop, rendererBottom);
        if (this.bar.isEmpty) {
            return;
        }
        this.calculateBeamingOverflows(rendererTop, rendererBottom);
    }

    public getNoteLine(_note: Note) {
        return 0;
    }

    private _calculateBarHeight(beat: Beat) {
        const barCount: number = ModelUtils.getIndex(beat.duration) - 2;
        let barHeight = 0;
        if (barCount > 0) {
            const smufl = this.smuflMetrics;
            barHeight =
                smufl.numberedBarRendererBarSpacing +
                barCount * (smufl.numberedBarRendererBarSpacing + smufl.numberedBarRendererBarSize);
        }

        return barHeight;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        const barHeight: number = this._calculateBarHeight(beat);
        const container = this.voiceContainer.getBeatContainer(beat);
        if (!container) {
            if (direction === BeamDirection.Up) {
                return this.voiceContainer.getBoundingBoxTop() - barHeight;
            }
            return this.voiceContainer.getBoundingBoxBottom();
        }

        if (direction === BeamDirection.Up) {
            return container.getBoundingBoxTop() - barHeight;
        }
        return container.getBoundingBoxBottom();
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const barHeight: number = this._calculateBarHeight(beat);

        const container = this.voiceContainer.getBeatContainer(beat);
        if (!container) {
            if (direction === BeamDirection.Down) {
                return this.voiceContainer.getBoundingBoxBottom() + barHeight;
            }
            return this.getLineY(0);
        }

        if (direction === BeamDirection.Down) {
            return container.getBoundingBoxBottom() + barHeight;
        }
        return this.getLineY(0);
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected override getTupletBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Up;
    }

    protected override createPreBeatGlyphs(): void {
        this.wasFirstOfStaff = this.isFirstOfStaff;
        if (this.index === 0 || (this.bar.masterBar.isRepeatStart && this._isOnlyNumbered)) {
            this.addPreBeatGlyph(new BarLineGlyph(false, this.bar.staff.track.score.stylesheet.extendBarLines));
        }
        this.createLinePreBeatGlyphs();
        this.createStartSpacing();
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getLineHeight(-0.5), this.bar.index + 1));
    }

    protected override createLinePreBeatGlyphs(): void {
        if (
            this._isOnlyNumbered &&
            (!this.bar.previousBar ||
                (this.bar.previousBar &&
                    this.bar.masterBar.timeSignatureNumerator !==
                        this.bar.previousBar.masterBar.timeSignatureNumerator) ||
                (this.bar.previousBar &&
                    this.bar.masterBar.timeSignatureDenominator !==
                        this.bar.previousBar.masterBar.timeSignatureDenominator) ||
                (this.bar.previousBar &&
                    this.bar.masterBar.isFreeTime &&
                    this.bar.masterBar.isFreeTime !== this.bar.previousBar.masterBar.isFreeTime))
        ) {
            this.createStartSpacing();
            this._createTimeSignatureGlyphs();
        }
    }

    private _createTimeSignatureGlyphs(): void {
        const masterBar = this.bar.masterBar;
        const g = new ScoreTimeSignatureGlyph(
            0,
            this.getLineY(0),
            masterBar.timeSignatureNumerator,
            masterBar.timeSignatureDenominator,
            masterBar.timeSignatureCommon,
            masterBar.isFreeTime &&
                (masterBar.previousMasterBar == null ||
                    masterBar.isFreeTime !== masterBar.previousMasterBar!.isFreeTime)
        );
        g.barSubElement = BarSubElement.NumberedTimeSignature;
        this.addPreBeatGlyph(g);
    }

    protected override createPostBeatGlyphs(): void {
        if (this._isOnlyNumbered) {
            super.createPostBeatGlyphs();
        }
    }

    protected override createVoiceGlyphs(v: Voice): void {
        if (v.index > 0) {
            return;
        }

        super.createVoiceGlyphs(v);

        const absoluteStart = this.bar.masterBar.start;
        for (const b of v.beats) {
            const mainContainer = new NumberedBeatContainerGlyph(b);
            this.addBeatGlyph(mainContainer);

            // create dashes and filler glyphs
            // we want a glyph on every quarter tick

            if (b.duration < Duration.Quarter) {
                const endTick = b.displayStart + b.displayDuration;
                let dashTick = b.displayStart + MidiUtils.QuarterTime;
                while (dashTick < endTick) {
                    const isFullTick = endTick - dashTick >= MidiUtils.QuarterTime;
                    if (isFullTick) {
                        const dash = new NumberedDashBeatContainerGlyph(v.index, absoluteStart + dashTick);
                        this.addBeatGlyph(dash);
                        mainContainer.addDash(dash);
                    }
                    // special case to create second note number, this logic doesn't play well with tuplets
                    else if (b.duration === Duration.Half && b.dots > 1) {
                        const remainingTickNumber = new NumberedNoteBeatContainerGlyphBase(
                            b,
                            absoluteStart + dashTick,
                            endTick - dashTick
                        );
                        this.addBeatGlyph(remainingTickNumber);
                        mainContainer.addNotes(remainingTickNumber);
                    }

                    dashTick += MidiUtils.QuarterTime;
                }
            }
        }
    }

    protected override paintBeamingStem(
        _beat: Beat,
        _cy: number,
        _x: number,
        _topY: number,
        _bottomY: number,
        _canvas: ICanvas
    ): void {}

    protected override get beamSpacing(): number {
        return this.smuflMetrics.numberedBarRendererBarSpacing;
    }

    protected override get beamThickness(): number {
        return this.smuflMetrics.numberedBarRendererBarSize;
    }

    protected override paintBeamHelper(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: BeamingHelper,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        if (h.voice?.index === 0) {
            super.paintBeamHelper(cx, cy, canvas, h, flagsElement, beamsElement);
        }
    }

    protected override applyBarShift(
        _h: BeamingHelper,
        _direction: BeamDirection,
        _drawingInfo: BeamingHelperDrawInfo,
        _barCount: number
    ): number {
        return 0;
    }

    protected override calculateBeamYWithDirection(h: BeamingHelper, _x: number, direction: BeamDirection): number {
        this.ensureBeamDrawingInfo(h, direction);
        const info = h.drawingInfos.get(direction)!;
        if (direction === BeamDirection.Up) {
            return Math.min(info.startY, info.endY);
        } else {
            return Math.max(info.startY, info.endY);
        }
    }
}
