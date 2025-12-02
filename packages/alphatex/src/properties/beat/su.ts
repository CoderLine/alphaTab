import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const su: PropertyDefinition = {
    property: 'su',
    snippet: 'su',
    shortDescription: 'Pick-Stroke Up',
    longDescription: 'Adds an upwards pick-stroke annotation to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        0.1 { su }
        `
};
