import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { GraceGroup } from '@coderline/alphatab/model/GraceGroup';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { TupletGroup } from '@coderline/alphatab/model/TupletGroup';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarBounds } from '@coderline/alphatab/rendering/_barrel';
import type { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import type { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { NumberedBeatPreNotesGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedBeatGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import { NumberedBeatContainerGlyph } from '@coderline/alphatab/rendering/NumberedBeatContainerGlyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

/**
 * @internal
 */
export interface INumberedBeatDashGlyph {
    readonly contentWidth: number;
    readonly x: number;
    readonly width: number;
}

/**
 * @internal
 */
export class NumberedNoteBeatContainerGlyphBase extends NumberedBeatContainerGlyph implements INumberedBeatDashGlyph {
    private _absoluteDisplayStart: number;
    private _displayDuration: number;
    public constructor(beat: Beat, absoluteDisplayStart: number, displayDuration: number) {
        super(beat);
        this._absoluteDisplayStart = absoluteDisplayStart;
        this._displayDuration = displayDuration;
        (this.preNotes as NumberedBeatPreNotesGlyph).skipLayout = true;

        this.barCount = NumberedNoteBeatContainerGlyphBase._ticksToBarCount(displayDuration);
    }

    private static _ticksToBarCount(displayDuration: number): number {
        // we know that displayDuration < MidiUtils.QuarterTime, otherwise this glyph is not created
        if (displayDuration >= MidiUtils.toTicks(Duration.Eighth)) {
            return 1;
        } else if (displayDuration >= MidiUtils.toTicks(Duration.Sixteenth)) {
            return 2;
        } else if (displayDuration >= MidiUtils.toTicks(Duration.ThirtySecond)) {
            return 3;
        } else if (displayDuration >= MidiUtils.toTicks(Duration.SixtyFourth)) {
            return 4;
        } else if (displayDuration >= MidiUtils.toTicks(Duration.OneHundredTwentyEighth)) {
            return 5;
        } else if (displayDuration >= MidiUtils.toTicks(Duration.TwoHundredFiftySixth)) {
            return 6;
        }
        return 0;
    }

    public readonly barCount: number;

    public override get beatId(): number {
        return -1;
    }

    public get contentWidth() {
        return this.onNotes.width;
    }

    public override get absoluteDisplayStart(): number {
        return this._absoluteDisplayStart;
    }

    public override get displayDuration(): number {
        return this._displayDuration;
    }

    public override get graceType(): GraceType {
        return GraceType.None;
    }
    public override get graceIndex(): number {
        return 0;
    }
    public override get graceGroup(): GraceGroup | null {
        return null;
    }

    public override get isFirstOfTupletGroup(): boolean {
        return false;
    }
    public override get tupletGroup(): TupletGroup | null {
        return null;
    }
    public override get isLastOfVoice(): boolean {
        return false;
    }

    public override buildBoundingsLookup(_barBounds: BarBounds, _cx: number, _cy: number): void {}
}

/**
 * @internal
 */
export class NumberedDashBeatContainerGlyph extends BeatContainerGlyphBase implements INumberedBeatDashGlyph {
    private _absoluteDisplayStart: number;
    private _voiceIndex: number;
    public constructor(voiceIndex: number, absoluteDisplayStart: number) {
        super(0, 0);
        this._absoluteDisplayStart = absoluteDisplayStart;
        this._voiceIndex = voiceIndex;
    }

    public override get beatId(): number {
        return -1;
    }

    public get contentWidth() {
        return this.renderer.smuflMetrics.numberedDashGlyphWidth;
    }

    public override get absoluteDisplayStart(): number {
        return this._absoluteDisplayStart;
    }
    public override get displayDuration(): number {
        return MidiUtils.QuarterTime;
    }

    public override get onTimeX(): number {
        return this.renderer.smuflMetrics.numberedDashGlyphWidth / 2;
    }

    public override get graceType(): GraceType {
        return GraceType.None;
    }
    public override get graceIndex(): number {
        return 0;
    }
    public override get graceGroup(): GraceGroup | null {
        return null;
    }
    public override get voiceIndex(): number {
        return this._voiceIndex;
    }

    public override get isFirstOfTupletGroup(): boolean {
        return false;
    }
    public override get tupletGroup(): TupletGroup | null {
        return null;
    }
    public override get isLastOfVoice(): boolean {
        return false;
    }

    public override getNoteY(_note: Note, _requestedPosition: NoteYPosition): number {
        return 0;
    }
    public override doMultiVoiceLayout(): void {}
    public override getRestY(_requestedPosition: NoteYPosition): number {
        return 0;
    }
    public override getNoteX(_note: Note, _requestedPosition: NoteXPosition): number {
        return 0;
    }
    public override getBeatX(_requestedPosition: BeatXPosition, _useSharedSizes: boolean): number {
        return 0;
    }
    public override registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const width = this.renderer.smuflMetrics.numberedDashGlyphWidth;
        layoutings.addBeatSpring(this, width / 2, width / 2);
    }
    public override applyLayoutingInfo(_info: BarLayoutingInfo): void {}
    public override buildBoundingsLookup(_barBounds: BarBounds, _cx: number, _cy: number): void {}

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as NumberedBarRenderer;
        const dashWidth = renderer.smuflMetrics.numberedDashGlyphWidth;
        const dashHeight = renderer.smuflMetrics.numberedBarRendererBarSize;
        const dashY = Math.ceil(cy + renderer.getLineY(0) - dashHeight);
        canvas.fillRect(cx + this.x, dashY, dashWidth, dashHeight);
    }
}
