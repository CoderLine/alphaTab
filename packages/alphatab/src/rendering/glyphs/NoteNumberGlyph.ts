import { BendType } from '@coderline/alphatab/model/BendType';
import type { Color } from '@coderline/alphatab/model/Color';
import type { Font } from '@coderline/alphatab/model/Font';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import { NotationElement, NotationMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { TabFingeringSegment } from '@coderline/alphatab/rendering/utils/TabFingeringSegment';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';

/**
 * @internal
 */
export class NoteNumberGlyph extends Glyph {
    private _note: Note;
    private _noteString: string | null = null;
    private _trillNoteString: string | null = null;
    private _trillNoteStringWidth: number = 0;

    private _isUnplayable: boolean = false;

    public isEmpty: boolean = false;
    public noteStringWidth: number = 0;

    /**
     * The string (1 = lowest) on which the note is shown.
     */
    public displayString: number;

    public constructor(x: number, y: number, note: Note, displayString: number) {
        super(x, y);
        this._note = note;
        this.displayString = displayString;
    }

    public get note(): Note {
        return this._note;
    }

    private get _padding() {
        return (this.renderer as TabBarRenderer).lineSpacing * 0.25;
    }

    public override getBoundingBoxTop(): number {
        return this.y - this.height / 2 - this._padding;
    }

    public override getBoundingBoxBottom(): number {
        return this.y + this.height / 2;
    }

    public override doLayout(): void {
        const n: Note = this._note;
        const tr = this.renderer as TabBarRenderer;
        let fret: number;
        let harmonicType = n.harmonicType;
        let harmonicValue = n.harmonicValue;
        if (n.isStringed) {
            fret = tr.getDisplayFret(n);
            const flags = tr.getDisplayFlags(n);
            this._isUnplayable = (flags & TabFingeringSegment.flagUnplayable) !== 0;
            if ((flags & TabFingeringSegment.flagAsArtificial) !== 0) {
                harmonicType = HarmonicType.Artificial;
                harmonicValue = 12;
            }
        } else {
            const articulation = PercussionMapper.getArticulation(n);
            if (articulation) {
                fret = articulation.id;
            } else {
                fret = n.percussionArticulation;
            }
        }

        if (!n.isTieDestination) {
            this._noteString = n.isDead ? 'x' : fret.toString();
            if (n.isGhost) {
                this._noteString = `(${this._noteString})`;
            } else if (harmonicType === HarmonicType.Natural) {
                // only first decimal char
                const i: number = this._noteString.indexOf(String.fromCharCode(46));
                if (i >= 0) {
                    this._noteString = this._noteString.substr(0, i + 2);
                }
                this._noteString = `<${this._noteString}>`;
            }
        } else if (
            (n.beat.index === 0 && this.renderer.settings.notation.notationMode === NotationMode.GuitarPro) ||
            ((n.bendType === BendType.Bend || n.bendType === BendType.BendRelease) &&
                this.renderer.settings.notation.isNotationElementVisible(NotationElement.TabNotesOnTiedBends))
        ) {
            this._noteString = `(${tr.getDisplayFret(n.tieOrigin!).toString()})`;
        } else {
            this._noteString = '';
        }
        if (n.isTrill) {
            this._trillNoteString = `(${tr.getDisplayTrillFret(n).toString()})`;
        } else if (!ModelUtils.isAlmostEqualTo(harmonicValue, 0)) {
            switch (harmonicType) {
                case HarmonicType.Artificial:
                case HarmonicType.Pinch:
                case HarmonicType.Tap:
                case HarmonicType.Semi:
                case HarmonicType.Feedback:
                    let s: string = (fret + harmonicValue).toString();
                    // only first decimal char
                    const i: number = s.indexOf(String.fromCharCode(46));
                    if (i >= 0) {
                        s = s.substr(0, i + 2);
                    }
                    this._trillNoteString = `<${s}>`;
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
            const scoreRenderer = this.renderer.scoreRenderer;
            const canvas = scoreRenderer.canvas!;
            const textMeasures = scoreRenderer.layout!.textMeasures;
            canvas.font = this.renderer.resources.tablatureFont;
            const hasTrill: boolean = !!this._trillNoteString;
            this.noteStringWidth = textMeasures.measureText(canvas, this._noteString + (hasTrill ? ' ' : '')).width;
            this.width = this.noteStringWidth;
            this.height = canvas.font.size;
            if (hasTrill) {
                canvas.font = this.renderer.resources.graceFont;
                this._trillNoteStringWidth = 3 + textMeasures.measureText(canvas, this._trillNoteString).width;
                this.width += this._trillNoteStringWidth;
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintCentered(cx, cy, canvas, this.width);
    }

    /**
     * Paints the note text horizontally centered within the given column width.
     */
    public paintCentered(cx: number, cy: number, canvas: ICanvas, columnWidth: number): void {
        if (this.isEmpty) {
            return;
        }
        const textWidth: number = this.noteStringWidth + this._trillNoteStringWidth;
        const x: number = cx + this.x + (columnWidth - textWidth) / 2;
        const y = cy + this.y;

        this.paintTrill(x, y, canvas);

        const previousColor = this._applyColor(canvas);
        try {
            canvas.fillText(this._noteString!, x, y);
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }

        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y - this.height / 2, this.width, this.height);
    }
    paintTrill(x: number, cy: number, canvas: ICanvas) {
        if (!this._trillNoteString) {
            return;
        }
        const previousColor = this._applyColor(canvas);
        try {
            const prevFont: Font = this.renderer.scoreRenderer.canvas!.font;
            this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.graceFont;
            canvas.fillText(this._trillNoteString!, x + this.noteStringWidth, cy);
            this.renderer.scoreRenderer.canvas!.font = prevFont;
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }

    private _applyColor(canvas: ICanvas): Color | undefined {
        return this._isUnplayable
            ? ElementStyleHelper.applyNoteWithDefault(
                  canvas,
                  NoteSubElement.GuitarTabFretNumber,
                  this._note,
                  this.renderer.resources.tabUnplayableFretColor
              )
            : ElementStyleHelper.applyNote(canvas, NoteSubElement.GuitarTabFretNumber, this._note);
    }

    public buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number) {
        const scale = this.renderer.settings.display.scale;
        writer.addNote(
            this._note,
            (cx + this.x) * scale,
            (cy + this.y - this.height / 2) * scale,
            this.width * scale,
            this.height * scale
        );
    }
}
