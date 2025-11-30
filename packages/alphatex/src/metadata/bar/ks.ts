import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';


export const ks: MetadataTagDefinition = {
    tag: '\\ks',
    snippet: '\\ks $1 $0',
    shortDescription: 'Set the key signature',
    longDescription: `Specifies the key signature for this and subsequent bars.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'key',
                    shortDescription: 'The key signature',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('KeySignature')
                }
            ]
        }
    ],
    examples: `
        \\ks Cb | \\ks C | \\ks C# |
        \\ks Aminor | \\ks Dmajor | \\ks Bminor
        `
};
