import { AlphaTex1LanguageHandler, type IAlphaTexMetaDataReader } from '@src/importer/AlphaTexLanguageHandler';
import { AlphaTexLexer } from '@src/importer/AlphaTexLexer';
import {
    type AlphaTexDiagnostic,
    AlphaTexDiagnosticBag, 
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    AlphaTexParserAbort
} from '@src/importer/AlphaTexShared';
import {
    type AlphaTexAstNode,
    type AlphaTexBarNode,
    type AlphaTexBeatDurationChangeNode,
    type AlphaTexBeatNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNoteListNode,
    type AlphaTexNoteNode,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexScoreNode,
    type AlphaTexStringLiteral,
    type AlphaTexTokenNode,
    type AlphaTexValueList
} from './AlphaTexAst';

/**
 * A parser for translating a given alphaTex source into an AST for further use
 * in the alphaTex importer, editors etc.
 */
export class AlphaTexParser {
    public readonly lexer: AlphaTexLexer;
    private _score!: AlphaTexScoreNode;
    private _metaDataReader: IAlphaTexMetaDataReader = AlphaTex1LanguageHandler.instance;

    public get lexerDiagnostics(): AlphaTexDiagnosticBag {
        return this.lexer.lexerDiagnostics;
    }

    public readonly parserDiagnostics = new AlphaTexDiagnosticBag();

    public addParserDiagnostic(diagnostics: AlphaTexDiagnostic) {
        this.parserDiagnostics.push(diagnostics);
    }

