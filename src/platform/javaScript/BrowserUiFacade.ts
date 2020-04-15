import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { IAlphaSynth } from '@src/audio/synth/IAlphaSynth';
import { Environment } from '@src/Environment';
import { EventEmitter, IEventEmitter } from '@src/EventEmitter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Font } from '@src/model/Font';
import { Score } from '@src/model/Score';
import { NotationMode } from '@src/NotationSettings';
import { IContainer } from '@src/platform/IContainer';
import { HtmlElementContainer } from '@src/platform/javaScript/HtmlElementContainer';
import { FontSizes } from '@src/platform/svg/FontSizes';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Settings } from '@src/Settings';
import { FontLoadingChecker } from '@src/util/FontLoadingChecker';
import { Logger } from '@src/util/Logger';
import { IMouseEventArgs } from '../IMouseEventArgs';
import { IUiFacade } from '../IUiFacade';
import { AlphaSynthWebAudioOutput } from './AlphaSynthWebAudioOutput';
import { AlphaSynthWebWorkerApi } from './AlphaSynthWebWorkerApi';
import { AlphaTabApi } from './AlphaTabApi';
import { AlphaTabWorkerScoreRenderer } from './AlphaTabWorkerScoreRenderer';
import { BrowserMouseEventArgs } from './BrowserMouseEventArgs';
import { Cursors } from './Cursors';

export class BrowserUiFacade implements IUiFacade<unknown> {
    private _fontCheckers: Map<string, FontLoadingChecker> = new Map();
    private _api!: AlphaTabApiBase<unknown>;
    private _contents: string | null = null;
    private _file: string | null = null;
    private _visibilityCheckIntervalId: number = 0;
    private _visibilityCheckInterval: number = 0;
    private _totalResultCount: number = 0;
    private _initialTrackIndexes: number[] | null = null;

    private _rootContainerBecameVisible: EventEmitter<() => void> = new EventEmitter();
    public rootContainerBecameVisible: IEventEmitter<() => void>;
    public canRenderChanged: IEventEmitter<() => void> = new EventEmitter();

    public get resizeThrottle(): number {
        return 10;
    }

    public rootContainer: IContainer;
    public areWorkersSupported: boolean;

    public get canRender(): boolean {
        return this.areAllFontsLoaded();
    }

    private areAllFontsLoaded(): boolean {
        Environment.bravuraFontChecker.checkForFontAvailability();
        if (!Environment.bravuraFontChecker.isFontLoaded) {
            return false;
        }
        for (let kvp of this._fontCheckers) {
            let checker: FontLoadingChecker = kvp[1];
            if (!checker.isFontLoaded) {
                return false;
            }
        }
        Logger.debug('Font', 'All fonts loaded: ' + this._fontCheckers.size);
        return true;
    }

    private onFontLoaded(family: string): void {
        FontSizes.generateFontLookup(family);
        if (this.areAllFontsLoaded()) {
            (this.canRenderChanged as EventEmitter<() => void>).trigger();
        }
    }

    public constructor(rootElement: HTMLElement) {
        rootElement.classList.add('alphaTab');
        this.rootContainer = new HtmlElementContainer(rootElement);
        this.areWorkersSupported = 'Worker' in window;
        Environment.bravuraFontChecker.fontLoaded.on(this.onFontLoaded.bind(this));

        this.rootContainerBecameVisible = {
            on: (value: any) => {
                if (this.rootContainer.isVisible) {
                    value();
                } else {
                    this._rootContainerBecameVisible.on(value);

                    if (this._visibilityCheckIntervalId === 0) {
                        this._visibilityCheckIntervalId = window.setInterval(() => {
                            if (this._api.container.isVisible) {
                                window.clearInterval(this._visibilityCheckIntervalId);
                                this._visibilityCheckIntervalId = 0;
                                this._rootContainerBecameVisible.trigger();
                            }
                        }, this._visibilityCheckInterval);
                    }
                }
            },

            off: (value: any) => {
                this._rootContainerBecameVisible.off(value);
            }
        };
    }

