import type { Bar } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import type { Settings } from '@src/Settings';
import { GraceGroup } from '@src/model/GraceGroup';
import { ElementStyle } from '@src/model/ElementStyle';

/**
 * Lists all graphical sub elements within a {@link Voice} which can be styled via {@link Voice.style}
 */
export enum VoiceSubElement {
    /**
     * All general glyphs (like notes heads and rests).
     */
    Glyphs = 0
}

/**
 * Defines the custom styles for voices.
 * @json
 * @json_strict
 */
export class VoiceStyle extends ElementStyle<VoiceSubElement> {}

/**
 * A voice represents a group of beats
 * that can be played during a bar.
 * @json
 * @json_strict
 */
export class Voice {
    private _beatLookup!: Map<number, Beat>;
    private _isEmpty: boolean = true;
    private _isRestOnly: boolean = true;

    private static _globalVoiceId: number = 0;

    /**
     * @internal
     */
    public static resetIds() {
        Voice._globalVoiceId = 0;
    }

    /**
     * Gets or sets the unique id of this bar.
     */
    public id: number = Voice._globalVoiceId++;

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
    public get isEmpty(): boolean {
        return this._isEmpty;
    }

    /**
     * The style customizations for this item.
     */
    public style?: VoiceStyle;

    /**
     * @internal
     */
    public forceNonEmpty() {
        this._isEmpty = false;
    }

