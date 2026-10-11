import type { model } from '@coderline/alphatab';

/** Where the sync points of an external backing track come from. */
export type SyncPointSource =
    /** Already in the notation file: GP `SyncPoint` automations or alphaTex `\sync`. */
    | { from: 'score' }
    /** JSON array of `FlatSyncPoint`, as exported by the Playground's sync editor. */
    | { from: 'url'; url: string }
    | { from: 'inline'; points: model.FlatSyncPoint[] };

export type BackingTrackSource =
    /** Guitar Pro 8 file carrying its own audio and sync points. */
    | { kind: 'embedded' }
    /** Audio fetched separately, only when the backing track is going to play. */
    | { kind: 'external'; audioUrl: string; syncPoints: SyncPointSource };

/**
 * Author description of what a file offers. Which source actually plays is
 * decided by the player instance and the site-wide preference, never here.
 */
export interface ScoreSource {
    url?: string;
    tex?: string;
    backingTrack?: BackingTrackSource;
}
