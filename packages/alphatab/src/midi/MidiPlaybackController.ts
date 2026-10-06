import { Direction } from '@coderline/alphatab/model/Direction';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { RepeatGroup } from '@coderline/alphatab/model/RepeatGroup';
import type { Score } from '@coderline/alphatab/model/Score';

/**
 * Describes how a D.C./D.S. jump is played.
 * @internal
 * @record
 */
interface JumpDefinition {
    /**
     * The direction marking the jump.
     */
    jump: Direction;
    /**
     * The direction marking the jump target, null to jump to the start (Da Capo).
     */
    target: Direction | null;
    /**
     * The direction until which we play after the jump (To Coda or Fine), null to play until the end.
     */
    playUntil: Direction | null;
    /**
     * The direction where we continue after reaching {@link playUntil} (the Coda), null to stop (Fine).
     */
    continueAt: Direction | null;
}

/**
 * @internal
 */
enum RepeatAction {
    /**
     * Continue with the next bar.
     */
    Continue = 0,
    /**
     * Jump back to the opening of the repeat.
     */
    RepeatFromStart = 1,
    /**
     * The repeat is done, continue with the next bar.
     */
    Finished = 2
}

/**
 * The playback state of a started repeat.
 * @internal
 */
class Repeat {
    public readonly group: RepeatGroup;

    /**
     * With alternate endings every closing ends the current pass and all closings share the pass counter.
     * Without, every closing repeats on its own (e.g. "open, close, bar, close" repeats the first part again).
     */
    private readonly _hasAlternateEndings: boolean;

    /**
     * The current pass (0-based), selects the alternate endings to play.
     */
    private _pass: number = 0;

    /**
     * The repeats done per closing (only for repeats without alternate endings).
     */
    private readonly _iterations: number[];

    /**
     * The alternate endings of the last bar with endings, bars without explicit endings continue them.
     */
    private _currentEndings: number = 0;

    /**
     * @param finalPass Whether the repeat is played as its final pass (e.g. after a jump).
     * All repeats are then considered done and only the last alternate ending is played.
     */
    public constructor(group: RepeatGroup, finalPass: boolean) {
        this.group = group;
        this._hasAlternateEndings = group.masterBars.some(m => m.alternateEndings !== 0);
        this._iterations = group.closings.map(c => (finalPass ? Math.max(0, c.repeatCount - 1) : 0));
        if (finalPass) {
            for (const iteration of this._iterations) {
                this._pass = Math.max(this._pass, iteration);
            }
        }
    }

    /**
     * Whether the given bar is played in the current pass (respecting the alternate endings).
     */
    public isPlayed(masterBar: MasterBar): boolean {
        let endings = masterBar.alternateEndings;
        if (endings === 0) {
            endings = this._currentEndings;
        } else {
            this._currentEndings = endings;
        }
        return endings === 0 || (endings & (1 << this._pass)) !== 0;
    }

    /**
     * Decides how to continue after the given closing of this repeat.
     * @param played Whether the closing bar was played in the current pass.
     */
    public onClosing(closing: MasterBar, played: boolean): RepeatAction {
        const closings = this.group.closings;
        const isLastClosing = closing === closings[closings.length - 1];

        if (this._hasAlternateEndings) {
            // closings in skipped endings are ignored. except the last closing: files might only
            // have the repeat sign on the last ending, then it is respected on all passes.
            if (!played && !isLastClosing) {
                return RepeatAction.Continue;
            }

            if (this._pass < closing.repeatCount - 1) {
                this._pass++;
                this._currentEndings = 0;
                return RepeatAction.RepeatFromStart;
            }

            // all passes done, after the last closing the repeat is done
            // otherwise we proceed to the endings of the current pass
            return isLastClosing ? RepeatAction.Finished : RepeatAction.Continue;
        }

        const closingIndex = closings.indexOf(closing);
        if (closingIndex === -1) {
            return RepeatAction.Continue;
        }

        if (this._iterations[closingIndex] < closing.repeatCount - 1) {
            this._iterations[closingIndex]++;
            // clear iterations for previous closings and start over all repeats
            // this ensures on scenarios like "open, bar, close, bar, close"
            // that the second close will repeat again the first repeat.
            for (let i = 0; i < closingIndex; i++) {
                this._iterations[i] = 0;
            }
            this._currentEndings = 0;
            return RepeatAction.RepeatFromStart;
        }

        return isLastClosing ? RepeatAction.Finished : RepeatAction.Continue;
    }

