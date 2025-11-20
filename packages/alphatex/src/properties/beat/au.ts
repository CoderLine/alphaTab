import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const au: PropertyDefinition = {
    property: 'au',
    snippet: 'au$0',
    shortDescription: 'Upwards Arpeggio',
    longDescription: `Adds an arpeggio effect to the beat.`,
    signatures: [
           {
               parameters: [
                   {
                       name: 'duration',
                       shortDescription: 'A custom duration of the stroke speed in MIDI ticks',
                       type: AlphaTexNodeType.Number,
                       parseMode: ValueListParseTypesMode.Optional
                   }
               ]
           }
       ],
    examples: `
        (0.1 0.2 0.3 2.4 2.5 0.6){ad} (0.1 0.2 0.3 2.4 2.5 0.6){au} |
        `
};
