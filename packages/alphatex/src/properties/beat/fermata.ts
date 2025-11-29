import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const fermata: PropertyDefinition = {
    property: 'fermata',
    snippet: 'fermata $1$0',
    shortDescription: 'Fermata',
    longDescription: `Adds a fermata to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'type',
                    shortDescription: 'The fermata type',
                    parseMode: ArgumentListParseTypesMode.Required,
                    ...enumParameter('FermataType')
                },
                {
                    name: 'length',
                    shortDescription: 'The fermata length',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.OptionalAsFloat,
                    defaultValue: 0
                }
            ]
        }
    ],
    examples: `
        G4 G4 G4 { fermata medium 4 }
        `
};
