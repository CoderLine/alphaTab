import { AccentuationType } from '@src/model/AccentuationType';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { AccentuationGlyph } from '@src/rendering/glyphs/AccentuationGlyph';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { CircleGlyph } from '@src/rendering/glyphs/CircleGlyph';
import { DeadNoteHeadGlyph } from '@src/rendering/glyphs/DeadNoteHeadGlyph';
import { DiamondNoteHeadGlyph } from '@src/rendering/glyphs/DiamondNoteHeadGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { GhostNoteContainerGlyph } from '@src/rendering/glyphs/GhostNoteContainerGlyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ScoreNoteChordGlyph } from '@src/rendering/glyphs/ScoreNoteChordGlyph';
import { ScoreRestGlyph } from '@src/rendering/glyphs/ScoreRestGlyph';
import { ScoreWhammyBarGlyph } from '@src/rendering/glyphs/ScoreWhammyBarGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NoteXPosition, NoteYPosition } from '../BarRendererBase';
import { BeatBounds } from '../utils/BeatBounds';
import { PercussionMapper } from '../utils/PercussionMapper';
import { PercussionNoteHeadGlyph } from './PercussionNoteHeadGlyph';
import { Logger } from '@src/alphatab';
import { ArticStaccatoAboveGlyph } from './ArticStaccatoAboveGlyph';
import { MusicFontSymbol } from './MusicFontSymbol';
import { TextBaseline } from '@src/platform/ICanvas';
import { PictEdgeOfCymbalGlyph } from './PictEdgeOfCymbalGlyph';
import { PickStrokeGlyph } from './PickStrokeGlyph';
import { PickStroke } from '@src/model/PickStroke';
import { GuitarGolpeGlyph } from './GuitarGolpeGlyph';

