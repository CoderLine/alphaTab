import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { TabFingeringSegment } from '@coderline/alphatab/rendering/utils/TabFingeringSegment';

/**
 * Cost weights for {@link TabFingeringSolver}. Position weights follow {@link FingeringOptions}.
 * @internal
 */
export class TabFingeringOptions {
    /**
     * The highest fret counted from the nut; notes using a higher fret in the model raise the limit for themselves.
     */
    public defaultMaxFret: number = 24;
    public maxSpan: number = 5;
    public spanWeight: number = 0.25;
    /** Per fret of span beyond {@link maxSpan}. */
    public overSpanPenalty: number = 10;
    public highFretThreshold: number = 12;
    public highFretPenaltyWeight: number = 0.5;
    /** Negative = prefer open strings. */
    public openStringBonus: number = -1;
    /** Cost of placing a note on a string which is still sounding from an earlier beat. */
    public occupancyPenalty: number = 8;
    public asArtificialPenalty: number = 20;
    public handMovementWeight: number = 1;
    public beamWidth: number = 16;
    public maxLeavesPerState: number = 256;
}

/**
 * Decides on which string and fret tab notes are displayed when the staff is transposed.
 * Works purely on the model and never modifies it.
 *
 * Notes keep their model string whenever the transposed fret is playable there. Otherwise the
 * bars connected by ties, slides and hammer-ons/pull-offs are re-fingered together, preferring
 * (in this order) fewer unplayable notes, fewer notes moved to another string and a smaller
 * hand movement and stretch.
 * @internal
 */
export class TabFingeringSolver {
    /**
     * The harmonic values of the natural harmonic nodes, as produced by
     * {@link ModelUtils.deltaFretToHarmonicValue} plus the extra nodes known by {@link ModelUtils.harmonicValueToPitch}.
     */
    public static readonly naturalNodeValues: number[] = [
        12, 7, 19, 5, 24, 4, 9, 16, 3.2, 2.7, 5.8, 9.6, 14.7, 2.4, 8.2, 17, 21.7
    ];

    // the semitones above the open string for each entry of naturalNodeValues
    private static readonly _naturalNodeIntervals: number[] = [
        12, 19, 19, 24, 24, 28, 28, 28, 31, 34, 34, 34, 34, 36, 36, 36, 36
    ];

    // Note.nextNoteOnSameLine and findHammerPullDestination search up to 3 bars ahead
    private static readonly _maxLinkBarDistance: number = 4;

    private static readonly _defaultOptions: TabFingeringOptions = new TabFingeringOptions();

    /**
     * Whether the tab of the given staff is displayed with a fingering differing from the model.
     */
    public static isActive(staff: Staff): boolean {
        return staff.transpositionPitch !== 0 && !staff.isPercussion && staff.tuning.length > 0;
    }

    public static isNaturalHarmonic(note: Note): boolean {
        return note.harmonicType === HarmonicType.Natural && !ModelUtils.isAlmostEqualTo(note.harmonicValue, 0);
    }

    /**
     * Finds the natural harmonic node sounding the given interval above the open string.
     * @param interval The semitones above the open string.
     * @param preferredValue The harmonic value to stay closest to.
     * @returns The index into {@link naturalNodeValues} or -1 if no node sounds this interval.
     */
    public static findNaturalNode(interval: number, preferredValue: number): number {
        let best = -1;
        let bestDistance = 0;
        const intervals = TabFingeringSolver._naturalNodeIntervals;
        const values = TabFingeringSolver.naturalNodeValues;
        for (let i = 0; i < intervals.length; i++) {
            if (intervals[i] === interval) {
                const distance = Math.abs(values[i] - preferredValue);
                if (best === -1 || distance < bestDistance) {
                    best = i;
                    bestDistance = distance;
                }
            }
        }
        return best;
    }

    /**
     * The node of a natural harmonic which stays on its model string.
     */
    public static findNaturalNodeOnModelString(note: Note): number {
        const staff = note.beat.voice.bar.staff;
        return TabFingeringSolver.findNaturalNode(
            ModelUtils.harmonicValueToPitch(note.harmonicValue) - staff.transpositionPitch,
            note.harmonicValue
        );
    }

