import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';

export const barlineLeft: MetadataDoc = {
    tag: '\\barlineLeft',
    syntax: ['\\barlineLeft style'],
    snippet: '\\barlineLeft $1 $0',
    shortDescription: 'The lines style shown left on the bar.',
    longDescription: `
        Adjusts the lines which will be shown left on the bar.

        For some special notation needs, the default bar line can be adjusted on every bar. The bar line styles are aligned with the ones from [MusicXML](https://www.w3.org/2021/06/musicxml40/musicxml-reference/data-types/bar-style/).

        alphaTab attempts to reuse lines on overlapping styles across bars.
        `,
    values: [
        {
            name: 'style',
            shortDescription: 'The line style to use',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'automatic', snippet: 'automatic', shortDescription: 'Auto detect line to show' },
                        { name: 'dashed', snippet: 'dashed', shortDescription: 'Dashed' },
                        { name: 'dotted', snippet: 'dotted', shortDescription: 'Dotted' },
                        { name: 'heavy', snippet: 'heavy', shortDescription: 'Heavy' },
                        { name: 'heavyheavy', snippet: 'heavyheavy', shortDescription: 'Heavy-Heavy' },
                        { name: 'heavylight', snippet: 'heavylight', shortDescription: 'Heavy-Light' },
                        { name: 'lightheavy', snippet: 'lightheavy', shortDescription: 'Light-Heavy' },
                        { name: 'lightlight', snippet: 'lightlight', shortDescription: 'Light-Light' },
                        { name: 'none', snippet: 'none', shortDescription: 'None' },
                        { name: 'regular', snippet: 'regular', shortDescription: 'Regular' },
                        { name: 'short', snippet: 'short', shortDescription: 'Short' },
                        { name: 'tick', snippet: 'tick', shortDescription: 'Tick' }
                    ]
                ]
            ])
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
