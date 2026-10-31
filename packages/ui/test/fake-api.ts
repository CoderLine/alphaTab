import * as alphaTab from '@coderline/alphatab';
import { vi } from 'vitest';

export interface FakeEmitter<T = void> {
    on(handler: (arg: T) => void): () => void;
    off(handler: (arg: T) => void): void;
    trigger(arg: T): void;
}

function emitter<T = void>(): FakeEmitter<T> {
    const handlers = new Set<(arg: T) => void>();
    return {
        on(handler) {
            handlers.add(handler);
            return () => handlers.delete(handler);
        },
        off(handler) {
            handlers.delete(handler);
        },
        trigger(arg) {
            for (const handler of [...handlers]) {
                handler(arg);
            }
        }
    };
}

/** The part of `AlphaTabApi` the store and the playback controller use, with triggerable events. */
export function createFakeApi() {
    const api = {
        settings: new alphaTab.Settings(),
        score: null as alphaTab.model.Score | null,
        tracks: [] as alphaTab.model.Track[],
        player: { ready: emitter(), isReady: true, output: {} },
        actualPlayerMode: alphaTab.PlayerMode.EnabledSynthesizer,
        playerState: alphaTab.synth.PlayerState.Paused,
        isReadyForPlayback: true,
        tickPosition: 0,
        timePosition: 0,
        playbackRange: null as alphaTab.synth.PlaybackRange | null,
        customCursorHandler: undefined,
        tickCache: null,
        boundsLookup: null,

        settingsUpdated: emitter(),
        scoreLoaded: emitter<alphaTab.model.Score>(),
        midiLoad: emitter<unknown>(),
        midiLoaded: emitter<unknown>(),
        playerReady: emitter(),
        renderStarted: emitter<boolean>(),
        postRenderFinished: emitter(),
        playerStateChanged: emitter<{ state: alphaTab.synth.PlayerState; stopped: boolean }>(),
        playerFinished: emitter(),
        playerPositionChanged: emitter<{ currentTick: number; currentTime: number; endTime: number }>(),
        playbackRangeChanged: emitter<{ playbackRange: alphaTab.synth.PlaybackRange | null }>(),
        soundFontLoad: emitter<{ loaded: number; total: number }>(),
        soundFontLoaded: emitter(),

        changeTrackMute: vi.fn(),
        changeTrackSolo: vi.fn(),
        changeTrackVolume: vi.fn(),
        changeTrackTranspositionPitch: vi.fn(),
        updateSettings: vi.fn(),
        render: vi.fn(),
        renderScore: vi.fn(),
        renderTracks: vi.fn(),
        loadMidiForScore: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
        playPause: vi.fn(),
        stop: vi.fn(),
        exportAudio: vi.fn()
    };
    return api;
}

export type FakeApi = ReturnType<typeof createFakeApi>;

export function asApi(api: FakeApi): alphaTab.AlphaTabApi {
    return api as unknown as alphaTab.AlphaTabApi;
}

/** Parses alphaTex into a score, throwing on errors. */
export function scoreFromTex(tex: string): alphaTab.model.Score {
    const importer = new alphaTab.importer.AlphaTexImporter();
    importer.initFromString(tex, new alphaTab.Settings());
    return importer.readScore();
}
