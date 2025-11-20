import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const scale: MetadataTagDefinition = {
    tag: '\\scale',
    snippet: '\\scale $1 $0',
    shortDescription: 'Adjusts the relative scale of the bar',
    longDescription: `Adjusts the relative scale of the bar when using \`systemsLayoutMode: 'UseModelLayout'\` with the page layout.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'scale',
                    shortDescription: 'The scale of the bar within the system',
                    parseMode: ValueListParseTypesMode.RequiredAsFloat,
                    type: AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: {
        options: { display: { systemsLayoutMode: 'UseModelLayout' } },
        tex: `
        \\track { defaultSystemsLayout 3 }
          \\scale 0.25 :1 c4 | \\scale 0.5 c4 | \\scale 0.25 c4 | 
          \\scale 0.5 c4 | \\scale 2 c4 | \\scale 0.5 c4 |
          c4 | c4
        `
    }
};
