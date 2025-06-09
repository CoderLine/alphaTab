import { type IEventEmitterOfT, type IEventEmitter, EventEmitterOfT, EventEmitter } from '@src/EventEmitter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@src/midi/MidiFile';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import type { BackingTrack } from '@src/model/BackingTrack';
import { Settings } from '@src/Settings';
import { BackingTrackPlayer, type IBackingTrackSynthOutput } from '@src/synth/BackingTrackPlayer';
import {
    ExternalMediaPlayer,
    type IExternalMediaHandler,
    type IExternalMediaSynthOutput
} from '@src/synth/ExternalMediaPlayer';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';
import type { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { FlatMidiEventGenerator } from '@test/audio/FlatMidiEventGenerator';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('SyncPointTests', () => {
    it('sync-point-update', () => {
        // MidiFileSequencer
        // sync points and tempo changes -> expect interpolation
    });

    it('backing-track-time-mapping', () => {
        // MidiFileSequencer
        // do a variety of lookups along the time axis.
        // - sequentially (playback)
        // - jumps (seeks back and forth)
        // check
        // - updated syncPointIndex
        // - interpolated time
        // - reverse lookup with mainTimePositionToBackingTrack
    });

    async function syncPointTestScore() {
        // the testfile is built like this:
        // we have the "expected" music sheet in syncpoints-testfile.gp
        // this file is synchronized with an "actual" audio having completely different tempos.
        // the file with wrong tempos used as backing track is in syncpoints-testfile-backingtrack.gp

        // the backing track takes 42secs while the original sound would take 48secs

        const data = await TestPlatform.loadFile('test-data/audio/syncpoints-testfile.gp');
        const score = ScoreLoader.loadScoreFromBytes(data, new Settings());
        return score;
    }

    it('sync-point-generation', async () => {
        const score = await syncPointTestScore();

        const handler = new FlatMidiEventGenerator();
        const generator = new MidiFileGenerator(score, new Settings(), handler);
        generator.generate();

        expect(
            generator.syncPoints.map(p => `${p.masterBarIndex},${p.masterBarOccurence},${p.synthBpm},${p.syncBpm},${p.synthTime},${p.syncTime}`)
        ).toMatchSnapshot();

        const update = MidiFileGenerator.generateSyncPoints(score);

        expect(generator.syncPoints.length).to.equal(update.length);
        for (let i = 0; i < generator.syncPoints.length; i++) {
            expect(update[i].masterBarIndex).to.equal(generator.syncPoints[i].masterBarIndex);
            expect(update[i].masterBarOccurence).to.equal(generator.syncPoints[i].masterBarOccurence);
            expect(update[i].syncBpm).to.equal(generator.syncPoints[i].syncBpm);
            expect(update[i].syncTime).to.equal(generator.syncPoints[i].syncTime);
            expect(update[i].synthBpm).to.equal(generator.syncPoints[i].synthBpm);
            expect(update[i].synthTick).to.equal(generator.syncPoints[i].synthTick);
            expect(update[i].synthTime).to.equal(generator.syncPoints[i].synthTime);
        }
    });

    it('modified-tempo-lookup', async () => {
        const score = await syncPointTestScore();

        const entries = Array.from(MidiFileGenerator.buildModifiedTempoLookup(score)).map(
            e => `${e[0].syncPointValue?.millisecondOffset} => ${e[1].syncBpm}`
        );

        expect(entries).toMatchSnapshot();
    });

    async function prepareBackingTrackPlayer() {
        const score = await syncPointTestScore();

        const midi = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midi);
        const generator = new MidiFileGenerator(score, new Settings(), handler);
        generator.generate();

        const output = new TestBackingTrackOutput();
        output.backingTrackDuration = 42000;

        const player = new BackingTrackPlayer(output, 500);
        player.loadMidiFile(midi);
        player.loadBackingTrack(score);
        player.updateSyncPoints(generator.syncPoints);

        return player;
    }

    async function prepareExternalMediaPlayer() {
        const score = await syncPointTestScore();

        const midi = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midi);
        const generator = new MidiFileGenerator(score, new Settings(), handler);
        generator.generate();

        const player = new ExternalMediaPlayer(500);
        const mediaHandler = new TestExternalMediaHandler(player.output as IExternalMediaSynthOutput);
        mediaHandler.backingTrackDuration = 42000;
        (player.output as IExternalMediaSynthOutput).handler = mediaHandler;

        player.loadMidiFile(midi);
        player.loadBackingTrack(score);
        player.updateSyncPoints(generator.syncPoints);

        return player;
    }

    it('playback-normal-backing-track', async () => {
        const player = await prepareBackingTrackPlayer();

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });
        player.play();

        (player.output as TestBackingTrackOutput).playThroughSong(0, 42000, 500);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
    });

    it('playback-fast-backing-track', async () => {
        const player = await prepareBackingTrackPlayer();
        player.playbackSpeed = 2;

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });
        player.play();

        (player.output as TestBackingTrackOutput).playThroughSong(0, 42000, 1000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
    });

    it('seek-normal-backing-track', async () => {
        const player = await prepareBackingTrackPlayer();

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });

        // seek on player
        player.timePosition = 2000;
        player.timePosition = 5000;
        player.timePosition = 13000;
        player.timePosition = 21000;

        // seek on backing track
        const testOutput = player.output as TestBackingTrackOutput;
        testOutput.simulateSeek(8000);
        testOutput.simulateSeek(16000);
        testOutput.simulateSeek(32000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
        expect(testOutput.seekTimes).toMatchSnapshot();
    });

    it('seek-fast-backing-track', async () => {
        const player = await prepareBackingTrackPlayer();
        player.playbackSpeed = 2;

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });

        // seek on player
        player.timePosition = 4000 / 2;
        player.timePosition = 10000 / 2;
        player.timePosition = 26000 / 2;
        player.timePosition = 42000 / 2;

        // seek on backing track
        const testOutput = player.output as TestBackingTrackOutput;
        testOutput.simulateSeek(8000);
        testOutput.simulateSeek(16000);
        testOutput.simulateSeek(32000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
        expect(testOutput.seekTimes).toMatchSnapshot();
    });

    it('playback-normal-external-media', async () => {
        const player = await prepareExternalMediaPlayer();

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });
        player.play();

        ((player.output as IExternalMediaSynthOutput).handler as TestExternalMediaHandler).playThroughSong(
            0,
            42000,
            500
        );

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
    });

    it('playback-fast-external-media', async () => {
        const player = await prepareExternalMediaPlayer();
        player.playbackSpeed = 2;

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });
        player.play();

        ((player.output as IExternalMediaSynthOutput).handler as TestExternalMediaHandler).playThroughSong(
            0,
            42000,
            1000
        );

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
    });

    it('seek-normal-external-media', async () => {
        const player = await prepareExternalMediaPlayer();

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });

        // seek on player
        player.timePosition = 2000;
        player.timePosition = 5000;
        player.timePosition = 13000;
        player.timePosition = 21000;

        // seek on backing track
        const testOutput = (player.output as IExternalMediaSynthOutput).handler as TestExternalMediaHandler;
        testOutput.simulateSeek(8000);
        testOutput.simulateSeek(16000);
        testOutput.simulateSeek(32000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
        expect(testOutput.seekTimes).toMatchSnapshot();
    });

    it('seek-fast-external-media', async () => {
        const player = await prepareExternalMediaPlayer();
        player.playbackSpeed = 2;

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });

        // seek on player
        player.timePosition = 4000 / 2;
        player.timePosition = 10000 / 2;
        player.timePosition = 26000 / 2;
        player.timePosition = 42000 / 2;

        // seek on backing track
        const testOutput = (player.output as IExternalMediaSynthOutput).handler as TestExternalMediaHandler;
        testOutput.simulateSeek(8000);
        testOutput.simulateSeek(16000);
        testOutput.simulateSeek(32000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
        expect(testOutput.seekTimes).toMatchSnapshot();
    });
});

