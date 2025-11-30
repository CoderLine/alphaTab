import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const spu: MetadataTagDefinition = {
    tag: '\\spu',
    snippet: '\\spu $1 $0',
    shortDescription: 'Add a sustain pedal lift up',
    longDescription: `
    Specifies how the sustain petal should be pressed down (\`spd\`), held (\`sph\`) or lifted up (\`spu\`).

    This tag allows specifying the sustain pedal relative to the bar. The sustain pedal can also be applied via beat properties.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'position',
                    shortDescription: 'The relative position within the bar for the marker (0-1)',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsFloat,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: `
        \\spd 0
        \\spu 0.25
        \\spd 0.5
        \\sph 0.75
        \\spu 1
        :8 C4 * 8
        `
};
