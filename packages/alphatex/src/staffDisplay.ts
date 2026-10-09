import * as alphaTab from '@coderline/alphatab';
import { booleanSignatures, properties } from '@coderline/alphatab-alphatex/common';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { AlphaTexExample, PropertyDefinition, SignatureDefinition } from '@coderline/alphatab-alphatex/types';

/**
 * The level on which a staff display tag applies its properties:
 * score-wide (`\defaultStaffDisplay`), per staff (`\staffDisplay`) or per bar (`\barDisplay`).
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
                    shortDescription: 'The staff types to which the properties apply',
                    longDescription: `The staff types to which the properties apply. If omitted, every property applies to all staff types supporting the related element.`,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.ValueListWithoutParenthesis,
                    ...enumParameter('AlphaTexStaffType')
                }
            ]
        }
    ];
}

/**
 * The sample content used to build the examples of a staff display property.
 */
interface StaffDisplaySample {
    /**
     * The staff types to apply the properties to (empty for all).
     */
    target: string;
    /**
     * The properties to apply.
     */
    props: string;
    /**
     * The notations to show on the staff (`\staff` properties).
     */
    staff: string;
    /**
     * The bars of the example, the staff display tag is placed on the second bar for bar level examples.
     */
    bars: string[];
    /**
     * Whether the example needs multiple systems to show the effect.
     */
    systems?: true;
}

function staffDisplayExample(tag: string, level: StaffDisplayLevel, sample: StaffDisplaySample): AlphaTexExample {
    const meta = `${tag}${sample.target ? ` ${sample.target}` : ''} { ${sample.props} }`;
    const lines: string[] = [];
    if (level === 'score') {
        lines.push(meta);
    }
    lines.push(sample.systems ? '\\track { defaultSystemsLayout 2 }' : '\\track');
    lines.push(`    \\staff {${sample.staff}}`);
    if (level === 'staff') {
        lines.push(`    ${meta}`);
    }
    if (level === 'bar') {
        lines.push(`    ${sample.bars[0]} |`);
        lines.push(`    ${meta} ${sample.bars.slice(1).join(' | ')}`);
    } else {
        lines.push(`    ${sample.bars.join(' | ')}`);
    }

    const tex = lines.join('\n');
    return sample.systems ? { options: { display: { layoutMode: 'Parchment' } }, tex } : tex;
}

/**
 * Describes an element which is configured via the `<prefix>Visibility`, `<prefix>Placement` and
 * `<prefix>Systems` properties.
 */
interface StaffDisplayElement {
    prefix: string;
    name: string;
    staffTypes: string;
    barLevel: boolean;
    visibility: StaffDisplaySample;
    placement: StaffDisplaySample;
    systems: StaffDisplaySample;
}

const tabBars = ['3.3.4 3.3 3.3 3.3', '3.3 3.3 3.3 3.3', '3.3 3.3 3.3 3.3', '3.3 3.3 3.3 3.3'];
const tabRestBars = ['3.3.4 r 3.3 r', 'r 3.3 r 3.3', '3.3 r 3.3 r', 'r 3.3 r 3.3'];

const staffDisplayElements: StaffDisplayElement[] = [
    {
        prefix: 'clef',
        name: 'clef',
        staffTypes: '`score`, `tabs`',
        barLevel: true,
        visibility: { target: 'tabs', props: 'clefVisibility false', staff: 'score tabs', bars: tabBars.slice(0, 2) },
        placement: { target: '', props: 'clefPlacement primary', staff: 'score tabs', bars: tabBars.slice(0, 2) },
        systems: {
            target: '',
            props: 'clefSystems firstSystemOnly',
            staff: 'score tabs',
            bars: tabBars,
            systems: true
        }
    },
    {
        prefix: 'ks',
        name: 'key signature',
        staffTypes: '`score`, `slash`',
        barLevel: true,
        visibility: {
            target: 'slash',
            props: 'ksVisibility true',
            staff: 'score slash',
            bars: ['\\ks D 3.3.4 3.3 3.3 3.3', '\\ks A 3.3 3.3 3.3 3.3']
        },
        placement: {
            target: '',
            props: 'ksVisibility true ksPlacement primary',
            staff: 'score slash',
            bars: ['\\ks D 3.3.4 3.3 3.3 3.3', '\\ks A 3.3 3.3 3.3 3.3']
        },
        systems: {
            target: '',
            props: 'ksSystems firstSystemOnly',
            staff: 'score',
            bars: ['\\ks D 3.3.4 3.3 3.3 3.3', '3.3 3.3 3.3 3.3', '3.3 3.3 3.3 3.3', '3.3 3.3 3.3 3.3'],
            systems: true
        }
    },
    {
        prefix: 'ts',
        name: 'time signature',
        staffTypes: '`score`, `tabs`, `slash`, `numbered`',
        barLevel: true,
        visibility: { target: 'score', props: 'tsVisibility false', staff: 'score tabs', bars: tabBars.slice(0, 2) },
        placement: { target: 'tabs', props: 'tsPlacement allStaves', staff: 'score tabs', bars: tabBars.slice(0, 2) },
        systems: {
            target: '',
            props: 'tsSystems firstSystemOnly',
            staff: 'score tabs',
            bars: ['3.3.4 3.3 3.3 3.3', '3.3 3.3 3.3 3.3', '\\ts 3 4 3.3.4 3.3 3.3', '3.3 3.3 3.3'],
            systems: true
        }
    },
    {
        prefix: 'rests',
        name: 'rests',
        staffTypes: '`tabs`',
        barLevel: false,
        visibility: { target: '', props: 'restsVisibility false', staff: 'tabs', bars: tabRestBars.slice(0, 2) },
        placement: {
            target: '',
            props: 'restsPlacement allStaves',
            staff: 'score tabs',
            bars: tabRestBars.slice(0, 2)
        },
        systems: { target: '', props: 'restsSystems firstSystemOnly', staff: 'tabs', bars: tabRestBars, systems: true }
    }
];

