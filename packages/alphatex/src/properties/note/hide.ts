import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const hide: PropertyDefinition = {
    property: 'hide',
    snippet: 'hide',
    shortDescription: 'Hide Note',
    longDescription: 'Hides the note from being displayed in the music sheet.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :8 3.3 (4.4{hide} 5.5)
        `
};
