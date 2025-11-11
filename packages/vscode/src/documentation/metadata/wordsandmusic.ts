import type { MetadataDoc } from '../types';

export const wordsAndMusic: MetadataDoc = {
    tag: '\\wordsAndMusic',
    syntax: ['\\wordsAndMusic (template textAlign)'],
    snippet: '\\wordsAndMusic ("${1:Words & Music by %MUSIC%}" ${2:left})$0',
    description: `Sets the template and text align for the words and music (if they have the same value).`,
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
        \\words "CoderLine"
        \\music "CoderLine"
        \\wordsAndMusic ("Words & Music: %WORDS%")
        C4
        `
};
