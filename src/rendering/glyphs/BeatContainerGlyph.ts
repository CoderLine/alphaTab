import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import { BarBounds } from '../utils/BarBounds';
import { BeatBounds } from '../utils/BeatBounds';
import { Bounds } from '../utils/Bounds';

export class BeatContainerGlyph extends Glyph {
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

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        let preBeatStretch: number = this.onTimeX;
        let postBeatStretch: number = 0;
        for (let tie of this.ties) {
            if (tie.width > postBeatStretch) {
                postBeatStretch = tie.width;
            }
        }
        postBeatStretch += this.onNotes.x + (this.onNotes.width - this.onNotes.centerX);
        layoutings.addBeatSpring(this.beat, preBeatStretch, postBeatStretch);
        // store sizes for special renderers like the EffectBarRenderer
        layoutings.setPreBeatSize(this.beat, this.preNotes.width);
        layoutings.setOnBeatSize(this.beat, this.onNotes.width);
        layoutings.setBeatCenterX(this.beat, this.onNotes.centerX);
    }

    public applyLayoutingInfo(info: BarLayoutingInfo): void {
        let offset: number = info.getBeatCenterX(this.beat) - this.onNotes.centerX;
        this.preNotes.x = offset;
        this.preNotes.width = info.getPreBeatSize(this.beat);
        this.onNotes.width = info.getOnBeatSize(this.beat);
        this.onNotes.x = this.preNotes.x + this.preNotes.width;
        this.onNotes.updateBeamingHelper();
    }

    public doLayout(): void {
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
        this.updateWidth();
    }

    protected updateWidth(): void {
        this.minWidth = this.preNotes.width + this.onNotes.width;
        if (!this.beat.isRest) {
            if (this.onNotes.beamingHelper.beats.length === 1) {
                // make space for footer
                if (this.beat.duration >= Duration.Eighth) {
                    this.minWidth += 20 * this.scale;
                }
            } else {
                // ensure some space for small notes
                switch (this.beat.duration) {
                    case Duration.OneHundredTwentyEighth:
                    case Duration.TwoHundredFiftySixth:
                        this.minWidth += 10 * this.scale;
                        break;
                }
            }
        }
        let tieWidth: number = 0;
        for (let tie of this.ties) {
            if (tie.width > tieWidth) {
                tieWidth = tie.width;
            }
        }
        this.minWidth += tieWidth;
        this.width = this.minWidth;
    }

    public scaleToWidth(beatWidth: number): void {
        for (let tie of this.ties) {
            tie.doLayout();
        }
        this.onNotes.updateBeamingHelper();
        this.width = beatWidth;
    }

    protected createTies(n: Note): void {
        // no default ties
    }

    public static getGroupId(beat: Beat): string {
        return 'b' + beat.id;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.beat.voice.isEmpty) {
            return;
        }
        let isEmptyGlyph: boolean = this.preNotes.isEmpty && this.onNotes.isEmpty && this.ties.length === 0;
        if (isEmptyGlyph) {
            return;
        }
        canvas.beginGroup(BeatContainerGlyph.getGroupId(this.beat));
        // var c = canvas.Color;
        // var ta = canvas.TextAlign;
        // canvas.Color = new Color(255, 0, 0);
        // canvas.TextAlign = TextAlign.Left;
        // canvas.FillText(Beat.DisplayStart.ToString(), cx + X, cy + Y - 10);
        // canvas.Color = c;
        // canvas.TextAlign = ta;
        // canvas.Color = Color.Random();
        // canvas.FillRect(cx + X, cy + Y, Width, Renderer.Height);
        // var oldColor = canvas.Color;
        // canvas.Color = new Color((byte)Platform.Platform.Random(255), (byte)Platform.Platform.Random(255), (byte)Platform.Platform.Random(255), 100);
        // canvas.FillRect(cx + X, cy + Y, Width, Renderer.Height);
        // canvas.Color = oldColor;
        // canvas.Color = new Color(200, 0, 0, 100);
        // canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
        // canvas.Font = new Font("Arial", 10);
        // canvas.Color = new Color(0, 0, 0);
        // canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);
        // if (Beat.Voice.Index===0)
        // {
        //    canvas.Color = new Color(200, 0, 0, 100);
        //    canvas.StrokeRect(cx + X, cy + Y + PreNotes.Y + 30, Width, 10);
        // }
        this.preNotes.paint(cx + this.x, cy + this.y, canvas);
        // if (Beat.Voice.Index===0)
        // {
        //    canvas.Color = new Color(200, 0, 0, 100);
        //    canvas.StrokeRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
        // }
        this.onNotes.paint(cx + this.x, cy + this.y, canvas);
        // if (Beat.Voice.Index===0)
        // {
        //    canvas.Color = new Color(0, 200, 0, 100);
        //    canvas.StrokeRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
        // }
        // paint the ties relative to the whole staff,
        // reason: we have possibly multiple staves involved and need to calculate the correct positions.
        let staffX: number = cx - this.voiceContainer.x - this.renderer.x;
        let staffY: number = cy - this.voiceContainer.y - this.renderer.y;
        for (let i: number = 0, j: number = this.ties.length; i < j; i++) {
            let t: Glyph = this.ties[i];
            t.renderer = this.renderer;
            t.paint(staffX, staffY, canvas);
        }
        canvas.endGroup();
    }

    public buildBoundingsLookup(barBounds:BarBounds, cx:number, cy:number, isEmptyBar:boolean) {
        let beatBoundings: BeatBounds = new BeatBounds();
        beatBoundings.beat = this.beat;
        beatBoundings.visualBounds = new Bounds();
        beatBoundings.visualBounds.x = cx + this.x + this.onNotes.x;
        beatBoundings.visualBounds.y = barBounds.visualBounds.y;
        beatBoundings.visualBounds.w = this.onNotes.width;
        beatBoundings.visualBounds.h = barBounds.visualBounds.h;

        beatBoundings.realBounds = new Bounds();
        beatBoundings.realBounds.x = cx + this.x;
        beatBoundings.realBounds.y = barBounds.realBounds.y;
        beatBoundings.realBounds.w = this.width;
        beatBoundings.realBounds.h = barBounds.realBounds.h;

        if (isEmptyBar) {
            beatBoundings.visualBounds.x = cx + this.x;
            beatBoundings.realBounds.x = beatBoundings.visualBounds.x;
        }
        barBounds.addBeat(beatBoundings);

        if(this.renderer.settings.core.includeNoteBounds) {
            this.onNotes.buildBoundingsLookup(beatBoundings, cx + this.x, cy + this.y);
        }
    }
}
