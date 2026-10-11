import * as Riffs from '@site/src/tex-riffs';
import type { ScoreSource } from '@site/src/alphatab-react';

export interface DemoFile {
    /** Stable identifier, used in Playground links (`/playground?file=<id>`). */
    id: string;
    label: string;
    ext: string;
    trackColor: string;
    source: ScoreSource;
}

export const DEMO_FILES: DemoFile[] = [
    {
        id: 'canon-ensemble',
        label: 'canon-ensemble.gp',
        ext: 'gp',
        trackColor: 'var(--at-accent)',
        source: { url: '/files/pachelbel-canon-ensemble.gp' },
    },
    {
        id: 'bach-prelude-recording',
        label: 'prelude-recording.alphatex',
        ext: 'tex',
        trackColor: 'var(--at-track-indigo)',
        // TODO: swap with the dedicated backing-track demo file when staged.
        source: {
            tex: Riffs.BACH_PRELUDE_BWV999_SYNCED,
            backingTrack: {
                kind: 'external',
                audioUrl: '/files/Bach_Prelude_BWV999.ogg',
                syncPoints: { from: 'score' },
            },
        },
    },
    {
        id: 'bach-prelude',
        label: 'prelude.musicxml',
        ext: 'mxl',
        trackColor: 'var(--at-track-purple)',
        // TODO: swap with a real /files/landing/prelude.musicxml when staged.
        source: { url: '/files/Bach_Prelude_BWV999.gp' },
    },
    {
        id: 'bach-prelude-c',
        label: 'prelude.alphatex',
        ext: 'tex',
        trackColor: 'var(--at-track-green)',
        source: { tex: Riffs.BACH_PRELUDE_C_LONG },
    },
    {
        id: 'drums',
        label: 'etude.capx',
        ext: 'capx',
        trackColor: 'var(--at-track-orange)',
        // TODO: swap with a real /files/landing/etude.capx when staged.
        source: { url: '/files/features/Drums.gp5' },
    },
];
