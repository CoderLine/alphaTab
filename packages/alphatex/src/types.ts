import type { SettingsJson } from '@coderline/alphatab/generated/SettingsJson';
import type { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

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

    /**
     * If defined, the element is deprecated.
     */
    deprecated?: string;

    /**
     * Additional remarks relevant for this item.
     */
    remarks?: string;
}

/**
 * Describes an individual value for a specific parameter.
 */
export interface ParameterValueDefinition extends WithDescription {
    /**
     * The name of the item
     */
    name: string;
    /**
     * The snippet to insert
     */
    snippet: string;

    /**
     * Whether this value has no code completion and mapping but for completeness on enum mappings
     */
    skip?: true;
}

/**
 * Defines the details of a single parameter for a {@link SignatureDefinition}
 */
export interface ParameterDefinition extends WithDescription {
    /**
     * The name of the parameter
     */
    name: string;

    /**
     * The mode used to parse this parameter.
     */
    parseMode: ArgumentListParseTypesMode;

    /**
     * The node type for this parameter.
     */
    type: AlphaTexNodeType | AlphaTexNodeType[];

    /**
     * Whether to allow strings in place of identifiers and vice versa.
     */
    allowAllStringTypes?: boolean;

    /**
     * The default value of this parameter if not provided.
     */
    defaultValue?: unknown;

    /**
     * Whether the values list should only be used for providing completion items.
     * If set to true the parser will parse tokens of any value into the AST and
     * separately semantic errors have to be created.
     */
    valuesOnlyForCompletion?: true;

    /**
     * A list of possible values
     */
    values?: ParameterValueDefinition[];

    /**
     * A list of identifiers which are reserved and cannot be used for this parameter.
     */
    reservedIdentifiers?: string[];
}

/**
 * Defines a signature for values which can be passed into the containing element
 * (e.g. metadata or properties)
 */
export interface SignatureDefinition {
    /**
     * An additional description specific for this signature.
     */
    description?: string;

    /**
     * Whether parsing should be strict, meaning: single values can be without parenthesis
     * multiple values need parenthesis.
     */
    strict?: boolean;

    /**
     * The parameters which can be passed into this signature.
     */
    parameters: ParameterDefinition[];
}

/**
 * Common props for documented elements.
 */
export interface WithSignatures extends WithDescription {
    /**
     * A list of signatures defining all overloads which can be called for this element.
     */
    signatures: SignatureDefinition[];

    /**
     * The snippet to insert on autocompleting this item.
     */
    snippet: string;

    /**
     * One or more examples demonstrating the usage of this element.
     */
    examples: AlphaTexExample | AlphaTexExample[];

    /**
     * Whether this item is hidden from auto completes and the docs
     * (e.g. because of outdated mechanisms or aliases)
     */
    hidden?: true;
}

/**
 * The documentation for a property.
 */
export interface PropertyDefinition extends WithSignatures {
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
          options?: SettingsJson;
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
 * A definition for an alphaTex metadata tag
 */
export interface MetadataTagDefinition extends WithSignatures {
    /**
     * The metadata tag (including the backslash)
     */
    tag: string;

    /**
     * A lookup containing the properties available for this metadata.
     * The key is the lowercase identifier of the property.
     */
    properties?: Map<string, PropertyDefinition>;
}
