import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { buildMarkers, isSyncPoint, type TimelineBar, type TimelineInput } from './timeline';
import { autoSync, canToggle, moveMarker, moveRange, toggleMarker, MIN_SYNC_POINT_GAP_MS } from './edit';
import { createHistory, historyReducer } from './history';
import { toFlatSyncPoints } from './apply';
import { generateSyncCode } from './codegen';
import { buildPeaks, findSongRange } from './audio';

const BAR = 3840; // 4/4 at 960 ticks per quarter

function bars(indexes: number[]): TimelineBar[] {
    return indexes.map((masterBarIndex, i) => ({
        masterBarIndex,
        start: i * BAR,
        end: (i + 1) * BAR,
        timeSignatureNumerator: 4,
        tempoChanges: i === 0 ? [{ tick: 0, tempo: 120 }] : [],
    }));
}

const START_POINT = { masterBarIndex: 0, masterBarOccurence: 0, synthTick: 0, synthTime: 0, synthBpm: 120, syncTime: 0, syncBpm: 120 };

function input(barIndexes = [0, 1], syncPoints = [START_POINT]): TimelineInput {
    return { tempo: 120, bars: bars(barIndexes), syncPoints };
}

const near = (actual: number, expected: number, message?: string) =>
    assert.ok(Math.abs(actual - expected) < 1e-6, `${message ?? ''} expected ${expected}, got ${actual}`);

describe('buildMarkers', () => {
    it('places one marker per beat plus an end marker', () => {
        const markers = buildMarkers(input([0, 1], []));
        assert.equal(markers.length, 9);
        assert.deepEqual(
            markers.map((m) => m.kind),
            ['start', 'beat', 'beat', 'beat', 'bar', 'beat', 'beat', 'beat', 'end'],
        );
        near(markers[8].synthTime, 4000);
        near(markers[4].synthTime, 2000);
        assert.ok(markers.every((m) => !isSyncPoint(m)));
    });

    it('counts repeat occurrences and keeps ids unique', () => {
        const markers = buildMarkers(input([0, 1, 0, 1], []));
        const barStarts = markers.filter((m) => m.kind === 'bar' || m.kind === 'start');
        assert.deepEqual(barStarts.map((m) => [m.masterBarIndex, m.occurence]), [[0, 0], [1, 0], [0, 1], [1, 1]]);
        assert.equal(new Set(markers.map((m) => m.id)).size, markers.length);
    });

    it('takes sync points from the input as active markers', () => {
        const markers = buildMarkers(input());
        assert.ok(isSyncPoint(markers[0]));
        assert.equal(markers.filter(isSyncPoint).length, 1);
    });

    it('does not add a beat marker next to a sync point that is just off the beat', () => {
        const offBeat = { ...START_POINT, synthTick: 1918, synthTime: 999, syncTime: 1500 };
        const markers = buildMarkers(input([0, 1], [START_POINT, offBeat]));
        assert.equal(markers.length, 9);
        assert.ok(isSyncPoint(markers[2]));
        assert.equal(markers[2].beat, 2);
    });

    it('follows tempo changes between sync points', () => {
        const withChange = input([0, 1], []);
        withChange.bars[1].tempoChanges = [{ tick: BAR, tempo: 60 }];
        const markers = buildMarkers(withChange);
        // bar 1 runs at half speed: 4 beats × 1000 ms
        near(markers[8].synthTime, 2000 + 4000);
    });
});

describe('autoSync', () => {
    it('stretches the song over the given media range', () => {
        const markers = autoSync(input(), [1000, 9000]);
        near(markers[0].syncTime, 1000);
        near(markers[8].syncTime, 9000);
        near(markers[4].syncTime, 5000);
        near(markers[0].syncBpm!, 60);
        assert.ok(isSyncPoint(markers[8]));
    });

    it('keeps the score timing without a range', () => {
        const markers = autoSync(input(), null);
        near(markers[8].syncTime, 4000);
    });
});

