import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { Environment } from '@coderline/alphatab/Environment';
import {
    EventEmitter,
    EventEmitterOfT,
    type IEventEmitter,
    type IEventEmitterOfT
} from '@coderline/alphatab/EventEmitter';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { FontSizes } from '@coderline/alphatab/platform/svg/FontSizes';
import type {
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import type { IScoreRenderer, RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class AlphaTabWorkerScoreRenderer<T> implements IScoreRenderer {
    private _api: AlphaTabApiBase<T>;
    private _worker!: IAlphaTabRenderingWorker;
    private _width: number = 0;

    public boundsLookup: BoundsLookup | null = null;

    public constructor(api: AlphaTabApiBase<T>, worker: IAlphaTabRenderingWorker) {
        this._api = api;
        this._worker = worker;
        this._worker.postMessage({
            cmd: 'alphaTab.initialize',
            settings: this._serializeSettingsForWorker(api.settings)
        });
        this._worker.addEventListener('message', e => this._handleWorkerMessage(e));
    }

    public destroy(): void {
        this._worker.terminate();
    }

    public updateSettings(settings: Settings): void {
        this._worker.postMessage({
            cmd: 'alphaTab.updateSettings',
            settings: this._serializeSettingsForWorker(settings)
        });
    }

    private _serializeSettingsForWorker(settings: Settings): Map<string, unknown> {
        const jsObject = JsonConverter.settingsToJsObject(Environment.prepareForPostMessage(settings))!;
        // cut out player settings, they are only needed on UI thread side
        jsObject.delete('player');
        return jsObject;
    }

    public render(renderHints?: RenderHints): void {
        this._worker.postMessage({
            cmd: 'alphaTab.render',
            renderHints: renderHints
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

    private _handleWorkerMessage(e: MessageEvent<IAlphaTabWorkerMessage>): void {
        const data = e.data;
        const cmd = data.cmd;
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
                const score = this._api.score;
                if (score && data.boundsLookup) {
                    this.boundsLookup = BoundsLookup.fromJson(data.boundsLookup, this._api.score!);
                    this.boundsLookup?.finish();
                }
                (this.postRenderFinished as EventEmitter).trigger();
                break;
            case 'alphaTab.error':
                (this.error as EventEmitterOfT<Error>).trigger(data.error);
                break;
        }
    }

    public renderScore(score: Score | null, trackIndexes: number[] | null, renderHints?: RenderHints): void {
        const jsObject: Map<string, unknown> | null =
            score == null ? null : JsonConverter.scoreToJsObject(Environment.prepareForPostMessage(score));
        this._worker.postMessage({
            cmd: 'alphaTab.renderScore',
            score: jsObject,
            trackIndexes: Environment.prepareForPostMessage(trackIndexes),
            fontSizes: FontSizes.fontSizeLookupTables,
            renderHints
        });
    }

    public readonly preRender: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    public readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly postRenderFinished: IEventEmitter = new EventEmitter();
    public readonly error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
}
