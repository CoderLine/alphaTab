import { type Bar, BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import type { Note } from '@coderline/alphatab/model/Note';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { LineBarRenderer } from '@coderline/alphatab/rendering//LineBarRenderer';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { SlashBeatContainerGlyph } from '@coderline/alphatab/rendering/SlashBeatContainerGlyph';
import { StaffDisplayResolver } from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using Slash Rhythm notation
 * @internal
 */
export class SlashBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'slash';

    public simpleWhammyOverflow: number = 0;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this.helpers.preferredBeamDirection = BeamDirection.Up;
    }

    public override resolveKeySignatureDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            this.bar.slashDisplay?.keySignature,
            this.bar.staff.slashConfig?.keySignature,
            this.bar.staff.track.score.stylesheet.slashConfig.keySignature
        );
    }

    public override resolveTimeSignatureDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            this.bar.slashDisplay?.timeSignature,
            this.bar.staff.slashConfig?.timeSignature,
            this.bar.staff.track.score.stylesheet.slashConfig.timeSignature
        );
    }

    protected override resolveBarNumberDisplay(): BarNumberDisplay {
        return (
            this.bar.slashDisplay?.barNumber ??
            this.bar.staff.slashConfig?.barNumber ??
            this.bar.staff.track.score.stylesheet.slashConfig.barNumber!
        );
    }

    public override get repeatsBarSubElement(): BarSubElement {
        return BarSubElement.SlashRepeats;
    }

    public override get barNumberBarSubElement(): BarSubElement {
        return BarSubElement.SlashBarNumber;
    }

    public override get barLineBarSubElement(): BarSubElement {
        return BarSubElement.SlashBarLines;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.SlashStaffLine;
    }

    public override get lineSpacing(): number {
        return this.smuflMetrics.oneStaffSpace;
    }

    public override get heightLineCount(): number {
        return 5;
    }

    public override get drawnLineCount(): number {
        return 1;
    }

    protected override get bottomGlyphOverflow(): number {
        return 0;
    }

    protected override get flagsSubElement(): BeatSubElement {
        return BeatSubElement.SlashFlags;
    }

    protected override get beamsSubElement(): BeatSubElement {
        return BeatSubElement.SlashBeams;
    }

    protected override get tupletSubElement(): BeatSubElement {
        return BeatSubElement.SlashTuplet;
    }

    public override doLayout(): void {
        super.doLayout();
        if (this.voiceContainer.tupletGroups.size > 0) {
            this.registerOverflowTop(this.tupletSize);
        }
    }

    protected override emitHelperSkyline(h: BeamingHelper): void {
        super.emitHelperSkyline(h);
        if (h.hasTuplet) {
            // Tuplets can span multiple helpers — emit once per group, from its first beat.
            const group = h.beats[0].tupletGroup!;
            if (group.beats.length > 0 && group.beats[0] === h.beats[0]) {
                const xStart = this.getBeatX(group.beats[0], BeatXPosition.PreNotes);
                const xEnd = this.getBeatX(group.beats[group.beats.length - 1], BeatXPosition.PostNotes);
                if (xEnd > xStart) {
                    this.insertSkylineTop(xStart, xEnd, this.tupletSize);
                }
            }
        }
    }

    public getNoteLine(_note: Note) {
        return 0;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        const position = direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown;
        if (beat.notes.length > 0) {
            return this.getNoteY(beat.notes[0], position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const position = direction === BeamDirection.Up ? NoteYPosition.StemUp : NoteYPosition.BottomWithStem;

        if (beat.notes.length > 0) {
            return this.getNoteY(beat.notes[0], position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Up;
    }

    protected override createLinePreBeatGlyphs(): void {
        const timeSignatureDisplay = this.resolveTimeSignatureDisplay();
        if (
            StaffDisplayResolver.isPrimaryForElement(this.staff!, timeSignatureDisplay) &&
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
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, this.smuflMetrics.oneStaffSpace));

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
        g.barSubElement = BarSubElement.SlashTimeSignature;
        this.addPreBeatGlyph(g);
    }

    protected override createVoiceGlyphs(v: Voice): void {
        if (v.index > 0) {
            return;
        }

        super.createVoiceGlyphs(v);
        for (const b of v.beats) {
            this.addBeatGlyph(new SlashBeatContainerGlyph(b));
        }
    }

    protected override calculateOverflows(rendererTop: number, rendererBottom: number): void {
        super.calculateOverflows(rendererTop, rendererBottom);
        if (this.bar.isEmpty) {
            return;
        }
        this.calculateBeamingOverflows(rendererTop, rendererBottom);
    }

    protected override shouldPaintBeamingHelper(h: BeamingHelper): boolean {
        return super.shouldPaintBeamingHelper(h) && h.voice!.index === 0;
    }

    protected override paintBeamingStem(
        beat: Beat,
        _cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.SlashStem, beat);
        canvas.fillRect(x, topY, this.smuflMetrics.stemThickness, bottomY - topY);
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
}
