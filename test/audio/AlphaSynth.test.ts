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

describe('AlphaSynthTests', () => {
    it('pcm-generation', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/default.sf2');
        let tex: string =
            '\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 ' +
            '(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |' +
            ' r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |' +
            ' (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | ' +
            'r.8(0.4 0.3).8(-.3 - .4).2 { d } | ';
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        let score: Score = importer.readScore();
        let midi: MidiFile = new MidiFile();
        let gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        let testOutput: TestOutput = new TestOutput();
        let synth: AlphaSynth = new AlphaSynth(testOutput, 500);
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
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        let score: Score = importer.readScore();
        let midi: MidiFile = new MidiFile();
        let gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        let testOutput: TestOutput = new TestOutput();
        let synth: AlphaSynth = new AlphaSynth(testOutput, 500);
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
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        let score: Score = importer.readScore();
        let midi: MidiFile = new MidiFile();
        let gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        let testOutput: TestOutput = new TestOutput();
        let synth: AlphaSynth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);


        expect(synth.isReadyForPlayback).to.be.true;
        expect(synth.hasSamplesForProgram(24)).to.be.true;
        expect(synth.hasSamplesForProgram(30)).to.be.true;
        expect(synth.hasSamplesForProgram(1)).to.be.false;
        expect(synth.hasSamplesForProgram(35)).to.be.false;
        expect(synth.hasSamplesForPercussion(SynthConstants.MetronomeKey)).to.be.true;
    });

   async function testVorbisFile(name:string) {
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
});
