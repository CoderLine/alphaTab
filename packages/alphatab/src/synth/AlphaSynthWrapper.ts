import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import type { LogLevel } from '@src/LogLevel';
import type { MidiEventType } from '@src/midi/MidiEvent';
import type { MidiFile } from '@src/midi/MidiFile';
import type { Score } from '@src/model/Score';
import type { BackingTrackSyncPoint, IAlphaSynth } from '@src/synth/IAlphaSynth';
import type { ISynthOutput } from '@src/synth/ISynthOutput';
import type { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import type { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { SynthConstants } from '@src/synth/SynthConstants';

/**
 * A {@link IAlphaSynth} implementation wrapping and underling other {@link IAlphaSynth}
 * allowing dynamic changing of the underlying instance without loosing aspects like the
 * main playback information and event listeners.
 *
 * @remarks
 * This wrapper is used when re-exposing the underlying player via {@link AlphaTabApiBase} to integrators.
 * Even with dynamic switching between synthesizer, backing tracks etc. aspects like volume, playbackspeed,
 * event listeners etc. should not be lost.
 */
export class AlphaSynthWrapper implements IAlphaSynth {
    // relevant state information we want to remember when switching between player instances
    private _masterVolume: number = 1;
    private _metronomeVolume: number = 0;
    private _countInVolume: number = 0;
    private _playbackSpeed: number = 1;
    private _isLooping: boolean = false;
    private _midiEventsPlayedFilter: MidiEventType[] = [];

    private _instance?: IAlphaSynth;
    private _instanceEventUnregister?: (() => void)[];

    public constructor() {
        this.ready = new EventEmitter(() => this.isReady);
        this.readyForPlayback = new EventEmitter(() => this.isReadyForPlayback);
        this.midiLoaded = new EventEmitterOfT<PositionChangedEventArgs>(() => {
            return this._instance?.loadedMidiInfo ?? null;
        });
        this.stateChanged = new EventEmitterOfT<PlayerStateChangedEventArgs>(() => {
            return new PlayerStateChangedEventArgs(this.state, false);
        });
        this.positionChanged = new EventEmitterOfT<PositionChangedEventArgs>(() => {
            return this.currentPosition;
        });
        this.playbackRangeChanged = new EventEmitterOfT<PlaybackRangeChangedEventArgs>(() => {
            const range = this.playbackRange;
            if (range) {
                return new PlaybackRangeChangedEventArgs(range);
            }
            return null;
        });
    }

    public get instance(): IAlphaSynth | undefined {
        return this._instance;
    }

    public set instance(value: IAlphaSynth | undefined) {
        this._instance = value;

        // unregister all events from previous instance
        const unregister = this._instanceEventUnregister;
        if (unregister) {
            for (const e of unregister) {
                e();
            }
        }

        if (value) {
            // regsiter to events of new player and forward them to existing listeners
            const newUnregister: (() => void)[] = [];
            newUnregister.push(value.ready.on(() => (this.ready as EventEmitter).trigger()));
            newUnregister.push(value.readyForPlayback.on(() => (this.readyForPlayback as EventEmitter).trigger()));
            newUnregister.push(value.finished.on(() => (this.finished as EventEmitter).trigger()));
            newUnregister.push(value.soundFontLoaded.on(() => (this.soundFontLoaded as EventEmitter).trigger()));
            newUnregister.push(
                value.soundFontLoadFailed.on(e => (this.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(e))
            );
            newUnregister.push(
                value.midiLoaded.on(e => {
                    (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(e);
                })
            );
            newUnregister.push(
                value.midiLoadFailed.on(e => (this.midiLoadFailed as EventEmitterOfT<Error>).trigger(e))
            );
            newUnregister.push(
                value.stateChanged.on(e =>
                    (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(e)
                )
            );
            newUnregister.push(
                value.positionChanged.on(e => {
                    (this.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(e);
                })
            );
            newUnregister.push(
                value.midiEventsPlayed.on(e =>
                    (this.midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(e)
                )
            );
            newUnregister.push(
                value.playbackRangeChanged.on(e =>
                    (this.playbackRangeChanged as EventEmitterOfT<PlaybackRangeChangedEventArgs>).trigger(e)
                )
            );

            this._instanceEventUnregister = newUnregister;

            // restore state on new player
            if (this.isReady) {
                value.masterVolume = this._masterVolume;
                value.metronomeVolume = this._metronomeVolume;
                value.countInVolume = this._countInVolume;
                value.playbackSpeed = this._playbackSpeed;
                value.isLooping = this._isLooping;
                value.midiEventsPlayedFilter = this._midiEventsPlayedFilter;
                (this.ready as EventEmitter).trigger();
            } else {
                newUnregister.push(
                    value.ready.on(() => {
                        value.masterVolume = this._masterVolume;
                        value.metronomeVolume = this._metronomeVolume;
                        value.countInVolume = this._countInVolume;
                        value.playbackSpeed = this._playbackSpeed;
                        value.isLooping = this._isLooping;
                        value.midiEventsPlayedFilter = this._midiEventsPlayedFilter;
                    })
                );
            }
        } else {
            this._instanceEventUnregister = undefined;
        }
    }

    public get output(): ISynthOutput {
        return this._instance!.output;
    }

    public get isReady(): boolean {
        return this._instance ? this._instance!.isReady : false;
    }

    public get isReadyForPlayback(): boolean {
        return this._instance ? this._instance!.isReadyForPlayback : false;
    }

    public get state(): PlayerState {
        return this._instance ? this._instance!.state : PlayerState.Paused;
    }

    public get logLevel(): LogLevel {
        return Logger.logLevel;
    }

    public set logLevel(value: LogLevel) {
        Logger.logLevel = value;
        if (this._instance) {
            this._instance!.logLevel = value;
        }
    }

    public get masterVolume(): number {
        return this._masterVolume;
    }

    public set masterVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._masterVolume = value;
        if (this._instance) {
            this._instance!.masterVolume = value;
        }
    }

    public get metronomeVolume(): number {
        return this._metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._metronomeVolume = value;
        if (this._instance) {
            this._instance!.metronomeVolume = value;
        }
    }

    public get playbackSpeed(): number {
        return this._playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        this._playbackSpeed = value;
        if (this._instance) {
            this._instance!.playbackSpeed = value;
        }
    }

    public get loadedMidiInfo(): PositionChangedEventArgs | undefined {
        return this._instance ? this._instance.loadedMidiInfo : undefined;
    }
    public get currentPosition(): PositionChangedEventArgs {
        return this._instance
            ? this._instance.currentPosition
            : new PositionChangedEventArgs(0, 0, 0, 0, false, 120, 120);
    }

    public get tickPosition(): number {
        return this._instance ? this._instance.tickPosition : 0;
    }

    public set tickPosition(value: number) {
        if (this._instance) {
            this._instance.tickPosition = value;
        }
    }

    public get timePosition(): number {
        return this._instance ? this._instance!.timePosition : 0;
    }

    public set timePosition(value: number) {
        if (this._instance) {
            this._instance.timePosition = value;
        }
    }

    public get playbackRange(): PlaybackRange | null {
        return this._instance ? this._instance.playbackRange : null;
    }

    public set playbackRange(value: PlaybackRange | null) {
        if (this._instance) {
            this._instance!.playbackRange = value;
        }
    }

    public get isLooping(): boolean {
        return this._isLooping;
    }

    public set isLooping(value: boolean) {
        this._isLooping = value;
        if (this._instance) {
            this._instance!.isLooping = value;
        }
    }

    public get countInVolume(): number {
        return this._countInVolume;
    }

    public set countInVolume(value: number) {
        this._countInVolume = value;
        if (this._instance) {
            this._instance.countInVolume = value;
        }
    }

    public get midiEventsPlayedFilter(): MidiEventType[] {
        return this._midiEventsPlayedFilter;
    }

    public set midiEventsPlayedFilter(value: MidiEventType[]) {
        this._midiEventsPlayedFilter = value;
        if (this._instance) {
            this._instance.midiEventsPlayedFilter = value;
        }
    }

    public destroy(): void {
        if (this._instance) {
            this._instance!.destroy();
            this._instance = undefined;
        }
    }

    public play(): boolean {
        return this._instance ? this._instance!.play() : false;
    }

    public pause(): void {
        if (this._instance) {
            this._instance!.pause();
        }
    }

    public playPause(): void {
        if (this._instance) {
            this._instance!.playPause();
        }
    }

    public stop(): void {
        if (this._instance) {
            this._instance!.stop();
        }
    }

    public playOneTimeMidiFile(midi: MidiFile): void {
        if (this._instance) {
            this._instance!.playOneTimeMidiFile(midi);
        }
    }

    public loadSoundFont(data: Uint8Array, append: boolean): void {
        if (this._instance) {
            this._instance!.loadSoundFont(data, append);
        }
    }

    public resetSoundFonts(): void {
        if (this._instance) {
            this._instance!.resetSoundFonts();
        }
    }

    public loadMidiFile(midi: MidiFile): void {
        if (this._instance) {
            this._instance!.loadMidiFile(midi);
        }
    }

    public loadBackingTrack(score: Score): void {
        if (this._instance) {
            this._instance!.loadBackingTrack(score);
        }
    }

    public updateSyncPoints(syncPoints: BackingTrackSyncPoint[]): void {
        if (this._instance) {
            this._instance!.updateSyncPoints(syncPoints);
        }
    }

    public applyTranspositionPitches(transpositionPitches: Map<number, number>): void {
        if (this._instance) {
            this._instance!.applyTranspositionPitches(transpositionPitches);
        }
    }

    public setChannelTranspositionPitch(channel: number, semitones: number): void {
        if (this._instance) {
            this._instance!.setChannelTranspositionPitch(channel, semitones);
        }
    }

    public setChannelMute(channel: number, mute: boolean): void {
        if (this._instance) {
            this._instance!.setChannelMute(channel, mute);
        }
    }

    public resetChannelStates(): void {
        if (this._instance) {
            this._instance!.resetChannelStates();
        }
    }

    public setChannelSolo(channel: number, solo: boolean): void {
        if (this._instance) {
            this._instance!.setChannelSolo(channel, solo);
        }
    }

    public setChannelVolume(channel: number, volume: number): void {
        if (this._instance) {
            this._instance!.setChannelVolume(channel, volume);
        }
    }

    public readonly ready: IEventEmitter;
    public readonly readyForPlayback: IEventEmitter;
    public readonly finished: IEventEmitter = new EventEmitter();
    public readonly soundFontLoaded: IEventEmitter = new EventEmitter();
    public readonly soundFontLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    public readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs>;
    public readonly midiLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    public readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs>;
    public readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs>;
    public readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> =
        new EventEmitterOfT<MidiEventsPlayedEventArgs>();
    public readonly playbackRangeChanged: IEventEmitterOfT<PlaybackRangeChangedEventArgs>;
}