export class ScoreBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: ScoreNoteChordGlyph | null = null;
    public restGlyph: ScoreRestGlyph | null = null;

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return this.noteHeads ? this.noteHeads.getNoteX(note, requestedPosition) : 0;
    }

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteHeads) {
            this.noteHeads.buildBoundingsLookup(beatBounds, cx + this.x, cy + this.y);
        }
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.noteHeads ? this.noteHeads.getNoteY(note, requestedPosition) : 0;
    }

    public updateBeamingHelper(): void {
        if (this.noteHeads) {
            this.noteHeads.updateBeamingHelper(this.container.x + this.x);
        } else if (this.restGlyph) {
            this.restGlyph.updateBeamingHelper(this.container.x + this.x);
        }
    }

    public doLayout(): void {
        // create glyphs
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        if (!this.container.beat.isEmpty) {
            if (!this.container.beat.isRest) {
                //
                // Note heads
                //
                this.noteHeads = new ScoreNoteChordGlyph();
                this.noteHeads.beat = this.container.beat;
                this.noteHeads.beamingHelper = this.beamingHelper;
                let ghost: GhostNoteContainerGlyph = new GhostNoteContainerGlyph(false);
                ghost.renderer = this.renderer;
                for (let note of this.container.beat.notes) {
                    if (note.isVisible) {
                        this.createNoteGlyph(note);
                        ghost.addParenthesis(note);
                    }
                }
                this.addGlyph(this.noteHeads);
                if (!ghost.isEmpty) {
                    this.addGlyph(
                        new SpacingGlyph(
                            0,
                            0,
                            4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1) * this.scale
                        )
                    );
                    this.addGlyph(ghost);
                }
                //
                // Whammy Bar
                if (this.container.beat.hasWhammyBar) {
                    let whammy: ScoreWhammyBarGlyph = new ScoreWhammyBarGlyph(this.container.beat);
                    whammy.renderer = this.renderer;
                    whammy.doLayout();
                    this.container.ties.push(whammy);
                }
                //
                // Note dots
                //
                if (this.container.beat.dots > 0) {
                    this.addGlyph(new SpacingGlyph(0, 0, 5 * this.scale));
                    for (let i: number = 0; i < this.container.beat.dots; i++) {
                        let group: GlyphGroup = new GlyphGroup(0, 0);
                        for (let note of this.container.beat.notes) {
                            this.createBeatDot(sr.getNoteLine(note), group);
                        }
                        this.addGlyph(group);
                    }
                }
            } else {
                let dotLine: number = 0;
                let line: number = 0;
                let offset: number = 0;
                switch (this.container.beat.duration) {
                    case Duration.QuadrupleWhole:
                        line = 6;
                        dotLine = 5;
                        break;
                    case Duration.DoubleWhole:
                        line = 6;
                        dotLine = 5;
                        break;
                    case Duration.Whole:
                        line = 4;
                        dotLine = 5;
                        break;
                    case Duration.Half:
                        line = 6;
                        dotLine = 5;
                        break;
                    case Duration.Quarter:
                        line = 6;
                        offset = -2;
                        dotLine = 5;
                        break;
                    case Duration.Eighth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case Duration.Sixteenth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case Duration.ThirtySecond:
                        line = 6;
                        dotLine = 3;
                        break;
                    case Duration.SixtyFourth:
                        line = 6;
                        dotLine = 3;
                        break;
                    case Duration.OneHundredTwentyEighth:
                        line = 6;
                        dotLine = 3;
                        break;
                    case Duration.TwoHundredFiftySixth:
                        line = 6;
                        dotLine = 3;
                        break;
                }
                let y: number = sr.getScoreY(line, offset);
                this.restGlyph = new ScoreRestGlyph(0, y, this.container.beat.duration);
                this.restGlyph.beat = this.container.beat;
                this.restGlyph.beamingHelper = this.beamingHelper;
                this.addGlyph(this.restGlyph);
                //
                // Note dots
                //
                if (this.container.beat.dots > 0) {
                    this.addGlyph(new SpacingGlyph(0, 0, 5 * this.scale));
                    for (let i: number = 0; i < this.container.beat.dots; i++) {
                        let group: GlyphGroup = new GlyphGroup(0, 0);
                        this.createBeatDot(dotLine, group);
                        this.addGlyph(group);
                    }
                }
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

    private createBeatDot(line: number, group: GlyphGroup): void {
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        group.addGlyph(new CircleGlyph(0, sr.getScoreY(line, 0), 1.5 * this.scale));
    }

    private createNoteHeadGlyph(n: Note): EffectGlyph {
        let isGrace: boolean = this.container.beat.graceType !== GraceType.None;
        if (n.beat.voice.bar.staff.isPercussion) {
            const articulation = PercussionMapper.getArticulation(n.percussionMidiNumber);
            if (articulation) {
                return new PercussionNoteHeadGlyph(0, 0, articulation, n.beat.duration, isGrace);
            } else {
                Logger.warning('Rendering', `No articulation found for percussion instrument ${n.percussionMidiNumber}`)
            }
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
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let noteHeadGlyph: EffectGlyph = this.createNoteHeadGlyph(n);
        // calculate y position
        let line: number = sr.getNoteLine(n);
        noteHeadGlyph.y = sr.getScoreY(line, 0);
        this.noteHeads!.addNoteGlyph(noteHeadGlyph, n, line);
        if (n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            // create harmonic note head.
            let harmonicFret: number = n.displayValue + n.harmonicPitch;
            noteHeadGlyph = new DiamondNoteHeadGlyph(
                0,
                0,
                n.beat.duration,
                this.container.beat.graceType !== GraceType.None
            );
            line = sr.accidentalHelper.getNoteLineForValue(harmonicFret, false);
            noteHeadGlyph.y = sr.getScoreY(line, 0);
            this.noteHeads!.addNoteGlyph(noteHeadGlyph, n, line);
        }
        if (n.isStaccato && !this.noteHeads!.aboveBeatEffects.has('Staccato')) {
            this.noteHeads!.aboveBeatEffects.set('Staccato', new ArticStaccatoAboveGlyph(0, 0));
        }
        if (n.accentuated === AccentuationType.Normal && !this.noteHeads!.aboveBeatEffects.has('Accent')) {
            this.noteHeads!.aboveBeatEffects.set('Accent', new AccentuationGlyph(0, 0, AccentuationType.Normal));
        }
        if (n.accentuated === AccentuationType.Heavy && !this.noteHeads!.aboveBeatEffects.has('HAccent')) {
            this.noteHeads!.aboveBeatEffects.set('HAccent', new AccentuationGlyph(0, 0, AccentuationType.Heavy));
        }

        if (n.isPercussion) {
            const articulation = PercussionMapper.getArticulation(n.percussionMidiNumber);
            if (articulation && articulation.techniqueSymbolPlacement !== TextBaseline.Middle) {
                const effectContainer = articulation.techniqueSymbolPlacement === TextBaseline.Top
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
                        effectContainer.set('StringsUpBow', new PickStrokeGlyph(-3 * this.scale, 0, PickStroke.Up));
                        break;
                    case MusicFontSymbol.StringsDownBow:
                        effectContainer.set('StringsDownBow', new PickStrokeGlyph(-3 * this.scale, 0, PickStroke.Down));
                        break;
                    case MusicFontSymbol.GuitarGolpe:
                        effectContainer.set('GuitarGolpe', new GuitarGolpeGlyph(0, 0));
                        break;
                }
            }
        }
    }
}
