import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const tt: PropertyDefinition = {
    property: 'tt',
    snippet: 'tt',
    shortDescription: 'Tapping',
    longDescription: 'Adds a guitar or bass tapping annotation to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\track {instrument "Electric Bass Finger"}
        :8 {tu 3} 
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        `
};
