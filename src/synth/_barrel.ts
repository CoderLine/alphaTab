export { AlphaSynthBase, AlphaSynth, type IAlphaSynthAudioExporter } from '@src/synth/AlphaSynth';
export { CircularSampleBuffer } from '@src/synth/ds/CircularSampleBuffer';
export { PlaybackRange } from '@src/synth/PlaybackRange';
export type { ISynthOutput, ISynthOutputDevice } from '@src/synth/ISynthOutput';
export type { IBackingTrackSynthOutput } from '@src/synth/BackingTrackPlayer';
export { type IAlphaSynth, BackingTrackSyncPoint } from '@src/synth/IAlphaSynth';
export { PlayerState } from '@src/synth/PlayerState';
export { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
export { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';
export { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
export { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
export { ActiveBeatsChangedEventArgs } from '@src/synth/ActiveBeatsChangedEventArgs';
export { AlphaSynthWebWorkerApi } from '@src/platform/javascript/AlphaSynthWebWorkerApi';
export { AlphaSynthWebAudioOutputBase } from '@src/platform/javascript/AlphaSynthWebAudioOutputBase';
export { AlphaSynthScriptProcessorOutput } from '@src/platform/javascript/AlphaSynthScriptProcessorOutput';
export { AlphaSynthAudioWorkletOutput } from '@src/platform/javascript/AlphaSynthAudioWorkletOutput';
export type { IAudioElementBackingTrackSynthOutput } from '@src/platform/javascript/AudioElementBackingTrackSynthOutput';
export type { IExternalMediaHandler, IExternalMediaSynthOutput } from '@src/synth/ExternalMediaPlayer';
export {
    type IAudioExporter,
    type IAudioExporterWorker,
    AudioExportChunk,
    AudioExportOptions
} from '@src/synth/IAudioExporter';