    /**
     * Whether no note before the given bar is linked to a note in or after it.
     */
    public static isSegmentStart(staff: Staff, barIndex: number): boolean {
        const firstChecked = Math.max(0, barIndex - TabFingeringSolver._maxLinkBarDistance);
        for (let b = barIndex - 1; b >= firstChecked; b--) {
            for (const voice of staff.bars[b].voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        for (let kind = 0; kind < 3; kind++) {
                            const target = TabFingeringSolver.nextLinked(note, kind);
                            if (target !== null && target.beat.voice.bar.index >= barIndex) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    /**
     * The first bar of the segment containing the given bar.
     */
    public static segmentStart(staff: Staff, barIndex: number): number {
        let b = barIndex;
        while (b > 0 && !TabFingeringSolver.isSegmentStart(staff, b)) {
            b--;
        }
        return b;
    }

    /**
     * The first bar whose tab fingering may change when the given bar changes, considering the transposed tabs of all tracks.
     */
    public static firstAffectedBarIndex(tracks: Track[], barIndex: number): number {
        let first = barIndex;
        for (const track of tracks) {
            for (const staff of track.staves) {
                if (staff.showTablature && TabFingeringSolver.isActive(staff) && barIndex < staff.bars.length) {
                    first = Math.min(first, TabFingeringSolver.segmentStart(staff, barIndex));
                }
            }
        }
        return first;
    }

    /**
     * The last bar of the segment starting at the given bar.
     */
    public static segmentEnd(staff: Staff, firstBarIndex: number): number {
        let last = firstBarIndex;
        let scanned = firstBarIndex;
        while (scanned <= last && scanned < staff.bars.length) {
            for (const voice of staff.bars[scanned].voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        for (let kind = 0; kind < 3; kind++) {
                            const target = TabFingeringSolver.nextLinked(note, kind);
                            if (target !== null && target.beat.voice.bar.index > last) {
                                last = target.beat.voice.bar.index;
                            }
                        }
                    }
                }
            }
            scanned++;
        }
        return last;
    }

    /**
     * Solves the display fingering of the given bars, which must form a segment.
     * @returns The fingering or null if all notes keep their model string and fret shifted by the transposition.
     */
    public static solve(
        staff: Staff,
        firstBarIndex: number,
        lastBarIndex: number,
        options?: TabFingeringOptions
    ): TabFingeringSegment | null {
        const run = new TabFingeringRun(
            staff,
            firstBarIndex,
            lastBarIndex,
            options ?? TabFingeringSolver._defaultOptions
        );
        return run.solve();
    }

    /**
     * The note which has to stay on the same string as the given one: 0 = tie, 1 = slide, 2 = hammer-on/pull-off.
     */
    public static nextLinked(note: Note, kind: number): Note | null {
        switch (kind) {
            case 0:
                return note.tieDestination;
            case 1:
                return note.slideOutType === SlideOutType.Shift || note.slideOutType === SlideOutType.Legato
                    ? note.slideTarget
                    : null;
            case 2:
                return note.isHammerPullOrigin ? note.hammerPullDestination : null;
        }
        return null;
    }

    public static previousLinked(note: Note, kind: number): Note | null {
        switch (kind) {
            case 0:
                return note.isTieDestination ? note.tieOrigin : null;
            case 1:
                return note.slideOrigin;
            case 2:
                return note.hammerPullOrigin;
        }
        return null;
    }
}

/**
 * The state of one {@link TabFingeringSolver.solve} call.
 *
 * Notes linked by ties, slides and hammer-ons/pull-offs form a group which moves as a whole by a
 * string delta, keeping the string offsets of the model. The beats of all voices are merged into
 * time slices and a beam search over the slices picks one delta per group.
 * @internal
 */
export class TabFingeringRun {
    private static readonly _kindSkip: number = 0;
    private static readonly _kindNormal: number = 1;
    private static readonly _kindDead: number = 2;
    private static readonly _kindNatural: number = 3;

    private static readonly _graceRankMain: number = 1000;
    private static readonly _ticksPerQuarter: number = 960;

    private readonly _staff: Staff;
    private readonly _firstBarIndex: number;
    private readonly _lastBarIndex: number;
    private readonly _options: TabFingeringOptions;
    private readonly _capo: number;
    private readonly _tuning: number[];
    private readonly _stringCount: number;

    private _barVoiceBase!: Int32Array;
    private _voiceBeatBase!: Int32Array;
    private _beatNoteBase!: Int32Array;
    private _notes: Note[] = [];

    private _kind!: Uint8Array;
    private _target!: Int32Array;
    private _originalString!: Int32Array;
    private _maxFret!: Int32Array;
    private _noOpen!: Uint8Array;
    private _trill!: Int32Array;
    private _group!: Int32Array;
    private _slice!: Int32Array;
    private _sustainEnd!: Int32Array;

    private _groupCount: number = 0;
    private _groupFirst: number[] = [];
    private _groupLast: number[] = [];
    private _groupOptionBase: number[] = [];
    private _groupOptions: number[] = [];

    private _sliceTick: number[] = [];
    private _sliceNoteBase: number[] = [];
    private _sliceNotes: number[] = [];
    private _soundBase: number[] = [];
    private _soundNotes: number[] = [];
    private _activeBase: number[] = [];
    private _activeGroups: number[] = [];

    // results of _evaluate
    private _evalFret: number = 0;
    private _evalNode: number = -1;
    private _evalFlags: number = 0;

    public constructor(staff: Staff, firstBarIndex: number, lastBarIndex: number, options: TabFingeringOptions) {
        this._staff = staff;
        this._firstBarIndex = firstBarIndex;
        this._lastBarIndex = lastBarIndex;
        this._options = options;
        this._capo = staff.capo;
        this._tuning = staff.tuning;
        this._stringCount = staff.tuning.length;
    }

    public solve(): TabFingeringSegment | null {
        this._collectNotes();
        if (this._isIdentity()) {
            return null;
        }

        this._buildGroups();
        this._buildSlices();
        this._buildGroupSpans();
        const groupDelta = this._search();

        const segment = new TabFingeringSegment(
            this._firstBarIndex,
            this._lastBarIndex,
            this._barVoiceBase,
            this._voiceBeatBase,
            this._beatNoteBase,
            this._notes.length
        );
        for (let i = 0; i < this._notes.length; i++) {
            if (this._kind[i] === TabFingeringRun._kindSkip) {
                continue;
            }
            const delta = groupDelta[this._group[i]];
            const str = this._originalString[i] + delta;
            const valid = this._evaluate(i, str);
            let flags = this._evalFlags;
            if (delta !== 0) {
                flags |= TabFingeringSegment.flagMoved;
            }
            if (!valid) {
                flags |= TabFingeringSegment.flagUnplayable;
            }
            segment.set(i, str, this._evalFret, this._evalNode, flags);
        }
        return segment;
    }

    private _collectNotes(): void {
        const bars = this._staff.bars;
        let voiceCount = 0;
        let beatCount = 0;
        for (let b = this._firstBarIndex; b <= this._lastBarIndex; b++) {
            for (const voice of bars[b].voices) {
                voiceCount++;
                beatCount += voice.beats.length;
            }
        }

        this._barVoiceBase = new Int32Array(this._lastBarIndex - this._firstBarIndex + 1);
        this._voiceBeatBase = new Int32Array(voiceCount);
        this._beatNoteBase = new Int32Array(beatCount);

        const notes = this._notes;
        let voiceIndex = 0;
        let beatIndex = 0;
        for (let b = this._firstBarIndex; b <= this._lastBarIndex; b++) {
            this._barVoiceBase[b - this._firstBarIndex] = voiceIndex;
            for (const voice of bars[b].voices) {
                this._voiceBeatBase[voiceIndex] = beatIndex;
                voiceIndex++;
                for (const beat of voice.beats) {
                    this._beatNoteBase[beatIndex] = notes.length;
                    beatIndex++;
                    for (const note of beat.notes) {
                        notes.push(note);
                    }
                }
            }
        }

        const count = notes.length;
        this._kind = new Uint8Array(count);
        this._target = new Int32Array(count);
        this._originalString = new Int32Array(count);
        this._maxFret = new Int32Array(count);
        this._noOpen = new Uint8Array(count);
        this._trill = new Int32Array(count);
        this._group = new Int32Array(count);
        this._slice = new Int32Array(count);
        this._sustainEnd = new Int32Array(count);

        const transpositionPitch = this._staff.transpositionPitch;
        for (let i = 0; i < count; i++) {
            const note = notes[i];
            this._group[i] = -1;
            this._slice[i] = -1;
            if (!note.isStringed || note.string < 1 || note.string > this._stringCount) {
                this._kind[i] = TabFingeringRun._kindSkip;
                continue;
            }

            if (note.isDead) {
                this._kind[i] = TabFingeringRun._kindDead;
                this._target[i] = note.realValueWithoutHarmonic;
            } else if (TabFingeringSolver.isNaturalHarmonic(note)) {
                this._kind[i] = TabFingeringRun._kindNatural;
                this._target[i] = note.realValue;
            } else {
                this._kind[i] = TabFingeringRun._kindNormal;
                this._target[i] = note.realValueWithoutHarmonic;
            }
            this._originalString[i] = note.string;
            this._maxFret[i] = Math.max(this._options.defaultMaxFret - this._capo, note.fret);
            this._noOpen[i] = TabFingeringRun._needsFrettedString(note) ? 1 : 0;
            this._trill[i] = note.isTrill ? note.trillValue - transpositionPitch : -1;
        }
    }

    private static _needsFrettedString(note: Note): boolean {
        if (note.hasBend || note.isContinuedBend || note.vibrato !== VibratoType.None || note.isLeftHandTapped) {
            return true;
        }
        if (note.slideInType === SlideInType.IntoFromBelow || note.slideInType === SlideInType.IntoFromAbove) {
            return true;
        }
        switch (note.slideOutType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
            case SlideOutType.OutUp:
            case SlideOutType.OutDown:
                return true;
        }
        if (note.slideOrigin !== null) {
            return true;
        }
        // a hammer-on cannot end on an open string, a pull-off can
        const hammerPullOrigin = note.hammerPullOrigin;
        if (hammerPullOrigin !== null && hammerPullOrigin.realValue < note.realValue) {
            return true;
        }
        return false;
    }

    private _stringPitch(str: number): number {
        return this._capo + this._tuning[this._stringCount - str];
    }

    /**
     * Evaluates the note on the given string into {@link _evalFret}, {@link _evalNode} and {@link _evalFlags}.
     * @returns Whether the note can be played there.
     */
    private _evaluate(i: number, str: number): boolean {
        const stringPitch = this._stringPitch(str);
        const target = this._target[i];
        const maxFret = this._maxFret[i];
        this._evalNode = -1;
        this._evalFlags = 0;
        switch (this._kind[i]) {
            case TabFingeringRun._kindDead:
                this._evalFret = target - stringPitch;
                return true;
            case TabFingeringRun._kindNatural: {
                const node = TabFingeringSolver.findNaturalNode(target - stringPitch, this._notes[i].harmonicValue);
                if (node >= 0) {
                    this._evalFret = 0;
                    this._evalNode = node;
                    return true;
                }
                const baseFret = target - 12 - stringPitch;
                this._evalFret = baseFret;
                this._evalFlags = TabFingeringSegment.flagAsArtificial;
                return baseFret >= 0 && baseFret <= maxFret;
            }
        }

        const fret = target - stringPitch;
        this._evalFret = fret;
        if (fret < 0 || fret > maxFret) {
            return false;
        }
        if (fret === 0 && this._noOpen[i] !== 0) {
            return false;
        }
        const trill = this._trill[i];
        if (trill >= 0) {
            const trillFret = trill - stringPitch;
            if (trillFret < 0 || trillFret > maxFret) {
                return false;
            }
        }
        return true;
    }

    private _isIdentity(): boolean {
        for (let i = 0; i < this._notes.length; i++) {
            if (this._kind[i] !== TabFingeringRun._kindSkip && !this._evaluate(i, this._originalString[i])) {
                return false;
            }
        }
        return true;
    }

    private _indexOf(note: Note): number {
        const bar = note.beat.voice.bar;
        if (bar.staff !== this._staff || bar.index < this._firstBarIndex || bar.index > this._lastBarIndex) {
            return -1;
        }
        const voiceIndex = this._barVoiceBase[bar.index - this._firstBarIndex] + note.beat.voice.index;
        return this._beatNoteBase[this._voiceBeatBase[voiceIndex] + note.beat.index] + note.index;
    }

    private _buildGroups(): void {
        const count = this._notes.length;
        const stack: number[] = [];
        const groupMembers: number[] = [];
        const groupMemberBase: number[] = [];
        for (let i = 0; i < count; i++) {
            if (this._kind[i] === TabFingeringRun._kindSkip || this._group[i] >= 0) {
                continue;
            }
            const g = this._groupCount;
            this._groupCount++;
            groupMemberBase.push(groupMembers.length);
            this._group[i] = g;
            stack.push(i);
            while (stack.length > 0) {
                const current = stack.pop()!;
                groupMembers.push(current);
                const note = this._notes[current];
                for (let kind = 0; kind < 3; kind++) {
                    for (let direction = 0; direction < 2; direction++) {
                        const linked =
                            direction === 0
                                ? TabFingeringSolver.nextLinked(note, kind)
                                : TabFingeringSolver.previousLinked(note, kind);
                        if (linked === null) {
                            continue;
                        }
                        const linkedIndex = this._indexOf(linked);
                        if (
                            linkedIndex >= 0 &&
                            this._kind[linkedIndex] !== TabFingeringRun._kindSkip &&
                            this._group[linkedIndex] < 0
                        ) {
                            this._group[linkedIndex] = g;
                            stack.push(linkedIndex);
                        }
                    }
                }
            }
        }
        groupMemberBase.push(groupMembers.length);

        // the string deltas keeping all members on the instrument, playable ones first
        const options = this._groupOptions;
        const optionFret: number[] = [];
        for (let g = 0; g < this._groupCount; g++) {
            this._groupOptionBase.push(options.length);
            const memberStart = groupMemberBase[g];
            const memberEnd = groupMemberBase[g + 1];
            let minString = this._stringCount;
            let maxString = 1;
            let head = groupMembers[memberStart];
            for (let m = memberStart; m < memberEnd; m++) {
                const member = groupMembers[m];
                minString = Math.min(minString, this._originalString[member]);
                maxString = Math.max(maxString, this._originalString[member]);
                if (member < head) {
                    head = member;
                }
            }

            const optionStart = options.length;
            let hasZero = false;
            for (let delta = 1 - minString; delta <= this._stringCount - maxString; delta++) {
                let valid = true;
                for (let m = memberStart; m < memberEnd && valid; m++) {
                    const member = groupMembers[m];
                    valid = this._evaluate(member, this._originalString[member] + delta);
                }
                if (!valid) {
                    continue;
                }
                this._evaluate(head, this._originalString[head] + delta);
                const headFret = this._evalFret;
                // order: model string, then lower fret, then lower string
                let insertAt = options.length;
                if (delta === 0) {
                    insertAt = optionStart;
                    hasZero = true;
                } else {
                    while (insertAt > optionStart) {
                        const previousDelta = options[insertAt - 1];
                        const previousFret = optionFret[insertAt - 1];
                        if (
                            previousDelta === 0 ||
                            previousFret < headFret ||
                            (previousFret === headFret && previousDelta < delta)
                        ) {
                            break;
                        }
                        insertAt--;
                    }
                }
                options.splice(insertAt, 0, delta);
                optionFret.splice(insertAt, 0, headFret);
            }
            if (!hasZero) {
                // last resort: keep the model strings, unplayable notes are flagged
                options.push(0);
                optionFret.push(0);
            }
        }
        this._groupOptionBase.push(options.length);
    }

    private static _graceRank(beat: Beat): number {
        return beat.graceType === GraceType.None ? TabFingeringRun._graceRankMain : beat.graceIndex;
    }

    private static _compareBeats(a: Beat, b: Beat): number {
        if (a.voice.bar.index !== b.voice.bar.index) {
            return a.voice.bar.index - b.voice.bar.index;
        }
        if (a.displayStart !== b.displayStart) {
            return a.displayStart - b.displayStart;
        }
        const rankA = TabFingeringRun._graceRank(a);
        const rankB = TabFingeringRun._graceRank(b);
        if (rankA !== rankB) {
            return rankA - rankB;
        }
        if (a.voice.index !== b.voice.index) {
            return a.voice.index - b.voice.index;
        }
        return a.index - b.index;
    }

    private _buildSlices(): void {
        const bars = this._staff.bars;
        const beats: Beat[] = [];
        for (let b = this._firstBarIndex; b <= this._lastBarIndex; b++) {
            for (const voice of bars[b].voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        const i = this._indexOf(note);
                        if (this._kind[i] !== TabFingeringRun._kindSkip) {
                            beats.push(beat);
                            break;
                        }
                    }
                }
            }
        }
        beats.sort((a, b) => TabFingeringRun._compareBeats(a, b));

        const endTick: number[] = [];
        const sliceTick = this._sliceTick;
        let previous: Beat | null = null;
        for (const beat of beats) {
            if (
                previous === null ||
                previous.voice.bar.index !== beat.voice.bar.index ||
                previous.displayStart !== beat.displayStart ||
                TabFingeringRun._graceRank(previous) !== TabFingeringRun._graceRank(beat)
            ) {
                this._sliceNoteBase.push(this._sliceNotes.length);
                sliceTick.push(beat.absoluteDisplayStart);
            }
            previous = beat;
            const slice = sliceTick.length - 1;
            for (const note of beat.notes) {
                const i = this._indexOf(note);
                if (this._kind[i] === TabFingeringRun._kindSkip) {
                    continue;
                }
                this._slice[i] = slice;
                this._sliceNotes.push(i);
                let end = beat.absoluteDisplayStart + beat.displayDuration;
                const letRingDestination = note.isLetRing ? note.letRingDestination : null;
                if (letRingDestination !== null) {
                    const destinationBeat = letRingDestination.beat;
                    end = Math.max(end, destinationBeat.absoluteDisplayStart + destinationBeat.displayDuration);
                }
                endTick.push(end);
            }
        }
        this._sliceNoteBase.push(this._sliceNotes.length);

        // notes still sounding in later slices
        const sliceCount = sliceTick.length;
        const soundCount: number[] = new Array<number>(sliceCount).fill(0);
        for (let k = 0; k < this._sliceNotes.length; k++) {
            const i = this._sliceNotes[k];
            let last = this._slice[i];
            while (last + 1 < sliceCount && sliceTick[last + 1] < endTick[k]) {
                last++;
                soundCount[last]++;
            }
            this._sustainEnd[i] = last;
        }
        this._fillBuckets(soundCount, this._soundBase);
        const soundFill: number[] = this._soundBase.slice(0, sliceCount);
        for (let s = 0; s < this._soundBase[sliceCount]; s++) {
            this._soundNotes.push(0);
        }
        for (let k = 0; k < this._sliceNotes.length; k++) {
            const i = this._sliceNotes[k];
            for (let t = this._slice[i] + 1; t <= this._sustainEnd[i]; t++) {
                this._soundNotes[soundFill[t]] = i;
                soundFill[t]++;
            }
        }
    }

