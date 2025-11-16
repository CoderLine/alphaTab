import type * as alphaTab from '@coderline/alphatab';

/**
 * Common props for elements with descriptions.
 */
export interface WithDescription {
    /**
     * An optional long description, typically shown in the extended doc popup
     * shown on hovers and code completions.
     */
    longDescription?: string;
    /**
     * A short description, typically shown in the code completion box.
     */
    shortDescription: string;
}

/**
 * Common props for documented elements.
 */
export interface CommonDoc extends WithDescription {
    /**
     * The refrence syntax how the element can be expressed.
     */
    syntax: string[];
    /**
     * The values which this element can have.
     */
    values: ValueDoc[];

    /**
     * Additional remarks for the values of this element.
     */
    valueRemarks?: string;

    /**
     * The snippet to insert on autocompleting this item.
     */
    snippet: string;

    /**
     * One or more examples (as alphaTex code) demonstrating the usage.
     */
    examples: AlphaTexExample | AlphaTexExample[];
}

/**
 * The documentation for an individual value of value items (e.g. enum values)
 */
export interface ValueItemDoc extends WithDescription {
    /**
     * The name of the item
     */
    name: string;
    /**
     * The snippet to insert
     */
    snippet: string;
}

/**
 * The documentation for the individual values (parameters) of properties or metadata.
 */
export interface ValueDoc extends WithDescription {
    /**
     * The name of the value
     */
    name: string;
    /**
     * The type of the value (as markdown description)
     */
    type: string; // TODO: use AlphaTexNodeType
    /**
     * Whether the value is required.
     */
    required: boolean;
    /**
     * Whether the value is a list of values
     */
    isList?: boolean;
    /**
     * The default value as markdown description.
     */
    defaultValue?: string;
    /**
     * The possible values for this value. Depending on the
     * type the node has. Typically used to provide code completions.
     */
    values?: Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>;
}

/**
 * The documentation for a property.
 */
export interface PropertyDoc extends CommonDoc {
    /**
     * The name of the property.
     */
    property: string;
}

/**
 * An alphaTex example demonstrating the usage of elements.
 */
export type AlphaTexExample =
    | string
    | {
          /**
           * The options to apply when rendering the example
           */
          options?: alphaTab.json.SettingsJson;
          /**
           * The plain alphaTex code.
           */
          tex: string;
          /**
           * An alternative MDX code to use for extended documentation, mainly used for the
           * alphaTab website when advanced examples are needed.
           */
          websiteMdx?: string;
      };

/**
 * The documentation for a metadata tag.
 */
export interface MetadataDoc extends CommonDoc {
    /**
     * The metadata tag (including the backslash)
     */
    tag: string;

    /**
     * A lookup containing the properties available for this metadata.
     * The key is the lowercase identifier of the property.
     */
    properties?: Map<string, PropertyDoc>;
}

export function properties(...props: PropertyDoc[]): Map<string, PropertyDoc> {
    return new Map(props.map(p => [p.property.toLowerCase(), p]));
}

export function metadata(...metadata: MetadataDoc[]) {
    return new Map<string, MetadataDoc>(metadata.map(t => [t.tag.toLowerCase(), t]));
}