    /**
     * Whether a closing of this repeat will still jump back over the given bar.
     */
    public willRepeat(masterBar: MasterBar): boolean {
        const closings = this.group.closings;
        for (let i = 0; i < closings.length; i++) {
            const closing = closings[i];
            if (closing.index >= masterBar.index) {
                const repeatsDone = this._hasAlternateEndings ? this._pass : this._iterations[i];
                if (repeatsDone < closing.repeatCount - 1) {
                    return true;
                }
            }
        }
        return false;
    }
}

/**
 * Walks through the master bars of a song in playback order respecting repeats, alternate endings
 * and jump directions (D.C., D.S., Coda, Fine).
 * @internal
 */
export class MidiPlaybackController {
    /**
     * The jumps in the order they are checked if a bar has multiple ones.
     */
    private static readonly _jumps: JumpDefinition[] = [
        { jump: Direction.JumpDaCapo, target: null, playUntil: null, continueAt: null },
        {
            jump: Direction.JumpDaCapoAlCoda,
            target: null,
            playUntil: Direction.JumpDaCoda,
            continueAt: Direction.TargetCoda
        },
        {
            jump: Direction.JumpDaCapoAlDoubleCoda,
            target: null,
            playUntil: Direction.JumpDaDoubleCoda,
            continueAt: Direction.TargetDoubleCoda
        },
        { jump: Direction.JumpDaCapoAlFine, target: null, playUntil: Direction.TargetFine, continueAt: null },

        { jump: Direction.JumpDalSegno, target: Direction.TargetSegno, playUntil: null, continueAt: null },
        {
            jump: Direction.JumpDalSegnoAlCoda,
            target: Direction.TargetSegno,
            playUntil: Direction.JumpDaCoda,
            continueAt: Direction.TargetCoda
        },
        {
            jump: Direction.JumpDalSegnoAlDoubleCoda,
            target: Direction.TargetSegno,
            playUntil: Direction.JumpDaDoubleCoda,
            continueAt: Direction.TargetDoubleCoda
        },
        {
            jump: Direction.JumpDalSegnoAlFine,
            target: Direction.TargetSegno,
            playUntil: Direction.TargetFine,
            continueAt: null
        },

        { jump: Direction.JumpDalSegnoSegno, target: Direction.TargetSegnoSegno, playUntil: null, continueAt: null },
        {
            jump: Direction.JumpDalSegnoSegnoAlCoda,
            target: Direction.TargetSegnoSegno,
            playUntil: Direction.JumpDaCoda,
            continueAt: Direction.TargetCoda
        },
        {
            jump: Direction.JumpDalSegnoSegnoAlDoubleCoda,
            target: Direction.TargetSegnoSegno,
            playUntil: Direction.JumpDaDoubleCoda,
            continueAt: Direction.TargetDoubleCoda
        },
        {
            jump: Direction.JumpDalSegnoSegnoAlFine,
            target: Direction.TargetSegnoSegno,
            playUntil: Direction.TargetFine,
            continueAt: null
        }
    ];

    private _score: Score;

    /**
     * The started repeats, the innermost on top.
     */
    private _repeatStack: Repeat[] = [];

    /**
     * The D.C./D.S. we followed, null if we play normally (before any jump or after the coda).
     * After a jump all repeats are played as their final pass (no repeating, only the last alternate ending).
     */
    private _activeJump: JumpDefinition | null = null;

    /**
     * The bars on which a D.C./D.S. jump was already taken. Each jump is only taken once.
     */
    private _takenJumps: Set<MasterBar> = new Set<MasterBar>();

    public shouldPlay: boolean = true;
    public index: number = 0;
    public currentTick: number = 0;

    public get finished(): boolean {
        return this.index >= this._score.masterBars.length;
    }

    public constructor(score: Score) {
        this._score = score;
    }

    public processCurrent(): void {
        const masterBar: MasterBar = this._score.masterBars[this.index];

        this._enterRepeat(masterBar);

        const repeat = this._repeatStack.length > 0 ? this._repeatStack[this._repeatStack.length - 1] : null;
        this.shouldPlay = repeat === null || repeat.isPlayed(masterBar);

        if (this.shouldPlay) {
            this.currentTick += masterBar.calculateDuration();
        }
    }

