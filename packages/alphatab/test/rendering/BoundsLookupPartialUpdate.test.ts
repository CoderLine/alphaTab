import { describe, expect, it } from 'vitest';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { Score } from '@coderline/alphatab/model/Score';
import { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';
// Covers the partial-render preservation path: ScoreRenderer.render reuses an existing
// BoundsLookup when renderHints.firstChangedMasterBar is set, VerticalLayoutBase prunes the
// changed range via BoundsLookup.clearFromMasterBar, and BoundsLookup.finish must remain
// safe to call again without double-scaling the preserved systems.
describe('BoundsLookupPartialUpdate', () => {
    function makeBounds(x: number, y: number, w: number, h: number): Bounds {
        const b = new Bounds();
        b.x = x;
        b.y = y;
        b.w = w;
        b.h = h;
        return b;
    }

    function buildScore(barCount: number, beatsPerBar: number): Score {
        const score = new Score();
        const track = new Track();
        const staff = new Staff();
        track.addStaff(staff);
        score.addTrack(track);
        for (let i = 0; i < barCount; i++) {
            const masterBar = new MasterBar();
            score.addMasterBar(masterBar);
            const bar = new Bar();
            staff.addBar(bar);
            const voice = new Voice();
            bar.addVoice(voice);
            for (let b = 0; b < beatsPerBar; b++) {
                voice.addBeat(new Beat());
            }
        }
        return score;
    }

    function populateLookup(score: Score, barsPerSystem: number): BoundsLookup {
        const lookup = new BoundsLookup();
        const staff = score.tracks[0].staves[0];
        let systemStart = 0;
        while (systemStart < staff.bars.length) {
            const system = new StaffSystemBounds();
            system.visualBounds = makeBounds(0, systemStart * 200, 1000, 100);
            system.realBounds = makeBounds(0, systemStart * 200, 1000, 200);
            lookup.addStaffSystem(system);

            const end = Math.min(systemStart + barsPerSystem, staff.bars.length);
            for (let i = systemStart; i < end; i++) {
                const bar = staff.bars[i];
                const mb = new MasterBarBounds();
                mb.index = i;
                mb.visualBounds = makeBounds(i * 100, systemStart * 200, 100, 100);
                mb.realBounds = makeBounds(i * 100, systemStart * 200, 100, 200);
                mb.lineAlignedBounds = makeBounds(i * 100, systemStart * 200, 100, 100);
                lookup.addMasterBar(mb);

                const bb = new BarBounds();
                bb.bar = bar;
                bb.visualBounds = makeBounds(i * 100, systemStart * 200, 100, 100);
                bb.realBounds = makeBounds(i * 100, systemStart * 200, 100, 200);
                mb.addBar(bb);

                for (const beat of bar.voices[0].beats) {
                    const beatBounds = new BeatBounds();
                    beatBounds.beat = beat;
                    beatBounds.visualBounds = makeBounds(i * 100, systemStart * 200, 20, 100);
                    beatBounds.realBounds = makeBounds(i * 100, systemStart * 200, 20, 200);
                    bb.addBeat(beatBounds);
                }
            }
            systemStart = end;
        }
        return lookup;
    }

    it('StaffSystemBounds.finish is idempotent across multiple calls', () => {
        const system = new StaffSystemBounds();
        system.visualBounds = makeBounds(10, 20, 100, 50);
        system.realBounds = makeBounds(10, 20, 100, 80);

        expect(system.isFinished).toBe(false);

        system.finish(2);

        expect(system.isFinished).toBe(true);
        expect(system.visualBounds.x).toBe(20);
        expect(system.realBounds.w).toBe(200);

        // second finish() call must be a no-op - otherwise preserved systems get double-scaled
        system.finish(2);

        expect(system.visualBounds.x).toBe(20);
        expect(system.realBounds.w).toBe(200);
    });

    it('BoundsLookup.resetForPartialUpdate reopens the lookup for registrations', () => {
        const lookup = new BoundsLookup();
        lookup.finish(1);

        expect(lookup.isFinished).toBe(true);

        lookup.resetForPartialUpdate();

        expect(lookup.isFinished).toBe(false);
    });

    it('BoundsLookup.clearFromMasterBar keeps preserved entries and drops the changed range', () => {
        // 2 systems, 5 bars each (indexes 0-4 in system 0, 5-9 in system 1), 2 beats per bar
        const score = buildScore(10, 2);
        const lookup = populateLookup(score, 5);

        expect(lookup.staffSystems.length).toBe(2);
        expect(lookup.findMasterBarByIndex(0)).not.toBe(null);
        expect(lookup.findMasterBarByIndex(9)).not.toBe(null);

        // partial render targeting system 1 - clear from the first bar of system 1
        lookup.clearFromMasterBar(5);

        // system 0 survives with its bars intact
        expect(lookup.staffSystems.length).toBe(1);
        expect(lookup.findMasterBarByIndex(0)).not.toBe(null);
        expect(lookup.findMasterBarByIndex(4)).not.toBe(null);

        // everything from bar 5 onward is gone
        expect(lookup.findMasterBarByIndex(5)).toBe(null);
        expect(lookup.findMasterBarByIndex(9)).toBe(null);

        // beat lookup: beats in preserved bars still findable, beats in cleared bars are not
        const preservedBeat = score.tracks[0].staves[0].bars[2].voices[0].beats[0];
        const clearedBeat = score.tracks[0].staves[0].bars[7].voices[0].beats[0];
        expect(lookup.findBeat(preservedBeat)).not.toBe(null);
        expect(lookup.findBeat(clearedBeat)).toBe(null);
    });

    it('clearFromMasterBar + re-register preserves already-scaled bounds and scales only new ones', () => {
        const score = buildScore(10, 2);
        const lookup = populateLookup(score, 5);

        // first render: finish once to lock preserved systems at their scaled coords
        lookup.finish(2);
        const preservedSystem0 = lookup.staffSystems[0];
        const preservedRealX = preservedSystem0.realBounds.x;
        const preservedRealW = preservedSystem0.realBounds.w;

        // simulate a partial render: reset, clear the changed range, register new bounds for it
        lookup.resetForPartialUpdate();
        lookup.clearFromMasterBar(5);

        const staff = score.tracks[0].staves[0];
        const newSystem = new StaffSystemBounds();
        newSystem.visualBounds = makeBounds(0, 200, 1000, 100);
        newSystem.realBounds = makeBounds(0, 200, 1000, 200);
        lookup.addStaffSystem(newSystem);
        for (let i = 5; i < 10; i++) {
            const mb = new MasterBarBounds();
            mb.index = i;
            mb.visualBounds = makeBounds(i * 100, 200, 100, 100);
            mb.realBounds = makeBounds(i * 100, 200, 100, 200);
            mb.lineAlignedBounds = makeBounds(i * 100, 200, 100, 100);
            lookup.addMasterBar(mb);

            const bb = new BarBounds();
            bb.bar = staff.bars[i];
            bb.visualBounds = makeBounds(i * 100, 200, 100, 100);
            bb.realBounds = makeBounds(i * 100, 200, 100, 200);
            mb.addBar(bb);
        }

        // finish again at the same scale - preserved system must NOT be re-scaled
        lookup.finish(2);

        expect(preservedSystem0.realBounds.x).toBe(preservedRealX);
        expect(preservedSystem0.realBounds.w).toBe(preservedRealW);

        // the newly registered system gets scaled exactly once
        expect(newSystem.isFinished).toBe(true);
        expect(newSystem.realBounds.w).toBe(2000);
    });
});
