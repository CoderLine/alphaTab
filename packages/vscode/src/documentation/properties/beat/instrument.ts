import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';
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
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [AlphaTexNodeType.String, generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v) }))],
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
        3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `
};
