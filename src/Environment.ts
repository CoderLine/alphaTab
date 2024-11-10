import { LayoutMode } from '@src/LayoutMode';
import { StaveProfile } from '@src/StaveProfile';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Gp3To5Importer } from '@src/importer/Gp3To5Importer';
import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
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
import { SkiaCanvas } from './platform/skia/SkiaCanvas';
import { Font } from './model';
import { Settings } from './Settings';
import { AlphaTabError, AlphaTabErrorType } from './AlphaTabError';
import { SlashBarRendererFactory } from './rendering/SlashBarRendererFactory';
import { NumberedBarRendererFactory } from './rendering/NumberedBarRendererFactory';
import { FreeTimeEffectInfo } from './rendering/effects/FreeTimeEffectInfo';
import { ScoreBarRenderer } from './rendering/ScoreBarRenderer';
import { TabBarRenderer } from './rendering/TabBarRenderer';
import { SustainPedalEffectInfo } from './rendering/effects/SustainPedalEffectInfo';
import { GolpeEffectInfo } from './rendering/effects/GolpeEffectInfo';
import { GolpeType } from './model/GolpeType';

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
    private static readonly StaffIdBeforeSlashAlways = 'before-slash-always';
    private static readonly StaffIdBeforeScoreAlways = 'before-score-always';
    private static readonly StaffIdBeforeScoreHideable = 'before-score-hideable';
    private static readonly StaffIdBeforeNumberedAlways = 'before-numbered-always';
    private static readonly StaffIdBeforeTabAlways = 'before-tab-always';
    private static readonly StaffIdBeforeTabHideable = 'before-tab-hideable';
    private static readonly StaffIdBeforeEndAlways = 'before-end-always';

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
                white-space:pre;
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
    public static isViteBundled: boolean = Environment.detectVite();

    /**
     * @target web
     */
    public static scriptFile: string | null = Environment.detectScriptFile();

    /**
     * @target web
     */
    public static fontDirectory: string | null = Environment.detectFontDirectory();

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
     * @internal
     */
    public static createWebWorker: (settings: Settings) => Worker;

    /**
     * @target web
     * @internal
     */
    public static createAudioWorklet: (context: AudioContext, settings: Settings) => Promise<void>;

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
        // custom global constant
        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_ROOT) {
            let scriptFile = Environment.globalThis.ALPHATAB_ROOT;
            scriptFile = Environment.ensureFullUrl(scriptFile);
            scriptFile = Environment.appendScriptName(scriptFile);
            return scriptFile;
        }

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
    public static ensureFullUrl(relativeUrl: string | null): string {
        if (!relativeUrl) {
            return '';
        }

        if (!relativeUrl.startsWith('http') && !relativeUrl.startsWith('https') && !relativeUrl.startsWith('file')) {
            let root: string = '';
            let location: Location = Environment.globalThis['location'];
            root += location.protocol?.toString();
            root += '//'?.toString();
            if (location.hostname) {
                root += location.hostname?.toString();
            }
            if (location.port) {
                root += ':'?.toString();
                root += location.port?.toString();
            }
            // as it is not clearly defined how slashes are treated in the location object
            // better be safe than sorry here
            if (!relativeUrl.startsWith('/')) {
                let directory: string = location.pathname.split('/').slice(0, -1).join('/');
                if (directory.length > 0) {
                    if (!directory.startsWith('/')) {
                        root += '/'?.toString();
                    }
                    root += directory?.toString();
                }
            }
            if (!relativeUrl.startsWith('/')) {
                root += '/'?.toString();
            }
            root += relativeUrl?.toString();
            return root;
        }
        return relativeUrl;
    }

    private static appendScriptName(url: string): string {
        // append script name
        if (url && !url.endsWith('.js')) {
            if (!url.endsWith('/')) {
                url += '/';
            }
            url += 'alphaTab.js';
        }
        return url;
    }

    /**
     * @target web
     */
    private static detectFontDirectory(): string | null {
        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_FONT) {
            return Environment.ensureFullUrl(Environment.globalThis['ALPHATAB_FONT']);
        }

        const scriptFile = Environment.scriptFile;
        if (scriptFile) {
            let lastSlash: number = scriptFile.lastIndexOf(String.fromCharCode(47));
            if (lastSlash >= 0) {
                return scriptFile.substr(0, lastSlash) + '/font/';
            }
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
            new Gp7To8Importer(),
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

        renderEngines.set(
            'skia',
            new RenderEngineFactory(false, () => {
                return new SkiaCanvas();
            })
        );

        Environment.createPlatformSpecificRenderEngines(renderEngines);
        return renderEngines;
    }

    /**
     * Enables the usage of alphaSkia as rendering backend.
     * @param musicFontData The raw binary data of the music font.
     * @param alphaSkia The alphaSkia module.
     */
    public static enableAlphaSkia(musicFontData: ArrayBuffer, alphaSkia: unknown) {
        SkiaCanvas.enable(musicFontData, alphaSkia);
    }

    /**
     * Registers a new custom font for the usage in the alphaSkia rendering backend using
     * provided font information.
     * @param fontData The raw binary data of the font.
     * @param fontInfo If provided the font info provided overrules
     * @returns The font info under which the font was registered.
     */
    public static registerAlphaSkiaCustomFont(fontData: Uint8Array, fontInfo?: Font | undefined): Font {
        return SkiaCanvas.registerFont(fontData, fontInfo);
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

    private static createDefaultRenderers(): BarRendererFactory[] {
        return [
            //
            // Slash
            new EffectBarRendererFactory(Environment.StaffIdBeforeSlashAlways, [
                new TempoEffectInfo(),
                new TripletFeelEffectInfo(),
                new MarkerEffectInfo(),
                new AlternateEndingsEffectInfo(),
                new FreeTimeEffectInfo(),
                new TextEffectInfo(),
                new ChordsEffectInfo()
            ]),
            // no before-slash-hideable
            new SlashBarRendererFactory(),

            //
            // Score (standard notation)
            new EffectBarRendererFactory(Environment.StaffIdBeforeScoreAlways, [new FermataEffectInfo()]),
            new EffectBarRendererFactory(
                Environment.StaffIdBeforeScoreHideable,
                [
                    new WhammyBarEffectInfo(),
                    new TrillEffectInfo(),
                    new OttaviaEffectInfo(true),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new LeftHandTapEffectInfo(),
                    new GolpeEffectInfo(GolpeType.Finger)
                ],
                (_, staff) => staff.showStandardNotation
            ),
            new ScoreBarRendererFactory(),

            //
            // Numbered
            new EffectBarRendererFactory(Environment.StaffIdBeforeNumberedAlways, [
                new CrescendoEffectInfo(),
                new OttaviaEffectInfo(false),
                new DynamicsEffectInfo(),
                new GolpeEffectInfo(GolpeType.Thumb, (s, b) => b.voice.bar.staff.showStandardNotation),
                new SustainPedalEffectInfo()
            ]),
            // no before-numbered-hideable
            new NumberedBarRendererFactory(),

            //
            // Tabs
            new EffectBarRendererFactory(Environment.StaffIdBeforeTabAlways, [new LyricsEffectInfo()]),
            new EffectBarRendererFactory(
                Environment.StaffIdBeforeTabHideable,
                [
                    // TODO: whammy line effect
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
                    new LeftHandTapEffectInfo(),
                    new GolpeEffectInfo(GolpeType.Finger, (s, b) => !b.voice.bar.staff.showStandardNotation)
                ],
                (_, staff) => staff.showTablature
            ),
            new TabBarRendererFactory(),
            new EffectBarRendererFactory(Environment.StaffIdBeforeEndAlways, [
                new GolpeEffectInfo(GolpeType.Thumb, (s, b) => !b.voice.bar.staff.showStandardNotation)
            ])
        ];
    }

    private static createDefaultStaveProfiles(): Map<StaveProfile, BarRendererFactory[]> {
        const staveProfiles = new Map<StaveProfile, BarRendererFactory[]>();

        // the general layout is repeating the same pattern across the different notation staffs:
        // * general effects before notation renderer, shown also if notation renderer is hidden (`before-xxxx-always`)
        // * effects specific to the notation renderer, hidden if the nottation renderer is hidden (`before-xxxx-hideable`)
        // * the notation renderer itself, hidden based on settings (`xxxx`)

        const defaultRenderers = Environment.createDefaultRenderers();
        staveProfiles.set(StaveProfile.Default, defaultRenderers);
        staveProfiles.set(StaveProfile.ScoreTab, defaultRenderers);

        const scoreRenderers = new Set<string>([
            Environment.StaffIdBeforeSlashAlways,
            Environment.StaffIdBeforeScoreAlways,
            Environment.StaffIdBeforeNumberedAlways,
            Environment.StaffIdBeforeTabAlways,
            ScoreBarRenderer.StaffId,
            Environment.StaffIdBeforeEndAlways
        ]);
        staveProfiles.set(
            StaveProfile.Score,
            defaultRenderers.filter(r => scoreRenderers.has(r.staffId))
        );

        const tabRenderers = new Set<string>([
            Environment.StaffIdBeforeSlashAlways,
            Environment.StaffIdBeforeScoreAlways,
            Environment.StaffIdBeforeNumberedAlways,
            Environment.StaffIdBeforeTabAlways,
            TabBarRenderer.StaffId,
            Environment.StaffIdBeforeEndAlways
        ]);
        staveProfiles.set(
            StaveProfile.Tab,
            Environment.createDefaultRenderers().filter(r => {
                if (r instanceof TabBarRendererFactory) {
                    const tab = r as TabBarRendererFactory;
                    tab.showTimeSignature = true;
                    tab.showRests = true;
                    tab.showTiedNotes = true;
                }
                return tabRenderers.has(r.staffId);
            })
        );

        staveProfiles.set(
            StaveProfile.TabMixed,
            Environment.createDefaultRenderers().filter(r => {
                if (r instanceof TabBarRendererFactory) {
                    const tab = r as TabBarRendererFactory;
                    tab.showTimeSignature = false;
                    tab.showRests = false;
                    tab.showTiedNotes = false;
                }
                return tabRenderers.has(r.staffId);
            })
        );

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
     */
    public static initializeMain(
        createWebWorker: (settings: Settings) => Worker,
        createAudioWorklet: (context: AudioContext, settings: Settings) => Promise<void>
    ) {
        if (Environment.isRunningInWorker || Environment.isRunningInAudioWorklet) {
            return;
        }

        // browser polyfills
        if (Environment.webPlatform === WebPlatform.Browser || Environment.webPlatform === WebPlatform.BrowserModule) {
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
                (Element.prototype as Element).replaceChildren = function (...nodes: (Node | string)[]) {
                    this.innerHTML = '';
                    this.append(...nodes);
                };
                (Document.prototype as Document).replaceChildren = (Element.prototype as Element).replaceChildren;
                (DocumentFragment.prototype as DocumentFragment).replaceChildren = (
                    Element.prototype as Element
                ).replaceChildren;
            }
            if (!('replaceAll' in String.prototype)) {
                (String.prototype as any).replaceAll = function (str: string, newStr: string) {
                    return this.replace(new RegExp(str, 'g'), newStr);
                };
            }
        }

        Environment.createWebWorker = createWebWorker;
        Environment.createAudioWorklet = createAudioWorklet;
    }

    /**
     * @target web
     */
    public static get alphaTabWorker(): any {
        return this.globalThis.Worker;
    }

    /**
     * @target web
     */
    public static initializeWorker() {
        if (!Environment.isRunningInWorker) {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                'Not running in worker, cannot run worker initialization'
            );
        }
        AlphaTabWebWorker.init();
        AlphaSynthWebWorker.init();
        Environment.createWebWorker = _ => {
            throw new AlphaTabError(AlphaTabErrorType.General, 'Nested workers are not supported');
        };
    }

    /**
     * @target web
     */
    public static initializeAudioWorklet() {
        if (!Environment.isRunningInAudioWorklet) {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                'Not running in audio worklet, cannot run worklet initialization'
            );
        }
        AlphaSynthWebWorklet.init();
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
    private static detectVite(): boolean {
        try {
            // @ts-ignore
            if (typeof __BASE__ === 'string') {
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
