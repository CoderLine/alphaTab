import * as alphaTab from '@coderline/alphatab';
import { harmonicValueDocs } from '@coderline/alphatab-alphatex/properties/note/ah';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const sh: PropertyDefinition = {
    property: 'sh',
    snippet: 'sh$0',
    shortDescription: 'Semi Harmonic',
    longDescription: `Applies a semi harmonic effect to the note (for fretted instruments).`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The harmonic value',
                    longDescription: harmonicValueDocs,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional
                }
            ]
        }
    ],
    examples: `
        :8 3.3{nh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
