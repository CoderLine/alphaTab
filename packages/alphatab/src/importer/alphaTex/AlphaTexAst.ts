/**
 * All node types for the alphaTex syntax tree.
 * @public
 */
export enum AlphaTexNodeType {
    // Tokens
    Dot,
    Backslash,
    DoubleBackslash,
    Pipe,
    LBrace,
    RBrace,
    LParen,
    RParen,
    Colon,
    Asterisk,

    // General Nodes
    Ident,
    Tag,
    Meta,
    Values,
    Props,
    Prop,
    Number,
    String,

    // Semantic Nodes
    Score,
    Bar,
    Beat,
    Duration,
    NoteList,
    Note
}

//
// The general AST nodes describing the low level building blocks
// allowing to describe further semantic structures.

/**
 * Maps an AST node into its respective source code location.
 * @record
 * @public
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
 * @public
 */
export interface IAlphaTexAstNode {
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
    leadingComments?: AlphaTexComment[];

    /**
     * The comments after this node (if starting on the same line).
     */
    trailingComments?: AlphaTexComment[];
}

/**
 * The base type for all alphaTex AST nodes
 * @record
 * @public
 */
export interface AlphaTexAstNode extends IAlphaTexAstNode {}

/**
 * A comment attached to a node.
 * @record
 * @public
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
 * @record
 * @public
 */
export interface AlphaTexTokenNode extends AlphaTexAstNode {}

/**
 * @record
 * @public
 */
export interface AlphaTexDotTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.Dot;
}

/**
 * @record
 * @public
 */
export interface AlphaTexBackSlashTokenNode extends AlphaTexTokenNode, IAlphaTexMetaDataTagPrefixNode {
    nodeType: AlphaTexNodeType.Backslash;
}

/**
 * @record
 * @public
 */
export interface AlphaTexDoubleBackSlashTokenNode extends AlphaTexTokenNode, IAlphaTexMetaDataTagPrefixNode {
    nodeType: AlphaTexNodeType.DoubleBackslash;
}

/**
 * @record
 * @public
 */
export interface AlphaTexPipeTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.Pipe;
}

/**
 * @record
 * @public
 */
export interface AlphaTexBraceOpenTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.LBrace;
}

/**
 * @record
 * @public
 */
export interface AlphaTexBraceCloseTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.RBrace;
}

/**
 * @record
 * @public
 */
export interface AlphaTexParenthesisOpenTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.LParen;
}

/**
 * @record
 * @public
 */
export interface AlphaTexParenthesisCloseTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.RParen;
}

/**
 * @record
 * @public
 */
export interface AlphaTexColonTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.Colon;
}

/**
 * @record
 * @public
 */
export interface AlphaTexAsteriskTokenNode extends AlphaTexTokenNode {
    nodeType: AlphaTexNodeType.Asterisk;
}

/**
 * A number literal within alphaTex. Can be a integer or floating point number.
 * @record
 * @public
 */
export interface AlphaTexNumberLiteral extends AlphaTexAstNode, IAlphaTexValueListItem, IAlphaTexNoteValueNode {
    nodeType: AlphaTexNodeType.Number;
    /**
     * The numeric value described by this literal.
     */
    value: number;
}

/**
 * A string literal within alphaTex.
 * @record
 * @public
 */
export interface AlphaTexStringLiteral extends AlphaTexTextNode, IAlphaTexValueListItem, IAlphaTexNoteValueNode {
    nodeType: AlphaTexNodeType.String;
}

/**
 * Defines the possible types for values in a {@link AlphaTexValueList}
 * @public
 */
export interface IAlphaTexValueListItem extends IAlphaTexAstNode {}

/**
 * A node holding multiple values optionally grouped by parenthesis.
 * Whether parenthesis are needed depends on the context.
 * Used in contexts like bend effects `3.3{b (0 4)}`.
 * @record
 * @public
 */
export interface AlphaTexValueList extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Values;
    /**
     * The open parenthesis token grouping the values.
     */
    openParenthesis?: AlphaTexParenthesisOpenTokenNode;
    /**
     * The list of values.
     */
    values: IAlphaTexValueListItem[];
    /**
     * The close parenthesis token grouping the values.
     */
    closeParenthesis?: AlphaTexParenthesisCloseTokenNode;
}

/**
 * A metadata tag with optional values and optional properties like:
 * `\track "Name" {color "#F00"}` .
 * @record
 * @public
 */
export interface AlphaTexMetaDataNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Meta;
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

    /**
     * Whether the properties are listed before the values (if both are present).
     */
    propertiesBeforeValues: boolean;
}

/**
 * A node describing a list of properties grouped by braces.
 * Used in contexts like note effects, beat effects
 * @record
 * @public
 */
