import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { Environment } from '@coderline/alphatab/Environment';
import {
    EventEmitter,
    EventEmitterOfT,
    type IEventEmitter,
    type IEventEmitterOfT
} from '@coderline/alphatab/EventEmitter';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
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
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class AlphaTabWorkerScoreRenderer<T> implements IScoreRenderer {
    private _worker!: IAlphaTabRenderingWorker;
    private _width: number = 0;
    private _isResizeInFlight: boolean = false;
    private _isResizePending: boolean = false;

    /**
     * The scores sent to the worker, by the id sent along. The worker handles messages in order,
     * so results arriving for an id mean no results follow for older ids.
     */
    private _sentScores = new Map<number, Score>();
    private _lastScoreId = 0;
    private _oldestSentScoreId = 1;

    public boundsLookup: BoundsLookup | null = null;

    public constructor(api: AlphaTabApiBase<T>, worker: IAlphaTabRenderingWorker) {
        this._worker = worker;
        this._worker.postMessage({
            cmd: 'alphaTab.initialize',
            settings: this._serializeSettingsForWorker(api.settings)
        });
        this._worker.addEventListener('message', e => this._handleWorkerMessage(e));
    }

    public destroy(): void {
        this._worker.terminate();
        this.boundsLookup = null;
    }

    public updateSettings(settings: Settings): void {
        this._worker.postMessage({
            cmd: 'alphaTab.updateSettings',
            settings: this._serializeSettingsForWorker(settings)
        });
    }

    // player settings are cut out, they are only needed on UI thread side
    private _serializeSettingsForWorker(settings: Settings): unknown {
        const unwrapped = Environment.prepareForPostMessage(settings);
        let jsObject: unknown = null;
        /*@target web*/
        jsObject = AlphaTabWorkerScoreRenderer._settingsToJsObject(unwrapped);
        if (jsObject === null) {
            const map = JsonConverter.settingsToJsObject(unwrapped)!;
            map.delete('player');
            jsObject = map;
        }
        return jsObject;
    }

    /**
     * @target web
     */
    private static _settingsToJsObject(settings: Settings): unknown {
        const jsObject = SettingsSerializer.toJsObject(settings)!;
        delete jsObject.player;
        return jsObject;
    }

    private _serializeScoreForWorker(score: Score): unknown {
        let jsObject: unknown = null;
        /*@target web*/
        jsObject = ScoreSerializer.toJsObject(score);
        if (jsObject === null) {
            jsObject = JsonConverter.scoreToJsObject(score);
        }
        return jsObject;
    }

    public render(renderHints?: RenderHints): void {
        this._worker.postMessage({
            cmd: 'alphaTab.render',
            renderHints: renderHints
        });
    }

    /**
     * At most one resize is queued in the worker. Requests arriving while one is in flight collapse
     * into a single follow-up resize, which the worker runs with the newest width and settings
     * because those messages are posted immediately and processed before it.
     */
    public resizeRender(): void {
        if (this._isResizeInFlight) {
            this._isResizePending = true;
            return;
        }
        this._postResizeRender();
    }

    private _postResizeRender(): void {
        this._isResizeInFlight = true;
        this._worker.postMessage({
            cmd: 'alphaTab.resizeRender'
        });
    }

    private _onResizeRenderFinished(): void {
        this._isResizeInFlight = false;
        if (this._isResizePending) {
            this._isResizePending = false;
            this._postResizeRender();
        }
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
                const score = this._takeSentScore(data.scoreId);
                if (score && data.boundsLookup) {
                    this.boundsLookup = BoundsLookup.fromJson(data.boundsLookup, score);
                    this.boundsLookup?.finish();
                }
                (this.postRenderFinished as EventEmitter).trigger();
                break;
            /*@target web*/
            case 'alphaTab.postRenderFinishedWire':
                const wireScore = this._takeSentScore(data.scoreId);
                if (wireScore) {
                    this.boundsLookup = BoundsLookupWire.decode(data.boundsLookup as Float64Array, wireScore);
                    this.boundsLookup.finish();
                }
                (this.postRenderFinished as EventEmitter).trigger();
                break;
            case 'alphaTab.resizeRenderFinished':
                this._onResizeRenderFinished();
                break;
            case 'alphaTab.error':
                (this.error as EventEmitterOfT<Error>).trigger(data.error);
                break;
        }
    }

    /**
     * The score a render result with the given id was made for. The api might already hold a newer score.
     */
    private _takeSentScore(scoreId: number): Score | undefined {
        for (let id = this._oldestSentScoreId; id < scoreId; id++) {
            this._sentScores.delete(id);
        }
        this._oldestSentScoreId = Math.max(this._oldestSentScoreId, scoreId);
        return this._sentScores.get(scoreId);
    }

    public renderScore(score: Score | null, trackIndexes: number[] | null, renderHints?: RenderHints): void {
        const jsObject: unknown =
            score == null ? null : this._serializeScoreForWorker(Environment.prepareForPostMessage(score));
        const scoreId = ++this._lastScoreId;
        if (score) {
            this._sentScores.set(scoreId, score);
        }
        this._worker.postMessage({
            cmd: 'alphaTab.renderScore',
            scoreId,
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
