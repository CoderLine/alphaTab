import type { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { MusicFontSymbolLookup } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
enum NoteHeadIntersectionKind {
    NoIntersection = 0,
    EndsTouchingOuter = 1,
    EndsTouchingInner = 2,
    ExactMatch = 3,
    FullIntersection = 4
}

/**
 * @internal
 * @record
 */
export interface ScoreChordNoteHeadGroup {
    /**
     * All notes on the "correct" side of the stem,
     * that's left for upwards stems, and right for downward stems.
     * If we have more than 2 filled voices at the same spot, we might have the additional voices
     * placed where the secondary voice already is.
     */
    correctNotes: NoteHeadGlyphBase[];
    /**
     * The width of the {@link correctNotes}.
     */
    correctNotesWidth: number;
    /**
     * The smallest X-coordinate of the {@link correctNotes}.
     */
    correctNotesMinX: number;
    /**
     * All displaced notes (the other side of the stem compared to {@link correctNotes})
     */
    displacedNotes: NoteHeadGlyphBase[] | null;

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

    hasFlag: boolean;
    hasStem: boolean;
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
     * The group of the chords with an upwards stem.
     */
    public upGroup: ScoreChordNoteHeadGroup | null = null;
    /**
     * The group of the chords with a downwards stem.
     */
    public downGroup: ScoreChordNoteHeadGroup | null = null;
    private _isFinished = false;

    public constructor(mainVoiceDirection: BeamDirection) {
        this.mainVoiceDirection = mainVoiceDirection;
    }

    public getGroup(direction: BeamDirection): ScoreChordNoteHeadGroup | null {
        return direction === BeamDirection.Up ? this.upGroup : this.downGroup;
    }

    public setGroup(group: ScoreChordNoteHeadGroup) {
        if (group.direction === BeamDirection.Up) {
            this.upGroup = group;
        } else {
            this.downGroup = group;
        }
    }

    finish(smufl: EngravingSettings) {
        if (this._isFinished) {
            return;
        }
        this._isFinished = true;

        // only the group not matching the main voice direction is displaced
        const upGroup = this.upGroup;
        if (upGroup) {
            this._checkForGroupDisplacement(upGroup, smufl);
        }
        const downGroup = this.downGroup;
        if (downGroup) {
            this._checkForGroupDisplacement(downGroup, smufl);
        }
    }

    private _checkForGroupDisplacement(noteGroup: ScoreChordNoteHeadGroup, smufl: EngravingSettings) {
        // no group displace if we're in the same direction
        if (this.mainVoiceDirection === noteGroup.direction) {
            return;
        }

        const mainGroup = this.getGroup(this.mainVoiceDirection)!;

        // no intersection -> we can align the note heads directly.
        const intersection = ScoreChordNoteHeadInfo._checkIntersection(mainGroup, noteGroup);

        const spacing = smufl.multiVoiceDisplacedNoteHeadSpacing;

        switch (intersection) {
            case NoteHeadIntersectionKind.NoIntersection:
                return;
            case NoteHeadIntersectionKind.ExactMatch:
                // handling note head
                if (
                    ScoreChordNoteHeadInfo._isBottomNoteHeadDisplaced(mainGroup) ||
                    ScoreChordNoteHeadInfo._isBottomNoteHeadDisplaced(noteGroup)
                ) {
                    // a displaced note head sits on the far side of its stem and cannot be shared:
                    // the down-stemmed part goes to the right, clear of all up-stemmed note heads (Behind Bars p. 53)
                    if (mainGroup.direction === BeamDirection.Up) {
                        noteGroup.multiVoiceShiftX = mainGroup.maxX - noteGroup.minX + spacing;
                    } else {
                        mainGroup.multiVoiceShiftX = noteGroup.maxX - mainGroup.minX + spacing;
                    }
                } else if (!ScoreChordNoteHeadInfo._canShareNoteHead(mainGroup, noteGroup)) {
                    // align stems back-to-back with additional spacing
                    if (mainGroup.direction === BeamDirection.Up) {
                        if (noteGroup.displacedNotes) {
                            noteGroup.multiVoiceShiftX = noteGroup.stemX + noteGroup.correctNotesWidth + spacing;
                        } else {
                            noteGroup.multiVoiceShiftX = noteGroup.correctNotesWidth + spacing;
                        }
                    } else {
                        mainGroup.multiVoiceShiftX = noteGroup.stemX + spacing;
                    }
                }
                break;
            case NoteHeadIntersectionKind.EndsTouchingOuter:
                if (mainGroup.direction === BeamDirection.Up) {
                    if (mainGroup.displacedNotes) {
                        noteGroup.multiVoiceShiftX = mainGroup.stemX;
                    } else {
                        const diff = mainGroup.stemX - noteGroup.stemX;
                        noteGroup.multiVoiceShiftX = diff;
                    }
                } else {
                    if (mainGroup.displacedNotes) {
                        noteGroup.multiVoiceShiftX = -noteGroup.stemX;
                    } else {
                        const diff = noteGroup.stemX - mainGroup.stemX;
                        mainGroup.multiVoiceShiftX = diff;
                    }
                }

                break;
            case NoteHeadIntersectionKind.EndsTouchingInner:
                if (mainGroup.direction === BeamDirection.Up) {
                    mainGroup.multiVoiceShiftX = mainGroup.stemX;
                    if (noteGroup.hasFlag) {
                        mainGroup.multiVoiceShiftX += spacing;
                    }
                } else {
                    noteGroup.multiVoiceShiftX = noteGroup.stemX;
                    if (mainGroup.hasFlag) {
                        noteGroup.multiVoiceShiftX += spacing;
                    }
                }
                break;
            case NoteHeadIntersectionKind.FullIntersection:
                // align note head center to stem
                if (!mainGroup.hasStem && !noteGroup.hasStem) {
                    // we can keep them aligned.
                } else if (mainGroup.direction === BeamDirection.Up) {
                    mainGroup.multiVoiceShiftX = mainGroup.stemX;
                    if (noteGroup.hasFlag) {
                        mainGroup.multiVoiceShiftX += spacing;
                    } else {
                        mainGroup.multiVoiceShiftX -= spacing;
                    }
                } else {
                    noteGroup.multiVoiceShiftX = noteGroup.stemX;
                    if (mainGroup.hasFlag) {
                        noteGroup.multiVoiceShiftX += spacing;
                    } else {
                        noteGroup.multiVoiceShiftX -= spacing;
                    }
                }

                break;
        }
    }

    private static _bottomStep(group: ScoreChordNoteHeadGroup) {
        return group.direction === BeamDirection.Up ? group.maxStep : group.minStep;
    }

    /**
     * Whether the note head at the step facing the other stem direction is on the far side of the stem.
     * Happens when voices of the same stem direction form a second there.
     */
    private static _isBottomNoteHeadDisplaced(group: ScoreChordNoteHeadGroup) {
        const steps = ScoreChordNoteHeadInfo._bottomStep(group);
        const correctNotes = group.correctNotes;
        for (let i = 0, j = correctNotes.length; i < j; i++) {
            if (correctNotes[i].steps === steps) {
                return false;
            }
        }
        return true;
    }

    private static _canShareNoteHead(mainGroup: ScoreChordNoteHeadGroup, thisGroup: ScoreChordNoteHeadGroup) {
        const mainGroupBottom = ScoreChordNoteHeadInfo._bottomStep(mainGroup);
        const thisGroupBottom = ScoreChordNoteHeadInfo._bottomStep(thisGroup);

        const mainGroupBottomNoteHead = ScoreChordNoteHeadInfo._singleNoteHeadAt(
            mainGroup.correctNotes,
            mainGroupBottom
        );
        if (!mainGroupBottomNoteHead) {
            return false;
        }

        const thisGroupBottomNoteHead = ScoreChordNoteHeadInfo._singleNoteHeadAt(
            thisGroup.correctNotes,
            thisGroupBottom
        );
        if (!thisGroupBottomNoteHead) {
            return false;
        }

        return ScoreChordNoteHeadInfo._canShareNoteHeadGlyph(mainGroupBottomNoteHead, thisGroupBottomNoteHead);
    }

    /**
     * The note head at the given steps, `null` if there is none or more than one.
     */
    private static _singleNoteHeadAt(infos: NoteHeadGlyphBase[], steps: number): NoteHeadGlyphBase | null {
        let noteHead: NoteHeadGlyphBase | null = null;
        for (let i = 0, j = infos.length; i < j; i++) {
            const info = infos[i];
            if (info.steps === steps) {
                if (noteHead) {
                    return null;
                }
                noteHead = info;
            }
        }
        return noteHead;
    }

    private static _canShareNoteHeadGlyph(mainGlyph: NoteHeadGlyphBase, thisGlyph: NoteHeadGlyphBase) {
        return (
            mainGlyph.glyphScale === thisGlyph.glyphScale &&
            mainGlyph.centerOnStem === thisGlyph.centerOnStem &&
            MusicFontSymbolLookup.isBlackNoteHead(mainGlyph.symbol) &&
            MusicFontSymbolLookup.isBlackNoteHead(thisGlyph.symbol)
        );
    }

    private static _checkIntersection(
        mainGroup: ScoreChordNoteHeadGroup,
        thisGroup: ScoreChordNoteHeadGroup
    ): NoteHeadIntersectionKind {
        let bottomGap = 0;
        if (mainGroup.direction === BeamDirection.Up) {
            const mainGroupBottom = mainGroup.maxStep;
            const thisGroupBottom = thisGroup.minStep;

            bottomGap = thisGroupBottom - mainGroupBottom;
        } else {
            const mainGroupBottom = mainGroup.minStep;
            const thisGroupBottom = thisGroup.maxStep;
            bottomGap = mainGroupBottom - thisGroupBottom;
        }

        if (bottomGap === 0) {
            return NoteHeadIntersectionKind.ExactMatch;
        }
        if (bottomGap === 1) {
            return NoteHeadIntersectionKind.EndsTouchingOuter;
        }
        if (bottomGap === -1) {
            return NoteHeadIntersectionKind.EndsTouchingInner;
        }
        if (bottomGap < 0) {
            return NoteHeadIntersectionKind.FullIntersection;
        }
        return NoteHeadIntersectionKind.NoIntersection;
    }
}

/**
 * How much the ledger lines above (top) or below (bottom) the staff are shortened on the left or right side.
 * @internal
 */
export class LedgerLineTrims {
    public topLeft: number = 0;
    public topRight: number = 0;
    public bottomLeft: number = 0;
    public bottomRight: number = 0;
}

/**
 * @internal
 */
export abstract class ScoreNoteChordGlyphBase extends Glyph {
    private _infos: NoteHeadGlyphBase[] = [];
    /**
     * The shared note head info and the group of this chord, only kept until the (multi-voice) layout is final.
     */
    private _noteHeadInfo: ScoreChordNoteHeadInfo | null = null;
    private _noteGroup: ScoreChordNoteHeadGroup | null = null;
    private _stemX = 0;
    private _multiVoiceShiftX = 0;

    public minStepsNote: NoteHeadGlyphBase | null = null;
    public maxStepsNote: NoteHeadGlyphBase | null = null;
    public get stemX(): number {
        return this._stemX;
    }

    public noteStartX: number = 0;

    public get hasTopLedgerLines(): boolean {
        if (!this.minStepsNote) {
            return false;
        }
        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        return scoreRenderer.getLineY(-1) >= scoreRenderer.getLineY(this.minStepsNote!.steps / 2);
    }

    public get hasBottomLedgerLines(): boolean {
        if (!this.minStepsNote) {
            return false;
        }
        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        return (
            scoreRenderer.getLineY(scoreRenderer.drawnLineCount) <= scoreRenderer.getLineY(this.maxStepsNote!.steps / 2)
        );
    }

    /**
     * How much the ledger lines are shortened to keep them apart from the ledger lines of the neighbouring
     * beat (Behind Bars, p. 26: ledger lines of adjacent notes should not join up, they may be slightly
     * shortened in cramped conditions). `null` while no ledger line was shortened.
     */
    private _ledgerLineTrims: LedgerLineTrims | null = null;

    public setLedgerLineTrimsLeft(top: number, bottom: number): void {
        const trims = this._ensureLedgerLineTrims(top, bottom);
        if (trims) {
            trims.topLeft = top;
            trims.bottomLeft = bottom;
        }
    }

    public setLedgerLineTrimsRight(top: number, bottom: number): void {
        const trims = this._ensureLedgerLineTrims(top, bottom);
        if (trims) {
            trims.topRight = top;
            trims.bottomRight = bottom;
        }
    }

    private _ensureLedgerLineTrims(top: number, bottom: number): LedgerLineTrims | null {
        let trims = this._ledgerLineTrims;
        if (!trims && (top !== 0 || bottom !== 0)) {
            trims = new LedgerLineTrims();
            this._ledgerLineTrims = trims;
        }
        return trims;
    }

    /**
     * How far the ledger lines reach beyond the note heads on each side (before shortening).
     */
    public get ledgerLineExtension(): number {
        return this.renderer.smuflMetrics.legerLineExtension * this.scale;
    }

    public onTimeX = 0;

    public constructor() {
        super(0, 0);
    }

    public abstract get direction(): BeamDirection;
    public abstract get hasFlag(): boolean;
    public abstract get hasStem(): boolean;
    public abstract get scale(): number;

    public override getBoundingBoxTop(): number {
        return this.minStepsNote ? this.minStepsNote.getBoundingBoxTop() : this.y;
    }

    public override getBoundingBoxBottom(): number {
        return this.maxStepsNote ? this.maxStepsNote.getBoundingBoxBottom() : this.y + this.height;
    }

    protected add(noteGlyph: NoteHeadGlyphBase, noteSteps: number, note: Note | null = null): void {
        noteGlyph.steps = noteSteps;
        noteGlyph.note = note;
        const infos = this._infos;
        if (infos.length === 0) {
            this._infos = [noteGlyph];
        } else {
            infos.push(noteGlyph);
        }
        if (!this.minStepsNote || this.minStepsNote.steps > noteSteps) {
            this.minStepsNote = noteGlyph;
        }
        if (!this.maxStepsNote || this.maxStepsNote.steps < noteSteps) {
            this.maxStepsNote = noteGlyph;
        }
    }

    /**
     * The main note head of the given note, `null` if the note has none in this chord.
     */
    protected getNoteGlyph(note: Note): NoteHeadGlyphBase | null {
        const infos = this._infos;
        for (let i = 0, j = infos.length; i < j; i++) {
            const n = infos[i].note;
            if (n !== null && n.id === note.id) {
                return infos[i];
            }
        }
        return null;
    }

    protected abstract getScoreChordNoteHeadInfo(): ScoreChordNoteHeadInfo;

    private _prepareForLayout(info: ScoreChordNoteHeadInfo | null): ScoreChordNoteHeadGroup {
        const direction: BeamDirection = this.direction;

        // sorting helps avoiding weird alignments
        // if the stem is upwards we go bottom-up otherwise top-down
        // this ensures we start placing notes on the primary side.
        ScoreNoteChordGlyphBase._sortBySteps(this._infos, direction === BeamDirection.Up);

        // obtain group we belong to
        let group = info ? info.getGroup(direction) : null;
        const hasFlag = this.hasFlag;
        const hasStem = this.hasStem;
        if (group) {
            if (hasFlag) {
                group.hasFlag = hasFlag;
            }
            if (hasStem) {
                group.hasStem = hasStem;
            }
        } else {
            group = {
                correctNotes: [],
                correctNotesWidth: 0,
                correctNotesMinX: Number.NaN,
                displacedNotes: null,
                direction,
                stemX: 0,
                maxX: Number.NaN,
                minX: Number.NaN,
                minStep: Number.NaN,
                maxStep: Number.NaN,
                multiVoiceShiftX: 0,
                hasFlag,
                hasStem
            };
            if (info) {
                info.setGroup(group);
            }
        }
        return group;
    }

    /**
     * Stable in-place sort by steps (descending or ascending).
     */
    private static _sortBySteps(infos: NoteHeadGlyphBase[], descending: boolean) {
        for (let i = 1, j = infos.length; i < j; i++) {
            const info = infos[i];
            const steps = info.steps;
            let k = i - 1;
            while (k >= 0 && (descending ? infos[k].steps < steps : infos[k].steps > steps)) {
                infos[k + 1] = infos[k];
                k--;
            }
            infos[k + 1] = info;
        }
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

        // NOTE:
        // * This logic is close to what MuseScore does
        // * Dorico has own "note groups" for every voice, even if they are in the same stem-direction.
        //   Then they displace the groups similarly like with different stem-directions (never merging note heads)

        // only chords of different voices share note head groups and need the multi-voice layout
        const info = this.renderer.bar.isMultiVoice ? this.getScoreChordNoteHeadInfo() : null;
        const noteGroup = this._prepareForLayout(info);

        this._collectNoteDisplacements(noteGroup);
        this._alignNoteHeadsGroup(noteGroup);

        this._updateSizes(noteGroup);

        if (info) {
            this._noteGroup = noteGroup;
            this._noteHeadInfo = info;
        }
    }

    private _updateSizes(noteGroup: ScoreChordNoteHeadGroup) {
        this._stemX = noteGroup.stemX + noteGroup.multiVoiceShiftX;
        this._multiVoiceShiftX = noteGroup.multiVoiceShiftX;

        // NOTE: no noteGroup.multiVoiceShiftX for onTimeX. we don't shift the time position on displacement
        // otherwise the alignment would automatically be corrected and we get no actual "shift"

        // the center of score notes, (used for aligning the beat to the right on-time position)
        // is always the center of the "correct note" position.
        // a group without note heads (e.g. bend helper notes not shown in this notation mode) has no extent
        if (Number.isNaN(noteGroup.minX)) {
            this.onTimeX = this.noteStartX;
            this.width = this.noteStartX;
            return;
        }

        this.onTimeX = noteGroup.correctNotesMinX + noteGroup.correctNotesWidth / 2;

        this.width = this.noteStartX + noteGroup.multiVoiceShiftX + noteGroup.maxX - noteGroup.minX;
    }

    public doMultiVoiceLayout() {
        const info = this._noteHeadInfo;
        const noteGroup = this._noteGroup;
        if (info === null || noteGroup === null) {
            return;
        }
        info.finish(this.renderer.smuflMetrics);
        this._updateSizes(noteGroup);
        this._noteHeadInfo = null;
        this._noteGroup = null;
    }

    private _alignNoteHeadsGroup(noteGroup: ScoreChordNoteHeadGroup) {
        // align all notes so that they align with the stem positions
        if (noteGroup.direction === BeamDirection.Up) {
            this._alignNoteHeads(noteGroup, noteGroup.correctNotes, true, true);
            if (noteGroup.displacedNotes) {
                this._alignNoteHeads(noteGroup, noteGroup.displacedNotes!, false, false);
            }
        } else {
            this._alignNoteHeads(noteGroup, noteGroup.correctNotes, false, true);
            if (noteGroup.displacedNotes) {
                this._alignNoteHeads(noteGroup, noteGroup.displacedNotes!, true, false);
            }
        }
    }
    private _alignNoteHeads(
        noteGroup: ScoreChordNoteHeadGroup,
        infos: NoteHeadGlyphBase[],
        leftOfStem: boolean,
        isCorrectSide: boolean
    ) {
        // NOTE: for now we do not displace "third" voices even further but they overlap
        for (let i = 0, j = infos.length; i < j; i++) {
            const glyph = infos[i];
            // align directly
            glyph.x = noteGroup.stemX;

            //
            if (glyph.centerOnStem) {
                // no offset
            }
            // shift left/right according to stem position or glyph size
            else if (leftOfStem) {
                glyph.x -= glyph.getStemX(this.renderer.smuflMetrics, BeamDirection.Up);
            } else {
                glyph.x += glyph.getStemX(this.renderer.smuflMetrics, BeamDirection.Down);
            }

            if (isCorrectSide) {
                noteGroup.correctNotesWidth = Math.max(noteGroup.correctNotesWidth, glyph.width);
                if (Number.isNaN(noteGroup.correctNotesMinX) || glyph.x < noteGroup.correctNotesMinX) {
                    noteGroup.correctNotesMinX = glyph.x;
                }
            }

            // update whole group
            if (Number.isNaN(noteGroup.minX) || glyph.x < noteGroup.minX) {
                noteGroup.minX = glyph.x;
            }
            const maxX = glyph.x + glyph.width;
            if (Number.isNaN(noteGroup.maxX) || maxX > noteGroup.maxX) {
                noteGroup.maxX = maxX;
            }
        }
    }

    private static _hasCollision(infos: NoteHeadGlyphBase[], info: NoteHeadGlyphBase) {
        const steps = info.steps;
        for (let i = 0, j = infos.length; i < j; i++) {
            const s = infos[i].steps;
            if (s === steps || s === steps + 1 || s === steps - 1) {
                return true;
            }
        }
        return false;
    }

    private _collectNoteDisplacements(noteGroup: ScoreChordNoteHeadGroup) {
        for (const info of this._infos) {
            info.renderer = this.renderer;
            info.doLayout();

            const isGroupCollision = ScoreNoteChordGlyphBase._hasCollision(noteGroup.correctNotes, info);

            if (!isGroupCollision) {
                const correctNotes = noteGroup.correctNotes;
                if (correctNotes.length === 0) {
                    noteGroup.correctNotes = [info];
                } else {
                    correctNotes.push(info);
                }
            } else if (!noteGroup.displacedNotes) {
                noteGroup.displacedNotes = [info];
            } else {
                noteGroup.displacedNotes!.push(info);
            }

            if (Number.isNaN(noteGroup.minStep) || info.steps < noteGroup.minStep) {
                noteGroup.minStep = info.steps;
            }

            if (Number.isNaN(noteGroup.maxStep) || info.steps > noteGroup.maxStep) {
                noteGroup.maxStep = info.steps;
            }

            this._updateGroupStemXPosition(info, noteGroup);
        }
    }

    private _updateGroupStemXPosition(info: NoteHeadGlyphBase, noteGroup: ScoreChordNoteHeadGroup) {
        let stemX = info.getStemX(
            this.renderer.smuflMetrics,
            noteGroup.direction === BeamDirection.Up || noteGroup.displacedNotes ? BeamDirection.Up : BeamDirection.Down
        );
        stemX += this.noteStartX;

        if (stemX > noteGroup.stemX) {
            noteGroup.stemX = stemX;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;

        this._paintLedgerLines(cx, cy, canvas);
        cx += this._multiVoiceShiftX;

        const infos = this._infos;
        for (let i = 0, j = infos.length; i < j; i++) {
            const g = infos[i];
            g.renderer = this.renderer;
            g.paint(cx, cy, canvas);
        }
    }

    private _paintLedgerLines(cx: number, cy: number, canvas: ICanvas) {
        if (!this.minStepsNote) {
            return;
        }

        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        const previousColor = ElementStyleHelper.applyBar(
            canvas,
            BarSubElement.StandardNotationStaffLine,
            scoreRenderer.bar,
            true
        );
        try {
            const scale = this.scale;
            const lineExtension: number = this.ledgerLineExtension;
            const lineWidth: number = this.width + lineExtension * 2 - this.noteStartX;

            const lineSpacing = scoreRenderer.getLineHeight(1);
            const firstTopLedgerY = scoreRenderer.getLineY(-1);
            const firstBottomLedgerY = scoreRenderer.getLineY(scoreRenderer.drawnLineCount);
            const minNoteLineY = scoreRenderer.getLineY(this.minStepsNote!.steps / 2);
            const maxNoteLineY = scoreRenderer.getLineY(this.maxStepsNote!.steps / 2);

            const lineYOffset = (this.renderer.smuflMetrics.legerLineThickness * scale) / 2;
            const trims = this._ledgerLineTrims;
            const topTrimLeft = trims ? trims.topLeft : 0;
            const topTrimRight = trims ? trims.topRight : 0;
            const bottomTrimLeft = trims ? trims.bottomLeft : 0;
            const bottomTrimRight = trims ? trims.bottomRight : 0;

            let y = firstTopLedgerY;
            while (y >= minNoteLineY) {
                canvas.fillRect(
                    cx - lineExtension + this.noteStartX + topTrimLeft,
                    cy + y - lineYOffset,
                    lineWidth - topTrimLeft - topTrimRight,
                    this.renderer.smuflMetrics.legerLineThickness * scale
                );
                y -= lineSpacing;
            }

            y = firstBottomLedgerY;
            while (y <= maxNoteLineY) {
                canvas.fillRect(
                    cx - lineExtension + this.noteStartX + bottomTrimLeft,
                    cy + y - lineYOffset,
                    lineWidth - bottomTrimLeft - bottomTrimRight,
                    this.renderer.smuflMetrics.legerLineThickness * scale
                );
                y += lineSpacing;
            }
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }
}
