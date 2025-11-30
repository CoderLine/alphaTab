import {
    AlphaTex1LanguageDefinitions,
    type AlphaTexParameterDefinition,
    type AlphaTexSignatureDefinition
} from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import {
    type AlphaTexArgumentList,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertyNode,
    type AlphaTexTextNode,
    type IAlphaTexArgumentValue,
    type IAlphaTexAstNode
} from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type {AlphaTexParser} from '@coderline/alphatab/importer/alphaTex/AlphaTexParser';
import {
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    ArgumentListParseTypesMode
} from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import {Atnf} from '@coderline/alphatab/importer/alphaTex/ATNF';
import type {
    IAlphaTexMetaDataReader
} from '@coderline/alphatab/importer/alphaTex/IAlphaTexMetaDataReader';

/**
 * @internal
 * @record
 */
export interface SignatureResolutionInfo {
    signature: AlphaTexSignatureDefinition;
    parameterIndex: number;
    parameterHasValues: boolean;
}

/**
 * @internal
 */
export class AlphaTex1MetaDataReader implements IAlphaTexMetaDataReader {
    public static readonly instance = new AlphaTex1MetaDataReader();

    public readMetaDataArguments(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode
    ): AlphaTexArgumentList | undefined {
        const tag = metaData.tag.text.toLowerCase();
        for (const lookup of AlphaTex1LanguageDefinitions.metaDataSignatures) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this._readArguments(parser, types);
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
        parser.lexer.fatalError = true;
        return undefined;
    }

