import * as alphaTab from '@coderline/alphatab';
import type { RhythmConfig } from './RhythmConfig';

const MIDI_QUARTER_TIME = 960;

/**
 * Records drum hits into a percussion score while the player runs. The score grows by one system
 * whenever playback nears its end; the tick cache and the MIDI are extended in place so playback
 * continues without a reload, and the MIDI is regenerated when playback stops so the recorded hits
 * become audible.
 */
export class DrumRecorder {
    private readonly slotDuration: alphaTab.model.Duration;
    private readonly slotTicks: number;
    private readonly score: alphaTab.model.Score;
    private readonly staff: alphaTab.model.Staff;
    private currentBeat: alphaTab.model.Beat | undefined;
    private insertTickThreshold = -1;
    private wasPlaying = false;
    private readonly subscriptions: (() => void)[] = [];

    constructor(
        private readonly api: alphaTab.AlphaTabApi,
        private readonly rhythm: RhythmConfig,
        onRecordingChange: (recording: boolean) => void
    ) {
        this.slotDuration = pickSlotDuration(rhythm.subdivisionsPerBeat);
        this.slotTicks = MIDI_QUARTER_TIME / rhythm.subdivisionsPerBeat;

        this.score = new alphaTab.model.Score();
        const track = new alphaTab.model.Track();
        track.name = 'Drums';
        track.shortName = 'Drums';
        track.ensureStaveCount(1);
        track.playbackInfo.primaryChannel = 9;
        track.playbackInfo.secondaryChannel = 9;
        this.staff = track.staves[0];
        this.staff.isPercussion = true;
        this.staff.showTablature = false;
        this.staff.showStandardNotation = true;
        this.score.addTrack(track);
        this.score.defaultSystemsLayout = 5;
        track.defaultSystemsLayout = 5;

        this.subscriptions.push(
            api.scoreLoaded.on(() => this.updateInsertTickThreshold()),
            api.midiLoad.on(midi => this.extendMidi(midi)),
            api.playerPositionChanged.on(e => {
                if (this.insertTickThreshold !== -1 && e.currentTick >= this.insertTickThreshold) {
                    this.insertNewSystem();
                }
            }),
            api.playedBeatChanged.on(beat => {
                this.currentBeat = beat;
            }),
            api.playerStateChanged.on(e => {
                const isPlaying = e.state === alphaTab.synth.PlayerState.Playing;
                if (this.wasPlaying && !isPlaying) {
                    this.api.loadMidiForScore();
                }
                this.wasPlaying = isPlaying;
                onRecordingChange(isPlaying);
            })
        );

        this.insertNewSystem();
    }

    /** Adds `midiNote` to the beat being played; returns whether it was recorded (only during playback). */
    hit(midiNote: number): boolean {
        if (this.api.playerState !== alphaTab.synth.PlayerState.Playing || !this.currentBeat) {
            return false;
        }
        const note = new alphaTab.model.Note();
        note.percussionArticulation = midiNote;
        this.currentBeat.addNote(note);
        this.currentBeat.isEmpty = false;

        const bar = this.currentBeat.voice.bar;
        bar.finish(this.api.settings, null);

        this.api.renderScore(this.score, undefined, {
            reuseViewport: true,
            firstChangedMasterBar: bar.index
        });
        return true;
    }

    /** Renders the recorded score again, e.g. after a settings change. */
    render(): void {
        this.api.renderScore(this.score, undefined, { reuseViewport: true });
    }

    dispose(): void {
        for (const unsubscribe of this.subscriptions) {
            unsubscribe();
        }
        this.subscriptions.length = 0;
    }

    private createEmptyBeatsForBar(): alphaTab.model.Beat[] {
        const beats: alphaTab.model.Beat[] = [];
        for (let i = 0; i < this.rhythm.beatMask.length; i++) {
            const beat = new alphaTab.model.Beat();
            beat.duration = this.slotDuration;
            beat.isEmpty = true;
            beats.push(beat);
        }
        return beats;
    }

