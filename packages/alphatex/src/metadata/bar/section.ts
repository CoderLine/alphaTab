import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

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
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'marker',
                    shortDescription: 'The marker for the section, typically a single letter',
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
                },
                {
                    name: 'text',
                    shortDescription: 'The text/description of the new section',
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
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
