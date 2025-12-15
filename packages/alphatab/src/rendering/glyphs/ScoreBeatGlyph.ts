import { Logger } from '@coderline/alphatab/Logger';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { TechniqueSymbolPlacement } from '@coderline/alphatab/model/InstrumentArticulation';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeamDirection } from '@coderline/alphatab/rendering/_barrel';
import { type NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AccentuationGlyph } from '@coderline/alphatab/rendering/glyphs/AccentuationGlyph';
import { ArticStaccatoAboveGlyph } from '@coderline/alphatab/rendering/glyphs/ArticStaccatoAboveGlyph';
import { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { DeadNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/DeadNoteHeadGlyph';
import { DiamondNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/DiamondNoteHeadGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { GhostNoteContainerGlyph } from '@coderline/alphatab/rendering/glyphs/GhostNoteContainerGlyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { GuitarGolpeGlyph } from '@coderline/alphatab/rendering/glyphs/GuitarGolpeGlyph';
import { NoteHeadGlyph, type NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { PercussionNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/PercussionNoteHeadGlyph';
import { PickStrokeGlyph } from '@coderline/alphatab/rendering/glyphs/PickStrokeGlyph';
import { PictEdgeOfCymbalGlyph } from '@coderline/alphatab/rendering/glyphs/PictEdgeOfCymbalGlyph';
import { ScoreNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreNoteChordGlyph';
import { ScoreRestGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreRestGlyph';
import { ScoreWhammyBarGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreWhammyBarGlyph';
import { SlashNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/SlashNoteHeadGlyph';
import { StringNumberContainerGlyph } from '@coderline/alphatab/rendering/glyphs/StringNumberContainerGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ScoreBeatContainerGlyph } from '@coderline/alphatab/rendering/ScoreBeatContainerGlyph';
import { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ScoreBeatGlyph extends BeatOnNoteGlyphBase {
    private _collisionOffset: number = Number.NaN;
    private _skipPaint: boolean = false;
    private _whammy?: ScoreWhammyBarGlyph;

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

    public override getBoundingBoxTop(): number {
        let y = this.y;
        if (this.noteHeads) {
            y = this.noteHeads.getBoundingBoxTop();
        } else if (this.restGlyph) {
            y = this.restGlyph.getBoundingBoxTop();
        }

        if (this._whammy?.hasBoundingBox) {
            y = Math.min(y, this._whammy.getBoundingBoxTop());
        }
        return y;
    }

    public override getBoundingBoxBottom(): number {
        let y = this.y + this.height;
        if (this.noteHeads) {
            y = this.noteHeads.getBoundingBoxBottom();
        } else if (this.restGlyph) {
            y = this.restGlyph.getBoundingBoxBottom();
        }

        if (this._whammy?.hasBoundingBox) {
            y = Math.max(y, this._whammy.getBoundingBoxBottom());
        }
        return y;
    }

    public override getLowestNoteY(): number {
        return this.noteHeads ? this.noteHeads.getLowestNoteY() : 0;
    }

    public override getHighestNoteY(): number {
        return this.noteHeads ? this.noteHeads.getHighestNoteY() : 0;
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.noteHeads ? this.noteHeads.getNoteY(note, requestedPosition) : 0;
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        const g = this.restGlyph;
        if (g) {
            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                case NoteYPosition.Top:
                    return g.getBoundingBoxTop();
                case NoteYPosition.Center:
                case NoteYPosition.StemUp:
                case NoteYPosition.StemDown:
                    return g.getBoundingBoxTop() + g.height / 2;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    return g.getBoundingBoxBottom();
            }
        }
        return 0;
    }

    public applyRestCollisionOffset() {
        if (!this.restGlyph) {
            return;
        }
        if (Number.isNaN(this._collisionOffset)) {
            this._collisionOffset = this.renderer.collisionHelper.applyRestCollisionOffset(
                this.container.beat,
                this.restGlyph.y,
                (this.renderer as ScoreBarRenderer).getScoreHeight(1)
            );
            this.y += this._collisionOffset;
            const existingRests = this.renderer.collisionHelper.restDurationsByDisplayTime;
            if (
                existingRests.has(this.container.beat.playbackStart) &&
                existingRests.get(this.container.beat.playbackStart)!.has(this.container.beat.playbackDuration) &&
                existingRests.get(this.container.beat.playbackStart)!.get(this.container.beat.playbackDuration) !==
                    this.container.beat.id
            ) {
                this._skipPaint = true;
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._skipPaint) {
            super.paint(cx, cy, canvas);
        }
    }

    public doMultiVoiceLayout(): void {
        this.applyRestCollisionOffset();
        this.noteHeads?.doMultiVoiceLayout();
        this._whammy?.doMultiVoiceLayout();

        let w: number = 0;
        if (this.glyphs) {
            for (const g of this.glyphs) {
                g.x = w;
                w += g.width;
            }
        }
        this.width = w;
        this.computedWidth = w;

        this._updatePositions();
    }

    public override doLayout(): void {
        this._createGlyphs();
        super.doLayout();
        this._updatePositions();
    }

    private _updatePositions() {
        if (this.container.beat.isEmpty) {
            this.onTimeX = this.width / 2;
            this.middleX = this.onTimeX;
            this.stemX = this.middleX;
        } else if (this.restGlyph) {
            this.onTimeX = this.restGlyph!.x + this.restGlyph!.width / 2;
            this.middleX = this.onTimeX;
            this.stemX = this.middleX;
        } else if (this.noteHeads) {
            this.onTimeX = this.noteHeads!.x + this.noteHeads!.onTimeX;
            this.middleX = this.noteHeads!.x + this.noteHeads!.width / 2;
            this.stemX = this.noteHeads!.x + this.noteHeads!.stemX;
        }
    }

    private _createGlyphs() {
        if (this.container.beat.isEmpty) {
            return;
        }

        if (!this.container.beat.isRest) {
            this._createNoteGlyphs();
        } else {
            this._createRestGlyphs();
        }
    }

    private _createNoteGlyphs() {
        const sr = this.renderer as ScoreBarRenderer;

        //
        // Note heads
        const noteHeads = new ScoreNoteChordGlyph();
        this.noteHeads = noteHeads;
        noteHeads.beat = this.container.beat;
        const ghost = new GhostNoteContainerGlyph(false);
        ghost.renderer = this.renderer;

        for (const note of this.container.beat.notes) {
            if (note.isVisible && (!note.beat.slashed || note.index === 0)) {
                this._createNoteGlyph(note);
                ghost.addParenthesis(note);
            }
        }

        this.addNormal(noteHeads);
        if (!ghost.isEmpty) {
            this.addEffect(ghost);
        }

        //
        // Whammy Bar
        if (this.container.beat.hasWhammyBar) {
            const whammy: ScoreWhammyBarGlyph = new ScoreWhammyBarGlyph(this.container as ScoreBeatContainerGlyph);
            this._whammy = whammy;
            whammy.renderer = this.renderer;
            whammy.doLayout();
            this.container.addTie(whammy);
        }
        //
        // Note dots
        if (this.container.beat.dots > 0) {
            for (let i: number = 0; i < this.container.beat.dots; i++) {
                const group: GlyphGroup = new GlyphGroup(0, 0);
                group.renderer = this.renderer;
                for (const note of this.container.beat.notes) {
                    const g = this._createBeatDot(sr.getNoteSteps(note), group);
                    g.colorOverride = ElementStyleHelper.noteColor(
                        sr.resources,
                        NoteSubElement.StandardNotationEffects,
                        note
                    );
                }
                this.addEffect(group);
            }
        }
    }

    private _createRestGlyphs() {
        const sr = this.renderer as ScoreBarRenderer;

        let steps = Math.ceil((this.renderer.bar.staff.standardNotationLineCount - 1) / 2) * 2;

        // this positioning is quite strange, for most staff line counts
        // the whole/rest are aligned as half below the whole rest.
        // but for staff line count 1 and 3 they are aligned centered on the same line.
        if (
            this.container.beat.duration === Duration.Whole &&
            this.renderer.bar.staff.standardNotationLineCount !== 1 &&
            this.renderer.bar.staff.standardNotationLineCount !== 3
        ) {
            steps -= 2;
        }

        const restGlyph = new ScoreRestGlyph(0, sr.getScoreY(steps), this.container.beat.duration);
        this.restGlyph = restGlyph;
        restGlyph.beat = this.container.beat;
        this.addNormal(restGlyph);

        if (this.renderer.bar.isMultiVoice) {
            if (this.container.beat.voice.index === 0) {
                const restSizes = BeamingHelper.computeLineHeightsForRest(this.container.beat.duration);
                const restTop = restGlyph.y - sr.getScoreHeight(restSizes[0]);
                const restBottom = restGlyph.y + sr.getScoreHeight(restSizes[1]);
                this.renderer.collisionHelper.reserveBeatSlot(this.container.beat, restTop, restBottom);
            } else {
                this.renderer.collisionHelper.registerRest(this.container.beat);
            }
        }

        //
        // Note dots
        //
        if (this.container.beat.dots > 0) {
            for (let i: number = 0; i < this.container.beat.dots; i++) {
                const group: GlyphGroup = new GlyphGroup(0, 0);
                group.renderer = this.renderer;
                this._createBeatDot(steps, group);
                this.addEffect(group);
            }
        }
    }

    private _createBeatDot(line: number, group: GlyphGroup) {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const g = new AugmentationDotGlyph(0, sr.getScoreY(line));
        group.addGlyph(g);
        return g;
    }

    private _createNoteHeadGlyph(n: Note): NoteHeadGlyphBase {
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

        if (n.beat.slashed) {
            return new SlashNoteHeadGlyph(0, 0, n.beat.duration, isGrace, n.beat);
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

    private _createNoteGlyph(n: Note): void {
        if (n.beat.graceType === GraceType.BendGrace && !n.hasBend) {
            return;
        }
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const noteHeadGlyph = this._createNoteHeadGlyph(n);
        noteHeadGlyph.colorOverride = ElementStyleHelper.noteColor(
            sr.resources,
            NoteSubElement.StandardNotationNoteHead,
            n
        );

        // calculate y position
        let steps: number;
        if (n.beat.slashed) {
            steps = sr.heightLineCount - 1;
        } else {
            steps = sr.getNoteSteps(n);
        }

        noteHeadGlyph.y = sr.getScoreY(steps);
        this.noteHeads!.addMainNoteGlyph(noteHeadGlyph, n, steps);

        if (!n.beat.slashed && n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            // create harmonic note head.
            const harmonicFret: number = n.displayValue + n.harmonicPitch;
            const harmonicsGlyph = new DiamondNoteHeadGlyph(
                0,
                0,
                n.beat.duration,
                this.container.beat.graceType !== GraceType.None
            );
            harmonicsGlyph.colorOverride = noteHeadGlyph.colorOverride;
            steps = sr.accidentalHelper.getNoteStepsForValue(harmonicFret, false);
            harmonicsGlyph.y = sr.getScoreY(steps);
            this.noteHeads!.addEffectNoteGlyph(harmonicsGlyph, steps);
        }

        const belowBeatEffects = this.noteHeads!.belowBeatEffects;
        const aboveBeatEffects = this.noteHeads!.aboveBeatEffects;
        const outsideBeatEffects: Map<string, EffectGlyph> =
            this.renderer.getBeatDirection(this.container.beat) === BeamDirection.Up
                ? this.noteHeads!.belowBeatEffects
                : this.noteHeads!.aboveBeatEffects;

        if (n.isStaccato && !belowBeatEffects.has('Staccato')) {
            outsideBeatEffects.set('Staccato', new ArticStaccatoAboveGlyph(0, 0));
        }
        if (n.accentuated === AccentuationType.Normal && !belowBeatEffects.has('Accent')) {
            outsideBeatEffects.set('Accent', new AccentuationGlyph(0, 0, n));
        }
        if (n.accentuated === AccentuationType.Heavy && !belowBeatEffects.has('HAccent')) {
            outsideBeatEffects.set('HAccent', new AccentuationGlyph(0, 0, n));
        }
        if (n.accentuated === AccentuationType.Tenuto && !belowBeatEffects.has('Tenuto')) {
            outsideBeatEffects.set('Tenuto', new AccentuationGlyph(0, 0, n));
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
            if (articulation && articulation.techniqueSymbolPlacement !== TechniqueSymbolPlacement.Inside) {
                let effectContainer: Map<string, EffectGlyph>;

                switch (articulation.techniqueSymbolPlacement) {
                    case TechniqueSymbolPlacement.Above:
                        effectContainer = this.noteHeads!.aboveBeatEffects;
                        break;
                    case TechniqueSymbolPlacement.Below:
                        effectContainer = this.noteHeads!.belowBeatEffects;
                        break;
                    case TechniqueSymbolPlacement.Outside:
                        effectContainer = outsideBeatEffects;
                        break;
                    default:
                        return;
                }

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
                        effectContainer.set('GuitarGolpe', new GuitarGolpeGlyph(0, 0, true));
                        break;
                }
            }
        }
    }
}
