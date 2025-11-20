import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';

export const singleTrackTrackNamePolicy: MetadataTagDefinition = {
    tag: '\\singleTrackTrackNamePolicy',
    snippet: '\\singleTrackTrackNamePolicy ${1:firstSystem}$0',
    shortDescription: 'Sets the track name visibility when rendering single tracks.',
    longDescription: `
    Configures on which systems to show the [track names](https://next.alphatab.net/docs/showcase/general#track-names) when only a single track is rendered.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('TrackNamePolicy')
                }
            ]
        }
    ],
    examples: `
      \\singletracktracknamepolicy AllSystems
          \\track "Piano 1" "pno1" { defaultsystemslayout 3 }
            C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 | C4 D4 E4 F4 |
    `
};
