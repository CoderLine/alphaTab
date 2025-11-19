import type { MetadataDoc } from '@coderline/alphatab-language-server/documentation/types';

export const wordsAndMusic: MetadataDoc = {
    tag: '\\wordsAndMusic',
    syntax: ['\\wordsAndMusic (template textAlign)'],
    snippet: '\\wordsAndMusic ("${1:Words & Music by %MUSIC%}" ${2:left})$0',
    shortDescription: `Sets the template and text align for combined words and music authors.`,
    values: [
        {
            name: 'template',
            shortDescription: 'The text template used to render the item',
            type: '`string`',
            required: true
        },
        {
            name: 'textAlign',
            shortDescription: 'The alignment of the text on the music sheet',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    examples: `
        \\words "CoderLine"
        \\music "CoderLine"
        \\wordsAndMusic ("Words & Music: %WORDS%")
        C4
        `
};
