import { describe, expect, it } from 'vitest';
import { FormatError } from '@coderline/alphatab/FormatError';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { ControllerType } from '@coderline/alphatab/midi/ControllerType';
import {
    type ControlChangeEvent,
    type MidiEvent,
    MidiEventType,
    NoteOffEvent,
    NoteOnEvent,
    ProgramChangeEvent,
    TempoChangeEvent
} from '@coderline/alphatab/midi/MidiEvent';
import { MidiFile, MidiFileFormat, MidiTrack } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import { AudioExportOptions } from '@coderline/alphatab/synth/IAudioExporter';
import { Hydra, HydraGenAmount } from '@coderline/alphatab/synth/soundfont/Hydra';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import { GenOperators, Region } from '@coderline/alphatab/synth/synthesis/Region';
import { TinySoundFont } from '@coderline/alphatab/synth/synthesis/TinySoundFont';
import { Mdct } from '@coderline/alphatab/synth/vorbis/Mdct';
import { VorbisDecoder } from '@coderline/alphatab/synth/vorbis/VorbisDecoder';
import { TestOutput } from 'test/audio/TestOutput';
import { TestPlatform } from 'test/TestPlatform';

describe('AlphaSynthTests', () => {
    it('pcm-generation', async () => {
        const data = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const tex: string =
            '\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 ' +
            '(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |' +
            ' r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |' +
            ' (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | ' +
            'r.8(0.4 0.3).8(-.3 - .4).2 { d } | ';
        const score = ScoreLoader.loadAlphaTex(tex);
        const midi = new MidiFile();
        const gen = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput = new TestOutput();
        const synth = new AlphaSynth(testOutput, 500);
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
        const score = ScoreLoader.loadAlphaTex(tex);
        const midi = new MidiFile();
        const gen = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput = new TestOutput();
        const synth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);

        expect(synth.isReadyForPlayback).toBe(true);
        expect(synth.hasSamplesForProgram(24)).toBe(true);
        expect(synth.hasSamplesForProgram(30)).toBe(true);
        expect(synth.hasSamplesForProgram(1)).toBe(false);
        expect(synth.hasSamplesForProgram(35)).toBe(false);
        expect(synth.hasSamplesForPercussion(SynthConstants.MetronomeKey)).toBe(true);
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
        const score = ScoreLoader.loadAlphaTex(tex);
        const midi = new MidiFile();
        const gen = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        const testOutput = new TestOutput();
        const synth = new AlphaSynth(testOutput, 500);
        synth.loadSoundFont(data, false);
        synth.loadMidiFile(midi);

        expect(synth.isReadyForPlayback).toBe(true);
        expect(synth.hasSamplesForProgram(24)).toBe(true);
        expect(synth.hasSamplesForProgram(30)).toBe(true);
        expect(synth.hasSamplesForProgram(1)).toBe(false);
        expect(synth.hasSamplesForProgram(35)).toBe(false);
        expect(synth.hasSamplesForPercussion(SynthConstants.MetronomeKey)).toBe(true);
    });

    /**
     * Compares decoded samples with the output of libvorbis (libvorbisfile with float output).
     */
    async function expectLibVorbisOutput(samples: Float32Array, name: string) {
        const reference = new DataView((await TestPlatform.loadFile(`test-data/audio/${name}_libvorbis.pcm`)).buffer);
        try {
            expect(samples.length).toBe(reference.buffer.byteLength / 4);
            let maxDifference = 0;
            for (let i = 0; i < samples.length; i++) {
                maxDifference = Math.max(maxDifference, Math.abs(samples[i] - reference.getFloat32(i * 4, true)));
            }
            expect(maxDifference).toBeLessThan(1e-5);
        } catch (e) {
            await TestPlatform.saveFile(`test-data/audio/${name}_alphaTab_new.pcm`, new Uint8Array(samples.buffer));
            throw e;
        }
    }

    async function testVorbisFile(name: string) {
        const data = await TestPlatform.loadFile(`test-data/audio/${name}.ogg`);
        const stream = new VorbisDecoder().decode(data, 0, data.length);
        expect(stream.channels).toBe(2);
        expect(stream.sampleRate).toBe(44100);
        await expectLibVorbisOutput(stream.samples, name);
    }

    it('ogg-vorbis-short', async () => {
        await testVorbisFile('Short');
    });

    it('ogg-vorbis-example', { timeout: 30000 }, async () => {
        await testVorbisFile('Example');
    });

    it('vorbis-sf3-samples', async () => {
        // one sample per block size pair: 512/1024, 512/512 and 256/2048
        const hydra = new Hydra();
        hydra.load(ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/audio/default.sf3')));
        const parts: Float32Array[] = [];
        let length = 0;
        for (const name of ['001', '032', '159']) {
            const header = hydra.sHdrs.find(h => h.sampleName === name)!;
            const samples = hydra.decodeSamples(header.start, header.end, true);
            parts.push(samples);
            length += samples.length;
        }
        const all = new Float32Array(length);
        let offset = 0;
        for (const part of parts) {
            all.set(part, offset);
            offset += part.length;
        }
        await expectLibVorbisOutput(all, 'default-sf3');
    });

    it('vorbis-packets-spanning-pages', async () => {
        // the same stream with every packet split across pages
        const data = await TestPlatform.loadFile('test-data/audio/Short.ogg');
        const paged = await TestPlatform.loadFile('test-data/audio/Short-paged.ogg');
        const expected = new VorbisDecoder().decode(data, 0, data.length).samples;
        const actual = new VorbisDecoder().decode(paged, 0, paged.length).samples;
        expect(actual.length).toBe(expected.length);
        for (let i = 0; i < actual.length; i++) {
            expect(actual[i], `Difference at index ${i}`).toBe(expected[i]);
        }
    });

    it('vorbis-corrupt-input', async () => {
        // mutated and truncated streams either decode or fail with a FormatError
        const data = await TestPlatform.loadFile('test-data/audio/Short.ogg');
        const decoder = new VorbisDecoder();
        let seed = 1;
        let formatErrors = 0;
        for (let i = 0; i < 300; i++) {
            const corrupt = new Uint8Array(data.length);
            corrupt.set(data, 0);
            seed = (seed * 75 + 74) % 65537;
            let length = data.length;
            if (i % 4 === 3) {
                length = seed % data.length;
            } else {
                for (let j = 0; j <= i % 3; j++) {
                    const position = (seed * (j + 1)) % data.length;
                    corrupt[position] = (corrupt[position] + 1 + (seed % 255)) % 256;
                }
            }
            try {
                decoder.decode(corrupt, 0, length);
            } catch (e) {
                expect(e instanceof FormatError, `Mutation ${i}: ${e}`).toBe(true);
                formatErrors++;
            }
        }
        expect(formatErrors).toBeGreaterThan(0);
    });

    it('vorbis-imdct', () => {
        // all Vorbis block sizes against the definition, angles as multiples of pi / (2n) from a table
        let seed = 7;
        for (let n = 64; n <= 8192; n *= 2) {
            const half = n / 2;
            const input = new Float32Array(half);
            for (let k = 0; k < half; k++) {
                seed = (seed * 75 + 74) % 65537;
                input[k] = seed / 65537 - 0.5;
            }
            const cos = new Float32Array(4 * n);
            for (let i = 0; i < 4 * n; i++) {
                cos[i] = Math.cos((Math.PI * i) / (2 * n));
            }

            const output = new Float32Array(n);
            new Mdct(n).inverse(input, output, new Float32Array(half));

            let maxError = 0;
            let maxValue = 0;
            for (let i = 0; i < n; i++) {
                let expected = 0;
                for (let k = 0; k < half; k++) {
                    expected += input[k] * cos[((2 * i + 1 + half) * (2 * k + 1)) % (4 * n)];
                }
                maxError = Math.max(maxError, Math.abs(output[i] - expected));
                maxValue = Math.max(maxValue, Math.abs(expected));
            }
            expect(maxError / maxValue, `n=${n}`).toBeLessThan(1e-5);
        }
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
            expect(generated.length).toBe(reference.buffer.byteLength / 4);

            for (let i = 0; i < generated.length; i++) {
                const expected = reference.getFloat32(i * 4, true);
                if (generated[i] !== expected) {
                    // custom check, chai assertion has quite huge overhead if called that often
                    expect(generated[i], `Difference at index ${i}`).toBe(expected);
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

    it('export-with-presets-of-loaded-soundfont', async () => {
        const synth = new AlphaSynth(new TestOutput(), 50);
        synth.loadSoundFont(await TestPlatform.loadFile('test-data/audio/default.sf2'), false);

        const midi = new MidiFile();
        midi.format = MidiFileFormat.MultiTrack;
        midi.division = 960;
        const track = new MidiTrack();
        track.addEvent(new ProgramChangeEvent(0, 0, 0, 24));
        track.addEvent(new TempoChangeEvent(0, 500000));
        track.addEvent(new NoteOnEvent(0, 0, 0, 60, 100));
        track.addEvent(new NoteOffEvent(0, 960, 0, 60, 64));
        midi.tracks.push(track);

        const options = new AudioExportOptions();
        options.sampleRate = 44100;
        options.masterVolume = 1;
        const exporter = synth.exportAudio(options, midi, [], new Map<number, number>());

        const chunk = exporter.render(250);
        expect(chunk).toBeTruthy();
        let peak = 0;
        for (let i = 0; i < chunk!.samples.length; i++) {
            peak = Math.max(peak, Math.abs(chunk!.samples[i]));
        }
        expect(peak).toBeGreaterThan(0);
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

    it('midi-bank', () => {
        const score = ScoreLoader.loadAlphaTex(`
            \\track "T1" { instrument 25 bank 77 }
                C4 D4 E4 F4 | C4 { instrument 27 bank 1000 } D4 E4 F4

            \\track "T1" { instrument 25 bank 50 }
                C4 D4 E4 F4 | C4 D4 E4 { instrument 27 bank 4000 } F4
        `);

        const midi: MidiFile = new MidiFile();
        const generator: MidiFileGenerator = new MidiFileGenerator(
            score,
            new Settings(),
            new AlphaSynthMidiFileHandler(midi)
        );
        generator.applyTranspositionPitches = false;
        generator.generate();

        const bankChanges: ControlChangeEvent[] = [];
        for (const e of midi.events) {
            if (
                e.type === MidiEventType.ControlChange &&
                ((e as ControlChangeEvent).controller === ControllerType.BankSelectCoarse ||
                    (e as ControlChangeEvent).controller === ControllerType.BankSelectFine)
            ) {
                bankChanges.push(e as ControlChangeEvent);
            }
        }

        expect(bankChanges).toMatchSnapshot();

        const synth = new TinySoundFont(44100);

        let i = 0;
        function playTo(ticks: number) {
            while (i < bankChanges.length) {
                const nextEvent = bankChanges[i];
                if (nextEvent.tick <= ticks) {
                    synth.processMidiMessage(nextEvent);
                    i++;
                } else {
                    break;
                }
            }
        }

        playTo(0);
        expect(synth.channelGetPresetBank(0)).toBe(77);
        expect(synth.channelGetPresetBank(1)).toBe(77);
        expect(synth.channelGetPresetBank(2)).toBe(50);
        expect(synth.channelGetPresetBank(3)).toBe(50);

        playTo(3840);
        expect(synth.channelGetPresetBank(0)).toBe(1000);
        expect(synth.channelGetPresetBank(1)).toBe(1000);
        expect(synth.channelGetPresetBank(2)).toBe(50);
        expect(synth.channelGetPresetBank(3)).toBe(50);

        playTo(3840 * 2);
        expect(synth.channelGetPresetBank(0)).toBe(1000);
        expect(synth.channelGetPresetBank(1)).toBe(1000);
        expect(synth.channelGetPresetBank(2)).toBe(4000);
        expect(synth.channelGetPresetBank(3)).toBe(4000);
    });

    async function testPlaythrough(midi: MidiFile) {
        const testOutput = new TestOutput(false);
        const synth = new AlphaSynth(testOutput, 500);
        const soundFont = await TestPlatform.loadFile('test-data/audio/default.sf2');
        synth.loadSoundFont(soundFont, false);
        synth.loadMidiFile(midi);
        synth.play();
        let finished = false;
        synth.finished.on(() => {
            finished = true;
        });

        const start = Date.now();

        while (!finished) {
            const now = Date.now();
            if (now - start > 2000) {
                throw new Error(`play did not complete after ${2000}ms`);
            }
            testOutput.next();
        }
    }

    it('small-tempos', async () => {
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile('test-data/audio/small-tempo.xml'));

        expect(score.masterBars[0].tempoAutomations[0].value).toBe(0.111);

        const midi = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midi);
        const generator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const tempoChange: MidiEvent[] = midi.events.filter(e => e instanceof TempoChangeEvent);
        expect(tempoChange.length).toBe(1);
        expect((tempoChange[0] as TempoChangeEvent).beatsPerMinute).toBe(0.111);

        await testPlaythrough(midi);
    });

    it('zero-tempo', async () => {
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile('test-data/audio/small-tempo.xml'));

        expect(score.masterBars[0].tempoAutomations[0].value).toBe(0.111);
        score.masterBars[0].tempoAutomations[0].value = 0;

        const midi = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midi);
        const generator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const tempoChange: MidiEvent[] = midi.events.filter(e => e instanceof TempoChangeEvent);
        expect(tempoChange.length).toBe(1);
        expect((tempoChange[0] as TempoChangeEvent).beatsPerMinute).toBe(0);

        await testPlaythrough(midi);
    });

    it('soundfont-attenuation-local-overrides-global', () => {
        const attenuation = GenOperators.InitialAttenuation as number;
        const amount = (v: number) =>
            new HydraGenAmount(ByteBuffer.fromBuffer(new Uint8Array([v & 0xff, (v >> 8) & 0xff])));
        const globalZone = new Region();
        globalZone.clear(true);
        globalZone.operator(attenuation, amount(100));
        const localZone = new Region(globalZone);
        expect(localZone.attenuation).toBeCloseTo(10);
        localZone.operator(attenuation, amount(60));
        expect(localZone.attenuation).toBeCloseTo(6);
        localZone.operator(attenuation, amount(0));
        expect(localZone.attenuation).toBe(0);
    });
});
