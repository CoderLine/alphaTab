import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const gr: PropertyDefinition = {
    property: 'gr',
    snippet: 'gr $1$0',
    shortDescription: 'Grace-Beat',
    longDescription: `
    Marks the beat as a grace beat holding grace notes.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'type',
                    shortDescription: 'The type of grace notes',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    defaultValue: 'bb',
                    ...enumParameter('GraceType')
                }
            ]
        }
    ],
    examples: `
    C5
    D5 {gr} C5
    C5
    D5 {gr} C5
        |
        C5
        D5 {gr ob} C5
        C5
        D5 {gr ob} C5
        `
};
