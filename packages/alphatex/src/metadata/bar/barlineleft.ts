import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import type { MetadataTagDefinition } from '../../types';

export const barlineLeft: MetadataTagDefinition = {
    tag: '\\barlineLeft',
    snippet: '\\barlineLeft $1 $0',
    shortDescription: 'The lines style shown left on the bar.',
    longDescription: `
        Adjusts the lines which will be shown left on the bar.

        For some special notation needs, the default bar line can be adjusted on every bar. The bar line styles are aligned with the ones from [MusicXML](https://www.w3.org/2021/06/musicxml40/musicxml-reference/data-types/bar-style/).

        alphaTab attempts to reuse lines on overlapping styles across bars.
        `,
    signatures: [
        {
            parameters: [
                {
                    name: 'style',
                    shortDescription: 'The line style to use',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('BarLineStyle')
                }
            ]
        }
    ],

    examples: `
        \\instrument piano
        \\track "Overlapping"
          \\staff 
              \\barlineleft dashed 
              \\barlineright dotted 
              | 
              \\barlineleft heavyheavy
              \\barlineright heavyheavy
              
          \\staff 
              \\barlineleft lightlight 
              \\barlineright lightheavy 
              | 
              \\barlineleft heavylight
              \\barlineright dashed
        \\track "All Styles"
          \\staff 
              \\barlineright dashed |
              \\barlineright dotted |
              \\barlineright heavy |
              \\barlineright heavyHeavy |
              \\barlineright heavyLight |
              \\barlineright lightHeavy |
              \\barlineright lightlight |
              \\barlineright none |
              \\barlineright regular |
              \\barlineright short |
              \\barlineright tick |
        `
};
