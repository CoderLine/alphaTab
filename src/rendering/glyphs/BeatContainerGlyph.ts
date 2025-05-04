import type { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import type { Note } from '@src/model/Note';
import type { ICanvas } from '@src/platform/ICanvas';
import type { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import type { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import type { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import type { BarBounds } from '@src/rendering/utils/BarBounds';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { FlagGlyph } from '@src/rendering/glyphs/FlagGlyph';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';

export class BeatContainerGlyph extends Glyph {
    public static readonly GraceBeatPadding: number = 3;
    public voiceContainer: VoiceContainerGlyph;
    public beat: Beat;
    public preNotes!: BeatGlyphBase;
    public onNotes!: BeatOnNoteGlyphBase;
    public ties: Glyph[] = [];
    public minWidth: number = 0;

    public get onTimeX(): number {
        return this.onNotes.x + this.onNotes.centerX;
    }

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(0, 0);
        this.beat = beat;
        this.ties = [];
        this.voiceContainer = voiceContainer;
    }

    public addTie(tie: Glyph) {
        tie.renderer = this.renderer;
        this.ties.push(tie);
    }

    protected drawBeamHelperAsFlags(helper: BeamingHelper): boolean {
        return helper.hasFlag(false, undefined);
    }

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const preBeatStretch: number = this.preNotes.computedWidth + this.onNotes.centerX;

        let postBeatStretch: number = this.onNotes.computedWidth - this.onNotes.centerX;
        // make space for flag
        const helper = this.renderer.helpers.getBeamingHelperForBeat(this.beat);
        if (this.beat.graceType !== GraceType.None) {
            // flagged grace
            if (this.beat.graceGroup!.beats.length === 1) {
                postBeatStretch += FlagGlyph.FlagWidth * NoteHeadGlyph.GraceScale;
            }
            // grace with bars, some space for bar unless last
            else if (this.beat.graceIndex < this.beat.graceGroup!.beats.length - 1) {
                postBeatStretch += 7;
            } else {
                postBeatStretch += BeatContainerGlyph.GraceBeatPadding;
            }
        } else if (helper && this.drawBeamHelperAsFlags(helper)) {
            postBeatStretch += FlagGlyph.FlagWidth;
        }
        for (const tie of this.ties) {
            postBeatStretch += tie.width;
        }

        layoutings.addBeatSpring(this.beat, preBeatStretch, postBeatStretch);
    }

    public applyLayoutingInfo(info: BarLayoutingInfo): void {
        this.onNotes.updateBeamingHelper();
        this.updateWidth();
    }

    public override doLayout(): void {
        this.preNotes.x = 0;
        this.preNotes.renderer = this.renderer;
        this.preNotes.container = this;
        this.preNotes.doLayout();
        this.onNotes.x = this.preNotes.x + this.preNotes.width;
        this.onNotes.renderer = this.renderer;
        this.onNotes.container = this;
        this.onNotes.doLayout();
        let i: number = this.beat.notes.length - 1;
        while (i >= 0) {
            this.createTies(this.beat.notes[i--]);
        }
        this.renderer.registerTies(this.ties);
        this.updateWidth();
    }

    protected updateWidth(): void {
        this.minWidth = this.preNotes.width + this.onNotes.width;
        if (!this.beat.isRest) {
            if (this.onNotes.beamingHelper.beats.length === 1) {
                // make space for flag
                if (this.beat.duration >= Duration.Eighth) {
                    this.minWidth += 20;
                }
            } else {
                // ensure some space for small notes
                switch (this.beat.duration) {
                    case Duration.OneHundredTwentyEighth:
                    case Duration.TwoHundredFiftySixth:
                        this.minWidth += 10;
                        break;
                }
            }
        }
        let tieWidth: number = 0;
        for (const tie of this.ties) {
            if (tie.width > tieWidth) {
                tieWidth = tie.width;
            }
        }
        this.minWidth += tieWidth;
        this.width = this.minWidth;
    }

    public scaleToWidth(beatWidth: number): void {
        this.onNotes.updateBeamingHelper();
        this.width = beatWidth;
    }

    protected createTies(n: Note): void {
        // no default ties
    }

    public static getGroupId(beat: Beat): string {
        return `b${beat.id}`;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // var c = canvas.color;
        // var ta = canvas.textAlign;
        // canvas.color = new Color(255, 0, 0);
        // canvas.textAlign = TextAlign.Left;
        // canvas.fillText(this.beat.playbackStart.toString(), cx + this.x, cy + this.y - 10);
        // canvas.color = c;
        // canvas.textAlign = ta;
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        // var oldColor = canvas.color;
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        // canvas.color = oldColor;
        // canvas.color = new Color(200, 0, 0, 100);
        // canvas.strokeRect(cx + this.x, cy + this.y + 15 * this.beat.voice.index, this.width, 10);
        // canvas.font = new Font("Arial", 10);
        // canvas.color = new Color(0, 0, 0);
        // canvas.fillText(this.beat.voice.index + ":" + this.beat.index, cx + this.x, cy + this.y + 15 * this.beat.voice.index);

        // const c = canvas.color;
        // if (this.beat.voice.index === 0) {
        //     canvas.color = new Color(0, 0, 200, 100);
        //     canvas.strokeRect(cx + this.x, cy + this.y, this.width, 10);

        //     canvas.color = new Color(200, 0, 0, 100);
        //     canvas.strokeRect(cx + this.x + this.preNotes.x, cy + this.y + 10, this.preNotes.width, 10);

        //     canvas.color = new Color(0, 200, 0, 100);
        //     canvas.strokeRect(cx + this.x + this.onNotes.x, cy + this.y + 10, this.onNotes.width, 10);

        //     canvas.color = new Color(0, 200, 200, 100);
        //     canvas.strokeRect(cx + this.x  + this.onNotes.x + this.onNotes.centerX, cy, 1, this.renderer.height);
        // }
        // canvas.color = c;

        const isEmptyGlyph: boolean = this.preNotes.isEmpty && this.onNotes.isEmpty && this.ties.length === 0;
        if (isEmptyGlyph) {
            return;
        }
        canvas.beginGroup(BeatContainerGlyph.getGroupId(this.beat));

        this.preNotes.paint(cx + this.x, cy + this.y, canvas);
        this.onNotes.paint(cx + this.x, cy + this.y, canvas);

        // reason: we have possibly multiple staves involved and need to calculate the correct positions.
        const staffX: number = cx - this.voiceContainer.x - this.renderer.x;
        const staffY: number = cy - this.voiceContainer.y - this.renderer.y;
        for (let i: number = 0, j: number = this.ties.length; i < j; i++) {
            const t: Glyph = this.ties[i];
            t.renderer = this.renderer;
            t.paint(staffX, staffY, canvas);
        }
        canvas.endGroup();
    }

    public buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number, isEmptyBar: boolean) {
        const beatBoundings: BeatBounds = new BeatBounds();
        beatBoundings.beat = this.beat;

        if (this.beat.isEmpty) {
            beatBoundings.visualBounds = new Bounds();
            beatBoundings.visualBounds.x = cx + this.x;
            beatBoundings.visualBounds.y = barBounds.visualBounds.y;
            beatBoundings.visualBounds.w = this.width;
            beatBoundings.visualBounds.h = barBounds.visualBounds.h;

            beatBoundings.realBounds = new Bounds();
            beatBoundings.realBounds.x = cx + this.x;
            beatBoundings.realBounds.y = barBounds.realBounds.y;
            beatBoundings.realBounds.w = this.width;
            beatBoundings.realBounds.h = barBounds.realBounds.h;

            beatBoundings.onNotesX = cx + this.x + this.onNotes.centerX;
        } else {
            beatBoundings.visualBounds = new Bounds();
            beatBoundings.visualBounds.x = cx + this.x;

            if (!this.preNotes.isEmpty) {
                beatBoundings.visualBounds.x = cx + this.x + this.preNotes.x;
            } else if (!this.onNotes.isEmpty) {
                beatBoundings.visualBounds.x = cx + this.x + this.onNotes.x;
            } else {
                beatBoundings.visualBounds.x = cx + this.x;
            }

            let visualEndX = 0;

            if (!this.onNotes.isEmpty) {
                visualEndX = cx + this.x + this.onNotes.x + this.onNotes.width;
            } else if (!this.preNotes.isEmpty) {
                visualEndX = cx + this.x + this.preNotes.x + this.preNotes.width;
            } else {
                visualEndX = cx + this.x + this.width;
            }

            beatBoundings.visualBounds.w = visualEndX - beatBoundings.visualBounds.x;
            const helper = this.renderer.helpers.getBeamingHelperForBeat(this.beat);
            if ((helper && this.drawBeamHelperAsFlags(helper)) || this.beat.graceType !== GraceType.None) {
                beatBoundings.visualBounds.w +=
                    FlagGlyph.FlagWidth * (this.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1);
            }

            beatBoundings.visualBounds.y = barBounds.visualBounds.y;
            beatBoundings.visualBounds.h = barBounds.visualBounds.h;

            beatBoundings.realBounds = new Bounds();
            beatBoundings.realBounds.x = cx + this.x;
            beatBoundings.realBounds.y = barBounds.realBounds.y;
            beatBoundings.realBounds.w = this.width;
            beatBoundings.realBounds.h = barBounds.realBounds.h;

            beatBoundings.onNotesX = cx + this.x + this.onNotes.x + this.onNotes.centerX;
        }

        barBounds.addBeat(beatBoundings);

        if (this.renderer.settings.core.includeNoteBounds) {
            this.onNotes.buildBoundingsLookup(beatBoundings, cx + this.x, cy + this.y);
        }
    }
}
