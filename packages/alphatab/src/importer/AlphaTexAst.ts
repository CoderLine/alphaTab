/**
 * All node types for the alphaTex syntax tree.
 */
export enum AlphaTexNodeType {
    // Tokens
    DotToken,
    BackSlashToken,
    DoubleBackSlashToken,
    PipeToken,
    BraceOpenToken,
    BraceCloseToken,
    ParenthesisOpenToken,
    ParenthesisCloseToken,
    ColonToken,
    AsteriskToken,

    // General Nodes
    Identifier,
    MetaDataTag,
    MetaDataWithProperties,
    ValueList,
    Properties,
    Property,
    NumberLiteral,
    StringLiteral,

    // Semantic Nodes
    Score,
    Bar,
    Beat,
    BeatDurationChange,
    NoteList,
    Note
}

//
// The general AST nodes describing the low level building blocks
// allowing to describe further semantic structures.

/**
 * Maps an AST node into its respective source code location.
 */
export interface AlphaTexAstNodeLocation {
    /**
     * The 1-based line index within the source code.
     */
    line: number;
    /**
     * The 1-based column index within the source code.
     */
    col: number;
    /**
     * The 0-based codepoint offset within the source code.
     */
    offset: number;
}

/**
 * The base type for all alphaTex AST nodes
 */
export interface AlphaTexAstNode {
    /**
     * The type of the node.
     */
    nodeType: AlphaTexNodeType;
    /**
     * The start of this node when parsed from an input source file.
     */
    start?: AlphaTexAstNodeLocation;
    /**
     * The end (inclusive) of this node when parsed from an input source file.
     */
    end?: AlphaTexAstNodeLocation;

    /**
     * The comments preceeding this node.
     */
    comments?: AlphaTexComment[];
}

/**
 * A comment attached to a node.
 */
export interface AlphaTexComment {
    /**
     * The start of this node when parsed from an input source file.
     */
    start?: AlphaTexAstNodeLocation;
    /**
     * The end (inclusive) of this node when parsed from an input source file.
     */
    end?: AlphaTexAstNodeLocation;
    /**
     * Whether the comment is a multiline comment or a single line comment
     */
    multiLine: boolean;
    /**
     * The comment text excluding the comment start/end markers.
     */
    text: string;
}

/**
 * A node describing a single token like dots or colons.
 */
export interface AlphaTexTokenNode<T extends AlphaTexNodeType> extends AlphaTexAstNode {
    nodeType: T;
}

/**
 * A number literal within alphaTex. Can be a integer or floating point number.
 */
export interface AlphaTexNumberLiteral extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.NumberLiteral;
    /**
     * The numeric value described by this literal.
     */
    value: number;
}

/**
 * A string literal within alphaTex.
 */
export interface AlphaTexStringLiteral extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.StringLiteral;
    /**
     * The contained string value described by this literal.
     */
    value: string;
}

/**
 * A node holding multiple values optionally grouped by parenthesis.
 * Whether parenthesis are needed depends on the context.
 * Used in contexts like bend effects `3.3{b (0 4)}`.
 */
export interface AlphaTexValueList extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.ValueList;
    /**
     * The open parenthesis token grouping the values.
     */
    openParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;
    /**
     * The list of values.
     */
    values: (AlphaTexIdentifier | AlphaTexStringLiteral | AlphaTexNumberLiteral | AlphaTexValueList)[];
    /**
     * The close parenthesis token grouping the values.
     */
    closeParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
}

/**
 * A metadata tag with optional values and optional properties like:
 * `\title "Song Title"`, `\ts 3 4`, `\hidedynamics`, `\track "Name" {color "#F00"}` .
 */
export interface AlphaTexMetaDataWithPropertiesNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.MetaDataWithProperties;
    /**
     * The tag part of the metadata.
     */
    tag: AlphaTexMetaDataTagNode;

    /**
     * A value list directly listed after the metadata (not within braces).
     */
    values?: AlphaTexValueList;

    /**
     * The optional properties attached to the metadata.
     */
    properties?: AlphaTexPropertiesNode;
}

/**
 * A node describing a list of properties grouped by braces.
 * Used in contexts like note effects, beat effects
 */
export interface AlphaTexPropertiesNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Properties;
    /**
     * The open brace grouping the properties (if needed).
     */
    openBrace?: AlphaTexTokenNode<AlphaTexNodeType.BraceOpenToken>;
    /**
     * The individual properties
     */
    properties: AlphaTexPropertyNode[];
    /**
     * The close brace grouping the properties (if needed).
     */
    closeBrace?: AlphaTexTokenNode<AlphaTexNodeType.BraceCloseToken>;
}

/**
 * A node describing a property with attached values.
 */
export interface AlphaTexPropertyNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Property;

    /**
     * The identifier describing the property.
     */
    property: AlphaTexIdentifier;
    /**
     * The values attached to the property.
     */
    values?: AlphaTexValueList;
}

/**
 * A node describing an identifier. This is typically a string-like value
 * but not quoted.
 */
export interface AlphaTexIdentifier extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Identifier;
    /**
     * The text of the identifier.
     */
    text: string;
}

