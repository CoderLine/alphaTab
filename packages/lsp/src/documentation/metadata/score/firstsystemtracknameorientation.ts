import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@src/documentation/types';;

export const firstSystemTrackNameOrientation: MetadataDoc = {
    tag: '\\firstSystemTrackNameOrientation',
    syntax: ['\\firstSystemTrackNameOrientation orientation'],
    snippet: '\\firstSystemTrackNameOrientation ${1:horizontal}$0',
    shortDescription: 'Set the orientation of the track names',
    longDescription: `
    Configures the orientation of the [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the first system.
    `,
    values: [
        {
            name: 'orientation',
            shortDescription: 'The orientation to use',
            type: '`horizontal` or `vertical`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'horizontal',
                            shortDescription: 'Text is shown horizontally (left-to-right).',
                            snippet: 'horizontal'
                        },
                        { name: 'vertical', shortDescription: 'Vertically rotated (bottom-to-top).', snippet: 'vertical' }
                    ]
                ]
            ])
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
