import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const lyricsPlacement: MetadataTagDefinition = {
    tag: '\\lyricsPlacement',
    snippet: '\\lyricsPlacement ${1:above}$0',
    shortDescription: 'Sets where lyrics are displayed.',
    signatures: [
        {
            parameters: [
                {
                    name: 'placement',
                    shortDescription: 'The placement to use',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('LyricsPlacement')
                }
            ]
        }
    ],
    examples: `
        \\lyricsPlacement above
        \\track "Guitar"
            \\staff { score tabs }
            \\lyrics "Do Re Mi Fa"
            0.6.4 2.6.4 3.6.4 0.5.4
    `
};
