import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const tr: PropertyDefinition = {
    property: 'tr',
    snippet: 'tr$0',
    shortDescription: 'Trill',
    longDescription: `Applies a trill effect to the note.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'fret',
                    shortDescription: 'The fret on which to trill',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.Required
                },
                {
                    name: 'duration',
                    shortDescription: 'The duration/speed of the trills',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.Optional,
                    defaultValue: '16',
                    values: [
                        { name: '16', snippet: '16', shortDescription: '16th Note' },
                        { name: '32', snippet: '32', shortDescription: '32nd Note' },
                        { name: '64', snippet: '64', shortDescription: '64th Note' }
                    ]
                }
            ]
        }
    ],
    examples: `
        :4 3.3{tr 4} 3.3{tr 4 16} 3.3{tr 5 32} 3.3{tr 6 64}
        `
};
6;
