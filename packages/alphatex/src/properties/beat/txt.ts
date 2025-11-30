import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const txt: PropertyDefinition = {
    property: 'txt',
    snippet: 'txt "$1"$0',
    shortDescription: 'Text',
    longDescription: `Adds a text annotation to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'text',
                    shortDescription: 'The text to show above the beat',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 {txt "This is a C4 Note"}
        `
};
