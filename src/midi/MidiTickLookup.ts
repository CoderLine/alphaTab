import { BeatTickLookup } from '@src/midi/BeatTickLookup';
import { MasterBarTickLookup } from '@src/midi/MasterBarTickLookup';
import { MidiUtils } from '@src/midi/MidiUtils';
import { Beat } from '@src/model/Beat';
import { MasterBar } from '@src/model/MasterBar';
import { Track } from '@src/model/Track';

/**
 * Represents the results of searching the currently played beat.
 * @see MidiTickLookup.FindBeat
 */
export class MidiTickLookupFindBeatResult {
    /**
     * Gets or sets the beat that is currently played.
     */
    public currentBeat!: Beat;

    /**
     * Gets or sets the beat that will be played next.
     */
    public nextBeat: Beat | null = null;

    /**
     * Gets or sets the duration in milliseconds how long this beat is playing.
     */
    public duration: number = 0;

    /**
     * Gets or sets the beats ot highlight along the current beat.
     */
    public beatsToHighlight!: Beat[];
}

/**
 * This class holds all information about when {@link MasterBar}s and {@link Beat}s are played.
 */
export class MidiTickLookup {
    private _currentMasterBar: MasterBarTickLookup | null = null;

    /**
     * Gets a dictionary of all master bars played. The index is the index equals to {@link MasterBar.index}.
     * This lookup only contains the first time a MasterBar is played. For a whole sequence of the song refer to {@link MasterBars}.
     */
    public readonly masterBarLookup: Map<number, MasterBarTickLookup> = new Map();

    /**
     * Gets a list of all {@link MasterBarTickLookup} sorted by time.
     */
    public readonly masterBars: MasterBarTickLookup[] = [];

    /**
     * Performs the neccessary finalization steps after all information was written.
     */
    public finish(): void {
        let previous: MasterBarTickLookup | null = null;
        let activeBeats: BeatTickLookup[] = [];

        for (let bar of this.masterBars) {
            bar.finish();
            if (previous) {
                previous.nextMasterBar = bar;
            }

            for (const beat of bar.beats) {
                // 1. calculate newly which beats are still active
                const newActiveBeats: BeatTickLookup[] = [];
                // TODO: only create new list if current position changed
                for (let activeBeat of activeBeats) {
                    if (activeBeat.end > beat.start) {
                        newActiveBeats.push(activeBeat);
                        // 2. remember for current beat which active beats to highlight
                        beat.highlightBeat(activeBeat.beat);
                        // 3. ensure that active beat highlights current beat if they match the range
                        if (beat.start <= activeBeat.start) {
                            activeBeat.highlightBeat(beat.beat);
                        }
                    }
                }
                newActiveBeats.push(beat);
                activeBeats = newActiveBeats;
            }
            previous = bar;
        }
    }

    /**
     * Finds the currently played beat given a list of tracks and the current time.
     * @param tracks The tracks in which to search the played beat for.
     * @param tick The current time in midi ticks.
     * @returns The information about the current beat or null if no beat could be found.
     */
    public findBeat(tracks: Track[], tick: number): MidiTickLookupFindBeatResult | null {
        // get all beats within the masterbar
        const masterBar = this.findMasterBar(tick);
        if (!masterBar) {
            return null;
        }

        const trackLookup: Map<number, boolean> = new Map();
        for (const track of tracks) {
            trackLookup.set(track.index, true);
        }

        let beat: BeatTickLookup | null = null;
        let index: number = 0;
        let beats: BeatTickLookup[] = masterBar.beats;
        for (let b: number = 0; b < beats.length; b++) {
            // is the current beat played on the given tick?
            let currentBeat: BeatTickLookup = beats[b];
            // skip non relevant beats
            if (!trackLookup.has(currentBeat.beat.voice.bar.staff.track.index)) {
                continue;
            }

            if (currentBeat.start <= tick && tick < currentBeat.end) {
                // take the latest played beat we can find. (most right)
                if (!beat || beat.start < currentBeat.start) {
                    beat = beats[b];
                    index = b;
                }
            } else if (currentBeat.end > tick) {
                break;
            }
        }

        if (!beat) {
            return null;
        }

        // search for next relevant beat in masterbar
        let nextBeat: BeatTickLookup | null = null;
        for (let b: number = index + 1; b < beats.length; b++) {
            const currentBeat: BeatTickLookup = beats[b];
            if (
                currentBeat.start > beat.start &&
                trackLookup.has(currentBeat.beat.voice.bar.staff.track.index)
            ) {
                nextBeat = currentBeat;
                break;
            }
        }

        // first relevant beat in next bar
        if (!nextBeat && masterBar.nextMasterBar) {
            beats = masterBar.nextMasterBar.beats;
            for (let b: number = 0; b < beats.length; b++) {
                const currentBeat: BeatTickLookup = beats[b];
                if (
                    trackLookup.has(currentBeat.beat.voice.bar.staff.track.index)
                ) {
                    nextBeat = currentBeat;
                    break;
                }
            }
        }

        const result: MidiTickLookupFindBeatResult = new MidiTickLookupFindBeatResult();
        result.currentBeat = beat.beat;
        result.nextBeat = !nextBeat ? null : nextBeat.beat;
        result.duration = !nextBeat
            ? MidiUtils.ticksToMillis(beat.end - beat.start, masterBar.tempo)
            : MidiUtils.ticksToMillis(nextBeat.start - beat.start, masterBar.tempo);
        result.beatsToHighlight = beat.beatsToHighlight;
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
     * Adds a new {@link MasterBarTickLookup} to the lookup table.
     * @param masterBar The item to add.
     */
    public addMasterBar(masterBar: MasterBarTickLookup): void {
        this.masterBars.push(masterBar);
        this._currentMasterBar = masterBar;
        if (!this.masterBarLookup.has(masterBar.masterBar.index)) {
            this.masterBarLookup.set(masterBar.masterBar.index, masterBar);
        }
    }

    /**
     * Adds the given {@link BeatTickLookup} to the current {@link MidiTickLookup}.
     * @param beat The lookup to add.
     */
    public addBeat(beat: BeatTickLookup): void {
        this._currentMasterBar?.addBeat(beat);
    }
}