    /**
     * Gets or sets a value indicating whether this voice is empty.
     */
    public get isRestOnly() {
        return this._isRestOnly;
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
            this._isEmpty = false;
        }
        if (!beat.isRest) {
            this._isRestOnly = false;
        }
    }

    private chain(beat: Beat, sharedDataBag: Map<string, unknown> | null = null): void {
        if (!this.bar) {
            return;
        }
        if (beat.index < this.beats.length - 1) {
            beat.nextBeat = this.beats[beat.index + 1];
            beat.nextBeat.previousBeat = beat;
        } else if (beat.isLastOfVoice && beat.voice.bar.nextBar) {
            const nextVoice: Voice = this.bar.nextBar!.voices[this.index];
            if (nextVoice.beats.length > 0) {
                beat.nextBeat = nextVoice.beats[0];
                beat.nextBeat.previousBeat = beat;
            } else {
                beat.nextBeat!.previousBeat = beat;
            }
        }

        beat.chain(sharedDataBag);
    }

    public addGraceBeat(beat: Beat): void {
        if (this.beats.length === 0) {
            this.addBeat(beat);
            return;
        }
        // remove last beat
        const lastBeat: Beat = this.beats[this.beats.length - 1];
        this.beats.splice(this.beats.length - 1, 1);
        // insert grace beat
        this.addBeat(beat);
        // reinsert last beat
        this.addBeat(lastBeat);
        this._isEmpty = false;
        this._isRestOnly = false;
    }

    public getBeatAtPlaybackStart(playbackStart: number): Beat | null {
        if (this._beatLookup.has(playbackStart)) {
            return this._beatLookup.get(playbackStart)!;
        }
        return null;
    }

    public finish(settings: Settings, sharedDataBag: Map<string, unknown> | null = null): void {
        this._isEmpty = true;
        this._isRestOnly = true;
        this._beatLookup = new Map<number, Beat>();
        let currentGraceGroup: GraceGroup | null = null;
        for (let index: number = 0; index < this.beats.length; index++) {
            const beat: Beat = this.beats[index];
            beat.index = index;
            this.chain(beat, sharedDataBag);
            if (beat.graceType === GraceType.None) {
                beat.graceGroup = currentGraceGroup;
                if (currentGraceGroup) {
                    currentGraceGroup.isComplete = true;
                }
                currentGraceGroup = null;
            } else {
                if (!currentGraceGroup) {
                    currentGraceGroup = new GraceGroup();
                }
                currentGraceGroup.addBeat(beat);
            }
            if (!beat.isEmpty) {
                this._isEmpty = false;
            }
            if (!beat.isRest) {
                this._isRestOnly = false;
            }
        }

        let currentDisplayTick: number = 0;
        let currentPlaybackTick: number = 0;
        for (let i: number = 0; i < this.beats.length; i++) {
            const beat: Beat = this.beats[i];
            beat.index = i;
            beat.finish(settings, sharedDataBag);

            // if this beat is a non-grace but has grace notes
            // we need to first steal the duration from the right beat
            // and place the grace beats correctly
            if (beat.graceType === GraceType.None) {
                if (beat.graceGroup) {
                    const firstGraceBeat = beat.graceGroup!.beats[0];
                    const lastGraceBeat = beat.graceGroup!.beats[beat.graceGroup!.beats.length - 1];
                    if (firstGraceBeat.graceType !== GraceType.BendGrace) {
                        // find out the stolen duration first
                        const stolenDuration: number =
                            lastGraceBeat.playbackStart + lastGraceBeat.playbackDuration - firstGraceBeat.playbackStart;

                        switch (firstGraceBeat.graceType) {
                            case GraceType.BeforeBeat:
                                // steal duration from previous beat and then place grace beats newly
                                if (firstGraceBeat.previousBeat) {
                                    firstGraceBeat.previousBeat.playbackDuration -= stolenDuration;
                                    // place beats starting after new beat end
                                    if (firstGraceBeat.previousBeat.voice === this) {
                                        currentPlaybackTick =
                                            firstGraceBeat.previousBeat.playbackStart +
                                            firstGraceBeat.previousBeat.playbackDuration;
                                    } else {
                                        // stealing into the previous bar
                                        currentPlaybackTick = -stolenDuration;
                                    }
                                } else {
                                    // before-beat on start is somehow not possible as it causes negative ticks
                                    currentPlaybackTick = -stolenDuration;
                                }

                                for (const graceBeat of beat.graceGroup!.beats) {
                                    this._beatLookup.delete(graceBeat.playbackStart);
                                    graceBeat.playbackStart = currentPlaybackTick;
                                    this._beatLookup.set(graceBeat.playbackStart, beat);
                                    currentPlaybackTick += graceBeat.playbackDuration;
                                }

                                break;
                            case GraceType.OnBeat:
                                // steal duration from current beat
                                beat.playbackDuration -= stolenDuration;
                                if (lastGraceBeat.voice === this) {
                                    // with changed durations, update current position to be after the last grace beat
                                    currentPlaybackTick = lastGraceBeat.playbackStart + lastGraceBeat.playbackDuration;
                                } else {
                                    // if last grace beat is on the previous bar, we shift the time back to have the note played earlier
                                    currentPlaybackTick = -stolenDuration;
                                }
                                break;
                        }
                    }
                }

                beat.displayStart = currentDisplayTick;
                beat.playbackStart = currentPlaybackTick;

                if (beat.fermata) {
                    this.bar.masterBar.addFermata(beat.playbackStart, beat.fermata);
                } else {
                    beat.fermata = this.bar.masterBar.getFermata(beat);
                }

                this._beatLookup.set(beat.playbackStart, beat);
            } else {
                beat.displayStart = currentDisplayTick;
                beat.playbackStart = currentPlaybackTick;
            }

            beat.finishTuplet();
            if (beat.graceGroup) {
                beat.graceGroup.finish();
            }
            currentDisplayTick += beat.displayDuration;
            currentPlaybackTick += beat.playbackDuration;
        }
    }

    public calculateDuration(): number {
        if (this.isEmpty || this.beats.length === 0) {
            return 0;
        }
        const lastBeat: Beat = this.beats[this.beats.length - 1];
        const firstBeat: Beat = this.beats[0];
        return lastBeat.playbackStart + lastBeat.playbackDuration - firstBeat.playbackStart;
    }
}
