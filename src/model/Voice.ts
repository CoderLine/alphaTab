import { MidiUtils } from '@src/midi/MidiUtils';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import { Settings } from '@src/Settings';

/**
 * A voice represents a group of beats
 * that can be played during a bar.
 */
export class Voice {
    private _beatLookup!: Map<number, Beat>;

    /**
     * Gets or sets the zero-based index of this voice within the bar.
     */
    public index: number = 0;

    /**
     * Gets or sets the reference to the bar this voice belongs to.
     */
    public bar!: Bar;

    /**
     * Gets or sets the list of beats contained in this voice.
     */
    public beats: Beat[] = [];

    /**
     * Gets or sets a value indicating whether this voice is empty.
     */
    public isEmpty: boolean = true;

    public static copyTo(src: Voice, dst: Voice): void {
        dst.index = src.index;
        dst.isEmpty = src.isEmpty;
    }

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

    public getBeatAtDisplayStart(displayStart: number): Beat | null {
        if (this._beatLookup.has(displayStart)) {
            return this._beatLookup.get(displayStart)!;
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
        for (let i: number = 0; i < this.beats.length; i++) {
            let beat: Beat = this.beats[i];
            beat.index = i;
            beat.finish(settings);
            if (beat.graceType === GraceType.None || beat.graceType === GraceType.BendGrace) {
                beat.displayStart = currentDisplayTick;
                beat.playbackStart = currentPlaybackTick;
                currentDisplayTick += beat.displayDuration;
                currentPlaybackTick += beat.playbackDuration;
            } else {
                if (!beat.previousBeat || beat.previousBeat.graceType === GraceType.None) {
                    // find note which is not a grace note
                    let nonGrace: Beat | null = beat;
                    let numberOfGraceBeats: number = 0;
                    while (nonGrace && nonGrace.graceType !== GraceType.None) {
                        nonGrace = nonGrace.nextBeat;
                        numberOfGraceBeats++;
                    }
                    let graceDuration: Duration = Duration.Eighth;
                    let stolenDuration: number = 0;
                    if (numberOfGraceBeats === 1) {
                        graceDuration = Duration.Eighth;
                    } else if (numberOfGraceBeats === 2) {
                        graceDuration = Duration.Sixteenth;
                    } else {
                        graceDuration = Duration.ThirtySecond;
                    }
                    if (nonGrace) {
                        nonGrace.updateDurations();
                    }
                    // grace beats have 1/4 size of the non grace beat preceeding them
                    let perGraceDisplayDuration: number = !beat.previousBeat
                        ? MidiUtils.toTicks(Duration.ThirtySecond)
                        : (((beat.previousBeat.displayDuration / 4) | 0) / numberOfGraceBeats) | 0;
                    // move all grace beats
                    let graceBeat: Beat | null = this.beats[i];
                    for (let j: number = 0; j < numberOfGraceBeats && graceBeat; j++) {
                        graceBeat.duration = graceDuration;
                        graceBeat.updateDurations();
                        graceBeat.displayStart =
                            currentDisplayTick - (numberOfGraceBeats - j + 1) * perGraceDisplayDuration;
                        graceBeat.displayDuration = perGraceDisplayDuration;
                        stolenDuration += graceBeat.playbackDuration;
                        graceBeat = graceBeat.nextBeat;
                    }
                    // steal needed duration from beat duration
                    if (beat.graceType === GraceType.BeforeBeat) {
                        if (beat.previousBeat) {
                            beat.previousBeat.playbackDuration -= stolenDuration;
                        }
                        currentPlaybackTick -= stolenDuration;
                    } else if (nonGrace && beat.graceType === GraceType.OnBeat) {
                        nonGrace.playbackDuration -= stolenDuration;
                    }
                }
                beat.playbackStart = currentPlaybackTick;
                currentPlaybackTick = beat.playbackStart + beat.playbackDuration;
            }


            if(beat.fermata) {
                this.bar.masterBar.addFermata(beat.playbackStart, beat.fermata);
            } else {
                beat.fermata = this.bar.masterBar.getFermata(beat);
            }

            beat.finishTuplet();
            this._beatLookup.set(beat.displayStart, beat);
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
