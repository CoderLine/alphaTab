import { Logger } from '@coderline/alphatab/Logger';
import { MidiPlaybackController } from '@coderline/alphatab/midi/MidiPlaybackController';
import { Direction } from '@coderline/alphatab/model/Direction';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Score } from '@coderline/alphatab/model/Score';
import { Section } from '@coderline/alphatab/model/Section';

/**
 * One entry of the TablEdit reading list (0-based, inclusive bar range).
 * @internal
 */
export class TefReadingListItem {
    public first: number = 0;
    public last: number = 0;
    public label: string = '';
}

/**
 * A graphical repeat sign of a TablEdit file.
 * @internal
 */
export class TefReadingGuide {
    public bar: number = 0;
    public value: number = 0;
}

/**
 * A D.C. or D.S. jump of the derived structure and the bars played after it.
 * @internal
 */
export class TefJumpPass {
    /**
     * The bar holding the jump.
     */
    public jump: number = 0;
    /**
     * The bar jumped to, 0 for a D.C.
     */
    public target: number = 0;
    /**
     * The index of the segno kind, -1 for a D.C.
     */
    public segnoKind: number = -1;
    /**
     * The bars played after the jump, in order.
     */
    public played: number[] = [];
    /**
     * The bar holding the To Coda, -1 while playing on.
     */
    public end: number = -1;
    /**
     * The bar of the coda, -1 while playing on.
     */
    public coda: number = -1;
    /**
     * The index of the coda kind, -1 while playing on.
     */
    public codaKind: number = -1;
}

/**
 * Expresses the TablEdit reading list, which defines the playback order as a list of bar ranges,
 * through repeats, alternate endings and jump directions.
 * @internal
 */
export class TefReadingList {
    private static readonly _repeatStart = 0x40;
    private static readonly _repeatEnd = 0x80;
    private static readonly _firstEnding = 0x01;
    private static readonly _secondEnding = 0x02;
    private static readonly _segnoTargets = [Direction.TargetSegno, Direction.TargetSegnoSegno];
    private static readonly _segnoJumps = [Direction.JumpDalSegno, Direction.JumpDalSegnoSegno];
    private static readonly _codaJumps = [Direction.JumpDaCoda, Direction.JumpDaDoubleCoda];
    private static readonly _codaTargets = [Direction.TargetCoda, Direction.TargetDoubleCoda];

    /**
     * Applies the structure before the score is finished.
     */
    public static apply(score: Score, items: TefReadingListItem[], guides: TefReadingGuide[]): void {
        const runs = TefReadingList._runs(score, items);
        for (const item of items) {
            const label = item.label;
            if (
                label.length > 0 &&
                label.charAt(0) !== ' ' &&
                item.first >= 0 &&
                item.first < score.masterBars.length
            ) {
                const section = new Section();
                section.text = label.trim();
                score.masterBars[item.first].section = section;
            }
        }
        if (runs.length === 0) {
            TefReadingList._applyGuides(score, guides);
            return;
        }
        TefReadingList._derive(score.masterBars, runs);
    }

    /**
     * Compares the playback order of the finished score with the reading list.
     * @returns true if alphaTab plays the bars in the order of the reading list.
     */
    public static verify(score: Score, items: TefReadingListItem[]): boolean {
        const runs = TefReadingList._runs(score, items);
        if (runs.length === 0) {
            return true;
        }
        const expected = TefReadingList.expand(runs);
        const actual = TefReadingList.playbackOrder(score, expected.length * 2 + 16);
        let same = expected.length === actual.length;
        for (let i = 0; same && i < expected.length; i++) {
            same = expected[i] === actual[i];
        }
        if (!same) {
            Logger.warning(
                'TablEdit',
                `The reading list cannot be expressed exactly, playback order differs: expected [${expected.join(
                    ','
                )}], actual [${actual.join(',')}]`
            );
        }
        return same;
    }

    public static expand(runs: number[][]): number[] {
        const order: number[] = [];
        for (const run of runs) {
            for (let b = run[0]; b <= run[1]; b++) {
                order.push(b);
            }
        }
        return order;
    }

