import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';

export const barlineRight: MetadataDoc = {
    tag: '\\barlineRight',
    syntax: ['\\barlineRight style'],
    snippet: '\\barlineRight $1 $0',
    shortDescription: 'The lines style shown right on the bar.',
    longDescription: `
        Adjusts the lines which will be shown right on the bar.

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
                        { name: 'Automatic', snippet: 'automatic', shortDescription: 'Auto detect line to show' },
                        { name: 'Dashed', snippet: 'dashed', shortDescription: '' },
                        { name: 'Dotted', snippet: 'dotted', shortDescription: '' },
                        { name: 'Heavy', snippet: 'heavy', shortDescription: '' },
                        { name: 'Heavy-Heavy', snippet: 'heavyheavy', shortDescription: '' },
                        { name: 'Heavy-Light', snippet: 'heavylight', shortDescription: '' },
                        { name: 'Light-Heavy', snippet: 'lightheavy', shortDescription: '' },
                        { name: 'Light-Light', snippet: 'lightlight', shortDescription: '' },
                        { name: 'None', snippet: 'none', shortDescription: '' },
                        { name: 'Regular', snippet: 'regular', shortDescription: '' },
                        { name: 'Short', snippet: 'short', shortDescription: '' },
                        { name: 'Tick', snippet: 'tick', shortDescription: '' }
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
