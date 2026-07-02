import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { Environment } from '@coderline/alphatab/Environment';
import type { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { AlphaSynthWebWorkerApi } from '@coderline/alphatab/platform/worker/AlphaSynthWebWorkerApi';
import type { IAlphaSynthWorkerMessage } from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import type { BackingTrackSyncPoint } from '@coderline/alphatab/synth/IAlphaSynth';
import type {
    AudioExportChunk,
    AudioExportOptions,
    IAudioExporterWorker
} from '@coderline/alphatab/synth/IAudioExporter';

/**
 * @internal
 */
export class AlphaSynthAudioExporterWorkerApi implements IAudioExporterWorker {
    private static _nextExporterId = 1;
    private _worker: AlphaSynthWebWorkerApi;
    private _unsubscribe!: () => void;
    private _exporterId: number;
    private _ownsWorker: boolean;

    private _promise: PromiseWithResolvers<unknown> | null = null;

    public constructor(synthWorker: AlphaSynthWebWorkerApi, ownsWorker: boolean) {
        this._exporterId = AlphaSynthAudioExporterWorkerApi._nextExporterId++;
        this._worker = synthWorker;
        this._ownsWorker = ownsWorker;
    }

    public async initialize(
        options: AudioExportOptions,
        midi: MidiFile,
        syncPoints: BackingTrackSyncPoint[],
        transpositionPitches: Map<number, number>
    ): Promise<void> {
        const onmessage: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void = e => this.handleWorkerMessage(e);
        this._worker.worker.addEventListener('message', onmessage);
        this._unsubscribe = () => {
            this._worker.worker.removeEventListener('message', onmessage);
        };

        this._promise = Promise.withResolvers();
        this._worker.worker.postMessage({
            cmd: 'alphaSynth.exporter.initialize',
            exporterId: this._exporterId,
            options: Environment.prepareForPostMessage(options),
            midi: JsonConverter.midiFileToJsObject(Environment.prepareForPostMessage(midi)),
            syncPoints: Environment.prepareForPostMessage(syncPoints),
            transpositionPitches: Environment.prepareForPostMessage(transpositionPitches)
        });
        await this._promise.promise;
    }

    public handleWorkerMessage(e: MessageEvent<IAlphaSynthWorkerMessage>): void {
        const data = e.data;

        switch (data.cmd) {
            case 'alphaSynth.exporter.initialized':
                // for us?
                if (data.exporterId !== this._exporterId) {
                    return;
                }

                this._promise?.resolve(null);
                this._promise = null;
                break;
            case 'alphaSynth.exporter.error':
                // for us?
                if (data.exporterId !== this._exporterId) {
                    return;
                }
                this._promise?.reject(data.error);
                this._promise = null;
                break;
            case 'alphaSynth.exporter.rendered':
                // for us?
                if (data.exporterId !== this._exporterId) {
                    return;
                }
                this._promise?.resolve(data.chunk);
                this._promise = null;
                break;
            case 'alphaSynth.destroyed':
                this._promise?.reject(new AlphaTabError(AlphaTabErrorType.General, 'Worker was destroyed'));
                this._promise = null;
                break;
        }
    }

    public async render(milliseconds: number): Promise<AudioExportChunk | undefined> {
        if (this._promise) {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                'There is already an ongoing operation, wait for initialize to complete before requesting render'
            );
        }

        this._promise = Promise.withResolvers();
        this._worker.worker.postMessage({
            cmd: 'alphaSynth.exporter.render',
            exporterId: this._exporterId,
            milliseconds: milliseconds
        });
        const result = await this._promise.promise;
        return result as AudioExportChunk | undefined;
    }

    destroy(): void {
        this._worker.worker.postMessage({
            cmd: 'alphaSynth.exporter.destroy',
            exporterId: this._exporterId
        });

        this._unsubscribe();
        if (this._ownsWorker) {
            this._worker.destroy();
        }
    }

    [Symbol.dispose](): void {
        this.destroy();
    }
}
