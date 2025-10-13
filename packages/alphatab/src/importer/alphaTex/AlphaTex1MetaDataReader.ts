import {
    AlphaTex1LanguageDefinitions,
    type ValueListParseTypesExtended,
    ValueListParseTypesMode
} from '@src/importer/alphaTex/AlphaTex1LanguageDefinitions';
import {
    type AlphaTexAstNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertyNode,
    type AlphaTexStringLiteral,
    type AlphaTexValueList,
    type IAlphaTexValueListItem
} from '@src/importer/alphaTex/AlphaTexAst';
import type { AlphaTexParser } from '@src/importer/alphaTex/AlphaTexParser';
import {
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    AlphaTexParserAbort
} from '@src/importer/alphaTex/AlphaTexShared';
import { Atnf } from '@src/importer/alphaTex/ATNF';
import type { IAlphaTexMetaDataReader } from '@src/importer/alphaTex/IAlphaTexMetaDataReader';

/**
 * @internal
 */
export class AlphaTex1MetaDataReader implements IAlphaTexMetaDataReader {
    public static readonly instance = new AlphaTex1MetaDataReader();

    public readMetaDataValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode
    ): AlphaTexValueList | undefined {
        const tag = metaData.tag.text.toLowerCase();
        for (const lookup of AlphaTex1LanguageDefinitions.metaDataValueListTypes) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this._readTypedValueList(parser, types);
                } else {
                    return undefined;
                }
            }
        }

        parser.addParserDiagnostic({
            code: AlphaTexDiagnosticCode.AT204,
            message: `Unrecognized metadata '${metaData.tag.text}'.`,
            severity: AlphaTexDiagnosticsSeverity.Error,
            start: metaData.start,
            end: metaData.end
        });
        throw new AlphaTexParserAbort();
    }

    public readMetaDataPropertyValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        switch (metaData.tag.text.toLowerCase()) {
            case 'track':
                return this._readPropertyValues(
                    parser,
                    [AlphaTex1LanguageDefinitions.trackPropertyValueListTypes],
                    property
                );
            case 'chord':
                return this._readPropertyValues(
                    parser,
                    [AlphaTex1LanguageDefinitions.chordPropertyValueListTypes],
                    property
                );
            case 'staff':
                return this._readPropertyValues(
                    parser,
                    [AlphaTex1LanguageDefinitions.staffPropertyValueListTypes],
                    property
                );
            default:
                return undefined;
        }
    }

    public readBeatPropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this._readPropertyValues(parser, [AlphaTex1LanguageDefinitions.beatPropertyValueListTypes], property);
    }

    public readDurationChangePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this._readPropertyValues(
            parser,
            [AlphaTex1LanguageDefinitions.beatDurationPropertyValueListTypes],
            property
        );
    }

    public readNotePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this._readPropertyValues(
            parser,
            [
                AlphaTex1LanguageDefinitions.notePropertyValueListTypes,
                AlphaTex1LanguageDefinitions.beatPropertyValueListTypes
            ],
            property
        );
    }

    private _readPropertyValues(
        parser: AlphaTexParser,
        lookups: Map<string, ValueListParseTypesExtended[] | undefined>[],
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        const tag = property.property.text.toLowerCase();
        const endOfProperty = new Set<AlphaTexNodeType>([
            AlphaTexNodeType.Ident,
            AlphaTexNodeType.RBrace
        ]);
        for (const lookup of lookups) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this._readTypedValueList(parser, types, endOfProperty);
                } else {
                    return undefined;
                }
            }
        }
        parser.addParserDiagnostic({
            code: AlphaTexDiagnosticCode.AT205,
            message: `Unrecognized property '${property.property.text}'.`,
            severity: AlphaTexDiagnosticsSeverity.Error,
            start: property.property.start,
            end: property.property.end
        });
        throw new AlphaTexParserAbort();
    }

    private _readTypedValueList(
        parser: AlphaTexParser,
        expectedValues: ValueListParseTypesExtended[],
        endOfListTypes?: Set<AlphaTexNodeType>
    ): AlphaTexValueList | undefined {
        const values: IAlphaTexValueListItem[] = [];
        const valueListStart = parser.lexer.peekToken()?.start;
        let error = false;
        let parseRemaining = endOfListTypes !== undefined;
        let i = 0;
        while (i < expectedValues.length) {
            const expected = expectedValues[i];

            const value = parser.lexer.peekToken();

            // prevent parsing of special float values which could overlap
            // with stringed notes
            if (expected.parseMode === ValueListParseTypesMode.OptionalAsFloatInValueList) {
                parseRemaining = false;
                break;
            }

            // NOTE: The parser already handles parenthesized value lists, we only need to handle this
            // parse mode in the validation.

            if (
                value &&
                (expected.expectedTypes.has(value.nodeType) ||
                    // value lists start with a parenthesis open token
                    AlphaTex1MetaDataReader._isValueListMatch(value, expected))
            ) {
                this._handleTypeValueListItem(parser, values, value, expected);
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.OptionalAndStop:
                        // stop reading values
                        i = expectedValues.length;
                        break;
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // stay on current element
                        break;
                    default:
                        // advance to next item
                        i++;
                        break;
                }
            } else {
                switch (expected.parseMode) {
                    // end of value list
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        i++;
                        break;
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                        parser.unexpectedToken(value, Array.from(expected.expectedTypes), true);
                        error = true;
                        break;

                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                    case ValueListParseTypesMode.OptionalAndStop:
                        // optional not matched -> try next
                        i++;
                        break;

                    case ValueListParseTypesMode.RequiredAsValueList:
                        // optional -> not matched, value listed ended, check next
                        i++;
                        break;
                }
            }
        }

        if (error) {
            throw new AlphaTexParserAbort();
        }

        // read remaining values user might have supplied
        if (parseRemaining) {
            let remaining = parser.lexer.peekToken();
            while (remaining && !endOfListTypes!.has(remaining.nodeType)) {
                if (this._handleTypeValueListItem(parser, values, remaining, undefined)) {
                    remaining = parser.lexer.peekToken();
                } else {
                    remaining = undefined;
                }
            }
        }

        if (values.length === 0) {
            return undefined;
        }

        const valueList = Atnf.values(values, false)!;
        valueList.start = valueListStart;
        valueList.end = parser.lexer.currentTokenLocation();

        return valueList;
    }

    private _handleTypeValueListItem(
        parser: AlphaTexParser,
        valueList: IAlphaTexValueListItem[],
        value: AlphaTexAstNode,
        expected: ValueListParseTypesExtended | undefined
    ): boolean {
        switch (value.nodeType) {
            case AlphaTexNodeType.Ident:
                if (expected?.allowedValues) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexIdentifier).text;
                    if (expected.allowedValues.has(identifierText.toLowerCase())) {
                        valueList.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                    }
                } else if (expected?.reservedIdentifiers) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexIdentifier).text;
                    if (!expected.reservedIdentifiers.has(identifierText.toLowerCase())) {
                        valueList.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                    }
                } else {
                    valueList.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                }

                return true;
            case AlphaTexNodeType.String:
                if (expected?.allowedValues) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexStringLiteral).text;
                    if (expected.allowedValues.has(identifierText.toLowerCase())) {
                        valueList.push(parser.lexer.nextToken() as AlphaTexStringLiteral);
                    }
                } else {
                    valueList.push(parser.lexer.nextToken() as AlphaTexStringLiteral);
                }
                return true;
            case AlphaTexNodeType.Number:
                const parseMode = expected?.parseMode ?? ValueListParseTypesMode.Optional;
                switch (parseMode) {
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloat:
                        valueList.push(parser.lexer.nextTokenWithFloats() as AlphaTexNumberLiteral);
                        break;
                    default:
                        valueList.push(parser.lexer.nextToken() as AlphaTexNumberLiteral);
                        break;
                }
                return true;
            case AlphaTexNodeType.LParen:
                const nestedList = parser.valueList();
                if (nestedList) {
                    for (const v of nestedList.values) {
                        valueList.push(v);
                    }
                }
                return true;
        }
        return false;
    }

    private static _isValueListMatch(value: AlphaTexAstNode, expected: ValueListParseTypesExtended): boolean {
        if (value.nodeType !== AlphaTexNodeType.LParen) {
            return false;
        }

        return (
            expected.expectedTypes.has(AlphaTexNodeType.Values) ||
            expected.parseMode === ValueListParseTypesMode.ValueListWithoutParenthesis ||
            expected.parseMode === ValueListParseTypesMode.RequiredAsValueList
        );
    }
}
