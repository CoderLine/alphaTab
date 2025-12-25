import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
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
                    name: 'marks',
                    shortDescription: 'The number of tremolo marks',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    valuesOnlyForCompletion: true,
                    values: [
                        { name: '1', snippet: '1', shortDescription: '1 tremolo mark (8th notes)' },
                        { name: '2', snippet: '2', shortDescription: '2 tremolo mark (16th notes)' },
                        { name: '3', snippet: '3', shortDescription: '3 tremolo mark (32nd notes)' },
                        { name: '4', snippet: '4', shortDescription: '4 tremolo mark (64th notes)' },
                        { name: '5', snippet: '5', shortDescription: '5 tremolo mark (128th notes)' }
                    ]
                },
                {
                    name: 'style',
                    shortDescription: 'The tremolo style',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    ...enumParameter('TremoloPickingStyle')
                }
            ]
        }
    ],
    examples: [
        `
        3.3{tp 1} 3.3{tp 2} 3.3{tp 3} 
        `,
        `
        \\title "Buzz Rolls"
        3.3{tp (0 buzzRoll)} // no audio 
        3.3{tp (1 buzzRoll)} // 8th notes tremolo shown as buzzroll
        `
    ]
};
