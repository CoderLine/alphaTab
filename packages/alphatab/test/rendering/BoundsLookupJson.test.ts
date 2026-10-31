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
import { describe, expect, it } from 'vitest';

// The worker hands the bounds lookup to the main thread via toJson/fromJson.
describe('BoundsLookupJson', () => {
    function makeBounds(x: number, y: number, w: number, h: number): Bounds {
        const b = new Bounds();
        b.x = x;
        b.y = y;
        b.w = w;
        b.h = h;
        return b;
    }

    // two tracks, the second with two staves, two bars each
    function buildScore(): Score {
        const score = new Score();
        for (let i = 0; i < 2; i++) {
            score.addMasterBar(new MasterBar());
        }
        for (let t = 0; t < 2; t++) {
            const track = new Track();
            score.addTrack(track);
            for (let s = 0; s <= t; s++) {
                const staff = new Staff();
                track.addStaff(staff);
                for (let i = 0; i < 2; i++) {
                    const bar = new Bar();
                    staff.addBar(bar);
                    const voice = new Voice();
                    bar.addVoice(voice);
                    voice.addBeat(new Beat());
                }
            }
        }
        return score;
    }

    function buildLookup(score: Score): BoundsLookup {
        const lookup = new BoundsLookup();
        const system = new StaffSystemBounds();
        system.visualBounds = makeBounds(0, 0, 1000, 300);
        system.realBounds = makeBounds(0, 0, 1000, 300);
        lookup.addStaffSystem(system);
        for (let i = 0; i < score.masterBars.length; i++) {
            const mb = new MasterBarBounds();
            mb.index = i;
            mb.visualBounds = makeBounds(i * 500, 0, 500, 300);
            mb.realBounds = makeBounds(i * 500, 0, 500, 300);
            mb.lineAlignedBounds = makeBounds(i * 500, 0, 500, 300);
            lookup.addMasterBar(mb);
            let y = 0;
            for (const track of score.tracks) {
                for (const staff of track.staves) {
                    const bar = staff.bars[i];
                    const bb = new BarBounds();
                    bb.bar = bar;
                    bb.visualBounds = makeBounds(i * 500, y, 500, 100);
                    bb.realBounds = makeBounds(i * 500, y, 500, 100);
                    mb.addBar(bb);
                    const beatBounds = new BeatBounds();
                    beatBounds.beat = bar.voices[0].beats[0];
                    beatBounds.visualBounds = makeBounds(i * 500 + 10, y, 20, 100);
                    beatBounds.realBounds = makeBounds(i * 500, y, 500, 100);
                    bb.addBeat(beatBounds);
                    y += 100;
                }
            }
        }
        lookup.finish();
        return lookup;
    }

    function allBars(lookup: BoundsLookup): BarBounds[] {
        const bars: BarBounds[] = [];
        for (const system of lookup.staffSystems) {
            for (const mb of system.bars) {
                for (const bar of mb.bars) {
                    bars.push(bar);
                }
            }
        }
        return bars;
    }

    it('restores-bar-of-bar-bounds', () => {
        const score = buildScore();
        const original = buildLookup(score);
        const restored = BoundsLookup.fromJson(original.toJson(), score)!;
        restored.finish();

        const expected = allBars(original);
        const actual = allBars(restored);
        expect(actual.length).toBe(expected.length);
        for (let i = 0; i < expected.length; i++) {
            expect(actual[i].bar).toBe(expected[i].bar);
        }
    });

    it('reads-json-without-bar-indexes', () => {
        const score = buildScore();
        const json = buildLookup(score).toJson();
        for (const system of json.get('staffSystems') as Map<string, unknown>[]) {
            for (const mb of system.get('bars') as Map<string, unknown>[]) {
                for (const bar of mb.get('bars') as Map<string, unknown>[]) {
                    bar.delete('barIndex');
                    bar.delete('staffIndex');
                    bar.delete('trackIndex');
                }
            }
        }
        const restored = BoundsLookup.fromJson(json, score)!;
        restored.finish();
        expect(allBars(restored).length).toBe(6);
    });
});
