import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const sph: MetadataTagDefinition = {
    tag: '\\sph',
    snippet: '\\sph $1 $0',
    shortDescription: 'Add a sustain pedal hold',
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
                    parseMode: ArgumentListParseTypesMode.RequiredAsFloat,
                    type: AlphaTexNodeType.Number
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
