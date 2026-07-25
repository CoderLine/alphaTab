import * as Riffs from '@site/src/tex-riffs';

export type DemoFile =
    | {
          kind: 'url';
          label: string;
          ext: string;
          trackColor: string;
          url: string;
      }
    | {
          kind: 'tex';
          label: string;
          ext: string;
          trackColor: string;
          tex: string;
      };

export const DEMO_FILES: DemoFile[] = [
    {
        kind: 'url',
        label: 'canon-ensemble.gp',
        ext: 'gp',
        trackColor: 'var(--at-accent)',
        url: '/files/pachelbel-canon-ensemble.gp',
    },
    {
        kind: 'url',
        label: 'prelude.musicxml',
        ext: 'mxl',
        trackColor: 'var(--at-track-purple)',
        // TODO: swap with a real /files/landing/prelude.musicxml when staged.
        url: '/files/Bach_Prelude_BWV999.gp',
    },
    {
        kind: 'tex',
        label: 'prelude.alphatex',
        ext: 'tex',
        trackColor: 'var(--at-track-green)',
        tex: Riffs.BACH_PRELUDE_C_LONG,
    },
    {
        kind: 'url',
        label: 'etude.capx',
        ext: 'capx',
        trackColor: 'var(--at-track-orange)',
        // TODO: swap with a real /files/landing/etude.capx when staged.
        url: '/files/features/Drums.gp5',
    },
];
