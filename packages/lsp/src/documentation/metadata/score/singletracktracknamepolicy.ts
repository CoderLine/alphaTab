import * as alphaTab from '@coderline/alphatab';
import type { MetadataDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

export const singleTrackTrackNamePolicy: MetadataDoc = {
    tag: '\\singleTrackTrackNamePolicy',
    syntax: ['\\singleTrackTrackNamePolicy mode'],
    snippet: '\\singleTrackTrackNamePolicy ${1:firstSystem}$0',
    shortDescription: 'Sets the track name visibility when rendering single tracks.',
    longDescription: `
    Configures on which systems to show the [track names](https://next.alphatab.net/docs/showcase/general#track-names) when only a single track is rendered.
    `,
    values: [
        {
            name: 'mode',
            shortDescription: 'The mode to use',
            type: '`hidden`, `firstSystem` or `allSystems`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
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
