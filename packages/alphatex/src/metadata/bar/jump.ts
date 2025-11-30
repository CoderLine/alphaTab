import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';


export const jump: MetadataTagDefinition = {
    tag: '\\jump',
    snippet: '\\jump $1 $0',
    shortDescription: 'Adds a direction/jump instruction to the bar.',
    signatures: [
        {
            parameters: [
                {
                    name: 'direction',
                    shortDescription: 'The direction to add',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('Direction')
                }
            ]
        }
    ],
    examples: `
    \\ro \\rc 2 3.3*4 | 
        3.3*4 | 
        \\jump Segno 3.3*4 |
        \\ro \rc 2 3.3*4 | 
        \\jump DaCoda 3.3*4 |
        3.3*4 | 3.3*4
        \\jump DalSegnoAlCoda 3.3*4 |
        3.3*4 |
        \\jump Coda 3.3*4 |
        3.3*4 |
        3.3*4
        `
};
