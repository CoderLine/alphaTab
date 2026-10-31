import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { staffDisplayProperties, staffDisplayTargetSignatures } from '@coderline/alphatab-alphatex/staffDisplay';

export const defaultStaffDisplay: MetadataTagDefinition = {
    tag: '\\defaultStaffDisplay',
    snippet: '\\defaultStaffDisplay $1 {$2}$0',
    shortDescription: 'Sets how elements are displayed on the staves of the whole song.',
    longDescription: `
    Defines the song-wide display of elements like clefs, key signatures, time signatures, rests and bar numbers.

    The arguments select the staff types to which the properties apply. If no staff types are specified, every property applies to all staff types supporting the related element.

    All properties are optional. Properties which are not specified keep their default. The values can be overridden per staff with [\`\\staffDisplay\`](https://alphatab.net/docs/alphatex/staff-metadata#staffdisplay) and per bar with [\`\\barDisplay\`](https://alphatab.net/docs/alphatex/bar-metadata#bardisplay).
    `,
    signatures: staffDisplayTargetSignatures(),
    examples: `
        \\defaultStaffDisplay { clefPlacement primary }
        \\defaultStaffDisplay tabs { tsVisibility true tsPlacement allStaves }
        \\track
            \\staff {score tabs}
            3.3.4 3.3 3.3 3.3 | 3.3 3.3 3.3 3.3
        `,
    properties: staffDisplayProperties('\\defaultStaffDisplay', 'score')
};
