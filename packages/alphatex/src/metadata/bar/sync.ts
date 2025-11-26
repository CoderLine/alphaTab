import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const sync: MetadataTagDefinition = {
    tag: '\\sync',
    snippet: '\\tempo ($1 $2 $3) $0',
    shortDescription: 'Adds a sync point to the data model.',
    longDescription: `
        Adds a new sync point for synchronizing the music sheet with an external media source like a backing track or video player.

        alphaTex support specifying sync points for the  [synchronization with external media](https://next.alphatab.net/docs/guides/audio-video-sync).

        It is recommended to add the sync points at the very end of the song but it is also possible to define them inbetween.

        The \`barIndex\`, \`occurence\`, \`ratioPosition\` values define the absolute position within the music sheet. The millisecondOffset defines the absolute position within the external media.

        With this information known, alphaTab can synchronize the external media with the music sheet.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'barIndex',
                    shortDescription: 'The index of the bar being synced',
                    parseMode: ValueListParseTypesMode.Required,
                    type: AlphaTexNodeType.Number
                },
                {
                    name: 'occurence',
                    shortDescription: 'The occurence of the bar for which this sync point applies (on repeats)',
                    parseMode: ValueListParseTypesMode.Required,
                    type: AlphaTexNodeType.Number
                },
                {
                    name: 'millisecondOffset',
                    shortDescription: 'The absolute millisecond offset within the external media',
                    parseMode: ValueListParseTypesMode.Required,
                    type: AlphaTexNodeType.Number
                },
                {
                    name: 'ratioPosition',
                    shortDescription: 'The relative position within the bar where the synchronization happens',
                    parseMode: ValueListParseTypesMode.OptionalAsFloat,
                    defaultValue: '0',
                    type: AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: {
        websiteMdx: [
            "import { AlphaTexSyncPointSample } from '@site/src/components/AlphaTexSyncPointSample';",
            '',
            '<AlphaTexSyncPointSample />'
        ].join('\n'),

        tex: `
        \\title "Prelude in D Minor"
        \\artist "J.S. Bach (1685-1750)"
        \\copyright "Public Domain"
        \\tempo 80

        \\ts 3 4
        0.4.16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
        (3.2 0.4).16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) | 
        (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) | 
        (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
        
        \\sync 0 0 0
        \\sync 0 0 1500 0.666
        \\sync 1 0 4075 0.666
        \\sync 2 0 6475 0.333
        \\sync 3 0 10223 1
        `
    }
};
