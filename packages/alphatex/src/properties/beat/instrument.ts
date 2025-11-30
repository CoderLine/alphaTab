import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

import { generalMidiInstruments } from '../../common';

export const instrument: PropertyDefinition = {
    property: 'instrument',
    snippet: 'instrument "$1"$0',
    shortDescription: 'Instrument Change',
    longDescription: `Adds a instrument change to the beat.`,
    signatures: [
        {
            description: 'Set the midi instrument as midi program number',
            parameters: [
                {
                    name: 'program',
                    shortDescription: 'MIDI program number (0-127)',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        },
        {
            description: 'Set the midi instrument as midi program name',
            parameters: [
                {
                    name: 'programName',
                    shortDescription: 'MIDI program name',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    valuesOnlyForCompletion: true,
                    values: generalMidiInstruments.map(v => ({
                        name: v,
                        snippet: JSON.stringify(v),
                        shortDescription: ''
                    }))
                }
            ]
        },
        {
            description: 'Set the instrument to percussion',
            parameters: [
                {
                    name: 'percussion',
                    shortDescription: 'Percussion',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    values: [
                        {
                            name: 'percussion',
                            snippet: 'percussion',
                            shortDescription: ''
                        }
                    ]
                }
            ]
        }
    ],
    examples: `
    3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `
};
