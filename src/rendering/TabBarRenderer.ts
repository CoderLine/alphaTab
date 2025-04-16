import { type Bar, BarSubElement } from '@src/model/Bar';
import { type Beat, BeatSubElement } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import type { Voice } from '@src/model/Voice';
import { TabRhythmMode } from '@src/NotationSettings';
import type { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { TabBeatContainerGlyph } from '@src/rendering/glyphs/TabBeatContainerGlyph';
import { TabBeatGlyph } from '@src/rendering/glyphs/TabBeatGlyph';
import { TabBeatPreNotesGlyph } from '@src/rendering/glyphs/TabBeatPreNotesGlyph';
import { TabClefGlyph } from '@src/rendering/glyphs/TabClefGlyph';
import type { TabNoteChordGlyph } from '@src/rendering/glyphs/TabNoteChordGlyph';
import { TabTimeSignatureGlyph } from '@src/rendering/glyphs/TabTimeSignatureGlyph';
import type { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { GraceType } from '@src/model/GraceType';
import type { ReservedLayoutAreaSlot } from '@src/rendering/utils/BarCollisionHelper';
import { MultiBarRestBeatContainerGlyph } from '@src/rendering/MultiBarRestBeatContainerGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using guitar tablature notation
 */
export class TabBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'tab';
    public static readonly TabLineSpacing: number = 10;

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

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);

        if (!bar.staff.showStandardNotation) {
            this.showTimeSignature = true;
            this.showRests = true;
            this.showTiedNotes = true;
            this._showMultiBarRest = true;
        }
    }

    public override get lineSpacing(): number {
        return TabBarRenderer.TabLineSpacing;
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

    protected override collectSpaces(spaces: Float32Array[][]): void {
        const padding: number = 1;
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const vc: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                for (const bg of vc.beatGlyphs) {
                    const notes: TabBeatGlyph = bg.onNotes as TabBeatGlyph;
                    const noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                    if (noteNumbers) {
                        for (const [str, noteNumber] of noteNumbers.notesPerString) {
                            if (!noteNumber.isEmpty) {
                                spaces[this.bar.staff.tuning.length - str].push(
                                    new Float32Array([
                                        vc.x + bg.x + notes.x + noteNumbers!.x,
                                        noteNumbers!.width + padding
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
            this.height += this.settings.notation.rhythmHeight;
            this.bottomPadding += this.settings.notation.rhythmHeight;
        }
    }

    public override doLayout(): void {
        super.doLayout();
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
                this.registerOverflowBottom(this.tupletSize);
            }
        }
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        if (this.isFirstOfLine) {
            const center: number = (this.bar.staff.tuning.length - 1) / 2;
            this.addPreBeatGlyph(new TabClefGlyph(5, this.getTabY(center)));
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
            this.createTimeSignatureGlyphs();
        }
    }

    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5));

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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        if (this.rhythmMode !== TabRhythmMode.Hidden) {
            this.paintBeams(cx, cy, canvas, BeatSubElement.GuitarTabFlags, BeatSubElement.GuitarTabBeams);
            this.paintTuplets(cx, cy, canvas, BeatSubElement.GuitarTabTuplet);
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
        return startGlyph.noteNumbers.getNoteY(startGlyph.noteNumbers.minStringNote!, NoteYPosition.Bottom);
    }

    protected override getFlagBottomY(_beat: Beat, _direction: BeamDirection): number {
        return this.getFlagAndBarPos();
    }

    protected override getFlagStemSize(duration: Duration, forceMinStem: boolean = false): number {
        return 0; // fixed size via getFlagBottomY
    }

    protected override getBarLineStart(beat: Beat, direction: BeamDirection): number {
        const startGlyph: TabBeatGlyph = this.getOnNotesGlyphForBeat(beat) as TabBeatGlyph;
        if (!startGlyph.noteNumbers || beat.duration === Duration.Half) {
            return this.height - this.settings.notation.rhythmHeight - this.tupletSize;
        }
        return (
            startGlyph.noteNumbers.getNoteY(startGlyph.noteNumbers.minStringNote!, NoteYPosition.Bottom) +
            this.lineOffset / 2
        );
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected getFlagAndBarPos(): number {
        return this.height - (this._hasTuplets ? this.tupletSize / 2 : 0);
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

        canvas.lineWidth = BarRendererBase.StemWidth;
        canvas.beginPath();

        let holes: ReservedLayoutAreaSlot[] = [];
        if (this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.has(beat.displayStart)) {
            holes = this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.get(beat.displayStart)!.slots.slice();
            holes.sort((a, b) => a.topY - b.topY);
        }

        let y = bottomY;
        while (y > topY) {
            canvas.moveTo(x, y);

            let lineY = topY;
            // draw until next hole (if hole reaches into line)
            if (holes.length > 0 && holes[holes.length - 1].bottomY > lineY) {
                const bottomHole = holes.pop()!;
                lineY = cy + bottomHole.bottomY;
                canvas.lineTo(x, lineY);
                y = cy + bottomHole.topY;
            } else {
                canvas.lineTo(x, lineY);
                break;
            }
        }
        canvas.stroke();

        canvas.lineWidth = 1;
    }
}
