import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@src/documentation/types';

export const tp: PropertyDoc = {
    property: 'tp',
    syntax: ['tp speed'],
    snippet: 'tp $1$0',
    shortDescription: 'Tremolo Picking',
    longDescription: `Add a tremolo picking to the beat.`,
    values: [
        {
            name: 'speed',
            shortDescription: 'The tremolo picking speed',
            type: '`number`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    [
                        { name: '8', snippet: '8', shortDescription: '8th Notes' },
                        { name: '16', snippet: '16', shortDescription: '16th Notes' },
                        { name: '32', snippet: '32', shortDescription: '32nd Notes' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        3.3{tp 8} 3.3{tp 16} 3.3{tp 32}
        `
};
