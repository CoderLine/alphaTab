import { ScoreLoader } from '@src/importer';
import { AlphaSynthMidiFileHandler, MidiFile, MidiFileGenerator, MidiTickLookup } from '@src/midi';
import { Duration, Score } from '@src/model';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';

describe('MidiTickLookupTest', () => {
    function buildLookup(score:Score, settings:Settings): MidiTickLookup {
        const midiFile = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midiFile);
        const midiFileGenerator = new MidiFileGenerator(score, settings, handler);
        midiFileGenerator.generate();
        return midiFileGenerator.tickLookup;
    }

    it('cursor-snapping', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/cursor-snapping.gp');
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(buffer, settings);
        const lookup = buildLookup(score, settings);

        // initial lookup should detect correctly first rest on first voice 
        // with the quarter rest on the second voice as next beat
        const firstBeat = lookup.findBeat([score.tracks[0]], 0, null);
        expect(firstBeat!.currentBeat.id).toEqual(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id); 
        expect(firstBeat!.nextBeat!.id).toEqual(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id); 
        expect(firstBeat!.currentBeat.duration).toEqual(Duration.Whole);
        expect(firstBeat!.nextBeat!.duration).toEqual(Duration.Quarter);

        // Duration must only go to the next rest on the second voice despite the whole note 
        expect(firstBeat!.duration).toEqual(750); 
        expect(firstBeat!.tickDuration).toEqual(960); 

        // Still playing first beat
        const stillFirst = lookup.findBeat([score.tracks[0]], 400, firstBeat);
        expect(stillFirst!.currentBeat.id).toEqual(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id); 
        expect(stillFirst!.nextBeat!.id).toEqual(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id); 
        expect(stillFirst!.currentBeat.duration).toEqual(Duration.Whole);
        expect(stillFirst!.nextBeat!.duration).toEqual(Duration.Quarter);
        expect(stillFirst!.duration).toEqual(750); 
        expect(stillFirst!.tickDuration).toEqual(960); 

        // Now we're past the second rest heading to the third
        const secondBeat = lookup.findBeat([score.tracks[0]], 970 /* after first quarter */, stillFirst);
        expect(secondBeat!.currentBeat.id).toEqual(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id); 
        expect(secondBeat!.nextBeat!.id).toEqual(score.tracks[0].staves[0].bars[0].voices[1].beats[2].id); 
        expect(secondBeat!.currentBeat.duration).toEqual(Duration.Quarter);
        expect(secondBeat!.nextBeat!.duration).toEqual(Duration.Quarter);
        expect(secondBeat!.duration).toEqual(750); 
        expect(secondBeat!.tickDuration).toEqual(960); 
    });
});
