import { properties, type MetadataDoc } from '../../types';

export const tuning: MetadataDoc = {
    tag: '\\tuning',
    syntax: ['\\tuning (strings) { label "Label" hide }', '\\tuning piano', '\\tuning none', '\\tuning voice'],
    snippet: '\\tuning {$1}$0',
    shortDescription: 'Set the string tuning for the staff.',
    longDescription: `Defines the number of strings and their tuning for stringed (and fretted) instruments.`,
    values: [
        {
            name: 'strings',
            shortDescription: 'The tuning values as pitched notes',
            longDescription: `The tuning values as [pitched notes](https://next.alphatab.net/docs/alphatex/document-structure#pitched-notes)`,
            type: '`identifier` list',
            required: true
        },
        {
            name: 'piano',
            shortDescription: 'Indicates that this staff is NOT stringed, but a piano with pitched notes.',
            type: '`identifier` list',
            required: true
        },
        {
            name: 'none',
            shortDescription: 'Indicates that this staff is NOT stringed and has no tuning and uses pitched notes.',
            type: '`identifier` list',
            required: true
        },
        {
            name: 'voice',
            shortDescription: 'Indicates that this staff is NOT stringed, but a vocal voice with pitched notes.',
            type: '`identifier` list',
            required: true
        }
    ],
    examples: `
        \\track "Track 1"
          \\staff {tabs}
          \\tuning (A1 D2 A2 D3 G3 B3 E4) { hide label "Special Guitar Tuning" }
          4.1 3.1 2.1 1.1
        \\track "Track 2"
          \\tuning piano
          C4 D4 E4 F4
        `,
    properties: properties(
        {
            property: 'hide',
            syntax: ['hide'],
            snippet: 'hide',
            shortDescription: 'Hides the tuning from being displayed above the first staff.',
            values: [],
            examples: `
                \\track
                  \\staff {tabs}
                  \\tuning (E4 B3 G3 D3 A2 D2)
                  4.1 3.1 2.1 1.1   
                \\track
                  \\staff {tabs}
                  \\tuning (F2 C2 G1 D1) { hide}
                  4.1 3.1 2.1 1.1
                `
        },
        {
            property: 'label',
            syntax: ['label text'],
            snippet: 'label "$1"$0',
            shortDescription: 'Defines the textual label for the tuning.',
            values: [
                {
                    name: 'text',
                    shortDescription: 'The label to set.',
                    type: '`string`',
                    required: true
                }
            ],
            examples: `
                \\track
                  \\staff {tabs}
                  \\tuning (E4 B3 G3 D3 A2 D2) { label "Dropped D Tuning" }
                  4.1 3.1 2.1 1.1
                `
        }
    )
};
