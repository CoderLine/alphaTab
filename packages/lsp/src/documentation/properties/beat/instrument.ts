import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@src/documentation/types';
import { generalMidiInstruments } from '../../common';

export const instrument: PropertyDoc = {
    property: 'instrument',
    syntax: ['instrument value'],
    snippet: 'instrument "$1"$0',
    shortDescription: 'Instrument Change',
    longDescription: `Adds a instrument change to the beat.`,
    values: [
        {
            name: 'value',
            shortDescription: 'The MIDI instrument to set',
            type: '`number`(MIDI program number 0-127) or `string` (midi instrument name)',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v), shortDescription: '' }))
                ],
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    generalMidiInstruments.map((v, i) => ({
                        name: i.toString(),
                        snippet: i.toString(),
                        shortDescription: v
                    }))
                ]
            ])
        }
    ],
    examples: `
        3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `
};
