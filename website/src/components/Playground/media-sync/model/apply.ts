import type * as alphaTab from '@coderline/alphatab';
import type { AlphaTabApi, model } from '@coderline/alphatab';
import { isSyncPoint, type SyncMarker, type TimelineInput } from './timeline';

/**
 * Reads the timeline of the score loaded in `api`. `createSyncPoints` adds sync points at every
 * tempo change (for an initial sync) instead of using only the ones in the score.
 * `null` until alphaTab has generated the playback for the score. alphaTab is passed in so the
 * model stays free of runtime alphaTab imports.
 */
export function readTimelineInput(module: typeof alphaTab, api: AlphaTabApi, createSyncPoints: boolean): TimelineInput | null {
    const score = api.score;
    const cache = api.tickCache;
    if (!score || !cache || cache.masterBars.length === 0) { return null; }
    return {
        tempo: score.tempo,
        bars: cache.masterBars.map((bar) => ({
            masterBarIndex: bar.masterBar.index,
            start: bar.start,
            end: bar.end,
            timeSignatureNumerator: bar.masterBar.timeSignatureNumerator,
            tempoChanges: bar.tempoChanges.map((c) => ({ tick: c.tick, tempo: c.tempo })),
        })),
        syncPoints: module.midi.MidiFileGenerator.generateSyncPoints(score, createSyncPoints).map((p) => ({
            masterBarIndex: p.masterBarIndex,
            masterBarOccurence: p.masterBarOccurence,
            synthTick: p.synthTick,
            synthTime: p.synthTime,
            synthBpm: p.synthBpm,
            syncTime: p.syncTime,
            syncBpm: p.syncBpm,
        })),
    };
}

export function scoreHasSyncPoints(score: model.Score): boolean {
    return score.masterBars.some((mb) => (mb.syncPoints?.length ?? 0) > 0);
}

export function toFlatSyncPoints(markers: SyncMarker[]): model.FlatSyncPoint[] {
    return markers.filter(isSyncPoint).map((m) => ({
        barIndex: m.masterBarIndex,
        barOccurence: m.occurence,
        barPosition: (m.synthTick - m.masterBarStart) / (m.masterBarEnd - m.masterBarStart),
        millisecondOffset: Math.round(m.syncTime),
    }));
}

/** Replaces the score's sync points and updates the player, keeping the cursor where it is in the notation. */
export function applySyncPoints(api: AlphaTabApi, points: model.FlatSyncPoint[]): void {
    const score = api.score;
    if (!score) { return; }
    const tick = api.tickPosition;
    for (const mb of score.masterBars) { mb.syncPoints = undefined; }
    score.applyFlatSyncPoints(points);
    api.updateSyncPoints();
    api.tickPosition = tick;
}
