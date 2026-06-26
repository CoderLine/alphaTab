import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import {
    BeatContainerGlyph,
    type BeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { TabBeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatContainerGlyph';
import type { TabBeatGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatGlyph';
import { TabClefGlyph } from '@coderline/alphatab/rendering/glyphs/TabClefGlyph';
import type { TabNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/TabNoteChordGlyph';
import { TabTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/TabTimeSignatureGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ReservedLayoutAreaSlot } from '@coderline/alphatab/rendering/utils/BarCollisionHelper';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using guitar tablature notation
 * @internal
 */
export class TabBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'tab';

    private _hasTuplets = false;

    public showTimeSignature: boolean = false;
    public showRests: boolean = false;
    public showTiedNotes: boolean = false;

    private _showMultiBarRest: boolean = false;

    /**
     * Layout-time staff-line gap cache, bucketed by string-line index.
     * `_gapBucketEnd[i]` is the exclusive end-offset into the parallel
     * `_gapRelXAndWidth` / `_gapBeatRefs` arrays for line `i`. Stores the
     * width-invariant payload; absolute x is projected at paint time via
     * `beatGlyphsStart + bg.x + relativeX`.
     */
    private _gapBucketEnd: Uint32Array | null = null;
    private _gapRelXAndWidth: Float32Array | null = null;
    private _gapBeatRefs: BeatContainerGlyphBase[] | null = null;
    private _gapCount: number = 0;

    public override get showMultiBarRest(): boolean {
        return this._showMultiBarRest;
    }

    public override get repeatsBarSubElement(): BarSubElement {
        return BarSubElement.GuitarTabsRepeats;
    }

    public override get barNumberBarSubElement(): BarSubElement {
        return BarSubElement.GuitarTabsBarNumber;
    }

    public override get barLineBarSubElement(): BarSubElement {
        return BarSubElement.GuitarTabsBarLines;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.GuitarTabsStaffLine;
    }

    public override get lineSpacing(): number {
        return this.smuflMetrics.tabLineSpacing;
    }

    public override get heightLineCount(): number {
        return this.bar.staff.tuning.length;
    }

    public override get drawnLineCount(): number {
        return this.bar.staff.tuning.length;
    }

    public get rhythmMode() {
        let mode = this.settings.notation.rhythmMode;
        if (mode === TabRhythmMode.Automatic) {
            mode = this.bar.staff.showStandardNotation ? TabRhythmMode.Hidden : TabRhythmMode.ShowWithBars;
        }
        return mode;
    }

    public override getNoteLine(note: Note): number {
        return this.bar.staff.tuning.length - note.string;
    }

    public minString = Number.NaN;
    public maxString = Number.NaN;

    /**
     * Legacy adapter projecting the gap cache into the base class
     * `spaces[][]` shape. The real consumer is {@link paintStaffLines}
     * which reads the cache directly.
     */
    protected override collectSpaces(spaces: Float32Array[][]): void {
        if (this.additionalMultiRestBars) {
            return;
        }
        if (this._gapBucketEnd === null) {
            this._buildGapCache();
        }
        const count = this._gapCount;
        if (count === 0) {
            return;
        }
        const bucketEnd = this._gapBucketEnd!;
        const relXAndWidth = this._gapRelXAndWidth!;
        const beatRefs = this._gapBeatRefs!;
        const base = this.beatGlyphsStart;
        let line = 0;
        for (let i = 0; i < count; i++) {
            while (i >= bucketEnd[line]) {
                line++;
            }
            const absX = base + beatRefs[i].x + relXAndWidth[i * 2];
            spaces[line].push(new Float32Array([absX, relXAndWidth[i * 2 + 1]]));
        }
    }

    protected override paintStaffLines(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, this.staffLineBarSubElement, this.bar, true);

        const lineWidth = this.width;
        const lineYOffset = this.smuflMetrics.staffLineThickness / 2;
        const thickness = this.smuflMetrics.staffLineThickness;
        const drawnLineCount = this.drawnLineCount;
        const cxLocal = cx + this.x;
        const cyLocal = cy + this.y;

        if (this.additionalMultiRestBars) {
            for (let line = 0; line < drawnLineCount; line++) {
                const lineY = this.getLineY(line) - lineYOffset;
                canvas.fillRect(cxLocal, cyLocal + lineY, lineWidth, thickness);
            }
            return;
        }

        if (this._gapBucketEnd === null) {
            this._buildGapCache();
        }

        const count = this._gapCount;
        if (count === 0) {
            for (let line = 0; line < drawnLineCount; line++) {
                const lineY = this.getLineY(line) - lineYOffset;
                canvas.fillRect(cxLocal, cyLocal + lineY, lineWidth, thickness);
            }
            return;
        }

        const bucketEnd = this._gapBucketEnd!;
        const relXAndWidth = this._gapRelXAndWidth!;
        const beatRefs = this._gapBeatRefs!;
        const base = this.beatGlyphsStart;

        let cursor = 0;
        for (let line = 0; line < drawnLineCount; line++) {
            const lineY = this.getLineY(line) - lineYOffset;
            const cyLine = cyLocal + lineY;
            const end = bucketEnd[line];

            // Gaps were built in beat-iteration order, which is left-to-right
            // except for grace-note edge cases — sort only on inversion.
            let lineX = 0;
            if (end > cursor + 1) {
                let inverted = false;
                let prevX = base + beatRefs[cursor].x + relXAndWidth[cursor * 2];
                for (let k = cursor + 1; k < end; k++) {
                    const xk = base + beatRefs[k].x + relXAndWidth[k * 2];
                    if (xk < prevX) {
                        inverted = true;
                        break;
                    }
                    prevX = xk;
                }
                if (inverted) {
                    const segCount = end - cursor;
                    const xs = new Float32Array(segCount);
                    const ws = new Float32Array(segCount);
                    for (let k = 0; k < segCount; k++) {
                        const ki = cursor + k;
                        xs[k] = base + beatRefs[ki].x + relXAndWidth[ki * 2];
                        ws[k] = relXAndWidth[ki * 2 + 1];
                    }
                    const order = new Uint32Array(segCount);
                    for (let k = 0; k < segCount; k++) {
                        order[k] = k;
                    }
                    for (let k = 1; k < segCount; k++) {
                        const cur = order[k];
                        const curX = xs[cur];
                        let m = k - 1;
                        while (m >= 0 && xs[order[m]] > curX) {
                            order[m + 1] = order[m];
                            m--;
                        }
                        order[m + 1] = cur;
                    }
                    for (let k = 0; k < segCount; k++) {
                        const oi = order[k];
                        const gx = xs[oi];
                        const gw = ws[oi];
                        canvas.fillRect(cxLocal + lineX, cyLine, gx - lineX, thickness);
                        lineX = gx + gw;
                    }
                    canvas.fillRect(cxLocal + lineX, cyLine, lineWidth - lineX, thickness);
                    cursor = end;
                    continue;
                }
            }

            for (let k = cursor; k < end; k++) {
                const gx = base + beatRefs[k].x + relXAndWidth[k * 2];
                const gw = relXAndWidth[k * 2 + 1];
                canvas.fillRect(cxLocal + lineX, cyLine, gx - lineX, thickness);
                lineX = gx + gw;
            }
            canvas.fillRect(cxLocal + lineX, cyLine, lineWidth - lineX, thickness);
            cursor = end;
        }
    }

    private _buildGapCache(): void {
        const drawnLineCount = this.drawnLineCount;
        const tuning = this.bar.staff.tuning;
        const tuningLen = tuning.length;

        // First pass: count gaps per string-line for exact typed-array sizing.
        const bucketCount = new Uint32Array(drawnLineCount);
        let total = 0;
        for (const voice of this.voiceContainer.beatGlyphs.values()) {
            for (const bg of voice) {
                const notes: TabBeatGlyph = (bg as TabBeatContainerGlyph).onNotes as TabBeatGlyph;
                const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                if (noteNumbers) {
                    for (const [str, noteNumber] of noteNumbers.notesPerString) {
                        if (!noteNumber.isEmpty) {
                            const lineIdx = tuningLen - str;
                            if (lineIdx >= 0 && lineIdx < drawnLineCount) {
                                bucketCount[lineIdx]++;
                                total++;
                            }
                        }
                    }
                }
            }
        }

        this._gapCount = total;
        if (total === 0) {
            this._gapBucketEnd = new Uint32Array(drawnLineCount);
            this._gapRelXAndWidth = new Float32Array(0);
            this._gapBeatRefs = [];
            return;
        }

        // CSR-style prefix sum to exclusive end-offsets, with parallel write cursors.
        const bucketEnd = new Uint32Array(drawnLineCount);
        const fwdCursor = new Uint32Array(drawnLineCount);
        let running = 0;
        for (let line = 0; line < drawnLineCount; line++) {
            fwdCursor[line] = running;
            running += bucketCount[line];
            bucketEnd[line] = running;
        }

        const relXAndWidth = new Float32Array(total * 2);
        const beatRefs: BeatContainerGlyphBase[] = new Array(total);
        const padding: number = this.smuflMetrics.staffLineThickness;

        for (const voice of this.voiceContainer.beatGlyphs.values()) {
            for (const bg of voice) {
                const notes: TabBeatGlyph = (bg as TabBeatContainerGlyph).onNotes as TabBeatGlyph;
                const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                if (noteNumbers) {
                    const relativeXBase = notes.x + noteNumbers.x - padding;
                    const fullWidth = noteNumbers.width + padding * 2;
                    for (const [str, noteNumber] of noteNumbers.notesPerString) {
                        if (!noteNumber.isEmpty) {
                            const lineIdx = tuningLen - str;
                            if (lineIdx >= 0 && lineIdx < drawnLineCount) {
                                const idx = fwdCursor[lineIdx]++;
                                relXAndWidth[idx * 2] = relativeXBase;
                                relXAndWidth[idx * 2 + 1] = fullWidth;
                                beatRefs[idx] = bg;
                            }
                        }
                    }
                }
            }
        }

        this._gapBucketEnd = bucketEnd;
        this._gapRelXAndWidth = relXAndWidth;
        this._gapBeatRefs = beatRefs;
    }

    private _invalidateGapCache(): void {
        this._gapBucketEnd = null;
        this._gapRelXAndWidth = null;
        this._gapBeatRefs = null;
        this._gapCount = 0;
    }

    public override invalidateLayoutCache(): void {
        super.invalidateLayoutCache();
        this._invalidateGapCache();
    }

    protected override recreatePreBeatGlyphs(): void {
        super.recreatePreBeatGlyphs();
        this._invalidateGapCache();
    }

    public override doLayout(): void {
        const hasStandardNotation =
            this.bar.staff.showStandardNotation && this.scoreRenderer.layout!.profile.has(ScoreBarRenderer.StaffId);

        if (!hasStandardNotation) {
            this.showTimeSignature = true;
            this.showRests = true;
            this.showTiedNotes = true;
            this._showMultiBarRest = true;
        }

        super.doLayout();

        const hasNoteOnTopString = this.minString === 0;
        if (hasNoteOnTopString) {
            this.registerOverflowTop(this.lineSpacing / 2);
        }
        const hasNoteOnBottomString = this.maxString === this.bar.staff.tuning.length - 1;
        if (hasNoteOnBottomString) {
            this.registerOverflowBottom(this.lineSpacing / 2);
        }

        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            this._hasTuplets = this.voiceContainer.tupletGroups.size > 0;
            if (this._hasTuplets) {
                this.registerOverflowBottom(this.settings.notation.rhythmHeight + this.tupletSize);
            }
        }
    }

    public override emitBeatSkyline(beatContainer: BeatContainerGlyphBase): void {
        if (!(beatContainer instanceof BeatContainerGlyph)) {
            return;
        }
        // Per-beat half-line overflow, not bar-wide. Strings are 1-indexed: top = tuning.length, bottom = 1.
        const beat = beatContainer.beat;
        const stringCount = this.bar.staff.tuning.length;
        const hasTop = beat.maxStringNote !== null && beat.maxStringNote.string === stringCount;
        const hasBottom = beat.minStringNote !== null && beat.minStringNote.string === 1;
        if (!hasTop && !hasBottom) {
            return;
        }
        const base = this.voiceContainer.x + beatContainer.x;
        const xStart = base + beatContainer.getBeatX(BeatXPosition.PreNotes, false);
        const xEnd = base + beatContainer.getBeatX(BeatXPosition.PostNotes, false);
        if (xEnd <= xStart) {
            return;
        }
        const halfLine = this.lineSpacing / 2;
        if (hasTop) {
            this.insertSkylineTop(xStart, xEnd, halfLine);
        }
        if (hasBottom) {
            this.insertSkylineBottom(xStart, xEnd, halfLine);
        }
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        if (this.isFirstOfStaff) {
            const center: number = (this.bar.staff.tuning.length - 1) / 2;
            this.createStartSpacing();
            this.addPreBeatGlyph(new TabClefGlyph(0, this.getLineY(center)));
        }
        // Time Signature
        if (
            this.showTimeSignature &&
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

        const lines = (this.bar.staff.tuning.length + 1) / 2 - 1;
        this.addPreBeatGlyph(
            new TabTimeSignatureGlyph(
                0,
                this.getLineY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon,
                this.bar.masterBar.isFreeTime
            )
        );
    }

    protected override createVoiceGlyphs(v: Voice): void {
        super.createVoiceGlyphs(v);

        for (const b of v.beats) {
            this.addBeatGlyph(new TabBeatContainerGlyph(b));
        }
    }

    protected override get flagsSubElement(): BeatSubElement {
        return BeatSubElement.GuitarTabFlags;
    }

    protected override get beamsSubElement(): BeatSubElement {
        return BeatSubElement.GuitarTabBeams;
    }

    protected override get tupletSubElement(): BeatSubElement {
        return BeatSubElement.GuitarTabTuplet;
    }

    protected override paintBeams(
        cx: number,
        cy: number,
        canvas: ICanvas,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            super.paintBeams(cx, cy, canvas, flagsElement, beamsElement);
        }
    }

    protected override paintTuplets(
        cx: number,
        cy: number,
        canvas: ICanvas,
        beatElement: BeatSubElement,
        bracketsAsArcs: boolean = false
    ): void {
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            super.paintTuplets(cx, cy, canvas, beatElement, bracketsAsArcs);
        }
    }

    public override drawBeamHelperAsFlags(h: BeamingHelper): boolean {
        return super.drawBeamHelperAsFlags(h) || this.rhythmMode === TabRhythmMode.ShowWithBeams;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        const maxNote = beat.maxStringNote;
        const position = direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown;
        if (maxNote) {
            return this.getNoteY(maxNote, position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const maxNote = beat.minStringNote;
        const position = direction === BeamDirection.Up ? NoteYPosition.StemUp : NoteYPosition.BottomWithStem;

        if (maxNote) {
            return this.getNoteY(maxNote, position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected override shouldPaintFlag(beat: Beat): boolean {
        if (!super.shouldPaintFlag(beat)) {
            return false;
        }

        if (beat.graceType !== GraceType.None) {
            return false;
        }

        return true;
    }

    protected override paintBeamingStem(
        beat: Beat,
        cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ) {
        if (bottomY < topY) {
            const t = bottomY;
            bottomY = topY;
            topY = t;
        }

        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.GuitarTabStem, beat);

        let holes: ReservedLayoutAreaSlot[] = [];
        if (this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.has(beat.displayStart)) {
            holes = this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.get(beat.displayStart)!.slots.slice();
            holes.sort((a, b) => a.topY - b.topY);
        }

        // fast path -> single note == full line
        if (holes.length === 1) {
            canvas.fillRect(x, topY, this.smuflMetrics.stemThickness, bottomY - topY);
            return;
        }

        const bottomYRelative = bottomY - cy;
        // slow path -> multiple notes == lines between notes
        const bottomHole = holes[holes.length - 1];
        canvas.fillRect(
            x,
            cy + bottomHole.bottomY,
            this.smuflMetrics.stemThickness,
            bottomYRelative - bottomHole.bottomY
        );

        for (let i = holes.length - 1; i > 0; i--) {
            const bottomHoleY = holes[i].topY;
            const topHoleY = holes[i - 1].bottomY;
            if (topHoleY < bottomHoleY) {
                canvas.fillRect(x, cy + topHoleY, this.smuflMetrics.stemThickness, bottomHoleY - topHoleY);
            }
        }
    }

    protected override calculateOverflows(rendererTop: number, rendererBottom: number): void {
        super.calculateOverflows(rendererTop, rendererBottom);
        if (this.bar.isEmpty) {
            return;
        }
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            this.calculateBeamingOverflows(rendererTop, rendererBottom);
        }
    }

    protected override emitHelperSkyline(h: BeamingHelper): void {
        if (this.rhythmMode === TabRhythmMode.Hidden) {
            return;
        }
        super.emitHelperSkyline(h);
        if (h.hasTuplet) {
            // Tuplets can span multiple helpers — emit once per group, from its first beat.
            const group = h.beats[0].tupletGroup!;
            if (group.beats.length > 0 && group.beats[0] === h.beats[0]) {
                const tupletHeight = this.settings.notation.rhythmHeight + this.tupletSize;
                const xStart = this.getBeatX(group.beats[0], BeatXPosition.PreNotes);
                const xEnd = this.getBeatX(group.beats[group.beats.length - 1], BeatXPosition.PostNotes);
                if (xEnd > xStart) {
                    this.insertSkylineBottom(xStart, xEnd, tupletHeight);
                }
            }
        }
    }
}
