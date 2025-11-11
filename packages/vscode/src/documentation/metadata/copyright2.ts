import type { MetadataDoc } from '../types';

export const copyright2: MetadataDoc = {
    tag: '\\copyright2',
    syntax: ['\\copyright (template textAlign)'],
    snippet: '\\copyright2 ("${1:All Rights Reserved - International Copyright Secured}" ${2:center})$0',
    description: `Sets the template and text align for the second copyright line.
    
    There is no own "value" as it is typically used to just define a static text like "All rights reserved". The "template" can be used for defining the display.`,
    values: [
        {
            name: 'template',
            description: 'The text template used to render the item',
            type: '`string`',
            required: true
        },
        {
            name: 'textAlign',
            description: 'The text alignment of the text to display on the music sheet',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    example: `
        \\copyright "CoderLine"
        \\copyright2 "All rights reserved"
        C4
        `
};
