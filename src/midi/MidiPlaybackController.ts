import { MasterBar } from '@src/model/MasterBar';
import { Score } from '@src/model/Score';

export class MidiPlaybackController {
    private _score: Score;
    private _repeatStartIndex: number = 0;
    private _repeatNumber: number = 0;
    private _repeatOpen: boolean = false;

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
        const masterBarAlternateEndings: number = masterBar.alternateEndings;
        // if the repeat group wasn't closed we reset the repeating
        // on the last group opening
        if (
            !masterBar.repeatGroup.isClosed &&
            masterBar.repeatGroup.openings[masterBar.repeatGroup.openings.length - 1] === masterBar
        ) {
            this._repeatNumber = 0;
            this._repeatOpen = false;
        }
        if ((masterBar.isRepeatStart || masterBar.index === 0) && this._repeatNumber === 0) {
            this._repeatStartIndex = this.index;
            this._repeatOpen = true;
        } else if (masterBar.isRepeatStart) {
            this.shouldPlay = true;
        }
        // if we encounter an alternate ending
        if (this._repeatOpen && masterBarAlternateEndings > 0) {
            // do we need to skip this section?
            if ((masterBarAlternateEndings & (1 << this._repeatNumber)) === 0) {
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
        // if we encounter a repeat end
        if (this._repeatOpen && masterBarRepeatCount > 0) {
            // more repeats required?
            if (this._repeatNumber < masterBarRepeatCount) {
                // jump to start
                this.index = this._repeatStartIndex;
                this._repeatNumber++;
            } else {
                // no repeats anymore, jump after repeat end
                this._repeatNumber = 0;
                this._repeatOpen = false;
                this.shouldPlay = true;
                this.index++;
            }
        } else {
            this.index++;
        }
    }
}
