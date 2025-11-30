import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const acc: PropertyDefinition = {
    property: 'acc',
    snippet: 'acc $1$0',
    shortDescription: 'Accidentals',
    longDescription: `Changes the mode to determine the accidentals for this note.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The accidental mode',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('NoteAccidentalMode')
                }
            ]
        }
    ],
    examples: `
        :8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5} (2.2{lf 4} 2.3{lf 3} 2.4{lf 2}) |
        :8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{lf 5}
        `
};
