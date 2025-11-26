import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const ot: PropertyDefinition = {
    property: 'ot',
    snippet: 'ot $1$0',
    shortDescription: 'Ottava',
    longDescription: `Adds a octave change (ottava) to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The octave shift to apply',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('Ottavia')
                }
            ]
        }
    ],
    examples: `
    3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
    `
};