    public createWorkerRenderer(): IScoreRenderer {
        return new AlphaTabWorkerScoreRenderer<unknown>(this._api, this._api.settings);
    }

    public initialize(api: AlphaTabApiBase<unknown>, raw: unknown): void {
        this._api = api;
        let settings: Settings = new Settings();
        settings.fillFromJson(raw);
        let dataAttributes: Map<string, unknown> = this.getDataAttributes();
        settings.fillFromDataAttributes(dataAttributes);
        if (settings.notation.notationMode === NotationMode.SongBook) {
            settings.setSongBookModeSettings();
        }
        api.settings = settings;
        if (settings.core.engine === 'default' || settings.core.engine === 'svg') {
            api.container.scroll.on(this.showSvgsInViewPort.bind(this));
            api.container.resize.on(this.showSvgsInViewPort.bind(this));
        }
        this.setupFontCheckers(settings);
        // get track data to parse
        let tracksData: unknown;
        let options: any = raw;
        if (options && options.tracks) {
            tracksData = options.tracks;
        } else {
            if (dataAttributes.has('tracks')) {
                tracksData = dataAttributes.get('tracks');
            } else {
                tracksData = 0;
            }
        }
        this._initialTrackIndexes = this.parseTracks(tracksData);
        this._contents = '';
        let element: HtmlElementContainer = api.container as HtmlElementContainer;
        if (dataAttributes.has('tex') && element.element.innerText) {
            this._contents = element.element.innerHTML;
            element.element.innerHTML = '';
        }
        this.createStyleElement(settings);
        if (options && options.file) {
            this._file = options.file;
        } else if (dataAttributes.has('file')) {
            this._file = dataAttributes.get('file') as string;
        }
        this._visibilityCheckInterval = 500;
        if (options && options.visibilityCheckInterval) {
            this._visibilityCheckInterval = options.visibilityCheckInterval;
        }
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
        if (!this._fontCheckers.has(font.family)) {
            let checker: FontLoadingChecker = new FontLoadingChecker(font.family);
            this._fontCheckers.set(font.family, checker);
            checker.fontLoaded.on(this.onFontLoaded.bind(this));
            checker.checkForFontAvailability();
        }
    }

    public destroy(): void {
        (this.rootContainer as HtmlElementContainer).element.innerHTML = '';
    }

    public createCanvasElement(): IContainer {
        let canvasElement: HTMLElement = document.createElement('div');
        canvasElement.className = 'at-surface';
        canvasElement.style.fontSize = '0';
        canvasElement.style.overflow = 'hidden';
        canvasElement.style.lineHeight = '0';
        return new HtmlElementContainer(canvasElement);
    }

    public triggerEvent(
        container: IContainer,
        name: string,
        details: unknown = null,
        originalEvent?: IMouseEventArgs
    ): void {
        let element: HTMLElement = (container as HtmlElementContainer).element;
        name = 'alphaTab.' + name;
        let e: any = document.createEvent('CustomEvent');
        let originalMouseEvent: MouseEvent | null = originalEvent
            ? (originalEvent as BrowserMouseEventArgs).mouseEvent
            : null;
        e.initCustomEvent(name, false, false, details);
        if (originalMouseEvent) {
            e.originalEvent = originalMouseEvent;
        }
        element.dispatchEvent(e);
        if (window && 'jQuery' in window) {
            let jquery: any = (window as any)['jQuery'];
            let args: unknown[] = [];
            args.push(details);
            if (originalMouseEvent) {
                args.push(originalMouseEvent);
            }
            jquery(element).trigger(name, args);
        }
    }

