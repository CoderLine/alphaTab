import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteNumberGlyph } from '@coderline/alphatab/rendering/glyphs/NoteNumberGlyph';
import { SlashNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/SlashNoteHeadGlyph';
import { TabNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/TabNoteChordGlyph';
import { TabRestGlyph } from '@coderline/alphatab/rendering/glyphs/TabRestGlyph';
import { TremoloPickingGlyph } from '@coderline/alphatab/rendering/glyphs/TremoloPickingGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';

/**
 * @internal
 */
export class TabBeatGlyph extends BeatOnNoteGlyphBase {
    public slash: SlashNoteHeadGlyph | null = null;
    public noteNumbers: TabNoteChordGlyph | null = null;
    public restGlyph: TabRestGlyph | null = null;

    protected override get effectElement() {
        return BeatSubElement.GuitarTabEffects;
    }

    public override getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        if (this.slash) {
            let pos = this.slash.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += this.slash.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += this.slash.width;
                    break;
            }
            return pos;
        }
        return this.noteNumbers ? this.noteNumbers.getNoteX(note, requestedPosition) : 0;
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.noteNumbers ? this.noteNumbers.getNoteY(note, requestedPosition) : 0;
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        const g = this.restGlyph;
        if (g) {
            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                    return g.getBoundingBoxTop() - this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
                case NoteYPosition.Top:
                    return g.getBoundingBoxTop();
                case NoteYPosition.Center:
                case NoteYPosition.StemUp:
                case NoteYPosition.StemDown:
                    return g.getBoundingBoxTop() + g.height / 2;
                case NoteYPosition.Bottom:
                    return g.getBoundingBoxTop();
                case NoteYPosition.BottomWithStem:
                    return g.getBoundingBoxBottom() + this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
            }
        }
        return 0;
    }

    public override getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this.noteNumbers ? this.noteNumbers.getLowestNoteY(requestedPosition) : 0;
    }

    public override getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this.noteNumbers ? this.noteNumbers.getHighestNoteY(requestedPosition) : 0;
    }

    public override buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteNumbers) {
            this.noteNumbers.buildBoundingsLookup(beatBounds, cx + this.x, cy + this.y);
        }
    }

    public override doLayout(): void {
        const tabRenderer: TabBarRenderer = this.renderer as TabBarRenderer;

        const centeredEffectGlyphs: Glyph[] = [];
        if (!this.container.beat.isRest) {
            //
            // Note numbers
            const isGrace: boolean =
                this.renderer.settings.notation.smallGraceTabNotes && this.container.beat.graceType !== GraceType.None;

            let beatEffects: Map<string, Glyph>;

            if (this.container.beat.slashed && !this.container.beat.notes.some(x => x.isTieDestination as boolean)) {
                const line = Math.floor((this.renderer.bar.staff.tuning.length - 1) / 2);
                const slashY = tabRenderer.getLineY(line);
                const slashNoteHead = new SlashNoteHeadGlyph(0, slashY, this.container.beat);
                slashNoteHead.noteHeadElement = NoteSubElement.GuitarTabFretNumber;
                slashNoteHead.effectElement = BeatSubElement.GuitarTabEffects;
                this.slash = slashNoteHead;
                slashNoteHead.beat = this.container.beat;
                this.addNormal(slashNoteHead);
                beatEffects = slashNoteHead.beatEffects;
            } else {
                const tabNoteNumbers = new TabNoteChordGlyph(0, 0, isGrace);
                this.noteNumbers = tabNoteNumbers;
                tabNoteNumbers.beat = this.container.beat;
                for (const note of this.container.beat.notes) {
                    if (note.isVisible) {
                        this._createNoteGlyph(note);
                    }
                }
                this.addNormal(tabNoteNumbers);
                beatEffects = tabNoteNumbers.beatEffects;
            }

            //
            // Tremolo Picking
            if (this.container.beat.isTremolo && !beatEffects.has('tremolo')) {
                const speed = this.container.beat.tremoloSpeed!;
                const glyph = new TremoloPickingGlyph(0, 0, speed);
                glyph.offsetY = this.renderer.smuflMetrics.glyphTop.get(glyph.symbol)!;
                beatEffects.set('tremolo', glyph);
                centeredEffectGlyphs.push(glyph);
            }

            //
            // Note dots
            //
            if (this.container.beat.dots > 0 && tabRenderer.rhythmMode !== TabRhythmMode.Hidden) {
                const y: number = this.getNoteY(this.container.beat.maxNote!, NoteYPosition.BottomWithStem);

                for (let i: number = 0; i < this.container.beat.dots; i++) {
                    this.addEffect(new AugmentationDotGlyph(0, y));
                }
            }
        } else {
            const line = Math.floor((this.renderer.bar.staff.tuning.length - 1) / 2);
            const y: number = tabRenderer.getLineY(line);
            const restGlyph = new TabRestGlyph(0, y, tabRenderer.showRests, this.container.beat.duration);
            this.restGlyph = restGlyph;
            restGlyph.beat = this.container.beat;
            this.addNormal(restGlyph);
            //
            // Note dots
            //
            if (this.container.beat.dots > 0 && tabRenderer.showRests) {
                for (let i: number = 0; i < this.container.beat.dots; i++) {
                    this.addEffect(new AugmentationDotGlyph(0, y));
                }
            }
        }
        // left to right layout
        if (this.isEmpty) {
            return;
        }
        let w: number = 0;
        for (let i: number = 0, j: number = this.glyphs!.length; i < j; i++) {
            const g: Glyph = this.glyphs![i];
            g.x = w;
            g.renderer = this.renderer;
            g.doLayout();
            w += g.width;
        }
        this.width = w;
        this.computedWidth = w;
        if (this.container.beat.isEmpty) {
            this.onTimeX = this.width / 2;
        } else if (this.restGlyph) {
            this.onTimeX = this.restGlyph!.x + this.restGlyph!.width / 2;
        } else if (this.noteNumbers) {
            this.onTimeX = this.noteNumbers!.x + this.noteNumbers!.noteStringWidth / 2;
        } else if (this.slash) {
            this.onTimeX = this.slash!.x + this.slash!.width / 2;
        }
        this.middleX = this.onTimeX;
        this.stemX = this.middleX;

        for (const g of centeredEffectGlyphs) {
            g.x = this.onTimeX;
        }
    }

    private _createNoteGlyph(n: Note): void {
        const tr: TabBarRenderer = this.renderer as TabBarRenderer;
        const noteNumberGlyph: NoteNumberGlyph = new NoteNumberGlyph(0, 0, n);
        const l: number = tr.getNoteLine(n);
        noteNumberGlyph.y = tr.getLineY(l);
        noteNumberGlyph.renderer = this.renderer;
        noteNumberGlyph.doLayout();
        this.noteNumbers!.addNoteGlyph(noteNumberGlyph, n);
        const topY = noteNumberGlyph.getBoundingBoxTop();
        const bottomY = noteNumberGlyph.getBoundingBoxBottom();

        this.renderer.collisionHelper.reserveBeatSlot(this.container.beat, topY, bottomY);

        const minString = tr.minString;
        const maxString = tr.maxString;
        if (Number.isNaN(minString) || minString < n.string) {
            tr.minString = l;
        }
        if (Number.isNaN(maxString) || maxString > n.string) {
            tr.maxString = l;
        }
    }
}
