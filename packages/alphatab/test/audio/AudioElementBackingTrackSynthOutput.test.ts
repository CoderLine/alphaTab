/**
 * Tests for the HTMLAudioElement based backing track output. Uses a fake audio element
 * and stubbed browser globals, so web-only.
 *
 * @target web
 */

import { LogLevel } from '@coderline/alphatab/LogLevel';
import { type ILogger, Logger } from '@coderline/alphatab/Logger';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { AudioElementBackingTrackSynthOutput } from '@coderline/alphatab/platform/javascript/AudioElementBackingTrackSynthOutput';
import type { BackingTrackPlayer } from '@coderline/alphatab/synth/BackingTrackPlayer';
import { PlayerState } from '@coderline/alphatab/synth/PlayerState';
import { WarningCollectingLogger } from 'test/WarningCollectingLogger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Rejects every play request with the given error and lets tests wait until the output handled them.
 */
class RejectedPlayRequests {
    private readonly _error: DOMException;
    private readonly _requests: Promise<void>[] = [];

    public constructor(error: DOMException) {
        this._error = error;
    }

    public readonly play = (): Promise<void> => {
        const request = Promise.reject(this._error);
        this._requests.push(request);
        return request;
    };

    /**
     * Resolves after the rejection handlers the output attached to the requests made so far have run,
     * as handlers of one promise run in the order they were attached.
     */
    public async handled(): Promise<void> {
        expect(this._requests.length).toBeGreaterThan(0);
        for (const request of this._requests) {
            await request.catch(() => {});
        }
    }
}

describe('AudioElementBackingTrackSynthOutputTests', () => {
    let previousLogger: ILogger;
    let previousLogLevel: LogLevel;
    let logger: WarningCollectingLogger;

    beforeEach(() => {
        previousLogger = Logger.log;
        previousLogLevel = Logger.logLevel;
        logger = new WarningCollectingLogger();
        Logger.log = logger;
        // other test files in the same worker may have lowered the global log level
        Logger.logLevel = LogLevel.Info;
        vi.stubGlobal('window', {
            setInterval: () => 1,
            clearInterval: () => {}
        });
    });

    afterEach(() => {
        Logger.log = previousLogger;
        Logger.logLevel = previousLogLevel;
        vi.unstubAllGlobals();
    });

    function createOutput(playResult: () => Promise<void>): AudioElementBackingTrackSynthOutput {
        const output = new AudioElementBackingTrackSynthOutput();
        output.audioElement = {
            play: playResult,
            pause: () => {}
        } as unknown as HTMLAudioElement;
        return output;
    }

    it('interrupted-play-is-silent', async () => {
        const requests = new RejectedPlayRequests(
            new DOMException('The play() request was interrupted by a call to pause().', 'AbortError')
        );
        const output = createOutput(requests.play);

        output.play();
        output.pause();
        await requests.handled();

        expect(logger.warnings).toEqual([]);
    });

    function createPlayer(playResult: () => Promise<void>): BackingTrackPlayer {
        const audioElement = {
            style: {},
            duration: 10,
            currentTime: 0,
            play: playResult,
            pause: () => {},
            addEventListener: () => {}
        };
        vi.stubGlobal('document', {
            createElement: () => audioElement,
            body: { appendChild: () => {} }
        });
        const player = AudioElementBackingTrackSynthOutput.createPlayer(500);
        player.loadMidiFile(new MidiFile());
        return player;
    }

    it('rejected-play-pauses-player', async () => {
        const requests = new RejectedPlayRequests(
            new DOMException('play() failed because the user did not interact.', 'NotAllowedError')
        );
        const player = createPlayer(requests.play);
        const states: PlayerState[] = [];
        player.stateChanged.on(e => states.push(e.state));

        expect(player.play()).toBe(true);
        await requests.handled();

        // the first entry is the state replayed on subscription
        expect(states).toEqual([PlayerState.Paused, PlayerState.Playing, PlayerState.Paused]);
        expect(player.state).toBe(PlayerState.Paused);
    });

    it('interrupted-play-keeps-player-state', async () => {
        const requests = new RejectedPlayRequests(
            new DOMException('The play() request was interrupted by a new load request.', 'AbortError')
        );
        const player = createPlayer(requests.play);

        player.play();
        await requests.handled();

        expect(player.state).toBe(PlayerState.Playing);
    });

    it('failed-play-is-logged', async () => {
        const requests = new RejectedPlayRequests(
            new DOMException('play() failed because the user did not interact.', 'NotAllowedError')
        );
        const output = createOutput(requests.play);

        output.play();
        await requests.handled();

        expect(logger.warnings).toEqual(['BackingTrack: Starting audio playback failed']);
    });
});
