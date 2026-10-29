import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import type { TupletGroup } from '@coderline/alphatab/model/TupletGroup';
import { VoiceSubElement } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';

/**
 * This glyph acts as container for handling
 * multiple voice rendering
 * @internal
 */
export class MultiVoiceContainerGlyph extends Glyph {
    public static readonly KeySizeBeat: string = 'Beat';

    public voiceDrawOrder?: number[];

    /**
     * The beat containers per voice index, in beat order. Voices without containers have an
     * empty list, so consumers skip empty entries.
     */
    public beatGlyphs: BeatContainerGlyphBase[][] = [];
    public tupletGroups: Map<number, TupletGroup[]> | null = null;

    public constructor() {
        super(0, 0);
    }

    public override getBoundingBoxTop(): number {
        let y = Number.NaN;
        for (const v of this.beatGlyphs) {
            for (const b of v) {
                y = ModelUtils.minBoundingBox(y, b.getBoundingBoxTop());
            }
        }
        return y;
    }

    public override getBoundingBoxBottom(): number {
        let y = Number.NaN;
        for (const v of this.beatGlyphs) {
            for (const b of v) {
                y = ModelUtils.maxBoundingBox(y, b.getBoundingBoxBottom());
            }
        }
        return y;
    }

    /** Positions every beat container and emits its per-beat skyline contribution. */
    public scaleToWidth(width: number): void {
        const force: number = this.renderer.layoutingInfo.spaceToForce(width);
        this._scaleToForce(force);
    }

    /**
     * `true` when every voice/track/staff contributes exactly one beat, of uniform duration,
     * spanning the bar's entire duration - i.e. a single full-bar note/rest. Common engraving
     * practice centers such notes horizontally within the bar rather than anchoring them right
     * after the pre-beat content (Behind Bars, p. 41; see #2464).
     */
    private _isCenteredFullBar(): boolean {
        // single spring which starts at start and spans the whole bar?
        // also ensure we do not have any grace notes
        const masterBar = this.renderer.bar.masterBar;
        const layoutingInfo = this.renderer.layoutingInfo;
        const springs = layoutingInfo.springs;
        if (springs.size !== 1 || !springs.has(masterBar.start) || layoutingInfo.allGraceRods.size > 0) {
            return false;
        }

        // a pick-up bar is shorter than its time signature, its notes are not full-bar notes
        const spring = springs.get(masterBar.start)!;
        return spring.allDurations.size === 1 && spring.longestDuration === masterBar.calculateDuration(false);
    }