    private insertNewMasterBar(): alphaTab.model.MasterBar {
        const masterBar = new alphaTab.model.MasterBar();
        masterBar.timeSignatureNumerator = this.rhythm.timeSignatureNumerator;
        masterBar.timeSignatureDenominator = this.rhythm.timeSignatureDenominator;
        this.score.addMasterBar(masterBar);

        const lookup = new alphaTab.midi.MasterBarTickLookup();
        lookup.tempoChanges.push(new alphaTab.midi.MasterBarTickLookupTempoChange(masterBar.start, this.score.tempo));
        lookup.start = masterBar.start;
        lookup.end = masterBar.start + masterBar.calculateDuration();
        lookup.masterBar = masterBar;
        this.api.tickCache?.addMasterBar(lookup);
        return masterBar;
    }

    private insertNewBar(): alphaTab.model.Bar {
        const previousBar = this.staff.bars.length > 0 ? this.staff.bars[this.staff.bars.length - 1] : null;
        const bar = new alphaTab.model.Bar();
        if (previousBar) {
            bar.clef = previousBar.clef;
            bar.clefOttava = previousBar.clefOttava;
            bar.keySignature = previousBar.keySignature;
            bar.keySignatureType = previousBar.keySignatureType;
        }
        this.staff.addBar(bar);
        const voice = new alphaTab.model.Voice();
        bar.addVoice(voice);

        const beats = this.createEmptyBeatsForBar();
        for (let i = 0; i < beats.length; i++) {
            voice.addBeat(beats[i]);
            this.api.tickCache?.addBeat(beats[i], i * this.slotTicks, this.slotTicks);
        }
        return bar;
    }

    private insertNewSystem(): void {
        this.insertTickThreshold = -1;
        const currentSystemCount = Math.floor(this.score.masterBars.length / this.score.defaultSystemsLayout);
        const neededBars = (currentSystemCount + 1) * this.score.defaultSystemsLayout;
        const lastMasterBarIndex = this.score.masterBars.length - 1;

        let missing = neededBars - this.score.masterBars.length;
        while (missing > 0) {
            const masterBar = this.insertNewMasterBar();
            const bar = this.insertNewBar();
            const dataBag = new Map<string, unknown>();
            masterBar.finish(dataBag);
            bar.finish(this.api.settings, dataBag);
            missing--;
        }

        this.updateInsertTickThreshold();
        this.api.renderScore(this.score, undefined, {
            reuseViewport: currentSystemCount > 0,
            firstChangedMasterBar: currentSystemCount > 0 ? lastMasterBarIndex : undefined
        });
    }

    private updateInsertTickThreshold(): void {
        if (this.score.masterBars.length < 2) {
            this.insertTickThreshold = -1;
            return;
        }
        const lastBar = this.score.masterBars[this.score.masterBars.length - 2];
        const thresholdPercent = 0.8;
        this.insertTickThreshold = lastBar.start + lastBar.calculateDuration() * thresholdPercent;
    }

    /** Pads the MIDI with rests to 30 minutes, so playback runs on while the score grows. */
    private extendMidi(midi: alphaTab.midi.MidiFile): void {
        let rest: alphaTab.midi.AlphaTabRestEvent | undefined;
        const events = midi.tracks[0].events;
        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (e instanceof alphaTab.midi.AlphaTabRestEvent) {
                rest = e;
                break;
            }
        }
        if (!rest) {
            return;
        }
        const desiredMs = 60 * 30 * 1000;
        const tempo = this.api.tickCache!.masterBars[0].tempoChanges[0].tempo;
        const desiredTicks = (desiredMs / (60000.0 / (tempo * MIDI_QUARTER_TIME))) | 0;
        const endOfTrack = events.pop()! as alphaTab.midi.EndOfTrackEvent;
        let tick = rest.tick + MIDI_QUARTER_TIME;
        while (tick < desiredTicks) {
            events.push(new alphaTab.midi.AlphaTabRestEvent(rest.track, tick, rest.channel));
            tick += MIDI_QUARTER_TIME;
        }
        endOfTrack.tick = tick;
    }
}

function pickSlotDuration(subdivisionsPerBeat: number): alphaTab.model.Duration {
    switch (subdivisionsPerBeat) {
        case 2:
            return alphaTab.model.Duration.Eighth;
        case 4:
            return alphaTab.model.Duration.Sixteenth;
        case 8:
            return alphaTab.model.Duration.ThirtySecond;
        case 16:
            return alphaTab.model.Duration.SixtyFourth;
        default:
            throw new Error(`unsupported subdivisionsPerBeat: ${subdivisionsPerBeat}`);
    }
}
