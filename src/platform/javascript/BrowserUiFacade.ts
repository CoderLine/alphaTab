import type { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import type { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { Environment } from '@src/Environment';
import { EventEmitter, type IEventEmitter } from '@src/EventEmitter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { Score } from '@src/model/Score';
import { NotationMode } from '@src/NotationSettings';
import type { IContainer } from '@src/platform/IContainer';
import { HtmlElementContainer } from '@src/platform/javascript/HtmlElementContainer';
import { FontSizes } from '@src/platform/svg/FontSizes';
import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Settings } from '@src/Settings';
import { FontLoadingChecker } from '@src/util/FontLoadingChecker';
import { Logger } from '@src/Logger';
import type { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import type { IUiFacade } from '@src/platform/IUiFacade';
import { AlphaSynthScriptProcessorOutput } from '@src/platform/javascript/AlphaSynthScriptProcessorOutput';
import { AlphaSynthWebWorkerApi } from '@src/platform/javascript/AlphaSynthWebWorkerApi';
import type { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';
import { AlphaTabWorkerScoreRenderer } from '@src/platform/javascript/AlphaTabWorkerScoreRenderer';
import type { BrowserMouseEventArgs } from '@src/platform/javascript/BrowserMouseEventArgs';
import { Cursors } from '@src/platform/Cursors';
import { JsonConverter } from '@src/model/JsonConverter';
import { SettingsSerializer } from '@src/generated/SettingsSerializer';
import { WebPlatform } from '@src/platform/javascript/WebPlatform';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { AlphaSynthAudioWorkletOutput } from '@src/platform/javascript/AlphaSynthAudioWorkletOutput';
import { ScalableHtmlElementContainer } from '@src/platform/javascript/ScalableHtmlElementContainer';
import { PlayerOutputMode } from '@src/PlayerSettings';
import type { SettingsJson } from '@src/generated/SettingsJson';
import { AudioElementBackingTrackSynthOutput } from '@src/platform/javascript/AudioElementBackingTrackSynthOutput';
import { BackingTrackPlayer } from '@src/synth/BackingTrackPlayer';
import { CoreSettings, FontFileFormat } from '@src/CoreSettings';
import type { IAudioExporterWorker } from '@src/synth/IAudioExporter';
import { AlphaSynthAudioExporterWorkerApi } from '@src/platform/javascript/AlphaSynthAudioExporterWorkerApi';

/**
 * @target web
 */
enum ResultState {
    LayoutDone = 0,
    RenderRequested = 1,
    RenderDone = 2,
    Detached = 3
}

/**
 * @target web
 */
interface ResultPlaceholder extends HTMLElement {
    layoutResultId?: string;
    resultState: ResultState;
    renderedResult?: Element[];
    renderedResultId?: string;
}

/**
 * @target web
 */
interface RegisteredWebFont {
    hash: number;
    element: HTMLStyleElement;
    usages: number;
    fontSuffix: string;
    checker: FontLoadingChecker;
}

/**
 * @target web
 */
export class BrowserUiFacade implements IUiFacade<unknown> {
    private _fontCheckers: Map<string, FontLoadingChecker> = new Map();
    private _api!: AlphaTabApiBase<unknown>;
    private _contents: string | null = null;
    private _file: string | null = null;
    private _totalResultCount: number = 0;
    private _initialTrackIndexes: number[] | null = null;
    private _intersectionObserver: IntersectionObserver;
    private _barToElementLookup: Map<number, HTMLElement> = new Map<number, HTMLElement>();
    private _resultIdToElementLookup: Map<string, ResultPlaceholder> = new Map<string, ResultPlaceholder>();
    private _webFont!: RegisteredWebFont;

    public rootContainerBecameVisible: IEventEmitter = new EventEmitter();
    public canRenderChanged: IEventEmitter = new EventEmitter();

    public get resizeThrottle(): number {
        return 10;
    }

    public rootContainer: IContainer;
    public areWorkersSupported: boolean;

    public get canRender(): boolean {
        return this.areAllFontsLoaded();
    }

    private areAllFontsLoaded(): boolean {
        let isAnyNotLoaded = false;
        for (const checker of this._fontCheckers.values()) {
            if (!checker.isFontLoaded) {
                isAnyNotLoaded = true;
            }
        }

        if (isAnyNotLoaded) {
            return false;
        }

        Logger.debug('Font', `All fonts loaded: ${this._fontCheckers.size}`);
        return true;
    }

    private onFontLoaded(family: string): void {
        FontSizes.generateFontLookup(family);
        if (this.areAllFontsLoaded()) {
            (this.canRenderChanged as EventEmitter).trigger();
        }
    }

    public constructor(rootElement: HTMLElement) {
        if (Environment.webPlatform !== WebPlatform.Browser && Environment.webPlatform !== WebPlatform.BrowserModule) {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                'Usage of AlphaTabApi is only possible in browser environments. For usage in node use the Low Level APIs'
            );
        }
        rootElement.classList.add('alphaTab');
        this.rootContainer = new HtmlElementContainer(rootElement);
        this.areWorkersSupported = 'Worker' in window;

        this._intersectionObserver = new IntersectionObserver(this.onElementVisibilityChanged.bind(this), {
            threshold: [0, 0.01, 1]
        });
        this._intersectionObserver.observe(rootElement);
    }

    private onElementVisibilityChanged(entries: IntersectionObserverEntry[]) {
        for (const e of entries) {
            const htmlElement = e.target as HTMLElement;
            if (htmlElement === (this.rootContainer as HtmlElementContainer).element) {
                if (e.isIntersecting) {
                    (this.rootContainerBecameVisible as EventEmitter).trigger();
                    this._intersectionObserver.unobserve((this.rootContainer as HtmlElementContainer).element);
                }
            } else if ('layoutResultId' in htmlElement && this._api.settings.core.enableLazyLoading) {
                const placeholder = htmlElement as ResultPlaceholder;
                if (e.isIntersecting) {
                    // missing result or result not matching layout -> request render
                    if (placeholder.renderedResultId !== placeholder.layoutResultId) {
                        if (this._resultIdToElementLookup.has(placeholder.layoutResultId!)) {
                            if (placeholder.resultState !== ResultState.RenderRequested) {
                                placeholder.resultState = ResultState.RenderRequested;
                                this._api.renderer.renderResult(placeholder.layoutResultId!);
                            } else {
                                // Already requested render of this partial, wait for result
                            }
                        } else {
                            htmlElement.replaceChildren();
                        }
                    }
                    // detached and became visible
                    else if (placeholder.resultState === ResultState.Detached) {
                        htmlElement.replaceChildren(...placeholder.renderedResult!);
                        placeholder.resultState = ResultState.RenderDone;
                    }
                } else if (placeholder.resultState === ResultState.RenderDone) {
                    placeholder.resultState = ResultState.Detached;
                    placeholder.replaceChildren();
                }
            }
        }
    }

    public createWorkerRenderer(): IScoreRenderer {
        return new AlphaTabWorkerScoreRenderer<unknown>(this._api, this._api.settings);
    }

    public initialize(api: AlphaTabApiBase<unknown>, raw: SettingsJson | Settings): void {
        this._api = api;
        let settings: Settings;
        if (raw instanceof Settings) {
            settings = raw;
        } else {
            settings = JsonConverter.jsObjectToSettings(raw);
        }

        const dataAttributes: Map<string, unknown> = this.getDataAttributes();
        SettingsSerializer.fromJson(settings, dataAttributes);
        if (settings.notation.notationMode === NotationMode.SongBook) {
            settings.setSongBookModeSettings();
        }
        api.settings = settings;
        this.setupFontCheckers(settings);

        this._initialTrackIndexes = this.parseTracks(settings.core.tracks);
        this._contents = '';
        const element: HtmlElementContainer = api.container as HtmlElementContainer;
        if (settings.core.tex) {
            this._contents = element.element.innerHTML;
            element.element.innerHTML = '';
        }
        this.createStyleElements(settings);
        this._file = settings.core.file;
    }

    private setupFontCheckers(settings: Settings): void {
        this.registerFontChecker(settings.display.resources.copyrightFont);
        this.registerFontChecker(settings.display.resources.effectFont);
        this.registerFontChecker(settings.display.resources.fingeringFont);
        this.registerFontChecker(settings.display.resources.graceFont);
        this.registerFontChecker(settings.display.resources.markerFont);
        this.registerFontChecker(settings.display.resources.tablatureFont);
        this.registerFontChecker(settings.display.resources.titleFont);
        this.registerFontChecker(settings.display.resources.wordsFont);
        this.registerFontChecker(settings.display.resources.barNumberFont);
        this.registerFontChecker(settings.display.resources.fretboardNumberFont);
        this.registerFontChecker(settings.display.resources.subTitleFont);
    }

    private registerFontChecker(font: Font): void {
        if (!this._fontCheckers.has(font.families.join(', '))) {
            const checker: FontLoadingChecker = new FontLoadingChecker(font.families);
            this._fontCheckers.set(font.families.join(', '), checker);
            checker.fontLoaded.on(this.onFontLoaded.bind(this));
            checker.checkForFontAvailability();
        }
    }

    public destroy(): void {
        (this.rootContainer as HtmlElementContainer).element.innerHTML = '';
        const webFont = this._webFont;
        webFont.usages--;
        if (webFont.usages <= 0) {
            webFont.element.remove();
            BrowserUiFacade._registeredWebFonts.delete(webFont.hash);
        }
    }

    public createCanvasElement(): IContainer {
        const canvasElement: HTMLElement = document.createElement('div');
        canvasElement.classList.add('at-surface', `at${this._webFont.fontSuffix}`);
        canvasElement.style.fontSize = '0';
        canvasElement.style.overflow = 'hidden';
        canvasElement.style.lineHeight = '0';
        canvasElement.style.position = 'relative';
        return new HtmlElementContainer(canvasElement);
    }

    public triggerEvent(
        container: IContainer,
        name: string,
        details: unknown = null,
        originalEvent?: IMouseEventArgs
    ): void {
        const element: HTMLElement = (container as HtmlElementContainer).element;
        name = `alphaTab.${name}`;
        const e: any = document.createEvent('CustomEvent');
        const originalMouseEvent: MouseEvent | null = originalEvent
            ? (originalEvent as BrowserMouseEventArgs).mouseEvent
            : null;
        e.initCustomEvent(name, false, false, details);
        if (originalMouseEvent) {
            e.originalEvent = originalMouseEvent;
        }
        element.dispatchEvent(e);
        if (window && 'jQuery' in window) {
            const jquery: any = (window as any).jQuery;
            const args: unknown[] = [];
            args.push(details);
            if (originalMouseEvent) {
                args.push(originalMouseEvent);
            }
            jquery(element).trigger(name, args);
        }
    }

    public load(data: unknown, success: (score: Score) => void, error: (error: Error) => void): boolean {
        if (data instanceof Score) {
            success(data);
            return true;
        }
        if (data instanceof ArrayBuffer) {
            const byteArray: Uint8Array = new Uint8Array(data);
            success(ScoreLoader.loadScoreFromBytes(byteArray, this._api.settings));
            return true;
        }
        if (data instanceof Uint8Array) {
            success(ScoreLoader.loadScoreFromBytes(data, this._api.settings));
            return true;
        }
        if (typeof data === 'string') {
            ScoreLoader.loadScoreAsync(data, success, error, this._api.settings);
            return true;
        }
        return false;
    }

    public loadSoundFont(data: unknown, append: boolean): boolean {
        if (!this._api.player) {
            return false;
        }

        if (data instanceof ArrayBuffer) {
            this._api.player.loadSoundFont(new Uint8Array(data), append);
            return true;
        }
        if (data instanceof Uint8Array) {
            this._api.player.loadSoundFont(data, append);
            return true;
        }
        if (typeof data === 'string') {
            (this._api as AlphaTabApi).loadSoundFontFromUrl(data, append);
            return true;
        }
        return false;
    }

    public initialRender(): void {
        this._api.renderer.preRender.on((_: boolean) => {
            this._totalResultCount = 0;
            this._resultIdToElementLookup.clear();
            this._barToElementLookup.clear();
        });

        const initialRender = () => {
            // rendering was possibly delayed due to invisible element
            // in this case we need the correct width for autosize
            this._api.renderer.width = this.rootContainer.width | 0;
            this._api.renderer.updateSettings(this._api.settings);
            if (this._contents) {
                this._api.tex(this._contents, this._initialTrackIndexes ?? undefined);
                this._initialTrackIndexes = null;
            } else if (this._file) {
                ScoreLoader.loadScoreAsync(
                    this._file,
                    s => {
                        this._api.renderScore(s, this._initialTrackIndexes ?? undefined);
                        this._initialTrackIndexes = null;
                    },
                    e => {
                        this._api.onError(e as Error);
                    },
                    this._api.settings
                );
            }
        };

        if (!this.rootContainer!.isVisible) {
            this.rootContainerBecameVisible.on(initialRender);
        } else {
            initialRender();
        }
    }

    private createStyleElements(settings: Settings): void {
        const root = (this._api.container as HtmlElementContainer).element.ownerDocument!;
        BrowserUiFacade.createSharedStyleElement(root);

        // SmuFl Font Specific style

        const smuflFontSources =
            settings.core.smuflFontSources ?? CoreSettings.buildDefaultSmuflFontSources(settings.core.fontDirectory);

        // create a simple unique hash for the font source definition
        // as data urls might be used we don't want to just use the plain strings.
        const hash = BrowserUiFacade.cyrb53(smuflFontSources.values());

        // reuse existing style if available
        const registeredWebFonts = BrowserUiFacade._registeredWebFonts;
        if (registeredWebFonts.has(hash)) {
            const webFont = registeredWebFonts.get(hash)!;
            webFont.usages++;
            webFont.checker.fontLoaded.on(this.onFontLoaded.bind(this));
            this._webFont = webFont;
            return;
        }

        const fontSuffix = registeredWebFonts.size === 0 ? '' : String(registeredWebFonts.size);
        const familyName = `alphaTab${fontSuffix}`;

        const src = Array.from(smuflFontSources.entries())
            .map(e => `url(${JSON.stringify(e[1])}) format('${BrowserUiFacade.cssFormat(e[0])}')`)
            .join(',');

        const css: string = `
            @font-face {
                font-display: block;
                font-family: '${familyName}';
                src: ${src};
                font-weight: normal;
                font-style: normal;
            }
            .at-surface.at${fontSuffix} .at {
                font-family: '${familyName}';
                speak: none;
                font-style: normal;
                font-weight: normal;
                font-variant: normal;
                text-transform: none;
                line-height: 1;
                line-height: 1;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                font-size: ${Environment.MusicFontSize}px;
                overflow: visible !important;
            }`;

        const styleElement = root.createElement('style');
        styleElement.id = `alphaTabStyle${fontSuffix}`;
        styleElement.innerHTML = css;
        root.getElementsByTagName('head').item(0)!.appendChild(styleElement);
        const checker = new FontLoadingChecker([familyName]);
        checker.fontLoaded.on(this.onFontLoaded.bind(this));
        this._fontCheckers.set(familyName, checker);
        checker.checkForFontAvailability();

        settings.display.resources.smuflFont = new Font(
            familyName,
            Environment.MusicFontSize,
            FontStyle.Plain,
            FontWeight.Regular
        );

        const webFont: RegisteredWebFont = {
            hash,
            element: styleElement,
            fontSuffix,
            usages: 1,
            checker
        };

        registeredWebFonts.set(hash, webFont);
        this._webFont = webFont;
    }

    private static cssFormat(format: FontFileFormat) {
        switch (format) {
            case FontFileFormat.EmbeddedOpenType:
                return 'embedded-opentype';
            case FontFileFormat.Woff:
                return 'woff';
            case FontFileFormat.Woff2:
                return 'woff2';
            case FontFileFormat.OpenType:
                return 'opentype';
            case FontFileFormat.TrueType:
                return 'truetype';
            case FontFileFormat.Svg:
                return 'svg';
        }
    }

    private static _registeredWebFonts: Map<number, RegisteredWebFont> = new Map<number, RegisteredWebFont>();

    /**
     * cyrb53 (c) 2018 bryc (github.com/bryc)
     * License: Public domain (or MIT if needed). Attribution appreciated.
     * A fast and simple 53-bit string hash function with decent collision resistance.
     * Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity
     * @param str
     * @param seed
     * @returns
     */
    private static cyrb53(strings: Iterable<string>, seed: number = 0) {
        let h1 = 0xdeadbeef ^ seed;
        let h2 = 0x41c6ce57 ^ seed;
        for (const str of strings) {
            for (let i = 0; i < str.length; i++) {
                const ch = str.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }

    /**
     * Creates the default CSS styles used across all alphaTab instances.
     * @target web
     * @internal
     */
    public static createSharedStyleElement(root: Document) {
        let styleElement: HTMLStyleElement = root.getElementById('alphaTabStyle') as HTMLStyleElement;
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'alphaTabStyleShared';
            const css: string = `
                .at-surface * {
                    cursor: default;
                    vertical-align: top;
                    overflow: visible;
                }
                .at-surface-svg text {
                    dominant-baseline: central;
                    white-space:pre;
                }`;

            styleElement.innerHTML = css;
            document.getElementsByTagName('head').item(0)!.appendChild(styleElement);
        }
    }

    public parseTracks(tracksData: unknown): number[] {
        if (!tracksData) {
            return [];
        }
        const tracks: number[] = [];
        // decode string
        if (typeof tracksData === 'string') {
            try {
                if (tracksData === 'all') {
                    return [-1];
                }
                tracksData = JSON.parse(tracksData);
            } catch (e) {
                tracksData = [0];
            }
        }
        // decode array
        if (typeof tracksData === 'number') {
            tracks.push(tracksData);
        } else if ('length' in (tracksData as any)) {
            const length: number = (tracksData as any).length;
            const array: unknown[] = tracksData as unknown[];
            for (let i: number = 0; i < length; i++) {
                const item: unknown = array[i];
                let value: number = 0;
                if (typeof item === 'number') {
                    value = item;
                } else if ('index' in (item as any)) {
                    value = (item as any).index;
                } else {
                    value = Number.parseInt((item as any).toString());
                }
                if (value >= 0 || value === -1) {
                    tracks.push(value);
                }
            }
        } else if ('index' in (tracksData as any)) {
            tracks.push((tracksData as any).index);
        }
        return tracks;
    }

    private getDataAttributes(): Map<string, unknown> {
        const dataAttributes: Map<string, unknown> = new Map<string, unknown>();
        const element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        if (element.dataset) {
            for (const key of Object.keys(element.dataset)) {
                let value: unknown = (element.dataset as any)[key];
                try {
                    const stringValue: string = value as string;
                    value = JSON.parse(stringValue);
                } catch (e) {
                    if (value === '') {
                        value = null;
                    }
                }
                dataAttributes.set(key, value);
            }
        } else {
            for (let i: number = 0; i < element.attributes.length; i++) {
                const attr: Attr = element.attributes.item(i)!;
                const nodeName: string = attr.nodeName;
                if (nodeName.startsWith('data-')) {
                    const keyParts: string[] = nodeName.substr(5).split('-');
                    let key: string = keyParts[0];
                    for (let j: number = 1; j < keyParts.length; j++) {
                        key += keyParts[j].substr(0, 1).toUpperCase() + keyParts[j].substr(1);
                    }
                    let value: unknown = attr.nodeValue;
                    try {
                        value = JSON.parse(value as string);
                    } catch (e) {
                        if (value === '') {
                            value = null;
                        }
                    }
                    dataAttributes.set(key, value);
                }
            }
        }
        return dataAttributes;
    }

    public beginUpdateRenderResults(renderResult: RenderFinishedEventArgs): void {
        if (!this._resultIdToElementLookup.has(renderResult.id)) {
            return;
        }

        const placeholder = this._resultIdToElementLookup.get(renderResult.id)!;

        const body: any = renderResult.renderResult;
        if (typeof body === 'string') {
            placeholder.innerHTML = body;
        } else if ('nodeType' in body) {
            placeholder.replaceChildren(body as Node);
        }
        placeholder.resultState = ResultState.RenderDone;
        placeholder.renderedResultId = renderResult.id;
        placeholder.renderedResult = Array.from(placeholder.children);
    }

    public beginAppendRenderResults(renderResult: RenderFinishedEventArgs | null): void {
        const canvasElement: HTMLElement = (this._api.canvasElement as HtmlElementContainer).element;
        // null result indicates that the rendering finished
        if (!renderResult) {
            // so we remove elements that might be from a previous render session
            while (canvasElement.childElementCount > this._totalResultCount) {
                if (this._api.settings.core.enableLazyLoading) {
                    this._intersectionObserver.unobserve(canvasElement.lastChild as Element);
                }
                canvasElement.removeChild(canvasElement.lastElementChild!);
            }
        } else {
            let placeholder: ResultPlaceholder;
            if (this._totalResultCount < canvasElement.childElementCount) {
                placeholder = canvasElement.childNodes.item(this._totalResultCount) as ResultPlaceholder;
            } else {
                placeholder = document.createElement('div') as unknown as ResultPlaceholder;
                canvasElement.appendChild(placeholder);
            }
            placeholder.style.zIndex = '1';
            placeholder.style.position = 'absolute';
            placeholder.style.left = `${renderResult.x}px`;
            placeholder.style.top = `${renderResult.y}px`;
            placeholder.style.width = `${renderResult.width}px`;
            placeholder.style.height = `${renderResult.height}px`;
            placeholder.style.display = 'inline-block';
            placeholder.layoutResultId = renderResult.id;
            placeholder.resultState = ResultState.LayoutDone;
            placeholder.renderedResultId = undefined;
            placeholder.renderedResult = undefined;

            this._resultIdToElementLookup.set(renderResult.id, placeholder);

            // remember which bar is contained in which node for faster lookup
            // on highlight/unhighlight
            for (let i = renderResult.firstMasterBarIndex; i <= renderResult.lastMasterBarIndex; i++) {
                if (i >= 0) {
                    this._barToElementLookup.set(i, placeholder);
                }
            }

            if (this._api.settings.core.enableLazyLoading) {
                // re-observe to fire event
                this._intersectionObserver.unobserve(placeholder);
                this._intersectionObserver.observe(placeholder);
            }

            this._totalResultCount++;
        }
    }

    /**
     * This method creates the player. It detects browser compatibility and
     * initializes a alphaSynth version for the client.
     */
    public createWorkerPlayer(): IAlphaSynth | null {
        let player: AlphaSynthWebWorkerApi | null = null;
        const supportsScriptProcessor: boolean = 'ScriptProcessorNode' in window;

        const supportsAudioWorklets: boolean = window.isSecureContext && 'AudioWorkletNode' in window;

        if (supportsAudioWorklets && this._api.settings.player.outputMode === PlayerOutputMode.WebAudioAudioWorklets) {
            Logger.debug('Player', 'Will use webworkers for synthesizing and web audio api with worklets for playback');
            player = new AlphaSynthWebWorkerApi(
                new AlphaSynthAudioWorkletOutput(this._api.settings),
                this._api.settings
            );
        } else if (supportsScriptProcessor) {
            Logger.debug(
                'Player',
                'Will use webworkers for synthesizing and web audio api with ScriptProcessor for playback'
            );
            player = new AlphaSynthWebWorkerApi(new AlphaSynthScriptProcessorOutput(), this._api.settings);
        }

        if (!player) {
            Logger.error('Player', 'Player requires webworkers and web audio api, browser unsupported', null);
        } else {
            player.ready.on(() => {
                if (this._api.settings.player.soundFont) {
                    (this._api as AlphaTabApi).loadSoundFontFromUrl(this._api.settings.player.soundFont, false);
                }
            });
        }
        return player;
    }

    public createWorkerAudioExporter(synth: IAlphaSynth | null): IAudioExporterWorker {
        const needNewWorker = synth === null || !(synth instanceof AlphaSynthWebWorkerApi);
        if (needNewWorker) {
            // nowadays we require browsers with workers
            synth = this.createWorkerPlayer()!;
        }

        return new AlphaSynthAudioExporterWorkerApi(synth as AlphaSynthWebWorkerApi, needNewWorker);
    }

    public beginInvoke(action: () => void): void {
        window.requestAnimationFrame(() => {
            action();
        });
    }

    private _highlightedElements: HTMLElement[] = [];
    public highlightElements(groupId: string, masterBarIndex: number): void {
        const element = this._barToElementLookup.get(masterBarIndex);
        if (element) {
            const elementsToHighlight: HTMLCollection = element.getElementsByClassName(groupId);
            for (let i: number = 0; i < elementsToHighlight.length; i++) {
                elementsToHighlight.item(i)!.classList.add('at-highlight');
                this._highlightedElements.push(elementsToHighlight.item(i) as HTMLElement);
            }
        }
    }

    public removeHighlights(): void {
        const highlightedElements = this._highlightedElements;
        if (!highlightedElements) {
            return;
        }
        for (const element of highlightedElements) {
            element.classList.remove('at-highlight');
        }
        this._highlightedElements = [];
    }

    public destroyCursors(): void {
        const element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        const cursorWrapper: HTMLElement = element.querySelector('.at-cursors') as HTMLElement;
        element.removeChild(cursorWrapper);
    }

    public createCursors(): Cursors | null {
        const element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        const cursorWrapper: HTMLElement = document.createElement('div');
        cursorWrapper.classList.add('at-cursors');
        const selectionWrapper: HTMLElement = document.createElement('div');
        selectionWrapper.classList.add('at-selection');

        const barCursorContainer = this.createScalingElement();
        const beatCursorContainer = this.createScalingElement();

        const barCursor: HTMLElement = barCursorContainer.element;
        barCursor.classList.add('at-cursor-bar');
        const beatCursor: HTMLElement = beatCursorContainer.element;
        beatCursor.classList.add('at-cursor-beat');
        // required css styles
        element.style.position = 'relative';
        element.style.textAlign = 'left';

        cursorWrapper.style.position = 'absolute';
        cursorWrapper.style.zIndex = '1000';
        cursorWrapper.style.display = 'inline';
        cursorWrapper.style.pointerEvents = 'none';

        selectionWrapper.style.position = 'absolute';

        barCursor.style.position = 'absolute';
        barCursor.style.left = '0';
        barCursor.style.top = '0';
        barCursor.style.willChange = 'transform';
        barCursorContainer.width = 1;
        barCursorContainer.height = 1;
        barCursorContainer.setBounds(0, 0, 1, 1);

        beatCursor.style.position = 'absolute';
        beatCursor.style.transition = 'all 0s linear';
        beatCursor.style.left = '0';
        beatCursor.style.top = '0';
        beatCursor.style.willChange = 'transform';
        beatCursorContainer.width = 3;
        beatCursorContainer.height = 1;
        beatCursorContainer.setBounds(0, 0, 1, 1);

        // add cursors to UI
        element.insertBefore(cursorWrapper, element.firstChild);
        cursorWrapper.appendChild(selectionWrapper);
        cursorWrapper.appendChild(barCursor);
        cursorWrapper.appendChild(beatCursor);
        return new Cursors(
            new HtmlElementContainer(cursorWrapper),
            barCursorContainer,
            beatCursorContainer,
            new HtmlElementContainer(selectionWrapper)
        );
    }

    public getOffset(scrollContainer: IContainer | null, container: IContainer): Bounds {
        const element: HTMLElement = (container as HtmlElementContainer).element;
        const bounds: DOMRect = element.getBoundingClientRect();
        let top: number = bounds.top + element.ownerDocument!.defaultView!.pageYOffset;
        let left: number = bounds.left + element.ownerDocument!.defaultView!.pageXOffset;
        if (scrollContainer) {
            const scrollElement: HTMLElement = (scrollContainer as HtmlElementContainer).element;
            const nodeName: string = scrollElement.nodeName.toLowerCase();
            if (nodeName !== 'html' && nodeName !== 'body') {
                const scrollElementOffset: Bounds = this.getOffset(null, scrollContainer);
                top = top + scrollElement.scrollTop - scrollElementOffset.y;
                left = left + scrollElement.scrollLeft - scrollElementOffset.x;
            }
        }

        const b = new Bounds();
        b.x = left;
        b.y = top;
        b.w = bounds.width;
        b.h = bounds.height;
        return b;
    }

    private _scrollContainer: IContainer | null = null;
    public getScrollContainer(): IContainer {
        if (this._scrollContainer) {
            return this._scrollContainer;
        }

        let scrollElement: HTMLElement =
            // tslint:disable-next-line: strict-type-predicates
            typeof this._api.settings.player.scrollElement === 'string'
                ? (document.querySelector(this._api.settings.player.scrollElement) as HTMLElement)
                : (this._api.settings.player.scrollElement as HTMLElement);
        const nodeName: string = scrollElement.nodeName.toLowerCase();
        if (nodeName === 'html' || nodeName === 'body') {
            // https://github.com/CoderLine/alphaTab/issues/205
            // https://github.com/CoderLine/alphaTab/issues/354
            // https://dev.opera.com/articles/fixing-the-scrolltop-bug/
            if ('scrollingElement' in document) {
                scrollElement = document.scrollingElement as HTMLElement;
            } else {
                const userAgent = navigator.userAgent;
                if (userAgent.indexOf('WebKit') !== -1) {
                    scrollElement = (document as HTMLDocument).body;
                } else {
                    scrollElement = (document as HTMLDocument).documentElement;
                }
            }
        }

        this._scrollContainer = new HtmlElementContainer(scrollElement);
        return this._scrollContainer;
    }

    public createSelectionElement(): IContainer | null {
        return this.createScalingElement();
    }

    public createScalingElement(): ScalableHtmlElementContainer {
        const element = document.createElement('div');
        element.style.position = 'absolute';

        // to typical browser zoom levels are:
        // Chromium: 25,33,50,67,75,80,90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500
        // Firefox: 30, 50, 67, 80, 90, 100, 110, 120, 133, 150, 170, 200, 240, 300, 400, 500

        // with having a 100x100 scaling container we should be able to provide appropriate scaling

        const container = new ScalableHtmlElementContainer(element, 100, 100);
        container.width = 1;
        container.height = 1;
        container.setBounds(0, 0, 1, 1);
        return container;
    }

    public scrollToY(element: IContainer, scrollTargetY: number, speed: number): void {
        this.internalScrollToY((element as HtmlElementContainer).element, scrollTargetY, speed);
    }

    public scrollToX(element: IContainer, scrollTargetY: number, speed: number): void {
        this.internalScrollToX((element as HtmlElementContainer).element, scrollTargetY, speed);
    }

    private internalScrollToY(element: HTMLElement, scrollTargetY: number, speed: number): void {
        if (this._api.settings.player.nativeBrowserSmoothScroll) {
            element.scrollTo({
                top: scrollTargetY,
                behavior: 'smooth'
            });
        } else {
            const startY: number = element.scrollTop;
            const diff: number = scrollTargetY - startY;

            let start: number = 0;
            const step = (x: number) => {
                if (start === 0) {
                    start = x;
                }
                const time: number = x - start;
                const percent: number = Math.min(time / speed, 1);
                element.scrollTop = (startY + diff * percent) | 0;
                if (time < speed) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }

    private internalScrollToX(element: HTMLElement, scrollTargetX: number, speed: number): void {
        if (this._api.settings.player.nativeBrowserSmoothScroll) {
            element.scrollTo({
                left: scrollTargetX,
                behavior: 'smooth'
            });
        } else {
            const startX: number = element.scrollLeft;
            const diff: number = scrollTargetX - startX;
            let start: number = 0;
            const step = (t: number) => {
                if (start === 0) {
                    start = t;
                }
                const time: number = t - start;
                const percent: number = Math.min(time / speed, 1);
                element.scrollLeft = (startX + diff * percent) | 0;
                if (time < speed) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }

    public createBackingTrackPlayer(): IAlphaSynth | null {
        return new BackingTrackPlayer(
            new AudioElementBackingTrackSynthOutput(),
            this._api.settings.player.bufferTimeInMilliseconds
        );
    }
}