    /**
     * @internal
     */
    public unexpectedToken(actual: AlphaTexAstNode | undefined, expected: AlphaTexNodeType[], abort: boolean) {
        if (!actual) {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT205,
                start: this.lexer.currentTokenLocation(),
                end: this.lexer.currentTokenLocation(),
                severity: AlphaTexDiagnosticsSeverity.Error,
                message: 'Unexpected end of file.'
            });
        } else {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT204,
                message: `Unexpected '${AlphaTexNodeType[actual.nodeType]}' token. Expected one of following: ${expected.map(v => AlphaTexNodeType[v]).join(',')}`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: actual.start,
                end: actual.end
            });
        }

        if (abort) {
            throw new AlphaTexParserAbort();
        }
    }

    public constructor(source: string) {
        this.lexer = new AlphaTexLexer(source);
    }

    public read(): AlphaTexScoreNode {
        this.score();

        return this._score;
    }

    // recursive decent

    private score() {
        this._score = {
            nodeType: AlphaTexNodeType.Score,
            metaData: [],
            metaDataBarSeparator: undefined,
            bars: [],
            barsSyncPointSeparator: undefined,
            syncPoints: [],
            start: this.lexer.currentTokenLocation()
        };

        try {
            this.scoreMetaData();
            this.bars();
            this.syncPoints();
        } catch (e) {
            if (e instanceof AlphaTexParserAbort) {
                // OK
            } else {
                throw e;
            }
        } finally {
            this._score.end = this.lexer.currentTokenLocation();
        }
    }

    private scoreMetaData() {
        while (this.lexer.peekToken()?.nodeType === AlphaTexNodeType.MetaDataTag) {
            const metaData = this.metaData();
            if (metaData) {
                this._score.metaData.push(metaData);
            } else {
                break;
            }
        }

        const dot = this.lexer.peekToken();
        // EOF
        if (!dot) {
            return;
        }
        if (dot.nodeType === AlphaTexNodeType.DotToken) {
            // NOTE: dot is not mandatory anymore, we can have bar and score metadata mixed at start.
            this._score.metaDataBarSeparator = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
        }
    }

    private bars() {
        while (this.lexer.canRead) {
            const token = this.lexer.peekToken();
            // EOF
            if (!token) {
                return;
            }

            // dot separator marking end of bars
            if (token.nodeType === AlphaTexNodeType.DotToken) {
                this._score.barsSyncPointSeparator =
                    this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
                return;
            }

            // still reading bars
            this.bar();
        }
    }

    private bar() {
        const bar: AlphaTexBarNode = {
            nodeType: AlphaTexNodeType.Bar,
            metaData: [],
            beats: [],
            pipe: undefined,
            start: this.lexer.currentTokenLocation()
        };
        try {
            this.barMetaData(bar);
            this.barBeats(bar);

            if (this.lexer.peekToken()?.nodeType === AlphaTexNodeType.PipeToken) {
                bar.pipe = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.PipeToken>;
            }

            if (bar.metaData.length > 0 || bar.beats.length > 0 || bar.pipe) {
                bar.end = this.lexer.currentTokenLocation();
                this._score.bars.push(bar);
            }
        } finally {
            bar.end = this.lexer.currentTokenLocation();
        }
    }

    private barMetaData(bar: AlphaTexBarNode) {
        let token = this.lexer.peekToken();
        while (token?.nodeType === AlphaTexNodeType.MetaDataTag) {
            bar.metaData.push(this.metaData()!);
            token = this.lexer.peekToken();
        }
    }

    private barBeats(bar: AlphaTexBarNode) {
        let token = this.lexer.peekToken();
        while (
            token &&
            token.nodeType !== AlphaTexNodeType.PipeToken &&
            token.nodeType !== AlphaTexNodeType.DotToken &&
            token.nodeType !== AlphaTexNodeType.MetaDataTag
        ) {
            const beat = this.beat();
            if (beat) {
                bar.beats.push(beat);
            }
            token = this.lexer.peekToken();
        }
    }

    private beat(): AlphaTexBeatNode | undefined {
        const beat: AlphaTexBeatNode = {
            nodeType: AlphaTexNodeType.Beat,
            durationChange: undefined,
            notes: undefined,
            rest: undefined,
            beatEffects: undefined,
            beatMultiplier: undefined,
            beatMultiplierValue: undefined,
            start: this.lexer.peekToken()?.start
        };

        try {
            beat.durationChange = this.beatDurationChange();

            this.beatContent(beat);
            if (!beat.notes && !beat.rest) {
                return beat;
            }

            this.beatDuration(beat);
            this.beatMultiplier(beat);

            beat.beatEffects = this.properties(property => this._metaDataReader.readBeatPropertyValues(this, property));
        } finally {
            beat.end = this.lexer.currentTokenLocation();
        }

        return beat;
    }

    private beatDuration(beat: AlphaTexBeatNode) {
        const dot = this.lexer.peekToken();
        if (dot?.nodeType !== AlphaTexNodeType.DotToken) {
            return;
        }

        beat.durationDot = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

        const durationValue = this.lexer.peekToken();
        if (durationValue?.nodeType === AlphaTexNodeType.NumberLiteral) {
            beat.durationValue = this.lexer.nextToken() as AlphaTexNumberLiteral;
            return;
        } else if (durationValue?.nodeType === AlphaTexNodeType.MetaDataTag) {
            // handle switch to sync points like: 3.3 . \sync 1 1 1
            this.lexer.revert(beat.durationDot);
            beat.durationDot = undefined;
            return;
        } else if (!durationValue) {
            // handle switch to sync points like: 3.3 .
            // (no sync points yet)
            return;
        } else {
            this.unexpectedToken(durationValue, [AlphaTexNodeType.NumberLiteral], true);
        }
    }

    private beatDurationChange(): AlphaTexBeatDurationChangeNode | undefined {
        const colon = this.lexer.peekToken();
        if (colon?.nodeType !== AlphaTexNodeType.ColonToken) {
            return undefined;
        }

        const durationChange: AlphaTexBeatDurationChangeNode = {
            nodeType: AlphaTexNodeType.BeatDurationChange,
            colon: this.lexer.nextToken()! as AlphaTexTokenNode<AlphaTexNodeType.ColonToken>,
            value: undefined,
            properties: undefined,
            start: colon.start
        };
        try {
            const durationValue = this.lexer.peekToken();
            if (!durationValue || durationValue.nodeType !== AlphaTexNodeType.NumberLiteral) {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT201,
                    message: "Missing duration value after ':'.",
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: colon!.start,
                    end: colon!.end
                });
                return undefined;
            }
            durationChange.value = this.lexer.nextToken() as AlphaTexNumberLiteral;

            durationChange.properties = this.properties(property =>
                this._metaDataReader.readDurationChangePropertyValues(this, property)
            );
        } finally {
            durationChange.end = this.lexer.currentTokenLocation();
        }

        return durationChange;
    }

    private beatContent(beat: AlphaTexBeatNode) {
        const notes = this.lexer.peekToken();
        if (!notes) {
            return;
        }
        if (notes.nodeType === AlphaTexNodeType.Identifier && (notes as AlphaTexIdentifier).text === 'r') {
            beat.rest = this.lexer.nextToken() as AlphaTexIdentifier;
        } else if (notes.nodeType === AlphaTexNodeType.ParenthesisOpenToken) {
            beat.notes = this.noteList();
        } else {
            const note = this.note();
            if (note) {
                beat.notes = {
                    nodeType: AlphaTexNodeType.NoteList,
                    openParenthesis: undefined,
                    notes: [note],
                    closeParenthesis: undefined,
                    start: note.start,
                    end: note.end
                };
            }
        }
    }

    private beatMultiplier(beat: AlphaTexBeatNode) {
        const multiplier = this.lexer.peekToken();
        if (!multiplier || multiplier.nodeType !== AlphaTexNodeType.AsteriskToken) {
            return;
        }
        beat.beatMultiplier = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.AsteriskToken>;

        const multiplierValue = this.lexer.peekToken();
        if (!multiplierValue || multiplierValue.nodeType !== AlphaTexNodeType.NumberLiteral) {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT200,
                message: "Missing beat multiplier value after '*'.",
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: beat.beatMultiplier!.start,
                end: beat.beatMultiplier!.end
            });
            return;
        }

        beat.beatMultiplierValue = this.lexer.nextToken() as AlphaTexNumberLiteral;
    }

    private noteList(): AlphaTexNoteListNode {
        const noteList: AlphaTexNoteListNode = {
            nodeType: AlphaTexNodeType.NoteList,
            openParenthesis: undefined,
            notes: [],
            closeParenthesis: undefined,
            start: this.lexer.currentTokenLocation()
        };
        try {
            noteList.openParenthesis =
                this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;

            let token = this.lexer.peekToken();
            while (token && token.nodeType !== AlphaTexNodeType.ParenthesisCloseToken) {
                const note = this.note();
                if (note) {
                    noteList.notes.push(note);
                } else {
                    break;
                }
                token = this.lexer.peekToken();
            }

            const closeParenthesis = this.lexer.peekToken();
            if (closeParenthesis?.nodeType === AlphaTexNodeType.ParenthesisCloseToken) {
                noteList.closeParenthesis =
                    this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT208,
                    message: 'Unexpected end of file. Group not closed.',
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: closeParenthesis?.start ?? this.lexer.currentTokenLocation(),
                    end: closeParenthesis?.end ?? this.lexer.currentTokenLocation()
                });
            }
        } finally {
            noteList.end = this.lexer.currentTokenLocation();
        }

        return noteList;
    }

    private note(): AlphaTexNoteNode | undefined {
        const noteValue = this.lexer.peekToken();
        if (!noteValue) {
            return undefined;
        }

        const note: AlphaTexNoteNode = {
            nodeType: AlphaTexNodeType.Note,
            noteValue: {
                // placeholder value
                nodeType: AlphaTexNodeType.Identifier,
                text: ''
            } as AlphaTexIdentifier,
            start: noteValue.start
        };
        try {
            let canHaveString = false;
            switch (noteValue.nodeType) {
                case AlphaTexNodeType.NumberLiteral:
                    note.noteValue = this.lexer.nextToken() as AlphaTexNumberLiteral;
                    canHaveString = true;

                    break;
                case AlphaTexNodeType.StringLiteral:
                    note.noteValue = this.lexer.nextToken() as AlphaTexStringLiteral;
                    switch ((note.noteValue as AlphaTexStringLiteral).text) {
                        case 'x':
                        case '-':
                            canHaveString = true;
                            break;
                    }
                    break;
                case AlphaTexNodeType.Identifier:
                    note.noteValue = this.lexer.nextToken() as AlphaTexIdentifier;
                    switch ((note.noteValue as AlphaTexIdentifier).text) {
                        case 'x':
                        case '-':
                            canHaveString = true;
                            break;
                    }
                    break;
                default:
                    this.unexpectedToken(
                        noteValue,
                        [AlphaTexNodeType.NumberLiteral, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                        true
                    );
                    return undefined;
            }

            if (canHaveString) {
                if (this.lexer.peekToken()?.nodeType === AlphaTexNodeType.DotToken) {
                    const noteStringDot = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

                    const noteString = this.lexer.peekToken();
                    if (!noteString) {
                        this.unexpectedToken(noteString, [AlphaTexNodeType.NumberLiteral], true);
                        return undefined;
                    }

                    // handle switch to sync points like: 3 4 5 . \sync 1 1 1
                    // in this example the numbers are percussion articulations

                    if (noteString.nodeType === AlphaTexNodeType.MetaDataTag) {
                        // backtrack
                        this.lexer.revert(noteStringDot);
                        return note;
                    } else if (noteString.nodeType === AlphaTexNodeType.NumberLiteral) {
                        note.noteStringDot = noteStringDot;
                        note.noteString = this.lexer.nextToken() as AlphaTexNumberLiteral;
                    } else {
                        this.unexpectedToken(noteString, [AlphaTexNodeType.NumberLiteral], true);
                        return undefined;
                    }
                }
            }

            note.noteEffects = this.properties(property => this._metaDataReader.readNotePropertyValues(this, property));
        } finally {
            note.end = this.lexer.currentTokenLocation();
        }

        return note;
    }

    private syncPoints() {
        while (this.lexer.canRead) {
            const syncPoint = this.syncPoint();
            if (!syncPoint) {
                return;
            }
            this._score.syncPoints.push(syncPoint);
        }
    }

    private syncPoint(): AlphaTexMetaDataNode | undefined {
        const tag = this.lexer.peekToken();
        if (!tag) {
            return undefined;
        }
        if (tag.nodeType !== AlphaTexNodeType.MetaDataTag) {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT202,
                message: `Unexpected '${AlphaTexNodeType[tag.nodeType]}' token. Expected a '\\sync' meta data tag.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: tag.start,
                end: tag.end
            });
            return undefined;
        }
        if ((tag as AlphaTexMetaDataTagNode).tag.text !== 'sync') {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT203,
                message: `Unexpected meta data tag '${(tag as AlphaTexMetaDataTagNode).tag.text}'. Expected a '\\sync' meta data tag.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: tag.start,
                end: tag.end
            });
            return undefined;
        }

        return this.metaData();
    }

    private metaData(): AlphaTexMetaDataNode | undefined {
        const tag = this.lexer.peekToken();
        if (!tag || tag.nodeType !== AlphaTexNodeType.MetaDataTag) {
            return undefined;
        }

        const metaData: AlphaTexMetaDataNode = {
            nodeType: AlphaTexNodeType.MetaData,
            tag: this.lexer.nextToken() as AlphaTexMetaDataTagNode,
            start: tag.start,
            properties: undefined
        };
        try {
            metaData.values = this.valueList() ?? this._metaDataReader.readMetaDataValues(this, metaData.tag);
            metaData.properties = this.properties(property =>
                this._metaDataReader.readMetaDataPropertyValues(this, metaData.tag, property)
            );
        } finally {
            metaData.end = this.lexer.currentTokenLocation();
        }
        return metaData;
    }

    private properties(
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertiesNode | undefined {
        const braceOpen = this.lexer.peekToken();
        if (!braceOpen || braceOpen.nodeType !== AlphaTexNodeType.BraceOpenToken) {
            return undefined;
        }

        const properties: AlphaTexPropertiesNode = {
            nodeType: AlphaTexNodeType.Properties,
            openBrace: this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.BraceOpenToken>,
            properties: [],
            closeBrace: undefined,
            start: braceOpen.start
        };
        try {
            let token = this.lexer.peekToken();
            while (token?.nodeType === AlphaTexNodeType.Identifier) {
                properties.properties.push(this.property(readPropertyValues));
                token = this.lexer.peekToken();
            }

            const braceClose = this.lexer.peekToken();
            if (braceClose?.nodeType === AlphaTexNodeType.BraceCloseToken) {
                properties.closeBrace = this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.BraceCloseToken>;
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT208,
                    message: 'Unexpected end of file. Group not closed.',
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: this.lexer.currentTokenLocation(),
                    end: this.lexer.currentTokenLocation()
                });
            }
        } finally {
            properties.end = this.lexer.currentTokenLocation();
        }

        return properties;
    }

    private property(
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertyNode {
        const property: AlphaTexPropertyNode = {
            nodeType: AlphaTexNodeType.Property,
            property: this.lexer.nextToken() as AlphaTexIdentifier,
            values: undefined
        };
        property.start = property.property.start;
        try {
            property.values = this.valueList() ?? readPropertyValues(property);
        } finally {
            property.end = this.lexer.currentTokenLocation();
        }

        return property;
    }

    public valueList(): AlphaTexValueList | undefined {
        const openParenthesis = this.lexer.peekToken();
        if (openParenthesis?.nodeType !== AlphaTexNodeType.ParenthesisOpenToken) {
            return undefined;
        }

        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            openParenthesis: this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>,
            values: [],
            closeParenthesis: undefined,
            start: openParenthesis.start
        };

        try {
            let token = this.lexer.peekToken();
            while (token && token?.nodeType !== AlphaTexNodeType.ParenthesisCloseToken) {
                switch (token.nodeType) {
                    case AlphaTexNodeType.Identifier:
                        valueList.values.push(this.lexer.nextToken() as AlphaTexIdentifier);
                        break;
                    case AlphaTexNodeType.StringLiteral:
                        valueList.values.push(this.lexer.nextToken() as AlphaTexStringLiteral);
                        break;
                    case AlphaTexNodeType.NumberLiteral:
                        // in value lists we can always assume floats
                        // (within parenthesis we have no risk of syntax overlaps)
                        valueList.values.push(this.lexer.nextTokenWithFloats() as AlphaTexNumberLiteral);
                        break;
                    default:
                        this.unexpectedToken(
                            token,
                            [
                                AlphaTexNodeType.Identifier,
                                AlphaTexNodeType.StringLiteral,
                                AlphaTexNodeType.NumberLiteral
                            ],
                            false
                        );
                        // try to skip and continue parsing
                        this.lexer.nextToken();
                        break;
                }

                token = this.lexer.peekToken();
            }

            if (this.lexer.peekToken()?.nodeType === AlphaTexNodeType.ParenthesisCloseToken) {
                valueList.closeParenthesis =
                    this.lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT208,
                    message: 'Unexpected end of file. Group not closed.',
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: this.lexer.currentTokenLocation(),
                    end: this.lexer.currentTokenLocation()
                });
            }
        } finally {
            valueList.end = this.lexer.currentTokenLocation();
        }

        return valueList;
    }
}