import { RepeatGroup } from '@src/model';
import { MasterBar } from '@src/model/MasterBar';
import { Score } from '@src/model/Score';

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

export class MidiPlaybackController {
    private _score: Score;

    private _repeatStack: Repeat[] = [];
    private _groupsOnStack: Set<RepeatGroup> = new Set<RepeatGroup>();
    private _previousAlternateEndings: number = 0;
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
        let masterBarAlternateEndings: number = masterBar.alternateEndings;
        // if there are no alternate endings set on this bar. take the ones 
        // from the previously played bar which had alternate endings
        if(masterBarAlternateEndings === 0) {
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

        if (this.shouldPlay) {
            this.currentTick += masterBar.calculateDuration();
        }
    }

    public moveNext(): void {
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
