import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const ds: PropertyDefinition = {
    property: 'ds',
    snippet: 'ds',
    shortDescription: 'Dead-Slap',
    longDescription: `
    Marks the beat to be a dead-slap beat.

    As no notes should be on such a beat, simply use () to indicate the empty beat which is not a rest.
    `,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        ().4 {ds} ().4 {ds}
        `
};