class TestBackingTrackOutput implements IBackingTrackSynthOutput {
    public seekTimes: number[] = [];

    public simulateSeek(time: number) {
        (this.timeUpdate as EventEmitterOfT<number>).trigger(time);
    }

    public playThroughSong(startTime: number, endTime: number, step: number) {
        let time = startTime;
        while (time <= endTime) {
            this.simulateSeek(time);
            time += step;
        }
    }

    public timeUpdate: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public backingTrackDuration: number = 0;
    public playbackRate: number = 1;
    public masterVolume: number = 1;

    public seekTo(time: number): void {
        this.seekTimes.push(time);
    }
    public loadBackingTrack(_backingTrack: BackingTrack): void {}
    public sampleRate: number = 44100;

    public open(_bufferTimeInMilliseconds: number): void {
        (this.ready as EventEmitter).trigger();
    }
    public play(): void {}
    public destroy(): void {}
    public pause(): void {}
    public addSamples(_samples: Float32Array): void {}
    public resetSamples(): void {}
    public activate(): void {}

    public ready: IEventEmitter = new EventEmitter();
    public samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return new Array<ISynthOutputDevice>(0);
    }
    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {}
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}

class TestExternalMediaHandler implements IExternalMediaHandler {
    private _output: IExternalMediaSynthOutput;

    public seekTimes: number[] = [];

    public simulateSeek(time: number) {
        this._output.updatePosition(time);
    }

    public playThroughSong(startTime: number, endTime: number, step: number) {
        let time = startTime;
        while (time <= endTime) {
            this.simulateSeek(time);
            time += step;
        }
    }

    public constructor(output: IExternalMediaSynthOutput) {
        this._output = output;
    }

    public backingTrackDuration: number = 0;
    public playbackRate: number = 1;
    public masterVolume: number = 1;
    seekTo(time: number): void {
        this.seekTimes.push(time);
    }
    play(): void {}
    pause(): void {}
}
