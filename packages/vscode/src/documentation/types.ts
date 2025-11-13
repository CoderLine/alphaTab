import { SettingsJson } from '@src/generated/SettingsJson';
import type { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';

export interface WithDescription {
    longDescription?: string;
    shortDescription: string;
}

export interface ValueItemDoc {
    name: string;
    snippet: string;
    longDescription?: string;
    shortDescription?: string;
}

export interface ValueDoc extends WithDescription {
    name: string;
    type: string;
    required: true | false | string;
    defaultValue?: string;
    values?: Map<AlphaTexNodeType, ValueItemDoc[]>;
}

export interface PropertyDoc extends WithDescription {
    property: string;
    syntax: string[];
    values: ValueDoc[];
    valueRemarks?: string;
    examples: Example | Example[];
    snippet: string;
}

export type Example = string | {
    options?: SettingsJson,
    tex: string;
    websiteMdx?: string;
}


export interface MetadataDoc extends WithDescription {
    tag: string;
    syntax: string[];
    snippet: string;
    values: ValueDoc[];
    valueRemarks?: string;
    examples: Example | Example[];
    properties?: Map<string, PropertyDoc>;
}

export function properties(...props: PropertyDoc[]): Map<string, PropertyDoc> {
    return new Map(props.map(p => [p.property.toLowerCase(), p]));
}


export function metadata(...metadata: MetadataDoc[]) {
    return new Map<string, MetadataDoc>(metadata.map(t => [t.tag.toLowerCase(), t]));
}

