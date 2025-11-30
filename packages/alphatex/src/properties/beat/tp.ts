import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const tp: PropertyDefinition = {
    property: 'tp',
    snippet: 'tp $1$0',
    shortDescription: 'Tremolo Picking',
    longDescription: `Add a tremolo picking to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'speed',
                    shortDescription: 'The tremolo picking speed',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    values: [
                        { name: '8', snippet: '8', shortDescription: '8th Notes' },
                        { name: '16', snippet: '16', shortDescription: '16th Notes' },
                        { name: '32', snippet: '32', shortDescription: '32nd Notes' }
                    ]
                }
            ]
        }
    ],
    examples: `
        3.3{tp 8} 3.3{tp 16} 3.3{tp 32}
        `
};
