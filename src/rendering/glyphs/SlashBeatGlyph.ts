import { GraceType } from '@src/model/GraceType';
import type { Note } from '@src/model/Note';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { CircleGlyph } from '@src/rendering/glyphs/CircleGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { SlashNoteHeadGlyph } from '@src/rendering/glyphs/SlashNoteHeadGlyph';
import type { SlashBarRenderer } from '@src/rendering/SlashBarRenderer';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { SlashRestGlyph } from '@src/rendering/glyphs/SlashRestGlyph';
import { DeadSlappedBeatGlyph } from '@src/rendering/glyphs/DeadSlappedBeatGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { BeatSubElement } from '@src/model/Beat';

export class SlashBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: SlashNoteHeadGlyph | null = null;
    public deadSlapped: DeadSlappedBeatGlyph | null = null;
    public restGlyph: SlashRestGlyph | null = null;

    protected override get effectElement() {
        return BeatSubElement.SlashEffects;
    }

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        let g: Glyph | null = null;
        if (this.noteHeads) {
            g = this.noteHeads;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = g.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += g.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += g.width;
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
        let g: Glyph | null = null;
        if (this.noteHeads) {
            g = this.noteHeads;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = this.y + g.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                case NoteYPosition.TopWithStem:
                    pos -= g.height / 2 + 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += g.height / 2;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override updateBeamingHelper(): void {
        if (this.noteHeads) {
            this.noteHeads.updateBeamingHelper(this.container.x + this.x);
        } else if (this.deadSlapped) {
            if (this.beamingHelper) {
                this.beamingHelper.registerBeatLineX(
                    'slash',
                    this.container.beat,
                    this.container.x + this.x + this.deadSlapped.x + this.width,
                    this.container.x + this.x + this.deadSlapped.x
                );
            }
        } else if (this.restGlyph) {
            this.restGlyph.updateBeamingHelper(this.container.x + this.x);
        }
    }

    public override doLayout(): void {
        // create glyphs
        const sr = this.renderer as SlashBarRenderer;

        const line: number = sr.getNoteLine();
        const glyphY = sr.getLineY(line);
        if (this.container.beat.deadSlapped) {
            const deadSlapped = new DeadSlappedBeatGlyph();
            deadSlapped.renderer = this.renderer;
            deadSlapped.doLayout();
            this.deadSlapped = deadSlapped;
            this.addEffect(deadSlapped);
        } else if (!this.container.beat.isEmpty) {
            if (!this.container.beat.isRest) {
                const isGrace: boolean = this.container.beat.graceType !== GraceType.None;
                const noteHeadGlyph = new SlashNoteHeadGlyph(
                    0,
                    glyphY,
                    this.container.beat.duration,
                    isGrace,
                    this.container.beat
                );
                this.noteHeads = noteHeadGlyph;
                noteHeadGlyph.beat = this.container.beat;
                noteHeadGlyph.beamingHelper = this.beamingHelper;
                this.addNormal(noteHeadGlyph);
            } else {
                const restGlyph = new SlashRestGlyph(0, glyphY, this.container.beat.duration);
                this.restGlyph = restGlyph;
                restGlyph.beat = this.container.beat;
                restGlyph.beamingHelper = this.beamingHelper;
                this.addNormal(restGlyph);

                if (this.beamingHelper) {
                    this.beamingHelper.applyRest(this.container.beat, 0);
                }
            }
        }

        //
        // Note dots
        //
        if (this.container.beat.dots > 0) {
            this.addNormal(new SpacingGlyph(0, 0, 5));
            for (let i: number = 0; i < this.container.beat.dots; i++) {
                this.addEffect(new CircleGlyph(0, sr.getLineY(sr.getNoteLine()) - sr.getLineHeight(0.5), 1.5));
            }
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.centerX = this.width / 2;
        } else if (this.restGlyph) {
            this.centerX = this.restGlyph.x + this.restGlyph.width / 2;
        } else if (this.noteHeads) {
            this.centerX = this.noteHeads.x + this.noteHeads.width / 2;
        } else if (this.deadSlapped) {
            this.centerX = this.deadSlapped.x + this.deadSlapped.width / 2;
        }
    }
}
