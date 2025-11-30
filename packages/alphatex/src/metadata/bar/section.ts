import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const section: MetadataTagDefinition = {
    tag: '\\section',
    snippet: '\\section "$1" $0',
    shortDescription: 'Starts a new section',
    signatures: [
        {
            parameters: [
                {
                    name: 'text',
                    shortDescription: 'The text/description of the new section',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'marker',
                    shortDescription: 'The marker for the section, typically a single letter',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                },
                {
                    name: 'text',
                    shortDescription: 'The text/description of the new section',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    reservedIdentifiers: ['x', '-', 'r']
                }
            ]
        }
    ],
    examples: `
        \\section "Intro" // simple section
        1.1 1.1 1.1 1.1 | 1.1 1.1 1.1 1.1 |
        \\section "S" "Solo" // with marker and section name differently
        1.1 1.1 1.1 1.1
        `
};
