import { AlphaTex1MetaDataReader } from '@src/importer/alphaTex/AlphaTex1MetaDataReader';
import {
    type AlphaTexAsteriskTokenNode,
    type AlphaTexAstNode,
    type AlphaTexBarNode,
    type AlphaTexBeatDurationChangeNode,
    type AlphaTexBeatNode,
    type AlphaTexBraceCloseTokenNode,
    type AlphaTexBraceOpenTokenNode,
    type AlphaTexColonTokenNode,
    type AlphaTexDotTokenNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNoteListNode,
    type AlphaTexNoteNode,
    type AlphaTexNumberLiteral,
    type AlphaTexParenthesisCloseTokenNode,
    type AlphaTexParenthesisOpenTokenNode,
    type AlphaTexPipeTokenNode,
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexScoreNode,
    type AlphaTexStringLiteral,
    type AlphaTexValueList
} from '@src/importer/alphaTex/AlphaTexAst';
import { AlphaTexLexer } from '@src/importer/alphaTex/AlphaTexLexer';
import {
    type AlphaTexDiagnostic,
    AlphaTexDiagnosticBag,
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    AlphaTexParserAbort
} from '@src/importer/alphaTex/AlphaTexShared';
import type { IAlphaTexMetaDataReader } from '@src/importer/alphaTex/IAlphaTexMetaDataReader';

/**
 * A parser for translating a given alphaTex source into an AST for further use
 * in the alphaTex importer, editors etc.
 * @public
 */
