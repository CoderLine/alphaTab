import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const volume: PropertyDefinition = {
    property: 'volume',
    snippet: 'volume $1$0',
    shortDescription: 'Volume Change',
    longDescription: `
    Add a volume change to the beat.

    The change affects all beats after this one.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The new volume',
                    longDescription: 'The absolute volume of the track within the song in the range of 0-16',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: `
        C4 {volume 8} D4 E4 {tempo 16} F4
        `
};
