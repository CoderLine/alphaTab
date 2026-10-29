import { Environment } from '@coderline/alphatab/Environment';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { Logger } from '@coderline/alphatab/Logger';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { type FontSizeDefinition, FontSizes } from '@coderline/alphatab/platform/svg/FontSizes';
import type {
    IAlphaTabWorkerGlobalScope,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BoundsLookupWireWriter } from '@coderline/alphatab/rendering/utils/BoundsLookupWireWriter';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 * @partial
 */
export class AlphaTabWebWorker {
    private _renderer!: ScoreRenderer;
    /**
     * @target web
     */
    private _boundsWire: BoundsLookupWireWriter | null = null;
    private _scoreId = 0;
    private _main: IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage>;

    public constructor(main: IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage>) {
        this._main = main;
        main.addEventListener('message', e => this._handleMessage(e));
    }

    public static init(): void {
        new AlphaTabWebWorker(Environment.getGlobalWorkerScope<IAlphaTabWorkerMessage>());
    }

    private _handleMessage(e: MessageEvent<IAlphaTabWorkerMessage>): void {
        const data = e.data;
        if (!data?.cmd) {
            return;
        }
        switch (data.cmd) {
            case 'alphaTab.initialize':
                const settings: Settings = JsonConverter.jsObjectToSettings(data.settings);
                Logger.logLevel = settings.core.logLevel;
                this._renderer = new ScoreRenderer(settings);
                /*@target web*/
                this._installBoundsWire();
                this._renderer.partialRenderFinished.on(result => {
                    this._main.postMessage({
                        cmd: 'alphaTab.partialRenderFinished',
                        result: result
                    });
                });
                this._renderer.partialLayoutFinished.on(result => {
                    this._main.postMessage({
                        cmd: 'alphaTab.partialLayoutFinished',
                        result: result
                    });
                });
                this._renderer.renderFinished.on(result => {
                    this._main.postMessage({
                        cmd: 'alphaTab.renderFinished',
                        result: result
                    });
                });
                this._renderer.postRenderFinished.on(() => this._postRenderFinished());
                this._renderer.preRender.on(resize => {
                    this._main.postMessage({
                        cmd: 'alphaTab.preRender',
                        resize: resize
                    });
                });
                this._renderer.error.on(this._error.bind(this));
                break;
            case 'alphaTab.render':
                this._renderer.render(data.renderHints);
                break;
            case 'alphaTab.resizeRender':
                try {
                    this._renderer.resizeRender();
                } finally {
                    this._main.postMessage({ cmd: 'alphaTab.resizeRenderFinished' });
                }
                break;
            case 'alphaTab.renderResult':
                this._renderer.renderResult(data.resultId);
                break;
            case 'alphaTab.setWidth':
                this._renderer.width = data.width;
                break;
            case 'alphaTab.renderScore':
                this._scoreId = data.scoreId;
                this._updateFontSizes(data.fontSizes);
                const renderHints = data.renderHints;
                const score =
                    data.score == null ? null : JsonConverter.jsObjectToScore(data.score, this._renderer.settings);
                this._renderMultiple(score, data.trackIndexes, renderHints);
                break;
            case 'alphaTab.updateSettings':
                this._updateSettings(data.settings);
                break;
        }
    }

    private _postRenderFinished(): void {
        /*@target web*/
        if (this._postBoundsLookupWire()) {
            return;
        }
        this._main.postMessage({
            cmd: 'alphaTab.postRenderFinished',
            scoreId: this._scoreId,
            boundsLookup: this._renderer.boundsLookup?.toJson() ?? null
        });
    }

    /**
     * The main thread is the only consumer of the bounds, so the renderer writes them in wire format
     * and its `boundsLookup` stays null.
     * @target web
     */
    private _installBoundsWire(): void {
        this._boundsWire = new BoundsLookupWireWriter();
        this._renderer.boundsWriter = this._boundsWire;
    }

    /**
     * @target web
     */
    private _postBoundsLookupWire(): boolean {
        const data = this._boundsWire?.encode() ?? null;
        if (!data) {
            return false;
        }
        (this._main as unknown as DedicatedWorkerGlobalScope).postMessage(
            { cmd: 'alphaTab.postRenderFinishedWire', scoreId: this._scoreId, boundsLookup: data },
            [data.buffer]
        );
        return true;
    }

    private _updateFontSizes(fontSizes: Map<string, FontSizeDefinition>): void {
        for (const [k, v] of fontSizes) {
            FontSizes.fontSizeLookupTables.set(k, v);
        }
    }

    private _updateSettings(json: unknown): void {
        SettingsSerializer.fromJson(this._renderer.settings, json);
    }

    private _renderMultiple(score: Score | null, trackIndexes: number[] | null, renderHints?: RenderHints): void {
        try {
            this._renderer.renderScore(score, trackIndexes, renderHints);
        } catch (e) {
            this._error(e as Error);
        }
    }

    private _error(error: Error): void {
        Logger.error('Worker', 'An unexpected error occurred in worker', error);
        this._main.postMessage({
            cmd: 'alphaTab.error',
            error: error
        });
    }
}
