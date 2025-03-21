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
import { BeatGlyphBase } from './glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from './glyphs/BeatOnNoteGlyphBase';
import { NumberedBeatContainerGlyph } from './NumberedBeatContainerGlyph';
import { NumberedBeatGlyph, NumberedBeatPreNotesGlyph } from './glyphs/NumberedBeatGlyph';
import { ScoreTimeSignatureGlyph } from './glyphs/ScoreTimeSignatureGlyph';
import { SpacingGlyph } from './glyphs/SpacingGlyph';
import { NumberedKeySignatureGlyph } from './glyphs/NumberedKeySignatureGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { Duration } from '@src/model';
import { BeatXPosition } from './BeatXPosition';
import { RepeatOpenGlyph } from './glyphs/RepeatOpenGlyph';
import { BarNumberGlyph } from './glyphs/BarNumberGlyph';
import { ElementStyleHelper } from './utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using (Jianpu) Numbered Music Notation
 */
export class NumberedBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'numbered';

    public simpleWhammyOverflow: number = 0;

    private _isOnlyNumbered: boolean;
    public shortestDuration = Duration.QuadrupleWhole;
    public lowestOctave: number | null = null;
    public highestOctave: number | null = null;

    public registerOctave(octave: number) {
        if (this.lowestOctave === null) {
            this.lowestOctave = octave;
            this.highestOctave = octave;
        } else {
            if (octave < this.lowestOctave!) {
                this.lowestOctave = octave;
            }
            if (octave > this.highestOctave!) {
                this.highestOctave = octave;
            }
        }
    }

    public override get repeatsBarSubElement(): BarSubElement {
        return BarSubElement.NumberedRepeats;
    }

    public override get barNumberBarSubElement(): BarSubElement {
        return BarSubElement.NumberedBarNumber;
    }

    public override get barSeparatorBarSubElement(): BarSubElement {
        return BarSubElement.NumberedBarSeparator;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.NumberedStaffLine;
    }

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this._isOnlyNumbered = !bar.staff.showSlash && !bar.staff.showTablature && !bar.staff.showStandardNotation;
    }

    public override get lineSpacing(): number {
        return BarRendererBase.RawLineSpacing;
    }

    public override get heightLineCount(): number {
        return 5;
    }

    public override get drawnLineCount(): number {
        return 0;
    }

    protected override get bottomGlyphOverflow(): number {
        return 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        this.paintBeams(cx, cy, canvas, BeatSubElement.NumberedDuration, BeatSubElement.NumberedDuration);
        this.paintTuplets(cx, cy, canvas, BeatSubElement.NumberedTuplet, true);
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

        if (!this.bar.isEmpty) {
            let barCount: number = ModelUtils.getIndex(this.shortestDuration) - 2;
            if (barCount > 0) {
                let barSpacing: number = NumberedBarRenderer.BarSpacing;
                let barSize: number = NumberedBarRenderer.BarSize;
                let barOverflow = (barCount - 1) * barSpacing + barSize;

                let dotOverflow = 0;
                const lowestOctave = this.lowestOctave;
                if (lowestOctave !== null) {
                    dotOverflow = Math.abs(lowestOctave) * NumberedBarRenderer.DotSpacing + NumberedBarRenderer.DotSize;
                }

                this.registerOverflowBottom(barOverflow + dotOverflow);
            }

            const highestOctave = this.highestOctave;
            if (highestOctave !== null) {
                const dotOverflow =
                    Math.abs(highestOctave) * NumberedBarRenderer.DotSpacing + NumberedBarRenderer.DotSize;
                this.registerOverflowTop(dotOverflow);
            }
        }
    }

    private static BarSpacing = BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness;
    public static BarSize = 2;

    private static DotSpacing = 5;
    public static DotSize = 2;

    protected override paintFlag(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, flagsElement: BeatSubElement): void {
        this.paintBar(cx, cy, canvas, h, flagsElement);
    }

    protected override paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, flagsElement: BeatSubElement): void {
        if(h.beats.length === 0){
            return;
        }
        const res = this.resources;
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            let beat: Beat = h.beats[i];

            using _ = ElementStyleHelper.beat(
                canvas,
                flagsElement,
                beat    
            )
    
            //
            // draw line
            //
            let barSpacing: number = NumberedBarRenderer.BarSpacing;
            let barSize: number = NumberedBarRenderer.BarSize;
            let barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            let barStart: number = cy + this.y;

            let beatLineX: number = this.getBeatX(beat, BeatXPosition.PreNotes) - this.beatGlyphsStart;

            var beamY = this.calculateBeamY(h, beatLineX);

            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                let barStartX: number = 0;
                let barEndX: number = 0;
                let barStartY: number = 0;
                let barY: number = barStart + barIndex * barSpacing;
                if (i === h.beats.length - 1) {
                    barStartX = beatLineX;
                    barEndX = this.getBeatX(beat, BeatXPosition.PostNotes) - this.beatGlyphsStart;
                } else {
                    barStartX = beatLineX;
                    barEndX = this.getBeatX(h.beats[i + 1], BeatXPosition.PreNotes) - this.beatGlyphsStart;
                }

                barStartY = (barY + beamY) | 0;
                LineBarRenderer.paintSingleBar(
                    canvas,
                    cx + this.x + barStartX,
                    barStartY,
                    cx + this.x + barEndX,
                    barStartY,
                    barSize
                );
            }

            const onNotes = this.getBeatContainer(beat)!.onNotes;
            let dotCount = onNotes instanceof NumberedBeatGlyph ? (onNotes as NumberedBeatGlyph).octaveDots : 0;
            let dotsY = 0;
            let dotsOffset = 0;
            if (dotCount > 0) {
                dotsY = barStart + this.getLineY(0) - res.numberedNotationFont.size / 1.5;
                dotsOffset = NumberedBarRenderer.DotSpacing * -1;
            } else if (dotCount < 0) {
                dotsY = barStart + beamY + barCount * barSpacing;
                dotsOffset = NumberedBarRenderer.DotSpacing;
            }
            let dotX: number = this.getBeatX(beat, BeatXPosition.OnNotes) + 4 - this.beatGlyphsStart;

            dotCount = Math.abs(dotCount);

            for (let d = 0; d < dotCount; d++) {
                canvas.fillCircle(cx + this.x + dotX, dotsY, NumberedBarRenderer.DotSize);
                dotsY += dotsOffset;
            }
        }
    }

    public getNoteLine() {
        return 0;
    }

    public override get tupletOffset(): number {
        return super.tupletOffset + this.resources.numberedNotationFont.size;
    }

    protected override getFlagTopY(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected override getFlagBottomY(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected override getBeamDirection(_helper: BeamingHelper): BeamDirection {
        return BeamDirection.Down;
    }

    protected override getTupletBeamDirection(_helper: BeamingHelper): BeamDirection {
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
        const res = this.resources.numberedNotationFont;
        return this.getLineY(0) + res.size;
    }

    protected override getBarLineStart(_beat: Beat, _direction: BeamDirection): number {
        return this.getLineY(0) - SlashNoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected override createPreBeatGlyphs(): void {
        this.wasFirstOfLine = this.isFirstOfLine;
        if (this.bar.masterBar.isRepeatStart && this._isOnlyNumbered) {
            this.addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        this.createLinePreBeatGlyphs();
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getLineHeight(-0.25), this.bar.index + 1));
    }

    protected override createLinePreBeatGlyphs(): void {
        // Key signature
        if (!this.bar.previousBar || this.bar.masterBar.keySignature !== this.bar.previousBar.masterBar.keySignature) {
            this.createStartSpacing();
            this.createKeySignatureGlyphs();
        }

        if (
            this._isOnlyNumbered &&
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
    private createKeySignatureGlyphs() {
        this.addPreBeatGlyph(
            new NumberedKeySignatureGlyph(
                0,
                this.getLineY(0),
                this.bar.masterBar.keySignature,
                this.bar.masterBar.keySignatureType
            )
        );
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
        g.barSubElement = BarSubElement.NumberedTimeSignature;
        this.addPreBeatGlyph(g);
    }

    protected override createPostBeatGlyphs(): void {
        if (this._isOnlyNumbered) {
            super.createPostBeatGlyphs();
        }
    }

    protected override createVoiceGlyphs(v: Voice): void {
        for (const b of v.beats) {
            let container: NumberedBeatContainerGlyph = new NumberedBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = v.index == 0 ? new NumberedBeatPreNotesGlyph() : new BeatGlyphBase();
            container.onNotes = v.index == 0 ? new NumberedBeatGlyph() : new BeatOnNoteGlyphBase();
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
    }
}
