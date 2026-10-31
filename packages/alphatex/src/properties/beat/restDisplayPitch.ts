import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const restDisplayPitch: PropertyDefinition = {
    property: 'restDisplayPitch',
    snippet: 'restDisplayPitch $1$0',
    shortDescription: 'Rest Display Pitch',
    longDescription: `Define the pitch on which the rest symbol should be placed.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'pitch',
                    shortDescription: 'The note pitch defining the position, like C4',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        r.4{ restDisplayPitch C4 } C4
        `
};