export class AlphaTexParser {
    public readonly lexer: AlphaTexLexer;
    private _scoreNode!: AlphaTexScoreNode;
    private _metaDataReader: IAlphaTexMetaDataReader = AlphaTex1MetaDataReader.instance;

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
                code: AlphaTexDiagnosticCode.AT203,
                start: this.lexer.currentTokenLocation(),
                end: this.lexer.currentTokenLocation(),
                severity: AlphaTexDiagnosticsSeverity.Error,
                message: 'Unexpected end of file.'
            });
        } else {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT202,
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
        this._score();

        return this._scoreNode;
    }

    // recursive decent

    private _score() {
        this._scoreNode = {
            nodeType: AlphaTexNodeType.Score,
            bars: [],
            start: this.lexer.currentTokenLocation()
        };

        try {
            this._bars();
        } catch (e) {
            if (e instanceof AlphaTexParserAbort) {
                // OK
            } else {
                throw e;
            }
        } finally {
            this._scoreNode.end = this.lexer.currentTokenLocation();
        }
    }

    private _bars() {
        let token = this.lexer.peekToken();
        while (token) {
            // still reading bars
            this._bar();

            token = this.lexer.peekToken();
        }
    }

    private _bar() {
        const bar: AlphaTexBarNode = {
            nodeType: AlphaTexNodeType.Bar,
            metaData: [],
            beats: [],
            pipe: undefined,
            start: this.lexer.currentTokenLocation()
        };
        try {
            this._barMetaData(bar);
            this._barBeats(bar);

            const next = this.lexer.peekToken();
            if (next?.nodeType === AlphaTexNodeType.Pipe) {
                bar.pipe = next as AlphaTexPipeTokenNode;
                this.lexer.advance();
            }

            if (bar.metaData.length > 0 || bar.beats.length > 0 || bar.pipe) {
                bar.end = this.lexer.currentTokenLocation();
                this._scoreNode.bars.push(bar);
            }
        } finally {
            bar.end = this.lexer.currentTokenLocation();
        }
    }

    private _barMetaData(bar: AlphaTexBarNode) {
        let token = this.lexer.peekToken();
        while (token && (token.nodeType === AlphaTexNodeType.Tag || token.nodeType === AlphaTexNodeType.Dot)) {
            if (token.nodeType === AlphaTexNodeType.Dot) {
                this.lexer.advance();
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT400,
                    message: `The dots separating score metadata, score contents and the sync points can be removed.`,
                    severity: AlphaTexDiagnosticsSeverity.Hint,
                    start: token.start,
                    end: token.end
                });
            } else {
                bar.metaData.push(this._metaData()!);
            }

            token = this.lexer.peekToken();
        }
    }

    private _barBeats(bar: AlphaTexBarNode) {
        let token = this.lexer.peekToken();
        while (
            token &&
            token.nodeType !== AlphaTexNodeType.Pipe &&
            token.nodeType !== AlphaTexNodeType.Dot &&
            token.nodeType !== AlphaTexNodeType.Tag
        ) {
            const beat = this._beat();
            if (beat) {
                bar.beats.push(beat);
            }
            token = this.lexer.peekToken();
        }
    }

    private _beat(): AlphaTexBeatNode | undefined {
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
            beat.durationChange = this._beatDurationChange();

            this._beatContent(beat);
            if (!beat.notes && !beat.rest) {
                return beat;
            }

            this._beatDuration(beat);

            // pre 1.7 the multiplier was between the duration and effects
            // for backwards compat we still allow it
            this._beatMultiplier(beat);
           

            beat.beatEffects = this._properties(property =>
                this._metaDataReader.readBeatPropertyValues(this, property)
            );

            if(beat.beatMultiplierValue !== undefined && beat.beatEffects?.openBrace) {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT304,
                    message: 'The beat multiplier should be specified after the beat effects.',
                    severity: AlphaTexDiagnosticsSeverity.Warning,
                    start: beat.beatMultiplier!.start,
                    end: beat.beatMultiplierValue.end
                });
            }

            this._beatMultiplier(beat);

        } finally {
            beat.end = this.lexer.currentTokenLocation();
        }

        return beat;
    }

    private _beatDuration(beat: AlphaTexBeatNode) {
        const dot = this.lexer.peekToken();
        if (dot?.nodeType !== AlphaTexNodeType.Dot) {
            return;
        }

        beat.durationDot = dot as AlphaTexDotTokenNode;
        this.lexer.advance();

        const durationValue = this.lexer.peekToken();
        if (durationValue?.nodeType === AlphaTexNodeType.Number) {
            beat.durationValue = durationValue as AlphaTexNumberLiteral;
            this.lexer.advance();
            return;
        } else if (durationValue?.nodeType === AlphaTexNodeType.Tag) {
            // backwards compatibility with older alphaTex: there was a dot separator
            // between the song content and sync points at the end

            // handle switch to sync points like: 3.3 . \sync 1 1 1
            // (we can drop the separation dot as it is not part of the AST)
            beat.durationDot = undefined;
            return;
        } else if (!durationValue) {
            // handle switch to sync points like: 3.3 .
            // (no sync points yet)
            return;
        } else {
            this.unexpectedToken(durationValue, [AlphaTexNodeType.Number], true);
        }
    }

    private _beatDurationChange(): AlphaTexBeatDurationChangeNode | undefined {
        const colon = this.lexer.peekToken();
        if (colon?.nodeType !== AlphaTexNodeType.Colon) {
            return undefined;
        }
        this.lexer.advance();

        const durationChange: AlphaTexBeatDurationChangeNode = {
            nodeType: AlphaTexNodeType.Duration,
            colon: colon as AlphaTexColonTokenNode,
            value: undefined,
            properties: undefined,
            start: colon.start
        };
        try {
            const durationValue = this.lexer.peekToken();
            if (!durationValue || durationValue.nodeType !== AlphaTexNodeType.Number) {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT201,
                    message: "Missing duration value after ':'.",
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: colon!.start,
                    end: colon!.end
                });
                return undefined;
            }
            this.lexer.advance();
            durationChange.value = durationValue as AlphaTexNumberLiteral;

            durationChange.properties = this._properties(property =>
                this._metaDataReader.readDurationChangePropertyValues(this, property)
            );
        } finally {
            durationChange.end = this.lexer.currentTokenLocation();
        }

        return durationChange;
    }

    private _beatContent(beat: AlphaTexBeatNode) {
        const notes = this.lexer.peekToken();
        if (!notes) {
            return;
        }
        if (notes.nodeType === AlphaTexNodeType.Ident && (notes as AlphaTexIdentifier).text === 'r') {
            beat.rest = notes as AlphaTexIdentifier;
            this.lexer.advance();
        } else if (notes.nodeType === AlphaTexNodeType.LParen) {
            beat.notes = this._noteList(notes as AlphaTexParenthesisOpenTokenNode);
        } else {
            const note = this._note(notes);
            if (note) {
                beat.notes = {
                    nodeType: AlphaTexNodeType.NoteList,
                    openParenthesis: undefined,
                    notes: [note],
                    closeParenthesis: undefined,
                    start: note.start,
                    end: note.end
                } as AlphaTexNoteListNode;
            }
        }
    }

    private _beatMultiplier(beat: AlphaTexBeatNode) {
        const multiplier = this.lexer.peekToken();
        if (!multiplier || multiplier.nodeType !== AlphaTexNodeType.Asterisk) {
            return;
        }
        this.lexer.advance();
        beat.beatMultiplier = multiplier as AlphaTexAsteriskTokenNode;

        const multiplierValue = this.lexer.peekToken();
        if (!multiplierValue || multiplierValue.nodeType !== AlphaTexNodeType.Number) {
            this.addParserDiagnostic({
                code: AlphaTexDiagnosticCode.AT200,
                message: "Missing beat multiplier value after '*'.",
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: beat.beatMultiplier!.start,
                end: beat.beatMultiplier!.end
            });
            return;
        }

        beat.beatMultiplierValue = multiplierValue as AlphaTexNumberLiteral;
        this.lexer.advance();
    }

    private _noteList(openParenthesis: AlphaTexParenthesisOpenTokenNode): AlphaTexNoteListNode {
        const noteList: AlphaTexNoteListNode = {
            nodeType: AlphaTexNodeType.NoteList,
            openParenthesis: undefined,
            notes: [],
            closeParenthesis: undefined,
            start: this.lexer.currentTokenLocation()
        };
        try {
            noteList.openParenthesis = openParenthesis as AlphaTexParenthesisOpenTokenNode;
            this.lexer.advance();

            let token = this.lexer.peekToken();
            while (token && token.nodeType !== AlphaTexNodeType.RParen) {
                const note = this._note(token);
                if (note) {
                    noteList.notes.push(note);
                } else {
                    break;
                }
                token = this.lexer.peekToken();
            }

            const closeParenthesis = this.lexer.peekToken();
            if (closeParenthesis?.nodeType === AlphaTexNodeType.RParen) {
                noteList.closeParenthesis = closeParenthesis as AlphaTexParenthesisCloseTokenNode;
                this.lexer.advance();
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT206,
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

    private _note(noteValue: AlphaTexAstNode): AlphaTexNoteNode | undefined {
        const note: AlphaTexNoteNode = {
            nodeType: AlphaTexNodeType.Note,
            noteValue: {
                // placeholder value
                nodeType: AlphaTexNodeType.Ident,
                text: ''
            } as AlphaTexIdentifier,
            start: noteValue.start
        };
        try {
            let canHaveString = false;
            switch (noteValue.nodeType) {
                case AlphaTexNodeType.Number:
                    note.noteValue = noteValue as AlphaTexNumberLiteral;
                    this.lexer.advance();

                    canHaveString = true;

                    break;
                case AlphaTexNodeType.String:
                    note.noteValue = noteValue as AlphaTexStringLiteral;
                    this.lexer.advance();
                    switch ((note.noteValue as AlphaTexStringLiteral).text) {
                        case 'x':
                        case '-':
                            canHaveString = true;
                            break;
                    }
                    break;
                case AlphaTexNodeType.Ident:
                    note.noteValue = noteValue as AlphaTexIdentifier;
                    this.lexer.advance();
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
                        [AlphaTexNodeType.Number, AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                        true
                    );
                    return undefined;
            }

            if (canHaveString) {
                const dot = this.lexer.peekToken();
                if (dot?.nodeType === AlphaTexNodeType.Dot) {
                    const noteStringDot = dot as AlphaTexDotTokenNode;
                    this.lexer.advance();

                    const noteString = this.lexer.peekToken();
                    if (!noteString) {
                        this.unexpectedToken(noteString, [AlphaTexNodeType.Number], true);
                        return undefined;
                    }

                    if (noteString.nodeType === AlphaTexNodeType.Tag) {
                        // backwards compatibility with older alphaTex: there was a dot separator
                        // between the song content and sync points at the end

                        // handle switch to sync points like: 3 4 5 . \sync 1 1 1
                        // in this example the numbers are percussion articulations

                        // (we can drop the separation dot as it is not part of the AST)
                        return note;
                    } else if (noteString.nodeType === AlphaTexNodeType.Number) {
                        note.noteStringDot = noteStringDot;
                        note.noteString = noteString as AlphaTexNumberLiteral;
                        this.lexer.advance();
                    } else {
                        this.unexpectedToken(noteString, [AlphaTexNodeType.Number], true);
                        return undefined;
                    }
                }
            }

            note.noteEffects = this._properties(property =>
                this._metaDataReader.readNotePropertyValues(this, property)
            );
        } finally {
            note.end = this.lexer.currentTokenLocation();
        }

        return note;
    }

    private _metaData(): AlphaTexMetaDataNode | undefined {
        const tag = this.lexer.peekToken();
        if (!tag || tag.nodeType !== AlphaTexNodeType.Tag) {
            return undefined;
        }

        const metaData: AlphaTexMetaDataNode = {
            nodeType: AlphaTexNodeType.Meta,
            tag: tag as AlphaTexMetaDataTagNode,
            start: tag.start,
            properties: undefined,
            propertiesBeforeValues: false
        };
        this.lexer.advance();

        try {
            // properties can be before or after the values, this is a again a historical
            // inconsistency on chords
            const braceCandidate = this.lexer.peekToken();
            if (braceCandidate?.nodeType === AlphaTexNodeType.LBrace) {
                metaData.propertiesBeforeValues = true;
                metaData.properties = this._properties(property =>
                    this._metaDataReader.readMetaDataPropertyValues(this, metaData.tag, property)
                );
                metaData.values = this.valueList();
                if (!metaData.values) {
                    metaData.values = this._metaDataReader.readMetaDataValues(this, metaData.tag);
                    if (metaData.values && metaData.values.values.length > 1) {
                        this.addParserDiagnostic({
                            code: AlphaTexDiagnosticCode.AT301,
                            message: `Metadata values should be wrapped into parenthesis.`,
                            severity: AlphaTexDiagnosticsSeverity.Warning,
                            start: metaData.values?.start ?? metaData.start,
                            end: metaData.values?.end ?? metaData.end
                        });

                        this.addParserDiagnostic({
                            code: AlphaTexDiagnosticCode.AT302,
                            message: `Metadata values should be placed before metadata properties.`,
                            severity: AlphaTexDiagnosticsSeverity.Warning,
                            start: metaData.values?.start ?? metaData.start,
                            end: metaData.values?.end ?? metaData.end
                        });
                    }
                }
            } else {
                metaData.values = this.valueList();
                if (!metaData.values) {
                    metaData.values = this._metaDataReader.readMetaDataValues(this, metaData.tag);
                    if (metaData.values && metaData.values.values.length > 1) {
                        this.addParserDiagnostic({
                            code: AlphaTexDiagnosticCode.AT301,
                            message: `Metadata values should be wrapped into parenthesis.`,
                            severity: AlphaTexDiagnosticsSeverity.Warning,
                            start: metaData.values?.start ?? metaData.start,
                            end: metaData.values?.end ?? metaData.end
                        });
                    }
                }

                metaData.properties = this._properties(property =>
                    this._metaDataReader.readMetaDataPropertyValues(this, metaData.tag, property)
                );
            }
        } finally {
            metaData.end = this.lexer.currentTokenLocation();
        }
        return metaData;
    }

    private _properties(
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertiesNode | undefined {
        const braceOpen = this.lexer.peekToken();
        if (!braceOpen || braceOpen.nodeType !== AlphaTexNodeType.LBrace) {
            return undefined;
        }

        const properties: AlphaTexPropertiesNode = {
            nodeType: AlphaTexNodeType.Props,
            openBrace: braceOpen as AlphaTexBraceOpenTokenNode,
            properties: [],
            closeBrace: undefined,
            start: braceOpen.start
        };
        this.lexer.advance();

        try {
            let token = this.lexer.peekToken();
            while (token?.nodeType === AlphaTexNodeType.Ident) {
                properties.properties.push(this._property(token as AlphaTexIdentifier, readPropertyValues));
                token = this.lexer.peekToken();
            }

            const braceClose = this.lexer.peekToken();
            if (braceClose?.nodeType === AlphaTexNodeType.RBrace) {
                properties.closeBrace = braceClose as AlphaTexBraceCloseTokenNode;
                this.lexer.advance();
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT206,
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

    private _property(
        identifier: AlphaTexIdentifier,
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertyNode {
        const property: AlphaTexPropertyNode = {
            nodeType: AlphaTexNodeType.Prop,
            property: identifier as AlphaTexIdentifier,
            values: undefined
        };
        this.lexer.advance();

        property.start = property.property.start;
        try {
            property.values = this.valueList();
            if (!property.values) {
                property.values = readPropertyValues(property);
                if (property.values && property.values.values.length > 1) {
                    this.addParserDiagnostic({
                        code: AlphaTexDiagnosticCode.AT303,
                        message: 'Property values should be wrapped into parenthesis.',
                        severity: AlphaTexDiagnosticsSeverity.Warning,
                        start: property.values.start,
                        end: property.values.end
                    });
                }
            }
        } finally {
            property.end = this.lexer.currentTokenLocation();
        }

        return property;
    }

    public valueList(): AlphaTexValueList | undefined {
        const openParenthesis = this.lexer.peekToken();
        if (openParenthesis?.nodeType !== AlphaTexNodeType.LParen) {
            return undefined;
        }

        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.Values,
            openParenthesis: openParenthesis as AlphaTexParenthesisOpenTokenNode,
            values: [],
            closeParenthesis: undefined,
            start: openParenthesis.start
        };
        this.lexer.advance();

        try {
            let token = this.lexer.peekToken();
            while (token && token?.nodeType !== AlphaTexNodeType.RParen) {
                switch (token.nodeType) {
                    case AlphaTexNodeType.Ident:
                        valueList.values.push(token as AlphaTexIdentifier);
                        this.lexer.advance();
                        break;
                    case AlphaTexNodeType.String:
                        valueList.values.push(token as AlphaTexStringLiteral);
                        this.lexer.advance();
                        break;
                    case AlphaTexNodeType.Number:
                        // in value lists we can always assume floats
                        // (within parenthesis we have no risk of syntax overlaps)
                        valueList.values.push(this.lexer.extendToFloat(token as AlphaTexNumberLiteral));
                        this.lexer.advance();
                        break;
                    default:
                        this.unexpectedToken(
                            token,
                            [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                            false
                        );
                        // try to skip and continue parsing
                        this.lexer.advance();
                        break;
                }

                token = this.lexer.peekToken();
            }

            const closeParenthesis = this.lexer.peekToken();
            if (closeParenthesis?.nodeType === AlphaTexNodeType.RParen) {
                valueList.closeParenthesis = closeParenthesis as AlphaTexParenthesisCloseTokenNode;
                this.lexer.advance();
            } else {
                this.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT206,
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
