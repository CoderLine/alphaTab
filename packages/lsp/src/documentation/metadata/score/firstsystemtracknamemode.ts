import * as alphaTab from '@coderline/alphatab';
import type { MetadataDoc, ValueItemDoc } from '@src/documentation/types';

export const firstSystemTrackNameMode: MetadataDoc = {
    tag: '\\firstSystemTrackNameMode',
    syntax: ['\\firstSystemTrackNameMode mode'],
    snippet: '\\firstSystemTrackNameMode ${1:shortName}$0',
    shortDescription: 'The text how to show as track names',
    longDescription: `
    Configures the text how to show as [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the first system.
    `,
    values: [
        {
            name: 'mode',
            shortDescription: 'The mode to use',
            type: '`shortName` or `fullName`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'shortName',
                            shortDescription: 'Short Track names (abbreviations) are displayed.',
                            snippet: 'shortName'
                        },
                        { name: 'fullName', shortDescription: 'Full track names are displayed.', snippet: 'fullName' }
                    ]
                ]
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