    private _fillBuckets(counts: number[], base: number[]): void {
        let sum = 0;
        for (const c of counts) {
            base.push(sum);
            sum += c;
        }
        base.push(sum);
    }

    private _buildGroupSpans(): void {
        const groupCount = this._groupCount;
        for (let g = 0; g < groupCount; g++) {
            this._groupFirst.push(-1);
            this._groupLast.push(-1);
        }
        for (let i = 0; i < this._notes.length; i++) {
            const g = this._group[i];
            if (g < 0 || this._slice[i] < 0) {
                continue;
            }
            if (this._groupFirst[g] < 0 || this._slice[i] < this._groupFirst[g]) {
                this._groupFirst[g] = this._slice[i];
            }
            if (this._sustainEnd[i] > this._groupLast[g]) {
                this._groupLast[g] = this._sustainEnd[i];
            }
        }

        const sliceCount = this._sliceTick.length;
        const activeCount: number[] = new Array<number>(sliceCount).fill(0);
        for (let g = 0; g < groupCount; g++) {
            for (let t = this._groupFirst[g]; t >= 0 && t <= this._groupLast[g]; t++) {
                activeCount[t]++;
            }
        }
        this._fillBuckets(activeCount, this._activeBase);
        const activeFill: number[] = this._activeBase.slice(0, sliceCount);
        for (let s = 0; s < this._activeBase[sliceCount]; s++) {
            this._activeGroups.push(0);
        }
        for (let g = 0; g < groupCount; g++) {
            for (let t = this._groupFirst[g]; t >= 0 && t <= this._groupLast[g]; t++) {
                this._activeGroups[activeFill[t]] = g;
                activeFill[t]++;
            }
        }
    }

