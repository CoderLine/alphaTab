import type { MetadataDoc } from '../../types';

export const copyright2: MetadataDoc = {
    tag: '\\copyright2',
    syntax: ['\\copyright (template textAlign)'],
    snippet: '\\copyright2 ("${1:All Rights Reserved - International Copyright Secured}" ${2:center})$0',
    shortDescription: `Sets the template and text align for the second copyright line.`,
    longDescription: `Sets the template and text align for the second copyright line.
    
    There is no own "value" as it is typically used to just define a static text like "All rights reserved". The "template" can be used for defining the display.`,
    values: [
        {
            name: 'template',
            shortDescription: 'The template used to render the text',
            type: '`string`',
            required: false
        },
        {
            name: 'textAlign',
            shortDescription: 'The alignment of the text on the music sheet',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    examples: `
        \\copyright "CoderLine"
        \\copyright2 "All rights reserved"
        C4
        `
};
