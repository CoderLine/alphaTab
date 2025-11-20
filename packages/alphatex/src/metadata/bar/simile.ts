import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';

export const simile: MetadataTagDefinition = {
    tag: '\\simile',
    snippet: '\\simile $1 $0',
    shortDescription: 'Adds a simile mark to the bar.',
    longDescription:
        'Adds a simile mark to the bar indicating that the content of the last, or previous two bars should be repeated.',
    signatures: [
        {
            parameters: [
                {
                    name: 'mark',
                    shortDescription: 'The mark to add',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('SimileMark')
                }
            ]
        }
    ],
    examples: `
        3.3*4 | \\simile simple | 3.3*4 | 4.3*4 | \\simile firstofdouble | \\simile secondofdouble
        `
};
