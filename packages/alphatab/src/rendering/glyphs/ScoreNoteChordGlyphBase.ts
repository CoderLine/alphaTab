import { BarSubElement } from '@coderline/alphatab/model/Bar';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

// TODO[perf]: the overall note head alignment creates quite a lot of objects which the GC
// will have to cleanup again. we should be optimize this (e.g. via object pooling?, checking for multi-voice and avoid some objects)

/**
 * @internal
 * @record
 */
export interface ScoreChordNoteHeadGroupSide {
    /**
     * A lookup for the notes located at particular steps.
     * If we have more than 2 filled voices at the same spot, we might have the additional voices
     * placed where the secondary voice already is.
     */
    notes: Map<number, ScoreNoteGlyphInfo[]>;
    /**
     * The width of this individual side.
     */
    width: number;

    /**
     * The smallest X-coordinate of all glyphs. Used later to calculate
     * the overall shift needed to place notes within the bounds.
     */
    minX: number;
}

/**
 * @internal
 * @record
 */
export interface ScoreChordNoteHeadGroup {
    /**
     * All notes on the "correct" side of the stem,
     * that's left for upwards stems, and right for downward stems.
     */
    correctNotes: ScoreChordNoteHeadGroupSide;
    /**
     * All displaced notes (the other side of the stem compared to {@link correctNotes})
     */
    displacedNotes?: ScoreChordNoteHeadGroupSide;

    /**
     * The direction this group defines.
     */
    direction: BeamDirection;

    minStep: number;
    maxStep: number;

    /**
     * The offset of the stem for this group.
     * Offset is relative to the group.
     */
    stemX: number;

    /**
     * Smallest X-coordinate in this group.
     * Offset is relative to the group.
     */
    minX: number;
    /**
     * Largest X-coordinate in this group.
     * Offset is relative to the group.
     */
    maxX: number;

    /**
     * The shift applied for the group to avoid overlaps.
     */
    multiVoiceShiftX: number;
}

/**
 * @internal
 */
export class ScoreChordNoteHeadInfo {
    /**
     * The direction of the main voice.
     */
    public mainVoiceDirection = BeamDirection.Up;

    /**
     * All groups respective to their direction.
     */
    public readonly groups = new Map<BeamDirection, ScoreChordNoteHeadGroup>();
    public minX = 0;
    public maxX = 0;

    private _isFinished = false;

    public constructor(mainVoiceDirection: BeamDirection) {
        this.mainVoiceDirection = mainVoiceDirection;
    }

    public update() {
        let minX = 0;
        let maxX = 0;
        for (const g of this.groups.values()) {
            const gMinX = g.minX + g.multiVoiceShiftX;
            const gMaxX = g.maxX + g.multiVoiceShiftX;
            if (gMinX < minX) {
                minX = gMinX;
            }
            if (maxX < gMaxX) {
                maxX = gMaxX;
            }
        }
        this.minX = minX;
        this.maxX = maxX;
    }

    finish() {
        if (this._isFinished) {
            return;
        }
        this._isFinished = true;

        for (const g of this.groups.values()) {
            this._checkForGroupDisplacement(g);
        }
        this.update();
    }

    private _checkForGroupDisplacement(noteGroup: ScoreChordNoteHeadGroup) {
        // no group displace if we're in the same direction
        if (this.mainVoiceDirection === noteGroup.direction) {
            return;
        }

        const mainGroup = this.groups.get(this.mainVoiceDirection)!;

        // no intersection -> we can align the note heads directly.
        const hasIntersection = ScoreChordNoteHeadInfo._hasIntersection(mainGroup, noteGroup);
        if (!hasIntersection) {
            return;
        }

        // temp: do some offset for testing intersection
        if (mainGroup.direction === BeamDirection.Up) {
            // shift main group to the right to make space for this group on the left side
            mainGroup.multiVoiceShiftX = noteGroup.maxX;
        } else {
            // shift this group to the right to be after the main group
            noteGroup.multiVoiceShiftX = mainGroup.maxX;
        }
    }

    private static _hasIntersection(mainGroup: ScoreChordNoteHeadGroup, thisGroup: ScoreChordNoteHeadGroup) {
        const mainGroupBottom =
            mainGroup.direction === BeamDirection.Up ? mainGroup.maxStep + 1 : mainGroup.minStep - 1;
        const thisGroupBottom = thisGroup.direction === BeamDirection.Up ? thisGroup.maxStep : thisGroup.minStep;

        let hasIntersection: boolean;
        if (mainGroup.direction === BeamDirection.Up) {
            hasIntersection = thisGroupBottom <= mainGroupBottom;
        } else {
            hasIntersection = mainGroupBottom >= thisGroupBottom;
        }
        return hasIntersection;
    }
}

