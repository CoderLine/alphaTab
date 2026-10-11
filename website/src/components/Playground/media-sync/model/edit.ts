import { buildMarkers, isSyncPoint, ticksToMilliseconds, type SyncMarker, type TimelineInput } from './timeline';

/** Smallest distance kept between neighbouring sync points while moving one. */
export const MIN_SYNC_POINT_GAP_MS = 20;

function previousSyncPointIndex(markers: SyncMarker[], index: number): number {
    let i = index - 1;
    while (i > 0 && !isSyncPoint(markers[i])) i--;
    return Math.max(0, i);
}

function nextSyncPointIndex(markers: SyncMarker[], index: number): number {
    let i = index + 1;
    while (i < markers.length - 1 && !isSyncPoint(markers[i])) i++;
    return Math.min(markers.length - 1, i);
}

/** Media time range `index` can be moved within without passing its neighbouring sync points. */
export function moveRange(markers: SyncMarker[], index: number): [number, number] {
    const lower = index > 0 ? markers[previousSyncPointIndex(markers, index)].syncTime + MIN_SYNC_POINT_GAP_MS : 0;
    const upper = index < markers.length - 1 ? markers[nextSyncPointIndex(markers, index)].syncTime - MIN_SYNC_POINT_GAP_MS : Infinity;
    return [lower, Math.max(lower, upper)];
}

/**
 * Recomputes tempos and positions around `index` after it was moved (or turned into a sync point),
 * or after its sync point was removed (`removed`). Mutates `markers`, which must hold copies.
 */
function relayout(markers: SyncMarker[], index: number, removed: boolean): void {
    let start = previousSyncPointIndex(markers, index);
    let next = nextSyncPointIndex(markers, index);
    const modified = markers[index];

    if (removed) {
        if (next <= index) return;
        const previous = markers[start];
        let bpm = modified.synthBpm;
        if (isSyncPoint(markers[next])) {
            const synth = markers[next].synthTime - previous.synthTime;
            const synced = markers[next].syncTime - previous.syncTime;
            bpm = (synth / synced) * previous.synthBpm;
        } else {
            next++;
        }
        previous.syncBpm = bpm;
        for (let i = start + 1; i < next; i++) {
            markers[i].syncTime = previous.syncTime + ticksToMilliseconds(markers[i].synthTick - previous.synthTick, bpm);
        }
        return;
    }

    let bpmBefore = modified.synthBpm;
    if (start < index) {
        const previous = markers[start];
        const synth = modified.synthTime - previous.synthTime;
        const synced = modified.syncTime - previous.syncTime;
        bpmBefore = (synth / synced) * previous.synthBpm;
        previous.syncBpm = bpmBefore;
        let time = previous.syncTime;
        for (let i = start; i < index; i++) {
            markers[i].syncTime = time;
            time += ticksToMilliseconds(markers[i + 1].synthTick - markers[i].synthTick, bpmBefore);
        }
    } else {
        start = index;
    }

    if (next > index) {
        let bpmAfter: number;
        if (isSyncPoint(markers[next])) {
            const synth = markers[next].synthTime - modified.synthTime;
            const synced = markers[next].syncTime - modified.syncTime;
            bpmAfter = synced > 0 ? (synth / synced) * modified.synthBpm : modified.synthBpm;
        } else {
            bpmAfter = bpmBefore;
            next++;
        }
        modified.syncBpm = bpmAfter;
        let time = modified.syncTime;
        for (let i = index + 1; i < next; i++) {
            time += ticksToMilliseconds(markers[i].synthTick - markers[i - 1].synthTick, bpmAfter);
            markers[i].syncTime = time;
        }
    } else {
        modified.syncBpm ??= bpmBefore;
    }
}

function cloneAll(markers: SyncMarker[]): SyncMarker[] {
    return markers.map((m) => ({ ...m }));
}

/** Moves marker `index` to `timeMs` on the media (clamped between its neighbouring sync points) and makes it a sync point. */
export function moveMarker(markers: SyncMarker[], index: number, timeMs: number): SyncMarker[] {
    if (index < 0 || index >= markers.length) return markers;
    const [lower, upper] = moveRange(markers, index);
    const next = cloneAll(markers);
    next[index].syncTime = Math.min(upper, Math.max(lower, timeMs));
    relayout(next, index, false);
    return next;
}

/** Whether `toggleMarker` can change marker `index`; the start and end markers always stay sync points. */
export function canToggle(markers: SyncMarker[], index: number): boolean {
    const marker = markers[index];
    return !!marker && marker.kind !== 'start' && marker.kind !== 'end';
}

/** Turns marker `index` into a sync point at its current position, or back into a regular marker. */
export function toggleMarker(markers: SyncMarker[], index: number): SyncMarker[] {
    if (!canToggle(markers, index)) return markers;
    const next = cloneAll(markers);
    if (isSyncPoint(next[index])) {
        next[index].syncBpm = undefined;
        relayout(next, index, true);
    } else {
        relayout(next, index, false);
    }
    return next;
}

/**
 * Initial sync for a fresh media: sync points at every tempo change (`input` built with
 * `generateSyncPoints(score, true)`), scaled so the song spans `[startMs, endMs]` of the media.
 * Without a range the score's own timing is kept.
 */
export function autoSync(input: TimelineInput, range: [number, number] | null): SyncMarker[] {
    const markers = buildMarkers(input);
    if (markers.length === 0) return markers;
    markers[0].syncBpm ??= markers[0].synthBpm;
    markers[markers.length - 1].syncBpm ??= markers[markers.length - 1].synthBpm;
    if (!range) return markers;

    const [songStart, songEnd] = range;
    const synthTotal = markers[markers.length - 1].synthTime;
    const scale = synthTotal > 0 ? (songEnd - songStart) / synthTotal : 1;

    const points = markers.filter(isSyncPoint);
    let time = songStart;
    for (let i = 0; i < points.length; i++) {
        points[i].syncTime = time;
        if (i > 0) {
            const previous = points[i - 1];
            previous.syncBpm = ((points[i].synthTime - previous.synthTime) / (points[i].syncTime - previous.syncTime)) * previous.synthBpm;
        }
        const nextSynth = i < points.length - 1 ? points[i + 1].synthTime : points[i].synthTime;
        time += (nextSynth - points[i].synthTime) * scale;
    }

    time = songStart;
    let bpm = points[0].syncBpm!;
    for (let i = 0; i < markers.length; i++) {
        markers[i].syncTime = time;
        if (markers[i].syncBpm) bpm = markers[i].syncBpm!;
        if (i < markers.length - 1) {
            time += ticksToMilliseconds(markers[i + 1].synthTick - markers[i].synthTick, bpm);
        }
    }
    return markers;
}

/** Markers for `input` built without creating sync points, i.e. only the ones the score defines. */
export function markersFromScore(input: TimelineInput): SyncMarker[] {
    return buildMarkers(input);
}
