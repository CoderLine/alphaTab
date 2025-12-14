import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const voiceMode: MetadataTagDefinition = {
    tag: '\\voiceMode',
    snippet: '\\voiceMode $1 $0',
    shortDescription: 'Changes the mode how voices are treated',
    longDescription: `
    Changes the mode how alphaTab should treat voices when adding \`\\voice\`.

    You can either choose to write voice-by-voice where each voice has all bars defined. 
    You write bar-by-bar where a new voice is only added to the current bar. 
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode which should be active',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('AlphaTexVoiceMode')
                }
            ]
        }
    ],
    examples: [`
        \\title "Staff Wise Voices"
        \\voiceMode staffWise
        // Voice 1
        \\voice
            // Bar 1 Voice 1
            C4*4 | 
            // Bar 2 Voice 1
            C5*4 | 
            // Bar 3 Voice 1
            C6*4
        // Voice 2
        \\voice
            // Bar 1 Voice 2
            C3*4 | 
            // Bar 2 Voice 2
            C4*4 | 
            // Bar 3 Voice 2
            C5 * 4
    `,
    `
        \\title "Bar Wise Voices"
        \\voiceMode barWise
        // Bar 1
            // Bar 1 Voice 1
            \\voice
            C4*4 
            // Bar 1 Voice 2
            \\voice 
            C3*4 
        | 
        // Bar 2
            // Bar 2 Voice 1
            \\voice
            C5*4 
            // Bar 2 Voice 2
            \\voice
            C4*4 
        | 
        // Bar 3
            // Bar 3 Voice 1
            \\voice
            C6*4
            // Bar 3 Voice 2
            \\voice 
            C5 * 4
    `
    ]
};
