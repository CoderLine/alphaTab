import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import type { TupletGroup } from '@coderline/alphatab/model/TupletGroup';
import { VoiceSubElement } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarBounds } from '@coderline/alphatab/rendering/_barrel';
import type { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This glyph acts as container for handling
 * multiple voice rendering
 * @internal
 */
export class MultiVoiceContainerGlyph extends Glyph {
    public static readonly KeySizeBeat: string = 'Beat';

    public voiceDrawOrder?: number[];

    public beatGlyphs = new Map<number, BeatContainerGlyphBase[]>();
    public tupletGroups = new Map<number, TupletGroup[]>();

    public constructor() {
        super(0, 0);
    }

    public override getBoundingBoxTop(): number {
        let y = Number.NaN;
        for (const v of this.beatGlyphs.values()) {
            for (const b of v) {
                y = ModelUtils.minBoundingBox(y, b.getBoundingBoxTop());
            }
        }
        return y;
    }

    public override getBoundingBoxBottom(): number {
        let y = Number.NaN;
        for (const v of this.beatGlyphs.values()) {
            for (const b of v) {
                y = ModelUtils.maxBoundingBox(y, b.getBoundingBoxBottom());
            }
        }
        return y;
    }

    public scaleToWidth(width: number): void {
        const force: number = this.renderer.layoutingInfo.spaceToForce(width);
        this._scaleToForce(force);
    }

    private _scaleToForce(force: number): void {
        this.width = this.renderer.layoutingInfo.calculateVoiceWidth(force);
        const positions: Map<number, number> = this.renderer.layoutingInfo.buildOnTimePositions(force);
        for (const beatGlyphs of this.beatGlyphs.values()) {
            for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
                const currentBeatGlyph = beatGlyphs[i];

                switch (currentBeatGlyph.graceType) {
                    case GraceType.None:
                        currentBeatGlyph.x =
                            positions.get(currentBeatGlyph.absoluteDisplayStart)! - currentBeatGlyph.onTimeX;
                        break;
                    default:
                        const graceDisplayStart = currentBeatGlyph.graceGroup!.beats[0].absoluteDisplayStart;
                        const graceGroupId = currentBeatGlyph.graceGroup!.id;
                        // placement for proper grace notes which have a following note
                        if (currentBeatGlyph.graceGroup!.isComplete && positions.has(graceDisplayStart)) {
                            currentBeatGlyph.x = positions.get(graceDisplayStart)! - currentBeatGlyph.onTimeX;

                            const graceSprings = this.renderer.layoutingInfo.allGraceRods.get(graceGroupId)!;

                            // get the pre beat stretch of this voice/staff, not the
                            // shared space. This way we use the potentially empty space (see discussions/1092).
                            const afterGraceBeat =
                                currentBeatGlyph.graceGroup!.beats[currentBeatGlyph.graceGroup!.beats.length - 1]
                                    .nextBeat;
                            const preBeatStretch = afterGraceBeat
                                ? this.renderer.layoutingInfo.getPreBeatSize(afterGraceBeat)
                                : 0;

                            // move right in front to the note
                            currentBeatGlyph.x -= preBeatStretch;
                            // respect the post beat width of the grace note
                            currentBeatGlyph.x -= graceSprings[currentBeatGlyph.graceIndex].postSpringWidth;
                            // shift to right position of the particular grace note

                            currentBeatGlyph.x += graceSprings[currentBeatGlyph.graceIndex].graceBeatWidth;
                            // move the whole group again forward for cases where another track has e.g. 3 beats and here we have only 2.
                            // so we shift the whole group of this voice to stick to the end of the group.
                            const lastGraceSpring = graceSprings[currentBeatGlyph.graceGroup!.beats.length - 1];
                            currentBeatGlyph.x -= lastGraceSpring.graceBeatWidth;
                        } else {
                            // placement for improper grace beats where no beat in the same bar follows
                            const graceSpring = this.renderer.layoutingInfo.incompleteGraceRods.get(graceGroupId)!;
                            const relativeOffset =
                                graceSpring[currentBeatGlyph.graceIndex].postSpringWidth -
                                graceSpring[currentBeatGlyph.graceIndex].preSpringWidth;

                            if (i > 0) {
                                if (currentBeatGlyph.graceIndex === 0) {
                                    // we place the grace beat directly after the previous one
                                    // otherwise this causes flickers on resizing
                                    currentBeatGlyph.x = beatGlyphs[i - 1].x + beatGlyphs[i - 1].width;
                                } else {
                                    // for the multiple grace glyphs we take the width of the grace rod
                                    // this width setting is aligned with the positioning logic below
                                    currentBeatGlyph.x =
                                        beatGlyphs[i - 1].x +
                                        graceSpring[currentBeatGlyph.graceIndex - 1].postSpringWidth -
                                        graceSpring[currentBeatGlyph.graceIndex - 1].preSpringWidth -
                                        relativeOffset;
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
                    const beatWidth: number = currentBeatGlyph.x - beatGlyphs[i - 1].x;
                    beatGlyphs[i - 1].scaleToWidth(beatWidth);
                }
                // for the last glyph size based on the full width
                if (i === j - 1) {
                    const beatWidth: number = this.width - beatGlyphs[beatGlyphs.length - 1].x;
                    currentBeatGlyph.scaleToWidth(beatWidth);
                }
            }
        }
    }

    public registerLayoutingInfo(info: BarLayoutingInfo): void {
        for (const beatGlyphs of this.beatGlyphs.values()) {
            for (const b of beatGlyphs) {
                b.registerLayoutingInfo(info);
            }
        }
    }

    public applyLayoutingInfo(info: BarLayoutingInfo): void {
        for (const beatGlyphs of this.beatGlyphs.values()) {
            for (const b of beatGlyphs) {
                b.applyLayoutingInfo(info);
            }
            this._scaleToForce(Math.max(this.renderer.settings.display.stretchForce, info.minStretchForce));
        }
    }

    public addGlyph(bg: BeatContainerGlyphBase): void {
        let beatGlyphs: BeatContainerGlyphBase[];
        if (this.beatGlyphs.has(bg.voiceIndex)) {
            beatGlyphs = this.beatGlyphs.get(bg.voiceIndex)!;
        } else {
            beatGlyphs = [];
            this.beatGlyphs.set(bg.voiceIndex, beatGlyphs);
        }

        bg.x =
            beatGlyphs.length === 0 ? 0 : beatGlyphs[beatGlyphs.length - 1].x + beatGlyphs[beatGlyphs.length - 1].width;
        bg.renderer = this.renderer;
        beatGlyphs.push(bg);
        const newWidth = bg.x + bg.width;
        if (newWidth > this.width) {
            this.width = newWidth;
        }
        if (bg.isFirstOfTupletGroup) {
            let tupletGroups: TupletGroup[];
            if (this.tupletGroups.has(bg.voiceIndex)) {
                tupletGroups = this.tupletGroups.get(bg.voiceIndex)!;
            } else {
                tupletGroups = [];
                this.tupletGroups.set(bg.voiceIndex, tupletGroups);
            }

            tupletGroups.push(bg.tupletGroup!);
        }
    }
    public getBeatX(
        beat: Beat,
        requestedPosition: BeatXPosition = BeatXPosition.PreNotes,
        useSharedSizes: boolean = false
    ): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            return container.x + container.getBeatX(requestedPosition, useSharedSizes);
        }
        return 0;
    }
    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        const container = this.getBeatContainer(note.beat);
        if (container) {
            return container.x + container.getNoteX(note, requestedPosition);
        }
        return 0;
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        const beat = this.getBeatContainer(note.beat);
        if (beat) {
            return beat.y + beat.getNoteY(note, requestedPosition);
        }
        return Number.NaN;
    }

    public getRestY(beat: Beat, requestedPosition: NoteYPosition): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            return container.y + container.getRestY(requestedPosition);
        }
        return Number.NaN;
    }

    public getBeatContainer(beat: Beat): BeatContainerGlyphBase | undefined {
        if (!this.beatGlyphs.has(beat.voice.index)) {
            return undefined;
        }
        const beats = this.beatGlyphs.get(beat.voice.index)!;
        return beat.index < beats.length ? beats[beat.index] : undefined;
    }

    public buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number): void {
        for (const [index, c] of this.beatGlyphs) {
            const voice = this.renderer.bar.voices[index];
            if (index === 0 || !voice.isEmpty) {
                for (const bc of c) {
                    bc.buildBoundingsLookup(barBounds, cx + this.x, cy + this.y);
                }
            }
        }
    }

    public override doLayout(): void {
        for (const v of this.beatGlyphs.values()) {
            let x = 0;
            for (const b of v) {
                b.x = x;
                b.doLayout();
                x += b.width;
            }

            if (x > this.width) {
                this.width = x;
            }
        }

        if (this.renderer.bar.isMultiVoice) {
            this._doMultiVoiceLayout();
        }

        // draw order is reversed so that the main voice overlaps secondary ones
        this.voiceDrawOrder = Array.from(this.beatGlyphs.keys());
        this.voiceDrawOrder!.sort((a, b) => b - a);
    }

    private _doMultiVoiceLayout() {
        for (const v of this.beatGlyphs.values()) {
            let x = 0;
            for (const b of v) {
                b.x = x;
                b.doMultiVoiceLayout();
                x += b.width;
            }

            if (x > this.width) {
                this.width = x;
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // canvas.color = Color.random();
        // canvas.strokeRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        for (const v of this.voiceDrawOrder!) {
            const beatGlyphs = this.beatGlyphs.get(v)!;
            const voice = this.renderer.bar.voices[v];
            using _ = ElementStyleHelper.voice(canvas, VoiceSubElement.Glyphs, voice, true);

            for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
                beatGlyphs[i].paint(cx + this.x, cy + this.y, canvas);
            }
        }
    }
}
