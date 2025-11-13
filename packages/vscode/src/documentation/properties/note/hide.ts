import type { PropertyDoc } from '../../types';

export const hide: PropertyDoc = {
    property: 'hide',
    syntax: ['hide'],
    snippet: 'hide',
    shortDescription: 'Hide Note',
    longDescription: 'Hides the note from being displayed in the music sheet.',
    values: [],
    examples: 
        `
        :8 3.3 (4.4{hide} 5.5)
        `
};
