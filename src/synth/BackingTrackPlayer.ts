import type { EventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import type { MidiEvent } from '@src/midi/MidiEvent';
import type { MidiFile } from '@src/midi/MidiFile';
import type { BackingTrack } from '@src/model/BackingTrack';
import type { Score } from '@src/model/Score';
import { AlphaSynthBase } from '@src/synth/AlphaSynth';
import { Queue } from '@src/synth/ds/Queue';
import type { BackingTrackSyncPoint } from '@src/synth/IAlphaSynth';
import type { IAudioSampleSynthesizer } from '@src/synth/IAudioSampleSynthesizer';
import type { ISynthOutput } from '@src/synth/ISynthOutput';
import type { Hydra } from '@src/synth/soundfont/Hydra';
import type { SynthEvent } from '@src/synth/synthesis/SynthEvent';

export interface IBackingTrackSynthOutput extends ISynthOutput {
    readonly timeUpdate: IEventEmitterOfT<number>;
    readonly backingTrackDuration: number;
    playbackRate: number;
    seekTo(time: number): void;
    loadBackingTrack(backingTrack: BackingTrack): void;
}

class BackingTrackAudioSynthesizer implements IAudioSampleSynthesizer {
    private _midiEventQueue: Queue<SynthEvent> = new Queue<SynthEvent>();

    public masterVolume: number = 1;
    public metronomeVolume: number = 0;
    public outSampleRate: number = 44100;
    public currentTempo: number = 120;
    public timeSignatureNumerator: number = 4;
    public timeSignatureDenominator: number = 4;
    public activeVoiceCount: number = 0;

    public noteOffAll(_immediate: boolean): void {
        // not supported, ignore
    }

    public resetSoft(): void {
        // not supported, ignore
    }

    public resetPresets(): void {
        // not supported, ignore
    }

    public loadPresets(
        _hydra: Hydra,
        _instrumentPrograms: Set<number>,
        _percussionKeys: Set<number>,
        _append: boolean
    ): void {
        // not supported, ignore
    }

    public setupMetronomeChannel(_metronomeVolume: number): void {
        // not supported, ignore
    }

    public synthesizeSilent(_sampleCount: number): void {
        this.fakeSynthesize();
    }

    private processMidiMessage(e: MidiEvent): void {}

    public dispatchEvent(synthEvent: SynthEvent): void {
        this._midiEventQueue.enqueue(synthEvent);
    }

    public synthesize(_buffer: Float32Array, _bufferPos: number, _sampleCount: number): SynthEvent[] {
        return this.fakeSynthesize();
    }

    public fakeSynthesize(): SynthEvent[] {
        const processedEvents: SynthEvent[] = [];
        while (!this._midiEventQueue.isEmpty) {
            const m: SynthEvent = this._midiEventQueue.dequeue();
            if (m.isMetronome && this.metronomeVolume > 0) {
                // ignore metronome
            } else if (m.event) {
                this.processMidiMessage(m.event);
            }
            processedEvents.push(m);
        }
        return processedEvents;
    }

    public applyTranspositionPitches(transpositionPitches: Map<number, number>): void {
        // not supported, ignore
    }
    public setChannelTranspositionPitch(channel: number, semitones: number): void {
        // not supported, ignore
    }
    public channelSetMute(channel: number, mute: boolean): void {
        // not supported, ignore
    }
    public channelSetSolo(channel: number, solo: boolean): void {
        // not supported, ignore
    }
    public resetChannelStates(): void {
        // not supported, ignore
    }
    public channelSetMixVolume(channel: number, volume: number): void {
        // not supported, ignore
    }
    public hasSamplesForProgram(program: number): boolean {
        return true;
    }
    public hasSamplesForPercussion(key: number): boolean {
        return true;
    }
}

export class BackingTrackPlayer extends AlphaSynthBase {
    private _backingTrackOutput: IBackingTrackSynthOutput;
    constructor(backingTrackOutput: IBackingTrackSynthOutput, bufferTimeInMilliseconds: number) {
        super(backingTrackOutput, new BackingTrackAudioSynthesizer(), bufferTimeInMilliseconds);
        this._backingTrackOutput = backingTrackOutput;

        backingTrackOutput.timeUpdate.on(timePosition => {
            const alphaTabTimePosition = this.sequencer.mainTimePositionFromBackingTrack(
                timePosition,
                backingTrackOutput.backingTrackDuration
            );

            this.sequencer.fillMidiEventQueueToEndTime(alphaTabTimePosition);
            (this.synthesizer as BackingTrackAudioSynthesizer).fakeSynthesize();

            this.updateTimePosition(alphaTabTimePosition, false);
            this.checkForFinish();
        });
    }

    protected override updatePlaybackSpeed(value: number): void {
        super.updatePlaybackSpeed(value);
        this._backingTrackOutput.playbackRate = value;
    }

    protected override onSampleRequest(): void {
        // should never be called
    }

    public override loadMidiFile(midi: MidiFile): void {
        if (!this.isSoundFontLoaded) {
            this.isSoundFontLoaded = true;
            (this.soundFontLoaded as EventEmitter).trigger();
        }
        super.loadMidiFile(midi);
    }

    protected override updateTimePosition(timePosition: number, isSeek: boolean): void {
        super.updateTimePosition(timePosition, isSeek);
        if (isSeek) {
            this._backingTrackOutput.seekTo(
                this.sequencer.mainTimePositionToBackingTrack(
                    timePosition,
                    this._backingTrackOutput.backingTrackDuration
                )
            );
        }
    }

    public override loadBackingTrack(score: Score, syncPoints: BackingTrackSyncPoint[]): void {
        const backingTrackInfo = score.backingTrack;
        if (backingTrackInfo) {
            this._backingTrackOutput.loadBackingTrack(backingTrackInfo);
            this.sequencer.mainUpdateSyncPoints(syncPoints);
            this.timePosition = 0;
        }
    }
}