    private _scaleToForce(force: number): void {
        this.width = this.renderer.layoutingInfo.calculateVoiceWidth(force);

        if (this._isCenteredFullBar()) {
            // Sole full-bar beat: keep x=0/width=full-bar so bounds lookups, hit-testing and
            // skyline emission still span the whole bar, and shift only the ink via
            // applyCenterOffset instead of moving the container itself (which would leave the
            // bar's left portion outside this beat's bounds).

            // centred between the bar header content (or start barline) and the end barline
            const target = (this.width - this.renderer.layoutingInfo.preBeatTrailingSpace) / 2;
            for (const beatGlyphs of this.beatGlyphs) {
                if (beatGlyphs.length === 0) {
                    continue;
                }
                const soleBeatGlyph = beatGlyphs[0];
                soleBeatGlyph.x = 0;
                soleBeatGlyph.applyCenterOffset(target);
                soleBeatGlyph.scaleToWidth(this.width);
                this._emitBeatContainerSkyline(soleBeatGlyph);
            }
            return;
        }

        const layoutingInfo = this.renderer.layoutingInfo;
        const positions = layoutingInfo.buildOnTimePositions(force);
        for (const beatGlyphs of this.beatGlyphs) {
            for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
                const currentBeatGlyph = beatGlyphs[i];

                switch (currentBeatGlyph.graceType) {
                    case GraceType.None:
                        currentBeatGlyph.x = positions[currentBeatGlyph.spring!.index] - currentBeatGlyph.onTimeX;
                        break;
                    default:
                        const graceDisplayStart = currentBeatGlyph.graceGroup!.beats[0].absoluteDisplayStart;
                        const graceGroupId = currentBeatGlyph.graceGroup!.id;
                        const graceTargetSpring = layoutingInfo.springs.get(graceDisplayStart);
                        // placement for proper grace notes which have a following note
                        if (currentBeatGlyph.graceGroup!.isComplete && graceTargetSpring !== undefined) {
                            currentBeatGlyph.x = positions[graceTargetSpring.index] - currentBeatGlyph.onTimeX;

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
                            const ownPreBeatWidth = graceSpring[currentBeatGlyph.graceIndex].preBeatWidth;

                            if (i > 0) {
                                if (currentBeatGlyph.graceIndex === 0) {
                                    // we place the grace beat directly after the content of the previous one
                                    // (its on-time position plus the post-beat size the spacing reserves for it).
                                    // the previous beat width is not used as it is resized to this gap below
                                    // which would cause flickers on resizing
                                    const previous = beatGlyphs[i - 1];
                                    const previousSpring = this.renderer.layoutingInfo.springs.get(
                                        previous.absoluteDisplayStart
                                    );
                                    currentBeatGlyph.x =
                                        previous.graceType === GraceType.None && previousSpring
                                            ? previous.x +
                                              previous.onTimeX +
                                              previousSpring.postSpringWidth +
                                              this.renderer.layoutingInfo.beatContentPadding
                                            : previous.x + previous.width;
                                } else {
                                    // the following grace beats are placed by their rods, after the previous grace beat
                                    const previous = beatGlyphs[i - 1];
                                    currentBeatGlyph.x =
                                        previous.x +
                                        previous.onTimeX +
                                        graceSpring[currentBeatGlyph.graceIndex - 1].postSpringWidth +
                                        ownPreBeatWidth -
                                        currentBeatGlyph.onTimeX;
                                }
                            } else {
                                currentBeatGlyph.x = ownPreBeatWidth - currentBeatGlyph.onTimeX;
                            }
                        }
                        break;
                }

                // size always previous glyph after we know the position
                // of the next glyph
                if (i > 0) {
                    const previous = beatGlyphs[i - 1];
                    const beatWidth: number = currentBeatGlyph.x - previous.x;
                    previous.scaleToWidth(beatWidth);
                    previous.fitToNextBeat(currentBeatGlyph);
                    this._emitBeatContainerSkyline(previous);
                }
                // for the last glyph size based on the full width
                if (i === j - 1) {
                    const beatWidth: number = this.width - beatGlyphs[beatGlyphs.length - 1].x;
                    currentBeatGlyph.scaleToWidth(beatWidth);
                    this._emitBeatContainerSkyline(currentBeatGlyph);
                }
            }
        }
    }

    private _emitBeatContainerSkyline(beatContainer: BeatContainerGlyphBase): void {
        const renderer = this.renderer;
        const rendererBottom = renderer.height;
        const base = this.x + beatContainer.x;
        const containerTop = beatContainer.getBoundingBoxTop();
        const containerBottom = beatContainer.getBoundingBoxBottom();
        const topOver = !Number.isNaN(containerTop) && containerTop < 0;
        const botOver = !Number.isNaN(containerBottom) && containerBottom > rendererBottom;

        // Notehead extent (PreNotes..PostNotes), not slot width (which includes spring spacing).
        if (topOver || botOver) {
            const xStart = base + beatContainer.getBeatX(BeatXPosition.PreNotes, false);
            const xEnd = base + beatContainer.getBeatX(BeatXPosition.PostNotes, false);
            if (xEnd > xStart) {
                if (topOver) {
                    renderer.insertSkylineTop(xStart, xEnd, containerTop * -1);
                }
                if (botOver) {
                    renderer.insertSkylineBottom(xStart, xEnd, containerBottom - rendererBottom);
                }
            }
        }

        const pending = beatContainer.pendingEffectOverflowsOrNull;
        if (pending && pending.length > 0) {
            const pendingXStart = base;
            const pendingXEnd = base + beatContainer.width;
            if (pendingXEnd > pendingXStart) {
                for (const r of pending) {
                    if (r.minY < 0) {
                        renderer.insertSkylineTop(pendingXStart, pendingXEnd, r.minY * -1);
                    }
                    if (r.maxY > rendererBottom) {
                        renderer.insertSkylineBottom(pendingXStart, pendingXEnd, r.maxY - rendererBottom);
                    }
                }
            }
        }

        beatContainer.emitSkyline(base);
        renderer.emitBeatSkyline(beatContainer);
    }

    public registerLayoutingInfo(info: BarLayoutingInfo): void {
        for (const beatGlyphs of this.beatGlyphs) {
            for (const b of beatGlyphs) {
                b.registerLayoutingInfo(info);
            }
        }
    }

    public applyLayoutingInfo(info: BarLayoutingInfo): void {
        for (const beatGlyphs of this.beatGlyphs) {
            for (const b of beatGlyphs) {
                b.applyLayoutingInfo(info);
            }
        }
        // beats are positioned by the scaleToWidth that follows on every layout
        this.width = info.calculateVoiceWidth(
            Math.max(this.renderer.settings.display.stretchForce, info.minStretchForce)
        );
    }

    public addGlyph(bg: BeatContainerGlyphBase): void {
        const voiceIndex = bg.voiceIndex;
        const allBeatGlyphs = this.beatGlyphs;
        bg.renderer = this.renderer;
        if (voiceIndex < allBeatGlyphs.length && allBeatGlyphs[voiceIndex].length > 0) {
            const beatGlyphs = allBeatGlyphs[voiceIndex];
            const last = beatGlyphs[beatGlyphs.length - 1];
            bg.x = last.x + last.width;
            beatGlyphs.push(bg);
        } else {
            bg.x = 0;
            if (voiceIndex < allBeatGlyphs.length) {
                allBeatGlyphs[voiceIndex].push(bg);
            } else if (allBeatGlyphs.length === 0 && voiceIndex === 0) {
                this.beatGlyphs = [[bg]];
            } else {
                while (allBeatGlyphs.length < voiceIndex) {
                    allBeatGlyphs.push([]);
                }
                allBeatGlyphs.push([bg]);
            }
        }

        const newWidth = bg.x + bg.width;
        if (newWidth > this.width) {
            this.width = newWidth;
        }
        if (bg.isFirstOfTupletGroup) {
            let tupletGroupsByVoice = this.tupletGroups;
            if (!tupletGroupsByVoice) {
                tupletGroupsByVoice = new Map<number, TupletGroup[]>();
                this.tupletGroups = tupletGroupsByVoice;
            }
            let tupletGroups: TupletGroup[];
            if (tupletGroupsByVoice.has(bg.voiceIndex)) {
                tupletGroups = tupletGroupsByVoice.get(bg.voiceIndex)!;
            } else {
                tupletGroups = [];
                tupletGroupsByVoice.set(bg.voiceIndex, tupletGroups);
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

    public getLowestNoteY(beat: Beat, position: NoteYPosition): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            return container.y + container.getLowestNoteY(position);
        }
        return 0;
    }

    public getHighestNoteY(beat: Beat, position: NoteYPosition): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            return container.y + container.getHighestNoteY(position);
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
        return 0;
    }

    public getRestY(beat: Beat, requestedPosition: NoteYPosition): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            return container.y + container.getRestY(requestedPosition);
        }
        return 0;
    }

    /**
     * The container of the given beat, or `undefined` if the beat is not rendered by this bar.
     */
    public getBeatContainer(beat: Beat): BeatContainerGlyphBase | undefined {
        const voice = beat.voice;
        const allBeatGlyphs = this.beatGlyphs;
        if (voice.bar !== this.renderer.bar || voice.index >= allBeatGlyphs.length) {
            return undefined;
        }
        // containers without a beat (e.g. numbered dashes) can precede the beat's container
        const beatGlyphs = allBeatGlyphs[voice.index];
        const id = beat.id;
        for (let i = beat.index, j = beatGlyphs.length; i < j; i++) {
            const container = beatGlyphs[i];
            if (container.beatId === id) {
                return container;
            }
        }
        return undefined;
    }

    public buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number): void {
        const x = cx + this.x;
        const y = cy + this.y;
        const voices = this.renderer.bar.voices;
        const allBeatGlyphs = this.beatGlyphs;
        for (let index = 0; index < allBeatGlyphs.length; index++) {
            const c = allBeatGlyphs[index];
            if (c.length > 0 && (index === 0 || !voices[index].isEmpty)) {
                for (let i = 0; i < c.length; i++) {
                    c[i].buildBoundingsLookup(writer, x, y);
                }
            }
        }
    }

    public override doLayout(): void {
        for (const v of this.beatGlyphs) {
            let x = 0;
            for (const b of v) {
                b.prepareForOverflowPass();
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
        const allBeatGlyphs = this.beatGlyphs;
        let voiceCount = 0;
        for (const v of allBeatGlyphs) {
            if (v.length > 0) {
                voiceCount++;
            }
        }
        const voiceDrawOrder = new Array<number>(voiceCount);
        let drawIndex = 0;
        for (let i = allBeatGlyphs.length - 1; i >= 0; i--) {
            if (allBeatGlyphs[i].length > 0) {
                voiceDrawOrder[drawIndex] = i;
                drawIndex++;
            }
        }
        this.voiceDrawOrder = voiceDrawOrder;
    }

    private _doMultiVoiceLayout() {
        for (const v of this.beatGlyphs) {
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
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        const x = cx + this.x;
        const y = cy + this.y;
        for (const v of this.voiceDrawOrder!) {
            const beatGlyphs = this.beatGlyphs[v];
            const voice = this.renderer.bar.voices[v];
            const previousColor = ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, voice, true);
            try {
                for (let i: number = 0, j: number = beatGlyphs.length; i < j; i++) {
                    beatGlyphs[i].paint(x, y, canvas);
                }
            } finally {
                ElementStyleHelper.restore(canvas, previousColor);
            }
        }
    }
}
