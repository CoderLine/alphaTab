import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../types';

export const firstSystemTrackNameMode: MetadataDoc = {
    tag: '\\firstSystemTrackNameMode',
    syntax: ['\\firstSystemTrackNameMode mode'],
    snippet: '\\firstSystemTrackNameMode ${1:shortName}$0',
    description: `
    Configures the text how to show as [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the first system.
    `,
    values: [
       {
        name: 'mode',
        description: 'The mode to use',
        type: '`shortName` or `fullName`',
        required: true,
        values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
          [AlphaTexNodeType.Ident, [
            {name: 'shortName', description: 'Short Track names (abbreviations) are displayed.', snippet: 'shortName'},
            {name: 'fullName', description: 'Full track names are displayed.', snippet: 'fullName'},
          ]]
        ])
      }
    ],
    example: `
    \\singletracktracknamepolicy AllSystems
    \\firstsystemtracknamemode fullname
    \\othersystemstracknamemode shortname
    \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
      C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
