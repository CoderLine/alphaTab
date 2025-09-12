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

export interface AlphaTexAstNodeLocation {
    line: number;
    col: number;
    offset: number;
}

export interface AlphaTexAstNode {
    nodeType: AlphaTexNodeType;
    start?: AlphaTexAstNodeLocation;
    end?: AlphaTexAstNodeLocation;
    comments?: AlphaTexComment[];
}

export interface AlphaTexComment {
    start?: AlphaTexAstNodeLocation;
    end?: AlphaTexAstNodeLocation;
    multiLine: boolean;
    text: string;
}

export interface AlphaTexTokenNode<T extends AlphaTexNodeType> extends AlphaTexAstNode {
    nodeType: T;
}

export interface AlphaTexScoreNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Score;
    metaData: AlphaTexMetaDataWithPropertiesNode[];
    metaDataBarSeparator?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
    bars: AlphaTexBarNode[];
    barsSyncPointSeparator?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
    syncPoints: AlphaTexMetaDataWithPropertiesNode[];
}

export interface AlphaTexMetaDataTagNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.MetaDataTag;
    prefix?:
        | AlphaTexTokenNode<AlphaTexNodeType.BackSlashToken>
        | AlphaTexTokenNode<AlphaTexNodeType.DoubleBackSlashToken>;
    tag: AlphaTexIdentifier;
}

export interface AlphaTexNumberLiteral extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.NumberLiteral;
    value: number;
}

export interface AlphaTexStringLiteral extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.StringLiteral;
    value: string;
}

export interface AlphaTexBarNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Bar;

    trackMetaData?: AlphaTexMetaDataWithPropertiesNode;
    staffMetaData?: AlphaTexMetaDataWithPropertiesNode;
    voiceMetaData?: AlphaTexMetaDataWithPropertiesNode;

    barMetaData: AlphaTexMetaDataWithPropertiesNode[];

    beats: AlphaTexBeatNode[];

    pipe: AlphaTexTokenNode<AlphaTexNodeType.PipeToken>;
}

export interface AlphaTexBeatNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Beat;
    durationChange: AlphaTexBeatDurationChangeNode;
    notes?: AlphaTexNoteListNode;
    rest?: AlphaTexIdentifier;
    beatEffects?: AlphaTexPropertiesNode;
    beatMultiplier?: AlphaTexTokenNode<AlphaTexNodeType.AsteriskToken>;
    beatMultiplierValue?: AlphaTexNumberLiteral;
}

export interface AlphaTexNoteListNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.NoteList;
    openParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;
    notes: AlphaTexNoteNode[];
    closeParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
}
export interface AlphaTexNoteNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Note;

    noteValue: AlphaTexNumberLiteral | AlphaTexStringLiteral | AlphaTexIdentifier;
    noteStringDot?: AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
    noteString?: AlphaTexNumberLiteral;

    noteEffects?: AlphaTexPropertiesNode;
}

export interface AlphaTexBeatDurationChangeNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.BeatDurationChange;
    colon: AlphaTexTokenNode<AlphaTexNodeType.ColonToken>;
    value: AlphaTexNumberLiteral;
    properties?: AlphaTexPropertiesNode;
}

export interface AlphaTexValueList extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.ValueList;
    openParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;
    values: (AlphaTexIdentifier | AlphaTexStringLiteral | AlphaTexNumberLiteral | AlphaTexValueList)[];
    closeParenthesis?: AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
}

export interface AlphaTexMetaDataWithPropertiesNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.MetaDataWithProperties;
    properties?: AlphaTexPropertiesNode;
}

export interface AlphaTexPropertiesNode extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Properties;
    openBrace?: AlphaTexTokenNode<AlphaTexNodeType.BraceOpenToken>;
    properties: AlphaTexPropertyNode[];
    closeBrace?: AlphaTexTokenNode<AlphaTexNodeType.BraceCloseToken>;
}

export interface AlphaTexPropertyNode extends AlphaTexAstNode {
    property: AlphaTexIdentifier;
    values: AlphaTexValueList;
}

export interface AlphaTexIdentifier extends AlphaTexAstNode {
    nodeType: AlphaTexNodeType.Identifier;
    text: string;
}
