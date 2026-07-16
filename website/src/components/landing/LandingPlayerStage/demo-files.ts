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

const SHRED_TEX = `\\title "Shred"
\\tempo 160
.
\\track "Lead"
:16 5.3 7.3 8.3 10.3 7.3 8.3 10.3 12.3
    5.3 7.3 8.3 10.3 7.3 8.3 10.3 12.3 |
:16 12.3 10.3 8.3 7.3 10.3 8.3 7.3 5.3
    12.3 10.3 8.3 7.3 10.3 8.3 7.3 5.3 |`;

export const DEMO_FILES: DemoFile[] = [
    {
        kind: 'url',
        label: 'canon-rock.gp5',
        ext: 'gp5',
        trackColor: 'var(--at-accent)',
        url: '/files/canon-full.gp',
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
        label: 'shred.alphatex',
        ext: 'tex',
        trackColor: 'var(--at-track-green)',
        tex: SHRED_TEX,
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
