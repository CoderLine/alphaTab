import { TupletGroup } from '@src/model/TupletGroup';
import { Voice } from '@src/model/Voice';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';

/**
 * This glyph acts as container for handling
 * multiple voice rendering
 */
export class VoiceContainerGlyph extends GlyphGroup {
    public static readonly KeySizeBeat: string = 'Beat';

    public beatGlyphs: BeatContainerGlyph[];
    public voice: Voice;
    public tupletGroups: TupletGroup[];

    public constructor(x: number, y: number, voice: Voice) {
        super(x, y);
        this.voice = voice;
        this.beatGlyphs = [];
        this.tupletGroups = [];
    }

    public scaleToWidth(width: number): void {
        let force: number = this.renderer.layoutingInfo.spaceToForce(width);
        this.scaleToForce(force);
    }

    private scaleToForce(force: number): void {
        this.width = this.renderer.layoutingInfo.calculateVoiceWidth(force);
        let positions: Map<number, number> = this.renderer.layoutingInfo.buildOnTimePositions(force);
        let beatGlyphs: BeatContainerGlyph[] = this.beatGlyphs;
        for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
            let currentBeatGlyph: BeatContainerGlyph = beatGlyphs[i];
            let time: number = currentBeatGlyph.beat.absoluteDisplayStart;
            currentBeatGlyph.x = positions.get(time)! - currentBeatGlyph.onTimeX;
            // size always previousl glyph after we know the position
            // of the next glyph
            if (i > 0) {
                let beatWidth: number = currentBeatGlyph.x - beatGlyphs[i - 1].x;
                beatGlyphs[i - 1].scaleToWidth(beatWidth);
            }
            // for the last glyph size based on the full width
            if (i === j - 1) {
                let beatWidth: number = this.width - beatGlyphs[beatGlyphs.length - 1].x;
                currentBeatGlyph.scaleToWidth(beatWidth);
            }
        }
    }

    public registerLayoutingInfo(info: BarLayoutingInfo): void {
        info.updateVoiceSize(this.width);
        let beatGlyphs: BeatContainerGlyph[] = this.beatGlyphs;
        for (let b of beatGlyphs) {
            b.registerLayoutingInfo(info);
        }
    }

    public applyLayoutingInfo(info: BarLayoutingInfo): void {
        let beatGlyphs: BeatContainerGlyph[] = this.beatGlyphs;
        for (let b of beatGlyphs) {
            b.applyLayoutingInfo(info);
        }
        this.scaleToForce(Math.max(this.renderer.settings.display.stretchForce, info.minStretchForce));
    }

    public addGlyph(g: Glyph): void {
        let bg: BeatContainerGlyph = g as BeatContainerGlyph;
        g.x =
            this.beatGlyphs.length === 0
                ? 0
                : this.beatGlyphs[this.beatGlyphs.length - 1].x + this.beatGlyphs[this.beatGlyphs.length - 1].width;
        g.renderer = this.renderer;
        g.doLayout();
        this.beatGlyphs.push(bg);
        this.width = g.x + g.width;
        if (bg.beat.hasTuplet && bg.beat.tupletGroup!.beats[0].id === bg.beat.id) {
            this.tupletGroups.push(bg.beat.tupletGroup!);
        }
    }

    public doLayout(): void {
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // canvas.color = Color.random();
        // canvas.strokeRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        canvas.color =
            this.voice.index === 0
                ? this.renderer.resources.mainGlyphColor
                : this.renderer.resources.secondaryGlyphColor;
        for (let i: number = 0, j: number = this.beatGlyphs.length; i < j; i++) {
            this.beatGlyphs[i].paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
