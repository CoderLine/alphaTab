import type { MetadataDoc } from '@src/documentation/types';

export const spd: MetadataDoc = {
    tag: '\\spd',
    syntax: ['\\spd position'],
    snippet: '\\spd $1 $0',
    shortDescription: 'Add a sustain pedal down press',
    longDescription: `
    Specifies how the sustain petal should be pressed down (\`spd\`), held (\`sph\`) or lifted up (\`spu\`).

    This tag allows specifying the sustain pedal relative to the bar. The sustain pedal can also be applied via beat properties.
    `,
    values: [
        {
            name: 'position',
            shortDescription: 'The relative position within the bar for the marker',
            type: '`number` (float, 0-1)',
            required: true
        }
    ],
    examples: `
        \\spd 0
        \\spu 0.25
        \\spd 0.5
        \\sph 0.75
        \\spu 1
        :8 C4 * 8
        `
};
