import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';;

export const multiTrackTrackNamePolicy: MetadataDoc = {
    tag: '\\multiTrackTrackNamePolicy',
    syntax: ['\\multiTrackTrackNamePolicy mode'],
    snippet: '\\multiTrackTrackNamePolicy ${1:firstSystem}$0',
    shortDescription: 'Sets the track name visibility when rendering multiple tracks.',
    longDescription: `
    Configures on which systems to show the [track names](https://next.alphatab.net/docs/showcase/general#track-names) when multiple tracks are rendered.
    `,
    values: [
        {
            name: 'mode',
            shortDescription: 'The mode to use',
            type: '`hidden`, `firstSystem` or `allSystems`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'hidden', shortDescription: 'Track names are hidden everywhere.', snippet: 'hidden' },
                        {
                            name: 'firstSystem',
                            shortDescription: 'Track names are displayed on the first system.',
                            snippet: 'firstSystem'
                        },
                        {
                            name: 'allSystems',
                            shortDescription: 'Track names are displayed on all systems.',
                            snippet: 'allSystems'
                        }
                    ]
                ]
            ])
        }
    ],
    examples: `
      \\singletracktracknamepolicy AllSystems
          \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
            C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
