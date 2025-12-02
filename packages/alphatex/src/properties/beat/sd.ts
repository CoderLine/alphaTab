import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const sd: PropertyDefinition = {
    property: 'sd',
    snippet: 'sd',
    shortDescription: 'Pick-Stroke Down',
    longDescription: 'Adds an downwards pick-stroke annotation to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        0.1 { sd }
        `
};
