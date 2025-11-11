import type { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';

export interface WithDescription {
    description?: string;
    shortDescription?: string;
}

export interface ValueItemDoc extends WithDescription {
    name: string;
    snippet: string;
}

export interface ValueDoc extends WithDescription{
    name: string;
    type: string;
    required: true | false | string;
    defaultValue?: string;
    values?: Map<AlphaTexNodeType, ValueItemDoc[]>;
}

export interface PropertyDoc extends WithDescription{
    property: string;
    syntax: string[];
    values: ValueDoc[];
    examples: string | string[];
    snippet: string;
}

export interface MetadataDoc extends WithDescription{
    tag: string;
    syntax: string[];
    snippet: string;
    description: string;
    values: ValueDoc[];
    valueRemarks?: string;
    example: string;
    properties?: Map<string, PropertyDoc>;
}

export function properties(...props: PropertyDoc[]): Map<string, PropertyDoc> {
    return new Map(props.map(p => [p.property.toLowerCase(), p]));
}
