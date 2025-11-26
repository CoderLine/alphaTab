import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const dy: PropertyDefinition = {
    property: 'dy',
    snippet: 'dy $1$0',
    shortDescription: 'Dynamics',
    longDescription: `Defines the play dynamics for this beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'dynamic',
                    shortDescription: 'The dynamic value to apply',
                    parseMode: ArgumentListParseTypesMode.Required,
                    ...enumParameter('DynamicValue')
                }
            ]
        }
    ],
    examples: `
        \\chord ("C" 0 1 0 2 3 x)
        \\ts 2 4
        (0.1 1.2 0.3 2.4 3.5){ch "C"} (0.1 1.2 0.3 2.4 3.5) |
        (0.1 2.2 2.3 2.4 0.5){ch "A"}
        `
};
