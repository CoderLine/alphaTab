import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { TabBeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatContainerGlyph';
import { TabBeatGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatGlyph';
import { TabBeatPreNotesGlyph } from '@coderline/alphatab/rendering/glyphs/TabBeatPreNotesGlyph';
import { TabClefGlyph } from '@coderline/alphatab/rendering/glyphs/TabClefGlyph';
import type { TabNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/TabNoteChordGlyph';
import { TabTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/TabTimeSignatureGlyph';
import type { VoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/VoiceContainerGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { MultiBarRestBeatContainerGlyph } from '@coderline/alphatab/rendering/MultiBarRestBeatContainerGlyph';
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

    /**
     * Gets the relative y position of the given steps relative to first line.
     * @param line the line of the particular string where 0 is the most top line
     * @param correction
     * @returns
     */
    public getTabY(line: number): number {
        return super.getLineY(line);
    }

    public getTabHeight(line: number): number {
        return super.getLineHeight(line);
    }

    public minString = Number.NaN;
    public maxString = Number.NaN;

    protected override collectSpaces(spaces: Float32Array[][]): void {
        const padding: number = this.smuflMetrics.staffLineThickness;
        const tuning = this.bar.staff.tuning;
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const vc: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                for (const bg of vc.beatGlyphs) {
                    const notes: TabBeatGlyph = bg.onNotes as TabBeatGlyph;
                    const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                    if (noteNumbers) {
                        for (const [str, noteNumber] of noteNumbers.notesPerString) {
                            if (!noteNumber.isEmpty) {
                                spaces[tuning.length - str].push(
                                    new Float32Array([
                                        vc.x + bg.x + notes.x + noteNumbers!.x - padding,
                                        noteNumbers!.width + padding * 2
                                    ])
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    protected override adjustSizes(): void {
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            let shortestTremolo = Duration.Whole;
            for (const b of this.helpers.beamHelpers) {
                for (const h of b) {
                    if (h.tremoloDuration && (!shortestTremolo || shortestTremolo < h.tremoloDuration!)) {
                        shortestTremolo = h.tremoloDuration!;
                    }
                }
            }

            switch (shortestTremolo) {
                case Duration.Eighth:
                    this.height += this.smuflMetrics.glyphHeights.get(MusicFontSymbol.Tremolo1)!;
                    break;
                case Duration.Sixteenth:
                    this.height += this.smuflMetrics.glyphHeights.get(MusicFontSymbol.Tremolo2)!;
                    break;
                case Duration.ThirtySecond:
                    this.height += this.smuflMetrics.glyphHeights.get(MusicFontSymbol.Tremolo3)!;
                    break;
            }

            this.registerOverflowBottom(this.settings.notation.rhythmHeight);
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
            this._hasTuplets = false;
            for (const voice of this.bar.voices) {
                if (this.hasVoiceContainer(voice)) {
                    const c: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                    if (c.tupletGroups.length > 0) {
                        this._hasTuplets = true;
                        break;
                    }
                }
            }
            if (this._hasTuplets) {
                this.registerOverflowBottom(this.settings.notation.rhythmHeight + this.tupletSize);
            }
        }
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        if (this.isFirstOfLine) {
            const center: number = (this.bar.staff.tuning.length - 1) / 2;
            this.createStartSpacing();
            this.addPreBeatGlyph(new TabClefGlyph(0, this.getTabY(center)));
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
                this.getTabY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon,
                this.bar.masterBar.isFreeTime
            )
        );
    }

    protected override createVoiceGlyphs(v: Voice): void {
        super.createVoiceGlyphs(v);
        // multibar rest
        if (this.additionalMultiRestBars) {
            const container = new MultiBarRestBeatContainerGlyph(this.getVoiceContainer(v)!);
            this.addBeatGlyph(container);
        } else {
            for (const b of v.beats) {
                const container: TabBeatContainerGlyph = new TabBeatContainerGlyph(b, this.getVoiceContainer(v)!);
                container.preNotes = new TabBeatPreNotesGlyph();
                container.onNotes = new TabBeatGlyph();
                this.addBeatGlyph(container);
            }
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
        bracketsAsArcs?: boolean
    ): void {
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            super.paintTuplets(cx, cy, canvas, beatElement, bracketsAsArcs);
        }
    }

    public override drawBeamHelperAsFlags(h: BeamingHelper): boolean {
        return super.drawBeamHelperAsFlags(h) || this.rhythmMode === TabRhythmMode.ShowWithBeams;
    }

    protected override getFlagTopY(beat: Beat, _direction: BeamDirection): number {
        const startGlyph: TabBeatGlyph = this.getOnNotesGlyphForBeat(beat) as TabBeatGlyph;
        if (!startGlyph.noteNumbers || beat.duration === Duration.Half) {
            return this.height - this.settings.notation.rhythmHeight - this.tupletSize;
        }
        return (
            startGlyph.noteNumbers.getNoteY(startGlyph.noteNumbers.minStringNote!, NoteYPosition.Bottom) +
            this.smuflMetrics.staffLineThickness
        );
    }

    protected override getFlagBottomY(_beat: Beat, _direction: BeamDirection): number {
        return this.getFlagAndBarPos();
    }

    protected override getFlagStemSize(_duration: Duration, _forceMinStem: boolean = false): number {
        return 0; // fixed size via getFlagBottomY
    }

    protected override getBarLineStart(beat: Beat, direction: BeamDirection): number {
        return this.getFlagTopY(beat, direction);
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected getFlagAndBarPos(): number {
        return this.height + this.settings.notation.rhythmHeight - (this._hasTuplets ? this.tupletSize / 2 : 0);
    }

    protected override calculateBeamYWithDirection(_h: BeamingHelper, _x: number, _direction: BeamDirection): number {
        // currently only used for duplets
        return this.getFlagAndBarPos();
    }

    protected override shouldPaintFlag(beat: Beat, h: BeamingHelper): boolean {
        if (!super.shouldPaintFlag(beat, h)) {
            return false;
        }

        if (beat.graceType !== GraceType.None) {
            return false;
        }

        return this.drawBeamHelperAsFlags(h);
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
}