describe('moveMarker', () => {
    const synced = autoSync(input(), [1000, 9000]);

    it('turns the moved marker into a sync point and re-spaces both sides', () => {
        const moved = moveMarker(synced, 4, 6000);
        assert.ok(isSyncPoint(moved[4]));
        near(moved[4].syncTime, 6000);
        near(moved[0].syncBpm!, 48);
        near(moved[2].syncTime, 3500);
        near(moved[4].syncBpm!, 80);
        near(moved[5].syncTime, 6750);
        near(moved[8].syncTime, 9000);
    });

    it('does not mutate its input', () => {
        const before = JSON.stringify(synced);
        moveMarker(synced, 4, 6000);
        assert.equal(JSON.stringify(synced), before);
    });

    it('clamps between the neighbouring sync points', () => {
        const [lower, upper] = moveRange(synced, 4);
        near(lower, 1000 + MIN_SYNC_POINT_GAP_MS);
        near(upper, 9000 - MIN_SYNC_POINT_GAP_MS);
        near(moveMarker(synced, 4, 100_000)[4].syncTime, upper);
        near(moveMarker(synced, 4, -5)[4].syncTime, lower);
    });
});

describe('toggleMarker', () => {
    const synced = autoSync(input(), [1000, 9000]);

    it('removing a sync point restores the interpolation around it', () => {
        const moved = moveMarker(synced, 4, 6000);
        const removed = toggleMarker(moved, 4);
        assert.ok(!isSyncPoint(removed[4]));
        near(removed[4].syncTime, 5000);
        near(removed[0].syncBpm!, 60);
    });

    it('never toggles the start or end marker', () => {
        assert.equal(canToggle(synced, 0), false);
        assert.equal(canToggle(synced, 8), false);
        assert.equal(toggleMarker(synced, 0), synced);
        assert.equal(toggleMarker(synced, 8), synced);
    });

    it('adding a sync point keeps positions unchanged', () => {
        const added = toggleMarker(synced, 2);
        assert.ok(isSyncPoint(added[2]));
        added.forEach((m, i) => {
            near(m.syncTime, synced[i].syncTime, `marker ${i}`);
        });
    });
});

describe('history', () => {
    it('undoes, redoes and drops the redo stack on a new commit', () => {
        let h = createHistory(1);
        h = historyReducer(h, { type: 'commit', value: 2 });
        h = historyReducer(h, { type: 'commit', value: 3 });
        h = historyReducer(h, { type: 'undo' });
        assert.equal(h.present, 2);
        h = historyReducer(h, { type: 'redo' });
        assert.equal(h.present, 3);
        h = historyReducer(h, { type: 'undo' });
        h = historyReducer(h, { type: 'commit', value: 4 });
        assert.deepEqual([h.past, h.present, h.future], [[1, 2], 4, []]);
        h = historyReducer(h, { type: 'reset', value: 9 });
        assert.deepEqual([h.past, h.present, h.future], [[], 9, []]);
    });
});

describe('export', () => {
    const synced = toggleMarker(autoSync(input(), [1000, 9000]), 2);

    it('flattens sync points with bar-relative positions', () => {
        assert.deepEqual(toFlatSyncPoints(synced), [
            { barIndex: 0, barOccurence: 0, barPosition: 0, millisecondOffset: 1000 },
            { barIndex: 0, barOccurence: 0, barPosition: 0.5, millisecondOffset: 3000 },
            { barIndex: 1, barOccurence: 0, barPosition: 1, millisecondOffset: 9000 },
        ]);
    });

    it('generates code with the real type names', () => {
        const code = generateSyncCode(toFlatSyncPoints(synced));
        const ts = code.find((c) => c.language === 'typescript')!;
        assert.match(ts.data, /alphaTab\.model\.FlatSyncPoint\[\]/);
        assert.doesNotMatch(code.map((c) => c.data).join(), /FlatSyncPoints/);
        assert.equal(code.find((c) => c.language === 'alphatex')!.data, '\\sync (0 0 1000)\n\\sync (0 0 3000 0.5)\n\\sync (1 0 9000 1)');
    });
});

describe('audio analysis', () => {
    it('finds the music between leading and trailing silence', () => {
        const rate = 100;
        const samples = new Float32Array(60 * rate);
        for (let i = 2 * rate; i < 57 * rate; i++) { samples[i] = 0.5 * Math.sin(i); }
        const [start, end] = findSongRange(samples, samples, rate);
        assert.ok(Math.abs(start - 2000) <= 20, `start ${start}`);
        assert.ok(Math.abs(end - 57000) <= 20, `end ${end}`);
    });

    it('builds normalized peak levels', () => {
        const samples = new Float32Array(1024);
        samples[300] = 0.25;
        samples[900] = -0.5;
        const levels = buildPeaks(samples, samples);
        assert.equal(levels[0].length, 8);
        near(levels[0][7], 1);
        near(levels[0][2], 0.5);
        assert.equal(levels[levels.length - 1].length, 1);
        near(levels[levels.length - 1][0], 1);
    });
});
