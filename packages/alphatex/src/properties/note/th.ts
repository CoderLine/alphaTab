import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { harmonicValueDocs } from '@coderline/alphatab-alphatex/properties/note/ah';
import type { PropertyDefinition } from '../../types';

export const th: PropertyDefinition = {
    property: 'th',
    snippet: 'th$0',
    shortDescription: 'Tapped Harmonic',
    longDescription: `Applies a tapped harmonic effect to the note (for fretted instruments).`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The harmonic value',
                    longDescription: harmonicValueDocs,
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.Optional
                }
            ]
        }
    ],
    examples: `
        :8 3.3{nh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
