import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const barre: PropertyDefinition = {
    property: 'barre',
    snippet: 'barre $1$0',
    shortDescription: 'Barré',
    longDescription: `Add a barré chord notation to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'fret',
                    shortDescription: 'The numeric fret for the barre chord',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                },
                {
                    name: 'mode',
                    shortDescription: 'The barre mode',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    defaultValue: 'Full',
                    ...enumParameter('BarreShape')
                }
            ]
        }
    ],
    examples: `
        1.1 {barre 24} 2.1 {barre 24} 3.1 {barre 24} 4.1 |
        1.1 {barre 4 half} 2.1 {barre 4 half} 3.1 {barre 4 half} 4.1 {barre 4 half} |
        `
};
