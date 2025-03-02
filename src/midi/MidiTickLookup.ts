import { BeatTickLookup } from '@src/midi/BeatTickLookup';
import { MasterBarTickLookup } from '@src/midi/MasterBarTickLookup';
import { MidiUtils } from '@src/midi/MidiUtils';
import { Beat } from '@src/model/Beat';
import { MasterBar } from '@src/model/MasterBar';

/**
 * Represents the results of searching the currently played beat.
 * @see MidiTickLookup.FindBeat
 */
export class MidiTickLookupFindBeatResult {
    /**
     * Gets or sets the beat that is currently played and used for the start
     * position of the cursor animation.
     */
    public beat!: Beat;

    /**
     * Gets or sets the parent MasterBarTickLookup to which this beat lookup belongs to.
     */
    public masterBar: MasterBarTickLookup;

    /**
     * Gets or sets the related beat tick lookup.
     */
    public beatLookup!: BeatTickLookup;

    /**
     * Gets or sets the beat that will be played next.
     */
    public nextBeat: MidiTickLookupFindBeatResult | null = null;

    /**
     * Gets or sets the duration in midi ticks how long this lookup is valid.
     */
    public tickDuration: number = 0;

    /**
     * Gets or sets the duration in milliseconds how long this lookup is valid.
     */
    public duration: number = 0;

    public get start(): number {
        return this.masterBar.start + this.beatLookup.start;
    }

    public get end(): number {
        return this.start + this.tickDuration;
    }

    public constructor(masterBar: MasterBarTickLookup) {
        this.masterBar = masterBar;
    }

    public calculateDuration() {
        // fast path: only a single tempo throughout the masterbar
        if (this.masterBar.tempoChanges.length === 1) {
            this.duration = MidiUtils.ticksToMillis(this.tickDuration, this.masterBar.tempoChanges[0].tempo);
        } else {
            // Performance Note: I still wonder if we cannot calculate these slices efficiently ahead-of-time. 
            // the sub-slicing in the lookup across beats makes it a bit tricky to do on-the-fly
            // but maybe on finalizing the tick lookup?

            // slow path: need to walk through the tick time-axis and calculate for each slice the milliseconds
            // matching the tempo
            let millis = 0;
            let currentTick = this.start;
            let currentTempo = this.masterBar.tempoChanges[0].tempo;
            const endTick = this.end;

            // for every change calculate the lot
            for (const change of this.masterBar.tempoChanges) {
                // seek to the beat
                if (change.tick < currentTick) {
                    currentTempo = change.tempo;
                }
                // next change is after beat, we can stop looking at changes
                else if (change.tick > endTick) {
                    break;
                } 
                // change while beat is playing
                else {
                    millis += MidiUtils.ticksToMillis(change.tick - currentTick, currentTempo);
                    currentTempo = change.tempo;
                    currentTick = change.tick;
                }
            }

            // last slice
            if(endTick > currentTick) {
                millis += MidiUtils.ticksToMillis(endTick - currentTick, currentTempo);
            }

            this.duration = millis;
        }
    }
}

/**
 * This class holds all information about when {@link MasterBar}s and {@link Beat}s are played.
 *
 * On top level it is organized into {@link MasterBarTickLookup} objects indicating the
 * master bar start and end times. This information is used to highlight the currently played bars
 * and it gives access to the played beats in this masterbar and their times.
 *
 * The {@link BeatTickLookup} are then the slices into which the masterbar is separated by the voices and beats
 * of all tracks. An example how things are organized:
 *
 * Time (eighths):  | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
 *
 * Track 1:         |        B1         |        B2         |    B3   |    B4   |    B5   |    B6   |
 * Track 2:         |                  B7                   |         B7        | B9 | B10| B11| B12|
 * Track 3:         |                                      B13                                      |
 *
 * Lookup:          |        L1         |        L2         |    L3    |   L4   | L5 | L6 | L7 | L8 |
 * Active Beats:
 * - L1             B1,B7,B13
 * - L2                                 B2,B7,B13
 * - L3                                                      B3,B7,B13
 * - L4                                                                 B4,B7,B13
 * - L5                                                                          B5,B9,B13
 * - L6                                                                               B5,B10,B13
 * - L7                                                                                    B6,B11,B13
 * - L8                                                                                         B6,B12,B13
 *
 * Then during playback we build out of this list {@link MidiTickLookupFindBeatResult} objects which are sepcific
 * to the visible tracks displayed. This is required because if only Track 2 is displayed we cannot use the the
 * Lookup L1 alone to determine the start and end of the beat cursor. In this case we will derive a
 * MidiTickLookupFindBeatResult which holds for Time 01 the lookup L1 as start and L3 as end. This will be used
 * both for the cursor and beat highlighting.
 */
