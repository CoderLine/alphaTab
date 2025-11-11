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
                        { name: 'Fine (Target)', snippet: 'Fine', shortDescription: '' },
                        { name: 'Segno (Target)', snippet: 'Segno', shortDescription: '' },
                        { name: 'SegnoSegno (Target)', snippet: 'SegnoSegno', shortDescription: '' },
                        { name: 'Coda (Target)', snippet: 'Coda', shortDescription: '' },
                        { name: 'DoubleCoda (Target)', snippet: 'DoubleCoda', shortDescription: '' },
                        { name: 'DaCapo (Jump)', snippet: 'DaCapo', shortDescription: '' },
                        { name: 'DaCapoAlCoda (Jump)', snippet: 'DaCapoAlCoda', shortDescription: '' },
                        { name: 'DaCapoAlDoubleCoda (Jump)', snippet: 'DaCapoAlDoubleCoda', shortDescription: '' },
                        { name: 'DaCapoAlFine (Jump)', snippet: 'DaCapoAlFine', shortDescription: '' },
                        { name: 'DalSegno (Jump)', snippet: 'DalSegno', shortDescription: '' },
                        { name: 'DalSegnoAlCoda (Jump)', snippet: 'DalSegnoAlCoda', shortDescription: '' },
                        { name: 'DalSegnoAlDoubleCoda (Jump)', snippet: 'DalSegnoAlDoubleCoda', shortDescription: '' },
                        { name: 'DalSegnoAlFine (Jump)', snippet: 'DalSegnoAlFine', shortDescription: '' },
                        { name: 'DalSegnoSegno (Jump)', snippet: 'DalSegnoSegno', shortDescription: '' },
                        { name: 'DalSegnoSegnoAlCoda (Jump)', snippet: 'DalSegnoSegnoAlCoda', shortDescription: '' },
                        { name: 'DalSegnoSegnoAlDoubleCoda (Jump)', snippet: 'DalSegnoSegnoAlDoubleCoda', shortDescription: '' },
                        { name: 'DalSegnoSegnoAlFine (Jump)', snippet: 'DalSegnoSegnoAlFine', shortDescription: '' },
                        { name: 'DaCoda (Jump)', snippet: 'DaCoda', shortDescription: '' },
                        { name: 'DaDoubleCoda (Jump)', snippet: 'DaDoubleCoda', shortDescription: '' },
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