//
// The semantic AST nodes for the overall song structure

/**
 * A node describing the root of an alphaTex file for a musical score.
 */
export interface AlphaTexScoreNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Score;

    /**
     * The metadata tags describing the top level score information.
     */
    metaData: AlphaTexMetaDataWithPropertiesNode[];

    /**
     * The separator between the score metadata and the bars.
     */
    metaDataBarSeparator?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

    /**
     * The bars describing the contents of the song.
     */
    bars: AlphaTexBarNode[];

    /**
     * The separator between the bars and the sync points.
     */
    barsSyncPointSeparator?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

    /**
     * The sync points for linking the song to an external media.
     */
    syncPoints: AlphaTexMetaDataWithPropertiesNode[];
}

/**
 * A metadata tag marker like `\title`
 */
export interface AlphaTexMetaDataTagNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.MetaDataTag;
    /**
     * The prefix indicating the start of the tag (e.g. `\` or `\\`)
     */
    prefix?:
        | AlphaTexTokenNode<AlphaTexNodeType.BackSlashToken>
        | AlphaTexTokenNode<AlphaTexNodeType.DoubleBackSlashToken>;
    /**
     * The identifier of the tag (e.g. `title`)
     */
    tag: AlphaTexIdentifier;
}

/**
 * A node describing the bar level contents as written in alphaTex.
 */
export interface AlphaTexBarNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Bar;

    /**
     * An optional `\track` marker indicating that on this bar
     * the data of a new track starts.
     */
    trackMetaData?: AlphaTexMetaDataWithPropertiesNode;
    /**
     * An optional `\staff` marker indicating that on this bar
     * the data of a new staff starts.
     */
    staffMetaData?: AlphaTexMetaDataWithPropertiesNode;
    /**
     * An optional `\voice` marker indicating that on this bar
     * the data of a new voice starts.
     */
    voiceMetaData?: AlphaTexMetaDataWithPropertiesNode;

    /**
     * The bar level metadata describing bar or masterbar level
     * data.
     */
    barMetaData: AlphaTexMetaDataWithPropertiesNode[];

    /**
     * The beats contained in this bar.
     */
    beats: AlphaTexBeatNode[];

    /**
     * The pipe symbol denoting the end of the bar.
     */
    pipe?: AlphaTexTokenNode<AlphaTexNodeType.PipeToken>;
}

/**
 * A node describing a beat within alphaTex.
 */
export interface AlphaTexBeatNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Beat;
    /**
     * An optional marker changing the beat duration via a marker like `:4`
     */
    durationChange?: AlphaTexBeatDurationChangeNode;

    /**
     * The notes contained in this beat (mutually exclusive with `rest`)
     */
    notes?: AlphaTexNoteListNode;
    /**
     * The marker indicating that this beat is a rest beat. Currently always an identifier with `r`
     */
    rest?: AlphaTexIdentifier;
    /**
     * The effect list for this beat.
     */
    beatEffects?: AlphaTexPropertiesNode;

    /**
     * The `*` marker for repeating this beat multiple times. Must have a filled `beatMultiplierValue`
     */
    beatMultiplier?: AlphaTexTokenNode<AlphaTexNodeType.AsteriskToken>;

    /**
     * The numeric value how often the beat should be repeated.
     */
    beatMultiplierValue?: AlphaTexNumberLiteral;
}

/**
 * A list of notes for the beat.
 */
export interface AlphaTexNoteListNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.NoteList;
    /**
     * An open parenthesis token to group multiple notes for a beat.
     */
    openParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;

    /**
     * The notes contained in this list.
     */
    notes: AlphaTexNoteNode[];

    /**
     * A close parenthesis token to group multiple notes for a beat.
     */
    closeParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
}

/**
 * A node describing a single note.
 */
export interface AlphaTexNoteNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Note;

    /**
     * The value of the note. Depending on whether it is a fretted, pitched or percussion
     * note this value varies.
     */
    noteValue: AlphaTexNumberLiteral | AlphaTexStringLiteral | AlphaTexIdentifier;

    /**
     * The dot separating the note value and the string for fretted/stringed instruments like guitars.
     */
    noteStringDot?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

    /**
     * The string value for fretted/stringed notes like guitars.
     */
    noteString?: AlphaTexNumberLiteral;

    /**
     * The effect list for this note. Semantically this list might also contain
     * effects applied to the beat level. This allows specifying beat effects
     * on a single note beat like `C4{txt "Beat Text" turn}` instead of
     * `C4{turn}{txt Beat}`
     */
    noteEffects?: AlphaTexPropertiesNode;
}

/**
 * A note describing a duration change like `:4` or `:4 { tu 3 }`
 */
export interface AlphaTexBeatDurationChangeNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.BeatDurationChange;
    /**
     * The colon token marking the duration change node
     */
    colon: AlphaTexTokenNode<AlphaTexNodeType.ColonToken>;
    /**
     * The numeric value describing the duration.
     */
    value?: AlphaTexNumberLiteral;
    /**
     * Additional duration attributes like tuplets.
     */
    properties?: AlphaTexPropertiesNode;
}
