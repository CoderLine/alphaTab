import * as alphaTab from '@coderline/alphatab';
import { booleanSignatures, properties } from '@coderline/alphatab-alphatex/common';
import { type AlphaTexMappedEnumName, enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { AlphaTexExample, PropertyDefinition, SignatureDefinition } from '@coderline/alphatab-alphatex/types';

/**
 * The level of a staff display tag: score (`\defaultStaffDisplay`), staff (`\staffDisplay`) or bar (`\barDisplay`).
 */
export type StaffDisplayLevel = 'score' | 'staff' | 'bar';

/**
 * Creates the signatures selecting the staff types to which the staff display properties apply.
 */
export function staffDisplayTargetSignatures(): SignatureDefinition[] {
    return [
        {
            parameters: [
                {
                    name: 'staffTypes',
                    shortDescription:
                        'The staff types to which the properties apply. If omitted, every property applies to all staff types supporting it.',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.ValueListWithoutParenthesis,
                    ...enumParameter('AlphaTexStaffType')
                }
            ]
        }
    ];
}

function enumSignatures(name: string, shortDescription: string, type: AlphaTexMappedEnumName): SignatureDefinition[] {
    return [
        {
            parameters: [
                {
                    name,
                    shortDescription,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter(type)
                }
            ]
        }
    ];
}

function staffDisplayExample(tag: string, level: StaffDisplayLevel, props: string): AlphaTexExample {
    const meta = `${tag} { ${props} }`;
    const bars = ['\\ks D 3.3.4 r 3.3 3.3', '3.3.4 3.3 r 3.3', '\\ts (3 4) \\ks A 3.3.4 3.3 r', '3.3.4 r 3.3'];
    if (level === 'bar') {
        bars[2] = `${meta} ${bars[2]}`;
    }
    const lines = [
        level === 'score' ? meta : '',
        '\\track { defaultSystemsLayout 2 }',
        '    \\staff {score tabs}',
        level === 'staff' ? `    ${meta}` : '',
        `    ${bars.join(' | ')}`
    ];
    return { options: { display: { layoutMode: 'Parchment' } }, tex: lines.filter(l => l.length > 0).join('\n') };
}

/**
 * The elements configured via `<prefix>Visibility`, `<prefix>Placement` and `<prefix>Systems`:
 * prefix, name, supported staff types, available on bar level.
 */
const staffDisplayElements: [string, string, string, boolean][] = [
    ['clef', 'clef', '`score`, `tabs`', true],
    ['ks', 'key signature', '`score`, `slash`', true],
    ['ts', 'time signature', '`score`, `tabs`, `slash`, `numbered`', true],
    ['rests', 'rests', '`tabs`', false]
];

/**
 * Creates the properties of a staff display tag. Every tag gets own definitions as the definitions
 * are prepared in place and the examples use the tag.
 */
export function staffDisplayProperties(tag: string, level: StaffDisplayLevel): Map<string, PropertyDefinition> {
    const prop = (
        property: string,
        shortDescription: string,
        signatures: SignatureDefinition[],
        value: string
    ): PropertyDefinition => ({
        property,
        snippet: `${property} $0`,
        shortDescription,
        signatures,
        examples: staffDisplayExample(tag, level, `${property} ${value}`)
    });

    const props: PropertyDefinition[] = [];
    for (const [prefix, name, staffTypes, barLevel] of staffDisplayElements) {
        if (level === 'bar' && !barLevel) {
            continue;
        }
        const supported = `Supported staff types: ${staffTypes}.`;
        props.push(
            prop(
                `${prefix}Visibility`,
                `Show or hide the ${name}. ${supported}`,
                booleanSignatures('visibility', `Whether the ${name} is shown`, `Show the ${name}`, `Hide the ${name}`),
                'false'
            ),
            prop(
                `${prefix}Placement`,
                `Show the ${name} on all staves or only on the primary (topmost) staff. ${supported}`,
                enumSignatures('placement', `On which staves the ${name} is shown`, 'StaffPlacement'),
                'primary'
            ),
            prop(
                `${prefix}Systems`,
                `Show the ${name} on all systems or only on the first system. ${supported}`,
                enumSignatures('systems', `On which systems the ${name} is shown`, 'SystemDisplay'),
                'firstSystemOnly'
            )
        );
    }

    props.push(
        prop(
            'barNumber',
            'Set how bar numbers are shown. Supported staff types: all.',
            enumSignatures('mode', 'The mode to use', 'BarNumberDisplay'),
            'allBars'
        )
    );
    if (level !== 'bar') {
        props.push(
            prop(
                'rhythm',
                'Set how the rhythm notation is shown. Supported staff types: `tabs`.',
                enumSignatures('mode', 'The mode to use', 'TabRhythmMode'),
                'showWithBeams'
            )
        );
    }

    return properties(...props);
}
