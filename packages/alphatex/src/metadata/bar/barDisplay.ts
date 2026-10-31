import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { staffDisplayProperties, staffDisplayTargetSignatures } from '@coderline/alphatab-alphatex/staffDisplay';

export const barDisplay: MetadataTagDefinition = {
    tag: '\\barDisplay',
    snippet: '\\barDisplay $1 {$2}$0',
    shortDescription: 'Sets how elements are displayed on the current bar.',
    longDescription: `
    Defines the display of elements like clefs, key signatures, time signatures and bar numbers for the current bar.

    The arguments select the staff types to which the properties apply. If no staff types are specified, every property applies to all staff types supporting the related element.

    All properties are optional. Properties which are not specified are inherited from [\`\\staffDisplay\`](https://alphatab.net/docs/alphatex/staff-metadata#staffdisplay) and [\`\\defaultStaffDisplay\`](https://alphatab.net/docs/alphatex/score-metadata#defaultstaffdisplay). The values only apply to the bar they are specified on.
    `,
    signatures: staffDisplayTargetSignatures(),
    examples: `
        \\track
            \\staff {score tabs}
            \\ks D 3.3.4 3.3 3.3 3.3 |
            \\barDisplay score { ksVisibility false } \\ks A 3.3 3.3 3.3 3.3 |
            3.3 3.3 3.3 3.3
        `,
    properties: staffDisplayProperties('\\barDisplay', 'bar')
};
