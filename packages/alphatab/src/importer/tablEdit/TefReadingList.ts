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
 * Expresses the TablEdit reading list, which defines the playback order as a list of bar ranges,
 * through repeats, alternate endings and jump directions.
 * @internal
 */
export class TefReadingList {
    private static readonly _repeatStart = 0x40;
    private static readonly _repeatEnd = 0x80;

    /**
     * Applies the structure before the score is finished.
     */
    public static apply(score: Score, items: TefReadingListItem[], guides: TefReadingGuide[]): void {
        const runs = TefReadingList._runs(score, items);
        for (const item of items) {
            const label = item.label;
            if (label.length > 0 && label.charAt(0) !== ' ' && item.first < score.masterBars.length) {
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

    private static _derive(bars: MasterBar[], runs: number[][]): void {
        let furthest = -1;
        let lastRepeatEnd = -1;
        let jump: MasterBar | null = null;
        let jumpToStart = false;
        let segnoCount = 0;
        let codaCount = 0;
        let i = 0;
        while (i < runs.length) {
            const last = runs[i][1];
            furthest = Math.max(furthest, last);
            if (i + 1 >= runs.length) {
                // the list stops before the end of the piece
                if (jump && last < bars.length - 1) {
                    bars[last].addDirection(Direction.TargetFine);
                    TefReadingList._replaceJump(jump, Direction.TargetFine);
                }
                break;
            }
            const nextFirst = runs[i + 1][0];
            const nextLast = runs[i + 1][1];

            if (nextFirst <= last) {
                if (!jump && last === furthest && nextFirst > lastRepeatEnd) {
                    bars[nextFirst].isRepeatStart = true;
                    lastRepeatEnd = last;
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
                        i = k;
                        continue;
                    }
                    bars[last].repeatCount = 2;
                    if (nextLast < last) {
                        const endingLength = last - nextLast;
                        for (let b = nextLast + 1; b <= last; b++) {
                            bars[b].alternateEndings |= 0x01;
                        }
                        if (i + 2 < runs.length && runs[i + 2][0] === last + 1) {
                            const end = Math.min(runs[i + 2][1], last + endingLength);
                            for (let b = last + 1; b <= end; b++) {
                                bars[b].alternateEndings |= 0x02;
                            }
                        }
                        i += 2;
                        continue;
                    }
                    // the second pass continues after the repeat
                    runs[i + 1][0] = last + 1;
                    i++;
                    continue;
                }

                jump = bars[last];
                jumpToStart = nextFirst === 0;
                if (jumpToStart) {
                    jump.addDirection(Direction.JumpDaCapo);
                } else {
                    bars[nextFirst].addDirection(segnoCount === 0 ? Direction.TargetSegno : Direction.TargetSegnoSegno);
                    jump.addDirection(segnoCount === 0 ? Direction.JumpDalSegno : Direction.JumpDalSegnoSegno);
                    segnoCount++;
                }
                i++;
                continue;
            }

            if (nextFirst > last + 1 && jump) {
                bars[last].addDirection(codaCount === 0 ? Direction.JumpDaCoda : Direction.JumpDaDoubleCoda);
                bars[nextFirst].addDirection(codaCount === 0 ? Direction.TargetCoda : Direction.TargetDoubleCoda);
                TefReadingList._replaceJump(jump, codaCount === 0 ? Direction.TargetCoda : Direction.TargetDoubleCoda);
                codaCount++;
            }
            i++;
        }
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
