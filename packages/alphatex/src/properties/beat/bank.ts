import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const bank: PropertyDefinition = {
    property: 'bank',
    snippet: 'bank $1$0',
    shortDescription: 'MIDI Bank Change',
    longDescription: `Adds a instrument bank change to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The new MIDI bank',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 C4 C4 {instrument 25 bank 2} C4
        `
};
