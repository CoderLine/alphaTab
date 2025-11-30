import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const hideDynamics: MetadataTagDefinition = {
    tag: '\\hideDynamics',
    snippet: '\\hideDynamics',
    shortDescription: `Disables the display of dynamics.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\hideDynamics
            C4 {dy FFF} D4
            E4 {dy PP} F4
        `
};
