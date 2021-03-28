import { GraceType } from '@src/model/GraceType';
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
        const scale = this.renderer.scale;
        let force: number = this.renderer.layoutingInfo.spaceToForce(width / scale);
        this.scaleToForce(force);
    }

    private scaleToForce(force: number): void {
        const scale = this.renderer.scale;
        this.width = this.renderer.layoutingInfo.calculateVoiceWidth(force) * scale;
        let positions: Map<number, number> = this.renderer.layoutingInfo.buildOnTimePositions(force);
        let beatGlyphs: BeatContainerGlyph[] = this.beatGlyphs;

        for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
            let currentBeatGlyph: BeatContainerGlyph = beatGlyphs[i];

            switch (currentBeatGlyph.beat.graceType) {
                case GraceType.None:
                    currentBeatGlyph.x = positions.get(currentBeatGlyph.beat.absoluteDisplayStart)! * scale - currentBeatGlyph.onTimeX;
                    break;
                default:
                    const graceDisplayStart = currentBeatGlyph.beat.graceGroup!.beats[0].absoluteDisplayStart;
                    const graceGroupId = currentBeatGlyph.beat.graceGroup!.id;
                    // placement for proper grace notes which have a following note
                    if (currentBeatGlyph.beat.graceGroup!.isComplete && positions.has(graceDisplayStart)) {
                        currentBeatGlyph.x = positions.get(graceDisplayStart)! * scale - currentBeatGlyph.onTimeX;
                        let graceSprings = this.renderer.layoutingInfo.allGraceRods.get(graceGroupId)!;
                        let graceTargetPreBeat = this.renderer.layoutingInfo.springs.get(graceDisplayStart)!.preBeatWidth;
                        // move right in front to the note
                        currentBeatGlyph.x -= graceTargetPreBeat;
                        // respect the post beat width of the grace note
                        currentBeatGlyph.x -= graceSprings[currentBeatGlyph.beat.graceIndex].postSpringWidth;
                        // shift to right position of the particular grace note
                        currentBeatGlyph.x += graceSprings[currentBeatGlyph.beat.graceIndex].graceBeatWidth;
                        // move the whole group again forward for cases where another track has e.g. 3 beats and here we have only 2. 
                        // so we shift the whole group of this voice to stick to the end of the group.
                        const lastGraceSpring = graceSprings[currentBeatGlyph.beat.graceGroup!.beats.length - 1];
                        currentBeatGlyph.x -= lastGraceSpring.graceBeatWidth;

                    } else {
                        // placement for improper grace beats where no beat in the same bar follows
                        let graceSpring = this.renderer.layoutingInfo.incompleteGraceRods.get(graceGroupId)!;
                        const relativeOffset = graceSpring[currentBeatGlyph.beat.graceIndex].postSpringWidth
                            - graceSpring[currentBeatGlyph.beat.graceIndex].preSpringWidth

                        if (i > 0) {
                            if (currentBeatGlyph.beat.graceIndex === 0) {
                                // we place the grace beat directly after the previous one
                                // otherwise this causes flickers on resizing 
                                currentBeatGlyph.x = beatGlyphs[i - 1].x + beatGlyphs[i - 1].width;
                            } else {
                                // for the multiple grace glyphs we take the width of the grace rod
                                // this width setting is aligned with the positioning logic below
                                currentBeatGlyph.x = beatGlyphs[i - 1].x
                                    + graceSpring[currentBeatGlyph.beat.graceIndex - 1].postSpringWidth
                                    - graceSpring[currentBeatGlyph.beat.graceIndex - 1].preSpringWidth
                                    - relativeOffset;
                            }
                        } else {
                            currentBeatGlyph.x = -relativeOffset;
                        }
                    }
                    break;
            }

            // size always previous glyph after we know the position
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
