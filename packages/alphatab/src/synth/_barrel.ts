export { AlphaSynthBase, AlphaSynth, type IAlphaSynthAudioExporter } from '@coderline/alphatab/synth/AlphaSynth';
export { CircularSampleBuffer } from '@coderline/alphatab/synth/ds/CircularSampleBuffer';
export { PlaybackRange } from '@coderline/alphatab/synth/PlaybackRange';
export type { ISynthOutput, ISynthOutputDevice } from '@coderline/alphatab/synth/ISynthOutput';
export type { IBackingTrackSynthOutput } from '@coderline/alphatab/synth/BackingTrackPlayer';
export { type IAlphaSynth, BackingTrackSyncPoint } from '@coderline/alphatab/synth/IAlphaSynth';
export { PlayerState } from '@coderline/alphatab/synth/PlayerState';
export { PlayerStateChangedEventArgs } from '@coderline/alphatab/synth/PlayerStateChangedEventArgs';
export { PlaybackRangeChangedEventArgs } from '@coderline/alphatab/synth/PlaybackRangeChangedEventArgs';
export { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';
export { MidiEventsPlayedEventArgs } from '@coderline/alphatab/synth/MidiEventsPlayedEventArgs';
export { ActiveBeatsChangedEventArgs } from '@coderline/alphatab/synth/ActiveBeatsChangedEventArgs';
export { AlphaSynthWebWorkerApi } from '@coderline/alphatab/platform/javascript/AlphaSynthWebWorkerApi';
export { AlphaSynthWebAudioOutputBase } from '@coderline/alphatab/platform/javascript/AlphaSynthWebAudioOutputBase';
export { AlphaSynthScriptProcessorOutput } from '@coderline/alphatab/platform/javascript/AlphaSynthScriptProcessorOutput';
export { AlphaSynthAudioWorkletOutput } from '@coderline/alphatab/platform/javascript/AlphaSynthAudioWorkletOutput';
export type { IAudioElementBackingTrackSynthOutput } from '@coderline/alphatab/platform/javascript/AudioElementBackingTrackSynthOutput';
export type { IExternalMediaHandler, IExternalMediaSynthOutput } from '@coderline/alphatab/synth/ExternalMediaPlayer';
export {
    type IAudioExporter,
    type IAudioExporterWorker,
    AudioExportChunk,
    AudioExportOptions
} from '@coderline/alphatab/synth/IAudioExporter';
