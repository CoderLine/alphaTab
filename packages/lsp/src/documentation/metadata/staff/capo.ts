import type { MetadataDoc } from '@src/documentation/types';

export const capo: MetadataDoc = {
    tag: '\\capo',
    syntax: ['\\capo fret'],
    snippet: '\\capo {$1}$0',
    shortDescription: 'Set the capo fret',
    longDescription: `Defines the fret on which a capo should be placed.`,
    values: [
        {
            name: 'fret',
            shortDescription: 'The fret on which a capo is placed',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        \\track "Guitar"
        \\staff{tabs} 
        \\capo 5
        1.2 3.2 0.1 1.1
        `
};
