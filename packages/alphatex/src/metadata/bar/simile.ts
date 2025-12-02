import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

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
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('SimileMark')
                }
            ]
        }
    ],
    examples: `
        3.3*4 | \\simile simple | 3.3*4 | 4.3*4 | \\simile firstofdouble | \\simile secondofdouble
        `
};
