import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { MidiFile } from '@src/midi/MidiFile';
import { AlphaSynth } from '@src/synth/AlphaSynth';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestOutput } from '@test/audio/TestOutput';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';
import { SynthConstants } from '@src/synth/SynthConstants';
import { VorbisFile } from '@src/synth/vorbis/VorbisFile';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { AudioExportOptions } from '@src/synth/IAudioExporter';

describe('AlphaSynthTests', () => {
    it('pcm-generation', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const tex: string =
            '\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 ' +
            '(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |' +
            ' r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |' +
            ' (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | ' +
            'r.8(0.4 0.3).8(-.3 - .4).2 { d } | ';
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        const score: Score = importer.readScore();
        const midi: MidiFile = new MidiFile();
        const gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput: TestOutput = new TestOutput();
        const synth: AlphaSynth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);
        synth.play();
        let finished: boolean = false;
        synth.finished.on(() => {
            finished = true;
        });
        while (!finished) {
            testOutput.next();
        }
    });

    it('only-used-instruments-decoded-sf2', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const tex: string = `
            \\tempo 120
            .
            \\track "T01"
            \\ts 1 4
            \\instrument 24
            4.4.4*4
            \\track "T02"
            \\instrument 30
            4.4.4*4`;
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        const score: Score = importer.readScore();
        const midi: MidiFile = new MidiFile();
        const gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput: TestOutput = new TestOutput();
        const synth: AlphaSynth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);

        expect(synth.isReadyForPlayback).to.be.true;
        expect(synth.hasSamplesForProgram(24)).to.be.true;
        expect(synth.hasSamplesForProgram(30)).to.be.true;
        expect(synth.hasSamplesForProgram(1)).to.be.false;
        expect(synth.hasSamplesForProgram(35)).to.be.false;
        expect(synth.hasSamplesForPercussion(SynthConstants.MetronomeKey)).to.be.true;
    });

    it('only-used-instruments-decoded-sf3', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/default.sf3');

        const tex: string = `
            \\tempo 120
            .
            \\track "T01"
            \\ts 1 4
            \\instrument 24
            4.4.4*4
            \\track "T02"
            \\instrument 30
            4.4.4*4`;
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        const score: Score = importer.readScore();
        const midi: MidiFile = new MidiFile();
        const gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput: TestOutput = new TestOutput();
        const synth: AlphaSynth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);

        expect(synth.isReadyForPlayback).to.be.true;
        expect(synth.hasSamplesForProgram(24)).to.be.true;
        expect(synth.hasSamplesForProgram(30)).to.be.true;
        expect(synth.hasSamplesForProgram(1)).to.be.false;
        expect(synth.hasSamplesForProgram(35)).to.be.false;
        expect(synth.hasSamplesForPercussion(SynthConstants.MetronomeKey)).to.be.true;
    });

    async function testVorbisFile(name: string) {
        const data = await TestPlatform.loadFile(`test-data/audio/${name}.ogg`);
        const vorbis = new VorbisFile(ByteBuffer.fromBuffer(data));

        expect(vorbis.streams.length).to.equal(1);
        expect(vorbis.streams[0].audioChannels).to.equal(2);
        expect(vorbis.streams[0].audioSampleRate).to.equal(44100);
        expect(vorbis.streams[0].samples.length).to.be.greaterThan(44100 * 0.05);

        const generated = vorbis.streams[0].samples;
        const reference = new DataView((await TestPlatform.loadFile(`test-data/audio/${name}_alphaTab.pcm`)).buffer);
        try {
            expect(generated.length).to.equal(reference.buffer.byteLength / 4);

            for (let i = 0; i < generated.length; i++) {
                expect(generated[i]).to.equal(reference.getFloat32(i * 4, true), `Difference at index ${i}`);
            }
        } catch (e) {
            await TestPlatform.saveFile(
                `test-data/audio/${name}_alphaTab_new.pcm`,
                new Uint8Array(vorbis.streams[0].samples.buffer)
            );

            throw e;
        }
    }

    it('ogg-vorbis-short', async () => {
        await testVorbisFile('Short');
    });

    it('ogg-vorbis-example', async () => {
        await testVorbisFile('Example');
    });

    async function testAudioExport(
        score: Score,
        fileName: string,
        prepareOptions: (options: AudioExportOptions) => void
    ) {
        // add a fake sync point to get time range (if there are not already sync points)
        const syncPoints = score.exportFlatSyncPoints();
        if (syncPoints.length === 0) {
            score.applyFlatSyncPoints([
                {
                    barIndex: 0,
                    barOccurence: 0,
                    barPosition: 0,
                    millisecondOffset: 0
                }
            ]);
        }

        const soundFont = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const synth = new AlphaSynth(new TestOutput(), 500);

        const midi: MidiFile = new MidiFile();
        const generator: MidiFileGenerator = new MidiFileGenerator(
            score,
            new Settings(),
            new AlphaSynthMidiFileHandler(midi)
        );
        generator.applyTranspositionPitches = false;
        generator.generate();

        const exportOptions = new AudioExportOptions();
        exportOptions.masterVolume = 1;
        exportOptions.metronomeVolume = 0;
        exportOptions.sampleRate = 44100;
        exportOptions.soundFonts = [soundFont];
        prepareOptions(exportOptions);

        const exporter = synth.exportAudio(exportOptions, midi, generator.syncPoints, generator.transpositionPitches);

        let generated: Float32Array = new Float32Array(
            exportOptions.sampleRate *
                (generator.syncPoints[generator.syncPoints.length - 1].syncTime / 1000) *
                SynthConstants.AudioChannels
        );

        let totalSamples = 0;
        while (true) {
            const chunk = exporter.render(300);
            if (chunk === undefined) {
                break;
            }

            const neededSize = totalSamples + chunk.samples.length;
            if (generated.length < neededSize) {
                const needed = neededSize - generated.length;
                const newBuffer = new Float32Array(generated.length + needed);
                newBuffer.set(generated, 0);
                generated = newBuffer;
            }

            generated.set(chunk.samples, totalSamples);
            totalSamples += chunk.samples.length;
        }

        if (totalSamples < generated.length) {
            generated = generated.subarray(0, totalSamples);
        }

        try {
            const reference = new DataView((await TestPlatform.loadFile(`test-data/audio/${fileName}.pcm`)).buffer);
            expect(generated.length).to.equal(reference.buffer.byteLength / 4);

            for (let i = 0; i < generated.length; i++) {
                const expected = reference.getFloat32(i * 4, true);
                if (generated[i] !== expected) { // custom check, chai assertion has quite huge overhead if called that often
                    expect(generated[i]).to.equal(expected, `Difference at index ${i}`);
                }
            }
        } catch (e) {
            await TestPlatform.saveFile(
                `test-data/audio/${fileName}-new.pcm`,
                new Uint8Array(generated.buffer, generated.byteOffset, generated.byteLength)
            );

            throw e;
        }
    }

    it('export-test', async () => {
        const tex: string = `
            \\tempo 120
            .
            \\ts 4 4
            :8 C4 * 8
        `;
        const settings = new Settings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);

        await testAudioExport(score, 'export-test', _options => {
            // no settings
        });
    });

    it('export-silent-with-metronome', async () => {
        const tex: string = `
            \\tempo 120
            .
            \\ts 4 4
            :8 C4 * 8
        `;
        const settings = new Settings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);

        await testAudioExport(score, 'export-silent-with-metronome', options => {
            options.metronomeVolume = 1;
            for (const t of score.tracks) {
                options.trackVolume.set(t.index, 0.5);
            }
        });
    });

    it('export-sync-points', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/syncpoints-testfile.gp');
        const score = ScoreLoader.loadScoreFromBytes(data, new Settings());

        await testAudioExport(score, 'export-sync-points', options => {
            options.useSyncPoints = true;
        });
    });
});
