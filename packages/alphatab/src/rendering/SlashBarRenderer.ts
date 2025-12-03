import { type Bar, BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { LineBarRenderer } from '@coderline/alphatab/rendering//LineBarRenderer';
import { SlashBeatContainerGlyph } from '@coderline/alphatab/rendering/SlashBeatContainerGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { SlashBeatGlyph } from '@coderline/alphatab/rendering/glyphs/SlashBeatGlyph';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';

/**
 * This BarRenderer renders a bar using Slash Rhythm notation
 * @internal
 */
export class SlashBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'slash';

    public simpleWhammyOverflow: number = 0;
    private _isOnlySlash: boolean;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        // ignore numbered notation here
        this._isOnlySlash = !bar.staff.showTablature && !bar.staff.showStandardNotation;
        this.helpers.preferredBeamDirection = BeamDirection.Up;
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
        let hasTuplets: boolean = false;
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const c = this.getVoiceContainer(voice)!;
                if (c.tupletGroups.length > 0) {
                    hasTuplets = true;
                    break;
                }
            }
        }
        if (hasTuplets) {
            this.registerOverflowTop(this.tupletSize);
        }
    }

    public getNoteLine() {
        return 0;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        const noteHeadHeight = this.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadSlashWhiteHalf)!;
        let y = this.getLineY(0) - noteHeadHeight / 2;
        if (direction === BeamDirection.Up) {
            y -= this.getFlagStemSize(beat.duration, true);
        }
        return y;
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        const noteHeadHeight = this.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadSlashWhiteHalf)!;
        let y = this.getLineY(0) - noteHeadHeight / 2;
        if (direction === BeamDirection.Down) {
            y += this.getFlagStemSize(beat.duration, true);
        }
        return y;
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Up;
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        let y = super.getNoteY(note, requestedPosition);
        if (Number.isNaN(y)) {
            y = this.getLineY(0);
        }
        return y;
    }

    protected override calculateBeamYWithDirection(_h: BeamingHelper, _x: number, _direction: BeamDirection): number {
        return this.getLineY(0) - this.getFlagStemSize(_h.shortestDuration);
    }

    protected override getBarLineStart(_beat: Beat, _direction: BeamDirection): number {
        const noteHeadHeight = this.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadSlashWhiteHalf)!;
        return this.getLineY(0) - noteHeadHeight / 2;
    }

    protected override createLinePreBeatGlyphs(): void {
        // Key signature
        if (
            this._isOnlySlash &&
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
        super.createVoiceGlyphs(v);
        for (const b of v.beats) {
            const container: SlashBeatContainerGlyph = new SlashBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new BeatGlyphBase();
            container.onNotes = v.index === 0 ? new SlashBeatGlyph() : new BeatOnNoteGlyphBase();
            this.addBeatGlyph(container);
        }
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
        const lineWidth = canvas.lineWidth;
        canvas.lineWidth = this.smuflMetrics.stemThickness;
        canvas.beginPath();
        canvas.moveTo(x, topY);
        canvas.lineTo(x, bottomY);
        canvas.stroke();
        canvas.lineWidth = lineWidth;
    }
}