function staffDisplayElementProperties(
    tag: string,
    level: StaffDisplayLevel,
    element: StaffDisplayElement
): PropertyDefinition[] {
    const supported = `Supported staff types: ${element.staffTypes}.`;
    return [
        {
            property: `${element.prefix}Visibility`,
            snippet: `${element.prefix}Visibility $0`,
            shortDescription: `Show or hide the ${element.name}.`,
            longDescription: `Defines whether the ${element.name} is shown. ${supported}`,
            signatures: booleanSignatures(
                'visibility',
                `Whether the ${element.name} is shown`,
                `Show the ${element.name}`,
                `Hide the ${element.name}`
            ),
            examples: staffDisplayExample(tag, level, element.visibility)
        },
        {
            property: `${element.prefix}Placement`,
            snippet: `${element.prefix}Placement $0`,
            shortDescription: `Set on which staves the ${element.name} is shown.`,
            longDescription: `Defines whether the ${element.name} is shown on all staves or only on the primary staff (the topmost displayed notation of the staff). ${supported}`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'placement',
                            shortDescription: `On which staves the ${element.name} is shown`,
                            parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                            ...enumParameter('StaffPlacement')
                        }
                    ]
                }
            ],
            examples: staffDisplayExample(tag, level, element.placement)
        },
        {
            property: `${element.prefix}Systems`,
            snippet: `${element.prefix}Systems $0`,
            shortDescription: `Set on which systems the ${element.name} is shown.`,
            longDescription: `Defines whether the ${element.name} is shown on all systems or only on the first system. ${supported}`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'systems',
                            shortDescription: `On which systems the ${element.name} is shown`,
                            parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                            ...enumParameter('SystemDisplay')
                        }
                    ]
                }
            ],
            examples: staffDisplayExample(tag, level, element.systems)
        }
    ];
}

/**
 * Creates the properties of a staff display tag. A new set of definitions is created for every tag,
 * as the definitions are prepared in place and the examples use the respective tag.
 * Bar level tags only support the elements which can be overridden on bar level.
 */
export function staffDisplayProperties(tag: string, level: StaffDisplayLevel): Map<string, PropertyDefinition> {
    const props: PropertyDefinition[] = [];
    for (const element of staffDisplayElements) {
        if (level !== 'bar' || element.barLevel) {
            props.push(...staffDisplayElementProperties(tag, level, element));
        }
    }

    props.push({
        property: 'barNumber',
        snippet: 'barNumber $0',
        shortDescription: 'Set how bar numbers are shown.',
        longDescription:
            'Defines how bar numbers are shown. Supported staff types: `score`, `tabs`, `slash`, `numbered`.',
        signatures: [
            {
                parameters: [
                    {
                        name: 'mode',
                        shortDescription: 'The mode to use',
                        parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                        ...enumParameter('BarNumberDisplay')
                    }
                ]
            }
        ],
        examples: staffDisplayExample(tag, level, {
            target: '',
            props: 'barNumber allBars',
            staff: 'score tabs',
            bars: tabBars,
            systems: true
        })
    });

    if (level !== 'bar') {
        props.push({
            property: 'rhythm',
            snippet: 'rhythm $0',
            shortDescription: 'Set how rhythm notation is shown on tabs.',
            longDescription: 'Defines how the rhythm notation is shown on tabs. Supported staff types: `tabs`.',
            signatures: [
                {
                    parameters: [
                        {
                            name: 'mode',
                            shortDescription: 'The mode to use',
                            parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                            ...enumParameter('TabRhythmMode')
                        }
                    ]
                }
            ],
            examples: staffDisplayExample(tag, level, {
                target: '',
                props: 'rhythm showWithBeams',
                staff: 'tabs',
                bars: tabBars.slice(0, 2)
            })
        });
    }

    return properties(...props);
}
