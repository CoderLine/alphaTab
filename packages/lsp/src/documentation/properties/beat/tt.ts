import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const tt: PropertyDoc = {
    property: 'tt',
    syntax: ['tt'],
    snippet: 'tt',
    shortDescription: 'Tapping',
    longDescription: 'Adds a guitar or bass tapping annotation to the beat.',
    values: [],
    examples: 
        `
        \\track {instrument "Electric Bass Finger"}
        :8 {tu 3} 
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        18.1 {tt h} 10.1 {h} 14.1
        `
};
