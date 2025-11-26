import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const firstSystemTrackNameMode: MetadataTagDefinition = {
    tag: '\\firstSystemTrackNameMode',
    snippet: '\\firstSystemTrackNameMode ${1:shortName}$0',
    shortDescription: 'The text how to show as track names',
    longDescription: `
    Configures the text how to show as [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the first system.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('TrackNameMode')
                }
            ]
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
