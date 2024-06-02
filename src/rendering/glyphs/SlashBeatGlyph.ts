import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { CircleGlyph } from '@src/rendering/glyphs/CircleGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { SlashNoteHeadGlyph } from './SlashNoteHeadGlyph';
import { SlashBarRenderer } from '../SlashBarRenderer';
import { NoteBounds } from '../utils/NoteBounds';
import { Bounds } from '../utils/Bounds';
import { SlashRestGlyph } from './SlashRestGlyph';

export class SlashBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: SlashNoteHeadGlyph | null = null;
    public restGlyph: SlashRestGlyph | null = null;

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        if (this.noteHeads) {
            let pos = this.noteHeads.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += this.noteHeads.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += this.noteHeads.width;
                    break;
            }
            return pos;
        }
        return 0;
    }

    public override buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteHeads && this.container.beat.notes.length > 0) {
            const noteBounds = new NoteBounds();
            noteBounds.note = this.container.beat.notes[0];
            noteBounds.noteHeadBounds = new Bounds();
            noteBounds.noteHeadBounds.x = cx + this.x + this.noteHeads.x;
            noteBounds.noteHeadBounds.y = cy + this.y + this.noteHeads.y - this.noteHeads.height / 2;
            noteBounds.noteHeadBounds.w = this.width;
            noteBounds.noteHeadBounds.h = this.height;
            beatBounds.addNote(noteBounds);
        }
    }

    public override getNoteY(_note: Note, requestedPosition: NoteYPosition): number {
        if (this.noteHeads) {
            let pos = this.y + this.noteHeads.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                case NoteYPosition.TopWithStem:
                    pos -= this.noteHeads.height / 2 + 2 * this.scale;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += this.noteHeads.height / 2;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override updateBeamingHelper(): void {
        if (this.noteHeads) {
            if (this.beamingHelper) {
                this.beamingHelper.registerBeatLineX(
                    'slash',
                    this.container.beat,
                    this.container.x + this.x + this.noteHeads.x + this.noteHeads.width,
                    this.container.x + this.x + this.noteHeads.x + this.noteHeads.width
                );
            }
        } else if (this.restGlyph) {
            this.restGlyph.updateBeamingHelper(this.container.x + this.x);
        }
    }

    public override doLayout(): void {
        // create glyphs
        let sr = this.renderer as SlashBarRenderer;

        const line: number = sr.getNoteLine();
        const glyphY = sr.getLineY(line);

        if (!this.container.beat.isEmpty) {
            if (!this.container.beat.isRest) {
                const isGrace: boolean = this.container.beat.graceType !== GraceType.None;
                const noteHeadGlyph = new SlashNoteHeadGlyph(0, glyphY, this.container.beat.duration, isGrace);
                this.noteHeads = noteHeadGlyph;

                this.addGlyph(noteHeadGlyph);
            } else {
                const restGlyph = new SlashRestGlyph(0, glyphY, this.container.beat.duration);
                this.restGlyph = restGlyph;
                restGlyph.beat = this.container.beat;
                restGlyph.beamingHelper = this.beamingHelper;
                this.addGlyph(restGlyph);

                if (this.beamingHelper) {
                    this.beamingHelper.applyRest(this.container.beat, 0);
                }
            }
        }

        //
        // Note dots
        //
        if (this.container.beat.dots > 0) {
            this.addGlyph(new SpacingGlyph(0, 0, 5 * this.scale));
            for (let i: number = 0; i < this.container.beat.dots; i++) {
                this.addGlyph(
                    new CircleGlyph(0, sr.getLineY(sr.getNoteLine()) - sr.getLineHeight(0.5), 1.5 * this.scale)
                );
            }
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.centerX = this.width / 2;
        } else if (this.container.beat.isRest) {
            this.centerX = this.restGlyph!.x + this.restGlyph!.width / 2;
        } else {
            this.centerX = this.noteHeads!.x + this.noteHeads!.width / 2;
        }
    }
}
