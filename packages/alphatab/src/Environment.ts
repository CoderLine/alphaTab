import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { VersionInfo } from '@src/generated/VersionInfo';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { CapellaImporter } from '@src/importer/CapellaImporter';
import { Gp3To5Importer } from '@src/importer/Gp3To5Importer';
import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
import { GpxImporter } from '@src/importer/GpxImporter';
import { MusicXmlImporter } from '@src/importer/MusicXmlImporter';
import type { ScoreImporter } from '@src/importer/ScoreImporter';
import { LayoutMode } from '@src/LayoutMode';
import { Logger } from '@src/Logger';
import type { Font } from '@src/model/Font';
import { GolpeType } from '@src/model/GolpeType';
import { HarmonicType } from '@src/model/HarmonicType';
import type { ICanvas } from '@src/platform/ICanvas';
import { AlphaSynthWebWorklet } from '@src/platform/javascript/AlphaSynthAudioWorkletOutput';
import { AlphaSynthWebWorker } from '@src/platform/javascript/AlphaSynthWebWorker';
import { AlphaTabWebWorker } from '@src/platform/javascript/AlphaTabWebWorker';
import { Html5Canvas } from '@src/platform/javascript/Html5Canvas';
import { JQueryAlphaTab } from '@src/platform/javascript/JQueryAlphaTab';
import { WebPlatform } from '@src/platform/javascript/WebPlatform';
import { SkiaCanvas } from '@src/platform/skia/SkiaCanvas';
import { CssFontSvgCanvas } from '@src/platform/svg/CssFontSvgCanvas';
import type { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRendererFactory } from '@src/rendering/EffectBarRendererFactory';
import { AlternateEndingsEffectInfo } from '@src/rendering/effects/AlternateEndingsEffectInfo';
import { BeatBarreEffectInfo } from '@src/rendering/effects/BeatBarreEffectInfo';
import { BeatTimerEffectInfo } from '@src/rendering/effects/BeatTimerEffectInfo';
import { CapoEffectInfo } from '@src/rendering/effects/CapoEffectInfo';
import { ChordsEffectInfo } from '@src/rendering/effects/ChordsEffectInfo';
import { CrescendoEffectInfo } from '@src/rendering/effects/CrescendoEffectInfo';
import { DirectionsEffectInfo } from '@src/rendering/effects/DirectionsEffectInfo';
import { DynamicsEffectInfo } from '@src/rendering/effects/DynamicsEffectInfo';
import { FadeEffectInfo } from '@src/rendering/effects/FadeEffectInfo';
import { FermataEffectInfo } from '@src/rendering/effects/FermataEffectInfo';
import { FingeringEffectInfo } from '@src/rendering/effects/FingeringEffectInfo';
import { FreeTimeEffectInfo } from '@src/rendering/effects/FreeTimeEffectInfo';
import { GolpeEffectInfo } from '@src/rendering/effects/GolpeEffectInfo';
import { HarmonicsEffectInfo } from '@src/rendering/effects/HarmonicsEffectInfo';
import { LeftHandTapEffectInfo } from '@src/rendering/effects/LeftHandTapEffectInfo';
import { LetRingEffectInfo } from '@src/rendering/effects/LetRingEffectInfo';
import { LyricsEffectInfo } from '@src/rendering/effects/LyricsEffectInfo';
import { MarkerEffectInfo } from '@src/rendering/effects/MarkerEffectInfo';
import { NoteOrnamentEffectInfo } from '@src/rendering/effects/NoteOrnamentEffectInfo';
import { OttaviaEffectInfo } from '@src/rendering/effects/OttaviaEffectInfo';
import { PalmMuteEffectInfo } from '@src/rendering/effects/PalmMuteEffectInfo';
import { PickSlideEffectInfo } from '@src/rendering/effects/PickSlideEffectInfo';
import { PickStrokeEffectInfo } from '@src/rendering/effects/PickStrokeEffectInfo';
import { RasgueadoEffectInfo } from '@src/rendering/effects/RasgueadoEffectInfo';
import { SlightBeatVibratoEffectInfo } from '@src/rendering/effects/SlightBeatVibratoEffectInfo';
import { SlightNoteVibratoEffectInfo } from '@src/rendering/effects/SlightNoteVibratoEffectInfo';
import { SustainPedalEffectInfo } from '@src/rendering/effects/SustainPedalEffectInfo';
import { TapEffectInfo } from '@src/rendering/effects/TapEffectInfo';
import { TempoEffectInfo } from '@src/rendering/effects/TempoEffectInfo';
import { TextEffectInfo } from '@src/rendering/effects/TextEffectInfo';
import { TrillEffectInfo } from '@src/rendering/effects/TrillEffectInfo';
import { TripletFeelEffectInfo } from '@src/rendering/effects/TripletFeelEffectInfo';
import { WahPedalEffectInfo } from '@src/rendering/effects/WahPedalEffectInfo';
import { WhammyBarEffectInfo } from '@src/rendering/effects/WhammyBarEffectInfo';
import { WideBeatVibratoEffectInfo } from '@src/rendering/effects/WideBeatVibratoEffectInfo';
import { WideNoteVibratoEffectInfo } from '@src/rendering/effects/WideNoteVibratoEffectInfo';
import { HorizontalScreenLayout } from '@src/rendering/layout/HorizontalScreenLayout';
import { PageViewLayout } from '@src/rendering/layout/PageViewLayout';
import type { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { NumberedBarRendererFactory } from '@src/rendering/NumberedBarRendererFactory';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { ScoreBarRendererFactory } from '@src/rendering/ScoreBarRendererFactory';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { SlashBarRendererFactory } from '@src/rendering/SlashBarRendererFactory';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { TabBarRendererFactory } from '@src/rendering/TabBarRendererFactory';
import type { Settings } from '@src/Settings';
import { StaveProfile } from '@src/StaveProfile';

/**
 * A factory for custom layout engines.
 * @internal
 */
export class LayoutEngineFactory {
    /**
     * Whether the layout is considered "vertical" (affects mainly scrolling behavior).
     */
    public readonly vertical: boolean;
    /**
     * Creates a new layout instance.
     */
    public readonly createLayout: (renderer: ScoreRenderer) => ScoreLayout;

    public constructor(vertical: boolean, createLayout: (renderer: ScoreRenderer) => ScoreLayout) {
        this.vertical = vertical;
        this.createLayout = createLayout;
    }
}

/**
 * A factory for custom render engines.
 * Note for Web: To use a custom engine in workers you have to ensure the engine and registration to the environment are
 * also done in the background worker files (e.g. when bundling)
 * @public
 */
export class RenderEngineFactory {
    /**
     * Whether the layout supports background workers.
     */
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
 * @public
 */
export class Environment {
    private static readonly _staffIdBeforeSlashAlways = 'before-slash-always';
    private static readonly _staffIdBeforeScoreAlways = 'before-score-always';
    private static readonly _staffIdBeforeScoreHideable = 'before-score-hideable';
    private static readonly _staffIdBeforeNumberedAlways = 'before-numbered-always';
    private static readonly _staffIdBeforeTabAlways = 'before-tab-always';
    private static readonly _staffIdBeforeTabHideable = 'before-tab-hideable';
    private static readonly _staffIdBeforeEndAlways = 'before-end-always';

    /**
     * The scaling factor to use when rending raster graphics for sharper rendering on high-dpi displays.
     * @internal
     */
    public static highDpiFactor = 1;

    /**
     * @target web
     */
    private static _globalThis: any | undefined = undefined;

    /**
     * @target web
     * @internal
     */
    public static get globalThis(): any {
        if (Environment._globalThis === undefined) {
            try {
                Environment._globalThis = globalThis;
            } catch {
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

        return Environment._globalThis;
    }

    /**
     * @target web
     */
    public static readonly webPlatform: WebPlatform = Environment._detectWebPlatform();

    /**
     * @target web
     */
    public static readonly isWebPackBundled: boolean = Environment._detectWebPack();

    /**
     * @target web
     */
    public static readonly isViteBundled: boolean = Environment._detectVite();

    /**
     * @target web
     */
    public static readonly scriptFile: string | null = Environment._detectScriptFile();

    /**
     * @target web
     */
    public static readonly fontDirectory: string | null = Environment._detectFontDirectory();

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
    private static _detectScriptFile(): string | null {
        // custom global constant
        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_ROOT) {
            let scriptFile = Environment.globalThis.ALPHATAB_ROOT;
            scriptFile = Environment.ensureFullUrl(scriptFile);
            scriptFile = Environment._appendScriptName(scriptFile);
            return scriptFile;
        }

        // browser include as ES6 import
        // <script type="module">
        // import * as alphaTab from 'dist/alphaTab.js';
        try {
            const importUrl = import.meta.url;
            // avoid using file:// urls in case of
            // bundlers like webpack
            if (importUrl && importUrl.indexOf('file://') === -1) {
                return importUrl;
            }
        } catch {
            // ignore potential errors
        }

        // normal browser include as <script>
        if (
            'document' in Environment.globalThis &&
            document.currentScript &&
            document.currentScript instanceof HTMLScriptElement
        ) {
            return document.currentScript.src;
        }

        return null;
    }

    /**
     * @target web
     * @internal
     */
    public static ensureFullUrl(relativeUrl: string | null): string {
        if (!relativeUrl) {
            return '';
        }

        if (!relativeUrl.startsWith('http') && !relativeUrl.startsWith('https') && !relativeUrl.startsWith('file')) {
            let root: string = '';
            const location: Location = Environment.globalThis.location;
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
                const directory: string = location.pathname.split('/').slice(0, -1).join('/');
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

    private static _appendScriptName(url: string): string {
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
    private static _detectFontDirectory(): string | null {
        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_FONT) {
            return Environment.ensureFullUrl(Environment.globalThis.ALPHATAB_FONT);
        }

        const scriptFile = Environment.scriptFile;
        if (scriptFile) {
            const lastSlash: number = scriptFile.lastIndexOf(String.fromCharCode(47));
            if (lastSlash >= 0) {
                return `${scriptFile.substr(0, lastSlash)}/font/`;
            }
        }

        return null;
    }

    /**
     * @target web
     */
    private static _registerJQueryPlugin(): void {
        if (!Environment.isRunningInWorker && Environment.globalThis && 'jQuery' in Environment.globalThis) {
            const jquery: any = Environment.globalThis.jQuery;
            const api: JQueryAlphaTab = new JQueryAlphaTab();
            jquery.fn.alphaTab = function (this: any, method: string) {
                // biome-ignore lint/complexity/noArguments: Legacy jQuery plugin argument forwarding
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

    public static readonly renderEngines: Map<string, RenderEngineFactory> = Environment._createDefaultRenderEngines();

    /**
     * @internal
     */
    public static readonly layoutEngines: Map<LayoutMode, LayoutEngineFactory> =
        Environment._createDefaultLayoutEngines();

    /**
     * @internal
     */
    public static readonly staveProfiles: Map<StaveProfile, BarRendererFactory[]> =
        Environment._createDefaultStaveProfiles();

    public static getRenderEngineFactory(engine: string): RenderEngineFactory {
        if (!engine || !Environment.renderEngines.has(engine)) {
            return Environment.renderEngines.get('default')!;
        }
        return Environment.renderEngines.get(engine)!;
    }

    /**
     * @internal
     */
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

    private static _createDefaultRenderEngines(): Map<string, RenderEngineFactory> {
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

        Environment._createPlatformSpecificRenderEngines(renderEngines);
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
     * Registers a new custom font for the usage in the alphaSkia rendering backend.
     * @param fontData The raw binary data of the font.
     * @returns The font info under which the font was registered.
     */
    public static registerAlphaSkiaCustomFont(fontData: Uint8Array): Font {
        return SkiaCanvas.registerFont(fontData);
    }

    /**
     * @target web
     * @partial
     */
    private static _createPlatformSpecificRenderEngines(renderEngines: Map<string, RenderEngineFactory>) {
        renderEngines.set(
            'html5',
            new RenderEngineFactory(false, () => {
                return new Html5Canvas();
            })
        );
    }

    private static _createDefaultRenderers(): BarRendererFactory[] {
        return [
            //
            // Slash
            new EffectBarRendererFactory(Environment._staffIdBeforeSlashAlways, [
                new TempoEffectInfo(),
                new TripletFeelEffectInfo(),
                new MarkerEffectInfo(),
                new DirectionsEffectInfo(),
                new AlternateEndingsEffectInfo(),
                new FreeTimeEffectInfo(),
                new TextEffectInfo(),
                new BeatTimerEffectInfo(),
                new ChordsEffectInfo()
            ]),
            // no before-slash-hideable
            new SlashBarRendererFactory(),

            //
            // Score (standard notation)
            new EffectBarRendererFactory(Environment._staffIdBeforeScoreAlways, [
                new FermataEffectInfo(),
                new BeatBarreEffectInfo(),
                new NoteOrnamentEffectInfo(),
                new RasgueadoEffectInfo(),
                new WahPedalEffectInfo()
            ]),
            new EffectBarRendererFactory(
                Environment._staffIdBeforeScoreHideable,
                [
                    new WhammyBarEffectInfo(),
                    new TrillEffectInfo(),
                    new OttaviaEffectInfo(true),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(false),
                    new LeftHandTapEffectInfo(),
                    new GolpeEffectInfo(GolpeType.Finger)
                ],
                (_, staff) => staff.showStandardNotation
            ),
            new ScoreBarRendererFactory(),

            //
            // Numbered
            new EffectBarRendererFactory(Environment._staffIdBeforeNumberedAlways, [
                new CrescendoEffectInfo(),
                new OttaviaEffectInfo(false),
                new DynamicsEffectInfo(),
                new GolpeEffectInfo(GolpeType.Thumb, (_s, b) => b.voice.bar.staff.showStandardNotation),
                new SustainPedalEffectInfo()
            ]),
            // no before-numbered-hideable
            new NumberedBarRendererFactory(),

            //
            // Tabs
            new EffectBarRendererFactory(Environment._staffIdBeforeTabAlways, [new LyricsEffectInfo()]),
            new EffectBarRendererFactory(
                Environment._staffIdBeforeTabHideable,
                [
                    // TODO: whammy line effect
                    new TrillEffectInfo(),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(true),
                    new TapEffectInfo(),
                    new FadeEffectInfo(),
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
                    new GolpeEffectInfo(GolpeType.Finger, (_s, b) => !b.voice.bar.staff.showStandardNotation)
                ],
                (_, staff) => staff.showTablature
            ),
            new TabBarRendererFactory(),
            new EffectBarRendererFactory(Environment._staffIdBeforeEndAlways, [
                new GolpeEffectInfo(GolpeType.Thumb, (_s, b) => !b.voice.bar.staff.showStandardNotation)
            ])
        ];
    }

    private static _createDefaultStaveProfiles(): Map<StaveProfile, BarRendererFactory[]> {
        const staveProfiles = new Map<StaveProfile, BarRendererFactory[]>();

        // the general layout is repeating the same pattern across the different notation staffs:
        // * general effects before notation renderer, shown also if notation renderer is hidden (`before-xxxx-always`)
        // * effects specific to the notation renderer, hidden if the nottation renderer is hidden (`before-xxxx-hideable`)
        // * the notation renderer itself, hidden based on settings (`xxxx`)

        const defaultRenderers = Environment._createDefaultRenderers();
        staveProfiles.set(StaveProfile.Default, defaultRenderers);
        staveProfiles.set(StaveProfile.ScoreTab, defaultRenderers);

        const scoreRenderers = new Set<string>([
            Environment._staffIdBeforeSlashAlways,
            Environment._staffIdBeforeScoreAlways,
            Environment._staffIdBeforeNumberedAlways,
            Environment._staffIdBeforeTabAlways,
            ScoreBarRenderer.StaffId,
            Environment._staffIdBeforeEndAlways
        ]);
        staveProfiles.set(
            StaveProfile.Score,
            defaultRenderers.filter(r => scoreRenderers.has(r.staffId))
        );

        const tabRenderers = new Set<string>([
            Environment._staffIdBeforeSlashAlways,
            Environment._staffIdBeforeScoreAlways,
            Environment._staffIdBeforeNumberedAlways,
            Environment._staffIdBeforeTabAlways,
            TabBarRenderer.StaffId,
            Environment._staffIdBeforeEndAlways
        ]);
        staveProfiles.set(
            StaveProfile.Tab,
            Environment._createDefaultRenderers().filter(r => {
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
            Environment._createDefaultRenderers().filter(r => {
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

    private static _createDefaultLayoutEngines(): Map<LayoutMode, LayoutEngineFactory> {
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
            Environment._registerJQueryPlugin();
            Environment.highDpiFactor = window.devicePixelRatio;
        }

        Environment.createWebWorker = createWebWorker;
        Environment.createAudioWorklet = createAudioWorklet;
    }

    /**
     * @target web
     * @internal
     */
    public static get alphaTabWorker(): any {
        return Environment.globalThis.Worker;
    }

    /**
     * @target web
     * @internal
     */
    public static get alphaTabUrl(): any {
        return Environment.globalThis.URL;
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
    private static _detectWebPack(): boolean {
        try {
            // @ts-expect-error
            if (typeof __webpack_require__ === 'function') {
                return true;
            }
        } catch {
            // ignore any errors
        }
        return false;
    }

    /**
     * @target web
     */
    private static _detectVite(): boolean {
        try {
            // @ts-expect-error
            if (typeof __BASE__ === 'string') {
                return true;
            }
        } catch {
            // ignore any errors
        }
        return false;
    }

    /**
     * @target web
     */
    private static _detectWebPlatform(): WebPlatform {
        // There might be polyfills or platforms like Electron which have a global process object defined even in the browser.
        // We need to differenciate between those platforms and a real nodejs

        // the webPlatform is currently only relevant on the main process side and not within workers/worklets
        // so it is OK if we wrongly detect node.js inside them.
        const isBrowserLike =
            // browser UI thread
            typeof Environment.globalThis.Window !== 'undefined' &&
            Environment.globalThis instanceof Environment.globalThis.Window;

        if (!isBrowserLike) {
            try {
                // Credit of the node.js detection goes to
                // https://github.com/iliakan/detect-node
                // MIT License
                // Copyright (c) 2017 Ilya Kantor
                // tslint:disable-next-line: strict-type-predicates
                if (
                    Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'
                ) {
                    return WebPlatform.NodeJs;
                }
            } catch {
                // no node.js
            }
        }

        try {
            const url: any = import.meta.url;
            if (url && typeof url === 'string' && !url.startsWith('file://')) {
                return WebPlatform.BrowserModule;
            }
        } catch {
            // no browser module
        }

        return WebPlatform.Browser;
    }

    /**
     * Prints the environment information for easier troubleshooting.
     * @param force Whether to force printing.
     */
    public static printEnvironmentInfo(force: boolean = true) {
        const printer: (message: string) => void = force
            ? message => {
                  Logger.log.debug('VersionInfo', message);
              }
            : message => {
                  Logger.debug('VersionInfo', message);
              };
        VersionInfo.print(printer);
        printer(`High DPI: ${Environment.highDpiFactor}`);
        Environment._printPlatformInfo(printer);
    }

    /**
     * @target web
     * @partial
     */
    private static _printPlatformInfo(print: (message: string) => void) {
        print(`Platform: ${WebPlatform[Environment.webPlatform]}`);
        print(`WebPack: ${Environment.isWebPackBundled}`);
        print(`Vite: ${Environment.isViteBundled}`);
        if (Environment.webPlatform !== WebPlatform.NodeJs) {
            print(`Browser: ${navigator.userAgent}`);
            print(`Window Size: ${window.outerWidth}x${window.outerHeight}`);
            print(`Screen Size: ${window.screen.width}x${window.screen.height}`);
        }
    }

    /**
     * Prepares the given object to be sent to workers. Web Frameworks like Vue might
     * create proxy objects for all objects used. This code handles the necessary unwrapping.
     * @internal
     * @target web
     */
    public static prepareForPostMessage<T>(object: T): T {
        if (!object) {
            return object;
        }

        // Vue toRaw:
        // https://github.com/vuejs/core/blob/e7381761cc7971c0d40ae0a0a72687a500fd8db3/packages/reactivity/src/reactive.ts#L378-L381

        if (typeof object === 'object') {
            const unwrapped = (object as any).__v_raw;
            if (unwrapped) {
                return Environment.prepareForPostMessage(unwrapped);
            }
        }

        // Solidjs unwrap: the symbol required to access the raw object is unfortunately hidden and we cannot unwrap it without importing
        // import { unwrap } from "solid-js/store"
        // alternative for users is to replace this method during runtime.

        return object;
    }

    /**
     * @internal
     * @target web
     * @partial
     */
    public static quoteJsonString(text: string) {
        return JSON.stringify(text);
    }
}
