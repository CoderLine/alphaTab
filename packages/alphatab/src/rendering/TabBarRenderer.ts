import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
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

    protected override collectSpaces(spaces: Float32Array[][]): void {
        if (this.additionalMultiRestBars) {
            return;
        }

        const padding: number = this.smuflMetrics.staffLineThickness;
        const tuning = this.bar.staff.tuning;
        for (const voice of this.voiceContainer.beatGlyphs.values()) {
            for (const bg of voice) {
                const notes: TabBeatGlyph = (bg as TabBeatContainerGlyph).onNotes as TabBeatGlyph;
                const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                if (noteNumbers) {
                    for (const [str, noteNumber] of noteNumbers.notesPerString) {
                        if (!noteNumber.isEmpty) {
                            spaces[tuning.length - str].push(
                                new Float32Array([
                                    this.beatGlyphsStart + bg.x + notes.x + noteNumbers!.x - padding,
                                    noteNumbers!.width + padding * 2
                                ])
                            );
                        }
                    }
                }
            }
        }
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
        const minNote = beat.minStringNote;
        const position = direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown;
        if (minNote) {
            return this.getNoteY(minNote, position);
        } else {
            return this.getRestY(beat, position);
        }
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const maxNote = beat.maxStringNote;
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

        let y = bottomY;
        while (y > topY) {
            let lineY = topY;
            // draw until next hole (if hole reaches into line)
            if (holes.length > 0 && holes[holes.length - 1].bottomY > lineY) {
                const bottomHole = holes.pop()!;
                lineY = cy + bottomHole.bottomY;
                canvas.fillRect(x, lineY, this.smuflMetrics.stemThickness, y - lineY);
                y = cy + bottomHole.topY;
            } else {
                canvas.fillRect(x, lineY, this.smuflMetrics.stemThickness, y - lineY);
                break;
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
}
