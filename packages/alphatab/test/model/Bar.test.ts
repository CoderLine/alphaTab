import { describe, expect, it } from 'vitest';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { SustainPedalMarkerType } from '@coderline/alphatab/model/Bar';
import { Settings } from '@coderline/alphatab/Settings';

describe('BarTests', () => {
    it('sustain-pedal-retake-after-held-bar', () => {
        // the pedal is held into the second bar, lifted and pressed again
        const score = ScoreLoader.loadAlphaTex('C4.4 {spd} C4 C4 C4 | C4 C4 {spu} C4 {spd} C4', new Settings());
        const markers = score.tracks[0].staves[0].bars[1].sustainPedals;
        expect(markers.map(m => m.pedalType)).toEqual([SustainPedalMarkerType.Up, SustainPedalMarkerType.Down]);
        expect(markers[0].previousPedalMarker).toBe(score.tracks[0].staves[0].bars[0].sustainPedals[0]);
        expect(markers[1].previousPedalMarker).toBeNull();
    });
});
