import { AccentuationType } from '@src/model/AccentuationType';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { type Note, NoteSubElement } from '@src/model/Note';
import { AccentuationGlyph } from '@src/rendering/glyphs/AccentuationGlyph';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { CircleGlyph } from '@src/rendering/glyphs/CircleGlyph';
import { DeadNoteHeadGlyph } from '@src/rendering/glyphs/DeadNoteHeadGlyph';
import { DiamondNoteHeadGlyph } from '@src/rendering/glyphs/DiamondNoteHeadGlyph';
import { GhostNoteContainerGlyph } from '@src/rendering/glyphs/GhostNoteContainerGlyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ScoreNoteChordGlyph } from '@src/rendering/glyphs/ScoreNoteChordGlyph';
import { ScoreRestGlyph } from '@src/rendering/glyphs/ScoreRestGlyph';
import { ScoreWhammyBarGlyph } from '@src/rendering/glyphs/ScoreWhammyBarGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import type { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PercussionNoteHeadGlyph } from '@src/rendering/glyphs/PercussionNoteHeadGlyph';
import { Logger } from '@src/Logger';
import { ArticStaccatoAboveGlyph } from '@src/rendering/glyphs/ArticStaccatoAboveGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { PictEdgeOfCymbalGlyph } from '@src/rendering/glyphs/PictEdgeOfCymbalGlyph';
import { PickStrokeGlyph } from '@src/rendering/glyphs/PickStrokeGlyph';
import { PickStroke } from '@src/model/PickStroke';
import { GuitarGolpeGlyph } from '@src/rendering/glyphs/GuitarGolpeGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { StringNumberContainerGlyph } from '@src/rendering/glyphs/StringNumberContainerGlyph';
import { SlashNoteHeadGlyph } from '@src/rendering/glyphs/SlashNoteHeadGlyph';
import { BeatSubElement } from '@src/model/Beat';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import type { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export class ScoreBeatGlyph extends BeatOnNoteGlyphBase {
    private _collisionOffset: number = -1000;
    private _skipPaint: boolean = false;

    public slash: SlashNoteHeadGlyph | null = null;
    public noteHeads: ScoreNoteChordGlyph | null = null;
    public restGlyph: ScoreRestGlyph | null = null;

    protected override get effectElement() {
        return BeatSubElement.StandardNotationEffects;
    }

    public override getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return this.noteHeads ? this.noteHeads.getNoteX(note, requestedPosition) : 0;
    }

    public override buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteHeads) {
            this.noteHeads.buildBoundingsLookup(beatBounds, cx + this.x, cy + this.y);
        }
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.noteHeads ? this.noteHeads.getNoteY(note, requestedPosition) : 0;
    }

    public override updateBeamingHelper(): void {
        if (this.noteHeads) {
            this.noteHeads.updateBeamingHelper(this.container.x + this.x);
        } else if (this.restGlyph) {
            this.restGlyph.updateBeamingHelper(this.container.x + this.x);
            if (this.renderer.bar.isMultiVoice && this._collisionOffset === -1000) {
                this._collisionOffset = this.renderer.helpers.collisionHelper.applyRestCollisionOffset(
                    this.container.beat,
                    this.restGlyph.y,
                    (this.renderer as ScoreBarRenderer).getScoreHeight(1)
                );
                this.y += this._collisionOffset;
                const existingRests = this.renderer.helpers.collisionHelper.restDurationsByDisplayTime;
                if (
                    existingRests.has(this.container.beat.playbackStart) &&
                    existingRests.get(this.container.beat.playbackStart)!.has(this.container.beat.playbackDuration) &&
                    existingRests.get(this.container.beat.playbackStart)!.get(this.container.beat.playbackDuration) !==
                        this.container.beat.id
                ) {
                    this._skipPaint = true;
                }
            }
        } else if (this.slash) {
            this.slash.updateBeamingHelper(this.container.x + this.x);
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._skipPaint) {
            super.paint(cx, cy, canvas);
        }
    }

    public override doLayout(): void {
        // create glyphs
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        if (!this.container.beat.isEmpty) {
            if (!this.container.beat.isRest) {
                if (this.container.beat.slashed) {
                    const isGrace = this.container.beat.graceType !== GraceType.None;
                    const line = (sr.heightLineCount - 1) / 2;
                    const slashY = sr.getLineY(line);
                    const slashNoteHead = new SlashNoteHeadGlyph(
                        0,
                        slashY,
                        this.container.beat.duration,
                        isGrace,
                        this.container.beat
                    );
                    slashNoteHead.noteHeadElement = NoteSubElement.StandardNotationNoteHead;
                    slashNoteHead.effectElement = BeatSubElement.StandardNotationEffects;
                    this.slash = slashNoteHead;
                    slashNoteHead.beat = this.container.beat;
                    slashNoteHead.beamingHelper = this.beamingHelper;
                    this.addNormal(slashNoteHead);
                } else {
                    //
                    // Note heads
                    //
                    const noteHeads = new ScoreNoteChordGlyph();
                    this.noteHeads = noteHeads;
                    noteHeads.beat = this.container.beat;
                    noteHeads.beamingHelper = this.beamingHelper;
                    const ghost: GhostNoteContainerGlyph = new GhostNoteContainerGlyph(false);
                    ghost.renderer = this.renderer;
                    for (const note of this.container.beat.notes) {
                        if (note.isVisible) {
                            this.createNoteGlyph(note);
                            ghost.addParenthesis(note);
                        }
                    }
                    this.addNormal(noteHeads);
                    if (!ghost.isEmpty) {
                        this.addNormal(
                            new SpacingGlyph(
                                0,
                                0,
                                4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                            )
                        );
                        this.addEffect(ghost);
                    }
                }

                //
                // Whammy Bar
                if (this.container.beat.hasWhammyBar) {
                    const whammy: ScoreWhammyBarGlyph = new ScoreWhammyBarGlyph(this.container.beat);
                    whammy.renderer = this.renderer;
                    whammy.doLayout();
                    this.container.ties.push(whammy);
                }
                //
                // Note dots
                //
                if (this.container.beat.dots > 0) {
                    this.addNormal(new SpacingGlyph(0, 0, 5));
                    for (let i: number = 0; i < this.container.beat.dots; i++) {
                        const group: GlyphGroup = new GlyphGroup(0, 0);
                        group.renderer = this.renderer;
                        for (const note of this.container.beat.notes) {
                            const g = this.createBeatDot(sr.getNoteLine(note), group);
                            g.colorOverride = ElementStyleHelper.noteColor(
                                sr.resources,
                                NoteSubElement.StandardNotationEffects,
                                note
                            );
                        }
                        this.addEffect(group);
                    }
                }
            } else {
                let line = Math.ceil((this.renderer.bar.staff.standardNotationLineCount - 1) / 2) * 2;

                // this positioning is quite strange, for most staff line counts
                // the whole/rest are aligned as half below the whole rest.
                // but for staff line count 1 and 3 they are aligned centered on the same line.
                if (
                    this.container.beat.duration === Duration.Whole &&
                    this.renderer.bar.staff.standardNotationLineCount !== 1 &&
                    this.renderer.bar.staff.standardNotationLineCount !== 3
                ) {
                    line -= 2;
                }

                const restGlyph = new ScoreRestGlyph(0, sr.getScoreY(line), this.container.beat.duration);
                this.restGlyph = restGlyph;
                restGlyph.beat = this.container.beat;
                restGlyph.beamingHelper = this.beamingHelper;
                this.addNormal(restGlyph);

                if (this.renderer.bar.isMultiVoice) {
                    if (this.container.beat.voice.index === 0) {
                        const restSizes = BeamingHelper.computeLineHeightsForRest(this.container.beat.duration);
                        const restTop = restGlyph.y - sr.getScoreHeight(restSizes[0]);
                        const restBottom = restGlyph.y + sr.getScoreHeight(restSizes[1]);
                        this.renderer.helpers.collisionHelper.reserveBeatSlot(this.container.beat, restTop, restBottom);
                    } else {
                        this.renderer.helpers.collisionHelper.registerRest(this.container.beat);
                    }
                }

                if (this.beamingHelper) {
                    this.beamingHelper.applyRest(this.container.beat, line);
                }

                //
                // Note dots
                //
                if (this.container.beat.dots > 0) {
                    this.addNormal(new SpacingGlyph(0, 0, 5));
                    for (let i: number = 0; i < this.container.beat.dots; i++) {
                        const group: GlyphGroup = new GlyphGroup(0, 0);
                        group.renderer = this.renderer;
                        this.createBeatDot(line, group);
                        this.addEffect(group);
                    }
                }
            }
        }
        super.doLayout();
        if (this.container.beat.isEmpty) {
            this.centerX = this.width / 2;
        } else if (this.restGlyph) {
            this.centerX = this.restGlyph!.x + this.restGlyph!.width / 2;
        } else if (this.noteHeads) {
            this.centerX = this.noteHeads!.x + this.noteHeads!.width / 2;
        } else if (this.slash) {
            this.centerX = this.slash!.x + this.slash!.width / 2;
        }
    }

    private createBeatDot(line: number, group: GlyphGroup) {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const g = new CircleGlyph(0, sr.getScoreY(line), 1.5);
        group.addGlyph(g);
        return g;
    }

    private createNoteHeadGlyph(n: Note): MusicFontGlyph {
        const isGrace: boolean = this.container.beat.graceType !== GraceType.None;

        const style = n.style;
        if (style?.noteHead !== undefined) {
            const noteHead = new NoteHeadGlyph(0, 0, n.beat.duration, isGrace);
            // NOTE: sizes are not yet perfect
            // will be done in https://github.com/CoderLine/alphaTab/issues/1949
            noteHead.symbol = style!.noteHead!;
            if (style.noteHeadCenterOnStem) {
                noteHead.centerOnStem = true;
            }
            return noteHead;
        }

        // TODO: here we should unify it to one common glyph which knows all sizes.

        if (n.beat.voice.bar.staff.isPercussion) {
            const articulation = PercussionMapper.getArticulation(n);
            if (articulation) {
                return new PercussionNoteHeadGlyph(0, 0, articulation, n.beat.duration, isGrace);
            }
            Logger.warning('Rendering', `No articulation found for percussion instrument ${n.percussionArticulation}`);
        }
        if (n.isDead) {
            return new DeadNoteHeadGlyph(0, 0, isGrace);
        }
        if (n.beat.graceType === GraceType.BendGrace) {
            return new NoteHeadGlyph(0, 0, Duration.Quarter, true);
        }
        if (n.harmonicType === HarmonicType.Natural) {
            return new DiamondNoteHeadGlyph(0, 0, n.beat.duration, isGrace);
        }

        return new NoteHeadGlyph(0, 0, n.beat.duration, isGrace);
    }

    private createNoteGlyph(n: Note): void {
        if (n.beat.graceType === GraceType.BendGrace && !n.hasBend) {
            return;
        }
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const noteHeadGlyph = this.createNoteHeadGlyph(n);
        noteHeadGlyph.colorOverride = ElementStyleHelper.noteColor(
            sr.resources,
            NoteSubElement.StandardNotationNoteHead,
            n
        );

        // calculate y position
        let line: number = sr.getNoteLine(n);
        noteHeadGlyph.y = sr.getScoreY(line);
        this.noteHeads!.addNoteGlyph(noteHeadGlyph, n, line);
        if (n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            // create harmonic note head.
            const harmonicFret: number = n.displayValue + n.harmonicPitch;
            const harmonicsGlyph = new DiamondNoteHeadGlyph(
                0,
                0,
                n.beat.duration,
                this.container.beat.graceType !== GraceType.None
            );
            harmonicsGlyph.colorOverride = noteHeadGlyph.colorOverride;
            line = sr.accidentalHelper.getNoteLineForValue(harmonicFret, false);
            harmonicsGlyph.y = sr.getScoreY(line);
            this.noteHeads!.addNoteGlyph(harmonicsGlyph, n, line);
        }

        const belowBeatEffects = this.noteHeads!.belowBeatEffects;
        const aboveBeatEffects = this.noteHeads!.aboveBeatEffects;

        if (n.isStaccato && !belowBeatEffects.has('Staccato')) {
            belowBeatEffects.set('Staccato', new ArticStaccatoAboveGlyph(0, 0));
        }
        if (n.accentuated === AccentuationType.Normal && !belowBeatEffects.has('Accent')) {
            belowBeatEffects.set('Accent', new AccentuationGlyph(0, 0, n));
        }
        if (n.accentuated === AccentuationType.Heavy && !belowBeatEffects.has('HAccent')) {
            belowBeatEffects.set('HAccent', new AccentuationGlyph(0, 0, n));
        }
        if (n.accentuated === AccentuationType.Tenuto && !belowBeatEffects.has('Tenuto')) {
            belowBeatEffects.set('Tenuto', new AccentuationGlyph(0, 0, n));
        }
        if (n.showStringNumber && n.isStringed) {
            let container: StringNumberContainerGlyph;
            if (!aboveBeatEffects.has('StringNumber')) {
                container = new StringNumberContainerGlyph(0, 0);
                aboveBeatEffects.set('StringNumber', container);
            } else {
                container = aboveBeatEffects.get('StringNumber')! as StringNumberContainerGlyph;
            }
            container.addString(n.string);
        }
        if (n.isPercussion) {
            const articulation = PercussionMapper.getArticulation(n);
            if (articulation && articulation.techniqueSymbolPlacement !== TextBaseline.Middle) {
                const effectContainer =
                    articulation.techniqueSymbolPlacement === TextBaseline.Top
                        ? this.noteHeads!.aboveBeatEffects
                        : this.noteHeads!.belowBeatEffects;

                switch (articulation.techniqueSymbol) {
                    case MusicFontSymbol.PictEdgeOfCymbal:
                        effectContainer.set('PictEdgeOfCymbal', new PictEdgeOfCymbalGlyph(0, 0));
                        break;
                    case MusicFontSymbol.ArticStaccatoAbove:
                        effectContainer.set('ArticStaccatoAbove', new ArticStaccatoAboveGlyph(0, 0));
                        break;
                    case MusicFontSymbol.StringsUpBow:
                        effectContainer.set('StringsUpBow', new PickStrokeGlyph(0, 0, PickStroke.Up));
                        break;
                    case MusicFontSymbol.StringsDownBow:
                        effectContainer.set('StringsDownBow', new PickStrokeGlyph(0, 0, PickStroke.Down));
                        break;
                    case MusicFontSymbol.GuitarGolpe:
                        effectContainer.set('GuitarGolpe', new GuitarGolpeGlyph(0, 0));
                        break;
                }
            }
        }
    }
}