/**
 * @internal
 * @record
 */
interface ScoreNoteGlyphInfo {
    glyph: NoteHeadGlyphBase;
    steps: number;
}

/**
 * @internal
 */
export abstract class ScoreNoteChordGlyphBase extends Glyph {
    private _infos: ScoreNoteGlyphInfo[] = [];
    // TODO[perf]: keeping the whole group only for stemX prevents the GC to collect this
    // maybe we can do some better "finalization" of the groups once all voices have been done
    private _noteHeadInfo?: ScoreChordNoteHeadInfo;
    protected noteGroup?: ScoreChordNoteHeadGroup;

    public minNote: ScoreNoteGlyphInfo | null = null;
    public maxNote: ScoreNoteGlyphInfo | null = null;
    public get stemX(): number {
        if (!this.noteGroup) {
            return 0;
        }

        return this.noteGroup!.stemX + this.noteGroup!.multiVoiceShiftX;
    }

    public noteStartX: number = 0;

    public onTimeX = 0;

    public constructor() {
        super(0, 0);
    }

    public abstract get direction(): BeamDirection;
    public abstract get scale(): number;

    public override getBoundingBoxTop(): number {
        return this.minNote ? this.minNote.glyph.getBoundingBoxTop() : this.y;
    }

    public override getBoundingBoxBottom(): number {
        return this.maxNote ? this.maxNote.glyph.getBoundingBoxBottom() : this.y + this.height;
    }

    public getLowestNoteY(): number {
        return this.maxNote ? (this.renderer as ScoreBarRenderer).getScoreY(this.maxNote.steps) : 0;
    }

    public getHighestNoteY(): number {
        return this.minNote ? (this.renderer as ScoreBarRenderer).getScoreY(this.minNote.steps) : 0;
    }

    protected add(noteGlyph: NoteHeadGlyphBase, noteSteps: number): void {
        const info: ScoreNoteGlyphInfo = { glyph: noteGlyph, steps: noteSteps };
        this._infos.push(info);
        if (!this.minNote || this.minNote.steps > info.steps) {
            this.minNote = info;
        }
        if (!this.maxNote || this.maxNote.steps < info.steps) {
            this.maxNote = info;
        }
    }

    protected abstract getScoreChordNoteHeadInfo(): ScoreChordNoteHeadInfo;

    private _prepareForLayout(info: ScoreChordNoteHeadInfo): ScoreChordNoteHeadGroup {
        const direction: BeamDirection = this.direction;

        // initialize empty info object
        if (!info.groups) {
            info.mainVoiceDirection = direction;
        }

        // sorting helps avoiding weird alignments
        // if the stem is upwards we go bottom-up otherwise top-down
        // this ensures we start placing notes on the primary side.
        if (direction === BeamDirection.Up) {
            this._infos.sort((a, b) => {
                return b.steps - a.steps;
            });
        } else {
            this._infos.sort((a, b) => {
                return a.steps - b.steps;
            });
        }

        // obtain group we belong to
        let group: ScoreChordNoteHeadGroup;
        if (info.groups!.has(direction)) {
            group = info.groups!.get(direction)!;
        } else {
            group = {
                correctNotes: {
                    notes: new Map(),
                    width: 0,
                    minX: Number.NaN
                },
                direction,
                stemX: 0,
                maxX: Number.NaN,
                minX: Number.NaN,
                minStep: Number.NaN,
                maxStep: Number.NaN,
                multiVoiceShiftX: 0
            };
            info.groups.set(direction, group);
        }
        return group;
    }

