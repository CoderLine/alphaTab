import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const gr: PropertyDoc = {
    property: 'gr',
    syntax: ['gr type'],
    snippet: 'gr $1$0',
    shortDescription: 'Grace-Beat',
    longDescription: `
    Marks the beat as a grace beat holding grace notes.
    `,
    values: [
        {
            name: 'type',
            shortDescription: 'The type of grace notes',
            type: '`identifier`',
            required: false,
            defaultValue: '`bb`',
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'On-Beat',
                            snippet: 'ob',
                            longDescription:
                                'An On-Beat grace note where this beat will start at the play time of the next beat and steal its play time from the next beat.'
                        },
                        {
                            name: 'Before-Beat',
                            snippet: 'bb',
                            longDescription:
                                'A Before-Beat grace note where this beat will start before the next beat and steal its play time from the previous beat.'
                        },
                        {
                            name: 'Bend',
                            snippet: 'b',
                            longDescription:
                                "A bend grace note, a mechanism used in alphaTab for the 'songbook style' bends notes. You will likely not apply this type manually."
                        }
                    ]
                ]
            ])
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