    public load(data: unknown, success: (score: Score) => void, error: (error: any) => void): boolean {
        if (data instanceof Score) {
            success(data);
            return true;
        }
        if (data instanceof ArrayBuffer) {
            let byteArray: Uint8Array = new Uint8Array(data);
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

    public loadSoundFont(data: unknown): boolean {
        if(!this._api.player) {
            return false;
        }

        if (data instanceof ArrayBuffer) {
            this._api.player.loadSoundFont(new Uint8Array(data));
            return true;
        }
        if (data instanceof Uint8Array) {
            this._api.player.loadSoundFont(data);
            return true;
        }
        if (typeof data === 'string') {
            (this._api as AlphaTabApi).loadSoundFontFromUrl(data);
            return true;
        }
        return false;
    }

    public initialRender(): void {
        this._api.renderer.preRender.on((_: boolean) => {
            this._totalResultCount = 0;
        });
        this.rootContainerBecameVisible.on(() => {
            // rendering was possibly delayed due to invisible element
            // in this case we need the correct width for autosize
            this._api.renderer.width = this.rootContainer.width | 0;
            this._api.renderer.updateSettings(this._api.settings);
            if (this._contents) {
                this._api.tex(this._contents);
            } else if (this._file) {
                ScoreLoader.loadScoreAsync(
                    this._file,
                    s => {
                        this._api.renderScore(s, this._initialTrackIndexes ?? undefined);
                        this._initialTrackIndexes = null;
                    },
                    e => {
                        this._api.onError('import', e);
                    },
                    this._api.settings
                );
            }
        });
    }

    private showSvgsInViewPort(): void {
        let placeholders: NodeList = (this._api.canvasElement as HtmlElementContainer).element.querySelectorAll(
            '[data-lazy=true]'
        );
        for (let i: number = 0; i < placeholders.length; i++) {
            let placeholder: HTMLElement = placeholders.item(i) as HTMLElement;
            if (this.isElementInViewPort(placeholder)) {
                placeholder.outerHTML = (placeholder as any)['svg'];
            }
        }
    }

    public isElementInViewPort(element: HTMLElement): boolean {
        let rect: DOMRect = element.getBoundingClientRect();
        return (
            rect.top + rect.height >= 0 &&
            rect.top <= window.innerHeight &&
            rect.left + rect.width >= 0 &&
            rect.left <= window.innerWidth
        );
    }

    private createStyleElement(settings: Settings): void {
        let elementDocument: HTMLDocument = (this._api.container as HtmlElementContainer).element.ownerDocument!;
        Environment.createStyleElement(elementDocument, settings.core.fontDirectory);
    }

    public parseTracks(tracksData: unknown): number[] {
        if (!tracksData) {
            return [];
        }
        let tracks: number[] = [];
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
            let length: number = (tracksData as any).length;
            let array: unknown[] = tracksData as unknown[];
            for (let i: number = 0; i < length; i++) {
                let item: unknown = array[i];
                let value: number = 0;
                if (typeof item === 'number') {
                    value = item;
                } else if ('index' in (item as any)) {
                    value = (item as any).index;
                } else {
                    value = parseInt((item as any).toString());
                }
                if (value >= 0) {
                    tracks.push(value);
                }
            }
        } else if ('index' in (tracksData as any)) {
            tracks.push((tracksData as any).index);
        }
        return tracks;
    }

    private getDataAttributes(): Map<string, unknown> {
        let dataAttributes: Map<string, unknown> = new Map<string, unknown>();
        let element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        if (element.dataset) {
            for (let key of Object.keys(element.dataset)) {
                let value: unknown = (element.dataset as any)[key];
                try {
                    let stringValue: string = value as string;
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
                let attr: Attr = element.attributes.item(i)!;
                let nodeName: string = attr.nodeName;
                if (nodeName.startsWith('data-')) {
                    let keyParts: string[] = nodeName.substr(5).split('-');
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

    public beginAppendRenderResults(renderResult: RenderFinishedEventArgs): void {
        window.setTimeout(() => {
            let canvasElement: HTMLElement = (this._api.canvasElement as HtmlElementContainer).element;
            // null result indicates that the rendering finished
            if (!renderResult) {
                // so we remove elements that might be from a previous render session
                while (canvasElement.childElementCount > this._totalResultCount) {
                    canvasElement.removeChild(canvasElement.lastChild!);
                }
                // directly show the elements in the viewport once we're done.
                if (this._api.settings.core.enableLazyLoading) {
                    this.showSvgsInViewPort();
                }
            } else {
                let body: unknown = renderResult.renderResult;
                if (typeof body === 'string') {
                    let placeholder: HTMLElement;
                    if (this._totalResultCount < canvasElement.childElementCount) {
                        placeholder = canvasElement.childNodes.item(this._totalResultCount) as HTMLElement;
                    } else {
                        placeholder = document.createElement('div');
                        canvasElement.appendChild(placeholder);
                    }
                    placeholder.style.width = renderResult.width + 'px';
                    placeholder.style.height = renderResult.height + 'px';
                    placeholder.style.display = 'inline-block';
                    if (this.isElementInViewPort(placeholder) || !this._api.settings.core.enableLazyLoading) {
                        placeholder.outerHTML = body;
                    } else {
                        (placeholder as any)['svg'] = body;
                        placeholder.setAttribute('data-lazy', 'true');
                    }
                } else {
                    if (this._totalResultCount < canvasElement.childElementCount) {
                        canvasElement.replaceChild(
                            renderResult.renderResult as Node,
                            canvasElement.childNodes.item(this._totalResultCount)
                        );
                    } else {
                        canvasElement.appendChild(renderResult.renderResult as Node);
                    }
                }
                this._totalResultCount++;
            }
        }, 1);
    }

    /**
     * This method creates the player. It detects browser compatibility and
     * initializes a alphaSynth version for the client.
     */
    public createWorkerPlayer(): IAlphaSynth | null {
        let supportsWebAudio: boolean = 'ScriptProcessorNode' in window;
        let alphaSynthScriptFile: string | null = Environment.scriptFile;
        if (!alphaSynthScriptFile) {
            Logger.error('Player', 'alphaTab script file could not be detected, player cannot initialize');
            return null;
        }

        let player: AlphaSynthWebWorkerApi | null = null;
        if (supportsWebAudio) {
            Logger.info('Player', 'Will use webworkers for synthesizing and web audio api for playback');
            player = new AlphaSynthWebWorkerApi(
                new AlphaSynthWebAudioOutput(),
                alphaSynthScriptFile,
                this._api.settings.core.logLevel
            );
        }

        if (!player) {
            Logger.error('Player', 'Player requires webworkers and web audio api, browser unsupported', null);
        } else {
            player.ready.on(() => {
                if (this._api.settings.player.soundFont) {
                    (this._api as AlphaTabApi).loadSoundFontFromUrl(this._api.settings.player.soundFont);
                }
            });
        }
        return player;
    }

    public beginInvoke(action: () => void): void {
        window.requestAnimationFrame(() => {
            action();
        });
    }

    public highlightElements(groupId: string): void {
        let element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        let elementsToHighlight: HTMLCollection = element.getElementsByClassName(groupId);
        for (let i: number = 0; i < elementsToHighlight.length; i++) {
            elementsToHighlight.item(i)!.classList.add('at-highlight');
        }
    }

    public removeHighlights(): void {
        let element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        let elements: HTMLCollection = element.getElementsByClassName('at-highlight');
        while (elements.length > 0) {
            elements.item(0)!.classList.remove('at-highlight');
        }
    }

    public destroyCursors(): void {
        let element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        let cursorWrapper: HTMLElement = element.querySelector('.at-cursors') as HTMLElement;
        element.removeChild(cursorWrapper);
    }

    public createCursors(): Cursors {
        let element: HTMLElement = (this._api.container as HtmlElementContainer).element;
        let cursorWrapper: HTMLElement = document.createElement('div');
        cursorWrapper.classList.add('at-cursors');
        let selectionWrapper: HTMLElement = document.createElement('div');
        selectionWrapper.classList.add('at-selection');
        let barCursor: HTMLElement = document.createElement('div');
        barCursor.classList.add('at-cursor-bar');
        let beatCursor: HTMLElement = document.createElement('div');
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
        beatCursor.style.position = 'absolute';
        beatCursor.style.transition = 'all 0s linear';
        // add cursors to UI
        element.insertBefore(cursorWrapper, element.firstChild);
        cursorWrapper.appendChild(selectionWrapper);
        cursorWrapper.appendChild(barCursor);
        cursorWrapper.appendChild(beatCursor);
        return new Cursors(
            new HtmlElementContainer(cursorWrapper),
            new HtmlElementContainer(barCursor),
            new HtmlElementContainer(beatCursor),
            new HtmlElementContainer(selectionWrapper)
        );
    }

    public getOffset(scrollContainer: IContainer | null, container: IContainer): Bounds {
        let element: HTMLElement = (container as HtmlElementContainer).element;
        let bounds: DOMRect = element.getBoundingClientRect();
        let top: number = bounds.top + element.ownerDocument!.defaultView!.pageYOffset;
        let left: number = bounds.left + element.ownerDocument!.defaultView!.pageXOffset;
        if (scrollContainer) {
            let scrollElement: HTMLElement = (scrollContainer as HtmlElementContainer).element;
            let nodeName: string = scrollElement.nodeName.toLowerCase();
            if (nodeName !== 'html' && nodeName !== 'body') {
                let scrollElementOffset: Bounds = this.getOffset(null, scrollContainer);
                top = top + scrollElement.scrollTop - scrollElementOffset.y;
                left = left + scrollElement.scrollLeft - scrollElementOffset.x;
            }
        }

        let b = new Bounds();
        b.x = left;
        b.y = top;
        b.w = bounds.width;
        b.h = bounds.height;
        return b;
    }

    public getScrollContainer(): IContainer {
        let scrollElement: HTMLElement =
            // tslint:disable-next-line: strict-type-predicates
            typeof this._api.settings.player.scrollElement === 'string'
                ? (document.querySelector(this._api.settings.player.scrollElement) as HTMLElement)
                : (this._api.settings.player.scrollElement as HTMLElement);
        let nodeName: string = scrollElement.nodeName.toLowerCase();
        if (nodeName === 'html' || nodeName === 'body') {
            // Some mobile browsers cannot scroll on html, we must scroll on body instead
            // http://blog.jonathanargentiero.com/jquery-scrolltop-not-working-on-mobile-devices-iphone-ipad-android-phones/
            // https://github.com/CoderLine/alphaTab/issues/205
            let userAgent: string = navigator.userAgent;
            scrollElement = userAgent.match('((iPod|iPhone|iPad|Android))') ? document.body : document.documentElement;
        }
        return new HtmlElementContainer(scrollElement);
    }

    public createSelectionElement(): IContainer {
        let element: HTMLElement = document.createElement('div');
        element.style.position = 'absolute';
        return new HtmlElementContainer(element);
    }

    public scrollToY(element: IContainer, scrollTargetY: number, speed: number): void {
        this.internalScrollToY((element as HtmlElementContainer).element, scrollTargetY, speed);
    }

    public scrollToX(element: IContainer, scrollTargetY: number, speed: number): void {
        this.internalScrollToX((element as HtmlElementContainer).element, scrollTargetY, speed);
    }

    private internalScrollToY(element: HTMLElement, scrollTargetY: number, speed: number): void {
        let startY: number = element.scrollTop;
        let diff: number = scrollTargetY - startY;
        let start: number = 0;
        let step = (x: number) => {
            if (start === 0) {
                start = x;
            }
            let time: number = x - start;
            let percent: number = Math.min(time / speed, 1);
            element.scrollTop = (startY + diff * percent) | 0;
            if (time < speed) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    private internalScrollToX(element: HTMLElement, scrollTargetX: number, speed: number): void {
        let startX: number = element.scrollLeft;
        let diff: number = scrollTargetX - startX;
        let start: number = 0;
        let step = (t: number) => {
            if (start === 0) {
                start = t;
            }
            let time: number = t - start;
            let percent: number = Math.min(time / speed, 1);
            element.scrollLeft = (startX + diff * percent) | 0;
            if (time < speed) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}
