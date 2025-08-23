import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { MidiFile, MidiFileFormat } from '@src/midi/MidiFile';
import { LayoutMode } from '@src/LayoutMode';
import { type IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import type { Track } from '@src/model/Track';
import { BrowserUiFacade } from '@src/platform/javascript/BrowserUiFacade';
import { ProgressEventArgs } from '@src/ProgressEventArgs';
import type { Settings } from '@src/Settings';
import { JsonConverter } from '@src/model/JsonConverter';
import { SettingsSerializer } from '@src/generated/SettingsSerializer';
import type { SettingsJson } from '@src/generated/SettingsJson';
import { PlayerMode } from '@src/PlayerSettings';
import { Logger } from '@src/Logger';
import { FileLoadError } from '@src/FileLoadError';

/**
 * @target web
 */
export class AlphaTabApi extends AlphaTabApiBase<SettingsJson | Settings> {
    /**
     * Initializes a new instance of the {@link AlphaTabApi} class.
     * @param element The HTML element into which alphaTab should be initialized.
     * @param settings The settings to use.
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'), { display: { scale: 1.2 }});
     * ```
     */
    public constructor(element: HTMLElement, options: SettingsJson | Settings) {
        super(new BrowserUiFacade(element), options);
    }

    /**
     * @inheritdoc
     */
    public override tex(tex: string, tracks?: number[]): void {
        const browser: BrowserUiFacade = this.uiFacade as BrowserUiFacade;
        super.tex(tex, browser.parseTracks(tracks));
    }

    /**
     * Opens a popup window with the rendered music notation for printing.
     * @param width An optional custom width as CSS width that should be used. Best is to use a CSS width that is suitable for your preferred page size.
     * @param additionalSettings An optional parameter to specify additional setting values which should be respected during printing ({@since 1.2.0})
     * @remarks
     * Opens a popup window with the rendered music notation for printing. The default display of alphaTab in the browser is not very
     * suitable for printing. The items are lazy loaded, the width can be dynamic, and the scale might be better suitable for screens.
     * This function opens a popup window which is filled with a by-default A4 optimized view of the rendered score:
     *
     * * Lazy loading is disabled
     * * The scale is reduced to 0.8
     * * The stretch force is reduced to 0.8
     * * The width is optimized to A4. Portrait if the page-layout is used, landscape if the horizontal-layout is used.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.print();
     * api.print(undefined, { display: { barsPerRow: 5 } });
     * ```
     */
    public print(width?: string, additionalSettings: unknown = null): void {
        // prepare a popup window for printing (a4 width, window height, centered)
        const preview: Window = window.open('', '', 'width=0,height=0')!;
        const a4: HTMLElement = preview.document.createElement('div');
        if (width) {
            a4.style.width = width;
        } else {
            if (this.settings.display.layoutMode === LayoutMode.Horizontal) {
                a4.style.width = '297mm';
            } else {
                a4.style.width = '210mm';
            }
        }
        // the style is a workaround for browser having problems with printing using absolute positions.
        preview.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
            .at-surface {
                width: auto !important;
                height: auto !important;
            }
            .at-surface > div {
                position: relative!important;
                left: auto !important;
                top: auto !important;
                break-inside: avoid;
            }
            </style>
          </head>
          <body></body>
        </html>
        `);
        const score = this.score;
        if (score) {
            if (score.artist && score.title) {
                preview.document.title = `${score.title} - ${score.artist}`;
            } else if (score.title) {
                preview.document.title = `${score.title}`;
            }
        }
        preview.document.body.appendChild(a4);
        const dualScreenLeft: number =
            typeof (window as any).screenLeft !== 'undefined' ? (window as any).screenLeft : (window as any).left;
        const dualScreenTop: number =
            typeof (window as any).screenTop !== 'undefined' ? (window as any).screenTop : (window as any).top;
        const screenWidth: number =
            'innerWidth' in window
                ? window.innerWidth
                : 'clientWidth' in document.documentElement
                  ? document.documentElement.clientWidth
                  : (window as Window).screen.width;
        const screenHeight: number =
            'innerHeight' in window
                ? window.innerHeight
                : 'clientHeight' in document.documentElement
                  ? document.documentElement.clientHeight
                  : (window as Window).screen.height;
        const w: number = a4.offsetWidth + 50;
        const h: number = window.innerHeight;
        const left: number = ((screenWidth / 2) | 0) - ((w / 2) | 0) + dualScreenLeft;
        const top: number = ((screenHeight / 2) | 0) - ((h / 2) | 0) + dualScreenTop;
        preview.resizeTo(w, h);
        preview.moveTo(left, top);
        preview.focus();
        // render alphaTab
        const settings: Settings = JsonConverter.jsObjectToSettings(JsonConverter.settingsToJsObject(this.settings));
        settings.core.enableLazyLoading = false;
        settings.core.useWorkers = true;
        settings.core.file = null;
        settings.core.tracks = null;
        settings.player.enableCursor = false;
        settings.player.playerMode = PlayerMode.Disabled;
        settings.player.enableElementHighlighting = false;
        settings.player.enableUserInteraction = false;
        settings.player.soundFont = null;
        settings.display.scale = 0.8;
        settings.display.stretchForce = 0.8;
        SettingsSerializer.fromJson(settings, additionalSettings);
        const alphaTab: AlphaTabApi = new AlphaTabApi(a4, settings);
        preview.onunload = () => {
            alphaTab.destroy();
        };
        alphaTab.renderer.postRenderFinished.on(() => {
            preview.print();
        });
        alphaTab.renderTracks(this.tracks);
    }

    /**
     * Generates an SMF1.0 file and downloads it
     * @remarks
     * Generates a SMF1.0 compliant MIDI file of the currently loaded song and starts the download of it.
     * Please be aware that SMF1.0 does not support bends per note which might result in wrong bend effects
     * in case multiple bends are applied on the same beat (e.g. two notes bending or vibrato + bends).
     *
     * @category Methods - Core
     * @since 1.3.0
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.downloadMidi();
     * ```
     */
    public downloadMidi(format: MidiFileFormat = MidiFileFormat.SingleTrackMultiChannel): void {
        if (!this.score) {
            return;
        }

        const midiFile: MidiFile = new MidiFile();
        midiFile.format = format;
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile, true);
        const generator: MidiFileGenerator = new MidiFileGenerator(this.score, this.settings, handler);
        generator.generate();
        const binary: Uint8Array = midiFile.toBinary();
        const fileName: string = !this.score.title ? 'File.mid' : `${this.score.title}.mid`;
        const dlLink: HTMLAnchorElement = document.createElement('a');
        dlLink.download = fileName;
        const blob: Blob = new Blob([binary], {
            type: 'audio/midi'
        });
        const url: string = URL.createObjectURL(blob);
        dlLink.href = url;
        dlLink.style.display = 'none';
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }

    /**
     * @inheritdoc
     */
    public override changeTrackMute(tracks: Track[], mute: boolean): void {
        const trackList: Track[] = this.trackIndexesToTracks((this.uiFacade as BrowserUiFacade).parseTracks(tracks));
        super.changeTrackMute(trackList, mute);
    }

    /**
     * @inheritdoc
     */
    public override changeTrackSolo(tracks: Track[], solo: boolean): void {
        const trackList: Track[] = this.trackIndexesToTracks((this.uiFacade as BrowserUiFacade).parseTracks(tracks));
        super.changeTrackSolo(trackList, solo);
    }

    /**
     * @inheritdoc
     */
    public override changeTrackVolume(tracks: Track[], volume: number): void {
        const trackList: Track[] = this.trackIndexesToTracks((this.uiFacade as BrowserUiFacade).parseTracks(tracks));
        super.changeTrackVolume(trackList, volume);
    }

    private trackIndexesToTracks(trackIndexes: number[]): Track[] {
        if (!this.score) {
            return [];
        }
        const tracks: Track[] = [];
        if (trackIndexes.length === 1 && trackIndexes[0] === -1) {
            for (const track of this.score.tracks) {
                tracks.push(track);
            }
        } else {
            for (const index of trackIndexes) {
                if (index >= 0 && index < this.score.tracks.length) {
                    tracks.push(this.score.tracks[index]);
                }
            }
        }
        return tracks;
    }

    /**
     * This event is fired when the SoundFont is being loaded.
     * @remarks
     * This event is fired when the SoundFont is being loaded and reports the progress accordingly.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.soundFontLoad.on((e) => {
     *     updateProgress(e.loaded, e.total);
     * });
     * ```
     */
    public readonly soundFontLoad: IEventEmitterOfT<ProgressEventArgs> = new EventEmitterOfT<ProgressEventArgs>();

    /**
     * Triggers a load of the soundfont from the given URL.
     * @param url The URL from which to load the soundfont
     * @param append Whether to fully replace or append the data from the given soundfont.
     * @category Methods - Player
     * @since 0.9.4
     */
    public loadSoundFontFromUrl(url: string, append: boolean): void {
        const player = this.player;
        if (!player) {
            return;
        }

        Logger.debug('AlphaSynth', `Start loading Soundfont from url ${url}`);
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', url, true, null, null);
        request.responseType = 'arraybuffer';
        request.onload = _ => {
            const buffer: Uint8Array = new Uint8Array(request.response);
            this.loadSoundFont(buffer, append);
        };
        request.onerror = e => {
            Logger.error('AlphaSynth', `Loading failed: ${(e as any).message}`);
            (player.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(
                new FileLoadError((e as any).message, request)
            );
        };
        request.onprogress = e => {
            Logger.debug('AlphaSynth', `Soundfont downloading: ${e.loaded}/${e.total} bytes`);
            const args = new ProgressEventArgs(e.loaded, e.total);
            (this.soundFontLoad as EventEmitterOfT<ProgressEventArgs>).trigger(args);
            this.uiFacade.triggerEvent(this.container, 'soundFontLoad', args);
        };
        request.send();
    }
}
