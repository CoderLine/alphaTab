import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../types';

export const singleTrackTrackNamePolicy: MetadataDoc = {
    tag: '\\singleTrackTrackNamePolicy',
    syntax: ['\\singleTrackTrackNamePolicy mode'],
    snippet: '\\singleTrackTrackNamePolicy ${1:firstSystem}$0',
    description: `
    Configures on which systems to show the [track names](https://next.alphatab.net/docs/showcase/general#track-names) when only a single track is rendered.
    `,
    values: [
       {
        name: 'mode',
        description: 'The mode to use',
        type: '`hidden`, `firstSystem` or `allSystems`',
        required: true,
        values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
          [AlphaTexNodeType.Ident, [
            {name: 'hidden', description: 'Track names are hidden everywhere.', snippet: 'hidden'},
            {name: 'firstSystem', description: 'Track names are displayed on the first system.', snippet: 'firstSystem'},
            {name: 'allSystems', description: 'Track names are displayed on all systems.', snippet: 'allSystems'}
          ]]
        ])
      }
    ],
    example: `
      \\singletracktracknamepolicy AllSystems
          \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
            C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
