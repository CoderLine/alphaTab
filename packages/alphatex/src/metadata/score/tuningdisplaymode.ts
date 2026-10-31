import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const tuningDisplayMode: MetadataTagDefinition = {
    tag: '\\tuningDisplayMode',
    snippet: '\\tuningDisplayMode ${1:score}$0',
    shortDescription: 'Sets where string tuning information is displayed.',
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('TuningDisplayMode')
                }
            ]
        }
    ],
    examples: `
        \\tuningDisplayMode staff
        \\track "Guitar"
            \\staff { score tabs }
            0.6.4 2.6.4 3.6.4 0.5.4
    `
};
