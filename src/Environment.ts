import { LayoutMode } from '@src/LayoutMode';
import { StaveProfile } from '@src/StaveProfile';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Gp3To5Importer } from '@src/importer/Gp3To5Importer';
import { Gp7Importer } from '@src/importer/Gp7Importer';
import { GpxImporter } from '@src/importer/GpxImporter';
import { MusicXmlImporter } from '@src/importer/MusicXmlImporter';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { HarmonicType } from '@src/model/HarmonicType';
import { ICanvas } from '@src/platform/ICanvas';
import { AlphaSynthWebWorker } from '@src/platform/javascript/AlphaSynthWebWorker';
import { AlphaTabWebWorker } from '@src/platform/javascript/AlphaTabWebWorker';
import { Html5Canvas } from '@src/platform/javascript/Html5Canvas';
import { JQueryAlphaTab } from '@src/platform/javascript/JQueryAlphaTab';
import { CssFontSvgCanvas } from '@src/platform/svg/CssFontSvgCanvas';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRendererFactory } from '@src/rendering/EffectBarRendererFactory';
import { AlternateEndingsEffectInfo } from '@src/rendering/effects/AlternateEndingsEffectInfo';
import { CapoEffectInfo } from '@src/rendering/effects/CapoEffectInfo';
import { ChordsEffectInfo } from '@src/rendering/effects/ChordsEffectInfo';
import { CrescendoEffectInfo } from '@src/rendering/effects/CrescendoEffectInfo';
import { DynamicsEffectInfo } from '@src/rendering/effects/DynamicsEffectInfo';
import { FadeInEffectInfo } from '@src/rendering/effects/FadeInEffectInfo';
import { FermataEffectInfo } from '@src/rendering/effects/FermataEffectInfo';
import { FingeringEffectInfo } from '@src/rendering/effects/FingeringEffectInfo';
import { HarmonicsEffectInfo } from '@src/rendering/effects/HarmonicsEffectInfo';
import { LetRingEffectInfo } from '@src/rendering/effects/LetRingEffectInfo';
import { LyricsEffectInfo } from '@src/rendering/effects/LyricsEffectInfo';
import { MarkerEffectInfo } from '@src/rendering/effects/MarkerEffectInfo';
import { OttaviaEffectInfo } from '@src/rendering/effects/OttaviaEffectInfo';
import { PalmMuteEffectInfo } from '@src/rendering/effects/PalmMuteEffectInfo';
import { PickSlideEffectInfo } from '@src/rendering/effects/PickSlideEffectInfo';
import { PickStrokeEffectInfo } from '@src/rendering/effects/PickStrokeEffectInfo';
import { SlightBeatVibratoEffectInfo } from '@src/rendering/effects/SlightBeatVibratoEffectInfo';
import { SlightNoteVibratoEffectInfo } from '@src/rendering/effects/SlightNoteVibratoEffectInfo';
import { TapEffectInfo } from '@src/rendering/effects/TapEffectInfo';
import { TempoEffectInfo } from '@src/rendering/effects/TempoEffectInfo';
import { TextEffectInfo } from '@src/rendering/effects/TextEffectInfo';
import { TrillEffectInfo } from '@src/rendering/effects/TrillEffectInfo';
import { TripletFeelEffectInfo } from '@src/rendering/effects/TripletFeelEffectInfo';
import { WhammyBarEffectInfo } from '@src/rendering/effects/WhammyBarEffectInfo';
import { WideBeatVibratoEffectInfo } from '@src/rendering/effects/WideBeatVibratoEffectInfo';
import { WideNoteVibratoEffectInfo } from '@src/rendering/effects/WideNoteVibratoEffectInfo';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { HorizontalScreenLayout } from '@src/rendering/layout/HorizontalScreenLayout';
import { PageViewLayout } from '@src/rendering/layout/PageViewLayout';
import { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { ScoreBarRendererFactory } from '@src/rendering/ScoreBarRendererFactory';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { TabBarRendererFactory } from '@src/rendering/TabBarRendererFactory';
import { FontLoadingChecker } from '@src/util/FontLoadingChecker';
import { Logger } from '@src/Logger';
import { LeftHandTapEffectInfo } from '@src/rendering/effects/LeftHandTapEffectInfo';
import { CapellaImporter } from '@src/importer/CapellaImporter';
import { ResizeObserverPolyfill } from '@src/platform/javascript/ResizeObserverPolyfill';
import { WebPlatform } from '@src/platform/javascript/WebPlatform';
import { IntersectionObserverPolyfill } from '@src/platform/javascript/IntersectionObserverPolyfill';
import { AlphaSynthWebWorklet } from '@src/platform/javascript/AlphaSynthAudioWorkletOutput';
import { AlphaTabError, AlphaTabErrorType } from './AlphaTabError';

export class LayoutEngineFactory {
    public readonly vertical: boolean;
    public readonly createLayout: (renderer: ScoreRenderer) => ScoreLayout;

    public constructor(vertical: boolean, createLayout: (renderer: ScoreRenderer) => ScoreLayout) {
        this.vertical = vertical;
        this.createLayout = createLayout;
    }
}

export class RenderEngineFactory {
    public readonly supportsWorkers: boolean;
    public readonly createCanvas: () => ICanvas;

    public constructor(supportsWorkers: boolean, canvas: () => ICanvas) {
        this.supportsWorkers = supportsWorkers;
        this.createCanvas = canvas;
    }
}

/**
 * This public class represents the global alphaTab environment where
 * alphaTab looks for information like available layout engines
 * staves etc.
 * This public class represents the global alphaTab environment where
 * alphaTab looks for information like available layout engines
 * staves etc.
 * @partial
 */
export class Environment {
    /**
     * The font size of the music font in pixel.
     */
    public static readonly MusicFontSize = 34;

    /**
     * The scaling factor to use when rending raster graphics for sharper rendering on high-dpi displays.
     */
    public static HighDpiFactor = 1;

    /**
     * @target web
     */
    public static createStyleElement(elementDocument: HTMLDocument, fontDirectory: string | null) {
        let styleElement: HTMLStyleElement = elementDocument.getElementById('alphaTabStyle') as HTMLStyleElement;
        if (!styleElement) {
            if (!fontDirectory) {
                Logger.error('AlphaTab', 'Font directory could not be detected, cannot create style element');
                return;
            }

            styleElement = elementDocument.createElement('style');
            styleElement.id = 'alphaTabStyle';
            let css: string = `
            @font-face {
                font-family: 'alphaTab';
                 src: url('${fontDirectory}Bravura.eot');
                 src: url('${fontDirectory}Bravura.eot?#iefix') format('embedded-opentype')
                      , url('${fontDirectory}Bravura.woff') format('woff')
                      , url('${fontDirectory}Bravura.otf') format('opentype')
                      , url('${fontDirectory}Bravura.svg#Bravura') format('svg');
                 font-weight: normal;
                 font-style: normal;
            }
            .at-surface * {
                cursor: default;
                vertical-align: top;
                overflow: visible;
            }
            .at-surface-svg text {
                dominant-baseline: central;
            }             
            .at {
                 font-family: 'alphaTab';
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

            styleElement.innerHTML = css;
            elementDocument.getElementsByTagName('head').item(0)!.appendChild(styleElement);
            Environment.bravuraFontChecker.checkForFontAvailability();
        }
    }

    /**
     * @target web
     */
    private static _globalThis: any | undefined = undefined;

    /**
     * @target web
     */
    public static get globalThis(): any {
        if (Environment._globalThis === undefined) {
            try {
                Environment._globalThis = globalThis;
            } catch (e) {
                // globalThis not available
            }

            if (typeof Environment._globalThis === 'undefined') {
                Environment._globalThis = self;
            }
            if (typeof Environment._globalThis === 'undefined') {
                Environment._globalThis = global;
            }
            if (typeof Environment._globalThis === 'undefined') {
                Environment._globalThis = window;
            }
            if (typeof Environment._globalThis === 'undefined') {
                Environment._globalThis = Function('return this')();
            }
        }

        return this._globalThis;
    }

    /**
     * @target web
     */
    public static webPlatform: WebPlatform = Environment.detectWebPlatform();

    /**
     * @target web
     */
    public static isWebPackBundled: boolean = Environment.detectWebPack();

    /**
     * @target web
     */
    public static scriptFile: string | null = Environment.detectScriptFile();

    /**
     * @target web
     */
    public static bravuraFontChecker: FontLoadingChecker = new FontLoadingChecker(['alphaTab']);

    /**
     * @target web
     */
    public static get isRunningInWorker(): boolean {
        return 'WorkerGlobalScope' in Environment.globalThis;
    }

    /**
     * @target web
     */
    public static get isRunningInAudioWorklet(): boolean {
        return 'AudioWorkletGlobalScope' in Environment.globalThis;
    }

    /**
     * @target web
     */
    public static createAlphaTabWorker(scriptFile: string | null): Worker {
        if (Environment.isWebPackBundled) {
            // WebPack currently requires this exact syntax: new Worker(new URL(..., import.meta.url)))
            // The module `@coderline/alphatab` will be resolved by WebPack to alphaTab consumed as library
            // this will not work with CDNs because worker start scripts need to have the same origin like
            // the current browser. 

            // https://github.com/webpack/webpack/discussions/14066

            return new Worker(
                // @ts-ignore
                /* webpackChunkName: "alphatab.worker" */ new URL('@coderline/alphatab', import.meta.url)
            );
        }

        if (!scriptFile) {
            throw new AlphaTabError(AlphaTabErrorType.General, "Could not detect alphaTab script file, cannot initialize renderer");
        }

        try {
            if (Environment.webPlatform === WebPlatform.BrowserModule) {
                const script: string = `import * as alphaTab from '${scriptFile}'`;
                const blob: Blob = new Blob([script], { type: 'text/javascript' });
                return new Worker(URL.createObjectURL(blob), { type: 'module' });
            } else {
                const script: string = `importScripts('${scriptFile}')`;
                const blob: Blob = new Blob([script]);
                return new Worker(URL.createObjectURL(blob));
            }
        }
        catch (e) {
            Logger.warning('Rendering', 'Could not create inline worker, fallback to normal worker');
            return new Worker(scriptFile);
        }
    }

    /**
     * @target web
     * @partial
     */
    public static throttle(action: () => void, delay: number): () => void {
        let timeoutId: number = 0;
        return () => {
            Environment.globalThis.clearTimeout(timeoutId);
            timeoutId = Environment.globalThis.setTimeout(action, delay);
        };
    }

    /**
     * @target web
     */
    private static detectScriptFile(): string | null {
        // browser include as ES6 import
        // <script type="module">
        // import * as alphaTab from 'dist/alphaTab.js';
        try {
            // @ts-ignore
            const importUrl = import.meta.url;
            // avoid using file:// urls in case of
            // bundlers like webpack
            if (importUrl && importUrl.indexOf('file://') === -1) {
                return importUrl;
            }
        } catch (e) {
            // ignore potential errors
        }

        // normal browser include as <script>
        if ('document' in Environment.globalThis && document.currentScript) {
            return (document.currentScript as HTMLScriptElement).src;
        }

        return null;
    }

    /**
     * @target web
     */
    private static registerJQueryPlugin(): void {
        if (!Environment.isRunningInWorker && Environment.globalThis && 'jQuery' in Environment.globalThis) {
            let jquery: any = Environment.globalThis['jQuery'];
            let api: JQueryAlphaTab = new JQueryAlphaTab();
            jquery.fn.alphaTab = function (this: any, method: string) {
                const args = Array.prototype.slice.call(arguments, 1);
                // if only a single element is affected, we use this
                if (this.length === 1) {
                    return api.exec(this[0], method, args);
                }
                // if multiple elements are affected we provide chaining
                return this.each((_i: number, e: HTMLElement) => {
                    api.exec(e, method, args);
                });
            };
            jquery.alphaTab = {
                restore: JQueryAlphaTab.restore
            };
            jquery.fn.alphaTab.fn = api;
        }
    }

    public static renderEngines: Map<string, RenderEngineFactory> = Environment.createDefaultRenderEngines();
    public static layoutEngines: Map<LayoutMode, LayoutEngineFactory> = Environment.createDefaultLayoutEngines();
    public static staveProfiles: Map<StaveProfile, BarRendererFactory[]> = Environment.createDefaultStaveProfiles();

    public static getRenderEngineFactory(engine: string): RenderEngineFactory {
        if (!engine || !Environment.renderEngines.has(engine)) {
            return Environment.renderEngines.get('default')!;
        }
        return Environment.renderEngines.get(engine)!;
    }

    public static getLayoutEngineFactory(layoutMode: LayoutMode): LayoutEngineFactory {
        if (!layoutMode || !Environment.layoutEngines.has(layoutMode)) {
            return Environment.layoutEngines.get(LayoutMode.Page)!;
        }
        return Environment.layoutEngines.get(layoutMode)!;
    }

    /**
     * Gets all default ScoreImporters
     * @returns
     */
    public static buildImporters(): ScoreImporter[] {
        return [
            new Gp3To5Importer(),
            new GpxImporter(),
            new Gp7Importer(),
            new MusicXmlImporter(),
            new CapellaImporter(),
            new AlphaTexImporter()
        ];
    }

    private static createDefaultRenderEngines(): Map<string, RenderEngineFactory> {
        const renderEngines = new Map<string, RenderEngineFactory>();
        renderEngines.set(
            'svg',
            new RenderEngineFactory(true, () => {
                return new CssFontSvgCanvas();
            })
        );
        renderEngines.set('default', renderEngines.get('svg')!);
        Environment.createPlatformSpecificRenderEngines(renderEngines);
        return renderEngines;
    }

    /**
     * @target web
     * @partial
     */
    private static createPlatformSpecificRenderEngines(renderEngines: Map<string, RenderEngineFactory>) {
        renderEngines.set(
            'html5',
            new RenderEngineFactory(false, () => {
                return new Html5Canvas();
            })
        );
    }

    private static createDefaultStaveProfiles(): Map<StaveProfile, BarRendererFactory[]> {
        const staveProfiles = new Map<StaveProfile, BarRendererFactory[]>();

        // default combinations of stave textprofiles
        staveProfiles.set(StaveProfile.ScoreTab, [
            new EffectBarRendererFactory('score-effects', [
                new TempoEffectInfo(),
                new TripletFeelEffectInfo(),
                new MarkerEffectInfo(),
                new TextEffectInfo(),
                new ChordsEffectInfo(),
                new FermataEffectInfo(),
                new WhammyBarEffectInfo(),
                new TrillEffectInfo(),
                new OttaviaEffectInfo(true),
                new WideBeatVibratoEffectInfo(),
                new SlightBeatVibratoEffectInfo(),
                new WideNoteVibratoEffectInfo(),
                new SlightNoteVibratoEffectInfo(),
                new LeftHandTapEffectInfo(),
                new AlternateEndingsEffectInfo()
            ]),
            new ScoreBarRendererFactory(),
            new EffectBarRendererFactory('tab-effects', [
                new CrescendoEffectInfo(),
                new OttaviaEffectInfo(false),
                new DynamicsEffectInfo(),
                new LyricsEffectInfo(),
                new TrillEffectInfo(),
                new WideBeatVibratoEffectInfo(),
                new SlightBeatVibratoEffectInfo(),
                new WideNoteVibratoEffectInfo(),
                new SlightNoteVibratoEffectInfo(),
                new TapEffectInfo(),
                new FadeInEffectInfo(),
                new HarmonicsEffectInfo(HarmonicType.Natural),
                new HarmonicsEffectInfo(HarmonicType.Artificial),
                new HarmonicsEffectInfo(HarmonicType.Pinch),
                new HarmonicsEffectInfo(HarmonicType.Tap),
                new HarmonicsEffectInfo(HarmonicType.Semi),
                new HarmonicsEffectInfo(HarmonicType.Feedback),
                new LetRingEffectInfo(),
                new CapoEffectInfo(),
                new FingeringEffectInfo(),
                new PalmMuteEffectInfo(),
                new PickStrokeEffectInfo(),
                new PickSlideEffectInfo(),
                new LeftHandTapEffectInfo()
            ]),
            new TabBarRendererFactory(false, false, false)
        ]);
        staveProfiles.set(StaveProfile.Score, [
            new EffectBarRendererFactory('score-effects', [
                new TempoEffectInfo(),
                new TripletFeelEffectInfo(),
                new MarkerEffectInfo(),
                new TextEffectInfo(),
                new ChordsEffectInfo(),
                new FermataEffectInfo(),
                new WhammyBarEffectInfo(),
                new TrillEffectInfo(),
                new OttaviaEffectInfo(true),
                new WideBeatVibratoEffectInfo(),
                new SlightBeatVibratoEffectInfo(),
                new WideNoteVibratoEffectInfo(),
                new SlightNoteVibratoEffectInfo(),
                new FadeInEffectInfo(),
                new LetRingEffectInfo(),
                new PalmMuteEffectInfo(),
                new PickStrokeEffectInfo(),
                new PickSlideEffectInfo(),
                new LeftHandTapEffectInfo(),
                new AlternateEndingsEffectInfo()
            ]),
            new ScoreBarRendererFactory(),
            new EffectBarRendererFactory('score-bottom-effects', [
                new CrescendoEffectInfo(),
                new OttaviaEffectInfo(false),
                new DynamicsEffectInfo(),
                new LyricsEffectInfo()
            ])
        ]);
        let tabEffectInfos: EffectBarRendererInfo[] = [
            new TempoEffectInfo(),
            new TripletFeelEffectInfo(),
            new MarkerEffectInfo(),
            new TextEffectInfo(),
            new ChordsEffectInfo(),
            new FermataEffectInfo(),
            new TrillEffectInfo(),
            new WideBeatVibratoEffectInfo(),
            new SlightBeatVibratoEffectInfo(),
            new WideNoteVibratoEffectInfo(),
            new SlightNoteVibratoEffectInfo(),
            new TapEffectInfo(),
            new FadeInEffectInfo(),
            new HarmonicsEffectInfo(HarmonicType.Artificial),
            new HarmonicsEffectInfo(HarmonicType.Pinch),
            new HarmonicsEffectInfo(HarmonicType.Tap),
            new HarmonicsEffectInfo(HarmonicType.Semi),
            new HarmonicsEffectInfo(HarmonicType.Feedback),
            new LetRingEffectInfo(),
            new CapoEffectInfo(),
            new FingeringEffectInfo(),
            new PalmMuteEffectInfo(),
            new PickStrokeEffectInfo(),
            new PickSlideEffectInfo(),
            new LeftHandTapEffectInfo(),
            new AlternateEndingsEffectInfo()
        ];
        staveProfiles.set(StaveProfile.Tab, [
            new EffectBarRendererFactory('tab-effects', tabEffectInfos),
            new TabBarRendererFactory(true, true, true),
            new EffectBarRendererFactory('tab-bottom-effects', [new LyricsEffectInfo()])
        ]);
        staveProfiles.set(StaveProfile.TabMixed, [
            new EffectBarRendererFactory('tab-effects', tabEffectInfos),
            new TabBarRendererFactory(false, false, false),
            new EffectBarRendererFactory('tab-bottom-effects', [new LyricsEffectInfo()])
        ]);

        return staveProfiles;
    }

    private static createDefaultLayoutEngines(): Map<LayoutMode, LayoutEngineFactory> {
        const engines = new Map<LayoutMode, LayoutEngineFactory>();
        // default layout engines
        engines.set(
            LayoutMode.Page,
            new LayoutEngineFactory(true, r => {
                return new PageViewLayout(r);
            })
        );
        engines.set(
            LayoutMode.Horizontal,
            new LayoutEngineFactory(false, r => {
                return new HorizontalScreenLayout(r);
            })
        );
        return engines;
    }

    /**
     * @target web
     * @partial
     */
    public static platformInit(): void {
        if (Environment.isRunningInAudioWorklet) {
            AlphaSynthWebWorklet.init();
        } else if (Environment.isRunningInWorker) {
            AlphaTabWebWorker.init();
            AlphaSynthWebWorker.init();
        } else if (
            Environment.webPlatform === WebPlatform.Browser ||
            Environment.webPlatform === WebPlatform.BrowserModule
        ) {
            Environment.registerJQueryPlugin();
            Environment.HighDpiFactor = window.devicePixelRatio;
            // ResizeObserver API does not yet exist so long on Safari (only start 2020 with iOS Safari 13.7 and Desktop 13.1)
            // so we better add a polyfill for it
            if (!('ResizeObserver' in Environment.globalThis)) {
                (Environment.globalThis as any).ResizeObserver = ResizeObserverPolyfill;
            }
            // IntersectionObserver API does not on older iOS versions
            // so we better add a polyfill for it
            if (!('IntersectionObserver' in Environment.globalThis)) {
                (Environment.globalThis as any).IntersectionObserver = IntersectionObserverPolyfill;
            }

            if (!('replaceChildren' in Element.prototype)) {
                Element.prototype.replaceChildren = function (...nodes: (Node | string)[]) {
                    this.innerHTML = '';
                    this.append(...nodes);
                };
                Document.prototype.replaceChildren = Element.prototype.replaceChildren;
                DocumentFragment.prototype.replaceChildren = Element.prototype.replaceChildren;
            }
            if (!('replaceAll' in String.prototype)) {
                (String.prototype as any).replaceAll = function (str: string, newStr: string) {
                    return this.replace(new RegExp(str, 'g'), newStr);
                };
            }
        }
    }

    /**
     * @target web
     */
    private static detectWebPack(): boolean {
        try {
            // @ts-ignore
            if (typeof __webpack_require__ === 'function') {
                return true;
            }
        } catch (e) {
            // ignore any errors
        }
        return false;
    }

    /**
     * @target web
     */
    private static detectWebPlatform(): WebPlatform {
        try {
            // Credit of the node.js detection goes to
            // https://github.com/iliakan/detect-node
            // MIT License
            // Copyright (c) 2017 Ilya Kantor
            // tslint:disable-next-line: strict-type-predicates
            if (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') {
                return WebPlatform.NodeJs;
            }
        } catch (e) {
            // no node.js
        }

        try {
            // @ts-ignore
            const url: any = import.meta.url;
            if (url && typeof url === 'string' && !url.startsWith('file://')) {
                return WebPlatform.BrowserModule;
            }
        } catch (e) {
            // no browser module
        }

        return WebPlatform.Browser;
    }
}

Environment.platformInit();