export interface AlphaTexPropertiesNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Props;
    /**
     * The open brace grouping the properties (if needed).
     */
    openBrace?: AlphaTexBraceOpenTokenNode;
    /**
     * The individual properties
     */
    properties: AlphaTexPropertyNode[];
    /**
     * The close brace grouping the properties (if needed).
     */
    closeBrace?: AlphaTexBraceCloseTokenNode;
}

/**
 * A node describing a property with attached values.
 * @record
 * @public
 */
export interface AlphaTexPropertyNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Prop;

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
 * A base interface for nodes holding a textual value
 * like string literals or identifiers.
 * @record
 * @public
 */
export interface AlphaTexTextNode extends AlphaTexAstNode {
    /**
     * The text contained in the node.
     */
    text: string;
}

/**
 * A node describing an identifier. This is typically a string-like value
 * but not quoted.
 * @record
 * @public
 */
export interface AlphaTexIdentifier extends AlphaTexTextNode, IAlphaTexValueListItem, IAlphaTexNoteValueNode {
    nodeType: AlphaTexNodeType.Ident;
}

//
// The semantic AST nodes for the overall song structure

/**
 * A node describing the root of an alphaTex file for a musical score.
 * @record
 * @public
 */
export interface AlphaTexScoreNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Score;
    /**
     * The bars describing the contents of the song.
     */
    bars: AlphaTexBarNode[];
}

/**
 * @public
 */
export interface IAlphaTexMetaDataTagPrefixNode extends IAlphaTexAstNode {}

/**
 * A metadata tag marker like `\title`
 * @record
 * @public
 */
export interface AlphaTexMetaDataTagNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Tag;
    /**
     * The prefix indicating the start of the tag (e.g. `\` or `\\`)
     */
    prefix?: IAlphaTexMetaDataTagPrefixNode;
    /**
     * The identifier of the tag (e.g. `title`)
     */
    tag: AlphaTexIdentifier;
}

/**
 * A node describing the bar level contents as written in alphaTex.
 * @record
 * @public
 */
export interface AlphaTexBarNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Bar;

    /**
     * The metadata tags preceeding the bar contents, might start
     * new tracks, staves, voices etc.
     */
    metaData: AlphaTexMetaDataNode[];

    /**
     * The beats contained in this bar.
     */
    beats: AlphaTexBeatNode[];

    /**
     * The pipe symbol denoting the end of the bar.
     */
    pipe?: AlphaTexPipeTokenNode;
}

/**
 * A node describing a beat within alphaTex.
 * @record
 * @public
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
     * The dot separating the beat content and the postfix beat duration
     */
    durationDot?: AlphaTexDotTokenNode;

    /**
     * The postfix beat duration.
     */
    durationValue?: AlphaTexNumberLiteral;

    /**
     * The `*` marker for repeating this beat multiple times. Must have a filled `beatMultiplierValue`
     */
    beatMultiplier?: AlphaTexAsteriskTokenNode;

    /**
     * The numeric value how often the beat should be repeated.
     */
    beatMultiplierValue?: AlphaTexNumberLiteral;

    /**
     * The effect list for this beat.
     */
    beatEffects?: AlphaTexPropertiesNode;
}

/**
 * A list of notes for the beat.
 * @record
 * @public
 */
export interface AlphaTexNoteListNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.NoteList;
    /**
     * An open parenthesis token to group multiple notes for a beat.
     */
    openParenthesis?: AlphaTexParenthesisOpenTokenNode;

    /**
     * The notes contained in this list.
     */
    notes: AlphaTexNoteNode[];

    /**
     * A close parenthesis token to group multiple notes for a beat.
     */
    closeParenthesis?: AlphaTexParenthesisCloseTokenNode;
}

/**
 * @public
 */
export interface IAlphaTexNoteValueNode extends IAlphaTexAstNode {}

/**
 * A node describing a single note.
 * @record
 * @public
 */
export interface AlphaTexNoteNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Note;

    /**
     * The value of the note. Depending on whether it is a fretted, pitched or percussion
     * note this value varies.
     */
    noteValue: IAlphaTexNoteValueNode;

    /**
     * The dot separating the note value and the string for fretted/stringed instruments like guitars.
     */
    noteStringDot?: AlphaTexDotTokenNode;

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
 * @record
 * @public
 */
export interface AlphaTexBeatDurationChangeNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Duration;
    /**
     * The colon token marking the duration change node
     */
    colon: AlphaTexColonTokenNode;
    /**
     * The numeric value describing the duration.
     */
    value?: AlphaTexNumberLiteral;
    /**
     * Additional duration attributes like tuplets.
     */
    properties?: AlphaTexPropertiesNode;
}
