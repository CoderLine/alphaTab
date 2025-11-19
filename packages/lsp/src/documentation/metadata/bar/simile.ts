import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

export const simile: MetadataDoc = {
    tag: '\\simile',
    syntax: ['\\simile mark'],
    snippet: '\\simile $1 $0',
    shortDescription: 'Adds a simile mark to the bar.',
    longDescription: 'Adds a simile mark to the bar indicating that the content of the last, or previous two bars should be repeated.',
    values: [
        {
            name: 'mark',
            shortDescription: 'The mark to add',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'none', snippet: 'none', shortDescription: 'No simile mark is applied' },
                        { name: 'simple', snippet: 'simple', shortDescription: 'A simple simile mark. The previous bar is repeated.' },
                        { name: 'firstofdouble', snippet: 'firstofdouble', shortDescription: 'A double simile mark. This value is assigned to the first bar of the 2 repeat bars.' },
                        { name: 'secondofdouble', snippet: 'secondofdouble', shortDescription: 'A double simile mark. This value is assigned to the second bar of the 2 repeat bars.' },
                    ]
                ]
            ])
        }
    ],
    examples: `
        3.3*4 | \\simile simple | 3.3*4 | 4.3*4 | \\simile firstofdouble | \\simile secondofdouble
        `
};
