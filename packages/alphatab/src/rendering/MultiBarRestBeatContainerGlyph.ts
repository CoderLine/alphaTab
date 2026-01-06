import { Duration } from '@coderline/alphatab/model/Duration';
import type { GraceGroup } from '@coderline/alphatab/model/GraceGroup';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { TupletGroup } from '@coderline/alphatab/model/TupletGroup';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { MultiBarRestGlyph } from '@coderline/alphatab/rendering/glyphs/MultiBarRestGlyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';

/**
 * @internal
 */
export class MultiBarRestBeatContainerGlyph extends BeatContainerGlyphBase {
    private _glyph?: MultiBarRestGlyph;

    public constructor() {
        super(0, 0);
    }

    public override get absoluteDisplayStart(): number {
        return this.renderer.bar.masterBar.start;
    }
    public override get beatId(): number {
        return -1;
    }

    public override get onTimeX(): number {
        return 0;
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
        return 0;
    }
    public override get isFirstOfTupletGroup(): boolean {
        return false;
    }
    public override get tupletGroup(): TupletGroup | null {
        return null;
    }
    public override get isLastOfVoice(): boolean {
        return true;
    }

    public override get displayDuration(): number {
        return 0;
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        const g = this._glyph;
        if (g) {
            switch (requestedPosition) {
                case NoteYPosition.Top:
                    return g.y;
                case NoteYPosition.TopWithStem:
                    return g.y - this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
                case NoteYPosition.Center:
                case NoteYPosition.StemUp:
                case NoteYPosition.StemDown:
                    return g.y + g.height / 2;
                case NoteYPosition.Bottom:
                    return g.y + g.height;
                case NoteYPosition.BottomWithStem:
                    return g.y + g.height + this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
            }
        }
        return 0;
    }

    public override getNoteY(_note: Note, requestedPosition: NoteYPosition): number {
        return this.getRestY(requestedPosition);
    }

    public override getHighestNoteY(position: NoteYPosition): number {
        return this.getRestY(position);
    }

    public override getLowestNoteY(position: NoteYPosition): number {
        return this.getRestY(position);
    }

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        const g = this._glyph;
        if (g) {
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    return g.x;
                case NoteXPosition.Center:
                    return g.x + g.width / 2;
                case NoteXPosition.Right:
                    return g.x + g.width;
            }
        }
        return 0;
    }

    public override getBeatX(requestedPosition: BeatXPosition, _useSharedSizes: boolean): number {
        const g = this._glyph;
        if (g) {
            switch (requestedPosition) {
                case BeatXPosition.PreNotes:
                    return g.x;
                case BeatXPosition.OnNotes:
                case BeatXPosition.MiddleNotes:
                case BeatXPosition.Stem:
                case BeatXPosition.PostNotes:
                    return g.x + g.width;
                case BeatXPosition.EndBeat:
                    return this.width;
            }
        }
        return 0;
    }
    public override registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const width = this._glyph?.width ?? 0;
        layoutings.addBeatSpring(this, 0, width);
    }

    public override applyLayoutingInfo(_info: BarLayoutingInfo): void {}

    public override buildBoundingsLookup(_barBounds: BarBounds, _cx: number, _cy: number): void {}

    public override doLayout(): void {
        if (this.renderer.showMultiBarRest) {
            this._glyph = new MultiBarRestGlyph();
            this._glyph.renderer = this.renderer;
            this._glyph.doLayout();
            this.width = this._glyph.width;
        }
    }

    public override doMultiVoiceLayout(): void {
        // nothing to do
    }

    public override getBoundingBoxTop(): number {
        return this._glyph?.getBoundingBoxTop() ?? Number.NaN;
    }

    public override getBoundingBoxBottom(): number {
        return this._glyph?.getBoundingBoxBottom() ?? Number.NaN;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this._glyph?.paint(cx + this.x, cy + this.y, canvas);
    }
}
