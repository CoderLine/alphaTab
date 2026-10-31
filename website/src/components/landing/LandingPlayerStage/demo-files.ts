import * as Riffs from '@site/src/tex-riffs';
import type { ScoreSource } from '@coderline/alphatab-ui';

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
        id: 'iron-waltz',
        label: 'iron-waltz.gp',
        ext: 'gp',
        trackColor: 'var(--at-accent)',
        // The .gp carries the sync points but not the audio, so the score renders without the 2 MB download.
        source: {
            url: '/files/iron-waltz.gp',
            backingTrack: {
                kind: 'external',
                audioUrl: '/files/iron-waltz.ogg',
                syncPoints: { from: 'score' },
            },
        },
    },
    {
        id: 'canon-ensemble',
        label: 'canon-ensemble.gp',
        ext: 'gp',
        trackColor: 'var(--at-track-indigo)',
        source: { url: '/files/pachelbel-canon-ensemble.gp' },
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
