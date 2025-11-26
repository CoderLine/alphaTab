import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const firstSystemTrackNameOrientation: MetadataTagDefinition = {
    tag: '\\firstSystemTrackNameOrientation',
    snippet: '\\firstSystemTrackNameOrientation ${1:horizontal}$0',
    shortDescription: 'Set the orientation of the track names',
    longDescription: `
    Configures the orientation of the [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the first system.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'orientation',
                    shortDescription: 'The orientation to use',
                    parseMode: ArgumentListParseTypesMode.Required,
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
