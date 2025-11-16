import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import { type MetadataDoc, properties, type ValueItemDoc } from '../../types';

export const chord: MetadataDoc = {
    tag: '\\chord',
    syntax: ['\\chord (name strings)'],
    snippet: '\\chord ("{$1}" $2)$0',
    shortDescription: 'Define a new chord',
    longDescription: `
    Defines a new chord for a chord diagram display defining how to play it.

    To avoid inconsistencies with tunings, chords should be defined after the tuning is set.

    To use the defined chord the \`ch chordName\` beat property has to be applied. The notes for the chord still have to be specified separately, the definition in this metadata is purely for the chord diagram.`,
    values: [
        {
            name: 'name',
            shortDescription: 'The name of the chord',
            type: '`string` or `identifier`',
            required: true
        },
        {
            name: 'strings',
            shortDescription:
                'For every string of the staff tuning, the fret to be played or `x` for strings not played.',
            type: 'List of `number`s or `x`',
            required: true
        }
    ],
    examples: `
        \\chord ("C" 0 1 0 2 3 x)
        \\ts 2 4
        (0.1 1.2 0.3 2.4 3.5){ch "C"} (0.1 1.2 0.3 2.4 3.5)
        `,
    properties: properties(
        {
            property: 'firstFret',
            syntax: ['firstFret fret'],
            snippet: 'firstFret $0',
            shortDescription: 'Shifts the first fret shown in the diagram higher',
            values: [
                {
                    name: 'fret',
                    shortDescription: 'The index of the first fret',
                    type: '`number`',
                    required: true
                }
            ],
            examples: `
                \\chord ("D#" 6 8 8 8 6 x) {firstfret 6}
                (6.1 8.2 8.3 8.4 6.5){ch "D#"}
                `
        },
        {
            property: 'barre',
            syntax: ['barre fret', 'barre (fret1 fret2...)'],
            snippet: 'barre $0',
            shortDescription: 'Defines on which frets a barré should be played.',
            longDescription: `Defines on which frets a barré should be played (visually joins the dots to a bar).`,
            values: [
                {
                    name: 'frets',
                    shortDescription: 'The frets on which a barré should be played',
                    type: '`number` list',
                    required: true
                }
            ],
            examples: `
                \\chord ("D#" 6 8 8 8 6 x) {firstfret 6 barre 6}
                \\chord ("Special" 3 3 3 1 1 1) {showname false barre (1 3)}
                (6.1 8.2 8.3 8.4 6.5){ch "D#"} 
                (3.1 3.2 3.3 1.4 1.5 1.6){ch "Special"}
                `
        },
        {
            property: 'showDiagram',
            syntax: ['showDiagram visibility'],
            snippet: 'showDiagram',
            shortDescription: `Set the chord diagram visibility.`,
            values: [
                {
                    name: 'visibility',
                    shortDescription: 'The visibility of the diagram',
                    type: '`boolean`',
                    required: false,
                    defaultValue: '`true`',
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.Ident,
                            [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the diagram' },
                                { name: 'false', snippet: 'false', shortDescription: 'Shide the diagram' }
                            ]
                        ]
                    ])
                }
            ],
            examples: `
                \\chord ("E" 0 0 1 2 2 0) {showdiagram false}
                (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
                `
        },
        {
            property: 'showFingering',
            syntax: ['showFingering visibility'],
            snippet: 'showFingering',
            shortDescription: `Set the finger position visibility.`,
            values: [
                {
                    name: 'visibility',
                    shortDescription: 'The visibility of the finger position in the chord diagram',
                    type: '`boolean`',
                    required: false,
                    defaultValue: '`true`',
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.Ident,
                            [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the fingering' },
                                { name: 'false', snippet: 'false', shortDescription: 'Shide the fingering' }
                            ]
                        ]
                    ])
                }
            ],
            examples: `
                \\chord ("E" 0 0 1 2 2 0) {showfingers false}
                (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
                `
        },
        {
            property: 'showName',
            syntax: ['showName visibility'],
            snippet: 'showName',
            shortDescription: `Set the chord name visibility.`,
            values: [
                {
                    name: 'visibility',
                    shortDescription: 'The visibility of the chord name in the diagram',
                    type: '`boolean`',
                    required: false,
                    defaultValue: '`true`',
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.Ident,
                            [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the chord name' },
                                { name: 'false', snippet: 'false', shortDescription: 'Shide the chord name' }
                            ]
                        ]
                    ])
                }
            ],
            examples: `
                // Hide name
                \\chord ("Special" 3 3 3 1 1 1) {showname false}
                .
                (3.1 3.2 3.3 1.4 1.5 1.6){ch "Special"}
                `
        },
        {
            property: 'numbered',
            syntax: ['numbered'],
            snippet: 'numbered $0',
            shortDescription: `Enable the display of numbered notation (Jianpu).`,
            values: [],
            examples: `
                \\track
                    \\staff {score numbered}
                    C4 D4 E4 F4
                `
        }
    )
};
