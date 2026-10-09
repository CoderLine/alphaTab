import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { staffDisplayProperties, staffDisplayTargetSignatures } from '@coderline/alphatab-alphatex/staffDisplay';

export const staffDisplay: MetadataTagDefinition = {
    tag: '\\staffDisplay',
    snippet: '\\staffDisplay $1 {$2}$0',
    shortDescription: 'Sets how elements are displayed on the current staff.',
    longDescription: `
    Defines the display of elements like clefs, key signatures, time signatures, rests and bar numbers for the current staff.

    The arguments select the staff types to which the properties apply. If no staff types are specified, every property applies to all staff types supporting the related element.

    All properties are optional. Properties which are not specified are inherited from [\`\\defaultStaffDisplay\`](https://alphatab.net/docs/alphatex/score-metadata#defaultstaffdisplay). The values can be overridden per bar with [\`\\barDisplay\`](https://alphatab.net/docs/alphatex/bar-metadata#bardisplay).
    `,
    signatures: staffDisplayTargetSignatures(),
    examples: `
        \\track
            \\staff {score tabs}
            \\staffDisplay tabs { tsPlacement allStaves rhythm showWithBeams }
            3.3.4 3.3 3.3 3.3 | 3.3 3.3 3.3 3.3
        `,
    properties: staffDisplayProperties('\\staffDisplay', 'staff')
};
