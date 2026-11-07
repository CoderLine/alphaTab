import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import type { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { NumberedNoteMode } from '@coderline/alphatab/model/StaffConfigs';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BarLineGlyph } from '@coderline/alphatab/rendering/glyphs/BarLineGlyph';
import type { NumberedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedBeatGlyph';
import {
    NumberedDashBeatContainerGlyph,
    NumberedNoteBeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/NumberedDashBeatContainerGlyph';
import { NumberedNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedNoteHeadGlyph';
import { NumberedTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedTimeSignatureGlyph';
import { TimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/TimeSignatureGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { NumberedBeatContainerGlyph } from '@coderline/alphatab/rendering/NumberedBeatContainerGlyph';
import type { HeaderKey } from '@coderline/alphatab/rendering/staves/HeaderProfile';
import { StaffDisplayResolver } from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper, BeamingHelperDrawInfo } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using (Jianpu) Numbered Music Notation
 * @internal
 */
export class NumberedBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'numbered';
    private static readonly _systemSlotsKey: string = 'numbered.systemSlots';

    public simpleWhammyOverflow: number = 0;

    public shortestDuration = Duration.QuadrupleWhole;

    /**
     * Whether only a single number of the first voice is written per beat.
     */
    public isSingleNote = false;

    /**
     * How the notes of the staff are written, from the staff or the score stylesheet.
     */
    public static resolveNoteMode(staff: Staff): NumberedNoteMode {
        return staff.numberedConfig?.notes ?? staff.track.score.stylesheet.numberedConfig.notes!;
    }

    /**
     * The slots the numbers of this bar need on their own (chords, further voices);
     * null if every number of the bar sits on the line of single numbers.
     */
    private _slotNeeds: NumberedSlotLayout | null = null;
    private _slots: NumberedSlotLayout = NumberedSlotLayout.single;
    private _numberHeight: number = 0;
    // the last voice whose row the slot needs hold, and the height its numbers hang below the row
    private _neededRowVoice: number = 0;
    private _neededRowHang: number = 0;

    public override doLayout(): void {
        this._slotNeeds = null;
        this._slots = NumberedSlotLayout.single;
        this._numberHeight = 0;
        this._neededRowVoice = 0;
        this._neededRowHang = 0;
        this.isSingleNote = NumberedBarRenderer.resolveNoteMode(this.bar.staff) === NumberedNoteMode.SingleNote;
        super.doLayout();
    }

    /**
     * Places the numbers on the slots of the staff in its system before the bar is scaled: all bars of the
     * staff in the system share the slots their numbers need, as they share the staff lines.
     */
    public override scaleToWidth(width: number): void {
        this._alignToSlots(this._getSystemSlots());
        super.scaleToWidth(width);
    }

    /**
     * The slots holding the numbers of all bars of the staff in the system. The layouts scale the bars of a
     * staff in their order once the system holds all of them, so the first bar resolves the slots for the others.
     */
    private _getSystemSlots(): NumberedSlotLayout {
        const staff = this.staff!;
        const key = NumberedBarRenderer._systemSlotsKey;
        if (this.index > 0) {
            return staff.getSharedLayoutData<NumberedSlotLayout>(key, NumberedSlotLayout.single);
        }
        let layout = NumberedSlotLayout.single;
        for (const r of staff.barRenderers) {
            const needs = (r as NumberedBarRenderer)._slotNeeds;
            if (needs) {
                layout = NumberedSlotLayout.merge(layout, needs);
            }
        }
        if (layout !== NumberedSlotLayout.single) {
            staff.setSharedLayoutData(key, layout);
        }
        return layout;
    }

    /**
     * Moves the numbers of this bar vertically onto the given slots and measures the bar again,
     * without a new layout. The result depends only on the bar and the given slots.
     */
    private _alignToSlots(layout: NumberedSlotLayout): void {
        const own = this._slotNeeds ?? NumberedSlotLayout.single;
        // relayout passes restore the overflows measured with the own slots, so bars off their own slots
        // are measured again on every pass
        if (layout.matches(own) && layout.matches(this._slots)) {
            return;
        }
        this._slots = layout;
        for (const voice of this.voiceContainer.beatGlyphs) {
            for (const c of voice) {
                if (c instanceof NumberedBeatContainerGlyph) {
                    c.updateVerticalPositions();
                }
            }
        }
        this.remeasureVertically();
    }

    private _getNumberHeight(): number {
        if (this._numberHeight === 0) {
            const canvas = this.scoreRenderer.canvas!;
            canvas.font = this.resources.numberedNotationFont;
            this._numberHeight = this.scoreRenderer.layout!.textMeasures.measureText(canvas, '1').height;
        }
        return this._numberHeight;
    }

    /**
     * The note written for the beat when only a single number is written per beat: the highest visible note.
     */
    public getSingleNote(beat: Beat): Note | null {
        return beat.maxNote;
    }

    /**
     * Whether the given note is written as a number of its beat.
     */
    public isNoteDisplayed(note: Note): boolean {
        return this.isSingleNote ? this.getSingleNote(note.beat) === note : note.isVisible;
    }

    /**
     * The y position of the k-th number from the bottom of the chords in the row of the given voice.
     */
    public getNumberY(voiceIndex: number, chordIndex: number): number {
        const slots = this._slots;
        return this.getLineY((slots.getRowStep(voiceIndex) - slots.getChordStep(voiceIndex, chordIndex)) / 2);
    }

    /**
     * The y position of the numbers of the given voice: every voice is written on its own row.
     */
    public getVoiceLineY(voiceIndex: number): number {
        return this.getNumberY(voiceIndex, 0);
    }

    private _isVoiceWritten(voiceIndex: number): boolean {
        return !this.isSingleNote || voiceIndex === 0;
    }

    /**
     * Whether the row of the given voice holds content in this bar.
     */
    public isRowWritten(voiceIndex: number): boolean {
        return this._isVoiceWritten(voiceIndex) && this.bar.filledVoices.has(voiceIndex);
    }

    public override resolveTimeSignatureDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            this.bar.numberedDisplay?.timeSignature,
            this.bar.staff.numberedConfig?.timeSignature,
            this.bar.staff.track.score.stylesheet.numberedConfig.timeSignature
        );
    }

    protected override resolveBarNumberDisplay(): BarNumberDisplay {
        return (
            this.bar.numberedDisplay?.barNumber ??
            this.bar.staff.numberedConfig?.barNumber ??
            this.bar.staff.track.score.stylesheet.numberedConfig.barNumber!
        );
    }

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

    public override get lineSpacing(): number {
        return this.smuflMetrics.oneStaffSpace;
    }

    public override get heightLineCount(): number {
        return this._slots.lineCount;
    }

    public override get drawnLineCount(): number {
        return 0;
    }

    public override get staffRowLineCount(): number {
        return 5;
    }

    public override get staffRowCount(): number {
        let count = 0;
        for (let v = 0; v < this.bar.voices.length; v++) {
            if (this.isRowWritten(v)) {
                count++;
            }
        }
        return count;
    }

    public override getStaffRowOffset(index: number): number {
        let row = 0;
        for (let v = 0; v < this.bar.voices.length; v++) {
            if (this.isRowWritten(v)) {
                if (row === index) {
                    return this.getVoiceLineY(v) - this.getLineY(0);
                }
                row++;
            }
        }
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

            const previousColor = ElementStyleHelper.applyBeat(canvas, flagsElement, beat);
            try {
                const container = this.voiceContainer.getBeatContainer(beat) as NumberedBeatContainerGlyph | undefined;
                // the underlines hang below the numbers: the first line spans the whole group,
                // shorter durations add their lines below it
                const barSpacing: number = this.beamSpacing + this.beamThickness;
                const barSize = this.beamThickness;

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

                // the underline block starts with a gap below the numbers, followed by a spacing before every line
                const barStart: number =
                    cy +
                    this.y +
                    this.calculateBeamY(h, beatLineX) -
                    (container ? container.underlinesHeight : 0) +
                    2 * this.beamSpacing;
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
            } finally {
                ElementStyleHelper.restore(canvas, previousColor);
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
        return this.getUnderlinesHeightForCount(ModelUtils.getIndex(beat.duration) - 2);
    }

    /**
     * The height of the given number of duration underlines including the gap to the number above.
     */
    public getUnderlinesHeightForCount(barCount: number): number {
        if (barCount <= 0) {
            return 0;
        }
        const smufl = this.smuflMetrics;
        return (
            smufl.numberedBarRendererBarSpacing +
            barCount * (smufl.numberedBarRendererBarSpacing + smufl.numberedBarRendererBarSize)
        );
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
        const container = this.voiceContainer.getBeatContainer(beat) as NumberedBeatContainerGlyph | undefined;
        if (!container) {
            if (direction === BeamDirection.Down) {
                return this.voiceContainer.getBoundingBoxBottom() + this._calculateBarHeight(beat);
            }
            return this.getLineY(0);
        }

        if (direction === BeamDirection.Down) {
            // the underlines sit directly below the numbers, low octave dots go below them
            const numbersBottom =
                beat.isEmpty || beat.deadSlapped
                    ? container.getBoundingBoxBottom()
                    : container.getLowestNoteY(NoteYPosition.Bottom);
            return numbersBottom + container.underlinesHeight;
        }
        return this.getVoiceLineY(beat.voice.index);
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected override getTupletBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Up;
    }

    protected override createPreBeatGlyphs(): void {
        this.wasFirstOfStaff = this.isFirstOfStaff;
        if (this.index === 0 || (this.bar.masterBar.isRepeatStart && this.staff!.isCascadePrimary)) {
            this.addPreBeatGlyph(new BarLineGlyph(false, this.bar.staff.track.score.stylesheet.extendBarLines));
        }
        this.createStartSpacing();
        this.createLinePreBeatGlyphs();
    }

    protected override buildHeaderKey(key: HeaderKey): void {
        super.buildHeaderKey(key);
        key.addHighFlag(this.staff!.isCascadePrimary);
    }

    protected override buildLineHeaderKey(key: HeaderKey): void {
        this.buildTimeSignatureHeaderKey(key);
    }

    protected override createLinePreBeatGlyphs(): void {
        // No header KS glyph: the "1=X" key designation is rendered as an
        // above-staff label by {@link NumberedBarKeySignatureEffectInfo}.
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
            this._createTimeSignatureGlyphs();
        }
    }

    private _createTimeSignatureGlyphs(): void {
        const masterBar = this.bar.masterBar;
        const g = new NumberedTimeSignatureGlyph(
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
        g.trailingSpacing = this.smuflMetrics.oneStaffSpace;
        this.addPreBeatGlyph(g);
    }

    protected override createPostBeatGlyphs(): void {
        if (this.staff!.isCascadePrimary) {
            super.createPostBeatGlyphs();
        }
    }

    /**
     * The height of the time signature the bar writes in front of its rows; 0 if it writes none.
     */
    private _getTimeSignatureHeight(): number {
        const profile = this.headerProfile;
        if (!profile) {
            return 0;
        }
        for (const g of profile.glyphs) {
            if (g.rank === TimeSignatureGlyph.HeaderRank) {
                const masterBar = this.bar.masterBar;
                const heights = this.smuflMetrics.glyphHeights;
                if (masterBar.timeSignatureCommon) {
                    const numerator = masterBar.timeSignatureNumerator;
                    const denominator = masterBar.timeSignatureDenominator;
                    if (numerator === 2 && denominator === 2) {
                        return heights.get(MusicFontSymbol.TimeSigCutCommon)!;
                    }
                    if (numerator === 4 && denominator === 4) {
                        return heights.get(MusicFontSymbol.TimeSigCommon)!;
                    }
                }
                return 2 * heights.get(MusicFontSymbol.TimeSig0)!;
            }
        }
        return 0;
    }

    /**
     * The steps between the centres of two stacked chord numbers with the given octave dots, so that the dots
     * of both fit between them.
     */
    private _getChordGapSteps(lowerDots: number, upperDots: number): number {
        const settings = this.smuflMetrics;
        const numberHeight = this._getNumberHeight();
        const distance =
            NumberedNoteHeadGlyph.getTopExtent(settings, numberHeight, lowerDots) +
            settings.numberedChordNoteGap +
            NumberedNoteHeadGlyph.getBottomExtent(settings, numberHeight, upperDots, 0);
        return Math.ceil(distance / (this.lineSpacing / 2));
    }

    /**
     * Records the slots the numbers of the voice need. The rows of the voices are recorded in their order: per row
     * boundary the hanging part of the upper row, a separation of two staff spaces and the rising part of the lower
     * row, both from this bar. Where the bar writes its time signature in front of both rows, the two copies keep
     * the content padding of adjacent staves.
     * @param gapSteps Per chord position, the most steps the chords of the voice need; null without chords.
     * @param underlines The most duration underlines of the voice.
     * @param lowDots The most low octave dots of the lowest numbers.
     * @param highDots The most high octave dots of the top numbers.
     * @param hasArcs Whether ties, effect slurs or tuplets are drawn above the numbers.
     * @param graceTop The distance from the row to the top of its highest grace chord.
     */
    private _addSlotNeeds(
        voiceIndex: number,
        gapSteps: number[] | null,
        underlines: number,
        lowDots: number,
        highDots: number,
        hasArcs: boolean,
        graceTop: number
    ): void {
        let needs = this._slotNeeds;
        if (!needs) {
            // numbers of a single voice without chords stay on the line of single numbers
            if (!gapSteps && (this.isSingleNote || !this.bar.isMultiVoice)) {
                return;
            }
            needs = new NumberedSlotLayout();
            this._slotNeeds = needs;
            this._slots = needs;
        }
        if (gapSteps) {
            needs.setChordGapSteps(voiceIndex, gapSteps);
        }

        const settings = this.smuflMetrics;
        const numberHeight = this._getNumberHeight();
        if (voiceIndex > 0) {
            const stepHeight = this.lineSpacing / 2;
            // rows read as separate parts, not as chords
            const rowSeparation = 2 * settings.oneStaffSpace;
            let chordSteps = 0;
            if (gapSteps) {
                for (const g of gapSteps) {
                    chordSteps += g;
                }
            }
            let rising = chordSteps * stepHeight + NumberedNoteHeadGlyph.getTopExtent(settings, numberHeight, highDots);
            if (hasArcs) {
                rising += Math.max(
                    settings.tieHeight,
                    settings.glyphHeights.get(MusicFontSymbol.Tuplet0)! + this.tupletOffset
                );
            }
            if (graceTop > rising) {
                rising = graceTop;
            }
            // voices between without content keep a blank row
            const filledVoices = this.bar.filledVoices;
            for (let v = this._neededRowVoice + 1; v <= voiceIndex; v++) {
                const hanging = v === this._neededRowVoice + 1 ? this._neededRowHang : numberHeight / 2;
                let steps = Math.ceil(
                    (hanging + rowSeparation + (v === voiceIndex ? rising : numberHeight / 2)) / stepHeight
                );
                if (filledVoices.has(v - 1) && filledVoices.has(v)) {
                    const timeSignatureHeight = this._getTimeSignatureHeight();
                    if (timeSignatureHeight > 0) {
                        const timeSignatureSteps = Math.ceil(
                            (timeSignatureHeight + settings.staffContentPadding) / stepHeight
                        );
                        if (timeSignatureSteps > steps) {
                            steps = timeSignatureSteps;
                        }
                    }
                }
                needs.addRowGapSteps(steps);
            }
        }
        const underlinesHeight = this.getUnderlinesHeightForCount(underlines);
        this._neededRowVoice = voiceIndex;
        this._neededRowHang = Math.max(
            numberHeight / 2 + underlinesHeight,
            NumberedNoteHeadGlyph.getBottomExtent(settings, numberHeight, -lowDots, underlinesHeight)
        );
    }

    protected override createVoiceGlyphs(v: Voice): void {
        if (!this._isVoiceWritten(v.index)) {
            return;
        }

        super.createVoiceGlyphs(v);

        // what the numbers of the voice need on the slots; grace chords are stacked on their own and only
        // need room above their row
        let gapSteps: number[] | null = null;
        let underlines = 0;
        let lowDots = 0;
        let highDots = 0;
        let hasArcs = false;
        let graceTop = 0;

        let helper: BeamingHelper | null = null;
        let helperUnderlinesHeight = 0;
        const absoluteStart = this.bar.masterBar.start;
        for (const b of v.beats) {
            const mainContainer = new NumberedBeatContainerGlyph(b);
            const onNotes = mainContainer.onNotes as NumberedBeatGlyph;
            onNotes.createNotes(this, b);
            if (b.graceType === GraceType.None) {
                // the underlines of beats beamed together are drawn from a shared bottom line
                const h = this.helpers.getBeamingHelperForBeat(b);
                if (!h) {
                    mainContainer.underlinesHeight = this._calculateBarHeight(b);
                } else {
                    if (h !== helper) {
                        helper = h;
                        helperUnderlinesHeight = 0;
                        for (const hb of h.beats) {
                            helperUnderlinesHeight = Math.max(helperUnderlinesHeight, this._calculateBarHeight(hb));
                        }
                    }
                    mainContainer.underlinesHeight = helperUnderlinesHeight;
                }
            }
            this.addBeatGlyph(mainContainer);

            // create dashes and filler glyphs
            // we want a glyph on every quarter tick

            if (b.duration < Duration.Quarter) {
                // numbered notation never extends a rest with dashes: every further quarter repeats the 0
                const repeatRest = b.isRest && !b.isEmpty;
                const endTick = b.displayStart + b.displayDuration;
                let dashTick = b.displayStart + MidiUtils.QuarterTime;
                while (dashTick < endTick) {
                    const isFullTick = endTick - dashTick >= MidiUtils.QuarterTime;
                    if (isFullTick && repeatRest) {
                        const restNumber = new NumberedNoteBeatContainerGlyphBase(
                            b,
                            absoluteStart + dashTick,
                            MidiUtils.QuarterTime
                        );
                        this._addRepeatedNumber(mainContainer, restNumber);
                        underlines = Math.max(underlines, restNumber.barCount);
                    } else if (isFullTick) {
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
                        this._addRepeatedNumber(mainContainer, remainingTickNumber);
                        underlines = Math.max(underlines, remainingTickNumber.barCount);
                    }

                    dashTick += MidiUtils.QuarterTime;
                }
            }

            if (b.graceType !== GraceType.None) {
                // the first row rises into the space above the staff
                const graceChord = onNotes.chord;
                if (graceChord && v.index > 0) {
                    // grace numbers are stacked by their own extents, which the layout of the chord measures
                    graceChord.renderer = this;
                    graceChord.doLayout();
                    graceTop = Math.max(graceTop, -graceChord.highestHead.getBoundingBoxTop());
                }
                continue;
            }
            if (b.isEmpty) {
                continue;
            }
            if (b.hasTuplet) {
                hasArcs = true;
            }
            underlines = Math.max(underlines, ModelUtils.getIndex(b.duration) - 2);
            const chord = onNotes.chord;
            if (chord) {
                const heads = chord.heads;
                lowDots = Math.max(lowDots, -heads[0].octaveDots);
                highDots = Math.max(highDots, heads[heads.length - 1].octaveDots);
                if (!gapSteps) {
                    gapSteps = [];
                }
                for (let k = 0; k < heads.length; k++) {
                    if (NumberedBarRenderer._hasArcs(heads[k].note!)) {
                        hasArcs = true;
                    }
                    if (k === 0) {
                        continue;
                    }
                    const gap = this._getChordGapSteps(heads[k - 1].octaveDots, heads[k].octaveDots);
                    if (k > gapSteps.length) {
                        gapSteps.push(gap);
                    } else if (gap > gapSteps[k - 1]) {
                        gapSteps[k - 1] = gap;
                    }
                }
            } else {
                const head = onNotes.noteHead;
                const note = head ? head.note : null;
                if (head && note) {
                    lowDots = Math.max(lowDots, -head.octaveDots);
                    highDots = Math.max(highDots, head.octaveDots);
                    if (NumberedBarRenderer._hasArcs(note)) {
                        hasArcs = true;
                    }
                }
            }
        }

        this._addSlotNeeds(v.index, gapSteps, underlines, lowDots, highDots, hasArcs, graceTop);
    }

    private _addRepeatedNumber(main: NumberedBeatContainerGlyph, repeated: NumberedNoteBeatContainerGlyphBase): void {
        (repeated.onNotes as NumberedBeatGlyph).createNotes(this, repeated.beat);
        repeated.underlinesHeight = this.getUnderlinesHeightForCount(repeated.barCount);
        this.addBeatGlyph(repeated);
        main.addNotes(repeated);
    }

    /**
     * Whether ties or slurs are drawn above the number of the note.
     */
    private static _hasArcs(note: Note): boolean {
        return (
            note.isTieOrigin ||
            note.isTieDestination ||
            note.isEffectSlurOrigin ||
            note.isEffectSlurDestination ||
            note.isLeftHandTapped
        );
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
        const voice = h.voice;
        if (voice && this._isVoiceWritten(voice.index)) {
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
        const info = h.getDrawingInfo(direction);
        if (direction === BeamDirection.Up) {
            return Math.min(info.startY, info.endY);
        } else {
            return Math.max(info.startY, info.endY);
        }
    }

    protected override paintTuplets(
        cx: number,
        cy: number,
        canvas: ICanvas,
        beatElement: BeatSubElement,
        _bracketsAsArcs: boolean = false
    ): void {
        super.paintTuplets(cx, cy, canvas, beatElement, true);
    }
}

/**
 * The slots of a numbered staff in steps (half staff spaces) of its lines: the rows of the voices below the first
 * row and the chord positions above each row. All bars of a staff in a system share one layout; a bar first holds
 * the slots its own numbers need. A layout does not change once it is shared.
 * @internal
 */
export class NumberedSlotLayout {
    /**
     * The layout of a staff whose numbers all sit on the line of single numbers.
     */
    public static readonly single: NumberedSlotLayout = new NumberedSlotLayout();

    /**
     * Per row boundary v (between the rows of voice v and v + 1), the steps between the rows; null with one row.
     */
    private _rowGapSteps: number[] | null = null;

    /**
     * Per voice and chord position k, the steps between the centres of number k and k + 1 from the bottom;
     * null without chords.
     */
    private _chordGapSteps: (number[] | null)[] | null = null;

    /**
     * The number of staff lines spanning all rows.
     */
    public lineCount: number = 5;

    public setChordGapSteps(voiceIndex: number, gapSteps: number[]): void {
        let chords = this._chordGapSteps;
        if (!chords) {
            chords = [];
            this._chordGapSteps = chords;
        }
        while (chords.length < voiceIndex) {
            chords.push(null);
        }
        chords.push(gapSteps);
    }

    /**
     * Adds the row of the next voice below the last row.
     */
    public addRowGapSteps(steps: number): void {
        const rows = this._rowGapSteps;
        if (rows) {
            rows.push(steps);
        } else {
            this._rowGapSteps = [steps];
        }
        this.lineCount += steps / 2;
    }

    /**
     * The step of the row of the voice, downwards from the first row; voices without a row are on the first row.
     */
    public getRowStep(voiceIndex: number): number {
        const rows = this._rowGapSteps;
        let step = 0;
        if (rows && voiceIndex <= rows.length) {
            for (let v = 0; v < voiceIndex; v++) {
                step += rows[v];
            }
        }
        return step;
    }

    /**
     * The step of the k-th number of a chord (from the bottom) above the row of the voice.
     */
    public getChordStep(voiceIndex: number, chordIndex: number): number {
        const chords = this._chordGapSteps;
        const rows = this._rowGapSteps;
        if (!chords || voiceIndex >= chords.length || voiceIndex > (rows ? rows.length : 0)) {
            return 0;
        }
        const gaps = chords[voiceIndex];
        let step = 0;
        if (gaps) {
            for (let k = 0; k < chordIndex && k < gaps.length; k++) {
                step += gaps[k];
            }
        }
        return step;
    }

    /**
     * Whether both layouts place every number on the same step.
     */
    public matches(other: NumberedSlotLayout): boolean {
        if (other === this) {
            return true;
        }
        if (!NumberedSlotLayout._stepsMatch(this._rowGapSteps, other._rowGapSteps)) {
            return false;
        }
        const a = this._chordGapSteps;
        const b = other._chordGapSteps;
        const count = Math.max(a ? a.length : 0, b ? b.length : 0);
        for (let v = 0; v < count; v++) {
            const gapsA = a && v < a.length ? a[v] : null;
            const gapsB = b && v < b.length ? b[v] : null;
            if (!NumberedSlotLayout._stepsMatch(gapsA, gapsB)) {
                return false;
            }
        }
        return true;
    }

    private static _stepsMatch(a: number[] | null, b: number[] | null): boolean {
        if (a === b) {
            return true;
        }
        if (!a || !b || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * The layout holding the numbers of both layouts: per chord position and row boundary the most steps.
     * Returns one of them if it already holds the other.
     */
    public static merge(a: NumberedSlotLayout, b: NumberedSlotLayout): NumberedSlotLayout {
        if (a._holds(b)) {
            return a;
        }
        if (b._holds(a)) {
            return b;
        }
        const merged = new NumberedSlotLayout();
        const rows = NumberedSlotLayout._mergeSteps(a._rowGapSteps, b._rowGapSteps);
        merged._rowGapSteps = rows;
        if (rows) {
            for (const steps of rows) {
                merged.lineCount += steps / 2;
            }
        }
        const chordsA = a._chordGapSteps;
        const chordsB = b._chordGapSteps;
        if (!chordsA || !chordsB) {
            merged._chordGapSteps = chordsA ?? chordsB;
        } else {
            const chords: (number[] | null)[] = [];
            const count = Math.max(chordsA.length, chordsB.length);
            for (let v = 0; v < count; v++) {
                chords.push(
                    NumberedSlotLayout._mergeSteps(
                        v < chordsA.length ? chordsA[v] : null,
                        v < chordsB.length ? chordsB[v] : null
                    )
                );
            }
            merged._chordGapSteps = chords;
        }
        return merged;
    }

    /**
     * Whether every row boundary and chord position of the other layout is at most as many steps here.
     */
    private _holds(other: NumberedSlotLayout): boolean {
        if (!NumberedSlotLayout._stepsHold(this._rowGapSteps, other._rowGapSteps)) {
            return false;
        }
        const chords = other._chordGapSteps;
        if (!chords) {
            return true;
        }
        const own = this._chordGapSteps;
        for (let v = 0; v < chords.length; v++) {
            if (!NumberedSlotLayout._stepsHold(own && v < own.length ? own[v] : null, chords[v])) {
                return false;
            }
        }
        return true;
    }

    private static _stepsHold(own: number[] | null, other: number[] | null): boolean {
        if (!other || own === other) {
            return true;
        }
        if (!own || own.length < other.length) {
            return false;
        }
        for (let i = 0; i < other.length; i++) {
            if (other[i] > own[i]) {
                return false;
            }
        }
        return true;
    }

    private static _mergeSteps(a: number[] | null, b: number[] | null): number[] | null {
        if (!a) {
            return b;
        }
        if (!b) {
            return a;
        }
        const longer = a.length >= b.length ? a : b;
        const shorter = a.length >= b.length ? b : a;
        const merged = longer.slice();
        for (let i = 0; i < shorter.length; i++) {
            if (shorter[i] > merged[i]) {
                merged[i] = shorter[i];
            }
        }
        return merged;
    }
}
