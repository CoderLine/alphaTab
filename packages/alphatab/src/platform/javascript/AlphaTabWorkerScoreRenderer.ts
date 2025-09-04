import type { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { EventEmitter, type IEventEmitterOfT, type IEventEmitter, EventEmitterOfT } from '@src/EventEmitter';
import { JsonConverter } from '@src/model/JsonConverter';
import type { Score } from '@src/model/Score';
import { FontSizes } from '@src/platform/svg/FontSizes';
import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import type { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';

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

        try {
            this._worker = Environment.createWebWorker(settings);
        } catch (e) {
            Logger.error('Rendering', `Failed to create WebWorker: ${e}`);
            return;
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
        const jsObject = JsonConverter.settingsToJsObject(Environment.prepareForPostMessage(settings))!;
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

    public renderResult(resultId: string): void {
        this._worker.postMessage({
            cmd: 'alphaTab.renderResult',
            resultId: resultId
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
        const data: any = e.data;
        const cmd: string = data.cmd;
        switch (cmd) {
            case 'alphaTab.preRender':
                (this.preRender as EventEmitterOfT<boolean>).trigger(data.resize);
                break;
            case 'alphaTab.partialRenderFinished':
                (this.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(data.result);
                break;
            case 'alphaTab.partialLayoutFinished':
                (this.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(data.result);
                break;
            case 'alphaTab.renderFinished':
                (this.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(data.result);
                break;
            case 'alphaTab.postRenderFinished':
                this.boundsLookup = BoundsLookup.fromJson(data.boundsLookup, this._api.score!);
                this.boundsLookup.finish();
                (this.postRenderFinished as EventEmitter).trigger();
                break;
            case 'alphaTab.error':
                (this.error as EventEmitterOfT<Error>).trigger(data.error);
                break;
        }
    }

    public renderScore(score: Score | null, trackIndexes: number[] | null): void {
        const jsObject: unknown = score == null ? null : JsonConverter.scoreToJsObject(Environment.prepareForPostMessage(score));
        this._worker.postMessage({
            cmd: 'alphaTab.renderScore',
            score: jsObject,
            trackIndexes: Environment.prepareForPostMessage(trackIndexes),
            fontSizes: FontSizes.FontSizeLookupTables
        });
    }

    public readonly preRender: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    public readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> = new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly postRenderFinished: IEventEmitter = new EventEmitter();
    public readonly error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
}
