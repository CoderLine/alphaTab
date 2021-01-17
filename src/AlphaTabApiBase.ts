import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';

import { MidiFile } from '@src/midi/MidiFile';
import { MidiTickLookup, MidiTickLookupFindBeatResult } from '@src/midi/MidiTickLookup';
import { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { Environment } from '@src/Environment';
import { EventEmitter, IEventEmitter, IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';

import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

import { ByteBuffer } from '@src/io/ByteBuffer';
import { Beat } from '@src/model/Beat';
import { Score } from '@src/model/Score';
import { Track } from '@src/model/Track';

import { IContainer } from '@src/platform/IContainer';
import { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import { IUiFacade } from '@src/platform/IUiFacade';
import { ScrollMode } from '@src/PlayerSettings';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';

import { IScoreRenderer } from '@src/rendering/IScoreRenderer';

import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';

import { Bounds } from '@src/rendering/utils/Bounds';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { StaveGroupBounds } from '@src/rendering/utils/StaveGroupBounds';
import { ResizeEventArgs } from '@src/ResizeEventArgs';
import { Settings } from '@src/Settings';

import { Logger } from '@src/Logger';
import { ModelUtils } from '@src/model/ModelUtils';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Note } from './model/Note';
import { MidiEventType } from './midi/MidiEvent';
import { MidiEventsPlayedEventArgs } from './synth/MidiEventsPlayedEventArgs';

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
    /**
     * Gets the UI facade to use for interacting with the user interface.
     */
    public readonly uiFacade: IUiFacade<TSettings>;

    /**
     * Gets the UI container that holds the whole alphaTab control.
     */
    public readonly container: IContainer;

    /**
     * Gets the score renderer used for rendering the music sheet. This is the low-level API responsible for the actual rendering chain.
     */
    public readonly renderer: IScoreRenderer;

    /**
     * Gets the score holding all information about the song being rendered.
     */
    public score: Score | null = null;

    /**
     * Gets the settings that are used for rendering the music notation.
     */
    public settings!: Settings;

    /**
     * Gets a list of the tracks that are currently rendered;
     */
    public tracks: Track[] = [];

    /**
     * Gets the UI container that will hold all rendered results.
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

        uiFacade.initialize(this, settings);
        Logger.logLevel = this.settings.core.logLevel;

        this.canvasElement = uiFacade.createCanvasElement();
        this.container.appendChild(this.canvasElement);
        this.container.resize.on(
            Environment.throttle(() => {
                if (this.container.width !== this.renderer.width) {
                    this.triggerResize();
                }
            }, uiFacade.resizeThrottle)
        );
        if (
            this.settings.core.useWorkers &&
            this.uiFacade.areWorkersSupported &&
            Environment.getRenderEngineFactory(this.settings).supportsWorkers
        ) {
            this.renderer = this.uiFacade.createWorkerRenderer();
        } else {
            this.renderer = new ScoreRenderer(this.settings);
        }

        let initialResizeEventInfo: ResizeEventArgs = new ResizeEventArgs();
        initialResizeEventInfo.oldWidth = this.renderer.width;
        initialResizeEventInfo.newWidth = this.container.width | 0;
        initialResizeEventInfo.settings = this.settings;
        this.onResize(initialResizeEventInfo);
        this.renderer.preRender.on(this.onRenderStarted.bind(this));
        this.renderer.renderFinished.on(renderingResult => {
            this.onRenderFinished(renderingResult);
        });
        this.renderer.postRenderFinished.on(() => {
            let duration: number = Date.now() - this._startTime;
            Logger.debug('rendering', 'Rendering completed in ' + duration + 'ms');
            this.onPostRenderFinished();
        });
        this.renderer.preRender.on(_ => {
            this._startTime = Date.now();
        });
        this.renderer.partialRenderFinished.on(this.appendRenderResult.bind(this));
        this.renderer.renderFinished.on(r => {
            this.appendRenderResult(r);
            this.appendRenderResult(null); // marks last element
        });
        this.renderer.error.on(this.onError.bind(this));
        if (this.settings.player.enablePlayer) {
            this.setupPlayer();
        }
        this.setupClickHandling();
        // delay rendering to allow ui to hook up with events first.
        this.uiFacade.beginInvoke(() => {
            this.uiFacade.initialRender();
        });
    }

    /**
     * Destroys the alphaTab control and restores the initial state of the UI.
     */
    public destroy(): void {
        if (this.player) {
            this.player.destroy();
        }
        this.uiFacade.destroy();
        this.renderer.destroy();
    }

    /**
     * Applies any changes that were done to the settings object and informs the {@link renderer} about any new values to consider.
     */
    public updateSettings(): void {
        this.renderer.updateSettings(this.settings);
        // enable/disable player if needed
        if (this.settings.player.enablePlayer) {
            this.setupPlayer();
        } else {
            this.destroyPlayer();
        }
    }

    /**
     * Attempts a load of the score represented by the given data object.
     * @param scoreData The data container supported by {@link IUiFacade}
     * @param trackIndexes The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
     * song will be shown.
     * @returns true if the data object is supported and a load was initiated, otherwise false
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
            this.onError(e);
            return false;
        }
    }

    /**
     * Initiates a rendering of the given score.
     * @param score The score containing the tracks to be rendered.
     * @param trackIndexes The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
     * song will be shown.
     */
    public renderScore(score: Score, trackIndexes?: number[]): void {
        let tracks: Track[] = [];
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
                for (let track of score.tracks) {
                    tracks.push(track);
                }
            } else {
                for (let index of trackIndexes) {
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
     */
    public renderTracks(tracks: Track[]): void {
        if (tracks.length > 0) {
            let score: Score = tracks[0].score;
            for (let track of tracks) {
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
        if (score !== this.score) {
            ModelUtils.applyPitchOffsets(this.settings, score);
            this.score = score;
            this.tracks = tracks;
            this._trackIndexes = [];
            for (let track of tracks) {
                this._trackIndexes.push(track.index);
            }
            this.onScoreLoaded(score);
            this.loadMidiForScore();
            this.render();
        } else {
            this.tracks = tracks;
            this._trackIndexes = [];
            for (let track of tracks) {
                this._trackIndexes.push(track.index);
            }
            this.render();
        }
    }

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
            let resizeEventInfo: ResizeEventArgs = new ResizeEventArgs();
            resizeEventInfo.oldWidth = this.renderer.width;
            resizeEventInfo.newWidth = this.container.width;
            resizeEventInfo.settings = this.settings;
            this.onResize(resizeEventInfo);
            this.renderer.updateSettings(this.settings);
            this.renderer.width = this.container.width;
            this.renderer.resizeRender();
        }
    }

    private appendRenderResult(result: RenderFinishedEventArgs | null): void {
        if (result) {
            this.canvasElement.width = result.totalWidth;
            this.canvasElement.height = result.totalHeight;
            if (this._cursorWrapper) {
                this._cursorWrapper.width = result.totalWidth;
                this._cursorWrapper.height = result.totalHeight;
            }
        }
        if (!result || result.renderResult) {
            this.uiFacade.beginAppendRenderResults(result);
        }
    }

    /**
     * Tells alphaTab to render the given alphaTex.
     * @param tex The alphaTex code to render.
     * @param tracks If set, the given tracks will be rendered, otherwise the first track only will be rendered.
     */
    public tex(tex: string, tracks?: number[]): void {
        try {
            let parser: AlphaTexImporter = new AlphaTexImporter();
            let data: ByteBuffer = ByteBuffer.fromString(tex);
            parser.init(data, this.settings);
            let score: Score = parser.readScore();
            this.renderScore(score, tracks);
        } catch (e) {
            this.onError(e);
        }
    }

    /**
     * Attempts a load of the score represented by the given data object.
     * @param data The data object to decode
     * @param append Whether to fully replace or append the data from the given soundfont.
     * @returns true if the data object is supported and a load was initiated, otherwise false
     */
    public loadSoundFont(data: unknown, append: boolean = false): boolean {
        if (!this.player) {
            return false;
        }
        return this.uiFacade.loadSoundFont(data, append);
    }

    /**
     * Resets all loaded soundfonts as if they were not loaded.
     */
    public resetSoundFonts(): void {
        if (!this.player) {
            return;
        }
        this.player.resetSoundFonts();
    }

    /**
     * Initiates a re-rendering of the current setup. If rendering is not yet possible, it will be deferred until the UI changes to be ready for rendering.
     */
    public render(): void {
        if (!this.renderer) {
            return;
        }
        if (this.uiFacade.canRender) {
            // when font is finally loaded, start rendering
            this.renderer.width = this.container.width;
            this.renderer.renderScore(this.score!, this._trackIndexes as any);
        } else {
            this.uiFacade.canRenderChanged.on(() => this.render());
        }
    }

    private _tickCache: MidiTickLookup | null = null;
    /**
     * Gets the alphaSynth player used for playback. This is the low-level API to the Midi synthesizer used for playback.
     */
    public player: IAlphaSynth | null = null;

    public get isReadyForPlayback(): boolean {
        if (!this.player) {
            return false;
        }
        return this.player.isReadyForPlayback;
    }

    public get playerState(): PlayerState {
        if (!this.player) {
            return PlayerState.Paused;
        }
        return this.player.state;
    }

    public get masterVolume(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.masterVolume;
    }

    public set masterVolume(value: number) {
        if (this.player) {
            this.player.masterVolume = value;
        }
    }

    public get metronomeVolume(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        if (this.player) {
            this.player.metronomeVolume = value;
        }
    }

    public get countInVolume(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.countInVolume;
    }

    public set countInVolume(value: number) {
        if (this.player) {
            this.player.countInVolume = value;
        }
    }

    public get midiEventsPlayedFilter(): MidiEventType[] {
        if (!this.player) {
            return [];
        }
        return this.player.midiEventsPlayedFilter;
    }

    public set midiEventsPlayedFilter(value: MidiEventType[]) {
        if (this.player) {
            this.player.midiEventsPlayedFilter = value;
        }
    }

    public get tickPosition(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.tickPosition;
    }

    public set tickPosition(value: number) {
        if (this.player) {
            this.player.tickPosition = value;
        }
    }

    public get timePosition(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.timePosition;
    }

    public set timePosition(value: number) {
        if (this.player) {
            this.player.timePosition = value;
        }
    }

    public get playbackRange(): PlaybackRange | null {
        if (!this.player) {
            return null;
        }
        return this.player.playbackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        if (this.player) {
            this.player.playbackRange = value;
            if (this.settings.player.enableCursor) {
                this.updateSelectionCursor(value);
            }
        }
    }

    public get playbackSpeed(): number {
        if (!this.player) {
            return 0;
        }
        return this.player.playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        if (this.player) {
            this.player.playbackSpeed = value;
        }
    }

    public get isLooping(): boolean {
        if (!this.player) {
            return false;
        }
        return this.player.isLooping;
    }

    public set isLooping(value: boolean) {
        if (this.player) {
            this.player.isLooping = value;
        }
    }

    private destroyPlayer(): void {
        if (!this.player) {
            return;
        }
        this.player.destroy();
        this.player = null;
        this.destroyCursors();
    }

    private setupPlayer(): void {
        if (this.player) {
            return;
        }
        this.player = this.uiFacade.createWorkerPlayer();
        if (!this.player) {
            return;
        }
        this.player.ready.on(() => {
            this.loadMidiForScore();
        });
        this.player.readyForPlayback.on(() => {
            this.onPlayerReady();
            if (this.tracks) {
                for (let track of this.tracks) {
                    let volume: number = track.playbackInfo.volume / 16;
                    this.player!.setChannelVolume(track.playbackInfo.primaryChannel, volume);
                    this.player!.setChannelVolume(track.playbackInfo.secondaryChannel, volume);
                }
            }
        });
        this.player.soundFontLoaded.on(this.onSoundFontLoaded.bind(this));
        this.player.soundFontLoadFailed.on(e => {
            this.onError(e);
        });
        this.player.midiLoaded.on(this.onMidiLoaded.bind(this));
        this.player.midiLoadFailed.on(e => {
            this.onError(e);
        });
        this.player.stateChanged.on(this.onPlayerStateChanged.bind(this));
        this.player.positionChanged.on(this.onPlayerPositionChanged.bind(this));
        this.player.midiEventsPlayed.on(this.onMidiEventsPlayed.bind(this));
        this.player.finished.on(this.onPlayerFinished.bind(this));
        if (this.settings.player.enableCursor) {
            this.setupCursors();
        } else {
            this.destroyCursors();
        }
    }

    private loadMidiForScore(): void {
        if (!this.player || !this.score || !this.player.isReady) {
            return;
        }
        Logger.debug('AlphaTab', 'Generating Midi');
        let midiFile: MidiFile = new MidiFile();
        let handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        let generator: MidiFileGenerator = new MidiFileGenerator(this.score, this.settings, handler);
        generator.generate();
        this._tickCache = generator.tickLookup;
        this.onMidiLoad(midiFile);
        this.player.loadMidiFile(midiFile);
    }

    /**
     * Changes the volume of the given tracks.
     * @param tracks The tracks for which the volume should be changed.
     * @param volume The volume to set for all tracks in percent (0-1)
     */
    public changeTrackVolume(tracks: Track[], volume: number): void {
        if (!this.player) {
            return;
        }
        for (let track of tracks) {
            this.player.setChannelVolume(track.playbackInfo.primaryChannel, volume);
            this.player.setChannelVolume(track.playbackInfo.secondaryChannel, volume);
        }
    }

    /**
     * Changes the given tracks to be played solo or not.
     * If one or more tracks are set to solo, only those tracks are hearable.
     * @param tracks The list of tracks to play solo or not.
     * @param solo If set to true, the tracks will be added to the solo list. If false, they are removed.
     */
    public changeTrackSolo(tracks: Track[], solo: boolean): void {
        if (!this.player) {
            return;
        }
        for (let track of tracks) {
            this.player.setChannelSolo(track.playbackInfo.primaryChannel, solo);
            this.player.setChannelSolo(track.playbackInfo.secondaryChannel, solo);
        }
    }

    /**
     * Changes the given tracks to be muted or not.
     * @param tracks The list of track to mute or unmute.
     * @param mute If set to true, the tracks will be muted. If false they are unmuted.
     */
    public changeTrackMute(tracks: Track[], mute: boolean): void {
        if (!this.player) {
            return;
        }
        for (let track of tracks) {
            this.player.setChannelMute(track.playbackInfo.primaryChannel, mute);
            this.player.setChannelMute(track.playbackInfo.secondaryChannel, mute);
        }
    }

    /**
     * Starts the playback of the current song.
     * @returns true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.
     */
    public play(): boolean {
        if (!this.player) {
            return false;
        }
        return this.player.play();
    }

    /**
     * Pauses the playback of the current song.
     */
    public pause(): void {
        if (!this.player) {
            return;
        }
        this.player.pause();
    }

    /**
     * Toggles between play/pause depending on the current player state.
     */
    public playPause(): void {
        if (!this.player) {
            return;
        }
        this.player.playPause();
    }

    /**
     * Stops the playback of the current song, and moves the playback position back to the start.
     */
    public stop(): void {
        if (!this.player) {
            return;
        }
        this.player.stop();
    }

    /**
     * Triggers the play of the given beat. This will stop the any other current ongoing playback.
     * @param beat the single beat to play
     */
    public playBeat(beat: Beat): void {
        if (!this.player) {
            return;
        }

        // we generate a new midi file containing only the beat
        let midiFile: MidiFile = new MidiFile();
        let handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        let generator: MidiFileGenerator = new MidiFileGenerator(beat.voice.bar.staff.track.score, this.settings, handler);
        generator.generateSingleBeat(beat);

        this.player.playOneTimeMidiFile(midiFile);
    }

    /**
     * Triggers the play of the given note. This will stop the any other current ongoing playback.
     * @param beat the single note to play
     */
    public playNote(note: Note): void {
        if (!this.player) {
            return;
        }

        // we generate a new midi file containing only the beat
        let midiFile: MidiFile = new MidiFile();
        let handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(midiFile);
        let generator: MidiFileGenerator = new MidiFileGenerator(note.beat.voice.bar.staff.track.score, this.settings, handler);
        generator.generateSingleNote(note);

        this.player.playOneTimeMidiFile(midiFile);
    }


    private _cursorWrapper: IContainer | null = null;
    private _barCursor: IContainer | null = null;
    private _beatCursor: IContainer | null = null;
    private _selectionWrapper: IContainer | null = null;
    private _previousTick: number = 0;
    private _playerState: PlayerState = PlayerState.Paused;
    private _currentBeat: Beat | null = null;
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
        this._previousTick = 0;
        this._playerState = PlayerState.Paused;
    }

    private setupCursors(): void {
        //
        // Create cursors
        let cursors = this.uiFacade.createCursors();
        if (!cursors) {
            return;
        }
        // store options and created elements for fast access
        this._cursorWrapper = cursors.cursorWrapper;
        this._barCursor = cursors.barCursor;
        this._beatCursor = cursors.beatCursor;
        this._selectionWrapper = cursors.selectionWrapper;
        //
        // Hook into events
        this._previousTick = 0;
        this._playerState = PlayerState.Paused;
        // we need to update our position caches if we render a tablature
        this.renderer.postRenderFinished.on(() => {
            this.cursorUpdateTick(this._previousTick, false);
        });
        if (this.player) {
            this.player.positionChanged.on(e => {
                this._previousTick = e.currentTick;
                this.uiFacade.beginInvoke(() => {
                    this.cursorUpdateTick(e.currentTick, false);
                });
            });
            this.player.stateChanged.on(e => {
                this._playerState = e.state;
                if (!e.stopped && e.state === PlayerState.Paused) {
                    let currentBeat: Beat | null = this._currentBeat;
                    let tickCache: MidiTickLookup | null = this._tickCache;
                    if (currentBeat && tickCache) {
                        this.player!.tickPosition =
                            tickCache.getMasterBarStart(currentBeat.voice.bar.masterBar) + currentBeat.playbackStart;
                    }
                }
            });
        }
    }

    /**
     * updates the cursors to highlight the beat at the specified tick position
     * @param tick
     * @param stop
     */
    private cursorUpdateTick(tick: number, stop: boolean = false): void {
        this.uiFacade.beginInvoke(() => {
            let cache: MidiTickLookup | null = this._tickCache;
            if (cache) {
                let tracks: Track[] = this.tracks;
                if (tracks.length > 0) {
                    let beat: MidiTickLookupFindBeatResult | null = cache.findBeat(tracks, tick);
                    if (beat) {
                        this.cursorUpdateBeat(
                            beat.currentBeat,
                            beat.nextBeat,
                            beat.duration,
                            stop,
                            beat.beatsToHighlight
                        );
                    }
                }
            }
        });
    }

    /**
     * updates the cursors to highlight the specified beat
     */
    private cursorUpdateBeat(
        beat: Beat,
        nextBeat: Beat | null,
        duration: number,
        stop: boolean,
        beatsToHighlight: Beat[] | null = null
    ): void {
        if (!beat) {
            return;
        }
        let cache: BoundsLookup | null = this.renderer.boundsLookup;
        if (!cache) {
            return;
        }
        let previousBeat: Beat | null = this._currentBeat;
        let previousCache: BoundsLookup | null = this._previousCursorCache;
        let previousState: PlayerState | null = this._previousStateForCursor;
        this._currentBeat = beat;
        this._previousCursorCache = cache;
        this._previousStateForCursor = this._playerState;
        if (beat === previousBeat && cache === previousCache && previousState === this._playerState) {
            return;
        }
        let barCursor: IContainer | null = this._barCursor;
        let beatCursor: IContainer | null = this._beatCursor;
        let beatBoundings: BeatBounds | null = cache.findBeat(beat);
        if (!beatBoundings) {
            return;
        }
        let barBoundings: MasterBarBounds = beatBoundings.barBounds.masterBarBounds;
        let barBounds: Bounds = barBoundings.visualBounds;
        if (barCursor) {
            barCursor.top = barBounds.y;
            barCursor.left = barBounds.x;
            barCursor.width = barBounds.w;
            barCursor.height = barBounds.h;
        }

        if (beatCursor) {
            // move beat to start position immediately
            beatCursor.stopAnimation();
            beatCursor.top = barBounds.y;
            beatCursor.left = beatBoundings.visualBounds.x;
            beatCursor.height = barBounds.h;
        }

        // if playing, animate the cursor to the next beat
        this.uiFacade.removeHighlights();
        if (this._playerState === PlayerState.Playing || stop) {
            duration /= this.playbackSpeed;
            if (!stop) {
                if (beatsToHighlight) {
                    for (let highlight of beatsToHighlight) {
                        let className: string = BeatContainerGlyph.getGroupId(highlight);
                        this.uiFacade.highlightElements(className);
                    }
                }
                let nextBeatX: number = barBoundings.visualBounds.x + barBoundings.visualBounds.w;
                // get position of next beat on same stavegroup
                if (nextBeat) {
                    // if we are moving within the same bar or to the next bar
                    // transition to the next beat, otherwise transition to the end of the bar.
                    if (
                        nextBeat.voice.bar.index === beat.voice.bar.index ||
                        nextBeat.voice.bar.index === beat.voice.bar.index + 1
                    ) {
                        let nextBeatBoundings: BeatBounds | null = cache.findBeat(nextBeat);
                        if (
                            nextBeatBoundings &&
                            nextBeatBoundings.barBounds.masterBarBounds.staveGroupBounds ===
                            barBoundings.staveGroupBounds
                        ) {
                            nextBeatX = nextBeatBoundings.visualBounds.x;
                        }
                    }
                }

                if (beatCursor) {
                    this.uiFacade.beginInvoke(() => {
                        // Logger.Info("Player",
                        //    "Transition from " + beatBoundings.VisualBounds.X + " to " + nextBeatX + " in " + duration +
                        //    "(" + Player.PlaybackRange + ")");
                        beatCursor!.transitionToX(duration, nextBeatX);
                    });
                }
            }
            if (!this._beatMouseDown && this.settings.player.scrollMode !== ScrollMode.Off) {
                let scrollElement: IContainer = this.uiFacade.getScrollContainer();
                let isVertical: boolean = Environment.getLayoutEngineFactory(this.settings).vertical;
                let mode: ScrollMode = this.settings.player.scrollMode;
                let elementOffset: Bounds = this.uiFacade.getOffset(scrollElement, this.container);
                if (isVertical) {
                    switch (mode) {
                        case ScrollMode.Continuous:
                            let y: number =
                                elementOffset.y + barBoundings.realBounds.y + this.settings.player.scrollOffsetY;
                            if (y !== this._lastScroll) {
                                this._lastScroll = y;
                                this.uiFacade.scrollToY(scrollElement, y, this.settings.player.scrollSpeed);
                            }
                            break;
                        case ScrollMode.OffScreen:
                            let elementBottom: number =
                                scrollElement.scrollTop + this.uiFacade.getOffset(null, scrollElement).h;
                            if (
                                barBoundings.visualBounds.y + barBoundings.visualBounds.h >= elementBottom ||
                                barBoundings.visualBounds.y < scrollElement.scrollTop
                            ) {
                                let scrollTop: number = barBoundings.realBounds.y + this.settings.player.scrollOffsetY;
                                this._lastScroll = barBoundings.visualBounds.x;
                                this.uiFacade.scrollToY(scrollElement, scrollTop, this.settings.player.scrollSpeed);
                            }
                            break;
                    }
                } else {
                    switch (mode) {
                        case ScrollMode.Continuous:
                            let x: number = barBoundings.visualBounds.x;
                            if (x !== this._lastScroll) {
                                let scrollLeft: number = barBoundings.realBounds.x + this.settings.player.scrollOffsetX;
                                this._lastScroll = barBoundings.visualBounds.x;
                                this.uiFacade.scrollToX(scrollElement, scrollLeft, this.settings.player.scrollSpeed);
                            }
                            break;
                        case ScrollMode.OffScreen:
                            let elementRight: number =
                                scrollElement.scrollLeft + this.uiFacade.getOffset(null, scrollElement).w;
                            if (
                                barBoundings.visualBounds.x + barBoundings.visualBounds.w >= elementRight ||
                                barBoundings.visualBounds.x < scrollElement.scrollLeft
                            ) {
                                let scrollLeft: number = barBoundings.realBounds.x + this.settings.player.scrollOffsetX;
                                this._lastScroll = barBoundings.visualBounds.x;
                                this.uiFacade.scrollToX(scrollElement, scrollLeft, this.settings.player.scrollSpeed);
                            }
                            break;
                    }
                }
            }
            // trigger an event for others to indicate which beat/bar is played
            this.onPlayedBeatChanged(beat);
        }
    }

    public playedBeatChanged: IEventEmitterOfT<Beat> = new EventEmitterOfT<Beat>();
    private onPlayedBeatChanged(beat: Beat): void {
        (this.playedBeatChanged as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'playedBeatChanged', beat);
    }

    private _beatMouseDown: boolean = false;
    private _selectionStart: SelectionInfo | null = null;
    private _selectionEnd: SelectionInfo | null = null;

    public beatMouseDown: IEventEmitterOfT<Beat> = new EventEmitterOfT<Beat>();
    public beatMouseMove: IEventEmitterOfT<Beat> = new EventEmitterOfT<Beat>();
    public beatMouseUp: IEventEmitterOfT<Beat | null> = new EventEmitterOfT<Beat | null>();

    private onBeatMouseDown(originalEvent: IMouseEventArgs, beat: Beat): void {
        if (
            this.settings.player.enablePlayer &&
            this.settings.player.enableCursor &&
            this.settings.player.enableUserInteraction
        ) {
            this._selectionStart = new SelectionInfo(beat);
            this._selectionEnd = null;
        }
        this._beatMouseDown = true;
        (this.beatMouseDown as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'beatMouseDown', beat, originalEvent);
    }

    private onBeatMouseMove(originalEvent: IMouseEventArgs, beat: Beat): void {
        if (this.settings.player.enableUserInteraction) {
            if (!this._selectionEnd || this._selectionEnd.beat !== beat) {
                this._selectionEnd = new SelectionInfo(beat);
                this.cursorSelectRange(this._selectionStart, this._selectionEnd);
            }
        }
        (this.beatMouseMove as EventEmitterOfT<Beat>).trigger(beat);
        this.uiFacade.triggerEvent(this.container, 'beatMouseMove', beat, originalEvent);
    }

    private onBeatMouseUp(originalEvent: IMouseEventArgs, beat: Beat | null): void {
        if (this.settings.player.enableUserInteraction) {
            // for the selection ensure start < end
            if (this._selectionEnd) {
                let startTick: number = this._selectionStart!.beat.absolutePlaybackStart;
                let endTick: number = this._selectionStart!.beat.absolutePlaybackStart;
                if (endTick < startTick) {
                    let t: SelectionInfo = this._selectionStart!;
                    this._selectionStart = this._selectionEnd;
                    this._selectionEnd = t;
                }
            }
            if (this._selectionStart && this._tickCache) {
                // get the start and stop ticks (which consider properly repeats)
                let tickCache: MidiTickLookup = this._tickCache;
                let realMasterBarStart: number = tickCache.getMasterBarStart(
                    this._selectionStart.beat.voice.bar.masterBar
                );
                // move to selection start
                this._currentBeat = null; // reset current beat so it is updating the cursor
                if (this._playerState === PlayerState.Paused) {
                    this.cursorUpdateBeat(this._selectionStart.beat, null, 0, false, [this._selectionStart.beat]);
                }
                this.tickPosition = realMasterBarStart + this._selectionStart.beat.playbackStart;
                // set playback range
                if (this._selectionEnd && this._selectionStart.beat !== this._selectionEnd.beat) {
                    let realMasterBarEnd: number = tickCache.getMasterBarStart(
                        this._selectionEnd.beat.voice.bar.masterBar
                    );

                    let range = new PlaybackRange();
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

    private updateSelectionCursor(range: PlaybackRange | null) {
        if (!this._tickCache) {
            return;
        }
        if (range) {
            const startBeat = this._tickCache.findBeat(this.tracks, range.startTick);
            const endBeat = this._tickCache.findBeat(this.tracks, range.endTick);
            if (startBeat && endBeat) {
                const selectionStart = new SelectionInfo(startBeat.currentBeat);
                const selectionEnd = new SelectionInfo(endBeat.currentBeat);
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
            let relX: number = e.getX(this.canvasElement);
            let relY: number = e.getY(this.canvasElement);
            let beat: Beat | null = this.renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            if (beat) {
                this.onBeatMouseDown(e, beat);
            }
        });
        this.canvasElement.mouseMove.on(e => {
            if (!this._beatMouseDown) {
                return;
            }
            let relX: number = e.getX(this.canvasElement);
            let relY: number = e.getY(this.canvasElement);
            let beat: Beat | null = this.renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            if (beat) {
                this.onBeatMouseMove(e, beat);
            }
        });
        this.canvasElement.mouseUp.on(e => {
            if (!this._beatMouseDown) {
                return;
            }
            if (this.settings.player.enableUserInteraction) {
                e.preventDefault();
            }
            let relX: number = e.getX(this.canvasElement);
            let relY: number = e.getY(this.canvasElement);
            let beat: Beat | null = this.renderer.boundsLookup?.getBeatAtPos(relX, relY) ?? null;
            this.onBeatMouseUp(e, beat);
        });
        this.renderer.postRenderFinished.on(() => {
            if (
                !this._selectionStart ||
                !this.settings.player.enablePlayer ||
                !this.settings.player.enableCursor ||
                !this.settings.player.enableUserInteraction
            ) {
                return;
            }
            this.cursorSelectRange(this._selectionStart, this._selectionEnd);
        });
    }

    private cursorSelectRange(startBeat: SelectionInfo | null, endBeat: SelectionInfo | null): void {
        let cache: BoundsLookup | null = this.renderer.boundsLookup;
        if (!cache) {
            return;
        }
        let selectionWrapper: IContainer | null = this._selectionWrapper;
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
        let startTick: number = startBeat.beat.absolutePlaybackStart;
        let endTick: number = endBeat.beat.absolutePlaybackStart;
        if (endTick < startTick) {
            let t: SelectionInfo = startBeat;
            startBeat = endBeat;
            endBeat = t;
        }
        let startX: number = startBeat.bounds!.realBounds.x;
        let endX: number = endBeat.bounds!.realBounds.x + endBeat.bounds!.realBounds.w;
        if (endBeat.beat.index === endBeat.beat.voice.beats.length - 1) {
            endX =
                endBeat.bounds!.barBounds.masterBarBounds.realBounds.x +
                endBeat.bounds!.barBounds.masterBarBounds.realBounds.w;
        }
        // if the selection goes across multiple staves, we need a special selection highlighting
        if (
            startBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds !==
            endBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds
        ) {
            // from the startbeat to the end of the staff,
            // then fill all staffs until the end-beat staff
            // then from staff-start to the end beat (or to end of bar if it's the last beat)
            let staffStartX: number = startBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds.visualBounds.x;
            let staffEndX: number =
                startBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds.visualBounds.x +
                startBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds.visualBounds.w;
            let startSelection: IContainer = this.uiFacade.createSelectionElement()!;
            startSelection.top = startBeat.bounds!.barBounds.masterBarBounds.visualBounds.y;
            startSelection.left = startX;
            startSelection.width = staffEndX - startX;
            startSelection.height = startBeat.bounds!.barBounds.masterBarBounds.visualBounds.h;
            selectionWrapper.appendChild(startSelection);
            let staffStartIndex: number = startBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds.index + 1;
            let staffEndIndex: number = endBeat.bounds!.barBounds.masterBarBounds.staveGroupBounds.index;
            for (let staffIndex: number = staffStartIndex; staffIndex < staffEndIndex; staffIndex++) {
                let staffBounds: StaveGroupBounds = cache.staveGroups[staffIndex];
                let middleSelection: IContainer = this.uiFacade.createSelectionElement()!;
                middleSelection.top = staffBounds.visualBounds.y;
                middleSelection.left = staffStartX;
                middleSelection.width = staffEndX - staffStartX;
                middleSelection.height = staffBounds.visualBounds.h;
                selectionWrapper.appendChild(middleSelection);
            }
            let endSelection: IContainer = this.uiFacade.createSelectionElement()!;
            endSelection.top = endBeat.bounds!.barBounds.masterBarBounds.visualBounds.y;
            endSelection.left = staffStartX;
            endSelection.width = endX - staffStartX;
            endSelection.height = endBeat.bounds!.barBounds.masterBarBounds.visualBounds.h;
            selectionWrapper.appendChild(endSelection);
        } else {
            // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
            let selection: IContainer = this.uiFacade.createSelectionElement()!;
            selection.top = startBeat.bounds!.barBounds.masterBarBounds.visualBounds.y;
            selection.left = startX;
            selection.width = endX - startX;
            selection.height = startBeat.bounds!.barBounds.masterBarBounds.visualBounds.h;
            selectionWrapper.appendChild(selection);
        }
    }

    public scoreLoaded: IEventEmitterOfT<Score> = new EventEmitterOfT<Score>();
    private onScoreLoaded(score: Score): void {
        (this.scoreLoaded as EventEmitterOfT<Score>).trigger(score);
        this.uiFacade.triggerEvent(this.container, 'scoreLoaded', score);
    }

    public resize: IEventEmitterOfT<ResizeEventArgs> = new EventEmitterOfT<ResizeEventArgs>();
    private onResize(e: ResizeEventArgs): void {
        (this.resize as EventEmitterOfT<ResizeEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'resize', e);
    }

    public renderStarted: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    private onRenderStarted(resize: boolean): void {
        (this.renderStarted as EventEmitterOfT<boolean>).trigger(resize);
        this.uiFacade.triggerEvent(this.container, 'renderStarted', resize);
    }

    public renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> = new EventEmitterOfT<RenderFinishedEventArgs>();
    private onRenderFinished(renderingResult: RenderFinishedEventArgs): void {
        (this.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(renderingResult);
        this.uiFacade.triggerEvent(this.container, 'renderFinished', renderingResult);
    }

    public postRenderFinished: IEventEmitter = new EventEmitter();
    private onPostRenderFinished(): void {
        (this.postRenderFinished as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'postRenderFinished', null);
    }

    public error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    public onError(error: Error): void {
        Logger.error('API', 'An unexpected error occurred', error);
        (this.error as EventEmitterOfT<Error>).trigger(error);
        this.uiFacade.triggerEvent(this.container, 'error', error);
    }

    public playerReady: IEventEmitter = new EventEmitter();
    private onPlayerReady(): void {
        (this.playerReady as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'playerReady', null);
    }

    public playerFinished: IEventEmitter = new EventEmitter();
    private onPlayerFinished(): void {
        (this.playerFinished as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'playerFinished', null);
    }

    public soundFontLoaded: IEventEmitter = new EventEmitter();
    private onSoundFontLoaded(): void {
        (this.soundFontLoaded as EventEmitter).trigger();
        this.uiFacade.triggerEvent(this.container, 'soundFontLoaded', null);
    }

    public midiLoad: IEventEmitterOfT<MidiFile> = new EventEmitterOfT<MidiFile>();
    private onMidiLoad(e:MidiFile): void {
        (this.midiLoad as EventEmitterOfT<MidiFile>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'midiLoad', e);
    }

    public midiLoaded: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<PositionChangedEventArgs>();
    private onMidiLoaded(e:PositionChangedEventArgs): void {
        (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'midiFileLoaded', e);
    }

    public playerStateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs> = new EventEmitterOfT<
        PlayerStateChangedEventArgs
    >();
    private onPlayerStateChanged(e: PlayerStateChangedEventArgs): void {
        (this.playerStateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'playerStateChanged', e);
    }

    public playerPositionChanged: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<
        PositionChangedEventArgs
    >();
    private onPlayerPositionChanged(e: PositionChangedEventArgs): void {
        (this.playerPositionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'playerPositionChanged', e);
    }

    public midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> = new EventEmitterOfT<
        MidiEventsPlayedEventArgs
    >();
    private onMidiEventsPlayed(e: MidiEventsPlayedEventArgs): void {
        (this.midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(e);
        this.uiFacade.triggerEvent(this.container, 'midiEventsPlayed', e);
    }
}
