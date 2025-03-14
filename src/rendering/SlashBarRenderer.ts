import { Bar, BarSubElement } from '@src/model/Bar';
import { Beat, BeatSubElement } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { Voice } from '@src/model/Voice';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { LineBarRenderer } from './LineBarRenderer';
import { SlashNoteHeadGlyph } from './glyphs/SlashNoteHeadGlyph';
import { SlashBeatContainerGlyph } from './SlashBeatContainerGlyph';
import { BeatGlyphBase } from './glyphs/BeatGlyphBase';
import { SlashBeatGlyph } from './glyphs/SlashBeatGlyph';
import { BeatOnNoteGlyphBase } from './glyphs/BeatOnNoteGlyphBase';
import { SpacingGlyph } from './glyphs/SpacingGlyph';
import { ScoreTimeSignatureGlyph } from './glyphs/ScoreTimeSignatureGlyph';
import { ElementStyleHelper } from './utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using Slash Rhythm notation
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

    public override get barSeparatorBarSubElement(): BarSubElement {
        return BarSubElement.SlashBarSeparator;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.SlashStaffLine;
    }

    public override get lineSpacing(): number {
        return BarRendererBase.RawLineSpacing;
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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        this.paintBeams(cx, cy, canvas, BeatSubElement.SlashFlags, BeatSubElement.SlashBeams);
        this.paintTuplets(cx, cy, canvas, BeatSubElement.SlashTuplet);
    }

    public override doLayout(): void {
        super.doLayout();
        let hasTuplets: boolean = false;
        for (let voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                let c = this.getVoiceContainer(voice)!;
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

    protected override getFlagTopY(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected override getFlagBottomY(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Up;
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        let y = super.getNoteY(note, requestedPosition);
        if (isNaN(y)) {
            y = this.getLineY(0);
        }
        return y;
    }

    protected override calculateBeamYWithDirection(_h: BeamingHelper, _x: number, _direction: BeamDirection): number {
        return this.getLineY(0) - this.getFlagStemSize(_h.shortestDuration);
    }

    protected override getBarLineStart(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
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
            this.createTimeSignatureGlyphs();
        }
    }

    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5));

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
        for (const b of v.beats) {
            let container: SlashBeatContainerGlyph = new SlashBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new BeatGlyphBase();
            container.onNotes = v.index == 0 ? new SlashBeatGlyph() : new BeatOnNoteGlyphBase();
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
        canvas.lineWidth = BarRendererBase.StemWidth;
        canvas.beginPath();
        canvas.moveTo(x, topY);
        canvas.lineTo(x, bottomY);
        canvas.stroke();
        canvas.lineWidth = 1;
    }
}
