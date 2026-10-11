/**
 * The sync timeline: one marker per beat of every played bar (repeats expanded), placed on the
 * media time axis. Markers with `syncBpm` are sync points; the others are positioned from the
 * tempo of the sync point before them.
 *
 * Everything here is plain data in, plain data out, so it is independent of a live alphaTab API.
 */

export type MarkerKind = 'start' | 'bar' | 'beat' | 'end';

export interface SyncMarker {
    /** Stable across edits of the same score. */
    id: string;
    kind: MarkerKind;
    masterBarIndex: number;
    masterBarStart: number;
    masterBarEnd: number;
    /** How often the bar was played before, for repeats. */
    occurence: number;
    /** 0-based beat within the bar the marker is on (or nearest to). */
    beat: number;
    synthTick: number;
    /** Position in ms when played with the score's own tempo. */
    synthTime: number;
    synthBpm: number;
    /** Position in ms on the media. */
    syncTime: number;
    /** Set exactly on sync points: the tempo from this marker to the next sync point. */
    syncBpm?: number;
}

/** A played bar, as in alphaTab's `MidiTickLookup.masterBars`. */
export interface TimelineBar {
    masterBarIndex: number;
    start: number;
    end: number;
    timeSignatureNumerator: number;
    tempoChanges: { tick: number; tempo: number }[];
}

/** As in alphaTab's `BackingTrackSyncPoint`. */
export interface GeneratedSyncPoint {
    masterBarIndex: number;
    masterBarOccurence: number;
    synthTick: number;
    synthTime: number;
    synthBpm: number;
    syncTime: number;
    syncBpm: number;
}

export interface TimelineInput {
    tempo: number;
    bars: TimelineBar[];
    /** `MidiFileGenerator.generateSyncPoints(score, createNew)` for the same score. */
    syncPoints: GeneratedSyncPoint[];
}

export const QUARTER_TICKS = 960;
/** Sync points this close to a beat (as a share of the beat) count as on it, e.g. a `\sync` at bar position 0.666. */
const ON_BEAT_TOLERANCE = 0.02;

export function ticksToMilliseconds(ticks: number, bpm: number): number {
    return (ticks * 60000) / (bpm * QUARTER_TICKS);
}

export function isSyncPoint(marker: SyncMarker): boolean {
    return marker.syncBpm !== undefined;
}

function markerId(barIndex: number, occurence: number, tick: number): string {
    return `${barIndex}.${occurence}@${Math.round(tick)}`;
}

/** Builds the markers for `input`; sync points present in `input.syncPoints` become active markers. */
export function buildMarkers(input: TimelineInput): SyncMarker[] {
    const markers: SyncMarker[] = [];
    if (input.bars.length === 0) return markers;
    const occurences = new Map<number, number>();
    const syncPoints = input.syncPoints;
    let nextSyncPoint = 0;

    let synthBpm = input.tempo;
    let syncBpm = synthBpm;
    let synthTick = 0;
    let synthTime = 0;
    let syncTime = 0;

    for (const bar of input.bars) {
        const occurence = occurences.get(bar.masterBarIndex) ?? 0;
        occurences.set(bar.masterBarIndex, occurence + 1);

        const beatTicks = (bar.end - bar.start) / bar.timeSignatureNumerator;
        let tempoChange = 0;

        for (let tick = bar.start; tick <= bar.end; tick += beatTicks) {
            let hasMarkerAtTick = false;

            while (
                nextSyncPoint < syncPoints.length &&
                syncPoints[nextSyncPoint].synthTick <= tick &&
                syncPoints[nextSyncPoint].masterBarIndex === bar.masterBarIndex &&
                syncPoints[nextSyncPoint].masterBarOccurence === occurence
            ) {
                const point = syncPoints[nextSyncPoint];
                markers.push({
                    id: markerId(bar.masterBarIndex, occurence, point.synthTick),
                    kind: point.synthTick === bar.start ? 'bar' : 'beat',
                    masterBarIndex: bar.masterBarIndex,
                    masterBarStart: bar.start,
                    masterBarEnd: bar.end,
                    occurence,
                    beat: Math.round((point.synthTick - bar.start) / beatTicks),
                    synthTick: point.synthTick,
                    synthTime: point.synthTime,
                    synthBpm: point.synthBpm,
                    syncTime: point.syncTime,
                    syncBpm: point.syncBpm,
                });
                hasMarkerAtTick ||= Math.abs(point.synthTick - tick) <= beatTicks * ON_BEAT_TOLERANCE;
                synthBpm = point.synthBpm;
                syncBpm = point.syncBpm;
                synthTime = point.synthTime;
                syncTime = point.syncTime;
                synthTick = point.synthTick;
                nextSyncPoint++;
            }

            while (tempoChange < bar.tempoChanges.length && bar.tempoChanges[tempoChange].tick < tick) {
                const change = bar.tempoChanges[tempoChange];
                // Changes before the last sync point are already part of its tempo.
                if (change.tick >= synthTick) {
                    const diff = change.tick - synthTick;
                    synthTime += ticksToMilliseconds(diff, synthBpm);
                    syncTime += ticksToMilliseconds(diff, syncBpm);
                    synthTick = change.tick;
                    // Without a sync point here, the media keeps the same speed ratio to the score.
                    syncBpm *= change.tempo / synthBpm;
                    synthBpm = change.tempo;
                }
                tempoChange++;
            }

            const diff = tick - synthTick;
            if (diff > 0) {
                synthTime += ticksToMilliseconds(diff, synthBpm);
                syncTime += ticksToMilliseconds(diff, syncBpm);
            }
            synthTick = tick;

            if (!hasMarkerAtTick && tick < bar.end) {
                markers.push({
                    id: markerId(bar.masterBarIndex, occurence, tick),
                    kind: tick === bar.start ? 'bar' : 'beat',
                    masterBarIndex: bar.masterBarIndex,
                    masterBarStart: bar.start,
                    masterBarEnd: bar.end,
                    occurence,
                    beat: Math.round((tick - bar.start) / beatTicks),
                    synthTick: tick,
                    synthTime,
                    synthBpm,
                    syncTime,
                });
            }
        }
    }

    const lastBar = input.bars[input.bars.length - 1];
    const last = markers[markers.length - 1];
    if (lastBar.end > last.synthTick) {
        const diff = lastBar.end - synthTick;
        if (diff > 0) {
            synthTime += ticksToMilliseconds(diff, synthBpm);
            syncTime += ticksToMilliseconds(diff, syncBpm);
        }
        markers.push({
            id: 'end',
            kind: 'end',
            masterBarIndex: lastBar.masterBarIndex,
            masterBarStart: lastBar.start,
            masterBarEnd: lastBar.end,
            occurence: occurences.get(lastBar.masterBarIndex)! - 1,
            beat: lastBar.timeSignatureNumerator,
            synthTick: lastBar.end,
            synthTime,
            synthBpm,
            syncTime,
        });
    } else {
        markers[markers.length - 1] = { ...last, kind: 'end' };
    }
    markers[0] = { ...markers[0], kind: 'start' };
    return markers;
}

/** The synthesizer's own duration of the timeline in ms. */
export function synthDuration(markers: SyncMarker[]): number {
    return markers.length > 0 ? markers[markers.length - 1].synthTime : 0;
}
