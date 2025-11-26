import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const otherSystemsTrackNameOrientation: MetadataTagDefinition = {
    tag: '\\otherSystemsTrackNameOrientation',
    snippet: '\\otherSystemsTrackNameOrientation ${1:vertical}$0',
    shortDescription: 'The orientation of track names to show for systems after the first one.',
    longDescription: `
    Configures the orientation of the [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the second and subsequent systems.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'orientation',
                    shortDescription: 'The orientation to use',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('TrackNameOrientation')
                }
            ]
        }
    ],
    examples: `
    \\singletracktracknamepolicy AllSystems
      \\firstsystemtracknamemode fullname
      \\othersystemstracknamemode shortname
      \\firstsystemtracknameorientation horizontal
      \\othersystemstracknameorientation vertical

      \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
        \\staff {score}
        C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
