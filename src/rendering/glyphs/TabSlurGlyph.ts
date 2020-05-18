import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { TabTieGlyph } from '@src/rendering/glyphs/TabTieGlyph';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class TabSlurGlyph extends TabTieGlyph {
    private _direction: BeamDirection;
    private _forSlide: boolean;

    public constructor(startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean = false) {
        super(startNote, endNote, forEnd);
        this._direction = TabTieGlyph.getBeamDirectionForNote(startNote);
        this._forSlide = forSlide;
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight;
    }

    public tryExpand(startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean): boolean {
        // same type required
        if (this._forSlide !== forSlide) {
            return false;
        }
        if (this.forEnd !== forEnd) {
            return false;
        }
        // same start and endbeat
        if (this.startNote.beat.id !== startNote.beat.id) {
            return false;
        }
        if (this.endNote.beat.id !== endNote.beat.id) {
            return false;
        }
        // same draw direction
        if (this._direction !== TabTieGlyph.getBeamDirectionForNote(startNote)) {
            return false;
        }
        // if we can expand, expand in correct direction
        switch (this._direction) {
            case BeamDirection.Up:
                if (startNote.realValue > this.startNote.realValue) {
                    this.startNote = startNote;
                    this.startBeat = startNote.beat;
                }
                if (endNote.realValue > this.endNote.realValue) {
                    this.endNote = endNote;
                    this.endBeat = endNote.beat;
                }
                break;
            case BeamDirection.Down:
                if (startNote.realValue < this.startNote.realValue) {
                    this.startNote = startNote;
                    this.startBeat = startNote.beat;
                }
                if (endNote.realValue < this.endNote.realValue) {
                    this.endNote = endNote;
                    this.endBeat = endNote.beat;
                }
                break;
        }
        return true;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let startNoteRenderer: BarRendererBase = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staveId,
            this.startBeat!.voice.bar
        )!;
        let direction: BeamDirection = this.getBeamDirection(this.startBeat!, startNoteRenderer);
        let slurId: string = 'tab.slur.' + this.startNote.beat.id + '.' + this.endNote.beat.id + '.' + direction;
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        let isSlurRendered: boolean = renderer.staff.getSharedLayoutData(slurId, false);
        if (!isSlurRendered) {
            renderer.staff.setSharedLayoutData(slurId, true);
            super.paint(cx, cy, canvas);
        }
    }
}
