import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const bracketExtendMode: MetadataTagDefinition = {
    tag: '\\bracketExtendMode',
    snippet: '\\bracketExtendMode ${1:groupStaves}$0',
    shortDescription: `Set the mode for brackets and braces.`,
    longDescription: `Set the mode for [brackets and braces](https://alphatab.net/docs/showcase/general#brackets-and-braces).`,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    shortDescription: 'The mode to use',
                    ...enumParameter('BracketExtendMode')
                }
            ]
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