    /**
     * Beam search over the slices, each state holding the string delta of every group active in its slice.
     * @returns The string delta per group.
     */
    private _search(): number[] {
        const options = this._options;
        const beamWidth = options.beamWidth;
        const sliceCount = this._sliceTick.length;

        // committed states of all slices
        const stateBase: number[] = [];
        const stateCount: number[] = [];
        const stUnplayable: number[] = [];
        const stMoved: number[] = [];
        const stRest: number[] = [];
        const stCenter: number[] = [];
        const stBack: number[] = [];
        const stDeltaBase: number[] = [];
        const stDeltas: number[] = [];

        // candidates of the current slice
        const cUnplayable: number[] = [];
        const cMoved: number[] = [];
        const cRest: number[] = [];
        const cCenter: number[] = [];
        const cBack: number[] = [];
        const cSequence: number[] = [];
        const cDeltas: number[] = [];

        const groupDelta: number[] = new Array<number>(this._groupCount).fill(0);
        const choice: number[] = [];
        const newGroups: number[] = [];

        for (let t = 0; t < sliceCount; t++) {
            const activeStart = this._activeBase[t];
            const activeEnd = this._activeBase[t + 1];
            const activeLength = activeEnd - activeStart;
            newGroups.splice(0, newGroups.length);
            for (let a = activeStart; a < activeEnd; a++) {
                const g = this._activeGroups[a];
                if (this._groupFirst[g] === t) {
                    newGroups.push(g);
                }
            }

            let candidateCount = 0;
            let sequence = 0;
            const previousStart = t === 0 ? -1 : stateBase[t - 1];
            const previousCount = t === 0 ? 1 : stateCount[t - 1];
            const gapQuarters =
                t === 0 ? 0 : (this._sliceTick[t] - this._sliceTick[t - 1]) / TabFingeringRun._ticksPerQuarter;

            for (let p = 0; p < previousCount; p++) {
                const previousState = previousStart + p;
                let previousUnplayable = 0;
                let previousMoved = 0;
                let previousRest = 0;
                let previousCenter = -1;
                if (t > 0) {
                    previousUnplayable = stUnplayable[previousState];
                    previousMoved = stMoved[previousState];
                    previousRest = stRest[previousState];
                    previousCenter = stCenter[previousState];
                    // groups continuing from the previous slice keep their delta
                    const previousActiveStart = this._activeBase[t - 1];
                    const previousActiveEnd = this._activeBase[t];
                    const deltaBase = stDeltaBase[previousState];
                    for (let a = previousActiveStart; a < previousActiveEnd; a++) {
                        groupDelta[this._activeGroups[a]] = stDeltas[deltaBase + (a - previousActiveStart)];
                    }
                }

                choice.splice(0, choice.length);
                for (let k = 0; k < newGroups.length; k++) {
                    choice.push(0);
                }

                let leaves = 0;
                let done = false;
                while (!done && leaves < options.maxLeavesPerState) {
                    for (let k = 0; k < newGroups.length; k++) {
                        const g = newGroups[k];
                        groupDelta[g] = this._groupOptions[this._groupOptionBase[g] + choice[k]];
                    }
                    leaves++;

                    this._scoreSlice(t, groupDelta, previousCenter, gapQuarters);
                    const unplayable = previousUnplayable + this._scoreUnplayable;
                    const moved = previousMoved + this._scoreMoved;
                    const rest = previousRest + this._scoreRest;

                    // candidates are interchangeable for later slices if all continuing groups agree
                    let slot = -1;
                    for (let c = 0; c < candidateCount && slot < 0; c++) {
                        let same = true;
                        for (let a = activeStart; a < activeEnd && same; a++) {
                            const g = this._activeGroups[a];
                            if (
                                this._groupLast[g] > t &&
                                cDeltas[c * activeLength + (a - activeStart)] !== groupDelta[g]
                            ) {
                                same = false;
                            }
                        }
                        if (same) {
                            slot = c;
                        }
                    }

                    let write = -1;
                    if (slot >= 0) {
                        if (
                            TabFingeringRun._isBetter(
                                unplayable,
                                moved,
                                rest,
                                cUnplayable[slot],
                                cMoved[slot],
                                cRest[slot]
                            )
                        ) {
                            write = slot;
                        }
                    } else if (candidateCount < beamWidth) {
                        write = candidateCount;
                        candidateCount++;
                        if (cUnplayable.length < candidateCount) {
                            cUnplayable.push(0);
                            cMoved.push(0);
                            cRest.push(0);
                            cCenter.push(0);
                            cBack.push(0);
                            cSequence.push(0);
                        }
                        while (cDeltas.length < candidateCount * activeLength) {
                            cDeltas.push(0);
                        }
                    } else {
                        let worst = 0;
                        for (let c = 1; c < candidateCount; c++) {
                            if (
                                TabFingeringRun._isBetter(
                                    cUnplayable[worst],
                                    cMoved[worst],
                                    cRest[worst],
                                    cUnplayable[c],
                                    cMoved[c],
                                    cRest[c]
                                ) ||
                                (TabFingeringRun._isEqual(
                                    cUnplayable[worst],
                                    cMoved[worst],
                                    cRest[worst],
                                    cUnplayable[c],
                                    cMoved[c],
                                    cRest[c]
                                ) &&
                                    cSequence[c] > cSequence[worst])
                            ) {
                                worst = c;
                            }
                        }
                        if (
                            TabFingeringRun._isBetter(
                                unplayable,
                                moved,
                                rest,
                                cUnplayable[worst],
                                cMoved[worst],
                                cRest[worst]
                            )
                        ) {
                            write = worst;
                        }
                    }

                    if (write >= 0) {
                        cUnplayable[write] = unplayable;
                        cMoved[write] = moved;
                        cRest[write] = rest;
                        cCenter[write] = this._scoreCenter;
                        cBack[write] = previousState;
                        cSequence[write] = sequence;
                        for (let a = activeStart; a < activeEnd; a++) {
                            cDeltas[write * activeLength + (a - activeStart)] = groupDelta[this._activeGroups[a]];
                        }
                    }
                    sequence++;

                    // next combination of the new groups' options
                    let n = newGroups.length - 1;
                    while (n >= 0) {
                        const g = newGroups[n];
                        choice[n]++;
                        if (choice[n] < this._groupOptionBase[g + 1] - this._groupOptionBase[g]) {
                            break;
                        }
                        choice[n] = 0;
                        n--;
                    }
                    if (n < 0) {
                        done = true;
                    }
                }
            }

            // commit the candidates best first
            stateBase.push(stUnplayable.length);
            stateCount.push(candidateCount);
            const committed: boolean[] = new Array<boolean>(candidateCount).fill(false);
            for (let k = 0; k < candidateCount; k++) {
                let best = -1;
                for (let c = 0; c < candidateCount; c++) {
                    if (committed[c]) {
                        continue;
                    }
                    if (
                        best < 0 ||
                        TabFingeringRun._isBetter(
                            cUnplayable[c],
                            cMoved[c],
                            cRest[c],
                            cUnplayable[best],
                            cMoved[best],
                            cRest[best]
                        ) ||
                        (TabFingeringRun._isEqual(
                            cUnplayable[c],
                            cMoved[c],
                            cRest[c],
                            cUnplayable[best],
                            cMoved[best],
                            cRest[best]
                        ) &&
                            cSequence[c] < cSequence[best])
                    ) {
                        best = c;
                    }
                }
                committed[best] = true;
                stUnplayable.push(cUnplayable[best]);
                stMoved.push(cMoved[best]);
                stRest.push(cRest[best]);
                stCenter.push(cCenter[best]);
                stBack.push(cBack[best]);
                stDeltaBase.push(stDeltas.length);
                for (let a = 0; a < activeLength; a++) {
                    stDeltas.push(cDeltas[best * activeLength + a]);
                }
            }
        }

        // follow the best path back, each group takes the delta chosen in its first slice
        const result: number[] = new Array<number>(this._groupCount).fill(0);
        let state = sliceCount > 0 ? stateBase[sliceCount - 1] : -1;
        for (let t = sliceCount - 1; t >= 0 && state >= 0; t--) {
            const activeStart = this._activeBase[t];
            const activeEnd = this._activeBase[t + 1];
            for (let a = activeStart; a < activeEnd; a++) {
                const g = this._activeGroups[a];
                if (this._groupFirst[g] === t) {
                    result[g] = stDeltas[stDeltaBase[state] + (a - activeStart)];
                }
            }
            state = stBack[state];
        }
        return result;
    }

