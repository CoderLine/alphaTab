import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const list: [string, number][] = [
    ['Ride (choke)', 29],
    ['Cymbal (hit)', 30],
    ['Snare (side stick)', 31],
    ['Snare (side stick) 2', 33],
    ['Snare (hit)', 34],
    ['Kick (hit)', 35],
    ['Kick (hit) 2', 36],
    ['Snare (side stick) 3', 37],
    ['Snare (hit) 2', 38],
    ['Hand Clap (hit)', 39],
    ['Snare (hit) 3', 40],
    ['Low Floor Tom (hit)', 41],
    ['Hi-Hat (closed)', 42],
    ['Very Low Tom (hit)', 43],
    ['Pedal Hi-Hat (hit)', 44],
    ['Low Tom (hit)', 45],
    ['Hi-Hat (open)', 46],
    ['Mid Tom (hit)', 47],
    ['High Tom (hit)', 48],
    ['Crash high (hit)', 49],
    ['High Floor Tom (hit)', 50],
    ['Ride (middle)', 51],
    ['China (hit)', 52],
    ['Ride (bell)', 53],
    ['Tambourine (hit)', 54],
    ['Splash (hit)', 55],
    ['Cowbell medium (hit)', 56],
    ['Crash medium (hit)', 57],
    ['Vibraslap (hit)', 58],
    ['Ride (edge)', 59],
    ['Hand (hit)', 60],
    ['Hand (hit)', 61],
    ['Conga high (mute)', 62],
    ['Conga high (hit)', 63],
    ['Conga low (hit)', 64],
    ['Timbale high (hit)', 65],
    ['Timbale low (hit)', 66],
    ['Agogo high (hit)', 67],
    ['Agogo tow (hit)', 68],
    ['Cabasa (hit)', 69],
    ['Left Maraca (hit)', 70],
    ['Whistle high (hit)', 71],
    ['Whistle low (hit)', 72],
    ['Guiro (hit)', 73],
    ['Guiro (scrap-return)', 74],
    ['Claves (hit)', 75],
    ['Woodblock high (hit)', 76],
    ['Woodblock low (hit)', 77],
    ['Cuica (mute)', 78],
    ['Cuica (open)', 79],
    ['Triangle (rnute)', 80],
    ['Triangle (hit)', 81],
    ['Shaker (hit)', 82],
    ['Tinkle Bell (hat)', 83],
    ['Jingle Bell (hit)', 83],
    ['Bell Tree (hit)', 84],
    ['Castanets (hit)', 85],
    ['Surdo (hit)', 86],
    ['Surdo (mute)', 87],
    ['Snare (rim shot)', 91],
    ['Hi-Hat (half)', 92],
    ['Ride (edge) 2', 93],
    ['Ride (choke) 2', 94],
    ['Splash (choke)', 95],
    ['China (choke)', 96],
    ['Crash high (choke)', 97],
    ['Crash medium (choke)', 98],
    ['Cowbell low (hit)', 99],
    ['Cowbell low (tip)', 100],
    ['Cowbell medium (tip)', 101],
    ['Cowbell high (hit)', 102],
    ['Cowbell high (tip)', 103],
    ['Hand (mute)', 104],
    ['Hand (slap)', 105],
    ['Hand (mute) 2', 106],
    ['Hand (slap) 2', 107],
    ['Conga low (slap)', 108],
    ['Conga low (mute)', 109],
    ['Conga high (slap)', 110],
    ['Tambourine (return)', 111],
    ['Tambourine (roll)', 112],
    ['Tambourine (hand)', 113],
    ['Grancassa (hit)', 114],
    ['Piatti (hat)', 115],
    ['Piatti (hand)', 116],
    ['Cabasa (return)', 117],
    ['Left Maraca (return)', 118],
    ['Right Maraca (hit)', 119],
    ['Right Maraca (return)', 120],
    ['Shaker (return)', 122],
    ['Bell Tee (return)', 123],
    ['Golpe (thumb)', 124],
    ['Golpe (finger)', 125],
    ['Ride (middle) 2', 126],
    ['Ride (bell) 2', 127]
];

const articulationsTable = [
    '| Number | Name Long | Name Short |',
    '|--------|-----------|------------|',
    ...list.map(v => `| \`${v[1]}\` | \`${v[0]}\` | \`${v[0].replace(/[^a-zA-Z0-9]/g, '')}\` |`)
];

export const articulation: MetadataTagDefinition = {
    tag: '\\articulation',
    snippet: '\\articulation $1$0',
    shortDescription: 'Define percussion articulations',
    longDescription: `
    Defines the articulations available to write percussion and drum tabs.

    Currently alphaTex does not defining completely custom articulations (note heads, staff line, technical symbols etc.).

    ${articulationsTable.map(l => `    ${l}`).join('\n')}
    `,
    signatures: [
        {
            description: 'Registers all standard articulation names',
            parameters: [
                {
                    name: 'defaults',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    shortDescription: '',
                    values: [
                        {
                            name: 'defaults',
                            shortDescription: '',
                            snippet: 'defaults'
                        }
                    ]
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'name',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.String,
                    shortDescription: 'The string used in the note values'
                },
                {
                    name: 'value',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    shortDescription: 'The numeric value of the built-in articulation'
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'name',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    shortDescription: 'The string used in the note values'
                },
                {
                    name: 'value',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    shortDescription: 'The numeric value of the built-in articulation'
                }
            ]
        }
    ],
    examples: `
        \\track "Drums"
        \\instrument percussion
        \\tempo 120
        \\clef neutral
        \\articulation defaults
        (KickHit RideBell).16 r KickHit KickHit (KickHit RideBell).16 r KickHit KickHit (KickHit RideBell).16 r KickHit KickHit (KickHit RideBell).16 r KickHit KickHit |
        (KickHit HiHatOpen) KickHit KickHit KickHit (KickHit HiHatOpen) KickHit KickHit KickHit (KickHit SnareHit HiHatOpen) KickHit KickHit.32 KickHit KickHit.16 (KickHit HiHatOpen) KickHit KickHit KickHit |
        (KickHit HiHatOpen).8{tu 3} KickHit{tu 3} KickHit{tu 3} (KickHit SnareHit HiHatOpen){tu 3} KickHit.16{tu 3} KickHit{tu 3} KickHit.8{tu 3} (KickHit HiHatOpen).8{tu 3} KickHit{tu 3} KickHit{tu 3} (KickHit SnareHit HiHatOpen).8{tu 3} KickHit{tu 3} KickHit{tu 3}
        `
};
