import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@coderline/alphatab-language-server/documentation/types';

export const ottava: MetadataDoc = {
    tag: '\\ottava',
    syntax: ['\\ottava ottava'],
    snippet: '\\ottava $1 $0',
    shortDescription: 'Set the clef ottava.',
    longDescription: `Changes the clef ottave for this and subsequent bars.`,
    values: [
        {
            name: 'ottava',
            shortDescription: 'The clef ottava',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: '15ma', snippet: '15ma', shortDescription: '' },
                        { name: '8va', snippet: '8va', shortDescription: '' },
                        { name: 'regular', snippet: 'regular', shortDescription: '' },
                        { name: '8vb', snippet: '8vb', shortDescription: '' },
                        { name: '15mb', snippet: '15mb', shortDescription: '' }
                    ]
                ]
            ])
        }
    ],
    valueRemarks: `
        Following ottavia are supported: \`15ma\`, \`8va\`, \`regular\`, \`8vb\`, \`15mb\`
        `,
    examples: `
        \\clef F4 \\ottava 15ma | | \\ottava regular | | \\clef C3 \\ottava 8vb | |
        `
};
