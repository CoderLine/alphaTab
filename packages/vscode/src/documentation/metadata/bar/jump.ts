import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';

export const jump: MetadataDoc = {
    tag: '\\jump',
    syntax: ['\\jump direction'],
    snippet: '\\jump $1 $0',
    shortDescription: 'Adds a direction/jump instruction to the bar.',
    values: [
        {
            name: 'direction',
            shortDescription: 'The direction to add',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'Fine', snippet: 'Fine', shortDescription: 'Fine (Target)' },
                        { name: 'Segno', snippet: 'Segno', shortDescription: 'Segno (Target)' },
                        { name: 'SegnoSegno', snippet: 'SegnoSegno', shortDescription: 'SegnoSegno (Target)' },
                        { name: 'Coda', snippet: 'Coda', shortDescription: 'Coda (Target)' },
                        { name: 'DoubleCoda', snippet: 'DoubleCoda', shortDescription: 'DoubleCoda (Target)' },
                        { name: 'DaCapo', snippet: 'DaCapo', shortDescription: 'DaCapo (Jump)' },
                        { name: 'DaCapoAlCoda', snippet: 'DaCapoAlCoda', shortDescription: 'DaCapoAlCoda (Jump)' },
                        { name: 'DaCapoAlDoubleCoda', snippet: 'DaCapoAlDoubleCoda', shortDescription: 'DaCapoAlDoubleCoda (Jump)' },
                        { name: 'DaCapoAlFine', snippet: 'DaCapoAlFine', shortDescription: 'DaCapoAlFine (Jump)' },
                        { name: 'DalSegno', snippet: 'DalSegno', shortDescription: 'DalSegno (Jump)' },
                        { name: 'DalSegnoAlCoda', snippet: 'DalSegnoAlCoda', shortDescription: 'DalSegnoAlCoda (Jump)' },
                        { name: 'DalSegnoAlDoubleCoda', snippet: 'DalSegnoAlDoubleCoda', shortDescription: 'DalSegnoAlDoubleCoda (Jump)' },
                        { name: 'DalSegnoAlFine', snippet: 'DalSegnoAlFine', shortDescription: 'DalSegnoAlFine (Jump)' },
                        { name: 'DalSegnoSegno', snippet: 'DalSegnoSegno', shortDescription: 'DalSegnoSegno (Jump)' },
                        { name: 'DalSegnoSegnoAlCoda', snippet: 'DalSegnoSegnoAlCoda', shortDescription: 'DalSegnoSegnoAlCoda (Jump)' },
                        { name: 'DalSegnoSegnoAlDoubleCoda', snippet: 'DalSegnoSegnoAlDoubleCoda', shortDescription: 'DalSegnoSegnoAlDoubleCoda (Jump)' },
                        { name: 'DalSegnoSegnoAlFine', snippet: 'DalSegnoSegnoAlFine', shortDescription: 'DalSegnoSegnoAlFine (Jump)' },
                        { name: 'DaCoda', snippet: 'DaCoda', shortDescription: 'DaCoda (Jump)' },
                        { name: 'DaDoubleCoda', snippet: 'DaDoubleCoda', shortDescription: 'DaDoubleCoda (Jump)' },
                    ]
                ]
            ])
        }
    ],
    examples: `
        \\ro \\rc 2 3.3*4 | 
        3.3*4 | 
        \\jump Segno 3.3*4 |
        \\ro \rc 2 3.3*4 | 
        \\jump DaCoda 3.3*4 |
        3.3*4 | 3.3*4
        \\jump DalSegnoAlCoda 3.3*4 |
        3.3*4 |
        \\jump Coda 3.3*4 |
        3.3*4 |
        3.3*4
        `
};