export class MidiTickLookup {
    private _currentMasterBar: MasterBarTickLookup | null = null;

    /**
     * Gets a dictionary of all master bars played. The index is the index equals to {@link MasterBar.index}.
     * This lookup only contains the first time a MasterBar is played. For a whole sequence of the song refer to {@link MasterBars}.
     * @internal
     */
    public readonly masterBarLookup: Map<number, MasterBarTickLookup> = new Map();

    /**
     * Gets a list of all {@link MasterBarTickLookup} sorted by time.
     * @internal
     */
    public readonly masterBars: MasterBarTickLookup[] = [];

    /**
     * Finds the currently played beat given a list of tracks and the current time.
     * @param trackLookup The tracks indices in which to search the played beat for.
     * @param tick The current time in midi ticks.
     * @returns The information about the current beat or null if no beat could be found.
     */
    public findBeat(
        trackLookup: Set<number>,
        tick: number,
        currentBeatHint: MidiTickLookupFindBeatResult | null = null
    ): MidiTickLookupFindBeatResult | null {
        let result: MidiTickLookupFindBeatResult | null = null;
        if (currentBeatHint) {
            result = this.findBeatFast(trackLookup, currentBeatHint, tick);
        }

        if (!result) {
            result = this.findBeatSlow(trackLookup, currentBeatHint, tick, false);
        }

        return result;
    }

    private findBeatFast(
        trackLookup: Set<number>,
        currentBeatHint: MidiTickLookupFindBeatResult,
        tick: number
    ): MidiTickLookupFindBeatResult | null {
        // still within current lookup.
        if (tick >= currentBeatHint.start && tick < currentBeatHint.end) {
            return currentBeatHint;
        }
        // already on the next beat?
        else if (
            currentBeatHint.nextBeat &&
            tick >= currentBeatHint.nextBeat.start &&
            tick < currentBeatHint.nextBeat.end
        ) {
            const next = currentBeatHint.nextBeat!;
            // fill next in chain
            this.fillNextBeat(next, trackLookup);
            return next;
        }

        // likely a loop or manual seek, need to fallback to slow path
        return null;
    }

    private fillNextBeat(current: MidiTickLookupFindBeatResult, trackLookup: Set<number>) {
        current.nextBeat = this.findBeatInMasterBar(
            current.masterBar,
            current.beatLookup.nextBeat,
            current.end,
            trackLookup,
            false,
            true
        );

        if (current.nextBeat == null) {
            current.nextBeat = this.findBeatSlow(trackLookup, current, current.end, true);
        }

        // if we have the next beat take the difference between the times as duration
        if (current.nextBeat) {
            current.tickDuration = current.nextBeat.start - current.start;
            current.calculateDuration();
        }

        // no next beat, animate to the end of the bar (could be an incomplete bar)
        if (!current.nextBeat) {
            current.tickDuration = current.masterBar.end - current.start;
            current.calculateDuration();
        }
    }

