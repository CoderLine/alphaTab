import * as alphaTab from '@coderline/alphatab';

import { harmonicValueDocs } from '@coderline/alphatab-alphatex/properties/note/ah';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const fh: PropertyDefinition = {
    property: 'fh',
    snippet: 'fh$0',
    shortDescription: 'Feedback Harmonic',
    longDescription: `Applies a feedback harmonic effect to the note (for fretted instruments).`,
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
        :8 3.3{fh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
