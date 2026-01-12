import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { VersionInfo } from '@coderline/alphatab/generated/VersionInfo';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { CapellaImporter } from '@coderline/alphatab/importer/CapellaImporter';
import { Gp3To5Importer } from '@coderline/alphatab/importer/Gp3To5Importer';
import { Gp7To8Importer } from '@coderline/alphatab/importer/Gp7To8Importer';
import { GpxImporter } from '@coderline/alphatab/importer/GpxImporter';
import { MusicXmlImporter } from '@coderline/alphatab/importer/MusicXmlImporter';
import type { ScoreImporter } from '@coderline/alphatab/importer/ScoreImporter';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Logger } from '@coderline/alphatab/Logger';
import type { Font } from '@coderline/alphatab/model/Font';
import { GolpeType } from '@coderline/alphatab/model/GolpeType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { AlphaSynthWebWorklet } from '@coderline/alphatab/platform/javascript/AlphaSynthAudioWorkletOutput';
import { AlphaSynthWebWorker } from '@coderline/alphatab/platform/javascript/AlphaSynthWebWorker';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/javascript/AlphaTabWebWorker';
import { Html5Canvas } from '@coderline/alphatab/platform/javascript/Html5Canvas';
import { JQueryAlphaTab } from '@coderline/alphatab/platform/javascript/JQueryAlphaTab';
import { WebPlatform } from '@coderline/alphatab/platform/javascript/WebPlatform';
import { SkiaCanvas } from '@coderline/alphatab/platform/skia/SkiaCanvas';
import { CssFontSvgCanvas } from '@coderline/alphatab/platform/svg/CssFontSvgCanvas';
import { EffectBandMode, type BarRendererFactory } from '@coderline/alphatab/rendering/BarRendererFactory';
import { AlternateEndingsEffectInfo } from '@coderline/alphatab/rendering/effects/AlternateEndingsEffectInfo';
import { BeatBarreEffectInfo } from '@coderline/alphatab/rendering/effects/BeatBarreEffectInfo';
import { BeatTimerEffectInfo } from '@coderline/alphatab/rendering/effects/BeatTimerEffectInfo';
import { CapoEffectInfo } from '@coderline/alphatab/rendering/effects/CapoEffectInfo';
import { ChordsEffectInfo } from '@coderline/alphatab/rendering/effects/ChordsEffectInfo';
import { CrescendoEffectInfo } from '@coderline/alphatab/rendering/effects/CrescendoEffectInfo';
import { DirectionsEffectInfo } from '@coderline/alphatab/rendering/effects/DirectionsEffectInfo';
import { DynamicsEffectInfo } from '@coderline/alphatab/rendering/effects/DynamicsEffectInfo';
import { FadeEffectInfo } from '@coderline/alphatab/rendering/effects/FadeEffectInfo';
import { FermataEffectInfo } from '@coderline/alphatab/rendering/effects/FermataEffectInfo';
import { FingeringEffectInfo } from '@coderline/alphatab/rendering/effects/FingeringEffectInfo';
import { FreeTimeEffectInfo } from '@coderline/alphatab/rendering/effects/FreeTimeEffectInfo';
import { GolpeEffectInfo } from '@coderline/alphatab/rendering/effects/GolpeEffectInfo';
import { HarmonicsEffectInfo } from '@coderline/alphatab/rendering/effects/HarmonicsEffectInfo';
import { LeftHandTapEffectInfo } from '@coderline/alphatab/rendering/effects/LeftHandTapEffectInfo';
import { LetRingEffectInfo } from '@coderline/alphatab/rendering/effects/LetRingEffectInfo';
import { LyricsEffectInfo } from '@coderline/alphatab/rendering/effects/LyricsEffectInfo';
import { MarkerEffectInfo } from '@coderline/alphatab/rendering/effects/MarkerEffectInfo';
import { NoteOrnamentEffectInfo } from '@coderline/alphatab/rendering/effects/NoteOrnamentEffectInfo';
import { NumberedBarKeySignatureEffectInfo } from '@coderline/alphatab/rendering/effects/NumberedBarKeySignatureEffectInfo';
import { OttaviaEffectInfo } from '@coderline/alphatab/rendering/effects/OttaviaEffectInfo';
import { PalmMuteEffectInfo } from '@coderline/alphatab/rendering/effects/PalmMuteEffectInfo';
import { PickSlideEffectInfo } from '@coderline/alphatab/rendering/effects/PickSlideEffectInfo';
import { PickStrokeEffectInfo } from '@coderline/alphatab/rendering/effects/PickStrokeEffectInfo';
import { RasgueadoEffectInfo } from '@coderline/alphatab/rendering/effects/RasgueadoEffectInfo';
import { SimpleDipWhammyBarEffectInfo } from '@coderline/alphatab/rendering/effects/SimpleDipWhammyBarEffectInfo';
import { SlightBeatVibratoEffectInfo } from '@coderline/alphatab/rendering/effects/SlightBeatVibratoEffectInfo';
import { SlightNoteVibratoEffectInfo } from '@coderline/alphatab/rendering/effects/SlightNoteVibratoEffectInfo';
import { SustainPedalEffectInfo } from '@coderline/alphatab/rendering/effects/SustainPedalEffectInfo';
import { TabWhammyEffectInfo } from '@coderline/alphatab/rendering/effects/TabWhammyEffectInfo';
import { TapEffectInfo } from '@coderline/alphatab/rendering/effects/TapEffectInfo';
import { TempoEffectInfo } from '@coderline/alphatab/rendering/effects/TempoEffectInfo';
import { TextEffectInfo } from '@coderline/alphatab/rendering/effects/TextEffectInfo';
import { TrillEffectInfo } from '@coderline/alphatab/rendering/effects/TrillEffectInfo';
import { TripletFeelEffectInfo } from '@coderline/alphatab/rendering/effects/TripletFeelEffectInfo';
import { WahPedalEffectInfo } from '@coderline/alphatab/rendering/effects/WahPedalEffectInfo';
import { WhammyBarEffectInfo } from '@coderline/alphatab/rendering/effects/WhammyBarEffectInfo';
import { WideBeatVibratoEffectInfo } from '@coderline/alphatab/rendering/effects/WideBeatVibratoEffectInfo';
import { WideNoteVibratoEffectInfo } from '@coderline/alphatab/rendering/effects/WideNoteVibratoEffectInfo';
import { HorizontalScreenLayout } from '@coderline/alphatab/rendering/layout/HorizontalScreenLayout';
import { PageViewLayout } from '@coderline/alphatab/rendering/layout/PageViewLayout';
import { ParchmentLayout } from '@coderline/alphatab/rendering/layout/ParchmentLayout';
import type { ScoreLayout } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import { NumberedBarRendererFactory } from '@coderline/alphatab/rendering/NumberedBarRendererFactory';
import { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { ScoreBarRendererFactory } from '@coderline/alphatab/rendering/ScoreBarRendererFactory';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { SlashBarRenderer } from '@coderline/alphatab/rendering/SlashBarRenderer';
import { SlashBarRendererFactory } from '@coderline/alphatab/rendering/SlashBarRendererFactory';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { TabBarRendererFactory } from '@coderline/alphatab/rendering/TabBarRendererFactory';
import type { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';

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
    public static readonly staveProfiles: Map<StaveProfile, Set<string>> = Environment._createDefaultStaveProfiles();

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

    /**
     * @internal
     */
    public static readonly defaultRenderers: BarRendererFactory[] = [
        //
        // Slash
        new SlashBarRendererFactory([
            { effect: new TempoEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new TripletFeelEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new MarkerEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new DirectionsEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new FreeTimeEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new TextEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new BeatTimerEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new ChordsEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new AlternateEndingsEffectInfo(), mode: EffectBandMode.SharedTop, order: 1000 }
        ]),

        //
        // Score (standard notation)
        new ScoreBarRendererFactory([
            { effect: new CapoEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new FermataEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new BeatBarreEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new NoteOrnamentEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new RasgueadoEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new WahPedalEffectInfo(), mode: EffectBandMode.SharedTop },
            { effect: new WhammyBarEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new SimpleDipWhammyBarEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new TrillEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new OttaviaEffectInfo(true), mode: EffectBandMode.OwnedTop },
            { effect: new LeftHandTapEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new TapEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new WideBeatVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new SlightBeatVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new WideNoteVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new SlightNoteVibratoEffectInfo(false), mode: EffectBandMode.OwnedTop },
            {
                effect: new FadeEffectInfo(),
                mode: EffectBandMode.OwnedTop,
                shouldCreate: staff => !staff.showTablature
            },
            {
                effect: new LetRingEffectInfo(),
                mode: EffectBandMode.OwnedTop,
                shouldCreate: staff => !staff.showTablature
            },
            {
                effect: new PickStrokeEffectInfo(),
                mode: EffectBandMode.OwnedTop,
                shouldCreate: staff => !staff.showTablature
            },
            {
                effect: new PickSlideEffectInfo(),
                mode: EffectBandMode.OwnedTop,
                shouldCreate: staff => !staff.showTablature
            },

            { effect: new GolpeEffectInfo(GolpeType.Finger), mode: EffectBandMode.OwnedTop },

            { effect: new GolpeEffectInfo(GolpeType.Thumb), mode: EffectBandMode.OwnedBottom },
            { effect: new CrescendoEffectInfo(), mode: EffectBandMode.SharedBottom },
            // NOTE: all octave signs are currently shown above, but 8vb could be shown as 8va below the staff
            // { effect: new OttaviaEffectInfo(false), mode: EffectBandMode.SharedBottom },
            { effect: new DynamicsEffectInfo(), mode: EffectBandMode.SharedBottom },
            { effect: new SustainPedalEffectInfo(), mode: EffectBandMode.SharedBottom }
        ]),

        //
        // Numbered
        new NumberedBarRendererFactory([
            { effect: new NumberedBarKeySignatureEffectInfo(), mode: EffectBandMode.OwnedTop, order: 1000 }
        ]),

        //
        // Tabs
        new TabBarRendererFactory([
            { effect: new LyricsEffectInfo(), mode: EffectBandMode.SharedTop },

            { effect: new TabWhammyEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new TrillEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new WideBeatVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new SlightBeatVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new WideNoteVibratoEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new SlightNoteVibratoEffectInfo(true), mode: EffectBandMode.OwnedTop },
            { effect: new TapEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new FadeEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Natural), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Artificial), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Pinch), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Tap), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Semi), mode: EffectBandMode.OwnedTop },
            { effect: new HarmonicsEffectInfo(HarmonicType.Feedback), mode: EffectBandMode.OwnedTop },
            { effect: new LetRingEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new FingeringEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new PalmMuteEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new PickStrokeEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new PickSlideEffectInfo(), mode: EffectBandMode.OwnedTop },
            { effect: new LeftHandTapEffectInfo(), mode: EffectBandMode.OwnedTop },
            {
                effect: new GolpeEffectInfo(GolpeType.Finger),
                mode: EffectBandMode.OwnedTop,
                shouldCreate: staff => !staff.showStandardNotation
            },

            {
                effect: new GolpeEffectInfo(GolpeType.Thumb),
                mode: EffectBandMode.OwnedBottom,
                shouldCreate: staff => !staff.showStandardNotation
            }
        ])
    ];

    private static _createDefaultStaveProfiles(): Map<StaveProfile, Set<string>> {
        const staveProfiles = new Map<StaveProfile, Set<string>>();

        // the general layout is repeating the same pattern across the different notation staffs:
        // * general effects before notation renderer, shown also if notation renderer is hidden (`before-xxxx-always`)
        // * effects specific to the notation renderer, hidden if the nottation renderer is hidden (`before-xxxx-hideable`)
        // * the notation renderer itself, hidden based on settings (`xxxx`)

        staveProfiles.set(
            StaveProfile.Default,
            new Set<string>([
                SlashBarRenderer.StaffId,
                ScoreBarRenderer.StaffId,
                NumberedBarRenderer.StaffId,
                TabBarRenderer.StaffId
            ])
        );
        staveProfiles.set(
            StaveProfile.ScoreTab,
            new Set<string>([
                SlashBarRenderer.StaffId,
                ScoreBarRenderer.StaffId,
                NumberedBarRenderer.StaffId,
                TabBarRenderer.StaffId
            ])
        );

        staveProfiles.set(StaveProfile.Score, new Set<string>([ScoreBarRenderer.StaffId]));
        staveProfiles.set(StaveProfile.Tab, new Set<string>([TabBarRenderer.StaffId]));
        staveProfiles.set(StaveProfile.TabMixed, new Set<string>([TabBarRenderer.StaffId]));

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
        engines.set(
            LayoutMode.Parchment,
            new LayoutEngineFactory(true, r => {
                return new ParchmentLayout(r);
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
                // check if webpack plugin was used
                // @ts-expect-error
                if (typeof __ALPHATAB_WEBPACK__ !== 'boolean') {
                    Logger.warning(
                        'WebPack',
                        `Detected bundling with WebPack but @coderline/alphatab-webpack was not used! To ensure alphaTab works as expected use our bundler plugins. Learn more at https://www.alphatab.net/docs/getting-started/installation-webpack`
                    );
                }

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
                // check if vite plugin was used
                // @ts-expect-error
                if (typeof __ALPHATAB_VITE__ !== 'boolean') {
                    Logger.warning(
                        'Vite',
                        `Detected bundling with Vite but @coderline/alphatab-vite was not used! To ensure alphaTab works as expected use our bundler plugins. Learn more at https://www.alphatab.net/docs/getting-started/installation-vite`
                    );
                }

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

    /**
     * @internal
     * @target web
     * @partial
     */
    public static sortDescending(array: number[]) {
        // java is a joke:
        // no primitive sorting of arrays with custom comparer in 2025
        // so we need to declare this specific helper function and implement it in Kotlin ourselves.
        array.sort((a, b) => b - a);
    }
}