    private findBeatSlow(
        trackLookup: Set<number>,
        currentBeatHint: MidiTickLookupFindBeatResult | null,
        tick: number,
        isNextSearch: boolean
    ): MidiTickLookupFindBeatResult | null {
        // get all beats within the masterbar
        let masterBar: MasterBarTickLookup | null = null;
        if (currentBeatHint != null) {
            // same masterbar?
            if (currentBeatHint.masterBar.start <= tick && currentBeatHint.masterBar.end > tick) {
                masterBar = currentBeatHint.masterBar;
            }
            // next masterbar
            else if (
                currentBeatHint.masterBar.nextMasterBar &&
                currentBeatHint.masterBar.nextMasterBar.start <= tick &&
                currentBeatHint.masterBar.nextMasterBar.end > tick
            ) {
                masterBar = currentBeatHint.masterBar.nextMasterBar;
            }
        }

        // slowest lookup
        if (!masterBar) {
            masterBar = this.findMasterBar(tick);
        }

        // no match
        if (!masterBar) {
            return null;
        }

        // scan through beats and find first one which has a beat visible
        while (masterBar) {
            if (masterBar.firstBeat) {
                let beat = this.findBeatInMasterBar(
                    masterBar,
                    masterBar.firstBeat,
                    tick,
                    trackLookup,
                    true,
                    isNextSearch
                );

                if (beat) {
                    return beat;
                }
            }

            masterBar = masterBar.nextMasterBar;
        }

        return null;
    }

    /**
     * Finds the beat at a given tick position within the known master bar.
     * @param masterBar
     * @param currentStartLookup
     * @param tick
     * @param visibleTracks
     * @param fillNext
     * @returns
     */
    private findBeatInMasterBar(
        masterBar: MasterBarTickLookup,
        currentStartLookup: BeatTickLookup | null,
        tick: number,
        visibleTracks: Set<number>,
        fillNext: boolean,
        isNextSeach: boolean
    ): MidiTickLookupFindBeatResult | null {
        if (!currentStartLookup) {
            return null;
        }

        let startBeatLookup: BeatTickLookup | null = null;
        let startBeat: Beat | null = null;

        const relativeTick = tick - masterBar.start;

        while (currentStartLookup != null && startBeat == null) {
            if (currentStartLookup.start <= relativeTick && relativeTick < currentStartLookup.end) {
                startBeatLookup = currentStartLookup;
                startBeat = currentStartLookup.getVisibleBeatAtStart(visibleTracks);

                // found the matching beat lookup but none of the beats are visible
                // in this case scan further to the next lookup which has any visible beat
                if (!startBeat) {
                    if (isNextSeach) {
                        let currentMasterBar: MasterBarTickLookup | null = masterBar;
                        while (currentMasterBar != null && startBeat == null) {
                            while (currentStartLookup != null) {
                                startBeat = currentStartLookup.getVisibleBeatAtStart(visibleTracks);

                                if (startBeat) {
                                    startBeatLookup = currentStartLookup;
                                    masterBar = currentMasterBar;
                                    break;
                                }

                                currentStartLookup = currentStartLookup.nextBeat;
                            }

                            if (!startBeat || !startBeatLookup) {
                                currentMasterBar = currentMasterBar.nextMasterBar;
                                currentStartLookup = currentMasterBar?.firstBeat ?? null;
                            }
                        }
                    } else {
                        let currentMasterBar: MasterBarTickLookup | null = masterBar;
                        while (currentMasterBar != null && startBeat == null) {
                            while (currentStartLookup != null) {
                                startBeat = currentStartLookup.getVisibleBeatAtStart(visibleTracks);

                                if (startBeat) {
                                    startBeatLookup = currentStartLookup;
                                    masterBar = currentMasterBar;
                                    break;
                                }

                                currentStartLookup = currentStartLookup.previousBeat;
                            }

                            if (!startBeat || !startBeatLookup) {
                                currentMasterBar = currentMasterBar.previousMasterBar;
                                currentStartLookup = currentMasterBar?.firstBeat ?? null;
                            }
                        }
                    }
                }
            } else if (currentStartLookup.end > relativeTick) {
                break;
            }

            currentStartLookup = currentStartLookup?.nextBeat ?? null;
        }

        if (startBeat == null) {
            return null;
        }

        const result = this.createResult(masterBar, startBeatLookup!, startBeat, fillNext, visibleTracks);

        return result;
    }

