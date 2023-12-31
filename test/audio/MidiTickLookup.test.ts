import { ScoreLoader } from '@src/importer/ScoreLoader';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Logger } from '@src/Logger';
import { AlphaSynthMidiFileHandler, MasterBarTickLookup, MidiFile, MidiFileGenerator, MidiTickLookup, MidiTickLookupFindBeatResult } from '@src/midi';
import { MidiUtils } from '@src/midi/MidiUtils';
import { Beat, Duration, MasterBar, Score } from '@src/model';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('MidiTickLookupTest', () => {
    function buildLookup(score: Score, settings: Settings): MidiTickLookup {
        const midiFile = new MidiFile();
        const handler = new AlphaSynthMidiFileHandler(midiFile);
        const midiFileGenerator = new MidiFileGenerator(score, settings, handler);
        midiFileGenerator.generate();
        return midiFileGenerator.tickLookup;
    }

    it('variant-a', () => {
        const lookup = new MidiTickLookup();

        const masterBarLookup = new MasterBarTickLookup();
        masterBarLookup.masterBar = new MasterBar();
        masterBarLookup.start = 0;
        masterBarLookup.tempo = 120;
        masterBarLookup.end = masterBarLookup.start + masterBarLookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBarLookup);

        const nb = new Beat();
        lookup.addBeat(nb, 0, MidiUtils.QuarterTime);

        expect(masterBarLookup.firstBeat).to.be.ok;
        expect(masterBarLookup.firstBeat!.start).to.equal(0);
        expect(masterBarLookup.firstBeat!.end).to.equal(MidiUtils.QuarterTime);
        expect(masterBarLookup.firstBeat!.highlightedBeats.length).to.equal(1);
        expect(masterBarLookup.firstBeat!.highlightedBeats[0]).to.equal(nb);
    })

    function prepareVariantTest(): MidiTickLookup {
        const lookup = new MidiTickLookup();

        const masterBarLookup = new MasterBarTickLookup();
        masterBarLookup.masterBar = new MasterBar();
        masterBarLookup.start = 0;
        masterBarLookup.tempo = 120;
        masterBarLookup.end = masterBarLookup.start + masterBarLookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBarLookup);

        lookup.addBeat(new Beat(), MidiUtils.QuarterTime * 0, MidiUtils.QuarterTime);
        lookup.addBeat(new Beat(), MidiUtils.QuarterTime * 1, MidiUtils.QuarterTime);

        expect(masterBarLookup.firstBeat).to.be.ok;
        expect(masterBarLookup.firstBeat!.start).to.equal(0);
        expect(masterBarLookup.firstBeat!.end).to.equal(MidiUtils.QuarterTime);
        expect(masterBarLookup.firstBeat!.highlightedBeats.length).to.equal(1);

        expect(masterBarLookup.lastBeat).to.be.ok;
        expect(masterBarLookup.lastBeat!.start).to.equal(MidiUtils.QuarterTime);
        expect(masterBarLookup.lastBeat!.end).to.equal(2 * MidiUtils.QuarterTime);
        expect(masterBarLookup.lastBeat!.highlightedBeats.length).to.equal(1);

        expect(masterBarLookup.firstBeat!.nextBeat).to.equal(masterBarLookup.lastBeat);

        return lookup;
    }

    it('variant-b', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, masterBar.lastBeat!.end, MidiUtils.QuarterTime);

        const n1 = masterBar.lastBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(MidiUtils.QuarterTime * 2);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 3);

        expect(l1).to.equal(masterBar.firstBeat!);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2.nextBeat).to.equal(n1);
    })

    it('variant-c', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, masterBar.lastBeat!.end + MidiUtils.QuarterTime, MidiUtils.QuarterTime);

        const n1 = masterBar.lastBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(MidiUtils.QuarterTime * 2);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 4);

        expect(l1).to.equal(masterBar.firstBeat!);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2.nextBeat).to.equal(n1);
        expect(n1).to.equal(masterBar.lastBeat!);
    })


    it('variant-d', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime);
        expect(n1.end).to.equal(0);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-e', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime * 2, MidiUtils.QuarterTime * 2);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime * 2);
        expect(n1.end).to.equal(0);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-f', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime * 0.5, MidiUtils.QuarterTime);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime * 0.5);
        expect(n1.end).to.equal(0);

        expect(n2.highlightedBeats.length).to.equal(2);
        expect(n2.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n2.highlightedBeats[1]).to.equal(nb);
        expect(n2.start).to.equal(0);
        expect(n2.end).to.equal(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).to.equal(1);
        expect(l1.start).to.equal(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(n2);
        expect(n2.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-g', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 2);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime);
        expect(n1.end).to.equal(0);

        expect(l1.highlightedBeats.length).to.equal(2);
        expect(l1.highlightedBeats[1]).to.equal(nb);
        expect(l1.start).to.equal(0);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-h-variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 2.5);

        const n1 = masterBar.firstBeat!;
        const n2 = l1.nextBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime);
        expect(n1.end).to.equal(0);

        expect(l1.highlightedBeats.length).to.equal(2);
        expect(l1.highlightedBeats[1]).to.equal(nb);
        expect(l1.start).to.equal(0);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(n2.highlightedBeats.length).to.equal(2);
        expect(n2.highlightedBeats[0]).to.equal(l2.highlightedBeats[0]);
        expect(n2.highlightedBeats[1]).to.equal(nb);
        expect(n2.start).to.equal(MidiUtils.QuarterTime);
        expect(n2.end).to.equal(MidiUtils.QuarterTime * 1.5);

        expect(l2.highlightedBeats.length).to.equal(1);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1.5);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(n2);
        expect(n2.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-i', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.5, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n1.start).to.equal(0);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).to.equal(2);
        expect(l1.highlightedBeats[1]).to.equal(nb);
        expect(l1.start).to.equal(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).to.equal(1);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })


    it('variant-j', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.25, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n1.start).to.equal(0);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 0.25);

        expect(n2.highlightedBeats.length).to.equal(2);
        expect(n2.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n2.highlightedBeats[1]).to.equal(nb);
        expect(n2.start).to.equal(MidiUtils.QuarterTime * 0.25);
        expect(n2.end).to.equal(MidiUtils.QuarterTime * 0.75);

        expect(l1.highlightedBeats.length).to.equal(1);
        expect(l1.start).to.equal(MidiUtils.QuarterTime * 0.75);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).to.equal(1);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(n2);
        expect(n2.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-k-variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.25, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n1.start).to.equal(0);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 0.25);

        expect(n2.highlightedBeats.length).to.equal(2);
        expect(n2.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n2.highlightedBeats[1]).to.equal(nb);
        expect(n2.start).to.equal(MidiUtils.QuarterTime * 0.25);
        expect(n2.end).to.equal(MidiUtils.QuarterTime * 0.75);

        expect(l1.highlightedBeats.length).to.equal(1);
        expect(l1.start).to.equal(MidiUtils.QuarterTime * 0.75);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).to.equal(1);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(n2);
        expect(n2.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-l', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start, MidiUtils.QuarterTime);

        expect(l1.highlightedBeats.length).to.equal(2);
        expect(l1.highlightedBeats[1]).to.equal(nb);

        expect(l1).to.equal(masterBar.firstBeat!);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).to.equal(2);
        expect(n1.highlightedBeats[0]).to.equal(l1.highlightedBeats[0]);
        expect(n1.highlightedBeats[1]).to.equal(nb);
        expect(n1.start).to.equal(0);
        expect(n1.end).to.equal(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).to.equal(1);
        expect(l1.start).to.equal(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).to.equal(1);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2).to.equal(masterBar.lastBeat!);
    })

    it('variant-h-variant-n-variant-b', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 4);

        const n1 = masterBar.firstBeat!;
        const n2 = l2.nextBeat!;

        expect(n1.highlightedBeats.length).to.equal(1);
        expect(n1.highlightedBeats[0]).to.equal(nb);
        expect(n1.start).to.equal(-MidiUtils.QuarterTime);
        expect(n1.end).to.equal(0);

        expect(l1.highlightedBeats.length).to.equal(2);
        expect(l1.highlightedBeats[1]).to.equal(nb);
        expect(l1.start).to.equal(0);
        expect(l1.end).to.equal(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).to.equal(2);
        expect(l2.highlightedBeats[1]).to.equal(nb);
        expect(l2.start).to.equal(MidiUtils.QuarterTime * 1);
        expect(l2.end).to.equal(MidiUtils.QuarterTime * 2);

        expect(n2.highlightedBeats.length).to.equal(1);
        expect(n2.highlightedBeats[0]).to.equal(nb);
        expect(n2.start).to.equal(MidiUtils.QuarterTime * 2);
        expect(n2.end).to.equal(MidiUtils.QuarterTime * 3);

        expect(n1).to.equal(masterBar.firstBeat!);
        expect(n1.nextBeat).to.equal(l1);
        expect(l1.nextBeat).to.equal(l2);
        expect(l2.nextBeat).to.equal(n2);
        expect(n2).to.equal(masterBar.lastBeat!);
    })

    it('cursor-snapping', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/cursor-snapping.gp');
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(buffer, settings);
        const lookup = buildLookup(score, settings);

        const tracks = new Set<number>([0]);

        // initial lookup should detect correctly first rest on first voice 
        // with the quarter rest on the second voice as next beat
        const firstBeat = lookup.findBeat(tracks, 0, null);

        expect(firstBeat!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id);
        expect(firstBeat!.nextBeat!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(firstBeat!.beat.duration).to.equal(Duration.Whole);
        expect(firstBeat!.nextBeat!.beat.duration).to.equal(Duration.Quarter);

        // Duration must only go to the next rest on the second voice despite the whole note 
        expect(firstBeat!.duration).to.equal(750);
        expect(firstBeat!.beatLookup.duration).to.equal(960);

        // Still playing first beat
        const stillFirst = lookup.findBeat(tracks, 400, firstBeat);
        expect(stillFirst!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id);
        expect(stillFirst!.nextBeat!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(stillFirst!.beat.duration).to.equal(Duration.Whole);
        expect(stillFirst!.nextBeat!.beat.duration).to.equal(Duration.Quarter);
        expect(stillFirst!.duration).to.equal(750);
        expect(stillFirst!.beatLookup.duration).to.equal(960);

        // Now we're past the second rest heading to the third
        const secondBeat = lookup.findBeat(tracks, 970 /* after first quarter */, stillFirst);
        expect(secondBeat!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(secondBeat!.nextBeat!.beat.id).to.equal(score.tracks[0].staves[0].bars[0].voices[1].beats[2].id);
        expect(secondBeat!.beat.duration).to.equal(Duration.Quarter);
        expect(secondBeat!.nextBeat!.beat.duration).to.equal(Duration.Quarter);
        expect(secondBeat!.duration).to.equal(750);
        expect(secondBeat!.beatLookup.duration).to.equal(960);
    });


    function lookupTest(
        tex: string,
        ticks: number[],
        trackIndexes: number[],
        durations: number[],
        currentBeatFrets: number[],
        nextBeatFrets: (number | null)[]
    ) {
        const buffer = ByteBuffer.fromString(tex);
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(buffer.getBuffer(), settings);
        const lookup = buildLookup(score, settings);

        const tracks = new Set<number>(trackIndexes);

        let currentLookup: MidiTickLookupFindBeatResult | null = null;

        const actualIncrementalFrets: number[] = [];
        const actualIncrementalNextFrets: (number|null)[] = [];
        const actualIncrementalTickDurations: number[] = [];
        
        const actualCleanFrets: number[] = [];
        const actualCleanNextFrets: (number|null)[] = [];
        const actualCleanTickDurations: number[] = [];
        
        for (let i = 0; i < ticks.length; i++) {
            currentLookup = lookup.findBeat(tracks, ticks[i], currentLookup);

            Logger.debug("Test", `Checking index ${i} with tick ${ticks[i]}`)
            expect(currentLookup).to.be.ok;
            actualIncrementalFrets.push(currentLookup!.beat.notes[0].fret);
            actualIncrementalNextFrets.push(currentLookup!.nextBeat?.beat?.notes?.[0]?.fret ?? null)
            actualIncrementalTickDurations.push(currentLookup!.tickDuration)

            
            const cleanLookup = lookup.findBeat(tracks, ticks[i], null);

            actualCleanFrets.push(cleanLookup!.beat.notes[0].fret);
            actualCleanNextFrets.push(cleanLookup!.nextBeat?.beat?.notes?.[0]?.fret ?? null)
            actualCleanTickDurations.push(cleanLookup!.tickDuration)
        }

        expect(actualIncrementalFrets.join(',')).to.equal(currentBeatFrets.join(','));
        expect(actualIncrementalNextFrets.join(',')).to.equal(nextBeatFrets.join(','));
        expect(actualIncrementalTickDurations.join(',')).to.equal(durations.join(','));

        expect(actualCleanFrets.join(',')).to.equal(currentBeatFrets.join(','));
        expect(actualCleanNextFrets.join(',')).to.equal(nextBeatFrets.join(','));
        expect(actualCleanTickDurations.join(',')).to.equal(durations.join(','));
    }



    function nextBeatSearchTest(trackIndexes: number[],
        durations: number[],
        currentBeatFrets: number[],
        nextBeatFrets: (number | null)[]
    ) {
        lookupTest(
            `
            \\tempo 67
            .
            \\track "T01"
            \\ts 1 4 1.1.8 2.1.8 | 6.1.8 7.1.8 | 
            \\track "T02"
            3.1.16 4.1.16 5.1.8 | 8.1.16 9.1.16 10.1.8
        `,
            [
                0, 120, 240, 360, 480, 600, 720, 840, 960,
                1080, 1200, 1320, 1440, 1560, 1680, 1800
            ],
            trackIndexes,
            durations,
            currentBeatFrets,
            nextBeatFrets
        )
    }


    it('next-beat-search-multi-track', () => {
        nextBeatSearchTest(
            [0, 1],
            [
                240, 240, 240, 240, 480, 480, 480, 480,
                240, 240, 240, 240, 480, 480, 480, 480
            ],
            [
                1, 1, 4, 4, 2, 2, 2, 2,
                6, 6, 9, 9, 7, 7, 7, 7
            ],
            [
                4, 4, 2, 2, 6, 6, 6, 6,
                9, 9, 7, 7, null, null, null, null
            ]
        )
    });

    it('next-beat-search-track-1', () => {
        nextBeatSearchTest(
            [0],
            [
                480, 480, 480, 480, 480, 480, 480, 480,
                480, 480, 480, 480, 480, 480, 480, 480
            ],
            [
                1, 1, 1, 1, 2, 2, 2, 2,
                6, 6, 6, 6, 7, 7, 7, 7
            ],
            [
                2, 2, 2, 2, 6, 6, 6, 6,
                7, 7, 7, 7, null, null, null, null
            ]
        )
    });

    it('lookup-triplet-feel-reference', () => {
        lookupTest(
            `\\ts 2 4
            1.1.4{tu 3} 2.1.8{tu 3} 3.1.4{tu 3} 4.1.8{tu 3} | 5.1.4{tu 3} 6.1.8{tu 3} 7.1.4{tu 3} 8.1.8{tu 3}`,
            [
                0, 640, 960, 1600, 
                1920, 2560, 2880, 3520
            ],
            [0],
            [
                640, 320, 640, 320,
                640, 320, 640, 320
            ],
            [
                1, 2, 3, 4,
                5, 6, 7, 8
            ],
            [
                2, 3, 4, 5,
                6, 7, 8, null
            ]
        )
    });

    it('lookup-triplet-feel-test', () => {
        lookupTest(
            `\\tf triplet-8th \\ts 2 4
            1.1.8 2.1.8 3.1.8 4.1.8 | 5.1.8 6.1.8 7.1.8 8.1.8`,
            [
                0, 640, 960, 1600, 
                1920, 2560, 2880, 3520
            ],
            [0],
            [
                640, 320, 640, 320,
                640, 320, 640, 320
            ],
            [
                1, 2, 3, 4,
                5, 6, 7, 8
            ],
            [
                2, 3, 4, 5,
                6, 7, 8, null
            ]
        )
    });

    it('visible-on-next-bar', () => {
        lookupTest(
            `
            \\track "First"
            \\ts 2 4
            1.1.4 2.1.4 | 3.1.4 4.1.4
            \\track "Second"
            1.1.16*8 | 1.1.16*8 
            `,
            [
                0, 480, 960, 1440, 
                1920, 2400, 2880, 3360
            ],
            [0],
            [
                
                960, 960, 960, 960,
                960, 960, 960, 960
            ],
            [
                1, 1, 2, 2,
                3, 3, 4, 4
            ],
            [
                2, 2, 3, 3,
                4, 4, null, null
            ]
        )
    });
});
