import { BendType } from '@src/model/BendType';
import { Font } from '@src/model/Font';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { Bounds } from '@src/rendering/utils/Bounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { ModelUtils } from '@src/model/ModelUtils';
import { NotationElement, NotationMode } from '@src/NotationSettings';
import { BeatBounds } from '../utils/BeatBounds';

export class NoteNumberGlyph extends Glyph {
    private _note: Note;
    private _noteString: string | null = null;
    private _trillNoteString: string | null = null;
    private _trillNoteStringWidth: number = 0;

    public isEmpty: boolean = false;
    public noteStringWidth: number = 0;

    public constructor(x: number, y: number, note: Note) {
        super(x, y);
        this._note = note;
    }

    public doLayout(): void {
        let n: Note = this._note;
        let fret: number = n.fret - n.beat.voice.bar.staff.transpositionPitch;
        if (n.harmonicType === HarmonicType.Natural && n.harmonicValue !== 0) {
            fret = n.harmonicValue - n.beat.voice.bar.staff.transpositionPitch;
        }
        if (!n.isTieDestination) {
            this._noteString = n.isDead ? 'x' : fret.toString();
            if (n.isGhost) {
                this._noteString = '(' + this._noteString + ')';
            } else if (n.harmonicType === HarmonicType.Natural) {
                // only first decimal char
                let i: number = this._noteString.indexOf(String.fromCharCode(46));
                if (i >= 0) {
                    this._noteString = this._noteString.substr(0, i + 2);
                }
                this._noteString = '<' + this._noteString + '>';
            }
        } else if (
            (n.beat.index === 0 && this.renderer.settings.notation.notationMode == NotationMode.GuitarPro) ||
            ((n.bendType === BendType.Bend || n.bendType === BendType.BendRelease) &&
                this.renderer.settings.notation.isNotationElementVisible(NotationElement.TabNotesOnTiedBends))
        ) {
            this._noteString = '(' + (n.tieOrigin!.fret - n.beat.voice.bar.staff.transpositionPitch) + ')';
        } else {
            this._noteString = '';
        }
        if (n.isTrill) {
            this._trillNoteString = '(' + (n.trillFret - n.beat.voice.bar.staff.transpositionPitch) + ')';
        } else if (!ModelUtils.isAlmostEqualTo(n.harmonicValue, 0)) {
            switch (n.harmonicType) {
                case HarmonicType.Artificial:
                case HarmonicType.Pinch:
                case HarmonicType.Tap:
                case HarmonicType.Semi:
                case HarmonicType.Feedback:
                    let s: string = (fret + n.harmonicValue).toString();
                    // only first decimal char
                    let i: number = s.indexOf(String.fromCharCode(46));
                    if (i >= 0) {
                        s = s.substr(0, i + 2);
                    }
                    this._trillNoteString = '<' + s + '>';
                    break;
                default:
                    this._trillNoteString = '';
                    break;
            }
        } else {
            this._trillNoteString = '';
        }
        this.isEmpty = !this._noteString;
        if (!this.isEmpty) {
            this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.tablatureFont;
            this.width = this.noteStringWidth = this.renderer.scoreRenderer.canvas!.measureText(this._noteString) * this.scale;
            this.height = this.renderer.scoreRenderer.canvas!.font.size;
            let hasTrill: boolean = !!this._trillNoteString;
            if (hasTrill) {
                this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.graceFont;
                this._trillNoteStringWidth =
                    3 * this.scale + this.renderer.scoreRenderer.canvas!.measureText(this._trillNoteString);
                this.width += this._trillNoteStringWidth;
            }
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.isEmpty) {
            return;
        }
        let textWidth: number = this.noteStringWidth + this._trillNoteStringWidth;
        let x: number = cx + this.x + (this.width - textWidth) / 2;
        let prevFont: Font = this.renderer.scoreRenderer.canvas!.font;
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.graceFont;
        canvas.fillText(this._trillNoteString!, x + this.noteStringWidth + 3 * this.scale, cy + this.y);
        this.renderer.scoreRenderer.canvas!.font = prevFont;
        canvas.fillText(this._noteString!, x, cy + this.y);
    }

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        let noteBounds: NoteBounds = new NoteBounds();
        noteBounds.note = this._note;
        noteBounds.noteHeadBounds = new Bounds();
        noteBounds.noteHeadBounds.x = cx + this.x;
        noteBounds.noteHeadBounds.y = cy + this.y - this.height/2;
        noteBounds.noteHeadBounds.w = this.width;
        noteBounds.noteHeadBounds.h = this.height;
        this.renderer.scoreRenderer.boundsLookup!.addNote(noteBounds);
    }
}
