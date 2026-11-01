import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { Note } from '@coderline/alphatab/model/Note';
import type { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { type BarRendererBase, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import {
    BeatContainerGlyph,
    type BeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { TabBeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatContainerGlyph';
import type { TabBeatGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatGlyph';
import { TabClefGlyph } from '@coderline/alphatab/rendering/glyphs/TabClefGlyph';
import type { TabNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/TabNoteChordGlyph';
import { TabTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/TabTimeSignatureGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { HeaderKey } from '@coderline/alphatab/rendering/staves/HeaderProfile';
import { StaffDisplayResolver } from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { ScrambledPath } from '@coderline/alphatab/rendering/utils/ScrambledPath';
import { TabFingeringSegment } from '@coderline/alphatab/rendering/utils/TabFingeringSegment';
import { TabFingeringSolver } from '@coderline/alphatab/rendering/utils/TabFingeringSolver';

/**
 * This BarRenderer renders a bar using guitar tablature notation
 * @internal
 */
export class TabBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'tab';

    private _hasTuplets = false;

    public override resolveClefDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            this.bar.tabDisplay?.clef,
            this.bar.staff.tabConfig?.clef,
            this.bar.staff.track.score.stylesheet.tabConfig.clef
        );
    }

    public override resolveTimeSignatureDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            this.bar.tabDisplay?.timeSignature,
            this.bar.staff.tabConfig?.timeSignature,
            this.bar.staff.track.score.stylesheet.tabConfig.timeSignature
        );
    }

    public override resolveRestsDisplay(): ElementDisplay {
        return StaffDisplayResolver.merge(
            undefined,
            this.bar.staff.tabConfig?.rests,
            this.bar.staff.track.score.stylesheet.tabConfig.rests
        );
    }

    public override resolveRhythm(): TabRhythmMode {
        return this.bar.staff.tabConfig?.rhythm ?? this.bar.staff.track.score.stylesheet.tabConfig.rhythm!;
    }

    protected override resolveBarNumberDisplay(): BarNumberDisplay {
        return (
            this.bar.tabDisplay?.barNumber ??
            this.bar.staff.tabConfig?.barNumber ??
            this.bar.staff.track.score.stylesheet.tabConfig.barNumber!
        );
    }

    public get showTimeSignature(): boolean {
        return StaffDisplayResolver.isPrimaryForElement(this.staff!, this.resolveTimeSignatureDisplay());
    }

    public get showRests(): boolean {
        return StaffDisplayResolver.isPrimaryForElement(this.staff!, this.resolveRestsDisplay());
    }

    public get showTiedNotes(): boolean {
        return this.staff!.isCascadePrimary;
    }

    /**
     * Layout-time staff-line gap cache, bucketed by string-line index.
     * `_gapBucketEnd[i]` is the exclusive end-offset into the parallel
     * `_gapRelXAndWidth` / `_gapBeatRefs` arrays for line `i`. Stores the
     * width-invariant payload; absolute x is projected at paint time via
     * `beatGlyphsStart + bg.x + bg.onNotes.x + relativeX` (`onNotes.x` is not width-invariant:
     * centered full-bar beats shift it on every scale pass).
     */
    private _gapBucketEnd: Uint32Array | null = null;
    private _gapRelXAndWidth: Float32Array | null = null;
    private _gapBeatRefs: TabBeatContainerGlyph[] | null = null;
    private _gapCount: number = 0;

    public override get showMultiBarRest(): boolean {
        return this.staff!.isCascadePrimary;
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
        return this.bar.staff.tuning.length - this.getDisplayString(note);
    }

    /**
     * The display fingering of the transposed segment this bar belongs to, null if all notes
     * keep their model string.
     */
    public fingering: TabFingeringSegment | null = null;

    /**
     * The last bar of the segment this bar belongs to when all its notes keep their model string, -1 otherwise.
     */
    public identityUntilBarIndex: number = -1;

    private _isFingeringActive: boolean = false;

    private _resolveFingering(): void {
        const staff = this.bar.staff;
        this.fingering = null;
        this.identityUntilBarIndex = -1;
        this._isFingeringActive = TabFingeringSolver.isActive(staff);
        if (!this._isFingeringActive) {
            return;
        }

        const barIndex = this.bar.index;
        const previous = this.previousRenderer;
        if (previous instanceof TabBarRenderer) {
            const previousFingering = previous.fingering;
            if (previousFingering !== null && previousFingering.covers(barIndex)) {
                this.fingering = previousFingering;
                return;
            }
            if (previous.identityUntilBarIndex >= barIndex) {
                this.identityUntilBarIndex = previous.identityUntilBarIndex;
                return;
            }
        }

        const lastBarIndex = TabFingeringSolver.segmentEnd(staff, barIndex);
        this.fingering = TabFingeringSolver.solve(staff, barIndex, lastBarIndex);
        if (this.fingering === null) {
            this.identityUntilBarIndex = lastBarIndex;
        }
    }

    protected override createBeatGlyphs(): void {
        this._resolveFingering();
        super.createBeatGlyphs();
    }

    private _fingeringFor(note: Note): TabFingeringSegment | null {
        const bar = note.beat.voice.bar;
        const own = this.fingering;
        if (own !== null && own.covers(bar.index)) {
            return own;
        }
        if (bar === this.bar) {
            return null;
        }
        const renderer = this.scoreRenderer.layout!.getRendererForBar(TabBarRenderer.StaffId, bar);
        if (renderer instanceof TabBarRenderer) {
            const fingering = renderer.fingering;
            if (fingering !== null && fingering.covers(bar.index)) {
                return fingering;
            }
        }
        return null;
    }

    /**
     * The string (1 = lowest) on which the note is shown in this tab.
     */
    public getDisplayString(note: Note): number {
        if (!this._isFingeringActive || !note.isStringed) {
            return note.string;
        }
        const fingering = this._fingeringFor(note);
        return fingering !== null ? fingering.getString(note) : note.string;
    }

    /**
     * The fret shown for the note: the natural harmonic node for natural harmonics, the base fret otherwise.
     */
    public getDisplayFret(note: Note): number {
        const staff = note.beat.voice.bar.staff;
        const isNaturalHarmonic = TabFingeringSolver.isNaturalHarmonic(note);
        if (!this._isFingeringActive || !note.isStringed) {
            return (isNaturalHarmonic ? note.harmonicValue : note.fret) - staff.transpositionPitch;
        }
        const fingering = this._fingeringFor(note);
        if (fingering === null) {
            if (isNaturalHarmonic) {
                const modelStringNode = TabFingeringSolver.findNaturalNodeOnModelString(note);
                return modelStringNode >= 0
                    ? TabFingeringSolver.naturalNodeValues[modelStringNode]
                    : note.harmonicValue - staff.transpositionPitch;
            }
            return note.fret - staff.transpositionPitch;
        }
        const node = fingering.getNode(note);
        return node >= 0 ? TabFingeringSolver.naturalNodeValues[node] : fingering.getFret(note);
    }

    /**
     * The combination of {@link TabFingeringSegment} flags describing how the note differs from the model.
     */
    public getDisplayFlags(note: Note): number {
        if (!this._isFingeringActive || !note.isStringed) {
            return 0;
        }
        const fingering = this._fingeringFor(note);
        return fingering !== null ? fingering.getFlags(note) : 0;
    }

    /**
     * The fret of the trill target on the displayed string of the note.
     */
    public getDisplayTrillFret(note: Note): number {
        const staff = note.beat.voice.bar.staff;
        return (
            note.trillValue -
            staff.transpositionPitch -
            (staff.capo + Note.getStringTuning(staff, this.getDisplayString(note)))
        );
    }

    /**
     * The stringed note of the beat shown on the highest string.
     */
    public getDisplayMaxStringNote(beat: Beat): Note | null {
        if (!this._isFingeringActive) {
            return beat.maxStringNote;
        }
        let result: Note | null = null;
        let resultString = 0;
        for (const note of beat.notes) {
            if (!note.isStringed) {
                continue;
            }
            const str = this.getDisplayString(note);
            if (result === null || str > resultString) {
                result = note;
                resultString = str;
            }
        }
        return result;
    }

    /**
     * The stringed note of the beat shown on the lowest string.
     */
    public getDisplayMinStringNote(beat: Beat): Note | null {
        if (!this._isFingeringActive) {
            return beat.minStringNote;
        }
        let result: Note | null = null;
        let resultString = 0;
        for (const note of beat.notes) {
            if (!note.isStringed) {
                continue;
            }
            const str = this.getDisplayString(note);
            if (result === null || str < resultString) {
                result = note;
                resultString = str;
            }
        }
        return result;
    }

    /**
     * The string on which the given note is shown in the tab of its staff, for renderers of other notations.
     */
    public static resolveDisplayString(renderer: BarRendererBase, note: Note): number {
        if (!TabFingeringSolver.isActive(note.beat.voice.bar.staff)) {
            return note.string;
        }
        const tab = TabBarRenderer._tabRendererOf(renderer, note);
        return tab !== null ? tab.getDisplayString(note) : note.string;
    }

    // a renderer is registered in the layout only after its own layout
    private static _tabRendererOf(renderer: BarRendererBase, note: Note): TabBarRenderer | null {
        const bar = note.beat.voice.bar;
        if (renderer instanceof TabBarRenderer && renderer.bar === bar) {
            return renderer;
        }
        const tab = renderer.scoreRenderer.layout!.getRendererForBar(TabBarRenderer.StaffId, bar);
        return tab instanceof TabBarRenderer ? tab : null;
    }

    /**
     * Whether the tab of the note's staff shows it on another string or as open string, so left-hand
     * fingerings of the model do not apply to it.
     */
    public static isFingeringChanged(renderer: BarRendererBase, note: Note): boolean {
        if (!note.isStringed || !TabFingeringSolver.isActive(note.beat.voice.bar.staff)) {
            return false;
        }
        const tab = TabBarRenderer._tabRendererOf(renderer, note);
        if (tab === null) {
            return false;
        }
        return (tab.getDisplayFlags(note) & TabFingeringSegment.flagMoved) !== 0 || tab.getDisplayFret(note) === 0;
    }

    public minString = Number.NaN;
    public maxString = Number.NaN;

    protected override paintStaffLineRun(
        cx: number,
        cy: number,
        canvas: ICanvas,
        lines: ScrambledPath | null,
        renderers: BarRendererBase[],
        from: number,
        to: number
    ): void {
        const last = renderers[to - 1];
        const startX = cx + renderers[from].x;
        const endX = cx + last.x + last.width;
        const thickness = this.smuflMetrics.staffLineThickness;
        const lineYOffset = thickness / 2;
        const cyLocal = cy + this.y;
        const drawnLineCount = this.drawnLineCount;

        for (let line = 0; line < drawnLineCount; line++) {
            const y = cyLocal + (this.getLineY(line) - lineYOffset);
            let lineX = startX;
            for (let i = from; i < to; i++) {
                lineX = (renderers[i] as TabBarRenderer)._paintStaffLineUpToGaps(cx, y, line, lineX, canvas, lines);
            }
            if (endX > lineX) {
                this.fillStaffLine(canvas, lines, lineX, y, endX - lineX, thickness);
            }
        }
    }

    /**
     * Paints the staff line from `lineX` up to each hole of this bar on the line, skipping what earlier holes
     * already cover.
     * @returns The x after the last hole, never less than `lineX`.
     */
    private _paintStaffLineUpToGaps(
        cx: number,
        y: number,
        line: number,
        lineX: number,
        canvas: ICanvas,
        lines: ScrambledPath | null
    ): number {
        if (this.additionalMultiRestBars) {
            return lineX;
        }
        if (this._gapBucketEnd === null) {
            this._buildGapCache();
        }
        if (this._gapCount === 0) {
            return lineX;
        }

        const bucketEnd = this._gapBucketEnd!;
        const begin = line === 0 ? 0 : bucketEnd[line - 1];
        const end = bucketEnd[line];
        if (end === begin) {
            return lineX;
        }

        const relXAndWidth = this._gapRelXAndWidth!;
        const beatRefs = this._gapBeatRefs!;
        const base = this.beatGlyphsStart;
        const cxLocal = cx + this.x;
        const thickness = this.smuflMetrics.staffLineThickness;

        // Gaps were built in beat-iteration order, which is left-to-right
        // except for grace notes and multiple voices — sort only on inversion.
        let prevX = base + beatRefs[begin].x + beatRefs[begin].onNotes.x + relXAndWidth[begin * 2];
        for (let k = begin + 1; k < end; k++) {
            const xk = base + beatRefs[k].x + beatRefs[k].onNotes.x + relXAndWidth[k * 2];
            if (xk < prevX) {
                return this._paintStaffLineUpToSortedGaps(cxLocal, y, begin, end, lineX, canvas, lines);
            }
            prevX = xk;
        }

        for (let k = begin; k < end; k++) {
            const gx = cxLocal + (base + beatRefs[k].x + beatRefs[k].onNotes.x + relXAndWidth[k * 2]);
            if (gx > lineX) {
                this.fillStaffLine(canvas, lines, lineX, y, gx - lineX, thickness);
            }
            const gapEnd = gx + relXAndWidth[k * 2 + 1];
            if (gapEnd > lineX) {
                lineX = gapEnd;
            }
        }
        return lineX;
    }

    private _paintStaffLineUpToSortedGaps(
        cxLocal: number,
        y: number,
        begin: number,
        end: number,
        lineX: number,
        canvas: ICanvas,
        lines: ScrambledPath | null
    ): number {
        const relXAndWidth = this._gapRelXAndWidth!;
        const beatRefs = this._gapBeatRefs!;
        const base = this.beatGlyphsStart;
        const thickness = this.smuflMetrics.staffLineThickness;

        const xs: number[] = [];
        const ws: number[] = [];
        for (let k = begin; k < end; k++) {
            const gx = cxLocal + (base + beatRefs[k].x + beatRefs[k].onNotes.x + relXAndWidth[k * 2]);
            const gw = relXAndWidth[k * 2 + 1];
            let m = xs.length;
            xs.push(gx);
            ws.push(gw);
            while (m > 0 && xs[m - 1] > gx) {
                xs[m] = xs[m - 1];
                ws[m] = ws[m - 1];
                m--;
            }
            xs[m] = gx;
            ws[m] = gw;
        }

        for (let k = 0; k < xs.length; k++) {
            const gx = xs[k];
            if (gx > lineX) {
                this.fillStaffLine(canvas, lines, lineX, y, gx - lineX, thickness);
            }
            const gapEnd = gx + ws[k];
            if (gapEnd > lineX) {
                lineX = gapEnd;
            }
        }
        return lineX;
    }

    private _buildGapCache(): void {
        const drawnLineCount = this.drawnLineCount;
        const tuning = this.bar.staff.tuning;
        const tuningLen = tuning.length;
        const voices = this.voiceContainer.beatGlyphs;

        // First pass: count gaps per string-line for exact typed-array sizing.
        const bucketCount = new Uint32Array(drawnLineCount);
        let total = 0;
        for (let v = 0, nv = voices.length; v < nv; v++) {
            const voice = voices[v];
            for (let b = 0, nb = voice.length; b < nb; b++) {
                const bg = voice[b];
                const notes: TabBeatGlyph = (bg as TabBeatContainerGlyph).onNotes as TabBeatGlyph;
                const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                if (noteNumbers) {
                    const noteGlyphs = noteNumbers.noteGlyphs;
                    for (let k = 0, nk = noteGlyphs.length; k < nk; k++) {
                        const g = noteGlyphs[k];
                        const str = g.displayString;
                        if (!g.isEmpty && noteNumbers.getNoteGlyphForString(str) === g) {
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
        const beatRefs: TabBeatContainerGlyph[] = new Array(total);
        const padding: number = this.smuflMetrics.staffLineThickness;

        for (let v = 0, nv = voices.length; v < nv; v++) {
            const voice = voices[v];
            for (let b = 0, nb = voice.length; b < nb; b++) {
                const bg = voice[b];
                const notes: TabBeatGlyph = (bg as TabBeatContainerGlyph).onNotes as TabBeatGlyph;
                const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                if (noteNumbers) {
                    const relativeXBase = noteNumbers.x - padding;
                    const fullWidth = noteNumbers.width + padding * 2;
                    const noteGlyphs = noteNumbers.noteGlyphs;
                    for (let k = 0, nk = noteGlyphs.length; k < nk; k++) {
                        const g = noteGlyphs[k];
                        const str = g.displayString;
                        if (!g.isEmpty && noteNumbers.getNoteGlyphForString(str) === g) {
                            const lineIdx = tuningLen - str;
                            if (lineIdx >= 0 && lineIdx < drawnLineCount) {
                                const idx = fwdCursor[lineIdx]++;
                                relXAndWidth[idx * 2] = relativeXBase;
                                relXAndWidth[idx * 2 + 1] = fullWidth;
                                beatRefs[idx] = bg as TabBeatContainerGlyph;
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

    protected override recreatePreBeatGlyphs(): void {
        super.recreatePreBeatGlyphs();
        this._invalidateGapCache();
    }

    public override doLayout(): void {
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
            const tupletGroups = this.voiceContainer.tupletGroups;
            this._hasTuplets = tupletGroups !== null && tupletGroups.size > 0;
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
        const maxStringNote = this.getDisplayMaxStringNote(beat);
        const minStringNote = this.getDisplayMinStringNote(beat);
        const hasTop = maxStringNote !== null && this.getDisplayString(maxStringNote) === stringCount;
        const hasBottom = minStringNote !== null && this.getDisplayString(minStringNote) === 1;
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

    protected override buildLineHeaderKey(key: HeaderKey): void {
        key.addHighFlag(StaffDisplayResolver.isPrimaryForElement(this.staff!, this.resolveClefDisplay()));
        this.buildTimeSignatureHeaderKey(key);
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        const clefDisplay = this.resolveClefDisplay();
        if (StaffDisplayResolver.isPrimaryForElement(this.staff!, clefDisplay) && this.isFirstOfStaff) {
            const center: number = (this.bar.staff.tuning.length - 1) / 2;
            this.addPreBeatGlyph(new TabClefGlyph(0, this.getLineY(center)));
        }
        // Time Signature
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
        const maxNote = this.getDisplayMaxStringNote(beat);
        const position = direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown;
        if (maxNote) {
            return this.getNoteY(maxNote, position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const maxNote = this.getDisplayMinStringNote(beat);
        const position = direction === BeamDirection.Up ? NoteYPosition.StemUp : NoteYPosition.BottomWithStem;

        if (maxNote) {
            return this.getNoteY(maxNote, position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    public override get drawsRhythm(): boolean {
        return this.rhythmMode !== TabRhythmMode.Hidden;
    }

    public override getBeatDirection(_beat: Beat): BeamDirection {
        return BeamDirection.Down;
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

        const previousColor = ElementStyleHelper.applyBeat(canvas, BeatSubElement.GuitarTabStem, beat);
        try {
            // interleaved top/bottom pairs
            let holes: number[] = [];
            const reservedAreas = this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime;
            if (reservedAreas !== null && reservedAreas.has(beat.displayStart)) {
                holes = reservedAreas.get(beat.displayStart)!.getSlotsSortedByTop();
            }

            // no note on the tab (e.g. pitched notes without tab position) -> no stem
            if (holes.length === 0) {
                return;
            }

            // fast path -> single note == full line
            if (holes.length === 2) {
                canvas.fillRect(x, topY, this.smuflMetrics.stemThickness, bottomY - topY);
                return;
            }

            const bottomYRelative = bottomY - cy;
            // slow path -> multiple notes == lines between notes
            const bottomHoleBottomY = holes[holes.length - 1];
            canvas.fillRect(
                x,
                cy + bottomHoleBottomY,
                this.smuflMetrics.stemThickness,
                bottomYRelative - bottomHoleBottomY
            );

            for (let i = holes.length - 2; i > 0; i -= 2) {
                const bottomHoleY = holes[i];
                const topHoleY = holes[i - 1];
                if (topHoleY < bottomHoleY) {
                    canvas.fillRect(x, cy + topHoleY, this.smuflMetrics.stemThickness, bottomHoleY - topHoleY);
                }
            }
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
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