    public override doLayout(): void {
        // generally we try to follow the rules defined in "behind the bars"
        // "Double-stemmed writing" but not all rules might be implemented

        // The note head alignment has following base logic and rules:
        // 1. we have two note groups:
        //    * stem up
        //    * stem down
        // 2. we have 4 x-positions for note heads
        //    * stem up non-displaced   (left from stem)
        //    * stem up displaced       (right from stem)
        //    * stem down non-displaced (right from stem)
        //    * stem down displaced     (left from stem)
        // 3. by default the non-displaced notes across note groups align vertically
        // 4. every note head is registered on its "step" position of the current group
        // 5. if the step of the note or +/- 1 step is reserved in the current group, the note head is displaced, otherwise it is non-displaced
        // 6. the group of the first voice beat defines the "primary" stem-direction, all other voice beats are "secondary" stem-directions
        // 7. if the current voice matches the primary stem direction and we have overlaps:
        //    * no shifting of the group is needed
        // 8. if the current voice does NOT match the primary stem and we have overlaps we might need shifting of the whole group:
        //    * if the note heads are on the exact same position and have both the same "black" note head (grace, shape etc. are accounted)
        //      there is no shift and the same "spot" can be used
        //    * if there is a +/- 1 overlap a shift of the whole group is applied

        const info = this.getScoreChordNoteHeadInfo();
        const noteGroup = this._prepareForLayout(info);
        this.noteGroup = noteGroup;
        this._noteHeadInfo = info;

        this._collectNoteDisplacements(noteGroup);
        this._alignNoteHeadsGroup(noteGroup);

        info.update();

        this._updateSizes();
    }

    private _updateSizes() {
        const noteGroup = this.noteGroup!;
        // the center of score notes, (used for aligning the beat to the right on-time position)
        // is always the center of the "correct note" position.

        // for no displaced notes it is simply the center at group
        this.onTimeX = noteGroup.multiVoiceShiftX + noteGroup.correctNotes.minX + noteGroup.correctNotes.width / 2;

        this.width = this.noteStartX + noteGroup.multiVoiceShiftX + noteGroup.maxX - noteGroup.minX;
    }

    public doMultiVoiceLayout() {
        this._noteHeadInfo!.finish();
        this._updateSizes();
    }

    private _alignNoteHeadsGroup(noteGroup: ScoreChordNoteHeadGroup) {
        // align all notes so that they align with the stem positions
        if (noteGroup.direction === BeamDirection.Up) {
            this._alignNoteHeads(noteGroup, noteGroup.correctNotes, true);
            if (noteGroup.displacedNotes) {
                this._alignNoteHeads(noteGroup, noteGroup.displacedNotes!, false);
            }
        } else {
            this._alignNoteHeads(noteGroup, noteGroup.correctNotes, false);
            if (noteGroup.displacedNotes) {
                this._alignNoteHeads(noteGroup, noteGroup.displacedNotes!, true);
            }
        }
    }
    private _alignNoteHeads(
        noteGroup: ScoreChordNoteHeadGroup,
        side: ScoreChordNoteHeadGroupSide,
        leftOfStem: boolean
    ) {
        const scale = this.scale;
        const smufl = this.renderer.smuflMetrics;

        for (const stepInfos of side.notes.values()) {
            // NOTE: for now we do not displace "third" voices even further but they overlap
            for (const info of stepInfos) {
                // align directly
                info.glyph.x = noteGroup.stemX;

                //
                if (info.glyph.centerOnStem) {
                    // no offset
                }
                // shift left/right according to stem position or glyph size
                else if (leftOfStem) {
                    // stem-up is the offset on the right side of the notehead
                    if (smufl.stemUp.has(info.glyph.symbol)) {
                        info.glyph.x -= smufl.stemUp.get(info.glyph.symbol)!.x * scale;
                    } else {
                        info.glyph.x -= smufl.glyphWidths.get(info.glyph.symbol)! * scale;
                    }
                } else {
                    // stem-down is the offset on the left side of the notehead
                    if (smufl.stemDown.has(info.glyph.symbol)) {
                        info.glyph.x += smufl.stemDown.get(info.glyph.symbol)!.x * scale;
                    }
                }

                // update side
                side.width = Math.max(side.width, info.glyph.width);
                if (Number.isNaN(side.minX) || info.glyph.x < side.minX) {
                    side.minX = info.glyph.x;
                }

                // update whole group
                if (Number.isNaN(noteGroup.minX) || info.glyph.x < noteGroup.minX) {
                    noteGroup.minX = info.glyph.x;
                }
                const maxX = info.glyph.x + info.glyph.width;
                if (Number.isNaN(noteGroup.maxX) || maxX > noteGroup.maxX) {
                    noteGroup.maxX = maxX;
                }
            }
        }
    }

    private static _hasCollision(side: ScoreChordNoteHeadGroupSide, info: ScoreNoteGlyphInfo) {
        return side.notes.has(info.steps) || side.notes.has(info.steps + 1) || side.notes.has(info.steps - 1);
    }