    private static _isBetter(
        unplayableA: number,
        movedA: number,
        restA: number,
        unplayableB: number,
        movedB: number,
        restB: number
    ): boolean {
        if (unplayableA !== unplayableB) {
            return unplayableA < unplayableB;
        }
        if (movedA !== movedB) {
            return movedA < movedB;
        }
        return restA < restB;
    }

    private static _isEqual(
        unplayableA: number,
        movedA: number,
        restA: number,
        unplayableB: number,
        movedB: number,
        restB: number
    ): boolean {
        return unplayableA === unplayableB && movedA === movedB && restA === restB;
    }

    // results of _scoreSlice
    private _scoreUnplayable: number = 0;
    private _scoreMoved: number = 0;
    private _scoreRest: number = 0;
    private _scoreCenter: number = -1;

    private _scoreSlice(t: number, groupDelta: number[], previousCenter: number, gapQuarters: number): void {
        const options = this._options;
        let unplayable = 0;
        let moved = 0;
        let rest = 0;
        let usedStrings = 0;
        let frettedCount = 0;
        let fretSum = 0;
        let minFret = 0;
        let maxFret = 0;

        for (let k = this._sliceNoteBase[t]; k < this._sliceNoteBase[t + 1]; k++) {
            const i = this._sliceNotes[k];
            const delta = groupDelta[this._group[i]];
            const str = this._originalString[i] + delta;
            if (!this._evaluate(i, str)) {
                unplayable++;
            }
            if (delta !== 0) {
                moved++;
            }
            const stringBit = 1 << (str - 1);
            if ((usedStrings & stringBit) !== 0) {
                unplayable++;
            } else {
                usedStrings |= stringBit;
            }

            const kind = this._kind[i];
            if (kind === TabFingeringRun._kindDead || this._evalNode >= 0) {
                continue;
            }
            if ((this._evalFlags & TabFingeringSegment.flagAsArtificial) !== 0) {
                rest += options.asArtificialPenalty;
            }
            const fret = this._evalFret;
            if (fret === 0) {
                rest += options.openStringBonus;
            } else if (fret > 0) {
                if (frettedCount === 0 || fret < minFret) {
                    minFret = fret;
                }
                if (frettedCount === 0 || fret > maxFret) {
                    maxFret = fret;
                }
                frettedCount++;
                fretSum += fret;
            }
            if (fret > options.highFretThreshold) {
                rest += (fret - options.highFretThreshold) * options.highFretPenaltyWeight;
            }
        }

        for (let k = this._soundBase[t]; k < this._soundBase[t + 1]; k++) {
            const i = this._soundNotes[k];
            const str = this._originalString[i] + groupDelta[this._group[i]];
            if ((usedStrings & (1 << (str - 1))) !== 0) {
                rest += options.occupancyPenalty;
            }
        }

        let center = previousCenter;
        if (frettedCount > 0) {
            const span = maxFret - minFret;
            rest += span * options.spanWeight;
            if (span > options.maxSpan) {
                rest += (span - options.maxSpan) * options.overSpanPenalty;
            }
            center = fretSum / frettedCount;
            if (previousCenter >= 0) {
                rest += (Math.abs(center - previousCenter) * options.handMovementWeight) / (1 + gapQuarters);
            }
        }

        this._scoreUnplayable = unplayable;
        this._scoreMoved = moved;
        this._scoreRest = rest;
        this._scoreCenter = center;
    }
}
