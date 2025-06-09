import { type IEventEmitterOfT, type IEventEmitter, EventEmitterOfT, EventEmitter } from '@src/EventEmitter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@src/midi/MidiFile';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import type { BackingTrack } from '@src/model/BackingTrack';
import { Settings } from '@src/Settings';
import { BackingTrackPlayer, type IBackingTrackSynthOutput } from '@src/synth/BackingTrackPlayer';
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
        const data = await TestPlatform.loadFile('test-data/audio/syncpoints-testfile.gp');
        const score = ScoreLoader.loadScoreFromBytes(data, new Settings());
        return score;
    }

    it('sync-point-generation', async () => {
        const score = await syncPointTestScore();

        const handler = new FlatMidiEventGenerator();
        const generator = new MidiFileGenerator(score, new Settings(), handler);
        generator.generate();

        expect(generator.syncPoints).toMatchSnapshot();

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
        expect(MidiFileGenerator.buildModifiedTempoLookup(score)).toMatchSnapshot();
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

        // TODO: it appears no mapping happens. due to the sync points the seek times and simulated seeks should result in different times
    });

    it('seek-fast-backing-track', async () => {
        const player = await prepareBackingTrackPlayer();
        player.playbackSpeed = 2;

        const events: PositionChangedEventArgs[] = [];
        player.positionChanged.on(e => {
            events.push(e);
        });

        // seek on player
        player.timePosition = 4000;
        player.timePosition = 10000;
        player.timePosition = 26000;
        player.timePosition = 42000;

        // seek on backing track
        const testOutput = player.output as TestBackingTrackOutput;
        testOutput.simulateSeek(8000);
        testOutput.simulateSeek(16000);
        testOutput.simulateSeek(32000);

        expect(events.map(e => `${e.currentTime},${e.originalTempo},${e.modifiedTempo}`)).toMatchSnapshot();
        expect(testOutput.seekTimes).toMatchSnapshot();
    });

    it('playback-normal-external-media', () => {
        // ExternalMediaPlayer
        // play a variety of songs artificially
        // check
        // - the positionChanged event list provided
    });

    it('playback-slow-external-media', () => {
        // ExternalMediaPlayer
        // play a variety of songs artificially (other 0.5 speed)
        // check
        // - the positionChanged event list provided
    });

    it('seek-normal-external-media', () => {
        // ExternalMediaPlayer
        // seek to a given position
        // check
        // - the positionChanged event list provided
    });

    it('seek-slow-external-media', () => {
        // ExternalMediaPlayer
        // seek to a given position (playbackSpeed 0.5)
        // check
        // - the positionChanged event list provided
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
    public loadBackingTrack(backingTrack: BackingTrack): void {}
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
        return [];
    }
    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {}
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}
