import { LayoutMode, StaveProfile } from '@src/DisplaySettings';
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
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { HorizontalScreenLayout } from '@src/rendering/layout/HorizontalScreenLayout';
import { PageViewLayout } from '@src/rendering/layout/PageViewLayout';
import { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { ScoreBarRendererFactory } from '@src/rendering/ScoreBarRendererFactory';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { TabBarRendererFactory } from '@src/rendering/TabBarRendererFactory';
import { Settings } from '@src/Settings';
import { FontLoadingChecker } from '@src/util/FontLoadingChecker';
import { Logger } from '@src/Logger';
import { LeftHandTapEffectInfo } from './rendering/effects/LeftHandTapEffectInfo';

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
                 font-size: 34px;
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
                // global this not available
            }

            if (typeof Environment._globalThis === 'undefined') {
                Environment._globalThis = self;
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
    public static scriptFile: string | null = Environment.detectScriptFile();

    /**
     * @target web
     */
    public static bravuraFontChecker: FontLoadingChecker = new FontLoadingChecker(
        'alphaTab',
        `&#${MusicFontSymbol.ClefG};`
    );

    /**
     * @target web
     */
    public static get isRunningInWorker(): boolean {
        return 'WorkerGlobalScope' in Environment.globalThis;
    }

    /**
     * @target web
     */
    public static get supportsFontsApi(): boolean {
        return 'fonts' in document && 'load' in (document as any).fonts;
    }

    /**
     * @target web
     */
    public static get supportsTextDecoder(): boolean {
        return 'TextDecoder' in Environment.globalThis;
    }

    /**
     * @target web
     */
    public static throttle(action: () => void, delay: number): () => void {
        let timeoutId: number = 0;
        return () => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(action, delay);
        };
    }

    /**
     * @target web
     */
    private static detectScriptFile(): string | null {
        if (Environment.isRunningInWorker) {
            return null;
        }
        // try to build the find the alphaTab script url in case we are not in the webworker already
        let scriptElement: HTMLScriptElement = document.currentScript as HTMLScriptElement;
        let scriptFile: string | null = null;

        if (!scriptElement) {
            // try to get javascript from exception stack
            try {
                let error: Error = new Error();
                let stack = error.stack;
                if (!stack) {
                    throw error;
                }
                scriptFile = Environment.scriptFileFromStack(stack);
            } catch (e) {
                if (e instanceof Error) {
                    let stack = e.stack;
                    if (!stack) {
                        scriptElement = document.querySelector('script[data-alphatab]') as HTMLScriptElement;
                    } else {
                        scriptFile = Environment.scriptFileFromStack(stack);
                    }
                } else {
                    throw e;
                }
            }
        }

        // failed to automatically resolve
        if (!scriptFile) {
            if (!scriptElement) {
                Logger.warning(
                    'Environment',
                    'Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab',
                    null
                );
            } else {
                scriptFile = scriptElement.src;
            }
        }

        return scriptFile;
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

    /**
     * based on https://github.com/JamesMGreene/currentExecutingScript
     * @target web
     */
    private static scriptFileFromStack(stack: string): string | null {
        let matches = stack.match(
            '(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?'
        );
        if (!matches) {
            matches = stack.match(
                '^(?:|[^:@]*@|.+\\)@(?=data:text\\/javascript|blob|http[s]?|file)|.+?\\s+(?: at |@)(?:[^:\\(]+ )*[\\(]?)(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?'
            );
            if (!matches) {
                matches = stack.match(
                    '\\)@(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?'
                );
                if (!matches) {
                    return null;
                }
            }
        }
        return matches[1];
    }

    public static renderEngines: Map<string, RenderEngineFactory> = Environment.createDefaultRenderEngines();
    public static layoutEngines: Map<LayoutMode, LayoutEngineFactory> = Environment.createDefaultLayoutEngines();
    public static staveProfiles: Map<StaveProfile, BarRendererFactory[]> = Environment.createDefaultStaveProfiles();

    public static createScoreRenderer(settings: Settings): IScoreRenderer {
        return new ScoreRenderer(settings);
    }

    public static getRenderEngineFactory(settings: Settings): RenderEngineFactory {
        if (!settings.core.engine || !Environment.renderEngines.has(settings.core.engine)) {
            return Environment.renderEngines.get('default')!;
        }
        return Environment.renderEngines.get(settings.core.engine)!;
    }

    public static getLayoutEngineFactory(settings: Settings): LayoutEngineFactory {
        if (!settings.display.layoutMode || !Environment.layoutEngines.has(settings.display.layoutMode)) {
            return Environment.layoutEngines.get(LayoutMode.Page)!;
        }
        return Environment.layoutEngines.get(settings.display.layoutMode)!;
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
            new AlphaTexImporter(),
            new MusicXmlImporter()
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
     */
    public static platformInit(): void {
        Environment.registerJQueryPlugin();
        // polyfills
        Math.log2 = Math.log2
            ? Math.log2
            : function (x) {
                  return Math.log(x) * Math.LOG2E;
              };

        if (!Environment.isRunningInWorker) {
            let vbAjaxLoader: string = '';
            vbAjaxLoader += 'Function VbAjaxLoader(method, fileName)' + '\r\n';
            vbAjaxLoader += '    Dim xhr' + '\r\n';
            vbAjaxLoader += '    Set xhr = CreateObject("Microsoft.XMLHTTP")' + '\r\n';
            vbAjaxLoader += '    xhr.Open method, fileName, False' + '\r\n';
            vbAjaxLoader += '    xhr.setRequestHeader "Accept-Charset", "x-user-defined"' + '\r\n';
            vbAjaxLoader += '    xhr.send' + '\r\n';
            vbAjaxLoader += '    Dim byteArray()' + '\r\n';
            vbAjaxLoader += '    if xhr.Status = 200 Then' + '\r\n';
            vbAjaxLoader += '        Dim byteString' + '\r\n';
            vbAjaxLoader += '        Dim i' + '\r\n';
            vbAjaxLoader += '        byteString=xhr.responseBody' + '\r\n';
            vbAjaxLoader += '        ReDim byteArray(LenB(byteString))' + '\r\n';
            vbAjaxLoader += '        For i = 1 To LenB(byteString)' + '\r\n';
            vbAjaxLoader += '            byteArray(i-1) = AscB(MidB(byteString, i, 1))' + '\r\n';
            vbAjaxLoader += '        Next' + '\r\n';
            vbAjaxLoader += '    End If' + '\r\n';
            vbAjaxLoader += '    VbAjaxLoader=byteArray' + '\r\n';
            vbAjaxLoader += 'End Function' + '\r\n';
            let vbAjaxLoaderScript: HTMLScriptElement = document.createElement('script') as HTMLScriptElement;
            vbAjaxLoaderScript.setAttribute('type', 'text/vbscript');
            let inlineScript: Node = document.createTextNode(vbAjaxLoader);
            vbAjaxLoaderScript.appendChild(inlineScript);
            document.addEventListener(
                'DOMContentLoaded',
                () => {
                    document.body.appendChild(vbAjaxLoaderScript);
                },
                false
            );
        } else {
            AlphaTabWebWorker.init();
            AlphaSynthWebWorker.init();
        }
    }
}

Environment.platformInit();
