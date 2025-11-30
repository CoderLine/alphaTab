import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const multiTrackTrackNamePolicy: MetadataTagDefinition = {
    tag: '\\multiTrackTrackNamePolicy',
    snippet: '\\multiTrackTrackNamePolicy ${1:firstSystem}$0',
    shortDescription: 'Sets the track name visibility when rendering multiple tracks.',
    longDescription: `
    Configures on which systems to show the [track names](https://alphatab.net/docs/showcase/general#track-names) when multiple tracks are rendered.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
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
