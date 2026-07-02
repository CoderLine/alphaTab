import type { LogLevel } from '@coderline/alphatab/LogLevel';
import type { MidiEventType } from '@coderline/alphatab/midi/MidiEvent';
import type { FontSizeDefinition } from '@coderline/alphatab/platform/_barrel';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { BackingTrackSyncPoint } from '@coderline/alphatab/synth/IAlphaSynth';
import type { AudioExportChunk, AudioExportOptions } from '@coderline/alphatab/synth/IAudioExporter';
import type { PlaybackRange } from '@coderline/alphatab/synth/PlaybackRange';
import type { PlayerState } from '@coderline/alphatab/synth/PlayerState';
import type { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';

/**
 * @internal
 * @discriminated cmd alphaTab.
 */
export type IAlphaTabWorkerMessage =
    // main -> worker
    | { cmd: 'alphaTab.initialize'; settings: Map<string, unknown> }
    | { cmd: 'alphaTab.updateSettings'; settings: Map<string, unknown> }
    | { cmd: 'alphaTab.render'; renderHints: RenderHints | undefined }
    | { cmd: 'alphaTab.resizeRender' }
    | { cmd: 'alphaTab.renderResult'; resultId: string }
    | { cmd: 'alphaTab.setWidth'; width: number }
    | {
          cmd: 'alphaTab.renderScore';
          score: Map<string, unknown> | null;
          trackIndexes: number[] | null;
          fontSizes: Map<string, FontSizeDefinition>;
          renderHints: RenderHints | undefined;
      }
    // worker -> main
    | { cmd: 'alphaTab.preRender'; resize: boolean }
    | { cmd: 'alphaTab.partialRenderFinished'; result: RenderFinishedEventArgs }
    | { cmd: 'alphaTab.partialLayoutFinished'; result: RenderFinishedEventArgs }
    | { cmd: 'alphaTab.renderFinished'; result: RenderFinishedEventArgs }
    | { cmd: 'alphaTab.postRenderFinished'; boundsLookup: Map<string, unknown> | null }
    | { cmd: 'alphaTab.error'; error: Error };

/**
 * @internal
 */
export interface IAlphaTabWorker<T> {
    postMessage(message: T): void;
    addEventListener(event: 'message', handler: (ev: MessageEvent<T>) => void): void;
    removeEventListener(event: 'message', handler: (ev: MessageEvent<T>) => void): void;
    terminate(): void;
}

/**
 * @internal
 */
export interface IAlphaTabWorkerGlobalScope<T> {    
    postMessage(message: T): void;
    addEventListener(event: 'message', handler: (ev: MessageEvent<T>) => void): void;
    removeEventListener(event: 'message', handler: (ev: MessageEvent<T>) => void): void;
}

/**
 * @internal
 * @discriminated cmd alphaSynth.
 */
export type IAlphaSynthWorkerMessage =
    /* main -> worker */
    | { cmd: 'alphaSynth.initialize'; sampleRate: number; logLevel: LogLevel; bufferTimeInMilliseconds: number }
    | { cmd: 'alphaSynth.setLogLevel'; value: LogLevel }
    | { cmd: 'alphaSynth.setMasterVolume'; value: number }
    | { cmd: 'alphaSynth.setMetronomeVolume'; value: number }
    | { cmd: 'alphaSynth.setPlaybackSpeed'; value: number }
    | { cmd: 'alphaSynth.setTickPosition'; value: number }
    | { cmd: 'alphaSynth.setTimePosition'; value: number }
    | { cmd: 'alphaSynth.setPlaybackRange'; value: PlaybackRange | null }
    | { cmd: 'alphaSynth.setIsLooping'; value: boolean }
    | { cmd: 'alphaSynth.setCountInVolume'; value: number }
    | { cmd: 'alphaSynth.setMidiEventsPlayedFilter'; value: MidiEventType[] }
    | { cmd: 'alphaSynth.play' }
    | { cmd: 'alphaSynth.pause' }
    | { cmd: 'alphaSynth.playPause' }
    | { cmd: 'alphaSynth.stop' }
    | { cmd: 'alphaSynth.playOneTimeMidiFile'; midi: unknown }
    | { cmd: 'alphaSynth.loadSoundFontBytes'; data: Uint8Array; append: boolean }
    | { cmd: 'alphaSynth.resetSoundFonts' }
    | { cmd: 'alphaSynth.loadMidi'; midi: unknown }
    | { cmd: 'alphaSynth.setChannelMute'; channel: number; mute: boolean }
    | { cmd: 'alphaSynth.setChannelTranspositionPitch'; channel: number; semitones: number }
    | { cmd: 'alphaSynth.setChannelSolo'; channel: number; solo: boolean }
    | { cmd: 'alphaSynth.setChannelVolume'; channel: number; volume: number }
    | { cmd: 'alphaSynth.resetChannelStates' }
    | { cmd: 'alphaSynth.destroy' }
    | { cmd: 'alphaSynth.applyTranspositionPitches'; transpositionPitches: Map<number, number> }
    /* worker -> main */
    | { cmd: 'alphaSynth.ready' }
    | { cmd: 'alphaSynth.destroyed' }
    | {
          cmd: 'alphaSynth.positionChanged';
          args: PositionChangedEventArgs;
      }
    | { cmd: 'alphaSynth.playerStateChanged'; state: PlayerState; stopped: boolean }
    | { cmd: 'alphaSynth.finished' }
    | { cmd: 'alphaSynth.soundFontLoaded' }
    | { cmd: 'alphaSynth.soundFontLoadFailed'; error: Error }
    | { cmd: 'alphaSynth.midiLoaded'; args: PositionChangedEventArgs }
    | { cmd: 'alphaSynth.midiLoadFailed'; error: Error }
    | { cmd: 'alphaSynth.readyForPlayback' }
    | { cmd: 'alphaSynth.midiEventsPlayed'; events: Map<string, unknown>[] }
    | { cmd: 'alphaSynth.playbackRangeChanged'; playbackRange: PlaybackRange | null }

    /* main -> exporter */
    | {
          cmd: 'alphaSynth.exporter.initialize';
          options: AudioExportOptions;
          midi: unknown;
          syncPoints: BackingTrackSyncPoint[];
          transpositionPitches: Map<number, number>;
          exporterId: number;
      }
    | { cmd: 'alphaSynth.exporter.render'; exporterId: number; milliseconds: number }
    | { cmd: 'alphaSynth.exporter.destroy'; exporterId: number }
    /* exporter -> main */
    | { cmd: 'alphaSynth.exporter.initialized'; exporterId: number }
    | { cmd: 'alphaSynth.exporter.rendered'; exporterId: number; chunk: AudioExportChunk | undefined }
    | { cmd: 'alphaSynth.exporter.error'; exporterId: number; error: Error }
    /* output -> worker */
    | { cmd: 'alphaSynth.output.sampleRequest' }
    | { cmd: 'alphaSynth.output.samplesPlayed'; samples: number }

    /* worker -> output */
    | { cmd: 'alphaSynth.output.addSamples'; samples: Float32Array }
    | { cmd: 'alphaSynth.output.play' }
    | { cmd: 'alphaSynth.output.pause' }
    | { cmd: 'alphaSynth.output.stop' }
    | { cmd: 'alphaSynth.output.destroy' }
    | { cmd: 'alphaSynth.output.resetSamples' };

/**
 * @internal
 */
export interface IAlphaTabRenderingWorker extends IAlphaTabWorker<IAlphaTabWorkerMessage> {}

/**
 * @internal
 */
export interface IAlphaSynthWorker extends IAlphaTabWorker<IAlphaSynthWorkerMessage> {}
