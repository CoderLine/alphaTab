import { JsonConverter } from '@src/model/JsonConverter';
import type { Score } from '@src/model/Score';
import type { IWorkerScope } from '@src/platform/javascript/IWorkerScope';
import { type FontSizeDefinition, FontSizes } from '@src/platform/svg/FontSizes';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';
import { SettingsSerializer } from '@src/generated/SettingsSerializer';

/**
 * @target web
 */
export class AlphaTabWebWorker {
    private _renderer!: ScoreRenderer;
    private _main: IWorkerScope;

    public constructor(main: IWorkerScope) {
        this._main = main;
        this._main.addEventListener('message', this.handleMessage.bind(this), false);
    }

    public static init(): void {
        (Environment.globalThis as any).alphaTabWebWorker = new AlphaTabWebWorker(
            Environment.globalThis as IWorkerScope
        );
    }

    private handleMessage(e: MessageEvent): void {
        const data: any = e.data;
        const cmd: any = data ? data.cmd : '';
        switch (cmd) {
            case 'alphaTab.initialize':
                const settings: Settings = JsonConverter.jsObjectToSettings(data.settings);
                Logger.logLevel = settings.core.logLevel;
                this._renderer = new ScoreRenderer(settings);
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
                this._renderer.postRenderFinished.on(() => {
                    this._main.postMessage({
                        cmd: 'alphaTab.postRenderFinished',
                        boundsLookup: this._renderer.boundsLookup?.toJson() ?? null
                    });
                });
                this._renderer.preRender.on(resize => {
                    this._main.postMessage({
                        cmd: 'alphaTab.preRender',
                        resize: resize
                    });
                });
                this._renderer.error.on(this.error.bind(this));
                break;
            case 'alphaTab.invalidate':
                this._renderer.render();
                break;
            case 'alphaTab.resizeRender':
                this._renderer.resizeRender();
                break;
            case 'alphaTab.renderResult':
                this._renderer.renderResult(data.resultId);
                break;
            case 'alphaTab.setWidth':
                this._renderer.width = data.width;
                break;
            case 'alphaTab.renderScore':
                this.updateFontSizes(data.fontSizes);
                const score: any =
                    data.score == null ? null : JsonConverter.jsObjectToScore(data.score, this._renderer.settings);
                this.renderMultiple(score, data.trackIndexes);
                break;
            case 'alphaTab.updateSettings':
                this.updateSettings(data.settings);
                break;
        }
    }

    private updateFontSizes(fontSizes: { [key: string]: FontSizeDefinition } | Map<string, FontSizeDefinition>): void {
        if (!(fontSizes instanceof Map)) {
            const obj = fontSizes;
            fontSizes = new Map<string, FontSizeDefinition>();
            for (const font in obj) {
                fontSizes.set(font, obj[font]);
            }
        }

        if (fontSizes) {
            if (!FontSizes.FontSizeLookupTables) {
                FontSizes.FontSizeLookupTables = new Map<string, FontSizeDefinition>();
            }
            for (const [k, v] of fontSizes) {
                FontSizes.FontSizeLookupTables.set(k, v);
            }
        }
    }

    private updateSettings(json: unknown): void {
        SettingsSerializer.fromJson(this._renderer.settings, json);
    }

    private renderMultiple(score: Score | null, trackIndexes: number[] | null): void {
        try {
            this._renderer.renderScore(score, trackIndexes);
        } catch (e) {
            this.error(e as Error);
        }
    }

    private error(error: Error): void {
        Logger.error('Worker', 'An unexpected error occurred in worker', error);
        this._main.postMessage({
            cmd: 'alphaTab.error',
            error: error
        });
    }
}
