import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { MidiFile } from '@src/midi/MidiFile';
import { AlphaSynth } from '@src/synth/AlphaSynth';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestOutput } from '@test/audio/TestOutput';
import { TestPlatform } from '@test/TestPlatform';

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
        importer.init(TestPlatform.createStringReader(tex), new Settings());
        let score: Score = importer.readScore();
        let midi: MidiFile = new MidiFile();
        let gen: MidiFileGenerator = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
        gen.generate();
        let testOutput: TestOutput = new TestOutput();
        let synth: AlphaSynth = new AlphaSynth(testOutput);
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
});
