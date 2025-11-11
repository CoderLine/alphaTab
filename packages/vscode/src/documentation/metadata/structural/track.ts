import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import { type MetadataDoc, properties, type ValueItemDoc } from '../../types';

const generalMidiInstruments = [
    'Acoustic Grand Piano',
    'Bright Grand Piano',
    'Electric Grand Piano',
    'Honky tonk Piano',
    'Electric Piano 1',
    'Electric Piano 2',
    'Harpsichord',
    'Clavinet',
    'Celesta',
    'Glockenspiel',
    'Musicbox',
    'Vibraphone',
    'Marimba',
    'Xylophone',
    'Tubularbells',
    'Dulcimer',
    'Drawbar Organ',
    'Percussive Organ',
    'Rock Organ',
    'Church Organ',
    'Reed Organ',
    'Accordion',
    'Harmonica',
    'Tango Accordion',
    'Acoustic Guitar Nylon',
    'Acoustic Guitar Steel',
    'Electric Guitar Jazz',
    'Electric Guitar Clean',
    'Electric Guitar Muted',
    'Overdriven Guitar',
    'Distortion Guitar',
    'Guitar Harmonics',
    'Acoustic Bass',
    'Electric Bass Finger',
    'Electric Bass Pick',
    'Fretless Bass',
    'Slap Bass 1',
    'Slap Bass 2',
    'Synth Bass 1',
    'Synth Bass 2',
    'Violin',
    'Viola',
    'Cello',
    'Contrabass',
    'Tremolo Strings',
    'Pizzicato Strings',
    'Orchestral Harp',
    'Timpani',
    'String Ensemble 1',
    'String Ensemble 2',
    'Synth Strings 1',
    'Synth Strings 2',
    'Choir Aahs',
    'Voice Oohs',
    'Synth Voice',
    'Orchestra Hit',
    'Trumpet',
    'Trombone',
    'Tuba',
    'Muted Trumpet',
    'French Horn',
    'Brass Section',
    'Synth Brass 1',
    'Synth Brass 2',
    'Soprano Sax',
    'Alto Sax',
    'Tenor Sax',
    'Baritone Sax',
    'Oboe',
    'English Horn',
    'Bassoon',
    'Clarinet',
    'Piccolo',
    'Flute',
    'Recorder',
    'Pan Flute',
    'Blown bottle',
    'Shakuhachi',
    'Whistle',
    'Ocarina',
    'Lead 1 Square',
    'Lead 2 Sawtooth',
    'Lead 3 Calliope',
    'Lead 4 Chiff',
    'Lead 5 Charang',
    'Lead 6 Voice',
    'Lead 7 Fifths',
    'Lead 8 Bass and Lead',
    'Pad 1 newage',
    'Pad 2 warm',
    'Pad 3 polysynth',
    'Pad 4 choir',
    'Pad 5 bowed',
    'Pad 6 metallic',
    'Pad 7 halo',
    'Pad 8 sweep',
    'Fx 1 rain',
    'Fx 2 soundtrack',
    'Fx 3 crystal',
    'Fx 4 atmosphere',
    'Fx 5 brightness',
    'Fx 6 goblins',
    'Fx 7 echoes',
    'Fx 8 scifi',
    'Sitar',
    'Banjo',
    'Shamisen',
    'Koto',
    'Kalimba',
    'Bag pipe',
    'Fiddle',
    'Shanai',
    'Tinkle Bell',
    'Agogo',
    'Steel Drums',
    'Woodblock',
    'Taiko Drum',
    'Melodic Tom',
    'Synth Drum',
    'Reverse Cymbal',
    'Guitar Fret Noise',
    'Breath Noise',
    'Seashore',
    'Bird Tweet',
    'Telephone Ring',
    'Helicopter',
    'Applause',
    'Gunshot'
];