    public static playbackOrder(score: Score, maxBars: number): number[] {
        const controller = new MidiPlaybackController(score);
        const order: number[] = [];
        while (!controller.finished && order.length < maxBars) {
            const index = controller.index;
            controller.processCurrent();
            if (controller.shouldPlay) {
                order.push(index);
            }
            controller.moveNext();
        }
        return order;
    }

    /**
     * Validates the items and merges ranges that continue each other.
     */
    private static _runs(score: Score, items: TefReadingListItem[]): number[][] {
        const runs: number[][] = [];
        const barCount = score.masterBars.length;
        for (const item of items) {
            if (item.first < 0 || item.first >= barCount || item.last < item.first) {
                break;
            }
            const last = Math.min(item.last, barCount - 1);
            if (runs.length > 0 && runs[runs.length - 1][1] + 1 === item.first) {
                runs[runs.length - 1][1] = last;
            } else {
                runs.push([item.first, last]);
            }
        }
        // a list which simply plays everything once needs no structure
        if (runs.length === 1 && runs[0][0] === 0 && runs[0][1] === barCount - 1) {
            return [];
        }
        return runs;
    }

    /**
     * Marks repeats, alternate endings and jumps so that alphaTab's playback controller plays the runs in order.
     * Before a jump and after a coda playback is normal: going back becomes a repeat, or a D.C./D.S. when a repeat
     * cannot express it. After a jump repeats play only their final pass, so skipping the first ending needs no
     * marking, any other skip forward is the To Coda and its coda, and the end of the list is the Fine.
     */
    private static _derive(bars: MasterBar[], runs: number[][]): void {
        const passes: TefJumpPass[] = [];
        let pass: TefJumpPass | null = null;
        let furthest = -1;
        let lastRepeatEnd = -1;
        let i = 0;
        while (i < runs.length) {
            const last = runs[i][1];
            furthest = Math.max(furthest, last);
            if (pass) {
                for (let b = runs[i][0]; b <= last; b++) {
                    pass.played.push(b);
                }
            }
            if (i + 1 >= runs.length) {
                // the list stops before the end of the piece
                if (pass && last < bars.length - 1) {
                    bars[last].addDirection(Direction.TargetFine);
                    TefReadingList._replaceJump(bars[pass.jump], Direction.TargetFine);
                }
                break;
            }
            const nextFirst = runs[i + 1][0];

            if (pass) {
                // going back cannot be expressed after a jump, the pass goes on
                if (nextFirst > last + 1 && !TefReadingList._isFirstEnding(bars, last + 1, nextFirst)) {
                    TefReadingList._addCoda(bars, passes, pass, nextFirst);
                    pass = null;
                }
                i++;
                continue;
            }

            if (nextFirst > last) {
                // skipping bars without a jump cannot be expressed
                i++;
                continue;
            }

            if (last === furthest && nextFirst > lastRepeatEnd) {
                const next = TefReadingList._addRepeat(bars, runs, i);
                if (next >= 0) {
                    lastRepeatEnd = last;
                    i = next;
                    continue;
                }
            }

            pass = TefReadingList._addJump(bars, passes, last, nextFirst);
            i++;
        }
    }

    /**
     * Expresses going back from the run at the given index as a repeat.
     * @returns the index of the run to continue with, or -1 if a repeat cannot express it.
     */
    private static _addRepeat(bars: MasterBar[], runs: number[][], i: number): number {
        const last = runs[i][1];
        const nextFirst = runs[i + 1][0];
        const nextLast = runs[i + 1][1];
        if (nextLast < last) {
            // the second pass skips the first ending, then the bars after the repeat follow
            if (i + 2 >= runs.length || runs[i + 2][0] !== last + 1) {
                return -1;
            }
            TefReadingList._startRepeat(bars, nextFirst);
            bars[last].repeatCount = 2;
            const endingLength = last - nextLast;
            for (let b = nextLast + 1; b <= last; b++) {
                bars[b].alternateEndings |= TefReadingList._firstEnding;
            }
            const end = Math.min(runs[i + 2][1], last + endingLength);
            for (let b = last + 1; b <= end; b++) {
                bars[b].alternateEndings |= TefReadingList._secondEnding;
            }
            return i + 2;
        }

        TefReadingList._startRepeat(bars, nextFirst);
        if (nextLast === last) {
            let passes = 2;
            let k = i + 1;
            while (k + 1 < runs.length && runs[k + 1][0] === nextFirst && runs[k + 1][1] === last) {
                passes++;
                k++;
            }
            // a last pass merged with the bars after the repeat
            if (k + 1 < runs.length && runs[k + 1][0] === nextFirst && runs[k + 1][1] > last) {
                passes++;
                k++;
                runs[k][0] = last + 1;
            }
            bars[last].repeatCount = passes;
            return k;
        }
        // the second pass continues after the repeat
        bars[last].repeatCount = 2;
        runs[i + 1][0] = last + 1;
        return i + 1;
    }

