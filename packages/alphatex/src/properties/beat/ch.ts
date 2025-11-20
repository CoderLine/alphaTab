import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const ch: PropertyDefinition = {
    property: 'ch',
    snippet: 'ch "$1"$0',
    shortDescription: 'Chord',
    longDescription: `
    Adds a chord annotation to the beat.

    If the staff has a definition for this chord it will be shown in the chord diagram list to indicate its usage. The beat still has to define the notes separately.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'chordName',
                    shortDescription: 'The name of the chord',
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
    1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}
    `
};
