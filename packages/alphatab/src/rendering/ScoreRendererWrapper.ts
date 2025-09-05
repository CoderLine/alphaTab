import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import type { Score } from '@src/model/Score';
import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import type { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import type { Settings } from '@src/Settings';

/**
 * A {@link IScoreRenderer} implementation wrapping and underling other {@link IScoreRenderer}
 * allowing dynamic changing of the underlying instance without loosing aspects like the
 * event listeners.
 */
export class ScoreRendererWrapper implements IScoreRenderer {
    private _instance?: IScoreRenderer;
    private _instanceEventUnregister?: (() => void)[];
    private _settings?: Settings;
    private _width: number = 0;
    private _score: Score | null = null;
    private _trackIndexes: number[] | null = null;

    public get instance(): IScoreRenderer | undefined {
        return this._instance;
    }

    public set instance(value: IScoreRenderer | undefined) {
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
            newUnregister.push(value.preRender.on(v => (this.preRender as EventEmitterOfT<boolean>).trigger(v)));
            newUnregister.push(
                value.renderFinished.on(v =>
                    (this.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(v)
                )
            );
            newUnregister.push(
                value.partialRenderFinished.on(v =>
                    (this.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(v)
                )
            );
            newUnregister.push(
                value.partialLayoutFinished.on(v =>
                    (this.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(v)
                )
            );
            newUnregister.push(value.postRenderFinished.on(() => (this.postRenderFinished as EventEmitter).trigger()));
            newUnregister.push(value.error.on(v => (this.error as EventEmitterOfT<Error>).trigger(v)));

            this._instanceEventUnregister = newUnregister;

            if (this._settings) {
                value.updateSettings(this._settings!);
            }
            value.width = this._width;
            if (this._score !== null) {
                value.renderScore(this._score, this._trackIndexes);
            }
        } else {
            this._instanceEventUnregister = undefined;
        }
    }

    public get boundsLookup(): BoundsLookup | null {
        return this._instance ? this._instance!.boundsLookup : null;
    }

    public get width(): number {
        return this._instance ? this._instance!.width : 0;
    }

    public set width(value: number) {
        this._width = value;
        if (this._instance) {
            this._instance.width = value;
        }
    }

    public render(): void {
        this._instance?.render();
    }

    public resizeRender(): void {
        this._instance?.resizeRender();
    }

    public renderScore(score: Score | null, trackIndexes: number[] | null): void {
        this._score = score;
        this._trackIndexes = trackIndexes;
        this._instance?.renderScore(score, trackIndexes);
    }

    public renderResult(resultId: string): void {
        this._instance?.renderResult(resultId);
    }

    public updateSettings(settings: Settings): void {
        this._settings = settings;
        this._instance?.updateSettings(settings);
    }

    public destroy(): void {
        this._instance?.destroy();
        this._instance = undefined;
    }

    public readonly preRender: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    public readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly postRenderFinished: IEventEmitter = new EventEmitter();
    public readonly error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
}
