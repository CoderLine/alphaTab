import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../types';

export const otherSystemsTrackNameOrientation: MetadataDoc = {
    tag: '\\otherSystemsTrackNameOrientation',
    syntax: ['\\otherSystemsTrackNameOrientation orientation'],
    snippet: '\\otherSystemsTrackNameOrientation ${1:vertical}$0',
    description: `
    Configures the orientation of the [track names](https://next.alphatab.net/docs/showcase/general#track-names) on the second and subsequent systems.
    `,
    values: [
        {
            name: 'orientation',
            description: 'The orientation to use',
            type: '`horizontal` or `vertical`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'horizontal',
                            description: 'Text is shown horizontally (left-to-right).',
                            snippet: 'horizontal'
                        },
                        { name: 'vertical', description: 'Vertically rotated (bottom-to-top).', snippet: 'vertical' }
                    ]
                ]
            ])
        }
    ],
    example: `
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
