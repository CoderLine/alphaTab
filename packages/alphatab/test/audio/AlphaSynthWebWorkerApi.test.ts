/**
 * Tests for the main-thread side of the worker based player. Feeds worker messages
 * directly as plain objects, so web-only.
 *
 * @target web
 */

import { AlphaSynthWebWorkerApi } from '@coderline/alphatab/platform/worker/AlphaSynthWebWorkerApi';
import type {
    IAlphaSynthWorker,
    IAlphaSynthWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynthWrapper } from '@coderline/alphatab/synth/AlphaSynthWrapper';
import { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';
import { TestOutput } from 'test/audio/TestOutput';
import { describe, expect, it } from 'vitest';

class TestSynthWorker implements IAlphaSynthWorker {
    public postMessage(_message: IAlphaSynthWorkerMessage): void {
        // nothing to do
    }

    public addEventListener(_event: 'message', _handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void): void {
        // nothing to do
    }

    public removeEventListener(
        _event: 'message',
        _handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void
    ): void {
        // nothing to do
    }

    public terminate(): void {
        // nothing to do
    }
}

describe('AlphaSynthWebWorkerApiTests', () => {
    it('midi-loaded-late-registration', () => {
        const workerApi = new AlphaSynthWebWorkerApi(new TestOutput(), new Settings(), new TestSynthWorker());
        const wrapper = new AlphaSynthWrapper();
        wrapper.instance = workerApi;

        workerApi.handleWorkerMessage({
            data: {
                cmd: 'alphaSynth.midiLoaded',
                args: new PositionChangedEventArgs(0, 2000, 0, 3840, false, 120, 120)
            }
        } as MessageEvent<IAlphaSynthWorkerMessage>);

        expect(wrapper.loadedMidiInfo?.endTick).toBe(3840);

        const received: PositionChangedEventArgs[] = [];
        wrapper.midiLoaded.on(e => received.push(e));
        expect(received.length).toBe(1);
        expect(received[0].endTick).toBe(3840);
        expect(received[0].endTime).toBe(2000);
    });
});
