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
    /** The states kept per time slice, at most 255. */
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
            for (let v = 0; v < staff.bars[b].voices.length; v++) {
                const voice = staff.bars[b].voices[v];
                for (let k = 0; k < voice.beats.length; k++) {
                    const beat = voice.beats[k];
                    for (let n = 0; n < beat.notes.length; n++) {
                        const note = beat.notes[n];
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
            for (let v = 0; v < staff.bars[scanned].voices.length; v++) {
                const voice = staff.bars[scanned].voices[v];
                for (let k = 0; k < voice.beats.length; k++) {
                    const beat = voice.beats[k];
                    for (let n = 0; n < beat.notes.length; n++) {
                        const note = beat.notes[n];
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
        const resolvedOptions = options ?? TabFingeringSolver._defaultOptions;
        if (TabFingeringRun.isIdentity(staff, firstBarIndex, lastBarIndex, resolvedOptions)) {
            return null;
        }
        return new TabFingeringRun(staff, firstBarIndex, lastBarIndex, resolvedOptions).solve();
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

    /**
     * Solves the bars, which must not be playable as they are (see {@link isIdentity}).
     */
    public solve(): TabFingeringSegment {
        this._collectNotes();

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
            for (let v = 0; v < bars[b].voices.length; v++) {
                const voice = bars[b].voices[v];
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
            for (let v = 0; v < bars[b].voices.length; v++) {
                const voice = bars[b].voices[v];
                this._voiceBeatBase[voiceIndex] = beatIndex;
                voiceIndex++;
                for (let k = 0; k < voice.beats.length; k++) {
                    const beat = voice.beats[k];
                    this._beatNoteBase[beatIndex] = notes.length;
                    beatIndex++;
                    for (let n = 0; n < beat.notes.length; n++) {
                        const note = beat.notes[n];
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
        const trill = this._trill[i];
        return TabFingeringRun._isPlayableFret(fret, maxFret, this._noOpen[i] !== 0, trill >= 0, trill - stringPitch);
    }

    private static _isPlayableFret(
        fret: number,
        maxFret: number,
        needsFrettedString: boolean,
        hasTrill: boolean,
        trillFret: number
    ): boolean {
        if (fret < 0 || fret > maxFret || (fret === 0 && needsFrettedString)) {
            return false;
        }
        return !hasTrill || (trillFret >= 0 && trillFret <= maxFret);
    }

    /**
     * Whether every note is playable on its model string with the fret shifted by the transposition,
     * natural harmonics on a node of their string. Reads the model directly to allocate nothing for
     * the common case.
     */
    public static isIdentity(
        staff: Staff,
        firstBarIndex: number,
        lastBarIndex: number,
        options: TabFingeringOptions
    ): boolean {
        const transpositionPitch = staff.transpositionPitch;
        const stringCount = staff.tuning.length;
        for (let b = firstBarIndex; b <= lastBarIndex; b++) {
            for (let v = 0; v < staff.bars[b].voices.length; v++) {
                const voice = staff.bars[b].voices[v];
                for (let k = 0; k < voice.beats.length; k++) {
                    const beat = voice.beats[k];
                    for (let n = 0; n < beat.notes.length; n++) {
                        const note = beat.notes[n];
                        if (!note.isStringed || note.string < 1 || note.string > stringCount || note.isDead) {
                            continue;
                        }
                        if (TabFingeringSolver.isNaturalHarmonic(note)) {
                            if (TabFingeringSolver.findNaturalNodeOnModelString(note) < 0) {
                                return false;
                            }
                            continue;
                        }
                        const maxFret = Math.max(options.defaultMaxFret - staff.capo, note.fret);
                        if (
                            !TabFingeringRun._isPlayableFret(
                                note.fret - transpositionPitch,
                                maxFret,
                                TabFingeringRun._needsFrettedString(note),
                                note.isTrill,
                                note.isTrill ? note.trillFret - transpositionPitch : 0
                            )
                        ) {
                            return false;
                        }
                    }
                }
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
                options.push(delta);
                optionFret.push(headFret);
                for (let m = options.length - 1; m > insertAt; m--) {
                    options[m] = options[m - 1];
                    optionFret[m] = optionFret[m - 1];
                }
                options[insertAt] = delta;
                optionFret[insertAt] = headFret;
            }
            if (!hasZero) {
                // last resort: keep the model strings, unplayable notes are flagged
                options.push(0);
                optionFret.push(0);
            }
        }
        this._groupOptionBase.push(options.length);
    }

    private _hasSolvedNotes(beat: Beat): boolean {
        const notes = beat.notes;
        for (let n = 0; n < notes.length; n++) {
            if (this._kind[this._indexOf(notes[n])] !== TabFingeringRun._kindSkip) {
                return true;
            }
        }
        return false;
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
        const endTick: number[] = [];
        const sliceTick = this._sliceTick;
        let previous: Beat | null = null;
        let voicePosition = new Int32Array(4);
        for (let b = this._firstBarIndex; b <= this._lastBarIndex; b++) {
            const voices = bars[b].voices;
            if (voicePosition.length < voices.length) {
                voicePosition = new Int32Array(voices.length);
            }
            voicePosition.fill(0);
            // merge the voices, each of them is in slice order already
            while (true) {
                let beat: Beat | null = null;
                let beatVoice = -1;
                for (let v = 0; v < voices.length; v++) {
                    const voiceBeats = voices[v].beats;
                    while (
                        voicePosition[v] < voiceBeats.length &&
                        !this._hasSolvedNotes(voiceBeats[voicePosition[v]])
                    ) {
                        voicePosition[v]++;
                    }
                    if (voicePosition[v] < voiceBeats.length) {
                        const candidate = voiceBeats[voicePosition[v]];
                        if (beat === null || TabFingeringRun._compareBeats(candidate, beat) < 0) {
                            beat = candidate;
                            beatVoice = v;
                        }
                    }
                }
                if (beat === null) {
                    break;
                }
                voicePosition[beatVoice]++;

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
                const notes = beat.notes;
                for (let n = 0; n < notes.length; n++) {
                    const note = notes[n];
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
        for (let i = 0; i < counts.length; i++) {
            base.push(sum);
            sum += counts[i];
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
     * Only the states of the previous slice are kept, plus per slice the back pointers and the deltas of the
     * groups starting there to follow the best path back.
     * @returns The string delta per group.
     */
    private _search(): Int32Array {
        const options = this._options;
        // back pointers are stored as bytes
        const beamWidth = Math.min(options.beamWidth, 255);
        const sliceCount = this._sliceTick.length;
        const groupCount = this._groupCount;
        const activeBase = this._activeBase;
        const activeGroups = this._activeGroups;
        const groupFirst = this._groupFirst;
        const groupLast = this._groupLast;

        let maxActive = 1;
        for (let t = 0; t < sliceCount; t++) {
            maxActive = Math.max(maxActive, activeBase[t + 1] - activeBase[t]);
        }

        // groups starting per slice, in the order of the active groups
        const newGroupBase = new Int32Array(sliceCount + 1);
        for (let g = 0; g < groupCount; g++) {
            newGroupBase[groupFirst[g] + 1]++;
        }
        for (let t = 0; t < sliceCount; t++) {
            newGroupBase[t + 1] += newGroupBase[t];
        }
        const newGroupIds = new Int32Array(groupCount);
        const newGroupPositions = new Int32Array(groupCount);
        for (let t = 0; t < sliceCount; t++) {
            let n = newGroupBase[t];
            for (let a = activeBase[t]; a < activeBase[t + 1]; a++) {
                const g = activeGroups[a];
                if (groupFirst[g] === t) {
                    newGroupIds[n] = g;
                    newGroupPositions[n] = a - activeBase[t];
                    n++;
                }
            }
        }

        // the sorted states of the previous slice
        const stateUnplayable = new Int32Array(beamWidth);
        const stateMoved = new Int32Array(beamWidth);
        const stateRest: number[] = new Array<number>(beamWidth).fill(0);
        const stateCenter: number[] = new Array<number>(beamWidth).fill(0);
        const stateDeltas = new Int8Array(beamWidth * maxActive);
        let stateCount = 0;

        // the unsorted candidates of the current slice, the last slot holds the candidate being scored
        // (costs are compared by slot, passing doubles between functions would box them)
        const scored = beamWidth;
        const candidateUnplayable = new Int32Array(beamWidth + 1);
        const candidateMoved = new Int32Array(beamWidth + 1);
        const candidateRest: number[] = new Array<number>(beamWidth + 1).fill(0);
        const candidateCenter: number[] = new Array<number>(beamWidth + 1).fill(0);
        const candidateBack = new Int32Array(beamWidth);
        const candidateSequence = new Int32Array(beamWidth + 1);
        const scores = this._scores;
        const candidateDeltas = new Int8Array(beamWidth * maxActive);
        const candidateCommitted = new Uint8Array(beamWidth);

        // kept for the path back
        const back = new Uint8Array(sliceCount * beamWidth);
        const newDeltas = new Int8Array(groupCount * beamWidth);

        const groupDelta = new Int32Array(groupCount);
        const choice = new Int32Array(maxActive);

        for (let t = 0; t < sliceCount; t++) {
            const activeStart = activeBase[t];
            const activeEnd = activeBase[t + 1];
            const activeLength = activeEnd - activeStart;
            const newStart = newGroupBase[t];
            const newCount = newGroupBase[t + 1] - newStart;

            let candidateCount = 0;
            let sequence = 0;
            const previousCount = t === 0 ? 1 : stateCount;
            const previousActiveStart = t === 0 ? 0 : activeBase[t - 1];
            const previousActiveLength = t === 0 ? 0 : activeStart - previousActiveStart;
            scores[TabFingeringRun._scoreGapQuarters] =
                t === 0 ? 0 : (this._sliceTick[t] - this._sliceTick[t - 1]) / TabFingeringRun._ticksPerQuarter;

            for (let p = 0; p < previousCount; p++) {
                let previousUnplayable = 0;
                let previousMoved = 0;
                let previousRest = 0;
                scores[TabFingeringRun._scorePreviousCenter] = -1;
                if (t > 0) {
                    previousUnplayable = stateUnplayable[p];
                    previousMoved = stateMoved[p];
                    previousRest = stateRest[p];
                    scores[TabFingeringRun._scorePreviousCenter] = stateCenter[p];
                    // groups continuing from the previous slice keep their delta
                    for (let a = 0; a < previousActiveLength; a++) {
                        groupDelta[activeGroups[previousActiveStart + a]] = stateDeltas[p * previousActiveLength + a];
                    }
                }

                for (let k = 0; k < newCount; k++) {
                    choice[k] = 0;
                }

                let leaves = 0;
                let done = false;
                while (!done && leaves < options.maxLeavesPerState) {
                    for (let k = 0; k < newCount; k++) {
                        const g = newGroupIds[newStart + k];
                        groupDelta[g] = this._groupOptions[this._groupOptionBase[g] + choice[k]];
                    }
                    leaves++;

                    this._scoreSlice(t, groupDelta);
                    candidateUnplayable[scored] = previousUnplayable + this._scoreUnplayable;
                    candidateMoved[scored] = previousMoved + this._scoreMoved;
                    candidateRest[scored] = previousRest + scores[TabFingeringRun._scoreRest];
                    candidateCenter[scored] = scores[TabFingeringRun._scoreCenter];
                    candidateSequence[scored] = sequence;

                    // candidates are interchangeable for later slices if all continuing groups agree
                    let slot = -1;
                    for (let c = 0; c < candidateCount && slot < 0; c++) {
                        let same = true;
                        for (let a = 0; a < activeLength && same; a++) {
                            const g = activeGroups[activeStart + a];
                            if (groupLast[g] > t && candidateDeltas[c * activeLength + a] !== groupDelta[g]) {
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
                            TabFingeringRun._isCandidateBefore(
                                scored,
                                slot,
                                candidateUnplayable,
                                candidateMoved,
                                candidateRest,
                                candidateSequence
                            )
                        ) {
                            write = slot;
                        }
                    } else if (candidateCount < beamWidth) {
                        write = candidateCount;
                        candidateCount++;
                    } else {
                        let worst = 0;
                        for (let c = 1; c < candidateCount; c++) {
                            if (
                                TabFingeringRun._isCandidateBefore(
                                    worst,
                                    c,
                                    candidateUnplayable,
                                    candidateMoved,
                                    candidateRest,
                                    candidateSequence
                                )
                            ) {
                                worst = c;
                            }
                        }
                        if (
                            TabFingeringRun._isCandidateBefore(
                                scored,
                                worst,
                                candidateUnplayable,
                                candidateMoved,
                                candidateRest,
                                candidateSequence
                            )
                        ) {
                            write = worst;
                        }
                    }

                    if (write >= 0) {
                        candidateUnplayable[write] = candidateUnplayable[scored];
                        candidateMoved[write] = candidateMoved[scored];
                        candidateRest[write] = candidateRest[scored];
                        candidateCenter[write] = candidateCenter[scored];
                        candidateBack[write] = p;
                        candidateSequence[write] = sequence;
                        for (let a = 0; a < activeLength; a++) {
                            candidateDeltas[write * activeLength + a] = groupDelta[activeGroups[activeStart + a]];
                        }
                    }
                    sequence++;

                    // next combination of the new groups' options
                    let n = newCount - 1;
                    while (n >= 0) {
                        const g = newGroupIds[newStart + n];
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

            // the candidates become the states of this slice, best first
            candidateCommitted.fill(0);
            for (let k = 0; k < candidateCount; k++) {
                let best = -1;
                for (let c = 0; c < candidateCount; c++) {
                    if (
                        candidateCommitted[c] === 0 &&
                        (best < 0 ||
                            TabFingeringRun._isCandidateBefore(
                                c,
                                best,
                                candidateUnplayable,
                                candidateMoved,
                                candidateRest,
                                candidateSequence
                            ))
                    ) {
                        best = c;
                    }
                }
                candidateCommitted[best] = 1;
                stateUnplayable[k] = candidateUnplayable[best];
                stateMoved[k] = candidateMoved[best];
                stateRest[k] = candidateRest[best];
                stateCenter[k] = candidateCenter[best];
                back[t * beamWidth + k] = candidateBack[best];
                for (let a = 0; a < activeLength; a++) {
                    stateDeltas[k * activeLength + a] = candidateDeltas[best * activeLength + a];
                }
                for (let j = 0; j < newCount; j++) {
                    newDeltas[newStart * beamWidth + k * newCount + j] =
                        candidateDeltas[best * activeLength + newGroupPositions[newStart + j]];
                }
            }
            stateCount = candidateCount;
        }

        // follow the best path back, each group takes the delta chosen in its first slice
        const result = new Int32Array(groupCount);
        let state = 0;
        for (let t = sliceCount - 1; t >= 0; t--) {
            const newStart = newGroupBase[t];
            const newCount = newGroupBase[t + 1] - newStart;
            for (let j = 0; j < newCount; j++) {
                result[newGroupIds[newStart + j]] = newDeltas[newStart * beamWidth + state * newCount + j];
            }
            state = back[t * beamWidth + state];
        }
        return result;
    }

    /**
     * Whether candidate a ranks before candidate b: better costs, then generated earlier.
     */
    private static _isCandidateBefore(
        a: number,
        b: number,
        unplayable: Int32Array,
        moved: Int32Array,
        rest: number[],
        sequence: Int32Array
    ): boolean {
        if (unplayable[a] !== unplayable[b]) {
            return unplayable[a] < unplayable[b];
        }
        if (moved[a] !== moved[b]) {
            return moved[a] < moved[b];
        }
        if (rest[a] !== rest[b]) {
            return rest[a] < rest[b];
        }
        return sequence[a] < sequence[b];
    }

    // inputs and results of _scoreSlice which are no integers
    private static readonly _scorePreviousCenter: number = 0;
    private static readonly _scoreGapQuarters: number = 1;
    private static readonly _scoreRest: number = 2;
    private static readonly _scoreCenter: number = 3;
    private readonly _scores: number[] = [0, 0, 0, 0];

    private _scoreUnplayable: number = 0;
    private _scoreMoved: number = 0;

    private _scoreSlice(t: number, groupDelta: Int32Array): void {
        const scores = this._scores;
        const previousCenter = scores[TabFingeringRun._scorePreviousCenter];
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
                rest +=
                    (Math.abs(center - previousCenter) * options.handMovementWeight) /
                    (1 + scores[TabFingeringRun._scoreGapQuarters]);
            }
        }

        this._scoreUnplayable = unplayable;
        this._scoreMoved = moved;
        scores[TabFingeringRun._scoreRest] = rest;
        scores[TabFingeringRun._scoreCenter] = center;
    }
}
