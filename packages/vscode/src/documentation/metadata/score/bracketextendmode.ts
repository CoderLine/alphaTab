import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';

export const bracketExtendMode: MetadataDoc = {
    tag: '\\bracketExtendMode',
    syntax: ['\\bracketExtendMode mode'],
    snippet: '\\bracketExtendMode ${1:groupStaves}$0',
    shortDescription: `Set the mode for brackets and braces.`,
    longDescription: `Set the mode for [brackets and braces](https://next.alphatab.net/docs/showcase/general#brackets-and-braces).`,
    values: [
      {
        name: 'mode',
        shortDescription: 'The mode to use',
        type: '`noBrackets`, `groupStaves` or `groupSimilarInstruments`',
        required: true,
        values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
          [AlphaTexNodeType.Ident, [
            {name: 'noBrackets', shortDescription: 'No brackets will be drawn at all.', snippet: 'noBrackets'},
            {name: 'groupStaves', shortDescription: 'The staves of the same track will be grouped together. If there are multiple "standard notation" staves a brace will be drawn, otherwise a bracket.', snippet: 'groupStaves'},
            {name: 'groupSimilarInstruments', shortDescription: 'Multiple tracks of the same instrument will be grouped together. No grouping happens if the staves of an instrument require a brace.', snippet: 'groupSimilarInstruments'}
          ]]
        ])
      }
    ],
    examples: `
        \\bracketextendmode GroupSimilarInstruments
        \\track "Piano1"
          \\staff {score}
        \\instrument piano
          C4 D4 E4 F4
          \\staff {score}
          \\clef f4 C3 D3 E3 F3
        \\track "Piano2"
          \\staff {score}
        \\instrument piano
          C4 D4 E4 F4
        \\track "Flute 1"
          \\staff { score }
        \\instrument flute
          C4 D4 E4 F4
        \\track "Flute 2"
          \\staff { score }
        \\instrument flute
          \\clef f4 C3 D3 E3 F3
        \\track "Guitar 1"
          \\staff { score tabs }
          0.3.4 2.3.4 5.3.4 7.3.4
        `
};
