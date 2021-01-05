import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import { Settings } from '@src/Settings';
import { Duration } from './Duration';

/**
 * A voice represents a group of beats
 * that can be played during a bar.
 * @json
 */
export class Voice {
    private _beatLookup!: Map<number, Beat>;

    private static _globalBarId: number = 0;

    /**
     * Gets or sets the unique id of this bar.
     */
    public id: number = Voice._globalBarId++;

    /**
     * Gets or sets the zero-based index of this voice within the bar.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the reference to the bar this voice belongs to.
     * @json_ignore
     */
    public bar!: Bar;

    /**
     * Gets or sets the list of beats contained in this voice.
     * @json_add addBeat
     */
    public beats: Beat[] = [];

    /**
     * Gets or sets a value indicating whether this voice is empty.
     */
    public isEmpty: boolean = true;

    public insertBeat(after: Beat, newBeat: Beat): void {
        newBeat.nextBeat = after.nextBeat;
        if (newBeat.nextBeat) {
            newBeat.nextBeat.previousBeat = newBeat;
        }
        newBeat.previousBeat = after;
        newBeat.voice = this;
        after.nextBeat = newBeat;
        this.beats.splice(after.index + 1, 0, newBeat);
    }

    public addBeat(beat: Beat): void {
        beat.voice = this;
        beat.index = this.beats.length;
        this.beats.push(beat);
        if (!beat.isEmpty) {
            this.isEmpty = false;
        }
    }

    private chain(beat: Beat): void {
        if (!this.bar) {
            return;
        }
        if (beat.index < this.beats.length - 1) {
            beat.nextBeat = this.beats[beat.index + 1];
            beat.nextBeat.previousBeat = beat;
        } else if (beat.isLastOfVoice && beat.voice.bar.nextBar) {
            let nextVoice: Voice = this.bar.nextBar!.voices[this.index];
            if (nextVoice.beats.length > 0) {
                beat.nextBeat = nextVoice.beats[0];
                beat.nextBeat.previousBeat = beat;
            } else {
                beat.nextBeat!.previousBeat = beat;
            }
        }

        beat.chain();
    }

    public addGraceBeat(beat: Beat): void {
        if (this.beats.length === 0) {
            this.addBeat(beat);
            return;
        }
        // remove last beat
        let lastBeat: Beat = this.beats[this.beats.length - 1];
        this.beats.splice(this.beats.length - 1, 1);
        // insert grace beat
        this.addBeat(beat);
        // reinsert last beat
        this.addBeat(lastBeat);
        this.isEmpty = false;
    }

    public getBeatAtPlaybackStart(playbackStart: number): Beat | null {
        if (this._beatLookup.has(playbackStart)) {
            return this._beatLookup.get(playbackStart)!;
        }
        return null;
    }

    public finish(settings: Settings): void {
        this._beatLookup = new Map<number, Beat>();
        for (let index: number = 0; index < this.beats.length; index++) {
            let beat: Beat = this.beats[index];
            beat.index = index;
            this.chain(beat);
        }
        let currentDisplayTick: number = 0;
        let currentPlaybackTick: number = 0;
        let currentGraceBeats: Beat[] = [];
        for (let i: number = 0; i < this.beats.length; i++) {
            let beat: Beat = this.beats[i];
            beat.index = i;
            beat.finish(settings);

            beat.displayStart = currentDisplayTick;
            beat.playbackStart = currentPlaybackTick;
            currentDisplayTick += beat.displayDuration;
            currentPlaybackTick += beat.playbackDuration;
            beat.finishTuplet();

            if (beat.graceType === GraceType.None) {
                beat.graceBeats = currentGraceBeats;

                if (currentGraceBeats.length > 0) {
                    if (currentGraceBeats[0].graceType !== GraceType.BendGrace) {
                        let numberOfGraceBeats: number = currentGraceBeats.length;
                        let graceDuration: Duration = Duration.Eighth;
                        if (numberOfGraceBeats === 1) {
                            graceDuration = Duration.Eighth;
                        } else if (numberOfGraceBeats === 2) {
                            graceDuration = Duration.Sixteenth;
                        } else {
                            graceDuration = Duration.ThirtySecond;
                        }

                        // move all grace beats
                        for (const graceBeat of currentGraceBeats) {
                            graceBeat.graceTarget = beat;
                            graceBeat.duration = graceDuration;
                            graceBeat.updateDurations();
                        }
                    } else {
                        for (const gb of currentGraceBeats) {
                            gb.graceTarget = beat;
                        }
                    }
                }

                currentGraceBeats = [];

                if (beat.fermata) {
                    this.bar.masterBar.addFermata(beat.playbackStart, beat.fermata);
                } else {
                    beat.fermata = this.bar.masterBar.getFermata(beat);
                }

                this._beatLookup.set(beat.playbackStart, beat);
            } else {
                beat.graceIndex = currentGraceBeats.length;
                currentGraceBeats.push(beat);
            }
        }
    }

    public calculateDuration(): number {
        if (this.isEmpty || this.beats.length === 0) {
            return 0;
        }
        let lastBeat: Beat = this.beats[this.beats.length - 1];
        let firstBeat: Beat = this.beats[0];
        return lastBeat.playbackStart + lastBeat.playbackDuration - firstBeat.playbackStart;
    }
}
