import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';;

export const otherSystemsTrackNameMode: MetadataDoc = {
    tag: '\\otherSystemsTrackNameMode',
    syntax: ['\\otherSystemsTrackNameMode mode'],
    snippet: '\\otherSystemsTrackNameMode ${1:shortName}$0',
    shortDescription: 'Which track names to show for systems after the first one.',
    longDescription: `
    Configures the text how to show as [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the second and subsequent systems.
    `,
    values: [
       {
        name: 'mode',
        shortDescription: 'The mode to use',
        type: '`shortName` or `fullName`',
        required: true,
        values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
          [AlphaTexNodeType.Ident, [
            {name: 'shortName', shortDescription: 'Short Track names (abbreviations) are displayed.', snippet: 'shortName'},
            {name: 'fullName', shortDescription: 'Full track names are displayed.', snippet: 'fullName'},
          ]]
        ])
      }
    ],
    examples: `
    \\singletracktracknamepolicy AllSystems
    \\firstsystemtracknamemode fullname
    \\othersystemstracknamemode shortname
    \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
      C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
