import { describe, expect, it } from 'vitest';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { Logger } from '@coderline/alphatab/Logger';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';

import { MasterBarTickLookup, MasterBarTickLookupTempoChange } from '@coderline/alphatab/midi/MasterBarTickLookup';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import {
    MidiTickLookup,
    type MidiTickLookupFindBeatResult,
    MidiTickLookupFindBeatResultCursorMode
} from '@coderline/alphatab/midi/MidiTickLookup';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Note } from '@coderline/alphatab/model/Note';
import { Score } from '@coderline/alphatab/model/Score';
import { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { PlaybackRange } from '@coderline/alphatab/synth/PlaybackRange';

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
        masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(0, 120));
        masterBarLookup.end = masterBarLookup.start + masterBarLookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBarLookup);

        const nb = new Beat();
        lookup.addBeat(nb, 0, MidiUtils.QuarterTime);

        expect(masterBarLookup.firstBeat).toBeTruthy();
        expect(masterBarLookup.firstBeat!.start).toBe(0);
        expect(masterBarLookup.firstBeat!.end).toBe(MidiUtils.QuarterTime);
        expect(masterBarLookup.firstBeat!.highlightedBeats.length).toBe(1);
        expect(masterBarLookup.firstBeat!.highlightedBeats[0].beat).toBe(nb);
    });

    function prepareVariantTest(): MidiTickLookup {
        const lookup = new MidiTickLookup();

        const masterBarLookup = new MasterBarTickLookup();
        masterBarLookup.masterBar = new MasterBar();
        masterBarLookup.start = 0;
        masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(0, 120));
        masterBarLookup.end = masterBarLookup.start + masterBarLookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBarLookup);

        lookup.addBeat(new Beat(), MidiUtils.QuarterTime * 0, MidiUtils.QuarterTime);
        lookup.addBeat(new Beat(), MidiUtils.QuarterTime * 1, MidiUtils.QuarterTime);

        expect(masterBarLookup.firstBeat).toBeTruthy();
        expect(masterBarLookup.firstBeat!.start).toBe(0);
        expect(masterBarLookup.firstBeat!.end).toBe(MidiUtils.QuarterTime);
        expect(masterBarLookup.firstBeat!.highlightedBeats.length).toBe(1);

        expect(masterBarLookup.lastBeat).toBeTruthy();
        expect(masterBarLookup.lastBeat!.start).toBe(MidiUtils.QuarterTime);
        expect(masterBarLookup.lastBeat!.end).toBe(2 * MidiUtils.QuarterTime);
        expect(masterBarLookup.lastBeat!.highlightedBeats.length).toBe(1);

        expect(masterBarLookup.firstBeat!.nextBeat).toBe(masterBarLookup.lastBeat);

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

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(MidiUtils.QuarterTime * 2);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 3);

        expect(l1).toBe(masterBar.firstBeat!);
        expect(l1.nextBeat).toBe(l2);
        expect(l2.nextBeat).toBe(n1);
    });

    it('variant-c', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, masterBar.lastBeat!.end + MidiUtils.QuarterTime, MidiUtils.QuarterTime);

        const n1 = masterBar.lastBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(MidiUtils.QuarterTime * 2);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 4);

        expect(l1).toBe(masterBar.firstBeat!);
        expect(l1.nextBeat).toBe(l2);
        expect(l2.nextBeat).toBe(n1);
        expect(n1).toBe(masterBar.lastBeat!);
    });

    it('variant-d', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime);
        expect(n1.end).toBe(0);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-e', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime * 2, MidiUtils.QuarterTime * 2);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime * 2);
        expect(n1.end).toBe(0);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-f', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime * 0.5, MidiUtils.QuarterTime);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime * 0.5);
        expect(n1.end).toBe(0);

        expect(n2.highlightedBeats.length).toBe(2);
        expect(n2.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n2.highlightedBeats[1].beat).toBe(nb);
        expect(n2.start).toBe(0);
        expect(n2.end).toBe(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).toBe(1);
        expect(l1.start).toBe(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(n2);
        expect(n2.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-g', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 2);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime);
        expect(n1.end).toBe(0);

        expect(l1.highlightedBeats.length).toBe(2);
        expect(l1.highlightedBeats[1].beat).toBe(nb);
        expect(l1.start).toBe(0);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-h-variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 2.5);

        const n1 = masterBar.firstBeat!;
        const n2 = l1.nextBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime);
        expect(n1.end).toBe(0);

        expect(l1.highlightedBeats.length).toBe(2);
        expect(l1.highlightedBeats[1].beat).toBe(nb);
        expect(l1.start).toBe(0);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(n2.highlightedBeats.length).toBe(2);
        expect(n2.highlightedBeats[0].beat).toBe(l2.highlightedBeats[0].beat);
        expect(n2.highlightedBeats[1].beat).toBe(nb);
        expect(n2.start).toBe(MidiUtils.QuarterTime);
        expect(n2.end).toBe(MidiUtils.QuarterTime * 1.5);

        expect(l2.highlightedBeats.length).toBe(1);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1.5);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(n2);
        expect(n2.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-i', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.5, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n1.start).toBe(0);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).toBe(2);
        expect(l1.highlightedBeats[1].beat).toBe(nb);
        expect(l1.start).toBe(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).toBe(1);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-j', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.25, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n1.start).toBe(0);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 0.25);

        expect(n2.highlightedBeats.length).toBe(2);
        expect(n2.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n2.highlightedBeats[1].beat).toBe(nb);
        expect(n2.start).toBe(MidiUtils.QuarterTime * 0.25);
        expect(n2.end).toBe(MidiUtils.QuarterTime * 0.75);

        expect(l1.highlightedBeats.length).toBe(1);
        expect(l1.start).toBe(MidiUtils.QuarterTime * 0.75);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).toBe(1);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(n2);
        expect(n2.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-k-variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start + MidiUtils.QuarterTime * 0.25, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;
        const n2 = n1.nextBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n1.start).toBe(0);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 0.25);

        expect(n2.highlightedBeats.length).toBe(2);
        expect(n2.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n2.highlightedBeats[1].beat).toBe(nb);
        expect(n2.start).toBe(MidiUtils.QuarterTime * 0.25);
        expect(n2.end).toBe(MidiUtils.QuarterTime * 0.75);

        expect(l1.highlightedBeats.length).toBe(1);
        expect(l1.start).toBe(MidiUtils.QuarterTime * 0.75);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).toBe(1);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(n2);
        expect(n2.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-l', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start, MidiUtils.QuarterTime);

        expect(l1.highlightedBeats.length).toBe(2);
        expect(l1.highlightedBeats[1].beat).toBe(nb);

        expect(l1).toBe(masterBar.firstBeat!);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-m', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start, MidiUtils.QuarterTime * 0.5);

        const n1 = masterBar.firstBeat!;

        expect(n1.highlightedBeats.length).toBe(2);
        expect(n1.highlightedBeats[0].beat).toBe(l1.highlightedBeats[0].beat);
        expect(n1.highlightedBeats[1].beat).toBe(nb);
        expect(n1.start).toBe(0);
        expect(n1.end).toBe(MidiUtils.QuarterTime * 0.5);

        expect(l1.highlightedBeats.length).toBe(1);
        expect(l1.start).toBe(MidiUtils.QuarterTime * 0.5);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).toBe(1);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2).toBe(masterBar.lastBeat!);
    });

    it('variant-h-variant-n-variant-b', () => {
        const lookup = prepareVariantTest();
        const masterBar = lookup.masterBars[0];
        const l1 = masterBar.firstBeat!;
        const l2 = masterBar.lastBeat!;

        const nb = new Beat();
        lookup.addBeat(nb, l1.start - MidiUtils.QuarterTime, MidiUtils.QuarterTime * 4);

        const n1 = masterBar.firstBeat!;
        const n2 = l2.nextBeat!;

        expect(n1.highlightedBeats.length).toBe(1);
        expect(n1.highlightedBeats[0].beat).toBe(nb);
        expect(n1.start).toBe(-MidiUtils.QuarterTime);
        expect(n1.end).toBe(0);

        expect(l1.highlightedBeats.length).toBe(2);
        expect(l1.highlightedBeats[1].beat).toBe(nb);
        expect(l1.start).toBe(0);
        expect(l1.end).toBe(MidiUtils.QuarterTime);

        expect(l2.highlightedBeats.length).toBe(2);
        expect(l2.highlightedBeats[1].beat).toBe(nb);
        expect(l2.start).toBe(MidiUtils.QuarterTime * 1);
        expect(l2.end).toBe(MidiUtils.QuarterTime * 2);

        expect(n2.highlightedBeats.length).toBe(1);
        expect(n2.highlightedBeats[0].beat).toBe(nb);
        expect(n2.start).toBe(MidiUtils.QuarterTime * 2);
        expect(n2.end).toBe(MidiUtils.QuarterTime * 3);

        expect(n1).toBe(masterBar.firstBeat!);
        expect(n1.nextBeat).toBe(l1);
        expect(l1.nextBeat).toBe(l2);
        expect(l2.nextBeat).toBe(n2);
        expect(n2).toBe(masterBar.lastBeat!);
    });

    function beatWithFret(fret: number) {
        const b = new Beat();
        b.notes.push(new Note());
        b.notes[0].fret = fret;
        return b;
    }

    function idOfBeat(beat: Beat | null) {
        return beat ? beat.id : -1;
    }

    function prepareGraceMultiVoice(graceNoteOverlap: number, graceNoteDuration: number): MidiTickLookup {
        const lookup = new MidiTickLookup();

        const masterBar1Lookup = new MasterBarTickLookup();
        masterBar1Lookup.masterBar = new MasterBar();
        masterBar1Lookup.masterBar!.timeSignatureNumerator = 3;
        masterBar1Lookup.masterBar!.timeSignatureDenominator = 4;
        masterBar1Lookup.start = 0;
        masterBar1Lookup.tempoChanges.push(new MasterBarTickLookupTempoChange(0, 120));
        masterBar1Lookup.end = masterBar1Lookup.start + masterBar1Lookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBar1Lookup);

        // voice 0
        // - normal
        lookup.addBeat(beatWithFret(0), MidiUtils.QuarterTime * 0, MidiUtils.QuarterTime * 2);
        // - shortened due to grace
        lookup.addBeat(beatWithFret(1), MidiUtils.QuarterTime * 2, MidiUtils.QuarterTime - graceNoteOverlap);

        // voice 1
        // - normal
        lookup.addBeat(beatWithFret(2), MidiUtils.QuarterTime * 0, MidiUtils.QuarterTime * 3);

        const masterBar2Lookup = new MasterBarTickLookup();
        masterBar2Lookup.masterBar = new MasterBar();
        masterBar2Lookup.masterBar!.timeSignatureNumerator = 3;
        masterBar2Lookup.masterBar!.timeSignatureDenominator = 4;
        masterBar2Lookup.start = masterBar2Lookup.end;
        masterBar2Lookup.tempoChanges.push(new MasterBarTickLookupTempoChange(0, 120));
        masterBar2Lookup.end = masterBar2Lookup.start + masterBar2Lookup.masterBar.calculateDuration();
        lookup.addMasterBar(masterBar2Lookup);

        // grace note
        lookup.addBeat(beatWithFret(3), -graceNoteOverlap, graceNoteDuration);
        // normal note
        const onNoteSteal = -graceNoteOverlap + graceNoteDuration;
        lookup.addBeat(beatWithFret(4), onNoteSteal, MidiUtils.QuarterTime - onNoteSteal);

        return lookup;
    }

    it('grace-multivoice-full-in-previous-bar', () => {
        const lookup = prepareGraceMultiVoice(120, 120);

        //
        // validate first bar
        let current = lookup.masterBars[0].firstBeat!;

        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('0,2');
        expect(current.start).toBe(0);
        expect(current.duration).toBe(1920);

        current = current.nextBeat!;
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('1,2');
        expect(current.start).toBe(1920);
        // quarter note ends earlier due to grace note
        expect(current.duration).toBe(840);

        current = current.nextBeat!;
        // on last slice we have the grace note but not the quarter note
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('2,3');
        expect(current.start).toBe(2760);
        expect(current.duration).toBe(120);

        //
        // validate second bar
        current = lookup.masterBars[1].firstBeat!;

        // no grace note, normal quarter note
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('4');
        expect(current.start).toBe(0);
        expect(current.duration).toBe(960);
    });

    it('grace-multivoice-with-overlap', () => {
        const lookup = prepareGraceMultiVoice(120, 240);

        //
        // validate first bar
        let current = lookup.masterBars[0].firstBeat!;

        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('0,2');
        expect(current.start).toBe(0);
        expect(current.duration).toBe(1920);

        current = current.nextBeat!;
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('1,2');
        expect(current.start).toBe(1920);
        // quarter note ends earlier due to grace note
        expect(current.duration).toBe(840);

        current = current.nextBeat!;
        // on last slice we have the grace note but not the quarter note
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('2,3');
        expect(current.start).toBe(2760);
        expect(current.duration).toBe(120);

        //
        // validate second bar
        current = lookup.masterBars[1].firstBeat!;

        // half the grace note
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('3');
        expect(current.start).toBe(0);
        expect(current.duration).toBe(120);

        // no grace note, normal quarter note
        current = current.nextBeat!;
        expect(current.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('4');
        expect(current.start).toBe(120);
        expect(current.duration).toBe(840);
    });

    it('cursor-snapping', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/cursor-snapping.gp');
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(buffer, settings);
        const lookup = buildLookup(score, settings);

        const tracks = new Set<number>([0]);

        // initial lookup should detect correctly first rest on first voice
        // with the quarter rest on the second voice as next beat
        const firstBeat = lookup.findBeat(tracks, 0, null);

        expect(firstBeat!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id);
        expect(firstBeat!.nextBeat!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(firstBeat!.beat.duration).toBe(Duration.Whole);
        expect(firstBeat!.nextBeat!.beat.duration).toBe(Duration.Quarter);

        // Duration must only go to the next rest on the second voice despite the whole note
        expect(firstBeat!.duration).toBe(750);
        expect(firstBeat!.beatLookup.duration).toBe(960);

        // Still playing first beat
        const stillFirst = lookup.findBeat(tracks, 400, firstBeat);
        expect(stillFirst!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[0].beats[0].id);
        expect(stillFirst!.nextBeat!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(stillFirst!.beat.duration).toBe(Duration.Whole);
        expect(stillFirst!.nextBeat!.beat.duration).toBe(Duration.Quarter);
        expect(stillFirst!.duration).toBe(750);
        expect(stillFirst!.beatLookup.duration).toBe(960);

        // Now we're past the second rest heading to the third
        const secondBeat = lookup.findBeat(tracks, 970 /* after first quarter */, stillFirst);
        expect(secondBeat!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[1].beats[1].id);
        expect(secondBeat!.nextBeat!.beat.id).toBe(score.tracks[0].staves[0].bars[0].voices[1].beats[2].id);
        expect(secondBeat!.beat.duration).toBe(Duration.Quarter);
        expect(secondBeat!.nextBeat!.beat.duration).toBe(Duration.Quarter);
        expect(secondBeat!.duration).toBe(750);
        expect(secondBeat!.beatLookup.duration).toBe(960);
    });

    it('before-beat-grace-later-bars', () => {
        const settings = new Settings();
        const score = ScoreLoader.loadAlphaTex(
            '\\ts 2 4 1.1.2 | 2.1.4 3.1 | 4.1{gr} 5.1{gr} 6.1.2 | 7.1.4 8.1',
            settings
        );
        const lookup = buildLookup(score, settings);

        // bar 2 contains the grace notes which stole duration from fret 3 beat.
        const bar2 = lookup.masterBars[1];

        let current = bar2.firstBeat;
        expect(current!.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('2');
        expect(current!.start).toBe(0);
        expect(current!.duration).toBe(960);

        current = current!.nextBeat;
        expect(current!.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('3');
        expect(current!.start).toBe(960);
        expect(current!.duration).toBe(840); // 120 ticks stolen by grace beats

        current = current!.nextBeat;
        expect(current!.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('4');
        expect(current!.start).toBe(960 + 840);
        expect(current!.duration).toBe(60);

        current = current!.nextBeat;
        expect(current!.highlightedBeats.map(b => b.beat.notes[0].fret).join(',')).toBe('5');
        expect(current!.start).toBe(960 + 840 + 60);
        expect(current!.duration).toBe(60);
    });

    function lookupTest(
        tex: string,
        ticks: number[],
        trackIndexes: number[],
        durations: number[],
        currentBeatIds: number[],
        nextBeatIds: number[],
        expectedCursorModes: MidiTickLookupFindBeatResultCursorMode[] | null = null,
        skipClean: boolean = false,
        prepareLookup: ((lookup: MidiTickLookup) => void) | null = null
    ) {
        const buffer = ByteBuffer.fromString(tex);
        const settings = new Settings();
        Beat.resetIds();
        const score = ScoreLoader.loadScoreFromBytes(buffer.getBuffer(), settings);
        const lookup = buildLookup(score, settings);

        const tracks = new Set<number>(trackIndexes);

        if (
            (trackIndexes.length === 1 &&
                score.stylesheet.perTrackMultiBarRest &&
                score.stylesheet.perTrackMultiBarRest!.has(trackIndexes[0])) ||
            score.stylesheet.multiTrackMultiBarRest
        ) {
            lookup.multiBarRestInfo = ModelUtils.buildMultiBarRestInfo(
                score.tracks.filter(t => tracks.has(t.index)),
                0,
                score.masterBars.length - 1
            );
        }

        if (prepareLookup) {
            prepareLookup(lookup);
        }

        let currentLookup: MidiTickLookupFindBeatResult | null = null;

        const actualIncrementalIds: number[] = [];
        const actualIncrementalNextIds: number[] = [];
        const actualIncrementalTickDurations: number[] = [];

        const actualCleanIds: number[] = [];
        const actualCleanNextIds: number[] = [];
        const actualCleanTickDurations: number[] = [];
        const actualCursorModes: MidiTickLookupFindBeatResultCursorMode[] = [];

        for (let i = 0; i < ticks.length; i++) {
            currentLookup = lookup.findBeat(tracks, ticks[i], currentLookup);

            Logger.info('Test', `Checking index ${i} with tick ${ticks[i]}`);
            expect(currentLookup).toBeTruthy();
            actualIncrementalIds.push(idOfBeat(currentLookup!.beat));
            actualIncrementalNextIds.push(idOfBeat(currentLookup!.nextBeat?.beat ?? null));
            actualIncrementalTickDurations.push(currentLookup!.tickDuration);
            actualCursorModes.push(currentLookup!.cursorMode);

            if (!skipClean) {
                const cleanLookup = lookup.findBeat(tracks, ticks[i], null);

                actualCleanIds.push(idOfBeat(cleanLookup?.beat ?? null));
                actualCleanNextIds.push(idOfBeat(cleanLookup?.nextBeat?.beat ?? null));
                actualCleanTickDurations.push(cleanLookup?.tickDuration ?? -1);
            }
        }

        expect(actualIncrementalIds.join(','), 'currentBeatIds mismatch').toBe(currentBeatIds.join(','));
        expect(actualIncrementalNextIds.join(','), 'nextBeatIds mismatch').toBe(nextBeatIds.join(','));
        expect(actualIncrementalTickDurations.join(','), 'durations mismatch').toBe(durations.join(','));
        if (expectedCursorModes) {
            expect(expectedCursorModes.map(m => MidiTickLookupFindBeatResultCursorMode[m]).join(','), 'cursorModes mismatch').toBe(
                actualCursorModes.map(m => MidiTickLookupFindBeatResultCursorMode[m]).join(',')
            );
        }

        if (!skipClean) {
            expect(actualCleanIds.join(','), 'cleanIds mismatch').toBe(currentBeatIds.join(','));
            expect(actualCleanNextIds.join(','), 'cleanNextIds mismatch').toBe(nextBeatIds.join(','));
            expect(actualCleanTickDurations.join(','), 'cleanTickDurations mismatch').toBe(durations.join(','));
        }
    }

    function nextBeatSearchTest(
        trackIndexes: number[],
        durations: number[],
        currentBeatFrets: number[],
        nextBeatFrets: number[]
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
            [0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440, 1560, 1680, 1800],
            trackIndexes,
            durations,
            currentBeatFrets,
            nextBeatFrets
        );
    }

    it('next-beat-search-multi-track', () => {
        nextBeatSearchTest(
            [0, 1],
            [240, 240, 240, 240, 480, 480, 480, 480, 240, 240, 240, 240, 480, 480, 480, 480],
            [0, 0, 5, 5, 1, 1, 1, 1, 2, 2, 8, 8, 3, 3, 3, 3],
            [5, 5, 1, 1, 2, 2, 2, 2, 8, 8, 3, 3, -1, -1, -1, -1]
        );
    });

    it('next-beat-search-track-1', () => {
        nextBeatSearchTest(
            [0],
            [480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480],
            [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
            [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, -1, -1, -1, -1]
        );
    });

    it('lookup-triplet-feel-reference', () => {
        lookupTest(
            `\\ts 2 4
            1.1.4{tu 3} 2.1.8{tu 3} 3.1.4{tu 3} 4.1.8{tu 3} | 5.1.4{tu 3} 6.1.8{tu 3} 7.1.4{tu 3} 8.1.8{tu 3}`,
            [0, 640, 960, 1600, 1920, 2560, 2880, 3520],
            [0],
            [640, 320, 640, 320, 640, 320, 640, 320],
            [0, 1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 4, 5, 6, 7, -1]
        );
    });

    it('lookup-triplet-feel-test', () => {
        lookupTest(
            `\\tf triplet-8th \\ts 2 4
            1.1.8 2.1.8 3.1.8 4.1.8 | 5.1.8 6.1.8 7.1.8 8.1.8`,
            [0, 640, 960, 1600, 1920, 2560, 2880, 3520],
            [0],
            [640, 320, 640, 320, 640, 320, 640, 320],
            [0, 1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 4, 5, 6, 7, -1]
        );
    });

    it('incomplete', () => {
        lookupTest(
            `
            \\ts 4 4
            1.1.4 2.1.4 | 3.1.4 4.1.4
            `,
            [
                // first bar, real playback
                0, 480, 960, 1440,
                // gap
                1920, 2400, 2880, 3360,
                // second bar, real playback
                3840, 4320, 4800, 5280,
                // second gap
                5760, 6240, 6720, 7200
            ],
            [0],
            [960, 960, 2880, 2880, 2880, 2880, 2880, 2880, 960, 960, 2880, 2880, 2880, 2880, 2880, 2880],
            [
                // first bar, real playback
                0, 0, 1, 1,
                // gap
                1, 1, 1, 1,
                // second bar, real playback
                2, 2, 3, 3,
                // second gap
                3, 3, 3, 3
            ],
            [
                1, 1, 2, 2,

                2, 2, 2, 2,

                3, 3, -1, -1,

                -1, -1, -1, -1
            ],
            null,
            true
        );
    });

    it('empty-bar', () => {
        lookupTest(
            `
            \\ts 2 4
             | 1.1.1
            `,
            [
                // first bar (empty)
                0, 480, 960, 1440,
                // second bar, real playback
                1920, 2400, 2880, 3360
            ],
            [0],
            [1920, 1920, 1920, 1920, 1920, 1920, 1920, 1920],
            [
                // first bar (empty)
                0, 0, 0, 0,
                // second bar, real playback
                1, 1, 1, 1
            ],
            [1, 1, 1, 1, -1, -1, -1, -1]
        );
    });

    it('multibar-rest-single-rest', () => {
        lookupTest(
            `
            \\track { multiBarRest }
            \\ts 2 4
            1.1.4 2.1.4 |
            r | r | r | r |
            3.1.4 |
            r | r | r |
            \\ro r | r | r | \\rc 2 r |
            r
            `,
            // prettier-ignore
            [
                // 1st bar (two quarters)
                0, 480, 960, 1440,
                // 2nd bar (multirest start)
                1920, 2400, 2880, 3360,
                // 3rd bar (multirest with 2nd bar)
                3840, 4320, 4800, 5280,
                // 4th bar (multirest with 2nd bar)
                5760, 6240, 6720, 7200,
                // 5th bar (multirest with 2nd bar)
                7680, 8160, 8640, 9120,
                // 6th bar
                9600, 10080, 10560, 11040,
                // 7th bar (multirest start)
                11520, 12000, 12480, 12960,
                // 8th bar (multirest with 7th bar)
                13440, 13920, 14400, 14880,
                // 9th bar (multirest with 7th bar)
                15360, 15840, 16320, 16800,

                // 10th bar (multirest start - repeat open)
                17280, 17760, 18240, 18720,
                // 11th bar (multirest with 10th bar)
                19200, 19680, 20160, 20640,
                // 12th bar (multirest with 10th bar)
                21120, 21600, 22080, 22560,
                // 13th bar (multirest with 10th bar -  repeat close)
                23040, 23520, 24000, 24480,

                // 10th bar repated (multirest start - repeat open)
                24960, 25440, 25920, 26400,
                // 11th bar repated (multirest with 10th bar)
                26880, 27360, 27840, 28320,
                // 12th bar repated (multirest with 10th bar)
                28800, 29280, 29760, 30240,
                // 13th bar repated (multirest with 10th bar -  repeat close)
                30720, 31200, 31680, 32160,

                // 14th bar
                32640, 33120, 33600, 34080
            ],
            [0],
            // prettier-ignore
            [
                // 1st bar
                960,
                960,
                960,
                960,
                // 2nd bar - 5th bar (4 bars 2/4)
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                // 6th bar
                960 * 2,
                960 * 2,
                960 * 2,
                960 * 2,
                // 7th bar - 9th bar
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                960 * 2 * 3,
                // 10th - 13th bar
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                // 10th - 13th bar (repeated)
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                960 * 2 * 4,
                // 14th bar
                960 * 2,
                960 * 2,
                960 * 2,
                960 * 2
            ],
            // prettier-ignore
            [
                // first bar (empty)
                0, 0, 1, 1,
                // 2nd bar - 5th bar (4 bars 2/4)
                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                // 6th bar
                6, 6, 6, 6,
                // 7th bar - 9th bar
                7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
                // 10th-13th bar
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                // 10th-13th bar (repeated)
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                // 14th bar
                14, 14, 14, 14
            ],
            // prettier-ignore
            [
                // first bar (empty)
                1, 1, 2, 2,
                // 2nd bar - 5th bar (4 bars 2/4)
                6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                // 6th bar
                7, 7, 7, 7,
                // 7th bar - 9th bar
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                // 10th-13th bar
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                // 10th-13th bar (repeated)
                14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
                // 14th bar
                -1, -1, -1, -1
            ],
            undefined,
            true
        );
    });

    it('multibar-rest-repeat', () => {
        lookupTest(
            `
            \\track { multiBarRest }
            \\ts 2 4
            \\ro r | r | \\rc 2 r |
            r
            `,
            // prettier-ignore
            [
                // 1st bar
                0, 960,
                // 2nd bar
                1920, 2880,
                // 3rd bar
                3840, 4800,
                // 1st bar (repated)
                5760, 6720,
                // 2nd bar (repeated)
                7680, 8640,
                // 3rd bar (repeated)
                9600, 10560,
                // 4th bar
                11520, 12480
            ],
            [0],
            // prettier-ignore
            [
                // 1st bar
                5760, 5760,
                // 2nd bar
                5760, 5760,
                // 3rd bar
                5760, 5760,
                // 1st bar (repated)
                5760, 5760,
                // 2nd bar (repeated)
                5760, 5760,
                // 3rd bar (repeated)
                5760, 5760,
                // 4th bar
                1920, 1920
            ],
            // prettier-ignore
            [
                // 1st bar
                0, 0,
                // 2nd bar
                0, 0,
                // 3rd bar
                0, 0,
                // 1st bar (repated)
                0, 0,
                // 2nd bar (repeated)
                0, 0,
                // 3rd bar (repeated)
                0, 0,
                // 4th bar
                3, 3
            ],
            // prettier-ignore
            [
                // 1st bar
                0, 0,
                // 2nd bar
                0, 0,
                // 3rd bar
                0, 0,
                // 1st bar (repated)
                3, 3,
                // 2nd bar (repeated)
                3, 3,
                // 3rd bar (repeated)
                3, 3,
                // 4th bar
                -1, -1
            ],
            [
                // 1st bar
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,

                // 2nd bar
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,

                // 3rd bar
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,

                // 1st bar (repated)
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 2nd bar (repeated)
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 3rd bar (repeated)
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,

                // 4th bar
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat
            ],
            true
        );
    });

    it('simple-repeat', () => {
        lookupTest(
            `
            C4.2 * 2 |
            C4.2 * 2 |
            \\ro 
            \\rc 2
            C4.2 * 2 |
            C4.2 * 2 |
            C4.2 * 2 |
            `,
            [
                // 1st bar
                0, 960, 1920, 2880,

                // 2nd bar
                3840, 4800, 5760, 6720,

                // 3rd bar
                7680, 8640, 9600, 10560,

                // 3rd bar (repeated)
                11520, 12480, 13440, 14400,

                // 4th bar
                15360, 16320, 17280, 18240,

                // 5th bar
                19200, 20160, 21120, 22080
            ],
            [0],
            [
                // 1st bar
                1920, 1920, 1920, 1920,
                // 2nd bar
                1920, 1920, 1920, 1920,
                // 3rd bar
                1920, 1920, 1920, 1920,
                // 3rd bar (repeated)
                1920, 1920, 1920, 1920,
                // 4th bar
                1920, 1920, 1920, 1920,
                // 5th bar
                1920, 1920, 1920, 1920
            ],
            [
                // 1st bar
                0, 0, 1, 1,
                // 2nd bar
                2, 2, 3, 3,
                // 3rd bar
                4, 4, 5, 5,
                // 3rd bar (repeated)
                4, 4, 5, 5,
                // 4th bar
                6, 6, 7, 7,
                // 5th bar
                8, 8, 9, 9
            ],
            [
                // 1st bar
                1, 1, 2, 2,
                // 2nd bar
                3, 3, 4, 4,
                // 3rd bar
                5, 5, 4, 4,
                // 3rd bar (repeated)
                5, 5, 6, 6,
                // 4th bar
                7, 7, 8, 8,
                // 5th bar
                9, 9, -1, -1
            ],
            [
                // 1st bar
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 2nd bar
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 3rd bar
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                // 3rd bar (repeated)
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 4th bar
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                // 5th bar
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat
            ],
            true
        );
    });

    it('resolves empty beat in mixed-content voice', () => {
        // Regression: in a voice that has both isEmpty and non-empty beats, the tick lookup
        // must still resolve the empty beats so click-to-seek / cursor navigation can land on
        // them. A previous filter in BeatTickLookup.highlightBeat excluded isEmpty beats from
        // non-empty voices, which broke cursor navigation to e.g. recording-grid slots after
        // the first note was recorded.
        const score = new Score();
        const track = new Track();
        track.ensureStaveCount(1);
        score.addTrack(track);
        const staff = track.staves[0];

        const masterBar = new MasterBar();
        score.addMasterBar(masterBar);
        const bar = new Bar();
        staff.addBar(bar);
        const voice = new Voice();
        bar.addVoice(voice);

        const emptyBeat = new Beat();
        emptyBeat.isEmpty = true;
        emptyBeat.duration = Duration.Quarter;
        voice.addBeat(emptyBeat);

        const noteBeat = new Beat();
        noteBeat.duration = Duration.Quarter;
        voice.addBeat(noteBeat);
        noteBeat.addNote(new Note());

        const settings = new Settings();
        score.finish(settings);

        const lookup = buildLookup(score, settings);

        // with the filter removed, an isEmpty beat in a mixed voice should still be findable
        expect(voice.isEmpty).toBe(false);
        const result = lookup.findBeat(new Set<number>([0]), 0);
        expect(result).not.toBe(null);
        expect(result!.beat).toBe(emptyBeat);
    });

    it('multi-beat empty voice produces non-overlapping slices', () => {
        // Regression: _generateBeat previously overrode every beat's audioDuration to
        // masterBarDuration whenever bar.isEmpty was true. That was right for the typical
        // "single whole-bar rest" placeholder case, but in a multi-beat empty voice
        // (e.g. a recording grid of isEmpty=true placeholder slots) it made every beat claim
        // the full bar - the resulting overlapping slices accumulated prior beats into each
        // subsequent slice's highlightedBeats, which broke cursor/highlighting logic.
        const score = new Score();
        const track = new Track();
        track.ensureStaveCount(1);
        score.addTrack(track);
        const staff = track.staves[0];

        const masterBar = new MasterBar();
        score.addMasterBar(masterBar);
        const bar = new Bar();
        staff.addBar(bar);
        const voice = new Voice();
        bar.addVoice(voice);

        const slotCount = 16;
        for (let i = 0; i < slotCount; i++) {
            const b = new Beat();
            b.duration = Duration.Sixteenth;
            b.isEmpty = true;
            voice.addBeat(b);
        }

        const settings = new Settings();
        score.finish(settings);
        expect(bar.isEmpty).toBe(true);
        expect(voice.beats.length).toBe(slotCount);

        const lookup = buildLookup(score, settings);
        const mbLookup = lookup.masterBars[0];

        let slice = mbLookup.firstBeat;
        let sliceIdx = 0;
        while (slice) {
            // every slice must contain exactly one beat - otherwise slices are overlapping
            // and the multi-beat empty voice has regressed.
            expect(slice.highlightedBeats.length, `slice ${sliceIdx} range [${slice.start},${slice.end})`).toBe(1);
            expect(slice.highlightedBeats[0].beat).toBe(voice.beats[sliceIdx]);
            slice = slice.nextBeat;
            sliceIdx++;
        }
        expect(sliceIdx).toBe(slotCount);

        // single-beat empty bar still gets the full-bar override (existing behaviour
        // preserved for the typical whole-bar-rest placeholder case).
        const singleBeatScore = new Score();
        const t = new Track();
        t.ensureStaveCount(1);
        singleBeatScore.addTrack(t);
        const mb2 = new MasterBar();
        singleBeatScore.addMasterBar(mb2);
        const bar2 = new Bar();
        t.staves[0].addBar(bar2);
        const v2 = new Voice();
        bar2.addVoice(v2);
        const placeholder = new Beat();
        placeholder.isEmpty = true;
        placeholder.duration = Duration.Quarter;
        v2.addBeat(placeholder);
        singleBeatScore.finish(settings);

        const singleLookup = buildLookup(singleBeatScore, settings);
        const singleMb = singleLookup.masterBars[0];
        expect(singleMb.firstBeat!.end - singleMb.firstBeat!.start).toBe(singleMb.end - singleMb.start);
    });

    describe('playback-range', () => {
        it('full-bar', () => {
            lookupTest(
                `
            C4.2 * 2 |
            C4.2 * 2 
            `,
                [
                    // 1st bar
                    0, 960, 1920, 2880
                ],
                [0],
                [
                    // 1st bar
                    1920, 1920, 1920, 1920
                ],
                [
                    // 1st bar
                    0, 0, 1, 1
                ],
                [
                    // 1st bar
                    1, 1, 2, 2
                ],
                [
                    // 1st bar
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                    MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat
                ],
                true,
                lookup => {
                    // whole first bar
                    const range = new PlaybackRange();
                    range.startTick = 0;
                    range.endTick = 3840;
                    lookup.playbackRange = range;
                }
            );
        });

        it('mid-bar', () => {
            lookupTest(
                `
            C4.2 * 2 |
            C4.2 * 2 
            `,
                [
                    // 1st bar
                    0, 960, 1920, 2880,

                    // 2nd bar
                    3840, 4800
                ],
                [0],
                [
                    // 1st bar
                    1920, 1920, 1920, 1920,
                    // 2nd bar
                    1920, 1920
                ],
                [
                    // 1st bar
                    0, 0, 1, 1,
                    // 2nd bar
                    2, 2
                ],
                [
                    // 1st bar
                    1, 1, 2, 2,
                    // 2nd bar
                    3, 3
                ],
                [
                    // 1st bar
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    MidiTickLookupFindBeatResultCursorMode.ToNextBext,
                    // 2nd bar
                    MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat,
                    MidiTickLookupFindBeatResultCursorMode.ToEndOfBeat
                ],
                true,
                lookup => {
                    // whole first bar
                    const range = new PlaybackRange();
                    range.startTick = 0;
                    range.endTick = 5760;
                    lookup.playbackRange = range;
                }
            );
        });
    });
});