    /**
     * Opens a repeat. A second ending of the previous repeat ends before it.
     */
    private static _startRepeat(bars: MasterBar[], first: number): void {
        bars[first].isRepeatStart = true;
        for (let b = first; b < bars.length && bars[b].alternateEndings === TefReadingList._secondEnding; b++) {
            bars[b].alternateEndings = 0;
        }
    }

    /**
     * Whether all bars of the range are first endings, which the final pass of their repeat skips.
     */
    private static _isFirstEnding(bars: MasterBar[], from: number, to: number): boolean {
        for (let b = from; b < to; b++) {
            if (bars[b].alternateEndings !== TefReadingList._firstEnding) {
                return false;
            }
        }
        return true;
    }

    /**
     * Adds a D.C. (jump to the first bar) or D.S. to the given target.
     * @returns the pass played after the jump, or null if the bar already jumps elsewhere.
     */
    private static _addJump(
        bars: MasterBar[],
        passes: TefJumpPass[],
        jump: number,
        target: number
    ): TefJumpPass | null {
        if (passes.some(p => p.jump === jump)) {
            // a jump is only taken once
            return null;
        }
        const pass = new TefJumpPass();
        pass.jump = jump;
        pass.target = target;
        if (target === 0) {
            bars[jump].addDirection(Direction.JumpDaCapo);
        } else {
            pass.segnoKind = TefReadingList._segnoKind(passes, pass);
            bars[target].addDirection(TefReadingList._segnoTargets[pass.segnoKind]);
            bars[jump].addDirection(TefReadingList._segnoJumps[pass.segnoKind]);
        }
        passes.push(pass);
        return pass;
    }

    /**
     * A D.S. to a bar with a segno reuses it. Every other target gets the sign not used yet, or else
     * the one that all jumps still find, as the playback controller looks for the nearest sign before the jump.
     */
    private static _segnoKind(passes: TefJumpPass[], pass: TefJumpPass): number {
        for (const p of passes) {
            if (p.segnoKind >= 0 && p.target === pass.target) {
                return p.segnoKind;
            }
        }
        for (let kind = 0; kind < TefReadingList._segnoTargets.length; kind++) {
            if (!passes.some(p => p.segnoKind === kind)) {
                return kind;
            }
        }
        for (let kind = 0; kind < TefReadingList._segnoTargets.length; kind++) {
            const same = passes.filter(p => p.segnoKind === kind);
            same.push(pass);
            const targets = same.map(p => p.target);
            if (same.every(p => TefReadingList._nearest(targets, p.jump, true) === p.target)) {
                return kind;
            }
        }
        return 0;
    }

    /**
     * Ends the pass with a To Coda on its last bar and continues at the given coda.
     */
    private static _addCoda(bars: MasterBar[], passes: TefJumpPass[], pass: TefJumpPass, coda: number): void {
        pass.end = pass.played[pass.played.length - 1];
        pass.coda = coda;
        let preferred = -1;
        for (const p of passes) {
            if (p.codaKind >= 0 && p.coda === coda) {
                preferred = p.codaKind;
                break;
            }
        }
        for (let unused = 0; preferred < 0 && unused < TefReadingList._codaTargets.length; unused++) {
            if (!passes.some(p => p.codaKind === unused)) {
                preferred = unused;
            }
        }
        if (preferred < 0) {
            preferred = 0;
        }
        let kind = preferred;
        for (let k = 0; k < TefReadingList._codaTargets.length; k++) {
            const candidate = (preferred + k) % TefReadingList._codaTargets.length;
            if (TefReadingList._codasResolve(passes, pass, candidate)) {
                kind = candidate;
                break;
            }
        }
        pass.codaKind = kind;
        bars[pass.end].addDirection(TefReadingList._codaJumps[kind]);
        bars[coda].addDirection(TefReadingList._codaTargets[kind]);
        TefReadingList._replaceJump(bars[pass.jump], TefReadingList._codaTargets[kind]);
    }

