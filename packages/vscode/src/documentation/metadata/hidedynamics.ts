import type { MetadataDoc } from '../types';

export const hideDynamics: MetadataDoc = {
    tag: '\\hideDynamics',
    syntax: ['\\hideDynamics'],
    snippet: '\\hideDynamics',
    description: `Disables the display of dynamics.`,
    values: [],
    example: `
        \\hideDynamics
            C4 {dy FFF} D4
            E4 {dy PP} F4
        `
};
