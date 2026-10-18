/**
 * Tests for the HTMLAudioElement based backing track output. Uses a fake audio element
 * and stubbed browser globals, so web-only.
 *
 * @target web
 */

import { type ILogger, Logger } from '@coderline/alphatab/Logger';
import { AudioElementBackingTrackSynthOutput } from '@coderline/alphatab/platform/javascript/AudioElementBackingTrackSynthOutput';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class RecordingLogger implements ILogger {
    public readonly warnings: string[] = [];

    public debug(_category: string, _msg: string, ..._details: unknown[]): void {}

    public warning(category: string, msg: string, ..._details: unknown[]): void {
        this.warnings.push(`${category}: ${msg}`);
    }

    public info(_category: string, _msg: string, ..._details: unknown[]): void {}

    public error(_category: string, _msg: string, ..._details: unknown[]): void {}
}

describe('AudioElementBackingTrackSynthOutputTests', () => {
    let previousLogger: ILogger;
    let logger: RecordingLogger;

    beforeEach(() => {
        previousLogger = Logger.log;
        logger = new RecordingLogger();
        Logger.log = logger;
        vi.stubGlobal('window', {
            setInterval: () => 1,
            clearInterval: () => {}
        });
    });

    afterEach(() => {
        Logger.log = previousLogger;
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

    async function settle() {
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    it('interrupted-play-is-silent', async () => {
        const output = createOutput(() =>
            Promise.reject(new DOMException('The play() request was interrupted by a call to pause().', 'AbortError'))
        );

        output.play();
        output.pause();
        await settle();

        expect(logger.warnings).toEqual([]);
    });

    it('failed-play-is-logged', async () => {
        const output = createOutput(() =>
            Promise.reject(new DOMException('play() failed because the user did not interact.', 'NotAllowedError'))
        );

        output.play();
        await settle();

        expect(logger.warnings).toEqual(['BackingTrack: Starting audio playback failed']);
    });
});