    public moveNext(): void {
        if (this._moveNextWithDirections()) {
            return;
        }

        const masterBar: MasterBar = this._score.masterBars[this.index];
        if (this._repeatStack.length > 0 && masterBar.repeatCount > 1) {
            const repeat = this._repeatStack[this._repeatStack.length - 1];
            switch (repeat.onClosing(masterBar, this.shouldPlay)) {
                case RepeatAction.RepeatFromStart:
                    this.index = repeat.group.opening!.index;
                    return;
                case RepeatAction.Finished:
                    this._repeatStack.pop();
                    break;
            }
        }

        this.index++;
    }

    /**
     * Starts the repeat of the given bar if needed: when reaching its opening, or after a jump
     * which landed within the repeat (the opening is then never visited).
     */
    private _enterRepeat(masterBar: MasterBar) {
        const group = masterBar.repeatGroup;
        // only properly closed repeats
        if (!group.isClosed || this._repeatStack.some(r => r.group === group)) {
            return;
        }

        const isWithinRepeat = masterBar.index <= group.closings[group.closings.length - 1].index;
        if (masterBar === group.opening || (this._activeJump !== null && isWithinRepeat)) {
            this._repeatStack.push(new Repeat(group, this._activeJump !== null));
        }
    }

    private _moveNextWithDirections(): boolean {
        const masterBar: MasterBar = this._score.masterBars[this.index];
        const directions = masterBar.directions;
        // directions on bars which are not played (skipped alternate endings) are not respected
        if (!this.shouldPlay || directions === null || directions.size === 0) {
            return false;
        }

        if (this._activeJump === null) {
            return this._takeJump(masterBar, directions);
        }

        // after a jump only the end of the jump (To Coda or Fine) is respected
        const playUntil = this._activeJump.playUntil;
        if (playUntil !== null && directions.has(playUntil)) {
            return this._continueAfterJump(this._activeJump.continueAt);
        }

        return false;
    }

    private _takeJump(masterBar: MasterBar, directions: Set<Direction>): boolean {
        // each jump is only taken once (e.g. when reached again after the coda) and within repeats
        // only on the final pass (the repeats are played first)
        if (this._takenJumps.has(masterBar) || this._repeatStack.some(r => r.willRepeat(masterBar))) {
            return false;
        }

        for (const jump of MidiPlaybackController._jumps) {
            if (!directions.has(jump.jump)) {
                continue;
            }

            const target = jump.target;
            const targetIndex =
                target === null ? 0 : this._findJumpTarget(target, true /* typically jumps are backwards */);
            if (targetIndex === -1) {
                // no jump target found, keep playing normally
                continue;
            }

            this._takenJumps.add(masterBar);
            this._activeJump = jump;
            this._repeatStack = [];
            this.index = targetIndex;
            return true;
        }

        return false;
    }

    private _continueAfterJump(continueAt: Direction | null): boolean {
        // Fine
        if (continueAt === null) {
            this.index = this._score.masterBars.length;
            return true;
        }

        const coda = this._findJumpTarget(continueAt, false /* typically da coda jumps are forwards */);
        if (coda === -1) {
            // no coda found, continue playing normally to end.
            return false;
        }

        // back to normal playback (with repeats) after the coda.
        this._activeJump = null;
        this._repeatStack = [];
        this.index = coda;
        return true;
    }

    /**
     * Finds the index of the masterbar with the given direction applied which fits best
     * the current index. In best case in one piece we only have single jump marks, but it could happen
     * that you have multiple Segno/Coda symbols placed at different sections.
     * @param toFind
     * @param backwardsFirst whether to first search backwards before looking forwards.
     * @returns the index of the masterbar found with the given direction or -1 if no masterbar with the given direction was found.
     */
    private _findJumpTarget(toFind: Direction, backwardsFirst: boolean): number {
        const firstStep = backwardsFirst ? -1 : 1;
        const index = this._findDirection(toFind, firstStep);
        return index !== -1 ? index : this._findDirection(toFind, -firstStep);
    }

    private _findDirection(toFind: Direction, step: number): number {
        const masterBars = this._score.masterBars;
        for (let index = this.index; index >= 0 && index < masterBars.length; index += step) {
            const directions = masterBars[index].directions;
            if (directions !== null && directions.has(toFind)) {
                return index;
            }
        }
        return -1;
    }
}