    private _collectNoteDisplacements(noteGroup: ScoreChordNoteHeadGroup) {
        for (const info of this._infos) {
            info.glyph.renderer = this.renderer;
            info.glyph.doLayout();

            const isGroupCollision = ScoreNoteChordGlyphBase._hasCollision(noteGroup.correctNotes, info);

            let noteLookup: ScoreChordNoteHeadGroupSide;
            if (isGroupCollision) {
                if (!noteGroup.displacedNotes) {
                    noteGroup.displacedNotes = { notes: new Map(), width: 0, minX: 0 };
                }
                noteLookup = noteGroup.displacedNotes!;
            } else {
                noteLookup = noteGroup.correctNotes!;
            }

            let stepInfos: ScoreNoteGlyphInfo[];
            if (noteLookup.notes.has(info.steps)) {
                stepInfos = noteLookup.notes.get(info.steps)!;
            } else {
                stepInfos = [];
                noteLookup.notes.set(info.steps, stepInfos);
            }
            stepInfos.push(info);

            if (Number.isNaN(noteGroup.minStep) || info.steps < noteGroup.minStep) {
                noteGroup.minStep = info.steps;
            }

            if (Number.isNaN(noteGroup.maxStep) || info.steps > noteGroup.maxStep) {
                noteGroup.maxStep = info.steps;
            }

            this._updateGroupStemXPosition(info, noteGroup);
        }
    }

    private _updateGroupStemXPosition(info: ScoreNoteGlyphInfo, noteGroup: ScoreChordNoteHeadGroup) {
        const smufl = this.renderer.smuflMetrics;
        const scale = this.scale;
        let stemX: number;

        if (noteGroup.direction === BeamDirection.Up || noteGroup.displacedNotes) {
            if (smufl.stemUp.has(info.glyph.symbol)) {
                const stemInfo = smufl.stemUp.get(info.glyph.symbol)!;
                stemX = stemInfo.x * scale;
            } else {
                stemX = smufl.glyphWidths.get(info.glyph.symbol)! * scale;
            }
        } else {
            if (smufl.stemDown.has(info.glyph.symbol)) {
                const stemInfo = smufl.stemDown.get(info.glyph.symbol)!;
                stemX = stemInfo.x * scale;
            } else {
                stemX = 0;
            }
        }

        stemX += this.noteStartX;

        if (stemX > noteGroup.stemX) {
            noteGroup.stemX = stemX;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;

        this._paintLedgerLines(cx, cy, canvas);
        const noteGroup = this.noteGroup!;
        cx += noteGroup.multiVoiceShiftX;

        const infos: ScoreNoteGlyphInfo[] = this._infos;
        for (const g of infos) {
            g.glyph.renderer = this.renderer;
            g.glyph.paint(cx, cy, canvas);
        }
    }

    private _paintLedgerLines(cx: number, cy: number, canvas: ICanvas) {
        if (!this.minNote) {
            return;
        }

        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationStaffLine, scoreRenderer.bar, true);

        const scale = this.scale;
        const lineExtension: number = this.renderer.smuflMetrics.legerLineExtension * scale;
        const lineWidth: number = this.width + lineExtension * 2;

        const lineSpacing = scoreRenderer.getLineHeight(1);
        const firstTopLedgerY = scoreRenderer.getLineY(-1);
        const firstBottomLedgerY = scoreRenderer.getLineY(scoreRenderer.drawnLineCount);
        const minNoteLineY = scoreRenderer.getLineY(this.minNote!.steps / 2);
        const maxNoteLineY = scoreRenderer.getLineY(this.maxNote!.steps / 2);

        const lineYOffset = (this.renderer.smuflMetrics.legerLineThickness * scale) / 2;

        let y = firstTopLedgerY;
        while (y >= minNoteLineY) {
            canvas.fillRect(
                cx - lineExtension + this.noteStartX,
                cy + y - lineYOffset,
                lineWidth,
                this.renderer.smuflMetrics.legerLineThickness * scale
            );
            y -= lineSpacing;
        }

        y = firstBottomLedgerY;
        while (y <= maxNoteLineY) {
            canvas.fillRect(
                cx - lineExtension + this.noteStartX,
                cy + y - lineYOffset,
                lineWidth,
                this.renderer.smuflMetrics.legerLineThickness * scale
            );
            y += lineSpacing;
        }
    }
}