    private createResult(
        masterBar: MasterBarTickLookup,
        beatLookup: BeatTickLookup,
        beat: Beat,
        fillNext: boolean,
        visibleTracks: Set<number>
    ) {
        const result = new MidiTickLookupFindBeatResult(masterBar);

        result.beat = beat;
        result.beatLookup = beatLookup;

        result.tickDuration = beatLookup!.end - beatLookup!.start;

        if (fillNext) {
            this.fillNextBeat(result, visibleTracks);
        }

        result.calculateDuration();

        return result;
    }

    private findMasterBar(tick: number): MasterBarTickLookup | null {
        const bars: MasterBarTickLookup[] = this.masterBars;
        let bottom: number = 0;
        let top: number = bars.length - 1;
        while (bottom <= top) {
            const middle: number = ((top + bottom) / 2) | 0;
            const bar: MasterBarTickLookup = bars[middle];
            // found?
            if (tick >= bar.start && tick < bar.end) {
                return bar;
            }
            // search in lower half
            if (tick < bar.start) {
                top = middle - 1;
            } else {
                bottom = middle + 1;
            }
        }
        return null;
    }

    /**
     * Gets the {@link MasterBarTickLookup} for a given masterbar at which the masterbar is played the first time.
     * @param bar The masterbar to find the time period for.
     * @returns A {@link MasterBarTickLookup} containing the details about the first time the {@link MasterBar} is played.
     */
    public getMasterBar(bar: MasterBar): MasterBarTickLookup {
        if (!this.masterBarLookup.has(bar.index)) {
            const fallback = new MasterBarTickLookup();
            fallback.masterBar = bar;
            return fallback;
        }
        return this.masterBarLookup.get(bar.index)!;
    }

    /**
     * Gets the start time in midi ticks for a given masterbar at which the masterbar is played the first time.
     * @param bar The masterbar to find the time period for.
     * @returns The time in midi ticks at which the masterbar is played the first time or 0 if the masterbar is not contained
     */
    public getMasterBarStart(bar: MasterBar): number {
        if (!this.masterBarLookup.has(bar.index)) {
            return 0;
        }
        return this.masterBarLookup.get(bar.index)!.start;
    }

    /**
     * Gets the start time in midi ticks for a given beat at which the masterbar is played the first time.
     * @param beat The beat to find the time period for.
     * @returns The time in midi ticks at which the beat is played the first time or 0 if the beat is not contained
     */
    public getBeatStart(beat: Beat): number {
        if (!this.masterBarLookup.has(beat.voice.bar.index)) {
            return 0;
        }

        return this.masterBarLookup.get(beat.voice.bar.index)!.start + beat.playbackStart;
    }

    /**
     * Adds a new {@link MasterBarTickLookup} to the lookup table.
     * @param masterBar The item to add.
     */
    public addMasterBar(masterBar: MasterBarTickLookup): void {
        this.masterBars.push(masterBar);
        if (this._currentMasterBar) {
            masterBar.previousMasterBar = this._currentMasterBar;
            this._currentMasterBar.nextMasterBar = masterBar;
        }
        this._currentMasterBar = masterBar;
        if (!this.masterBarLookup.has(masterBar.masterBar.index)) {
            this.masterBarLookup.set(masterBar.masterBar.index, masterBar);
        }
    }

    public addBeat(beat: Beat, start: number, duration: number): void {
        const currentMasterBar = this._currentMasterBar;
        if (currentMasterBar) {
            // pre-beat grace notes at the start of the bar we also add the beat to the previous bar
            if (start < 0 && currentMasterBar.previousMasterBar) {
                const relativeMasterBarEnd =
                    currentMasterBar.previousMasterBar!.end - currentMasterBar.previousMasterBar!.start;
                const previousStart = relativeMasterBarEnd + start;
                const previousEnd = previousStart + duration;

                // add to previous bar
                currentMasterBar.previousMasterBar!.addBeat(beat, previousStart, previousStart, duration);

                // overlap to current bar?
                if (previousEnd > relativeMasterBarEnd) {
                    // the start is negative and representing the overlap to the previous bar.
                    const overlapDuration = duration + start;
                    currentMasterBar.addBeat(beat, start, 0, overlapDuration);
                }
            } else {
                currentMasterBar.addBeat(beat, start, start, duration);
            }
        }
    }
}
