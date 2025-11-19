import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const umordent: PropertyDoc = {
    property: 'umordent',
    syntax: ['umordent'],
    snippet: 'umordent',
    shortDescription: 'Upper Mordent Ornament',
    longDescription: 'Applies an upper mordent ornament to the note.',
    values: [],
    examples: 
        `
        :1 C4{umordent} |
        `
};
