import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { EventEmitter, IEventEmitterOfT, IEventEmitter, EventEmitterOfT } from '@src/EventEmitter';
import { JsonConverter } from '@src/model/JsonConverter';
import { Score } from '@src/model/Score';
import { FontSizes } from '@src/platform/svg/FontSizes';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';

/**
 * @target web
 */
export class AlphaTabWorkerScoreRenderer<T> implements IScoreRenderer {
    private _api: AlphaTabApiBase<T>;
    private _worker!: Worker;
    private _width: number = 0;

    public boundsLookup: BoundsLookup | null = null;

    public constructor(api: AlphaTabApiBase<T>, settings: Settings) {
        this._api = api;

        if (!settings.core.scriptFile) {
            Logger.error('Rendering', `Could not detect alphaTab script file, cannot initialize renderer`);
            return;
        }

        // first try blob worker
        try {
            let script: string = `importScripts('${settings.core.scriptFile}')`;
            let blob: Blob = new Blob([script]);
            this._worker = new Worker(URL.createObjectURL(blob));
        } catch (e) {
            try {
                this._worker = new Worker(settings.core.scriptFile);
            } catch (e2) {
                Logger.error('Rendering', `Failed to create WebWorker: ${e}`);
                return;
            }
        }
        this._worker.postMessage({
            cmd: 'alphaTab.initialize',
            settings: this.serializeSettingsForWorker(settings)
        });
        this._worker.addEventListener('message', this.handleWorkerMessage.bind(this));
    }

    public destroy(): void {
        this._worker.terminate();
    }

    public updateSettings(settings: Settings): void {
        this._worker.postMessage({
            cmd: 'alphaTab.updateSettings',
            settings: this.serializeSettingsForWorker(settings)
        });
    }

    private serializeSettingsForWorker(settings: Settings): unknown {
        const jsObject = JsonConverter.settingsToJsObject(settings)!;
        // cut out player settings, they are only needed on UI thread side
        jsObject.delete('player');
        return jsObject;
    }

    public render(): void {
        this._worker.postMessage({
            cmd: 'alphaTab.render'
        });
    }

    public resizeRender(): void {
        this._worker.postMessage({
            cmd: 'alphaTab.resizeRender'
        });
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
        this._worker.postMessage({
            cmd: 'alphaTab.setWidth',
            width: value
        });
    }

    private handleWorkerMessage(e: MessageEvent): void {
        let data: any = e.data;
        let cmd: string = data.cmd;
        switch (cmd) {
            case 'alphaTab.preRender':
                (this.preRender as EventEmitterOfT<boolean>).trigger(data.resize);
                break;
            case 'alphaTab.partialRenderFinished':
                (this.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(data.result);
                break;
            case 'alphaTab.renderFinished':
                (this.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(data.result);
                break;
            case 'alphaTab.postRenderFinished':
                this.boundsLookup = BoundsLookup.fromJson(data.boundsLookup, this._api.score!);
                (this.postRenderFinished as EventEmitter).trigger();
                break;
            case 'alphaTab.error':
                (this.error as EventEmitterOfT<Error>).trigger(data.error);
                break;
        }
    }

    public renderScore(score: Score, trackIndexes: number[]): void {
        let jsObject: unknown = JsonConverter.scoreToJsObject(score);
        this._worker.postMessage({
            cmd: 'alphaTab.renderScore',
            score: jsObject,
            trackIndexes: trackIndexes,
            fontSizes: FontSizes.FontSizeLookupTables
        });
    }

    public preRender: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    public partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> = new EventEmitterOfT<RenderFinishedEventArgs>();
    public renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> = new EventEmitterOfT<RenderFinishedEventArgs>();
    public postRenderFinished: IEventEmitter = new EventEmitter();
    public error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
}
