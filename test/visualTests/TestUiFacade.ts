import type { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import { Settings } from '@src/Settings';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';
import type { Cursors } from '@src/platform/Cursors';
import type { IContainer } from '@src/platform/IContainer';
import type { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import type { IUiFacade } from '@src/platform/IUiFacade';
import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { Bounds } from '@src/rendering/utils/Bounds';
import type { IAlphaSynth } from '@src/synth/IAlphaSynth';
import type { IAudioExporterWorker } from '@src/synth/IAudioExporter';
import { TestPlatform } from '@test/TestPlatform';

class TestUiContainer implements IContainer {
    private _width: number = 0;
    private _height: number = 0;

    public childNodes: TestUiContainer[] = [];

    public scrollTop: number = 0;
    public scrollLeft: number = 0;
    public left: number = 0;
    public top: number = 0;

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        if (value !== this._width) {
            this._width = value;
            (this.resize as EventEmitter).trigger();
        }
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        if (value !== this._height) {
            this._height = value;
            (this.resize as EventEmitter).trigger();
        }
    }

    public layoutResultId: string = '';
    public body: unknown = null;
    public readonly isVisible: boolean = true;

    public get childElementCount(): number {
        return this.childNodes.length;
    }

    public get lastChild(): TestUiContainer | undefined {
        return this.childNodes.length > 0 ? this.childNodes[this.childNodes.length - 1] : undefined;
    }

    public removeChild(child: TestUiContainer) {
        this.childNodes = this.childNodes.filter(i => i !== child);
    }

    public appendChild(child: IContainer) {
        this.childNodes.push(child as TestUiContainer);
    }

    public stopAnimation() {}

    protected lastBounds: Bounds = new Bounds();

    public setBounds(x: number, y: number, w: number, h: number): void {
        if (Number.isNaN(x)) {
            x = this.lastBounds.x;
        }
        if (Number.isNaN(y)) {
            y = this.lastBounds.y;
        }
        if (Number.isNaN(w)) {
            w = this.lastBounds.w;
        }
        if (Number.isNaN(h)) {
            h = this.lastBounds.h;
        }
        this.left = x;
        this.top = y;
        this.width = w;
        this.height = h;
    }

    public transitionToX(_duration: number, x: number): void {
        this.setBounds(x, Number.NaN, Number.NaN, Number.NaN);
    }

    public clear(): void {
        this.childNodes = [];
    }

    public resize: IEventEmitter = new EventEmitter();

    public mouseDown: IEventEmitterOfT<IMouseEventArgs> = new EventEmitterOfT<IMouseEventArgs>();
    public mouseMove: IEventEmitterOfT<IMouseEventArgs> = new EventEmitterOfT<IMouseEventArgs>();
    public mouseUp: IEventEmitterOfT<IMouseEventArgs> = new EventEmitterOfT<IMouseEventArgs>();
}

export class TestUiFacade implements IUiFacade<unknown> {
    public readonly rootContainer: IContainer;
    public readonly areWorkersSupported: boolean;
    public readonly canRender: boolean;
    public readonly resizeThrottle: number;

    private _resultIdToElementLookup: Map<string, TestUiContainer> = new Map<string, TestUiContainer>();
    private _api!: AlphaTabApiBase<unknown>;
    private _totalResultCount: number = 0;

    public constructor() {
        this.rootContainer = new TestUiContainer();
        this.areWorkersSupported = false;
        this.canRender = true;
        this.resizeThrottle = 10;
    }

    public initialize(api: AlphaTabApiBase<unknown>, raw: unknown): void {
        this._api = api;
        let settings: Settings;
        if (raw instanceof Settings) {
            settings = raw;
        } else {
            settings = new Settings();
        }
        api.settings = settings;
    }

    public destroy(): void {}

    public createCanvasElement(): IContainer {
        return new TestUiContainer();
    }

    public triggerEvent(
        container: IContainer,
        eventName: string,
        details: unknown,
        originalEvent?: IMouseEventArgs
    ): void {
        // nothing to do
    }

    public initialRender(): void {
        this._api.renderer.preRender.on((_: boolean) => {
            this._totalResultCount = 0;
            this._resultIdToElementLookup.clear();
        });

        // rendering was possibly delayed due to invisible element
        // in this case we need the correct width for autosize
        this._api.renderer.width = this.rootContainer.width | 0;
        this._api.renderer.updateSettings(this._api.settings);
    }

    public beginAppendRenderResults(renderResult: RenderFinishedEventArgs | null): void {
        const canvasElement: TestUiContainer = this._api.canvasElement as TestUiContainer;

        // null result indicates that the rendering finished
        if (!renderResult) {
            // so we remove elements that might be from a previous render session
            while (canvasElement.childElementCount > this._totalResultCount) {
                canvasElement.removeChild(canvasElement.lastChild!);
            }
        } else {
            let placeholder: TestUiContainer;
            if (this._totalResultCount < canvasElement.childElementCount) {
                placeholder = canvasElement.childNodes[this._totalResultCount];
            } else {
                placeholder = new TestUiContainer();
                canvasElement.appendChild(placeholder);
            }
            placeholder.left = renderResult.x;
            placeholder.top = renderResult.y;
            placeholder.width = renderResult.width;
            placeholder.height = renderResult.height;
            placeholder.layoutResultId = renderResult.id;

            this._api.renderer.renderResult(renderResult.id);

            this._totalResultCount++;
        }
    }

    public beginUpdateRenderResults(renderResult: RenderFinishedEventArgs): void {
        if (!this._resultIdToElementLookup.has(renderResult.id)) {
            return;
        }

        const placeholder = this._resultIdToElementLookup.get(renderResult.id)!;
        placeholder.body = renderResult.renderResult;
    }

    public createWorkerRenderer(): IScoreRenderer {
        throw new Error('Not supported');
    }

    public createWorkerAudioExporter(synth: IAlphaSynth | null): IAudioExporterWorker {
        throw new Error('Not supported');
    }

    public createWorkerPlayer(): IAlphaSynth | null {
        throw new Error('Not supported');
    }

    public createCursors(): Cursors | null {
        return null;
    }

    public destroyCursors(): void {}

    public beginInvoke(action: () => void): void {
        setImmediate(action);
    }

    public removeHighlights(): void {}

    public highlightElements(groupId: string, masterBarIndex: number): void {}

    public createSelectionElement(): IContainer | null {
        return null;
    }

    public getScrollContainer(): IContainer {
        return this.rootContainer;
    }

    public getOffset(scrollContainer: IContainer | null, container: IContainer): Bounds {
        const element = container as TestUiContainer;

        let top: number = element.top;
        let left: number = element.left;
        if (scrollContainer) {
            const scrollElement = scrollContainer as TestUiContainer;
            const scrollElementOffset = this.getOffset(null, scrollContainer);
            top = top + scrollElement.scrollTop - scrollElementOffset.y;
            left = left + scrollElement.scrollLeft - scrollElementOffset.x;
        }

        const b = new Bounds();
        b.x = left;
        b.y = top;
        b.w = element.width;
        b.h = element.height;
        return b;
    }

    public scrollToY(scrollElement: IContainer, offset: number, speed: number): void {
        scrollElement.scrollTop = offset;
    }

    public scrollToX(scrollElement: IContainer, offset: number, speed: number): void {
        scrollElement.scrollLeft = offset;
    }

    public load(data: unknown, success: (score: Score) => void, error: (error: Error) => void): boolean {
        if (data instanceof Score) {
            success(data);
            return true;
        }
        if (data instanceof ArrayBuffer) {
            const byteArray: Uint8Array = new Uint8Array(data as ArrayBuffer);
            success(ScoreLoader.loadScoreFromBytes(byteArray, this._api.settings));
            return true;
        }
        if (data instanceof Uint8Array) {
            success(ScoreLoader.loadScoreFromBytes(data, this._api.settings));
            return true;
        }
        if (typeof data === 'string') {
            TestPlatform.loadFile(data)
                .then(x => {
                    success(ScoreLoader.loadScoreFromBytes(x));
                })
                .catch(error);
            return true;
        }

        return false;
    }

    public loadSoundFont(data: unknown, append: boolean): boolean {
        if (!this._api.player) {
            return false;
        }

        if (data instanceof ArrayBuffer) {
            this._api.player.loadSoundFont(new Uint8Array(data as ArrayBuffer), append);
            return true;
        }
        if (data instanceof Uint8Array) {
            this._api.player.loadSoundFont(data, append);
            return true;
        }
        if (typeof data === 'string') {
            TestPlatform.loadFile(data)
                .then(x => {
                    this._api.player!.loadSoundFont(x, append);
                })
                .catch(e => {
                    this._api.onError(e);
                });
            return true;
        }
        return false;
    }

    public createBackingTrackPlayer(): IAlphaSynth | null {
        return null;
    }

    public readonly canRenderChanged: IEventEmitter = new EventEmitter();
    public readonly rootContainerBecameVisible: IEventEmitter = new EventEmitter();
}
