import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const tp: PropertyDoc = {
    property: 'tp',
    syntax: ['tp speed'],
    snippet: 'tp $1$0',
    shortDescription: 'Tremolo Picking',
    longDescription: `Add a tremolo picking to the beat.`,
    values: [
        {
            name: 'speed',
            shortDescription: 'The tremolo picking speed',
            type: '`number`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [AlphaTexNodeType.Number, ['8', '16', '32'].map(s => ({ name: s, snippet: s }))]
            ])
        }
    ],
    examples: `
        3.3{tp 8} 3.3{tp 16} 3.3{tp 32}
        `
};
