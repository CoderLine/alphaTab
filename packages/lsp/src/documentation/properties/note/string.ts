import type { PropertyDoc } from '@src/documentation/types';

export const string: PropertyDoc = {
    property: 'string',
    syntax: ['string'],
    snippet: 'string',
    shortDescription: 'Show String Number',
    longDescription: 'Adds an annotation showing the string number of the note above the staff.',
    values: [],
    examples: 
        `
        3.3{string} 3.4{string} 3.5{string}
        `
};
