import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

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
                       type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                       parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional
                   }
               ]
           }
       ],
    examples: `
        (0.1 0.2 0.3 2.4 2.5 0.6){ad} (0.1 0.2 0.3 2.4 2.5 0.6){au} |
        `
};
