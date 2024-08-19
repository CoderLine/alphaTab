import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
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
        this.paintBeams(cx, cy, canvas);
        this.paintTuplets(cx, cy, canvas);
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

    protected override getFlagTopY(_beat: Beat): number {
        return this.getLineY(0) - (SlashNoteHeadGlyph.NoteHeadHeight / 2) * this.scale;
    }

    protected override getFlagBottomY(_beat: Beat): number {
        return this.getLineY(0) - (SlashNoteHeadGlyph.NoteHeadHeight / 2) * this.scale;
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
        return this.getLineY(0) - (SlashNoteHeadGlyph.NoteHeadHeight / 2) * this.scale;
    }

    protected override createLinePreBeatGlyphs(): void {
        // Key signature
        if(this._isOnlySlash) {
            this.createStartSpacing();
            this.createTimeSignatureGlyphs();
        }
    }

    
    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5 * this.scale));

        this.addPreBeatGlyph(
            new ScoreTimeSignatureGlyph(
                0,
                this.getLineY(0),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon
            )
        );
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
        _beat: Beat,
        _cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        canvas.lineWidth = BarRendererBase.StemWidth * this.scale;
        canvas.beginPath();
        canvas.moveTo(x, topY);
        canvas.lineTo(x, bottomY);
        canvas.stroke();
        canvas.lineWidth = this.scale;
    }
}
