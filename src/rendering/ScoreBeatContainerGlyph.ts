import { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { ScoreBendGlyph } from '@src/rendering/glyphs/ScoreBendGlyph';
import { ScoreLegatoGlyph } from '@src/rendering/glyphs/ScoreLegatoGlyph';
import { ScoreSlideLineGlyph } from '@src/rendering/glyphs/ScoreSlideLineGlyph';
import { ScoreSlurGlyph } from '@src/rendering/glyphs/ScoreSlurGlyph';
import { ScoreTieGlyph } from '@src/rendering/glyphs/ScoreTieGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class ScoreBeatContainerGlyph extends BeatContainerGlyph {
    private _bend: ScoreBendGlyph | null = null;
    private _effectSlur: ScoreSlurGlyph | null = null;
    private _effectEndSlur: ScoreSlurGlyph | null = null;

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(beat, voiceContainer);
    }

    public doLayout(): void {
        this._effectSlur = null;
        this._effectEndSlur = null;
        super.doLayout();
        if (this.beat.isLegatoOrigin) {
            // only create slur for very first origin of "group"
            if (!this.beat.previousBeat || !this.beat.previousBeat.isLegatoOrigin) {
                // tie with end beat
                let destination: Beat = this.beat.nextBeat!;
                while (destination.nextBeat && destination.nextBeat.isLegatoDestination) {
                    destination = destination.nextBeat;
                }
                this.ties.push(new ScoreLegatoGlyph(this.beat, destination, false));
            }
        } else if (this.beat.isLegatoDestination) {
            // only create slur for last destination of "group"
            if (!this.beat.isLegatoOrigin) {
                let origin: Beat = this.beat.previousBeat!;
                while (origin.previousBeat && origin.previousBeat.isLegatoOrigin) {
                    origin = origin.previousBeat;
                }
                this.ties.push(new ScoreLegatoGlyph(origin, this.beat, true));
            }
        }
        if (this._bend) {
            this._bend.renderer = this.renderer;
            this._bend.doLayout();
            this.updateWidth();
        }
    }

    protected createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }
        // NOTE: we create 2 tie glyphs if we have a line break inbetween
        // the two notes
        if (
            n.isTieOrigin &&
            !n.hasBend &&
            !n.beat.hasWhammyBar &&
            n.beat.graceType !== GraceType.BendGrace &&
            n.tieDestination &&
            n.tieDestination.isVisible
        ) {
            let tie: ScoreTieGlyph = new ScoreTieGlyph(n, n.tieDestination, false);
            this.ties.push(tie);
        }
        if (n.isTieDestination && !n.tieOrigin!.hasBend && !n.beat.hasWhammyBar) {
            let tie: ScoreTieGlyph = new ScoreTieGlyph(n.tieOrigin!, n, true);
            this.ties.push(tie);
        }
        // TODO: depending on the type we have other positioning
        // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
        if (n.slideInType !== SlideInType.None || n.slideOutType !== SlideOutType.None) {
            let l: ScoreSlideLineGlyph = new ScoreSlideLineGlyph(n.slideInType, n.slideOutType, n, this);
            this.ties.push(l);
        }
        if (n.isSlurOrigin && n.slurDestination && n.slurDestination.isVisible) {
            let tie: ScoreSlurGlyph = new ScoreSlurGlyph(n, n.slurDestination, false);
            this.ties.push(tie);
        }
        if (n.isSlurDestination) {
            let tie: ScoreSlurGlyph = new ScoreSlurGlyph(n.slurOrigin!, n, true);
            this.ties.push(tie);
        }
        // start effect slur on first beat
        if (!this._effectSlur && n.isEffectSlurOrigin && n.effectSlurDestination) {
            this._effectSlur = new ScoreSlurGlyph(n, n.effectSlurDestination, false);
            this.ties.push(this._effectSlur);
        }
        // end effect slur on last beat
        if (!this._effectEndSlur && n.beat.isEffectSlurDestination && n.beat.effectSlurOrigin) {
            let direction: BeamDirection = this.onNotes.beamingHelper.direction;
            let startNote: Note =
                direction === BeamDirection.Up ? n.beat.effectSlurOrigin.minNote! : n.beat.effectSlurOrigin.maxNote!;
            let endNote: Note = direction === BeamDirection.Up ? n.beat.minNote! : n.beat.maxNote!;
            this._effectEndSlur = new ScoreSlurGlyph(startNote, endNote, true);
            this.ties.push(this._effectEndSlur);
        }
        if (n.hasBend) {
            if (!this._bend) {
                this._bend = new ScoreBendGlyph(n.beat);
                this._bend.renderer = this.renderer;
                this.ties.push(this._bend);
            }
            this._bend.addBends(n);
        }
    }
}
