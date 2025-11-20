import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const harmonicValueDocs = [
    'The harmonic value determines a relative fret-offset changing the note pitch when played. For natural harmonics the played fret determines the harmonic value. The rules are a bit special but mostly are aligned with the frequency adjustments happening when harmonics are played at respective frets:',
    '',
    '* `2.4` adds 36 frets',
    '* `2.7` adds 34 frets',
    '* `< 3` adds 0 frets',
    '* `<= 3.5` adds 31 frets',
    '* `<= 4` adds 28 frets',
    '* `<= 5` adds 34 frets',
    '* `<= 7` adds 19 frets',
    '* `<= 8.5` adds 36 frets',
    '* `<= 9` adds 28 frets',
    '* `<= 10` adds 34 frets',
    '* `<= 11` adds 0 frets',
    '* `<= 12` adds 12 frets',
    '* `< 14` adds 0 frets',
    '* `<= 15` adds 34 frets',
    '* `<= 16` adds 28 frets',
    '* `<= 17` adds 36 frets',
    '* `<= 18` adds 0 frets',
    '* `<= 19` adds 19 frets',
    '* `<= 21` adds 0 frets',
    '* `<= 22` adds 36 frets',
    '* `<= 24` adds 24 frets',
    '* `other: adds 0 frets'
].join('\n');

export const ah: PropertyDefinition = {
    property: 'ah',
    snippet: 'ah$0',
    shortDescription: 'Artificial Harmonic',
    longDescription: `Applies an artificial harmonic effect to the note (for fretted instruments).`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The harmonic value',
                    longDescription: harmonicValueDocs,
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 {volume 8} D4 E4 {tempo 16} F4
        `
};