    /**
     * Whether every pass ending with the given To Coda kind (including the new pass) reaches its own
     * To Coda first and finds its own coda from there.
     */
    private static _codasResolve(passes: TefJumpPass[], pass: TefJumpPass, kind: number): boolean {
        const same = passes.filter(p => p !== pass && p.codaKind === kind);
        same.push(pass);
        const ends = same.map(p => p.end);
        const codas = same.map(p => p.coda);
        for (const p of same) {
            let first = 0;
            while (ends.indexOf(p.played[first]) < 0) {
                first++;
            }
            if (first !== p.played.length - 1 || TefReadingList._nearest(codas, p.end, false) !== p.coda) {
                return false;
            }
        }
        return true;
    }

    /**
     * The target the playback controller finds from the given bar: the nearest one in the preferred
     * direction (including the bar itself), else the nearest one in the other direction.
     */
    private static _nearest(targets: number[], from: number, backwardsFirst: boolean): number {
        let before = -1;
        let after = -1;
        for (const t of targets) {
            if (t <= from && (before < 0 || t > before)) {
                before = t;
            }
            if (t >= from && (after < 0 || t < after)) {
                after = t;
            }
        }
        if (backwardsFirst) {
            return before >= 0 ? before : after;
        }
        return after >= 0 ? after : before;
    }

    /**
     * Turns a plain D.C., D.S. or D.S.S. into its "al Coda", "al Double Coda" or "al Fine" form.
     */
    private static _replaceJump(jump: MasterBar, target: Direction): void {
        const forms = [
            [
                Direction.JumpDaCapo,
                Direction.JumpDaCapoAlCoda,
                Direction.JumpDaCapoAlDoubleCoda,
                Direction.JumpDaCapoAlFine
            ],
            [
                Direction.JumpDalSegno,
                Direction.JumpDalSegnoAlCoda,
                Direction.JumpDalSegnoAlDoubleCoda,
                Direction.JumpDalSegnoAlFine
            ],
            [
                Direction.JumpDalSegnoSegno,
                Direction.JumpDalSegnoSegnoAlCoda,
                Direction.JumpDalSegnoSegnoAlDoubleCoda,
                Direction.JumpDalSegnoSegnoAlFine
            ]
        ];
        for (const form of forms) {
            if (jump.directions && jump.directions.has(form[0])) {
                jump.directions.delete(form[0]);
                jump.addDirection(
                    target === Direction.TargetFine ? form[3] : target === Direction.TargetCoda ? form[1] : form[2]
                );
                return;
            }
        }
    }

    /**
     * Without a reading list, the graphical repeat signs are shown as they are.
     */
    private static _applyGuides(score: Score, guides: TefReadingGuide[]): void {
        for (const guide of guides) {
            if (guide.bar >= score.masterBars.length) {
                continue;
            }
            const bar = score.masterBars[guide.bar];
            if ((guide.value & TefReadingList._repeatStart) !== 0) {
                bar.isRepeatStart = true;
            }
            if ((guide.value & TefReadingList._repeatEnd) !== 0) {
                bar.repeatCount = 2;
            }
            const ending = guide.value & 0x07;
            if (ending > 0 && ending < 7) {
                bar.alternateEndings |= 1 << (ending - 1);
            }
            switch ((guide.value >> 3) & 0x07) {
                case 1:
                    bar.addDirection(Direction.TargetFine);
                    break;
                case 2:
                    bar.addDirection(Direction.JumpDalSegno);
                    break;
                case 3:
                    bar.addDirection(Direction.TargetSegno);
                    break;
                case 4:
                    bar.addDirection(Direction.JumpDaCoda);
                    break;
                case 5:
                    bar.addDirection(Direction.TargetCoda);
                    break;
            }
        }
    }
}
