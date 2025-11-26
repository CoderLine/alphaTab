import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

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
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 C4 C4 {instrument 25 bank 2} C4
        `
};
