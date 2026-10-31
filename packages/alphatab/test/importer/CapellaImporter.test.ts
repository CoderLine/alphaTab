import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { Clef } from '@coderline/alphatab/model/Clef';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { Score } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { describe, expect, it } from 'vitest';

describe('CapellaImporterTests', () => {
    function pitches(staff: Staff): number[][] {
        return staff.bars.map(b => b.voices[0].beats.map(beat => (beat.isRest ? -1 : beat.notes[0].realValue)));
    }

    function capXml(noteObjects: string): Score {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score xmlns="http://www.capella.de/CapXML/3.0">
  <info/>
  <layout>
    <staves>
      <staffLayout description="Voice"><notation defaultClef="treble"/><sound instr="0" volume="100"/></staffLayout>
    </staves>
  </layout>
  <systems>
    <system>
      <staves>
        <staff layout="Voice" defaultTime="4/4">
          <voices><voice><noteObjects>${noteObjects}</noteObjects></voice></voices>
        </staff>
      </staves>
    </system>
  </systems>
</score>`;
        return ScoreLoader.loadScoreFromBytes(IOHelper.stringToBytes(xml), new Settings());
    }

    it('grand-staff', async () => {
        const data = await TestPlatform.loadFile('test-data/capella/twinkle-mozart.capx');
        const score = ScoreLoader.loadScoreFromBytes(data, new Settings());

        expect(score.title).toBe('Twinkle, Twinkle Little Star');
        expect(score.artist).toBe('W.A. Mozart (1756-1791)');
        expect(score.tracks[0].name).toBe('Piano');
        expect(score.masterBars.length).toBe(4);
        expect(score.tempo).toBe(100);
        expect(score.tracks.length).toBe(1);

        const [rightHand, leftHand] = score.tracks[0].staves;
        expect(score.tracks[0].staves.length).toBe(2);
        expect(rightHand.bars[0].clef).toBe(Clef.G2);
        expect(leftHand.bars[0].clef).toBe(Clef.F4);
        expect(pitches(rightHand)).toEqual([
            [60, 60, 67, 67],
            [69, 69, 67],
            [65, 65, 64, 64],
            [62, 62, 60]
        ]);
        expect(pitches(leftHand)).toEqual([
            [48, 52, 55, 52],
            [53, 57, 55, 52],
            [50, 53, 48, 52],
            [43, 47, 48]
        ]);
        expect(rightHand.bars[1].voices[0].beats[2].duration).toBe(Duration.Half);
        expect(rightHand.bars[0].voices[0].beats.map(b => b.lyrics![0])).toEqual(['Twin-', 'kle,', 'twin-', 'kle,']);
    });

    it('whole-notes-and-rests', () => {
        const score = capXml(`
            <chord><duration base="1/1"/><heads><head pitch="C5"/></heads></chord>
            <barline type="single"/>
            <rest><duration base="1/1"/></rest>
            <barline type="single"/>
            <rest><duration base="1"/></rest>
            <barline type="single"/>
            <chord><duration base="1/2"/><heads><head pitch="E5"/></heads></chord>
            <rest><duration base="1/2"/></rest>
            <barline type="end"/>`);

        const staff = score.tracks[0].staves[0];
        expect(score.masterBars.length).toBe(4);
        expect(pitches(staff)).toEqual([[60], [-1], [-1], [64, -1]]);
        expect(staff.bars[1].voices[0].beats[0].isFullBarRest).toBe(true);
        expect(staff.bars[2].voices[0].beats[0].isFullBarRest).toBe(true);
        expect(staff.bars[0].voices[0].beats[0].isFullBarRest).toBe(false);
        expect(score.masterBars.map(m => m.isAnacrusis)).toEqual([false, false, false, false]);
    });
});
