import { lf } from '@coderline/alphatab-alphatex/properties/note/lf';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const rf: PropertyDefinition = {
    property: 'rf',
    snippet: 'rf $1$0',
    shortDescription: 'Right-Hand Finger',
    longDescription: `Adds a right-hand fingering annotation to the note.`,
    signatures: lf.signatures,
    examples: `
        :8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5} (2.2{lf 4} 2.3{lf 3} 2.4{lf 2}) |
        :8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{lf 5}
        `
};
