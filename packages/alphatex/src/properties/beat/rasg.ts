import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const rasg: PropertyDefinition = {
    property: 'rasg',
    snippet: 'rags $1$0',
    shortDescription: 'Rasgueado',
    longDescription: `Add a rasgueado play pattern to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'pattern',
                    shortDescription: 'The pattern to apply',
                    parseMode: ArgumentListParseTypesMode.Required,
                    ...enumParameter('Rasgueado')
                }
            ]
        }
    ],
    examples: `
        (1.1 3.2 2.3 0.4) * 4 {rasg amii}
        `
};
