import type { RepeatGroup } from '@src/model/RepeatGroup';
import { Direction } from '@src/model/Direction';
import type { MasterBar } from '@src/model/MasterBar';
import type { Score } from '@src/model/Score';

/**
 * Helper container to handle repeats correctly
 */
class Repeat {
    public group: RepeatGroup;
    public opening: MasterBar;
    public iterations: number[];
    public closingIndex: number = 0;

    public constructor(group: RepeatGroup, opening: MasterBar) {
        this.group = group;
        this.opening = opening;
        // sort ascending according to index
        group.closings = group.closings.sort((a, b) => a.index - b.index);
        this.iterations = group.closings.map(_ => 0);
    }
}

enum MidiPlaybackControllerState {
    /**
     * Normally playing with repeats.
     */
    PlayingNormally = 0,

    /**
     * We "jumped" to a new location (e.g. via Da Capo). So we're ignoring repeats.
     */
    DirectionJumped = 1,

    /**
     * We "jumped" to a new location via a 'al Coda' jump, hence respecting 'DaCoda' now.
     */
    DirectionJumpedAlCoda = 2,

    /**
     * We "jumped" to a new location via a 'al Double Coda' jump, hence respecting 'DaDoubleCoda' now.
     */
    DirectionJumpedAlDoubleCoda = 3,

    /**
     * We "jumped" to a new location via a 'al Fine' jump, hence respecting 'Fine' now.
     */
    DirectionJumpedAlFine = 4
}

export class MidiPlaybackController {
    private _score: Score;

    private _repeatStack: Repeat[] = [];
    private _groupsOnStack: Set<RepeatGroup> = new Set<RepeatGroup>();
    private _previousAlternateEndings: number = 0;

    private _state: MidiPlaybackControllerState = MidiPlaybackControllerState.PlayingNormally;

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

        if (this._state === MidiPlaybackControllerState.PlayingNormally) {
            let masterBarAlternateEndings: number = masterBar.alternateEndings;
            // if there are no alternate endings set on this bar. take the ones
            // from the previously played bar which had alternate endings
            if (masterBarAlternateEndings === 0) {
                masterBarAlternateEndings = this._previousAlternateEndings;
            }

            // Repeat start (only properly closed ones)
            if (masterBar === masterBar.repeatGroup.opening && masterBar.repeatGroup.isClosed) {
                // first encounter of the repeat group? -> initialize repeats accordingly
                if (!this._groupsOnStack.has(masterBar.repeatGroup)) {
                    const repeat = new Repeat(masterBar.repeatGroup, masterBar);
                    this._repeatStack.push(repeat);
                    this._groupsOnStack.add(masterBar.repeatGroup);
                    this._previousAlternateEndings = 0;
                    masterBarAlternateEndings = masterBar.alternateEndings;
                }
            }

            // if we're not within repeats or not alternative endings set -> simply play
            if (this._repeatStack.length === 0 || masterBarAlternateEndings === 0) {
                this.shouldPlay = true;
            } else {
                const repeat = this._repeatStack[this._repeatStack.length - 1];
                const iteration = repeat.iterations[repeat.closingIndex];
                this._previousAlternateEndings = masterBarAlternateEndings;

                // do we need to skip this section?
                if ((masterBarAlternateEndings & (1 << iteration)) === 0) {
                    this.shouldPlay = false;
                } else {
                    this.shouldPlay = true;
                }
            }
        } else {
            this.shouldPlay = true;
        }

