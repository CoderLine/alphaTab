import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';

import { MidiFile } from '@src/midi/MidiFile';

import type {
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    MidiEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    TimeSignatureEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    AlphaTabMetronomeEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    AlphaTabRestEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    NoteOnEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    NoteOffEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    ControlChangeEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    ProgramChangeEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    TempoChangeEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    PitchBendEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    NoteBendEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    EndOfTrackEvent
} from '@src/midi/MidiEvent';

import type {
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    MetaEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    MetaDataEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    MetaNumberEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    Midi20PerNotePitchBendEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    SystemCommonEvent,
    // biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
    SystemExclusiveEvent
} from '@src/midi/DeprecatedEvents';

import {
    type MidiTickLookup,
    type MidiTickLookupFindBeatResult,
    MidiTickLookupFindBeatResultCursorMode
} from '@src/midi/MidiTickLookup';
import type { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import type { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import type { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { Environment } from '@src/Environment';
import { EventEmitter, type IEventEmitter, type IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';

import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

import type { Beat } from '@src/model/Beat';
import type { Score } from '@src/model/Score';
import type { Track } from '@src/model/Track';

import type { IContainer } from '@src/platform/IContainer';
import type { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import type { IUiFacade } from '@src/platform/IUiFacade';
import { PlayerMode, ScrollMode } from '@src/PlayerSettings';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';

import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';

import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';

import type { Bounds } from '@src/rendering/utils/Bounds';
import type { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import type { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import type { StaffSystemBounds } from '@src/rendering/utils/StaffSystemBounds';
import { ResizeEventArgs } from '@src/ResizeEventArgs';
import type { Settings } from '@src/Settings';

import { Logger } from '@src/Logger';
import { ModelUtils } from '@src/model/ModelUtils';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import type { Note } from '@src/model/Note';
import type { MidiEventType } from '@src/midi/MidiEvent';
import type { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import type { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';
import { ActiveBeatsChangedEventArgs } from '@src/synth/ActiveBeatsChangedEventArgs';
import type { BeatTickLookupItem } from '@src/midi/BeatTickLookup';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';

// biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
import type { CoreSettings } from '@src/CoreSettings';
import { ExternalMediaPlayer } from '@src/synth/ExternalMediaPlayer';
import { AlphaSynthWrapper } from '@src/synth/AlphaSynthWrapper';
import { ScoreRendererWrapper } from '@src/rendering/ScoreRendererWrapper';
import { AudioExportOptions, type IAudioExporter, type IAudioExporterWorker } from '@src/synth/IAudioExporter';

class SelectionInfo {
    public beat: Beat;
    public bounds: BeatBounds | null = null;

    public constructor(beat: Beat) {
        this.beat = beat;
    }
}

/**
 * This class represents the public API of alphaTab and provides all logic to display
 * a music sheet in any UI using the given {@link IUiFacade}
 * @param <TSettings> The UI object holding the settings.
 * @csharp_public
 */
export class AlphaTabApiBase<TSettings> {
    private _startTime: number = 0;
    private _trackIndexes: number[] | null = null;
    private _trackIndexLookup: Set<number> | null = null;
    private _isDestroyed: boolean = false;
    private _score: Score | null = null;
    private _tracks: Track[] = [];
    private _actualPlayerMode: PlayerMode = PlayerMode.Disabled;
    private _player!: AlphaSynthWrapper;
    private _renderer: ScoreRendererWrapper;

    /**
     * The actual player mode which is currently active.
     * @remarks
     * Allows determining whether a backing track or the synthesizer is active in case automatic detection is enabled.
     * @category Properties - Player
     * @since 1.6.0
     */
    public get actualPlayerMode(): PlayerMode {
        return this._actualPlayerMode;
    }

    /**
     * The UI facade used for interacting with the user interface (like the browser).
     * @remarks
     * The implementation depends on the platform alphaTab is running in (e.g. the web version in the browser, WPF in .net etc.)
     * @category Properties - Core
     * @since 0.9.4
     */
    public readonly uiFacade: IUiFacade<TSettings>;

    /**
     * The UI container that holds the whole alphaTab control.
     * @remarks
     * Gets the UI container that represents the element on which alphaTab was initialized. Note that this is not the raw instance, but a UI framework specific wrapper for alphaTab.
     * @category Properties - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * const container = api.container;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * var container = api.Container;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * val container = api.container;
     * ```
     */
    public readonly container: IContainer;

    /**
     * The score renderer used for rendering the music sheet.
     * @remarks
     * This is the low-level API responsible for the actual rendering engine.
     * Gets access to the underling {@link IScoreRenderer} that is used for the rendering.
     *
     * @category Properties - Core
     * @since 0.9.4
     */
    public get renderer(): IScoreRenderer {
        return this._renderer;
    }

    /**
     * The score holding all information about the song being rendered
     * @category Properties - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * updateScoreInfo(api.score);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * UpdateScoreInfo(api.Score);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * updateScoreInfo(api.score)
     * ```
     */
    public get score(): Score | null {
        return this._score;
    }

    /**
     * The settings that are used for rendering the music notation.
     * @remarks
     * Gets access to the underling {@link Settings} object that is currently used by alphaTab.
     *
     * @category Properties - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * showSettingsModal(api.settings);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * ShowSettingsDialog(api.Settings);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * showSettingsDialog(api.settings)
     * ```
     */
    public settings!: Settings;

    /**
     * The list of the tracks that are currently rendered.
     *
     * @category Properties - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * highlightCurrentTracksInTrackSelector(api.tracks);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * HighlightCurrentTracksInTrackSelector(api.Tracks);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * highlightCurrentTracksInTrackSelector(api.tracks)
     * ```
     */
    public get tracks(): Track[] {
        return this._tracks;
    }

    /**
     * The UI container that will hold all rendered results.
     * @since 0.9.4
     * @category Properties - Core
     */
    public readonly canvasElement: IContainer;

    /**
     * Initializes a new instance of the {@link AlphaTabApiBase} class.
     * @param uiFacade The UI facade to use for interacting with the user interface.
     * @param settings The UI settings object to use for loading the settings.
     */
    public constructor(uiFacade: IUiFacade<TSettings>, settings: TSettings) {
        this.uiFacade = uiFacade;
        this.container = uiFacade.rootContainer;

        this.activeBeatsChanged = new EventEmitterOfT<ActiveBeatsChangedEventArgs>(() => {
            if (this._player.state === PlayerState.Playing && this._currentBeat) {
                return new ActiveBeatsChangedEventArgs(this._currentBeat!.beatLookup.highlightedBeats.map(h => h.beat));
            }
            return null;
        });
        this.playedBeatChanged = new EventEmitterOfT<Beat>(() => {
            if (this._player.state === PlayerState.Playing && this._currentBeat) {
                return this._currentBeat.beat;
            }
            return null;
        });
        this.scoreLoaded = new EventEmitterOfT<Score>(() => {
            if (this._score) {
                return this._score;
            }
            return null;
        });

        this.midiLoaded = new EventEmitterOfT<PositionChangedEventArgs>(() => {
            return this._player.loadedMidiInfo ?? null;
        });

        uiFacade.initialize(this, settings);
        Logger.logLevel = this.settings.core.logLevel;

        this.settings.handleBackwardsCompatibility();

        Environment.printEnvironmentInfo(false);

        this.canvasElement = uiFacade.createCanvasElement();
        this.container.appendChild(this.canvasElement);
        this._renderer = new ScoreRendererWrapper();
        if (
            this.settings.core.useWorkers &&
            this.uiFacade.areWorkersSupported &&
            Environment.getRenderEngineFactory(this.settings.core.engine).supportsWorkers
        ) {
            this._renderer.instance = this.uiFacade.createWorkerRenderer();
        } else {
            this._renderer.instance = new ScoreRenderer(this.settings);
        }

        this.container.resize.on(
            Environment.throttle(() => {
                if (this._isDestroyed) {
                    return;
                }
                if (this.container.width !== this._renderer.width) {
                    this.triggerResize();
                }
            }, uiFacade.resizeThrottle)
        );
        const initialResizeEventInfo: ResizeEventArgs = new ResizeEventArgs();
        initialResizeEventInfo.oldWidth = this._renderer.width;
        initialResizeEventInfo.newWidth = this.container.width | 0;
        initialResizeEventInfo.settings = this.settings;
        this.onResize(initialResizeEventInfo);
        this._renderer.preRender.on(this.onRenderStarted.bind(this));
        this._renderer.renderFinished.on(renderingResult => {
            this.onRenderFinished(renderingResult);
        });
        this._renderer.postRenderFinished.on(() => {
            const duration: number = Date.now() - this._startTime;
            Logger.debug('rendering', `Rendering completed in ${duration}ms`);
            this.onPostRenderFinished();
        });
        this._renderer.preRender.on(_ => {
            this._startTime = Date.now();
        });
        this._renderer.partialLayoutFinished.on(r => this.appendRenderResult(r, false));
        this._renderer.partialRenderFinished.on(this.updateRenderResult.bind(this));
        this._renderer.renderFinished.on(r => {
            this.appendRenderResult(r, true);
        });
        this._renderer.error.on(this.onError.bind(this));
        this.setupPlayerWrapper();
        if (this.settings.player.playerMode !== PlayerMode.Disabled) {
            this.setupOrDestroyPlayer();
        }
        this.setupClickHandling();
        // delay rendering to allow ui to hook up with events first.
        this.uiFacade.beginInvoke(() => {
            this.uiFacade.initialRender();
        });
    }

    private setupPlayerWrapper() {
        const player = new AlphaSynthWrapper();
        this._player = player;
        player.ready.on(() => {
            this.loadMidiForScore();
        });
        player.readyForPlayback.on(() => {
            this.onPlayerReady();
            if (this.tracks) {
                for (const track of this.tracks) {
                    const volume: number = track.playbackInfo.volume / 16;
                    player.setChannelVolume(track.playbackInfo.primaryChannel, volume);
                    player.setChannelVolume(track.playbackInfo.secondaryChannel, volume);
                }
            }
        });
        player.soundFontLoaded.on(this.onSoundFontLoaded.bind(this));
        player.soundFontLoadFailed.on(e => {
            this.onError(e);
        });
        player.midiLoaded.on(this.onMidiLoaded.bind(this));
        player.midiLoadFailed.on(e => {
            this.onError(e);
        });
        player.stateChanged.on(this.onPlayerStateChanged.bind(this));
        player.positionChanged.on(this.onPlayerPositionChanged.bind(this));
        player.midiEventsPlayed.on(this.onMidiEventsPlayed.bind(this));
        player.playbackRangeChanged.on(this.onPlaybackRangeChanged.bind(this));
        player.finished.on(this.onPlayerFinished.bind(this));
    }

    /**
     * Destroys the alphaTab control and restores the initial state of the UI.
     * @remarks
     * This function destroys the alphaTab control and tries to restore the initial state of the UI. This might be useful if
     * our website is quite dynamic and you need to uninitialize alphaTab from an element again. After destroying alphaTab
     * it cannot be used anymore. Any further usage leads to unexpected behavior.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.destroy();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Destroy();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.destroy()
     * ```
     */
    public destroy(): void {
        this._isDestroyed = true;
        this._player.destroy();
        this.uiFacade.destroy();
        this._renderer.destroy();
    }

    /**
     * Applies any changes that were done to the settings object.
     * @remarks
     * It also informs the {@link renderer} about any new values to consider.
     * By default alphaTab will not trigger any re-rendering or settings update just if the settings object itself was changed. This method must be called
     * to trigger an update of the settings in all components. Then a re-rendering can be initiated using the {@link render} method.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.settings.display.scale = 2.0;
     * api.updateSettings();
     * api.render();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     *
     * api.Settings.Display.Scale = 2.0;
     * api.UpdateSettings();
     * api.Render()
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     *
     * api.settings.display.scale = 2.0
     * api.updateSettings()
     * api.render()
     * ```
     */
    public updateSettings(): void {
        this.settings.handleBackwardsCompatibility();

        const score = this.score;
        if (score) {
            ModelUtils.applyPitchOffsets(this.settings, score);
        }

        this.updateRenderer();

        this._renderer.updateSettings(this.settings);
        this.setupOrDestroyPlayer();

        this.onSettingsUpdated();
    }

    private updateRenderer() {
        const renderer = this._renderer;
        if (
            this.settings.core.useWorkers &&
            this.uiFacade.areWorkersSupported &&
            Environment.getRenderEngineFactory(this.settings.core.engine).supportsWorkers
        ) {
            // switch from non-worker to worker renderer
            if (renderer.instance instanceof ScoreRenderer) {
                renderer.destroy();
                renderer.instance = this.uiFacade.createWorkerRenderer();
            }
        } else {
            // switch from worker to non-worker renderer
            if (!(renderer.instance instanceof ScoreRenderer)) {
                renderer.destroy();
                renderer.instance = new ScoreRenderer(this.settings);
            }
        }
    }

    /**
     * Initiates a load of the score using the given data.
     * @returns true if the data object is supported and a load was initiated, otherwise false
     * @param scoreData The data container supported by {@link IUiFacade}.  The supported types is depending on the platform:
     *
     * * A `alphaTab.model.Score` instance (all platforms)
     * * A `ArrayBuffer` or `Uint8Array` containing one of the supported file formats (all platforms, native byte array or input streams on other platforms)
     * * A url from where to download the binary data of one of the supported file formats (browser only)
     *
     * @param trackIndexes The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
     * song will be shown.
     * @category Methods - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.load('/assets/MyFile.gp');
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Load(System.IO.File.OpenRead("MyFile.gp"));
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * contentResolver.openInputStream(uri).use {
     *     api.load(it)
     * }
     * ```
     */
    public load(scoreData: unknown, trackIndexes?: number[]): boolean {
        try {
            return this.uiFacade.load(
                scoreData,
                score => {
                    this.renderScore(score, trackIndexes);
                },
                error => {
                    this.onError(error);
                }
            );
        } catch (e) {
            this.onError(e as Error);
            return false;
        }
    }

    /**
     * Initiates a rendering of the given score.
     * @param score The score containing the tracks to be rendered.
     * @param trackIndexes The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
     * song will be shown.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.RenderScore(generateScore(),[ 2, 3 ]);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.RenderScore(GenerateScore(), new double[] { 2, 3 });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.renderScore(generateScore(), alphaTab.collections.DoubleList(2, 3));
     * ```
     */
    public renderScore(score: Score, trackIndexes?: number[]): void {
        const tracks: Track[] = [];
        if (!trackIndexes) {
            if (score.tracks.length > 0) {
                tracks.push(score.tracks[0]);
            }
        } else {
            if (trackIndexes.length === 0) {
                if (score.tracks.length > 0) {
                    tracks.push(score.tracks[0]);
                }
            } else if (trackIndexes.length === 1 && trackIndexes[0] === -1) {
                for (const track of score.tracks) {
                    tracks.push(track);
                }
            } else {
                for (const index of trackIndexes) {
                    if (index >= 0 && index <= score.tracks.length) {
                        tracks.push(score.tracks[index]);
                    }
                }
            }
        }
        this.internalRenderTracks(score, tracks);
    }

    /**
     * Renders the given list of tracks.
     * @param tracks The tracks to render. They must all belong to the same score.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.renderTracks([api.score.tracks[0], api.score.tracks[1]]);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.RenderTracks(new []{
     *     api.Score.Tracks[2],
     *     api.Score.Tracks[3]
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.renderTracks(alphaTab.collections.List(
     *     api.score.tracks[2],
     *     api.score.tracks[3]
     * }
     * ```
     */
    public renderTracks(tracks: Track[]): void {
        if (tracks.length > 0) {
            const score: Score = tracks[0].score;
            for (const track of tracks) {
                if (track.score !== score) {
                    this.onError(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            'All rendered tracks must belong to the same score.'
                        )
                    );
                    return;
                }
            }
            this.internalRenderTracks(score, tracks);
        }
    }

    private internalRenderTracks(score: Score, tracks: Track[]): void {
        ModelUtils.applyPitchOffsets(this.settings, score);
        if (score !== this.score) {
            this._score = score;
            this._tracks = tracks;
            this._tickCache = null;
            this._trackIndexes = [];
            for (const track of tracks) {
                this._trackIndexes.push(track.index);
            }
            this._trackIndexLookup = new Set<number>(this._trackIndexes);
            this.onScoreLoaded(score);
            this.loadMidiForScore();
            this.render();
        } else {
            this._tracks = tracks;

            const startIndex = ModelUtils.computeFirstDisplayedBarIndex(score, this.settings);
            const endIndex = ModelUtils.computeLastDisplayedBarIndex(score, this.settings, startIndex);
            if (this._tickCache) {
                this._tickCache.multiBarRestInfo = ModelUtils.buildMultiBarRestInfo(this.tracks, startIndex, endIndex);
            }

            this._trackIndexes = [];
            for (const track of tracks) {
                this._trackIndexes.push(track.index);
            }
            this._trackIndexLookup = new Set<number>(this._trackIndexes);

            this.render();
        }
    }

    /**
     * @internal
     */
    private triggerResize(): void {
        if (!this.container.isVisible) {
            Logger.warning(
                'Rendering',
                'AlphaTab container was invisible while autosizing, waiting for element to become visible',
                null
            );
            this.uiFacade.rootContainerBecameVisible.on(() => {
                Logger.debug('Rendering', 'AlphaTab container became visible, doing autosizing', null);
                this.triggerResize();
            });
        } else {
            const resizeEventInfo: ResizeEventArgs = new ResizeEventArgs();
            resizeEventInfo.oldWidth = this._renderer.width;
            resizeEventInfo.newWidth = this.container.width;
            resizeEventInfo.settings = this.settings;
            this.onResize(resizeEventInfo);
            this._renderer.updateSettings(this.settings);
            this._renderer.width = this.container.width;
            this._renderer.resizeRender();
        }
    }

    private appendRenderResult(result: RenderFinishedEventArgs, isLast: boolean): void {
        // resizing the canvas and wrapper elements at the end is enough
        // it avoids flickering on resizes and re-renders.
        // the individual partials are anyhow sized correctly
        if (isLast) {
            this.canvasElement.width = result.totalWidth;
            this.canvasElement.height = result.totalHeight;
            if (this._cursorWrapper) {
                this._cursorWrapper.width = result.totalWidth;
                this._cursorWrapper.height = result.totalHeight;
            }
        }

        if (result.width > 0 || result.height > 0) {
            this.uiFacade.beginAppendRenderResults(result);
        }

        if (isLast) {
            this.uiFacade.beginAppendRenderResults(null);
        }
    }

    private updateRenderResult(result: RenderFinishedEventArgs | null): void {
        if (result && result.renderResult) {
            this.uiFacade.beginUpdateRenderResults(result);
        }
    }

    /**
     * Tells alphaTab to render the given alphaTex.
     * @param tex The alphaTex code to render.
     * @param tracks If set, the given tracks will be rendered, otherwise the first track only will be rendered.
     * @category Methods - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.tex("\\title 'Test' . 3.3.4");
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Tex("\\title 'Test' . 3.3.4");
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.tex("\\title 'Test' . 3.3.4");
     * ```
     */
    public tex(tex: string, tracks?: number[]): void {
        try {
            const parser: AlphaTexImporter = new AlphaTexImporter();
            parser.logErrors = true;
            parser.initFromString(tex, this.settings);
            const score: Score = parser.readScore();
            this.renderScore(score, tracks);
        } catch (e) {
            this.onError(e as Error);
        }
    }

    /**
     * Triggers a load of the soundfont from the given data.
     * @remarks
     * AlphaTab only supports SoundFont2 and SoundFont3 {@since 1.4.0} encoded soundfonts for loading. To load a soundfont the player must be enabled in advance.
     *
     * @param data The data object to decode. The supported data types is depending on the platform.
     *
     * * A `ArrayBuffer` or `Uint8Array` (all platforms, native byte array or input streams on other platforms)
     * * A url from where to download the binary data of one of the supported file formats (browser only)
     *
     * @param append Whether to fully replace or append the data from the given soundfont.
     * @returns `true` if the passed in object is a supported format and loading was initiated, otherwise `false`.
     *
     * @category Methods - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.loadSoundFont('/assets/MyFile.sf2');
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.LoadSoundFont(System.IO.File.OpenRead("MyFile.sf2"));
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * contentResolver.openInputStream(uri).use {
     *     api.loadSoundFont(it)
     * }
     * ```
     */
    public loadSoundFont(data: unknown, append: boolean = false): boolean {
        return this.uiFacade.loadSoundFont(data, append);
    }

    /**
     * Unloads all presets from previously loaded SoundFonts.
     * @remarks
     * This function resets the player internally to not have any SoundFont loaded anymore. This allows you to reduce the memory usage of the page
     * if multiple partial SoundFonts are loaded via `loadSoundFont(..., true)`. Depending on the workflow you might also just want to use `loadSoundFont(..., false)` once
     * instead of unloading the previous SoundFonts.
     *
     * @category Methods - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.loadSoundFont('/assets/guitars.sf2', true);
     * api.loadSoundFont('/assets/pianos.sf2', true);
     * // ..
     * api.resetSoundFonts();
     * api.loadSoundFont('/assets/synths.sf2', true);
     * ```
     *
     * @example
     * C#
     * ```cs
     *var api = new AlphaTabApi<MyControl>(...);
     *api.LoadSoundFont(System.IO.File.OpenRead("guitars.sf2"), true);
     *api.LoadSoundFont(System.IO.File.OpenRead("pianos.sf2"), true);
     *...
     *api.ResetSoundFonts();
     *api.LoadSoundFont(System.IO.File.OpenRead("synths.sf2"), true);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.loadSoundFont(readResource("guitars.sf2"), true)
     * api.loadSoundFont(readResource("pianos.sf2"), true)
     * ...
     * api.resetSoundFonts()
     * api.loadSoundFont(readResource("synths.sf2"), true)
     * ```
     */
    public resetSoundFonts(): void {
        this._player.resetSoundFonts();
    }

    /**
     * Initiates a re-rendering of the current setup.
     * @remarks
     * If rendering is not yet possible, it will be deferred until the UI changes to be ready for rendering.
     *
     * @category Methods - Core
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.render();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Render();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.render()
     * ```
     */
    public render(): void {
        if (this.uiFacade.canRender) {
            // when font is finally loaded, start rendering
            this._renderer.width = this.container.width;
            this._renderer.renderScore(this.score, this._trackIndexes);
        } else {
            this.uiFacade.canRenderChanged.on(() => this.render());
        }
    }

    private _tickCache: MidiTickLookup | null = null;

    /**
     * The tick cache allowing lookup of midi ticks to beats.
     * @remarks
     * Gets the tick cache allowing lookup of midi ticks to beats. If the player is enabled, a midi file will be generated
     * for the loaded {@link Score} for later playback. During this generation this tick cache is filled with the
     * exact midi ticks when beats are played.
     *
     * The {@link MidiTickLookup.findBeat} method allows a lookup of the beat related to a given input midi tick.
     *
     * @category Properties - Player
     * @since 1.2.3
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * const lookupResult = api.tickCache.findBeat(new Set([0, 1]), 100);
     * const currentBeat = lookupResult?.currentBeat;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * var lookupResult = api.TickCache.FindBeat(new AlphaTab.Core.EcmaScript.Set(0, 1), 100);
     * var currentBeat = lookupResult?.CurrentBeat;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * val lookupResult = api.tickCache.findBeat(alphaTab.core.ecmaScript.Set(0, 1), 100);
     * val currentBeat = lookupResult?.CurrentBeat;
     * ```
     */
    public get tickCache(): MidiTickLookup | null {
        return this._tickCache;
    }

    /**
     * The tick cache allowing lookup of midi ticks to beats.
     * @remarks
     * In older versions of alphaTab you can access the `boundsLookup` via {@link IScoreRenderer.boundsLookup} on {@link renderer}.
     *
     * After the rendering completed alphaTab exposes via this lookup the location of the individual
     * notation elements. The lookup provides fast access to the bars and beats at a given location.
     * If the {@link CoreSettings.includeNoteBounds} option was activated also the location of the individual notes can be obtained.
     *
     * The property contains a `BoundsLookup` instance which follows a hierarchical structure that represents
     * the tree of rendered elements.
     *
     * The hierarchy is: `staffSystems > bars(1) > bars(2) > beats > notes`
     *
     * * `staffSystems` - Represent the bounds of the individual systems ("rows") where staves are contained.
     * * `bars(1)` - Represent the bounds of all bars for a particular master bar across all tracks.
     * * `bars(2)` - Represent the bounds of an individual bar of a track. The bounds on y-axis span the region of the staff and notes might exceed this bounds.
     * * `beats` - Represent the bounds of the individual beats within a track. The bounds on y-axis are equal to the bar bounds.
     * * `notes` - Represent the bounds of the individual note heads/numbers within a track.
     *
     * Each bounds hierarchy have a `visualBounds` and `realBounds`.
     *
     * * `visualBounds` - Represent the area covering all visually visible elements
     * * `realBounds` - Represents the actual bounds of the elements in this beat including whitespace areas.
     * * `noteHeadBounds` (only on `notes` level) - Represents the area of the note heads or number based on the staff
     *
     * You can check out the individual sizes and regions.
     * @category Properties - Core
     * @since 1.5.0
     */
    public get boundsLookup() {
        return this._renderer.boundsLookup;
    }

    /**
     * The alphaSynth player used for playback.
     * @remarks
     * This is the low-level API to the Midi synthesizer used for playback.
     * Gets access to the underling {@link IAlphaSynth} that is used for the audio playback.
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * setupPlayerEvents(api.settings);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * SetupPlayerEvents(api.Player);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * setupPlayerEvents(api.player)
     * ```
     */
    public get player(): IAlphaSynth | null {
        return this._player.instance ? this._player : null;
    }

    /**
     * Whether the player is ready for starting the playback.
     * @remarks
     * Gets whether the synthesizer is ready for playback. The player is ready for playback when
     * all background workers are started, the audio output is initialized, a soundfont is loaded, and a song was loaded into the player as midi file.
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * if(api.isReadyForPlayback)) api.play();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * if(api.IsReadyForPlayback) api.Play();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * if (api.isReadyForPlayback) api.play()
     * ```
     */
    public get isReadyForPlayback(): boolean {
        return this._player.isReadyForPlayback;
    }

    /**
     * The current player state.
     * @remarks
     * Gets the current player state, meaning whether it is paused or playing.
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * if(api.playerState != alphaTab.synth.PlayerState.Playing) api.play();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * if(api.PlayerState != PlayerState.Playing) api.Play();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * if (api.playerState != PlayerState.Playing) api.play()
     * ```
     */
    public get playerState(): PlayerState {
        return this._player.state;
    }

    /**
     * The current master volume as percentage (0-1).
     * @remarks
     * Gets or sets the master volume of the overall audio being played. The volume is annotated in percentage where 1.0 would be the normal volume and 0.5 only 50%.
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.masterVolume = 0.5;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MasterVolume = 0.5;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.masterVolume = 0.5
     * ```
     */
    public get masterVolume(): number {
        return this._player.masterVolume;
    }

    public set masterVolume(value: number) {
        this._player.masterVolume = value;
    }

    /**
     * The metronome volume as percentage (0-1).
     * @remarks
     * Gets or sets the volume of the metronome. By default the metronome is disabled but can be enabled by setting the volume different.
     * @category Properties - Player
     * @defaultValue `0`
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.metronomeVolume = 0.5;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MetronomeVolume = 0.5;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.metronomeVolume = 0.5
     * ```
     */
    public get metronomeVolume(): number {
        return this._player.metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        this._player.metronomeVolume = value;
    }

    /**
     * The volume of the count-in metronome ticks.
     * @remarks
     * Gets or sets the volume of the metronome during the count-in of the song. By default the count-in is disabled but can be enabled by setting the volume different.
     * @category Properties - Player
     * @since 1.1.0
     * @defaultValue `0`
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.countInVolume = 0.5;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.CountInVolume = 0.5;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.countInVolume = 0.5
     * ```
     */
    public get countInVolume(): number {
        return this._player.countInVolume;
    }

    public set countInVolume(value: number) {
        this._player.countInVolume = value;
    }

    /**
     * The midi events which will trigger the `midiEventsPlayed` event
     * @remarks
     * Gets or sets the midi events which will trigger the `midiEventsPlayed` event. With this filter set you can enable
     * that alphaTab will signal any midi events as they are played by the synthesizer. This allows reacing on various low level
     * audio playback elements like notes/rests played or metronome ticks.
     *
     * Refer to the [related guide](https://alphatab.net/docs/guides/handling-midi-events) to learn more about this feature.
     * @defaultValue `[]`
     * @category Properties - Player
     * @since 1.2.0
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.midiEventsPlayedFilter = [alphaTab.midi.MidiEventType.AlphaTabMetronome];
     * api.midiEventsPlayed.on(function(e) {
     *   for(const midi of e.events) {
     *     if(midi.isMetronome) {
     *       console.log('Metronome tick ' + midi.metronomeNumerator);
     *     }
     *   }
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MidiEventsPlayedFilter = new MidiEventType[] { AlphaTab.Midi.MidiEventType.AlphaTabMetronome };
     * api.MidiEventsPlayed.On(e =>
     * {
     *   foreach(var midi of e.events)
     *   {
     *     if(midi is AlphaTab.Midi.AlphaTabMetronomeEvent metronome)
     *     {
     *       Console.WriteLine("Metronome tick " + metronome.MetronomeNumerator);
     *     }
     *   }
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...);
     * api.midiEventsPlayedFilter = alphaTab.collections.List<alphaTab.midi.MidiEventType>( alphaTab.midi.MidiEventType.AlphaTabMetronome )
     * api.midiEventsPlayed.on { e ->
     *   for (midi in e.events) {
     *     if(midi instanceof alphaTab.midi.AlphaTabMetronomeEvent && midi.isMetronome) {
     *       println("Metronome tick " + midi.tick);
     *     }
     *   }
     * }
     * ```
     */
    public get midiEventsPlayedFilter(): MidiEventType[] {
        return this._player.midiEventsPlayedFilter;
    }

    public set midiEventsPlayedFilter(value: MidiEventType[]) {
        this._player.midiEventsPlayedFilter = value;
    }

    /**
     * The position within the song in midi ticks.
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.tickPosition = 4000;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.TickPosition = 4000;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.tickPosition = 4000
     * ```
     */
    public get tickPosition(): number {
        return this._player.tickPosition;
    }

    public set tickPosition(value: number) {
        this._player.tickPosition = value;
    }

    /**
     * The position within the song in milliseconds
     * @category Properties - Player
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.timePosition = 4000;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.TimePosition = 4000;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.timePosition = 4000
     * ```
     */
    public get timePosition(): number {
        return this._player.timePosition;
    }

    public set timePosition(value: number) {
        this._player.timePosition = value;
    }

    /**
     * The total length of the song in midi ticks.
     * @category Properties - Player
     * @since 1.6.2
     */
    public get endTick(): number {
        return this._player.currentPosition.endTick;
    }

    /**
     * The total length of the song in milliseconds.
     * @category Properties - Player
     * @since 1.6.2
     */
    public get endTime(): number {
        return this._player.currentPosition.endTime;
    }

    /**
     * The range of the song that should be played.
     * @remarks
     * Gets or sets the range of the song that should be played. The range is defined in midi ticks or the whole song is played if the range is set to null
     * @category Properties - Player
     * @defaultValue `null`
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playbackRange = { startTick: 1000, endTick: 50000 };
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlaybackRange = new PlaybackRange { StartTick = 1000, EndTick = 50000 };
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playbackRange = PlaybackRange.apply {
     *     startTick = 1000
     *     endTick = 50000
     * }
     * ```
     */
    public get playbackRange(): PlaybackRange | null {
        return this._player.playbackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        this._player.playbackRange = value;
        this.updateSelectionCursor(value);
    }

    /**
     * The current playback speed as percentage
     * @remarks
     * Controls the current playback speed as percentual value. Normal speed is 1.0 (100%) and 0.5 would be 50%.
     * @category Properties - Player
     * @defaultValue `1`
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playbackSpeed = 0.5;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlaybackSpeed = 0.5;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playbackSpeed = 0.5
     * ```
     */
    public get playbackSpeed(): number {
        return this._player.playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        this._player.playbackSpeed = value;
    }

    /**
     * Whether the playback should automatically restart after it finished.
     * @remarks
     * This setting controls whether the playback should automatically restart after it finished to create a playback loop.
     * @category Properties - Player
     * @defaultValue `false`
     * @since 0.9.4
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.isLooping = true;
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.IsLooping = true;
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.isLooping = true
     * ```
     */
    public get isLooping(): boolean {
        return this._player.isLooping;
    }

    public set isLooping(value: boolean) {
        this._player.isLooping = value;
    }

    private destroyPlayer(): void {
        this._player.destroy();
        this._previousTick = 0;
        this.destroyCursors();
    }

    /**
     *
     * @returns true if a new player was created, false if no player was created (includes destroy & reuse of the current one)
     */
    private setupOrDestroyPlayer(): boolean {
        let mode = this.settings.player.playerMode;
        if (mode === PlayerMode.EnabledAutomatic) {
            const score = this.score;
            if (!score) {
                return false;
            }

            if (score?.backingTrack?.rawAudioFile) {
                mode = PlayerMode.EnabledBackingTrack;
            } else {
                mode = PlayerMode.EnabledSynthesizer;
            }
        }

        let newPlayer: IAlphaSynth | null = null;
        if (mode !== this._actualPlayerMode) {
            this.destroyPlayer();
            this.updateCursors();

            switch (mode) {
                case PlayerMode.Disabled:
                    newPlayer = null;
                    break;
                case PlayerMode.EnabledSynthesizer:
                    newPlayer = this.uiFacade.createWorkerPlayer();
                    break;
                case PlayerMode.EnabledBackingTrack:
                    newPlayer = this.uiFacade.createBackingTrackPlayer();
                    break;
                case PlayerMode.EnabledExternalMedia:
                    newPlayer = new ExternalMediaPlayer(this.settings.player.bufferTimeInMilliseconds);
                    break;
            }
        } else {
            // no change in player mode, just update song info if needed
            this.updateCursors();
            return false;
        }

        this._actualPlayerMode = mode;
        if (!newPlayer) {
            return false;
        }

        this._player.instance = newPlayer;

        return false;
    }

    /**
     * Re-creates the midi for the current score and loads it.
     * @remarks
     * This will result in the player to stop playback. Some setting changes require re-genration of the midi song.
     * @category Methods - Player
     * @since 1.6.0
     */
    public loadMidiForScore(): void {
        if (!this.score) {
            return;
        }

        const score = this.score!;

        Logger.debug('AlphaTab', 'Generating Midi');
        const midiFile: MidiFile = new MidiFile();
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        const generator: MidiFileGenerator = new MidiFileGenerator(score, this.settings, handler);

        const startIndex = ModelUtils.computeFirstDisplayedBarIndex(score, this.settings);
        const endIndex = ModelUtils.computeLastDisplayedBarIndex(score, this.settings, startIndex);
        generator.tickLookup.multiBarRestInfo = ModelUtils.buildMultiBarRestInfo(this.tracks, startIndex, endIndex);

        // we pass the transposition pitches separately to alphaSynth.
        generator.applyTranspositionPitches = false;

        generator.generate();
        this._tickCache = generator.tickLookup;
        this.onMidiLoad(midiFile);

        const player = this._player;
        player.loadMidiFile(midiFile);
        player.loadBackingTrack(score);
        player.updateSyncPoints(generator.syncPoints);
        player.applyTranspositionPitches(generator.transpositionPitches);
    }

    /**
     * Triggers an update of the sync points for the current score after modification within the data model
     * @category Methods - Player
     * @since 1.6.0
     */
    public updateSyncPoints() {
        if (!this.score) {
            return;
        }

        const score = this.score!;
        const player = this._player;
        player.updateSyncPoints(MidiFileGenerator.generateSyncPoints(score));
    }

    /**
     * Changes the volume of the given tracks.
     * @param tracks The tracks for which the volume should be changed.
     * @param volume The volume to set for all tracks in percent (0-1)
     *
     * @remarks
     * This will result in a volume change of the primary and secondary midi channel that the track uses for playback.
     * If the track shares the channels with another track, all related tracks will be changed as they cannot be distinguished.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.changeTrackVolume([api.score.tracks[0], api.score.tracks[1]], 1.5);
     * api.changeTrackVolume([api.score.tracks[2]], 0.5);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ChangeTrackVolume(new Track[] { api.Score.Tracks[0], api.Score.Tracks[1] }, 1.5);
     * api.ChangeTrackVolume(new Track[] { api.Score.Tracks[2] }, 0.5);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...);
     * api.changeTrackVolume(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[0], api.score.tracks[1]), 1.5);
     * api.changeTrackVolume(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[2]), 0.5);
     * ```
     */
    public changeTrackVolume(tracks: Track[], volume: number): void {
        for (const track of tracks) {
            this._player.setChannelVolume(track.playbackInfo.primaryChannel, volume);
            this._player.setChannelVolume(track.playbackInfo.secondaryChannel, volume);
        }
    }

    /**
     * Changes the given tracks to be played solo or not.
     * @param tracks The list of tracks to play solo or not.
     * @param solo If set to true, the tracks will be added to the solo list. If false, they are removed.
     *
     * @remarks
     * If any track is set to solo, all other tracks are muted, unless they are also flagged as solo.
     * This will result in a solo playback of the primary and secondary midi channel that the track uses for playback.
     * If the track shares the channels with another track, all related tracks will be played as they cannot be distinguished.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.changeTrackSolo([api.score.tracks[0], api.score.tracks[1]], true);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ChangeTrackSolo(new Track[] { api.Score.Tracks[0], api.Score.Tracks[1] }, true);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.changeTrackSolo(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[0], api.score.tracks[1]), true);
     * ```
     */
    public changeTrackSolo(tracks: Track[], solo: boolean): void {
        for (const track of tracks) {
            this._player.setChannelSolo(track.playbackInfo.primaryChannel, solo);
            this._player.setChannelSolo(track.playbackInfo.secondaryChannel, solo);
        }
    }

    /**
     * Changes the given tracks to be muted or not.
     * @param tracks The list of track to mute or unmute.
     * @param mute If set to true, the tracks will be muted. If false they are unmuted.
     *
     * @remarks
     * This will result in a muting of the primary and secondary midi channel that the track uses
     * for playback. If the track shares the channels with another track, all tracks will be muted as during playback they cannot be distinguished.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.changeTrackMute([api.score.tracks[0], api.score.tracks[1]], true);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ChangeTrackMute(new Track[] { api.Score.Tracks[0], api.Score.Tracks[1] }, true);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.changeTrackMute(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[0], api.score.tracks[1]), true);
     * ```
     */
    public changeTrackMute(tracks: Track[], mute: boolean): void {
        for (const track of tracks) {
            this._player.setChannelMute(track.playbackInfo.primaryChannel, mute);
            this._player.setChannelMute(track.playbackInfo.secondaryChannel, mute);
        }
    }

    /**
     * Changes the pitch transpose applied to the given tracks.
     * @param tracks The list of tracks to change.
     * @param semitones The number of semitones to apply as pitch offset.
     *
     * @remarks
     * These pitches are additional to the ones applied to the song via the settings and data model and allows a more live-update via a UI.
     * @category Methods - Player
     * @since 1.4.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.changeTrackTranspositionPitch([api.score.tracks[0], api.score.tracks[1]], 3);
     * api.changeTrackTranspositionPitch([api.score.tracks[2]], 2);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ChangeTrackTranspositionPitch(new Track[] { api.Score.Tracks[0], api.Score.Tracks[1] }, 3);
     * api.ChangeTrackTranspositionPitch(new Track[] { api.Score.Tracks[2] }, 3);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...);
     * api.changeTrackTranspositionPitch(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[0], api.score.tracks[1]), 3);
     * api.changeTrackTranspositionPitch(alphaTab.collections.List<alphaTab.model.Track>(api.score.tracks[2]), 2);
     * ```
     */
    public changeTrackTranspositionPitch(tracks: Track[], semitones: number): void {
        for (const track of tracks) {
            this._player.setChannelTranspositionPitch(track.playbackInfo.primaryChannel, semitones);
            this._player.setChannelTranspositionPitch(track.playbackInfo.secondaryChannel, semitones);
        }
    }

    /**
     * Starts the playback of the current song.
     * @returns true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.play();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Play();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.play()
     * ```
     */
    public play(): boolean {
        return this._player.play();
    }

    /**
     * Pauses the playback of the current song.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.pause();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Pause();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.pause();
     * ```
     */
    public pause(): void {
        this._player.pause();
    }

    /**
     * Toggles between play/pause depending on the current player state.
     * @remarks
     * If the player was playing, it will pause. If it is paused, it will initiate a play.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playPause();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayPause();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playPause()
     * ```
     */
    public playPause(): void {
        this._player.playPause();
    }

    /**
     * Stops the playback of the current song, and moves the playback position back to the start.
     * @remarks
     * If a dedicated playback range is selected, it will move the playback position to the start of this range, not the whole song.
     * @category Methods - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.stop();
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Stop();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.stop()
     * ```
     */
    public stop(): void {
        this._player.stop();
    }

    /**
     * Triggers the play of the given beat.
     * @param beat the single beat to play
     * @remarks
     * This will stop the any other current ongoing playback.
     * This method can be used in applications when individual beats need to be played for lesson or editor style purposes.
     * The player will not report any change in state or playback position during the playback of the requested beat.
     * It is a playback of audio separate to the main song playback.
     * @returns true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.
     * @category Methods - Player
     * @since 1.1.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playBeat(api.score.tracks[0].staves[0].bars[0].voices[0].beats[0]);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayBeat(api.Score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0]);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playBeat(api.score.tracks[0].staves[0].bars[0].voices[0].beats[0])
     * ```
     */
    public playBeat(beat: Beat): void {
        // we generate a new midi file containing only the beat
        const midiFile: MidiFile = new MidiFile();
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        const generator: MidiFileGenerator = new MidiFileGenerator(
            beat.voice.bar.staff.track.score,
            this.settings,
            handler
        );
        generator.generateSingleBeat(beat);

        this._player.playOneTimeMidiFile(midiFile);
    }

    /**
     * Triggers the play of the given note.
     * @param note the single note to play
     * @remarks
     * This will stop the any other current ongoing playback.
     * This method can be used in applications when individual notes need to be played for lesson or editor style purposes.
     * The player will not report any change in state or playback position during the playback of the requested note.
     * It is a playback of audio separate to the main song playback.
     * @category Methods - Player
     * @since 1.1.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playNote(api.score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0]);
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayNote(api.Score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playNote(api.score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0]);
     * ```
     */
    public playNote(note: Note): void {
        // we generate a new midi file containing only the beat
        const midiFile: MidiFile = new MidiFile();
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        const generator: MidiFileGenerator = new MidiFileGenerator(
            note.beat.voice.bar.staff.track.score,
            this.settings,
            handler
        );
        generator.generateSingleNote(note);

        this._player.playOneTimeMidiFile(midiFile);
    }

    private _cursorWrapper: IContainer | null = null;
    private _barCursor: IContainer | null = null;
    private _beatCursor: IContainer | null = null;
    private _selectionWrapper: IContainer | null = null;
    private _previousTick: number = 0;
    private _currentBeat: MidiTickLookupFindBeatResult | null = null;
    private _currentBeatBounds: BeatBounds | null = null;
    private _isInitialBeatCursorUpdate = true;
    private _previousStateForCursor: PlayerState = PlayerState.Paused;
    private _previousCursorCache: BoundsLookup | null = null;
    private _lastScroll: number = 0;

    private destroyCursors(): void {
        if (!this._cursorWrapper) {
            return;
        }
        this.uiFacade.destroyCursors();
        this._cursorWrapper = null;
        this._barCursor = null;
        this._beatCursor = null;
        this._selectionWrapper = null;
    }

    private updateCursors() {
        const enable = this.hasCursor;
        if (enable && !this._cursorWrapper) {
            //
            // Create cursors
            const cursors = this.uiFacade.createCursors();
            if (cursors) {
                // store options and created elements for fast access
                this._cursorWrapper = cursors.cursorWrapper;
                this._barCursor = cursors.barCursor;
                this._beatCursor = cursors.beatCursor;
                this._selectionWrapper = cursors.selectionWrapper;
                this._isInitialBeatCursorUpdate = true;
            }
            if (this._currentBeat !== null) {
                this.cursorUpdateBeat(this._currentBeat!, false, this._previousTick > 10, 1, true);
            }
        } else if (!enable && this._cursorWrapper) {
            this.destroyCursors();
        }
    }

    /**
     * updates the cursors to highlight the beat at the specified tick position
     * @param tick
     * @param stop
     * @param shouldScroll whether we should scroll to the bar (if scrolling is active)
     */
    private cursorUpdateTick(
        tick: number,
        stop: boolean,
        cursorSpeed: number,
        shouldScroll: boolean = false,
        forceUpdate: boolean = false
    ): void {
        this._previousTick = tick;

        const cache: MidiTickLookup | null = this._tickCache;
        if (cache) {
            const tracks = this._trackIndexLookup;
            if (tracks != null && tracks.size > 0) {
                const beat: MidiTickLookupFindBeatResult | null = cache.findBeat(tracks, tick, this._currentBeat);
                if (beat) {
                    this.cursorUpdateBeat(
                        beat,
                        stop,
                        shouldScroll,
                        cursorSpeed,
                        forceUpdate || this.playerState === PlayerState.Paused
                    );
                }
            }
        }
    }

    /**
     * updates the cursors to highlight the specified beat
     */
    private cursorUpdateBeat(
        lookupResult: MidiTickLookupFindBeatResult,
        stop: boolean,
        shouldScroll: boolean,
        cursorSpeed: number,
        forceUpdate: boolean = false
    ): void {
        const beat: Beat = lookupResult.beat;
        const nextBeat: Beat | null = lookupResult.nextBeat?.beat ?? null;
        const duration: number = lookupResult.duration;
        const beatsToHighlight = lookupResult.beatLookup.highlightedBeats;

        if (!beat) {
            return;
        }
        const cache: BoundsLookup | null = this._renderer.boundsLookup;
        if (!cache) {
            return;
        }
        const previousBeat = this._currentBeat;
        const previousCache: BoundsLookup | null = this._previousCursorCache;
        const previousState: PlayerState | null = this._previousStateForCursor;
        if (
            !forceUpdate &&
            beat === previousBeat?.beat &&
            cache === previousCache &&
            previousState === this._player.state &&
            previousBeat?.start === lookupResult.start
        ) {
            return;
        }

        const beatBoundings: BeatBounds | null = cache.findBeat(beat);
        if (!beatBoundings) {
            return;
        }

        // only if we really found some bounds we remember the beat and cache we used to
        // actually show the cursor
        this._currentBeat = lookupResult;
        this._previousCursorCache = cache;
        this._previousStateForCursor = this._player.state;

        this.uiFacade.beginInvoke(() => {
            this.internalCursorUpdateBeat(
                beat,
                nextBeat,
                duration,
                stop,
                beatsToHighlight,
                cache!,
                beatBoundings!,
                shouldScroll,
                lookupResult.cursorMode,
                cursorSpeed
            );
        });
    }

    /**
     * Initiates a scroll to the cursor.
     * @since 1.2.3
     * @category Methods - Player
     */
    public scrollToCursor() {
        const beatBounds = this._currentBeatBounds;
        if (beatBounds) {
            this.internalScrollToCursor(beatBounds.barBounds.masterBarBounds);
        }
    }

    private internalScrollToCursor(barBoundings: MasterBarBounds) {
        const scrollElement: IContainer = this.uiFacade.getScrollContainer();
        const isVertical: boolean = Environment.getLayoutEngineFactory(this.settings.display.layoutMode).vertical;
        const mode: ScrollMode = this.settings.player.scrollMode;
        if (isVertical) {
            // when scrolling on the y-axis, we preliminary check if the new beat/bar have
            // moved on the y-axis
            const y: number = barBoundings.realBounds.y + this.settings.player.scrollOffsetY;
            if (y !== this._lastScroll) {
                this._lastScroll = y;
                switch (mode) {
                    case ScrollMode.Continuous:
                        const elementOffset: Bounds = this.uiFacade.getOffset(scrollElement, this.container);
                        this.uiFacade.scrollToY(scrollElement, elementOffset.y + y, this.settings.player.scrollSpeed);
                        break;
                    case ScrollMode.OffScreen:
                        const elementBottom: number =
                            scrollElement.scrollTop + this.uiFacade.getOffset(null, scrollElement).h;
                        if (
                            barBoundings.visualBounds.y + barBoundings.visualBounds.h >= elementBottom ||
                            barBoundings.visualBounds.y < scrollElement.scrollTop
                        ) {
                            const scrollTop: number = barBoundings.realBounds.y + this.settings.player.scrollOffsetY;
                            this.uiFacade.scrollToY(scrollElement, scrollTop, this.settings.player.scrollSpeed);
                        }
                        break;
                }
            }
        } else {
            // when scrolling on the x-axis, we preliminary check if the new bar has
            // moved on the x-axis
            const x: number = barBoundings.visualBounds.x;
            if (x !== this._lastScroll) {
                this._lastScroll = x;
                switch (mode) {
                    case ScrollMode.Continuous:
                        const scrollLeftContinuous: number =
                            barBoundings.realBounds.x + this.settings.player.scrollOffsetX;
                        this._lastScroll = barBoundings.visualBounds.x;
                        this.uiFacade.scrollToX(scrollElement, scrollLeftContinuous, this.settings.player.scrollSpeed);
                        break;
                    case ScrollMode.OffScreen:
                        const elementRight: number =
                            scrollElement.scrollLeft + this.uiFacade.getOffset(null, scrollElement).w;
                        if (
                            barBoundings.visualBounds.x + barBoundings.visualBounds.w >= elementRight ||
                            barBoundings.visualBounds.x < scrollElement.scrollLeft
                        ) {
                            const scrollLeftOffScreen: number =
                                barBoundings.realBounds.x + this.settings.player.scrollOffsetX;
                            this._lastScroll = barBoundings.visualBounds.x;
                            this.uiFacade.scrollToX(
                                scrollElement,
                                scrollLeftOffScreen,
                                this.settings.player.scrollSpeed
                            );
                        }
                        break;
                }
            }
        }
    }

    private internalCursorUpdateBeat(
        beat: Beat,
        nextBeat: Beat | null,
        duration: number,
        stop: boolean,
        beatsToHighlight: BeatTickLookupItem[],
        cache: BoundsLookup,
        beatBoundings: BeatBounds,
        shouldScroll: boolean,
        cursorMode: MidiTickLookupFindBeatResultCursorMode,
        cursorSpeed: number
    ) {
        const barCursor = this._barCursor;
        const beatCursor = this._beatCursor;

        const barBoundings: MasterBarBounds = beatBoundings.barBounds.masterBarBounds;
        const barBounds: Bounds = barBoundings.visualBounds;

        const previousBeatBounds = this._currentBeatBounds;
        this._currentBeatBounds = beatBoundings;

        if (barCursor) {
            barCursor.setBounds(barBounds.x, barBounds.y, barBounds.w, barBounds.h);
        }

        const isPlayingUpdate = this._player.state === PlayerState.Playing && !stop;

        let nextBeatX: number = barBoundings.visualBounds.x + barBoundings.visualBounds.w;
        // get position of next beat on same system
        if (nextBeat && cursorMode === MidiTickLookupFindBeatResultCursorMode.ToNextBext) {
            // if we are moving within the same bar or to the next bar
            // transition to the next beat, otherwise transition to the end of the bar.
            const nextBeatBoundings: BeatBounds | null = cache.findBeat(nextBeat);
            if (
                nextBeatBoundings &&
                nextBeatBoundings.barBounds.masterBarBounds.staffSystemBounds === barBoundings.staffSystemBounds
            ) {
                nextBeatX = nextBeatBoundings.onNotesX;
            }
        }

        let startBeatX = beatBoundings.onNotesX;
        if (beatCursor) {
            // relative positioning of the cursor
            if (this.settings.player.enableAnimatedBeatCursor) {
                const animationWidth = nextBeatX - beatBoundings.onNotesX;
                const relativePosition = this._previousTick - this._currentBeat!.start;
                const ratioPosition =
                    this._currentBeat!.tickDuration > 0 ? relativePosition / this._currentBeat!.tickDuration : 0;
                startBeatX = beatBoundings.onNotesX + animationWidth * ratioPosition;
                duration -= duration * ratioPosition;

                if (isPlayingUpdate) {
                    // we do not "reset" the cursor if we are smoothly moving from left to right.
                    const jumpCursor =
                        !previousBeatBounds ||
                        this._isInitialBeatCursorUpdate ||
                        barBounds.y !== previousBeatBounds.barBounds.masterBarBounds.visualBounds.y ||
                        startBeatX < previousBeatBounds.onNotesX ||
                        barBoundings.index > previousBeatBounds.barBounds.masterBarBounds.index + 1;

                    if (jumpCursor) {
                        beatCursor.transitionToX(0, startBeatX);
                        beatCursor.setBounds(startBeatX, barBounds.y, 1, barBounds.h);
                    }

                    // we need to put the transition to an own animation frame
                    // otherwise the stop animation above is not applied.
                    this.uiFacade.beginInvoke(() => {
                        // it can happen that the cursor reaches the target position slightly too early (especially on backing tracks)
                        // to avoid the cursor stopping, causing a wierd look, we animate the cursor to the double position in double time.
                        // beatCursor!.transitionToX((duration / cursorSpeed), nextBeatX);
                        const factor = cursorMode === MidiTickLookupFindBeatResultCursorMode.ToNextBext ? 2 : 1;
                        const doubleEndBeatX = startBeatX + (nextBeatX - startBeatX) * factor;
                        beatCursor!.transitionToX((duration / cursorSpeed) * factor, doubleEndBeatX);
                    });
                } else {
                    beatCursor.transitionToX(0, startBeatX);
                    beatCursor.setBounds(startBeatX, barBounds.y, 1, barBounds.h);
                }
            } else {
                // ticking cursor
                beatCursor.transitionToX(0, startBeatX);
                beatCursor.setBounds(startBeatX, barBounds.y, 1, barBounds.h);
            }

            this._isInitialBeatCursorUpdate = false;
        } else {
            this._isInitialBeatCursorUpdate = true;
        }

        // if playing, animate the cursor to the next beat
        this.uiFacade.removeHighlights();

        // actively playing? -> animate cursor and highlight items
        let shouldNotifyBeatChange = false;
        if (isPlayingUpdate) {
            if (this.settings.player.enableElementHighlighting) {
                for (const highlight of beatsToHighlight) {
                    const className: string = BeatContainerGlyph.getGroupId(highlight.beat);
                    this.uiFacade.highlightElements(className, beat.voice.bar.index);
                }
            }

            shouldScroll = !stop;
            shouldNotifyBeatChange = true;
        }

        if (shouldScroll && !this._beatMouseDown && this.settings.player.scrollMode !== ScrollMode.Off) {
            this.internalScrollToCursor(barBoundings);
        }

        // trigger an event for others to indicate which beat/bar is played
        if (shouldNotifyBeatChange) {
            this.onPlayedBeatChanged(beat);
            this.onActiveBeatsChanged(new ActiveBeatsChangedEventArgs(beatsToHighlight.map(i => i.beat)));
        }
    }

    /**
     * This event is fired when the played beat changed.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playedBeatChanged.on((beat) => {
     *     updateFretboard(beat);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayedBeatChanged.On(beat =>
     * {
     *     UpdateFretboard(beat);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playedBeatChanged.on { beat ->
     *     updateFretboard(beat)
     * }
     * ```
     *
     */
    public readonly playedBeatChanged: IEventEmitterOfT<Beat>;
    private onPlayedBeatChanged(beat: Beat): void {
        if (this._isDestroyed) {
            return;
        }
        (this.playedBeatChanged as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'playedBeatChanged', beat);
    }

    /**
     * This event is fired when the currently active beats across all tracks change.
     *
     * @remarks
     * Unlike the {@link playedBeatChanged} event this event contains the beats of all tracks and voices independent of them being rendered.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.3
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.activeBeatsChanged.on(args => {
     *    updateHighlights(args.activeBeats);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ActiveBeatsChanged.On(args =>
     * {
     *     UpdateHighlights(args.ActiveBeats);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.activeBeatsChanged.on { args ->
     *     updateHighlights(args.activeBeats)
     * }
     * ```
     *
     */
    public readonly activeBeatsChanged: IEventEmitterOfT<ActiveBeatsChangedEventArgs>;

    private onActiveBeatsChanged(e: ActiveBeatsChangedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        (this.activeBeatsChanged as EventEmitterOfT<ActiveBeatsChangedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'activeBeatsChanged', e);
    }

    private _beatMouseDown: boolean = false;
    private _noteMouseDown: boolean = false;
    private _selectionStart: SelectionInfo | null = null;
    private _selectionEnd: SelectionInfo | null = null;

    /**
     * This event is fired whenever a the user presses the mouse button on a beat.
     * @eventProperty
     * @category Events - Player
     * @since 0.9.7
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.beatMouseDown.on((beat) => {
     *     startSelectionOnBeat(beat);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.BeatMouseDown.On(beat =>
     * {
     *     StartSelectionOnBeat(args);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.beatMouseDown.on { beat ->
     *     startSelectionOnBeat(args)
     * }
     * ```
     */
    public readonly beatMouseDown: IEventEmitterOfT<Beat> = new EventEmitterOfT<Beat>();

    /**
     * This event is fired whenever the user moves the mouse over a beat after the user already pressed the button on a beat.
     * @eventProperty
     * @category Events - Player
     * @since 0.9.7
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.beatMouseMove.on((beat) => {
     *     expandSelectionToBeat(beat);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.BeatMouseMove.On(beat =>
     * {
     *     ExpandSelectionToBeat(beat);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.beatMouseMove.on { beat ->
     *     expandSelectionToBeat(beat)
     * }
     * ```
     */
    public readonly beatMouseMove: IEventEmitterOfT<Beat> = new EventEmitterOfT<Beat>();

    /**
     * This event is fired whenever the user releases the mouse after a mouse press on a beat.
     * @remarks
     * This event is fired regardless of whether the mouse was released on a beat.
     * The parameter is null if the mouse was released somewhere beside the beat.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.7
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.beatMouseUp.on((beat) => {
     *     hideSelection(beat);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.BeatMouseUp.On(beat =>
     * {
     *     HideSelection(beat);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.beatMouseUp.on { beat ->
     *     hideSelection(beat)
     * }
     * ```
     */
    public readonly beatMouseUp: IEventEmitterOfT<Beat | null> = new EventEmitterOfT<Beat | null>();

    /**
     * This event is fired whenever a the user presses the mouse button on a note head/number.
     * @remarks
     * This event is fired whenever a the user presses the mouse button on a note.
     * It is only fired if {@link CoreSettings.includeNoteBounds} was set to `true` because
     * only then this hit detection can be done. A click on a note is considered if the note head or the note number on tabs are clicked as documented in {@link boundsLookup}.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.3
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.noteMouseDown.on((note) => {
     *     api.playNote(note);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.NoteMouseDown.On(note =>
     * {
     *     api.PlayNote(note);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.noteMouseDown.on { note ->
     *     api.playNote(note)
     * }
     * ```
     *
     */
    public readonly noteMouseDown: IEventEmitterOfT<Note> = new EventEmitterOfT<Note>();

    /**
     * This event is fired whenever the user moves the mouse over a note after the user already pressed the button on a note.
     * @remarks
     * This event is fired whenever the user moves the mouse over a note after the user already pressed the button on a note.
     * It is only fired if {@link CoreSettings.includeNoteBounds} was set to `true` because
     * only then this hit detection can be done. A click on a note is considered if the note head or the note number on tabs are clicked as documented in {@link boundsLookup}
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.3
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.noteMouseMove.on((note) => {
     *     changeNote(note)
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.NoteMouseMove.On(note =>
     * {
     *     ChangeNote(note);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.noteMouseMove.on { note ->
     *     changeNote(note)
     * }
     * ```
     *
     */
    public readonly noteMouseMove: IEventEmitterOfT<Note> = new EventEmitterOfT<Note>();

    /**
     * This event is fired whenever the user releases the mouse after a mouse press on a note.
     * @remarks
     * This event is fired whenever a the user presses the mouse button on a note.
     * This event is fired regardless of whether the mouse was released on a note.
     * The parameter is null if the mouse was released somewhere beside the note.
     * It is only fired if {@link CoreSettings.includeNoteBounds} was set to `true` because
     * only then this hit detection can be done. A click on a note is considered if the note head or the note number on tabs are clicked as documented in the {@link boundsLookup}.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.3
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.noteMouseUp.on((note) => {
     *     api.playNote(note);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.NoteMouseUp.On(note =>
     * {
     *     api.PlayNote(note);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.noteMouseUp.on { note ->
     *     api.playNote(note)
     * }
     * ```
     *
     */
    public readonly noteMouseUp: IEventEmitterOfT<Note | null> = new EventEmitterOfT<Note | null>();

    private get hasCursor() {
        return this.settings.player.playerMode !== PlayerMode.Disabled && this.settings.player.enableCursor;
    }

    private onBeatMouseDown(originalEvent: IMouseEventArgs, beat: Beat): void {
        if (this._isDestroyed) {
            return;
        }

        if (this.hasCursor && this.settings.player.enableUserInteraction) {
            this._selectionStart = new SelectionInfo(beat);
            this._selectionEnd = null;
        }
        this._beatMouseDown = true;
        (this.beatMouseDown as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'beatMouseDown', beat, originalEvent);
    }

    private onNoteMouseDown(originalEvent: IMouseEventArgs, note: Note): void {
        if (this._isDestroyed) {
            return;
        }

        this._noteMouseDown = true;
        (this.noteMouseDown as EventEmitterOfT<Note>).trigger(note);
        this.uiFacade.triggerEvent(this.container, 'noteMouseDown', note, originalEvent);
    }

    private onBeatMouseMove(originalEvent: IMouseEventArgs, beat: Beat): void {
        if (this._isDestroyed) {
            return;
        }

        if (this.settings.player.enableUserInteraction) {
            if (!this._selectionEnd || this._selectionEnd.beat !== beat) {
                this._selectionEnd = new SelectionInfo(beat);
                this.cursorSelectRange(this._selectionStart, this._selectionEnd);
            }
        }
        (this.beatMouseMove as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'beatMouseMove', beat, originalEvent);
    }

    private onNoteMouseMove(originalEvent: IMouseEventArgs, note: Note): void {
        if (this._isDestroyed) {
            return;
        }

        (this.noteMouseMove as EventEmitterOfT<Note>).trigger(note);
        this.uiFacade.triggerEvent(this.container, 'noteMouseMove', note, originalEvent);
    }

    private onBeatMouseUp(originalEvent: IMouseEventArgs, beat: Beat | null): void {
        if (this._isDestroyed) {
            return;
        }

        if (this.hasCursor && this.settings.player.enableUserInteraction) {
            if (this._selectionEnd) {
                const startTick: number =
                    this._tickCache?.getBeatStart(this._selectionStart!.beat) ??
                    this._selectionStart!.beat.absolutePlaybackStart;
                const endTick: number =
                    this._tickCache?.getBeatStart(this._selectionEnd!.beat) ??
                    this._selectionEnd!.beat.absolutePlaybackStart;
                if (endTick < startTick) {
                    const t: SelectionInfo = this._selectionStart!;
                    this._selectionStart = this._selectionEnd;
                    this._selectionEnd = t;
                }
            }
            if (this._selectionStart && this._tickCache) {
                // get the start and stop ticks (which consider properly repeats)
                const tickCache: MidiTickLookup = this._tickCache;
                const realMasterBarStart: number = tickCache.getMasterBarStart(
                    this._selectionStart.beat.voice.bar.masterBar
                );
                // move to selection start
                this._currentBeat = null; // reset current beat so it is updating the cursor
                if (this._player.state === PlayerState.Paused) {
                    this.cursorUpdateTick(this._tickCache.getBeatStart(this._selectionStart.beat), false, 1);
                }
                this.tickPosition = realMasterBarStart + this._selectionStart.beat.playbackStart;
                // set playback range
                if (this._selectionEnd && this._selectionStart.beat !== this._selectionEnd.beat) {
                    const realMasterBarEnd: number = tickCache.getMasterBarStart(
                        this._selectionEnd.beat.voice.bar.masterBar
                    );

                    const range = new PlaybackRange();
                    range.startTick = realMasterBarStart + this._selectionStart.beat.playbackStart;
                    range.endTick =
                        realMasterBarEnd +
                        this._selectionEnd.beat.playbackStart +
                        this._selectionEnd.beat.playbackDuration -
                        50;
                    this.playbackRange = range;
                } else {
                    this._selectionStart = null;
                    this.playbackRange = null;
                    this.cursorSelectRange(this._selectionStart, this._selectionEnd);
                }
            }
        }

        (this.beatMouseUp as EventEmitterOfT<Beat | null>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'beatMouseUp', beat, originalEvent);
        this._beatMouseDown = false;
    }

    private onNoteMouseUp(originalEvent: IMouseEventArgs, note: Note | null): void {
        if (this._isDestroyed) {
            return;
        }

        (this.noteMouseUp as EventEmitterOfT<Note | null>).trigger(note);
        this.uiFacade.triggerEvent(this.container, 'noteMouseUp', note, originalEvent);
        this._noteMouseDown = false;
    }

    private updateSelectionCursor(range: PlaybackRange | null) {
        if (!this._tickCache) {
            return;
        }
        if (range) {
            const startBeat = this._tickCache.findBeat(this._trackIndexLookup!, range.startTick);
            const endBeat = this._tickCache.findBeat(this._trackIndexLookup!, range.endTick);
            if (startBeat && endBeat) {
                const selectionStart = new SelectionInfo(startBeat.beat);
                const selectionEnd = new SelectionInfo(endBeat.beat);
                this.cursorSelectRange(selectionStart, selectionEnd);
            }
        } else {
            this.cursorSelectRange(null, null);
        }
    }

    private setupClickHandling(): void {
        this.canvasElement.mouseDown.on(e => {
            if (!e.isLeftMouseButton) {
                return;
            }
            if (this.settings.player.enableUserInteraction) {
                e.preventDefault();
            }
            const relX: number = e.getX(this.canvasElement);
            const relY: number = e.getY(this.canvasElement);
            const beat: Beat | null = this._renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            if (beat) {
                this.onBeatMouseDown(e, beat);

                if (this.settings.core.includeNoteBounds) {
                    const note = this._renderer.boundsLookup?.getNoteAtPos(beat, relX, relY);
                    if (note) {
                        this.onNoteMouseDown(e, note);
                    }
                }
            }
        });
        this.canvasElement.mouseMove.on(e => {
            if (!this._beatMouseDown) {
                return;
            }
            const relX: number = e.getX(this.canvasElement);
            const relY: number = e.getY(this.canvasElement);
            const beat: Beat | null = this._renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            if (beat) {
                this.onBeatMouseMove(e, beat);

                if (this._noteMouseDown) {
                    const note = this._renderer.boundsLookup?.getNoteAtPos(beat, relX, relY);
                    if (note) {
                        this.onNoteMouseMove(e, note);
                    }
                }
            }
        });
        this.canvasElement.mouseUp.on(e => {
            if (!this._beatMouseDown) {
                return;
            }
            if (this.settings.player.enableUserInteraction) {
                e.preventDefault();
            }
            const relX: number = e.getX(this.canvasElement);
            const relY: number = e.getY(this.canvasElement);
            const beat: Beat | null = this._renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            this.onBeatMouseUp(e, beat);

            if (this._noteMouseDown) {
                if (beat) {
                    const note = this._renderer.boundsLookup?.getNoteAtPos(beat, relX, relY) ?? null;
                    this.onNoteMouseUp(e, note);
                } else {
                    this.onNoteMouseUp(e, null);
                }
            }
        });
        this._renderer.postRenderFinished.on(() => {
            if (!this._selectionStart || !this.hasCursor || !this.settings.player.enableUserInteraction) {
                return;
            }
            this.cursorSelectRange(this._selectionStart, this._selectionEnd);
        });
    }

    private cursorSelectRange(startBeat: SelectionInfo | null, endBeat: SelectionInfo | null): void {
        const cache: BoundsLookup | null = this._renderer.boundsLookup;
        if (!cache) {
            return;
        }
        const selectionWrapper: IContainer | null = this._selectionWrapper;
        if (!selectionWrapper) {
            return;
        }

        selectionWrapper.clear();
        if (!startBeat || !endBeat || startBeat.beat === endBeat.beat) {
            return;
        }

        if (!startBeat.bounds) {
            startBeat.bounds = cache.findBeat(startBeat.beat);
        }
        if (!endBeat.bounds) {
            endBeat.bounds = cache.findBeat(endBeat.beat);
        }
        const startTick: number = this._tickCache?.getBeatStart(startBeat.beat) ?? startBeat.beat.absolutePlaybackStart;
        const endTick: number = this._tickCache?.getBeatStart(endBeat.beat) ?? endBeat.beat.absolutePlaybackStart;
        if (endTick < startTick) {
            const t: SelectionInfo = startBeat;
            startBeat = endBeat;
            endBeat = t;
        }
        const startX: number = startBeat.bounds!.realBounds.x;
        let endX: number = endBeat.bounds!.realBounds.x + endBeat.bounds!.realBounds.w;
        if (endBeat.beat.index === endBeat.beat.voice.beats.length - 1) {
            endX =
                endBeat.bounds!.barBounds.masterBarBounds.realBounds.x +
                endBeat.bounds!.barBounds.masterBarBounds.realBounds.w;
        }
        // if the selection goes across multiple staves, we need a special selection highlighting
        if (
            startBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds !==
            endBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds
        ) {
            // from the startbeat to the end of the staff,
            // then fill all staffs until the end-beat staff
            // then from staff-start to the end beat (or to end of bar if it's the last beat)
            const staffStartX: number = startBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds!.visualBounds.x;
            const staffEndX: number =
                startBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds!.visualBounds.x +
                startBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds!.visualBounds.w;
            const startSelection: IContainer = this.uiFacade.createSelectionElement()!;
            startSelection.setBounds(
                startX,
                startBeat.bounds!.barBounds.masterBarBounds.visualBounds.y,
                staffEndX - startX,
                startBeat.bounds!.barBounds.masterBarBounds.visualBounds.h
            );
            selectionWrapper.appendChild(startSelection);
            const staffStartIndex: number = startBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds!.index + 1;
            const staffEndIndex: number = endBeat.bounds!.barBounds.masterBarBounds.staffSystemBounds!.index;
            for (let staffIndex: number = staffStartIndex; staffIndex < staffEndIndex; staffIndex++) {
                const staffBounds: StaffSystemBounds = cache.staffSystems[staffIndex];
                const middleSelection: IContainer = this.uiFacade.createSelectionElement()!;
                middleSelection.setBounds(
                    staffStartX,
                    staffBounds.visualBounds.y,
                    staffEndX - staffStartX,
                    staffBounds.visualBounds.h
                );
                selectionWrapper.appendChild(middleSelection);
            }
            const endSelection: IContainer = this.uiFacade.createSelectionElement()!;
            endSelection.setBounds(
                staffStartX,
                endBeat.bounds!.barBounds.masterBarBounds.visualBounds.y,
                endX - staffStartX,
                endBeat.bounds!.barBounds.masterBarBounds.visualBounds.h
            );
            selectionWrapper.appendChild(endSelection);
        } else {
            // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
            const selection: IContainer = this.uiFacade.createSelectionElement()!;
            selection.setBounds(
                startX,
                startBeat.bounds!.barBounds.masterBarBounds.visualBounds.y,
                endX - startX,
                startBeat.bounds!.barBounds.masterBarBounds.visualBounds.h
            );
            selectionWrapper.appendChild(selection);
        }
    }

    /**
     * This event is fired whenever a new song is loaded.
     * @remarks
     * This event is fired whenever a new song is loaded or changing due to {@link renderScore} or {@link renderTracks} calls.
     * It is fired after the transposition midi pitches from the settings were applied, but before any midi is generated or rendering is started.
     * This allows any modification of the score before further processing.
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.scoreLoaded.on((score) => {
     *     updateSongInformationInUi(score);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.ScoreLoaded.On(score =>
     * {
     *     UpdateSongInformationInUi(score);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.scoreLoaded.on { score ->
     *     updateSongInformationInUi(score)
     * }
     * ```
     *
     */
    public readonly scoreLoaded: IEventEmitterOfT<Score>;
    private onScoreLoaded(score: Score): void {
        if (this._isDestroyed) {
            return;
        }
        (this.scoreLoaded as EventEmitterOfT<Score>).trigger(score);
        this.uiFacade.triggerEvent(this.container, 'scoreLoaded', score);
        if (!this.setupOrDestroyPlayer()) {
            // feed midi into current player (a new player will trigger a midi generation once the player is ready)
            this.loadMidiForScore();
        }
    }

    /**
     * This event is fired when alphaTab was resized and is about to rerender the music notation.
     * @remarks
     * This event is fired when alphaTab was resized and is about to rerender the music notation. Before the re-rendering on resize
     * the settings will be updated in the related components. This means that any changes to the layout options or other display settings are
     * considered. This allows to implement scenarios where maybe the scale or the layout mode dynamically changes along the resizing.
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.resize.on((args) => {
     *     args.settings.scale = args.newWidth > 1300
     *         ? 1.5
     *         : (args.newWidth > 800) ? 1.3 : 1;
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Resize.On(args =>
     * {
     *     args.Settings.Display.Scale = args.NewWidth > 1300
     *         ? 1.5
     *         : (args.NewWidth > 800) ? 1.3 : 1;
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.resize.on { args ->
     *     args.settings.display.scale = args.newWidth > 1300
     *         ? 1.5
     *         : (args.newWidth > 800) ? 1.3 : 1;
     * });
     * ```
     *
     */
    public readonly resize: IEventEmitterOfT<ResizeEventArgs> = new EventEmitterOfT<ResizeEventArgs>();
    private onResize(e: ResizeEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        (this.resize as EventEmitterOfT<ResizeEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'resize', e);
    }

    /**
     * This event is fired when the rendering of the whole music sheet is starting.
     * @remarks
     * All preparations are completed and the layout and render sequence is about to start.
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.renderStarted.on(() => {
     *     updateProgressBar("Rendering");
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.RenderStarted.On(resized =>
     * {
     *     UpdateProgressBar("Rendering");
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.renderStarted.on { resized ->
     *     updateProgressBar("Rendering");
     * }
     * ```
     *
     */
    public readonly renderStarted: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    private onRenderStarted(resize: boolean): void {
        if (this._isDestroyed) {
            return;
        }
        (this.renderStarted as EventEmitterOfT<boolean>).trigger(resize);
        this.uiFacade.triggerEvent(this.container, 'renderStarted', resize);
    }

    /**
     * This event is fired when the rendering of the whole music sheet is finished.
     * @remarks
     * This event is fired when the rendering of the whole music sheet is finished from the render engine side. There might be still tasks open for
     * the display component to visually display the rendered components when this event is notified (e.g. resizing of DOM elements are done).
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.renderFinished.on(() => {
     *     updateProgressBar("Finishing");
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.RenderFinished.On(() =>
     * {
     *     UpdateProgressBar("Finishing");
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.renderFinished.on {
     *     updateProgressBar("Finishing")
     * }
     * ```
     *
     */
    public readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    private onRenderFinished(renderingResult: RenderFinishedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        (this.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(renderingResult);
        this.uiFacade.triggerEvent(this.container, 'renderFinished', renderingResult);
    }

    /**
     * This event is fired when the rendering of the whole music sheet is finished, and all handlers of `renderFinished` ran.
     * @remarks
     * If {@link CoreSettings.enableLazyLoading} is enabled not all partial images of the music sheet might be rendered.
     * In this case the `renderFinished` event rather represents that the whole music sheet has been layouted and arranged
     * and every partial image can be requested for rendering. If you neeed more fine-grained access
     * to the actual layouting and rendering progress, you need to look at the low-level apis {@link IScoreRenderer.partialLayoutFinished} and
     * {@link IScoreRenderer.partialRenderFinished} accessible via {@link renderer}.
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.postRenderFinished.on(() => {
     *     hideLoadingIndicator();
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PostRenderFinished.On(() =>
     * {
     *     HideLoadingIndicator();
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.postRenderFinished.on {
     *     hideLoadingIndicator();
     * }
     * ```
     *
     */
    public readonly postRenderFinished: IEventEmitter = new EventEmitter();
    private onPostRenderFinished(): void {
        if (this._isDestroyed) {
            return;
        }

        this._currentBeat = null;
        this.cursorUpdateTick(this._previousTick, false, 1, true, true);

        (this.postRenderFinished as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'postRenderFinished', null);
    }

    /**
     * This event is fired when an error within alphatab occurred.
     *
     * @remarks
     * This event is fired when an error within alphatab occurred. Use this event as global error handler to show errors
     * to end-users. Due to the asynchronous nature of alphaTab, no call to the API will directly throw an error if it fails.
     * Instead a signal to this error handlers will be sent.
     *
     * @eventProperty
     * @category Events - Core
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.error.on((error) {
     *     displayError(error);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.Error.On((error) =>
     * {
     *     DisplayError(error);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.error.on { error ->
     *     displayError(error)
     * }
     * ```
     *
     */
    public readonly error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    /**
     * @internal
     */
    public onError(error: Error): void {
        if (this._isDestroyed) {
            return;
        }
        Logger.error('API', 'An unexpected error occurred', error);
        (this.error as EventEmitterOfT<Error>).trigger(error);
        this.uiFacade.triggerEvent(this.container, 'error', error);
    }

    /**
     * This event is fired when all required data for playback is loaded and ready.
     * @remarks
     * This event is fired when all required data for playback is loaded and ready. The player is ready for playback when
     * all background workers are started, the audio output is initialized, a soundfont is loaded, and a song was loaded into the player as midi file.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playerReady.on(() => {
     *     enablePlayerControls();
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayerReady.On(() =>
     * {
     *     EnablePlayerControls()
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playerReady.on {
     *     enablePlayerControls()
     * }
     * ```
     */
    public get playerReady(): IEventEmitter {
        return this._player.readyForPlayback;
    }

    private onPlayerReady(): void {
        if (this._isDestroyed) {
            return;
        }
        this.uiFacade.triggerEvent(this.container, 'playerReady', null);
    }

    /**
     * This event is fired when the playback of the whole song finished.
     * @remarks
     * This event is finished regardless on whether looping is enabled or not.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playerFinished.on((args) => {
     *     // speed trainer
     *     api.playbackSpeed = Math.min(1.0, api.playbackSpeed + 0.1);
     * });
     * api.isLooping = true;
     * api.playbackSpeed = 0.5;
     * api.play()
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayerFinished.On(() =>
     * {
     *     // speed trainer
     *     api.PlaybackSpeed = Math.Min(1.0, api.PlaybackSpeed + 0.1);
     * });
     * api.IsLooping = true;
     * api.PlaybackSpeed = 0.5;
     * api.Play();
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playerFinished.on {
     *     // speed trainer
     *     api.playbackSpeed = min(1.0, api.playbackSpeed + 0.1);
     * }
     * api.isLooping = true
     * api.playbackSpeed = 0.5
     * api.play()
     * ```
     *
     */
    public get playerFinished(): IEventEmitter {
        return this._player.finished;
    }
    private onPlayerFinished(): void {
        if (this._isDestroyed) {
            return;
        }
        this.uiFacade.triggerEvent(this.container, 'playerFinished', null);
    }

    /**
     * This event is fired when the SoundFont needed for playback was loaded.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.soundFontLoaded.on(() => {
     *     hideSoundFontLoadingIndicator();
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.SoundFontLoaded.On(() =>
     * {
     *     HideSoundFontLoadingIndicator();
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...);
     * api.soundFontLoaded.on {
     *     hideSoundFontLoadingIndicator();
     * }
     * ```
     *
     */
    public get soundFontLoaded(): IEventEmitter {
        return this._player.soundFontLoaded;
    }
    private onSoundFontLoaded(): void {
        if (this._isDestroyed) {
            return;
        }
        this.uiFacade.triggerEvent(this.container, 'soundFontLoaded', null);
    }

    /**
     * This event is fired when a Midi file is being loaded.
     *
     * @remarks
     * This event is fired when a Midi file for the song was generated and is being loaded
     * by the synthesizer. This event can be used to inspect or modify the midi events
     * which will be played for the song. This can be used to generate other visual representations
     * of the song.
     *
     * > [!NOTE]
     * > The generated midi file will NOT contain any metronome and count-in related events. The metronome and
     * > count-in ticks are handled within the synthesizer.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.midiLoad.on(file => {
     *     initializePianoPractice(file);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MidiLoad.On(file =>
     * {
     *     InitializePianoPractice(file);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.midiLoad.on { file ->
     *     initializePianoPractice(file)
     * }
     * ```
     *
     */
    public readonly midiLoad: IEventEmitterOfT<MidiFile> = new EventEmitterOfT<MidiFile>();
    private onMidiLoad(e: MidiFile): void {
        if (this._isDestroyed) {
            return;
        }
        (this.midiLoad as EventEmitterOfT<MidiFile>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'midiLoad', e);
    }

    /**
     * This event is fired when the Midi file needed for playback was loaded.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.midiLoaded.on(e => {
     *     hideGeneratingAudioIndicator();
     *     updateSongDuration(e.endTime);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MidiLoaded.On(e =>
     * {
     *     HideGeneratingAudioIndicator();
     *     UpdateSongDuration(e.EndTime);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.midiLoaded.on { e ->
     *     hideGeneratingAudioIndicator()
     *     updateSongDuration(e.endTime)
     * }
     * ```
     *
     */
    public readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs>;
    private onMidiLoaded(e: PositionChangedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'midiFileLoaded', e);
    }

    /**
     * This event is fired when the playback state changed.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playerStateChanged.on((args) => {
     *     updatePlayerControls(args.state, args.stopped);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayerStateChanged.On(args =>
     * {
     *     UpdatePlayerControls(args);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playerStateChanged.on { args ->
     *     updatePlayerControls(args)
     * }
     * ```
     *
     */
    public get playerStateChanged(): IEventEmitterOfT<PlayerStateChangedEventArgs> {
        return this._player.stateChanged;
    }

    private onPlayerStateChanged(e: PlayerStateChangedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }

        if (!e.stopped && e.state === PlayerState.Paused) {
            const currentBeat = this._currentBeat;
            const tickCache = this._tickCache;
            if (currentBeat && tickCache) {
                this._player.tickPosition = tickCache.getBeatStart(currentBeat.beat);
            }
        }

        this.uiFacade.triggerEvent(this.container, 'playerStateChanged', e);
    }

    /**
     * This event is fired when the current playback position of the song changed.
     *
     * @eventProperty
     * @category Events - Player
     * @since 0.9.4
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playerPositionChanged.on((args) => {
     *     updatePlayerPosition(args);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlayerPositionChanged.On(args =>
     * {
     *     UpdatePlayerPosition(args);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playerPositionChanged.on { args ->
     *     updatePlayerPosition(args)
     * }
     * ```
     *
     */
    public get playerPositionChanged(): IEventEmitterOfT<PositionChangedEventArgs> {
        return this._player.positionChanged;
    }

    private onPlayerPositionChanged(e: PositionChangedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }

        this._previousTick = e.currentTick;
        this.uiFacade.beginInvoke(() => {
            const cursorSpeed = e.modifiedTempo / e.originalTempo;
            this.cursorUpdateTick(e.currentTick, false, cursorSpeed, false, e.isSeek);
        });

        this.uiFacade.triggerEvent(this.container, 'playerPositionChanged', e);
    }

    /**
     * This event is fired when the synthesizer played certain midi events.
     *
     * @remarks
     * This event is fired when the synthesizer played certain midi events. This allows reacing on various low level
     * audio playback elements like notes/rests played or metronome ticks.
     *
     * Refer to the [related guide](https://www.alphatab.net/docs/guides/handling-midi-events) to learn more about this feature.
     *
     * Also note that the provided data models changed significantly in {@version 1.3.0}. We try to provide backwards compatibility
     * until some extend but highly encourage changing to the new models in case of problems.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.midiEventsPlayedFilter = [alphaTab.midi.MidiEventType.AlphaTabMetronome];
     * api.midiEventsPlayed.on(function(e) {
     *   for(const midi of e.events) {
     *     if(midi.isMetronome) {
     *       console.log('Metronome tick ' + midi.tick);
     *     }
     *   }
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.MidiEventsPlayedFilter = new MidiEventType[] { AlphaTab.Midi.MidiEventType.AlphaTabMetronome };
     * api.MidiEventsPlayed.On(e =>
     * {
     *   foreach(var midi of e.events)
     *   {
     *     if(midi is AlphaTab.Midi.AlphaTabMetronomeEvent sysex && sysex.IsMetronome)
     *     {
     *       Console.WriteLine("Metronome tick " + midi.Tick);
     *     }
     *   }
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...);
     * api.midiEventsPlayedFilter = alphaTab.collections.List<alphaTab.midi.MidiEventType>( alphaTab.midi.MidiEventType.AlphaTabMetronome )
     * api.midiEventsPlayed.on { e ->
     *   for (midi in e.events) {
     *     if(midi instanceof alphaTab.midi.AlphaTabMetronomeEvent && midi.isMetronome) {
     *       println("Metronome tick " + midi.tick);
     *     }
     *   }
     * }
     * ```
     * @see {@link MidiEvent}
     * @see {@link TimeSignatureEvent}
     * @see {@link AlphaTabMetronomeEvent}
     * @see {@link AlphaTabRestEvent}
     * @see {@link NoteOnEvent}
     * @see {@link NoteOffEvent}
     * @see {@link ControlChangeEvent}
     * @see {@link ProgramChangeEvent}
     * @see {@link TempoChangeEvent}
     * @see {@link PitchBendEvent}
     * @see {@link NoteBendEvent}
     * @see {@link EndOfTrackEvent}
     * @see {@link MetaEvent}
     * @see {@link MetaDataEvent}
     * @see {@link MetaNumberEvent}
     * @see {@link Midi20PerNotePitchBendEvent}
     * @see {@link SystemCommonEvent}
     * @see {@link SystemExclusiveEvent}
     */
    public get midiEventsPlayed(): IEventEmitterOfT<MidiEventsPlayedEventArgs> {
        return this._player.midiEventsPlayed;
    }

    private onMidiEventsPlayed(e: MidiEventsPlayedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        this.uiFacade.triggerEvent(this.container, 'midiEventsPlayed', e);
    }

    /**
     * This event is fired when the playback range changed.
     *
     * @eventProperty
     * @category Events - Player
     * @since 1.2.3
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.playbackRangeChanged.on((args) => {
     *     if (args.playbackRange) {
     *         highlightRangeInProgressBar(args.playbackRange.startTick, args.playbackRange.endTick);
     *     } else {
     *         clearHighlightInProgressBar();
     *     }
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.PlaybackRangeChanged.On(args =>
     * {
     *     if (args.PlaybackRange != null)
     *     {
     *         HighlightRangeInProgressBar(args.PlaybackRange.StartTick, args.PlaybackRange.EndTick);
     *     }
     *     else
     *     {
     *         ClearHighlightInProgressBar();
     *     }
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.playbackRangeChanged.on { args ->
     *     val playbackRange = args.playbackRange
     *     if (playbackRange != null) {
     *         highlightRangeInProgressBar(playbackRange.startTick, playbackRange.endTick)
     *     } else {
     *         clearHighlightInProgressBar()
     *     }
     * }
     * ```
     *
     */
    public get playbackRangeChanged(): IEventEmitterOfT<PlaybackRangeChangedEventArgs> {
        return this._player.playbackRangeChanged;
    }
    private onPlaybackRangeChanged(e: PlaybackRangeChangedEventArgs): void {
        if (this._isDestroyed) {
            return;
        }
        this.uiFacade.triggerEvent(this.container, 'playbackRangeChanged', e);
    }

    /**
     * This event is fired when a settings update was requested.
     *
     * @eventProperty
     * @category Events - Core
     * @since 1.6.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * api.settingsUpdated.on(() => {
     *     updateSettingsUI(api.settings);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * api.SettingsUpdated.On(() =>
     * {
     *     UpdateSettingsUI(api.settings);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * val api = AlphaTabApi<MyControl>(...)
     * api.SettingsUpdated.on {
     *     updateSettingsUI(api.settings)
     * }
     * ```
     *
     */
    public readonly settingsUpdated: IEventEmitter = new EventEmitter();
    private onSettingsUpdated(): void {
        if (this._isDestroyed) {
            return;
        }
        (this.settingsUpdated as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'settingsUpdated', null);
    }

    /**
     * Loads and lists the available output devices which can be used by the player.
     * @returns the list of available devices or an empty list if there are no permissions, or the player is not enabled.
     *
     * @remarks
     * Will request permissions if needed.
     *
     * The values provided, can be passed into {@link setOutputDevice} to change dynamically the output device on which
     * the sound is played.
     *
     * In the web version this functionality relies on experimental APIs and might not yet be available in all browsers. https://caniuse.com/mdn-api_audiocontext_sinkid
     * @category Methods - Player
     * @since 1.5.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * const devices = await api.enumerateOutputDevices();
     *
     * buildDeviceSelector(devices, async selectedDevice => {
     *   await api.setOutputDevice(selectedDevice);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * var devices = await api.EnumerateOutputDevices();
     *
     * BuildDeviceSelector(devices, async selectedDevice => {
     *   await api.SetOutputDevice(selectedDevice);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * fun init() = kotlinx.coroutines.runBlocking {
     *   val api = AlphaTabApi<MyControl>(...)
     *   val devices = api.enumerateOutputDevices().await()
     *
     *   buildDeviceSelector(devices, fun (selectedDevice) {
     *     suspend {
     *       await api.setOutputDevice(selectedDevice)
     *     }
     *   });
     * }
     * ```
     */
    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return await this._player.output.enumerateOutputDevices();
    }

    /**
     * Changes the output device which should be used for playing the audio (player must be enabled).
     * @param device The output device to use, or null to switch to the default device.
     *
     * @remarks
     * Use {@link enumerateOutputDevices} to load the list of available devices.
     *
     * In the web version this functionality relies on experimental APIs and might not yet be available in all browsers. https://caniuse.com/mdn-api_audiocontext_sinkid
     * @category Methods - Player
     * @since 1.5.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * const devices = await api.enumerateOutputDevices();
     *
     * buildDeviceSelector(devices, async selectedDevice => {
     *   await api.setOutputDevice(selectedDevice);
     * });
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * var devices = await api.EnumerateOutputDevices();
     *
     * BuildDeviceSelector(devices, async selectedDevice => {
     *   await api.SetOutputDevice(selectedDevice);
     * });
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * fun init() = kotlinx.coroutines.runBlocking {
     *   val api = AlphaTabApi<MyControl>(...)
     *   val devices = api.enumerateOutputDevices().await()
     *
     *   buildDeviceSelector(devices, fun (selectedDevice) {
     *     suspend {
     *       await api.setOutputDevice(selectedDevice)
     *     }
     *   });
     * }
     * ```
     */
    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {
        await this._player.output.setOutputDevice(device);
    }

    /**
     * The currently configured output device if changed via {@link setOutputDevice}.
     * @returns The custom configured output device which was set via {@link setOutputDevice} or `null`
     * if the default outputDevice is used.
     * The output device might change dynamically if devices are connected/disconnected (e.g. bluetooth headset).
     *
     * @remarks
     * Assumes {@link setOutputDevice} has been used.
     * In the web version this functionality relies on experimental APIs and might not yet be available in all browsers. https://caniuse.com/mdn-api_audiocontext_sinkid
     *
     * @category Methods - Player
     * @since 1.5.0
     *
     * @example
     * JavaScript
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'));
     * updateOutputDeviceUI(await api.getOutputDevice())
     * ```
     *
     * @example
     * C#
     * ```cs
     * var api = new AlphaTabApi<MyControl>(...);
     * UpdateOutputDeviceUI(await api.GetOutputDevice())
     * ```
     *
     * @example
     * Android
     * ```kotlin
     * fun init() = kotlinx.coroutines.runBlocking {
     *   val api = AlphaTabApi<MyControl>(...)
     *   updateOutputDeviceUI(api.getOutputDevice().await())
     * }
     * ```
     *
     */
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return await this._player.output.getOutputDevice();
    }

    /**
     * Starts the audio export for the currently loaded song.
     * @remarks
     * This will not export or use any backing track media but will always use the synthesizer to generate the output.
     * This method works with any PlayerMode active but changing the mode during export can lead to unexpected side effects.
     *
     * See [Audio Export](https://www.alphatab.net/docs/guides/audio-export) for further guidance how to use this feature.
     *
     * @param options The export options.
     * @category Methods - Player
     * @since 1.6.0
     * @returns An exporter instance to export the audio in a streaming fashion.
     */
    public async exportAudio(options: AudioExportOptions): Promise<IAudioExporter> {
        if (!this.score) {
            throw new AlphaTabError(AlphaTabErrorType.General, 'No song loaded');
        }

        let exporter: IAudioExporterWorker;

        switch (this._actualPlayerMode) {
            case PlayerMode.EnabledSynthesizer:
                exporter = this.uiFacade.createWorkerAudioExporter(this._player.instance!);
                break;
            default:
                exporter = this.uiFacade.createWorkerAudioExporter(null);
                break;
        }

        const score = this.score!;

        const midiFile: MidiFile = new MidiFile();
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        const generator: MidiFileGenerator = new MidiFileGenerator(score, this.settings, handler);
        generator.applyTranspositionPitches = false;
        generator.generate();

        const optionsWithChannels = new AudioExportOptions();
        optionsWithChannels.soundFonts = options.soundFonts;
        optionsWithChannels.sampleRate = options.sampleRate;
        optionsWithChannels.useSyncPoints = options.useSyncPoints;
        optionsWithChannels.masterVolume = options.masterVolume;
        optionsWithChannels.metronomeVolume = options.metronomeVolume;
        optionsWithChannels.playbackRange = options.playbackRange;

        for (const [trackIndex, volume] of options.trackVolume) {
            if (trackIndex < this.score.tracks.length) {
                const track = this.score.tracks[trackIndex];
                optionsWithChannels.trackVolume.set(track.playbackInfo.primaryChannel, volume);
                optionsWithChannels.trackVolume.set(track.playbackInfo.secondaryChannel, volume);
            }
        }

        for (const [trackIndex, semitones] of options.trackTranspositionPitches) {
            if (trackIndex < this.score.tracks.length) {
                const track = this.score.tracks[trackIndex];
                optionsWithChannels.trackTranspositionPitches.set(track.playbackInfo.primaryChannel, semitones);
                optionsWithChannels.trackTranspositionPitches.set(track.playbackInfo.secondaryChannel, semitones);
            }
        }

        await exporter.initialize(optionsWithChannels, midiFile, generator.syncPoints, generator.transpositionPitches);

        return exporter;
    }
}
