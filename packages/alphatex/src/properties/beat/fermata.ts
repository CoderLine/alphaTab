import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

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
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('FermataType')
                },
                {
                    name: 'length',
                    shortDescription: 'The fermata length',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.OptionalAsFloat,
                    defaultValue: 0
                }
            ]
        }
    ],
    examples: `
        G4 G4 G4 { fermata medium 4 }
        `
};