    public readMetaDataPropertyArguments(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined {
        const tag = metaData.tag.text.toLowerCase();
        if (!AlphaTex1LanguageDefinitions.metaDataProperties.has(tag)) {
            return undefined;
        }
        const props = AlphaTex1LanguageDefinitions.metaDataProperties.get(tag)!;
        return this._readPropertyArguments(parser, [props], property);
    }

    public readBeatPropertyArguments(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined {
        return this._readPropertyArguments(parser, [AlphaTex1LanguageDefinitions.beatProperties], property);
    }

    public readDurationChangePropertyArguments(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined {
        return this._readPropertyArguments(parser, [AlphaTex1LanguageDefinitions.durationChangeProperties], property);
    }

    public readNotePropertyArguments(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined {
        return this._readPropertyArguments(
            parser,
            [AlphaTex1LanguageDefinitions.noteProperties, AlphaTex1LanguageDefinitions.beatProperties],
            property
        );
    }

    private _readPropertyArguments(
        parser: AlphaTexParser,
        lookups: Map<string, AlphaTexSignatureDefinition[] | null>[],
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined {
        const tag = property.property.text.toLowerCase();
        const endOfProperty = new Set<AlphaTexNodeType>([AlphaTexNodeType.Ident, AlphaTexNodeType.RBrace]);
        for (const lookup of lookups) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this._readArguments(parser, types, endOfProperty);
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
        parser.lexer.fatalError = true;
        return undefined;
    }

    private _readArguments(
        parser: AlphaTexParser,
        signatures: AlphaTexSignatureDefinition[],
        endOfListTypes?: Set<AlphaTexNodeType>
    ): AlphaTexArgumentList | undefined {
        if (signatures.length === 1 && signatures[0].parameters.length === 0) {
            return undefined;
        }

        const argValues: IAlphaTexArgumentValue[] = [];
        const valueListStart = parser.lexer.peekToken()?.start;
        const parseRemaining = endOfListTypes !== undefined;

        let error = false;

        const candidates = new Map<number, SignatureResolutionInfo>(
            signatures.map((v, i) => [
                i,
                {
                    signature: v,
                    parameterIndex: 0,
                    parameterHasValues: false
                } as SignatureResolutionInfo
            ])
        );

        const trackValue = (value: IAlphaTexAstNode, overloadIndex: number) => {
            const candidate = candidates.get(overloadIndex)!;
            if (value.nodeType === AlphaTexNodeType.LParen) {
                const args = parser.argumentList();
                if (args) {
                    for (const v of args.arguments) {
                        if (!v.parameterIndices) {
                            v.parameterIndices = new Map<number, number>();
                        }
                        v.parameterIndices.set(overloadIndex, candidate.parameterIndex);
                        argValues.push(v);
                    }
                }
            } else {
                const valueNode = value as IAlphaTexArgumentValue;
                if (!valueNode.parameterIndices) {
                    valueNode.parameterIndices = new Map<number, number>();
                }
                valueNode.parameterIndices.set(overloadIndex, candidate.parameterIndex);
                if (argValues.length === 0 || argValues[argValues.length - 1] !== valueNode) {
                    argValues.push(valueNode);
                    parser.lexer.advance();
                }
            }
        };

        const extendToFloat = (value: AlphaTexNumberLiteral) => {
            parser.lexer.extendToFloat(value);
        };

        while (candidates.size > 1 || (candidates.size > 0 && !AlphaTex1MetaDataReader._hasExactMatch(candidates))) {
            const value = parser.lexer.peekToken();
            if (!value) {
                break;
            }

            if (value.nodeType === AlphaTexNodeType.Tag) {
                break;
            }

            if (!AlphaTex1MetaDataReader.filterSignatureCandidates(candidates, value,
                endOfListTypes !== undefined && endOfListTypes.has(value.nodeType),
                trackValue, extendToFloat)) {
                break;
            }
        }

        AlphaTex1MetaDataReader.filterIncompleteCandidates(candidates);

        if (!error) {
            const lastToken = parser.lexer.peekToken();
            if (candidates.size !== 1 && lastToken === undefined) {
                parser.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT203,
                    start: parser.lexer.currentTokenLocation(),
                    end: parser.lexer.currentTokenLocation(),
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    message: 'Unexpected end of file.'
                });
                error = true;
            } else if (candidates.size === 0) {
                if (lastToken !== undefined && argValues.length === 0) {
                    switch (lastToken.nodeType) {
                        case AlphaTexNodeType.String:
                        case AlphaTexNodeType.Number:
                        case AlphaTexNodeType.Ident:
                            argValues.push(parser.lexer.peekToken() as IAlphaTexArgumentValue);
                            break;
                    }
                }
                parser.addParserDiagnostic({
                    code: AlphaTexDiagnosticCode.AT219,
                    message: `Error parsing arguments: no overload matched arguments ${AlphaTex1MetaDataReader.generateSignaturesFromArguments(argValues)}. Signatures:\n${AlphaTex1MetaDataReader.generateSignatures(signatures)}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: valueListStart,
                    end: parser.lexer.previousTokenEndLocation()
                });
                error = true;
            }
        }

        // read remaining args user might have supplied
        if (parseRemaining) {
            let remaining = parser.lexer.peekToken();
            while (remaining && !endOfListTypes!.has(remaining.nodeType)) {
                if (AlphaTex1MetaDataReader._handleTypeValueListItem(remaining, undefined, extendToFloat)) {
                    parser.lexer.advance();
                    remaining = parser.lexer.peekToken();
                } else {
                    remaining = undefined;
                }
            }
        }

        if (argValues.length === 0) {
            return undefined;
        }

        const valueList = Atnf.args(argValues, false)!;
        valueList.start = valueListStart;
        valueList.end = parser.lexer.previousTokenEndLocation();
        valueList.validated = !error;
        if (candidates.size > 0) {
            valueList.signatureCandidateIndices = Array.from(candidates.keys());
        }

        return valueList;
    }

    private static _hasExactMatch(candidates: Map<number, SignatureResolutionInfo>) {
        for (const v of candidates.values()) {
            if (v.parameterIndex === v.signature.parameters.length) {
                return true;
            }
        }
        return false;
    }

    public static filterIncompleteCandidates(candidates: Map<number, SignatureResolutionInfo>) {
        const toRemove = new Set<number>();
        for (const [k, v] of candidates) {
            for (let i = v.parameterIndex; i < v.signature.parameters.length; i++) {
                const remaining = v.signature.parameters[i];
                switch (remaining.parseMode) {
                    case ArgumentListParseTypesMode.Required:
                    case ArgumentListParseTypesMode.RequiredAsFloat:
                        toRemove.add(k);
                        break;
                }
            }
        }

        for (const v of toRemove) {
            candidates.delete(v);
        }
    }

    public static generateSignaturesFromArguments(args: IAlphaTexArgumentValue[] | undefined) {
        if (!args) {
            return '()';
        }
        return `(${args.map(v => AlphaTexNodeType[v.nodeType]).join(', ')})`;
    }

    public static generateSignatures(signatures: AlphaTexSignatureDefinition[], ambiguousOverloads?: Set<number>) {
        return signatures
            .map((v, i) =>
                AlphaTex1MetaDataReader._generateSignature(
                    v,
                    ambiguousOverloads !== undefined && ambiguousOverloads.size > 1 && ambiguousOverloads.has(i)
                )
            )
            .join('\n');
    }

    private static _generateSignature(signature: AlphaTexSignatureDefinition, isAmbiguous: boolean) {
        const suffix = isAmbiguous ? ' ~' : '';
        return `(${signature.parameters.map(AlphaTex1MetaDataReader._generateSignatureParameter).join(', ')})${suffix}`;
    }

    private static _generateSignatureParameter(parameter: AlphaTexParameterDefinition, index: number) {
        const typeArray = Array.from(parameter.expectedTypes);
        let p: string = `v${index}`;
        switch (parameter.parseMode) {
            case ArgumentListParseTypesMode.Optional:
            case ArgumentListParseTypesMode.OptionalAsFloat:
                p += '?';
                break;
        }

        if (parameter.allowedValues) {
            const valueArray = Array.from(parameter.allowedValues);
            switch (typeArray[0]) {
                case AlphaTexNodeType.String:
                    p = valueArray.map(v => `"${v}"`).join('|');
                    break;
                default:
                    p = valueArray.join('|');
                    break;
            }
        } else {
            p = Array.from(parameter.expectedTypes)
                .map(t => AlphaTexNodeType[t])
                .join('|');
        }

        switch (parameter.parseMode) {
            case ArgumentListParseTypesMode.RequiredAsValueList:
            case ArgumentListParseTypesMode.ValueListWithoutParenthesis:
                p += '[]';
                break;
        }

        return p;
    }

    public static filterSignatureCandidates(
        candidates: Map<number, SignatureResolutionInfo>,
        value: IAlphaTexAstNode,
        valueCanBeEndOfList: boolean,
        trackValue?: (value: IAlphaTexAstNode, signature: number) => void,
        extendToFloat?: (value: AlphaTexNumberLiteral) => void,
    ) {
        const toRemove = new Set<number>();
        let foundMatchingOverload = false;
        for (const [overloadIndex, overload] of candidates) {
            let handled = false;
            while (!handled) {
                const expected =
                    overload.parameterIndex < overload.signature.parameters.length
                        ? overload.signature.parameters[overload.parameterIndex]
                        : undefined;

                if (!expected) {
                    if (!valueCanBeEndOfList) {
                        toRemove.add(overloadIndex);
                    }
                    handled = true;
                } else if (overload.signature.isStrict && overload.parameterIndex > 0) {
                    toRemove.add(overloadIndex);
                    handled = true;
                } else if (
                    (expected.expectedTypes.has(value.nodeType) ||
                        // value lists start with a parenthesis open token
                        AlphaTex1MetaDataReader._isValueListMatch(value, expected)) &&
                    AlphaTex1MetaDataReader._handleTypeValueListItem(value, expected, extendToFloat)
                ) {
                    handled = true;

                    foundMatchingOverload = true;
                    trackValue?.(value, overloadIndex);

                    switch (expected.parseMode) {
                        case ArgumentListParseTypesMode.ValueListWithoutParenthesis:
                            // stay on current element
                            overload.parameterHasValues = true;
                            break;
                        case ArgumentListParseTypesMode.RequiredAsValueList:
                            // if we had a list with parenthesis -> we consider the parameter complete
                            if (value.nodeType === AlphaTexNodeType.LParen) {
                                overload.parameterIndex++;
                                overload.parameterHasValues = false;
                            } else {
                                // otherwise stay on current element like ValueListWithoutParenthesis
                                overload.parameterHasValues = true;
                            }
                            break;
                        default:
                            // advance to next item
                            overload.parameterIndex++;
                            overload.parameterHasValues = false;
                            break;
                    }
                } else {
                    switch (expected.parseMode) {
                        case ArgumentListParseTypesMode.ValueListWithoutParenthesis:
                            // end of value list -> try next
                            overload.parameterIndex++;
                            overload.parameterHasValues = false;
                            break;
                        case ArgumentListParseTypesMode.Required:
                        case ArgumentListParseTypesMode.RequiredAsFloat:
                            toRemove.add(overloadIndex);
                            handled = true;
                            break;

                        case ArgumentListParseTypesMode.Optional:
                        case ArgumentListParseTypesMode.OptionalAsFloat:
                            // optional not matched -> try next
                            overload.parameterIndex++;
                            overload.parameterHasValues = false;
                            break;

                        case ArgumentListParseTypesMode.RequiredAsValueList:
                            //  not matched, value listed ended, check next
                            overload.parameterIndex++;
                            overload.parameterHasValues = false;
                            break;
                    }
                }
            }
        }

        if (foundMatchingOverload) {
            for (const v of toRemove) {
                candidates.delete(v);
            }
        }

        return foundMatchingOverload;
    }

    private static _handleTypeValueListItem(
        value: IAlphaTexAstNode,
        expected: AlphaTexParameterDefinition | undefined,
        extendToFloat?: (value: AlphaTexNumberLiteral) => void
    ): boolean {
        switch (value.nodeType) {
            case AlphaTexNodeType.Ident:
                const ident = value as AlphaTexTextNode;
                if (expected?.allowedValues) {
                    return expected.allowedValues.has(ident.text.toLowerCase());
                } else if (expected?.reservedIdentifiers) {
                    return !expected.reservedIdentifiers.has(ident.text.toLowerCase());
                }
                return true;
            case AlphaTexNodeType.String:
                const str = value as AlphaTexTextNode;
                if (expected?.allowedValues) {
                    if (expected.allowedValues.has(str.text.toLowerCase())) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            case AlphaTexNodeType.Number:
                const parseMode = expected?.parseMode ?? ArgumentListParseTypesMode.Optional;
                switch (parseMode) {
                    case ArgumentListParseTypesMode.RequiredAsFloat:
                    case ArgumentListParseTypesMode.OptionalAsFloat:
                        extendToFloat?.(value as AlphaTexNumberLiteral);
                        return true;
                    default:
                        return true;
                }
            case AlphaTexNodeType.LParen:
                // nested list
                return true;
        }
        return false;
    }

    private static _isValueListMatch(value: IAlphaTexAstNode, expected: AlphaTexParameterDefinition): boolean {
        if (value.nodeType !== AlphaTexNodeType.LParen) {
            return false;
        }

        return (
            expected.expectedTypes.has(AlphaTexNodeType.Arguments) ||
            expected.parseMode === ArgumentListParseTypesMode.ValueListWithoutParenthesis ||
            expected.parseMode === ArgumentListParseTypesMode.RequiredAsValueList
        );
    }
}