export const track: MetadataDoc = {
    tag: '\\track',
    syntax: ['\\track', '\\track fullName', '\\track (shortName fullName)'],
    snippet: '\\track "$1"$0',
    shortDescription: 'Start a new track',
    valueRemarks: `The displayed name depends on the configured [Track Name Policy](https://next.alphatab.net/docs/alphatex/score-metadata#singletracktracknamepolicy-and-multitracktracknamepolicy). If the short name is not specified, the first 10 characters of the long name are used as short name.`,
    values: [
        {
            name: 'fullName',
            shortDescription: 'The full name of the track',
            type: 'string',
            required: false
        },
        {
            name: 'shortName',
            shortDescription: 'The short name of the track',
            type: 'string',
            required: false
        }
    ],
    examples: `
        \\track "First Track" "frst" 
            C4 D4 E4 F4
        \\track
            C5 D5 E5 F5
        `,
    properties: properties(
        {
            property: 'color',
            syntax: ['color colorCode'],
            snippet: 'color $0',
            shortDescription: 'The color for use in a custom UI',
            longDescription:
                'The data model holds information about the color of the track which might be used by user interfaces to visually differenciate them. This data mainly originates from the Guitar Pro file format where colors are used to differenciate the tracks in the track picker and some other visualizations. It does not have an impact on the color of the music notation but can be used in a custom UI.',
            values: [
                {
                    name: 'colorCode',
                    shortDescription: 'The color as CSS color',
                    longDescription:
                        'The colorCode in [any supported color format](https://next.alphatab.net/docs/reference/settings/display/resources#colors)',
                    type: 'string',
                    required: true
                }
            ],
            examples: `
                \\track { color "#FF0000" }
                1.1 2.1 3.1 4.1
                `
        },
        {
            property: 'systemsLayout',
            syntax: ['systemsLayout (numberOfBars numberOfBars...)'],
            snippet: 'systemsLayout ($1)$0',
            shortDescription: 'Set the number of bars to display per system.',
            longDescription: `
                Defines the number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net/docs/reference/settings/display/systemslayoutmode).
                `,
            values: [
                {
                    name: 'numberOfBars',
                    shortDescription: 'The number of bars to display per system',
                    longDescription: 'Defines for every system (line) the number of bars it should contain',
                    type: '`number` (repeated)',
                    required: true
                }
            ],
            examples: `
                \\title "Single Track"
                \\track { systemsLayout (2 3 2) }
                :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
                `
        },
        {
            property: 'defaultSystemsLayout',
            syntax: ['defaultSystemsLayout numberOfBars'],
            snippet: 'defaultSystemsLayout $0',
            shortDescription: 'Set the default number of bars to display per system',
            longDescription: `
                Defines the default number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net//docs/reference/settings/display/systemslayoutmode).`,
            values: [
                {
                    name: 'numberOfBars',
                    shortDescription: 'Defines for every system (line) the number of bars it should contain',
                    type: '`number`',
                    required: true
                }
            ],
            examples: `
                \\title "Single Track"
                \\track { defaultSystemsLayout 2 }
                    :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
                `
        },
        {
            property: 'solo',
            syntax: ['solo'],
            snippet: 'solo',
            shortDescription: `Set the track to be played solo.`,
            values: [],
            examples: `
                \\track { solo }
                1.1 2.1 3.1 4.1
                \\track 
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'mute',
            syntax: ['mute'],
            snippet: 'mute',
            shortDescription: `Set the track to be muted.`,
            values: [],
            examples: `
                \\track 
                1.1 2.1 3.1 4.1
                \\track { mute }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'volume',
            syntax: ['volume value'],
            snippet: 'volume $0',
            shortDescription: `Set the track volume.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The volume to set',
                    type: '`number` (0-16)',
                    required: true
                }
            ],
            examples: `
                \\track { volume 0 } 
                1.1 2.1 3.1 4.1
                \\track { volume 16 }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'balance',
            syntax: ['balance value'],
            snippet: 'balance $0',
            shortDescription: `Set the track balance.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The balance to set',
                    type: '`number` (0-16; 8 is centered)',
                    required: true
                }
            ],
            examples: `
                \\track { volume 0 } 
                1.1 2.1 3.1 4.1
                \\track { volume 16 }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'instrument',
            syntax: ['instrument value'],
            snippet: 'instrument "$1"$0',
            shortDescription: `Set the midi instrument for this track.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The MIDI instrument to set',
                    type: '`number`(MIDI program number 0-127) or `string` (midi instrument name)',
                    required: true,
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.String,
                            generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v) }))
                        ],
                        [
                            AlphaTexNodeType.Number,
                            generalMidiInstruments.map((v, i) => ({
                                name: `${i} (${v})`,
                                snippet: i.toString()
                            }))
                        ]
                    ])
                }
            ],
            examples: `
                \\track { instrument 0 } 
                C4 C5 r r
                \\track { instrument "Acoustic Steel Guitar" }
                \\tuning (E4 B3 G3 D3 A2 E2)
                r r 12.1 13.1
                `
        },
        {
            property: 'bank',
            syntax: ['bank value'],
            snippet: 'bank $1$0',
            shortDescription: 'Set the MIDI bank for this track.',
            longDescription: `
            Set the MIDI bank to select when playing this track.

            The loaded soundfont needs to have this bank defined, otherwise there might be no audio.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The midi bank to set',
                    type: '`number`',
                    required: true,
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.String,
                            generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v) }))
                        ],
                        [
                            AlphaTexNodeType.Number,
                            generalMidiInstruments.map((v, i) => ({
                                name: `${i} (${v})`,
                                snippet: i.toString()
                            }))
                        ]
                    ])
                }
            ],
            examples: `
                \\track { instrument 25 bank 2 }
                `
        },
        {
            property: 'multiBarRest',
            syntax: ['multiBarRest'],
            snippet: 'multiBarRest$0',
            shortDescription: 'Display multibar rests',
            longDescription: `Enables the display of multibar rests if this track is shown as standalone.`,
            values: [],
            examples: [
                `
                \\track { multiBarRest } 
                C4*4 | r.1 | r.1 | r.1 | C4 * 4
                `,
                `
                \\track
                C4*4 | r.1 | r.1 | r.1 | C4 * 4
                `
            ]
        }
    )
};