        if (this.shouldPlay) {
            this.currentTick += masterBar.calculateDuration();
        }
    }

    public moveNext(): void {
        if (this.moveNextWithDirections()) {
            return;
        }

        this.moveNextWithNormalRepeats();
    }

    private resetRepeats() {
        this._groupsOnStack.clear();
        this._previousAlternateEndings = 0;
        this._repeatStack = [];
    }

    private handleDaCapo(
        directions: Set<Direction>,
        daCapo: Direction,
        newState: MidiPlaybackControllerState
    ): boolean {
        if (directions.has(daCapo)) {
            this.index = 0; // jump to start
            this._state = newState;
            this.resetRepeats();
            return true;
        }
        return false;
    }

    private handleDalSegno(
        directions: Set<Direction>,
        dalSegno: Direction,
        newState: MidiPlaybackControllerState,
        jumpTarget: Direction
    ): boolean {
        if (directions!.has(dalSegno)) {
            const segno = this.findJumpTarget(jumpTarget, this.index, true /* typically jumps are backwards */);
            if (segno === -1) {
                // no jump target found, keep playing normally
                return false;
            }

            this.index = segno;
            this._state = newState;
            this.resetRepeats();
            return true;
        }
        return false;
    }

    private handleDaCoda(directions: Set<Direction>, daCoda: Direction, jumpTarget: Direction): boolean {
        // Found the "Da Coda" after the jump -> Jump further
        if (directions.has(daCoda)) {
            const coda = this.findJumpTarget(jumpTarget, this.index, false /* typically da coda jumps are forwards */);
            if (coda === -1) {
                // no coda found, continue playing normally to end.
                this.index++;
                return true;
            }

            this.index = coda;
            // back to normal playback after target jump.
            this._state = MidiPlaybackControllerState.PlayingNormally;
            return true;
        }
        return false;
    }

    private moveNextWithDirections() {
        const masterBar: MasterBar = this._score.masterBars[this.index];
        const hasDirections = masterBar.directions !== null && masterBar.directions.size > 0;

        // fast exit paths:

        // normal playback and no directions to respect
        if (this._state === MidiPlaybackControllerState.PlayingNormally && !hasDirections) {
            return false;
        }

        if (!hasDirections) {
            // playing in a directions state, we ignore all repeats and just continue playing one after another

            // NOTE: its not really clearly defined what to do if we have repeats and directions combined in a piece
            // e.g. if there is a repeat with alternate endings, it makes sense to only play the "initial path" without
            // any repeats but skipping the bars which would only be played as part of endings?

            // for now we keep it simple. if somebody reports special needs we can still add them.

            this.index++;
            return true;
        }

        // longer path: respect directions based on the state we're in

        switch (this._state) {
            case MidiPlaybackControllerState.PlayingNormally:
                // Da capo Jumps (to start)
                // prettier-ignore
                if (
                    this.handleDaCapo(
                        masterBar.directions!,
                        Direction.JumpDaCapo,
                        MidiPlaybackControllerState.DirectionJumped
                    ) ||
                    this.handleDaCapo(
                        masterBar.directions!,
                        Direction.JumpDaCapoAlCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlCoda
                    ) ||
                    this.handleDaCapo(
                        masterBar.directions!,
                        Direction.JumpDaCapoAlDoubleCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlDoubleCoda
                    ) ||
                    this.handleDaCapo(
                        masterBar.directions!,
                        Direction.JumpDaCapoAlFine,
                        MidiPlaybackControllerState.DirectionJumpedAlFine
                    )
                ) {
                    return true;
                }

                // Dal Segno Jumps
                // prettier-ignore
                if (
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegno,
                        MidiPlaybackControllerState.DirectionJumped,
                        Direction.TargetSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoAlCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlCoda,
                        Direction.TargetSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoAlDoubleCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlDoubleCoda,
                        Direction.TargetSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoAlFine,
                        MidiPlaybackControllerState.DirectionJumpedAlFine,
                        Direction.TargetSegno
                    )
                ) {
                    return true;
                }

                // Dal SegnoSegno Jumps
                // prettier-ignore
                if (
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoSegno,
                        MidiPlaybackControllerState.DirectionJumped,
                        Direction.TargetSegnoSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoSegnoAlCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlCoda,
                        Direction.TargetSegnoSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoSegnoAlDoubleCoda,
                        MidiPlaybackControllerState.DirectionJumpedAlDoubleCoda,
                        Direction.TargetSegnoSegno
                    ) ||
                    this.handleDalSegno(
                        masterBar.directions!,
                        Direction.JumpDalSegnoSegnoAlFine,
                        MidiPlaybackControllerState.DirectionJumpedAlFine,
                        Direction.TargetSegnoSegno
                    )
                ) {
                    return true;
                }

                // no relevant direction found, continue normal playback
                return false;

            case MidiPlaybackControllerState.DirectionJumped:
                // when we had a jump without special indication, we just keep playing 1-by-1 until the end
                this.index++;
                return true;

            case MidiPlaybackControllerState.DirectionJumpedAlCoda:
                // Found the "Da Coda" after the jump -> Jump further
                if (this.handleDaCoda(masterBar.directions!, Direction.JumpDaCoda, Direction.TargetCoda)) {
                    return true;
                }

                // no relevant direction found, we just keep playing 1-by-1 without repeats
                this.index++;
                return true;

            case MidiPlaybackControllerState.DirectionJumpedAlDoubleCoda:
                if (this.handleDaCoda(masterBar.directions!, Direction.JumpDaDoubleCoda, Direction.TargetDoubleCoda)) {
                    return true;
                }

                // no relevant direction found, we just keep playing 1-by-1 without repeats
                this.index++;
                return true;

            case MidiPlaybackControllerState.DirectionJumpedAlFine:
                if (masterBar.directions!.has(Direction.TargetFine)) {
                    this.index = this._score.masterBars.length; // finished
                    return true;
                }

                // no relevant direction found, we just keep playing 1-by-1 without repeats
                this.index++;
                return true;
        }

        return true;
    }

    /**
     * Finds the index of the masterbar with the given direction applied which fits best
     * the given start index. In best case in one piece we only have single jump marks, but it could happen
     * that you have multiple Segno/Coda symbols placed at different sections.
     * @param toFind
     * @param searchIndex
     * @param backwardsFirst whether to first search backwards before looking forwards.
     * @returns the index of the masterbar found with the given direction or -1 if no masterbar with the given direction was found.
     */
    private findJumpTarget(toFind: Direction, searchIndex: number, backwardsFirst: boolean): number {
        let index: number;
        if (backwardsFirst) {
            index = this.findJumpTargetBackwards(toFind, searchIndex);
            if (index === -1) {
                index = this.findJumpTargetForwards(toFind, searchIndex);
            }
            return index;
        }

        index = this.findJumpTargetForwards(toFind, searchIndex);
        if (index === -1) {
            index = this.findJumpTargetBackwards(toFind, searchIndex);
        }
        return index;
    }

    private findJumpTargetForwards(toFind: Direction, searchIndex: number): number {
        let index = searchIndex;
        while (index < this._score.masterBars.length) {
            const d = this._score.masterBars[index].directions;
            if (d && d.has(toFind)) {
                return index;
            }
            index++;
        }
        return -1;
    }

    private findJumpTargetBackwards(toFind: Direction, searchIndex: number): number {
        let index = searchIndex;
        while (index >= 0) {
            const d = this._score.masterBars[index].directions;
            if (d && d.has(toFind)) {
                return index;
            }
            index--;
        }
        return -1;
    }

    private moveNextWithNormalRepeats() {
        const masterBar: MasterBar = this._score.masterBars[this.index];
        const masterBarRepeatCount: number = masterBar.repeatCount - 1;
        // if we encounter a repeat end...
        if (this._repeatStack.length > 0 && masterBarRepeatCount > 0) {
            // ...more repeats required?
            const repeat = this._repeatStack[this._repeatStack.length - 1];
            const iteration = repeat.iterations[repeat.closingIndex];

            // -> if yes, increase the iteration and jump back to start
            if (iteration < masterBarRepeatCount) {
                // jump to start
                this.index = repeat.opening.index;
                repeat.iterations[repeat.closingIndex]++;

                // clear iterations for previous closings and start over all repeats
                // this ensures on scenarios like "open, bar, close, bar, close"
                // that the second close will repeat again the first repeat.
                for (let i = 0; i < repeat.closingIndex; i++) {
                    repeat.iterations[i] = 0;
                }
                repeat.closingIndex = 0;
                this._previousAlternateEndings = 0;
            } else {
                // if we don't have further iterations left but we have additional closings in this group
                // proceed heading to the next close but keep the repeat group active
                if (repeat.closingIndex < repeat.group.closings.length - 1) {
                    repeat.closingIndex++;
                    this.index++; // go to next bar after current close
                } else {
                    // if there are no further closings in the current group, we consider the current repeat done and handled
                    this._repeatStack.pop();
                    this._groupsOnStack.delete(repeat.group);

                    this.index++; // go to next bar after current close
                }
            }
        } else {
            // we have no started repeat, just proceed to next bar
            this.index++;
        }
    }
}
