import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const otherSystemsTrackNameMode: MetadataTagDefinition = {
    tag: '\\otherSystemsTrackNameMode',
    snippet: '\\otherSystemsTrackNameMode ${1:shortName}$0',
    shortDescription: 'Which track names to show for systems after the first one.',
    longDescription: `
    Configures the text how to show as [track names](https://alphatab.net/docs/showcase/general#track-names) on the second and subsequent systems.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
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
