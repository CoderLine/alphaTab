import * as definitions from '@coderline/alphatab-alphatex/definitions';

import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';
import type {
    MetadataTagDefinition,
    ParameterDefinition,
    PropertyDefinition,
    SignatureDefinition
} from '@coderline/alphatab-alphatex/types';
import {
    alphaTexMappedEnumLookup,
    alphaTexMappedEnumMapping,
    type AlphaTexMappedEnumMappingEntry,
    type AlphaTexMappedEnumName
} from '@coderline/alphatab-alphatex/enum';

import * as alphaTab from '@coderline/alphatab'


type LanguageDefinitionsVisitorContext = {
    foundDefinitions: boolean;
    foundScoreMetaDataSignatures: boolean;
    foundStaffMetaDataSignatures: boolean;
    foundStructuralMetaDataSignatures: boolean;
    foundBarMetaDataSignatures: boolean;
    foundMetaDataProperties: boolean;
    foundDurationChangeProperties: boolean;
    foundBeatProperties: boolean;
    foundNoteProperties: boolean;
};

function createAlphaTexParameterDefinition(e: ParameterDefinition) {
    const typeArray = Array.isArray(e.type) ? e.type : [e.type];
    if (e.allowAllStringTypes) {
        switch (typeArray[0]) {
            case alphaTab.importer.alphaTex.AlphaTexNodeType.Ident:
                typeArray.push(alphaTab.importer.alphaTex.AlphaTexNodeType.String);
                break;
            case alphaTab.importer.alphaTex.AlphaTexNodeType.String:
                typeArray.push(alphaTab.importer.alphaTex.AlphaTexNodeType.Ident);
                break;
        }
    }
    if (e.parseMode === alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsValueList) {
        typeArray.push(alphaTab.importer.alphaTex.AlphaTexNodeType.Arguments);
    }

    const args: ts.Expression[] = [
        ts.factory.createArrayLiteralExpression(typeArray.map(t => ts.factory.createNumericLiteral(t))),
        ts.factory.createNumericLiteral(e.parseMode)
    ];

    if (e.values && !e.valuesOnlyForCompletion) {
        args.push(
            ts.factory.createArrayLiteralExpression(
                e.values.map(v => ts.factory.createStringLiteral(v.name.toLowerCase()))
            )
        );
    }

    if (e.reservedIdentifiers) {
        if (args.length === 2) {
            args.push(ts.factory.createNull());
        }
        args.push(
            ts.factory.createArrayLiteralExpression(
                e.reservedIdentifiers.map(v => ts.factory.createStringLiteral(v.toLowerCase()))
            )
        );
    }

    return ts.factory.createArrayLiteralExpression(args);
}

function createAlphaTexSignatureDefinition(e: SignatureDefinition) {
    const params: ts.Expression[] = [...e.parameters.map(createAlphaTexParameterDefinition)];
    if (e.strict) {
        params.unshift(ts.factory.createNull());
    }
    return ts.factory.createArrayLiteralExpression(params);
}

function updateMetaDataSignatures(element: ts.PropertyDeclaration, definitions: Map<string, MetadataTagDefinition>) {
    console.log(`Start update of ${element.name.getText()}`);

    const sigs = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('AlphaTex1LanguageDefinitions'),
            '_signatures'
        ),
        undefined,
        [
            ts.factory.createArrayLiteralExpression(
                Array.from(definitions.values()).map(d =>
                    ts.factory.createArrayLiteralExpression([
                        ts.factory.createStringLiteral(d.tag.substring(1).toLowerCase()),
                        d.signatures.length === 1 && d.signatures[0].parameters.length === 0
                            ? ts.factory.createNull()
                            : ts.factory.createArrayLiteralExpression(
                                  d.signatures.map(createAlphaTexSignatureDefinition)
                              )
                    ])
                ),
                true
            )
        ]
    );

    return ts.factory.updatePropertyDeclaration(
        element,
        element.modifiers,
        element.name,
        element.questionToken,
        element.type,
        sigs
    );
}

function createAlphaTexPropertyDefinition(p: PropertyDefinition) {
    return ts.factory.createArrayLiteralExpression([
        ts.factory.createStringLiteral(p.property.toLowerCase()),
        p.signatures.length === 1 && p.signatures[0].parameters.length === 0
            ? ts.factory.createNull()
            : ts.factory.createArrayLiteralExpression(p.signatures.map(createAlphaTexSignatureDefinition))
    ]);
}

function updateMetaDataProperties(element: ts.PropertyDeclaration, tags: Map<string, MetadataTagDefinition>) {
    console.log(`Start update of ${element.name.getText()}`);

    const props = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('AlphaTex1LanguageDefinitions'),
            '_metaProps'
        ),
        undefined,
        [
            ts.factory.createArrayLiteralExpression(
                Array.from(tags.values()).map(d =>
                    ts.factory.createArrayLiteralExpression([
                        ts.factory.createStringLiteral(d.tag.substring(1).toLowerCase()),
                        d.properties === undefined
                            ? ts.factory.createNull()
                            : ts.factory.createArrayLiteralExpression(
                                  Array.from(d.properties.values()).map(createAlphaTexPropertyDefinition)
                              )
                    ])
                ),
                true
            )
        ]
    );

    return ts.factory.updatePropertyDeclaration(
        element,
        element.modifiers,
        element.name,
        element.questionToken,
        element.type,
        props
    );
}

function updateProperties(element: ts.PropertyDeclaration, props: Map<string, PropertyDefinition>) {
    console.log(`Start update of ${element.name.getText()}`);

    const expr = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('AlphaTex1LanguageDefinitions'),
            '_props'
        ),
        undefined,
        [
            ts.factory.createArrayLiteralExpression(
                Array.from(props.values()).map(d => createAlphaTexPropertyDefinition(d)),
                true
            )
        ]
    );

    return ts.factory.updatePropertyDeclaration(
        element,
        element.modifiers,
        element.name,
        element.questionToken,
        element.type,
        expr
    );
}

function languageDefinitionsVisitor<TNode extends ts.Node>(
    node: TNode,
    context: LanguageDefinitionsVisitorContext,
    visitor: ts.Visitor
): TNode {
    if (ts.isClassDeclaration(node) && node.name?.text === 'AlphaTex1LanguageDefinitions') {
        context.foundDefinitions = true;
        return ts.visitEachChild(node, visitor, undefined);
    }
    if (ts.isPropertyDeclaration(node)) {
        switch (node.name.getText()) {
            case 'scoreMetaDataSignatures':
                context.foundScoreMetaDataSignatures = true;
                return updateMetaDataSignatures(node, definitions.scoreMetaData) as unknown as TNode;
            case 'staffMetaDataSignatures':
                context.foundStaffMetaDataSignatures = true;
                return updateMetaDataSignatures(node, definitions.staffMetaData) as unknown as TNode;
            case 'structuralMetaDataSignatures':
                context.foundStructuralMetaDataSignatures = true;
                return updateMetaDataSignatures(node, definitions.structuralMetaData) as unknown as TNode;
            case 'barMetaDataSignatures':
                context.foundBarMetaDataSignatures = true;
                return updateMetaDataSignatures(node, definitions.barMetaData) as unknown as TNode;
            case 'metaDataProperties':
                context.foundMetaDataProperties = true;
                return updateMetaDataProperties(node, definitions.allMetadata) as unknown as TNode;
            case 'durationChangeProperties':
                context.foundDurationChangeProperties = true;
                return updateProperties(node, definitions.durationChangeProperties) as unknown as TNode;
            case 'beatProperties':
                context.foundBeatProperties = true;
                return updateProperties(node, definitions.beatProperties) as unknown as TNode;
            case 'noteProperties':
                context.foundNoteProperties = true;
                return updateProperties(node, definitions.noteProperties) as unknown as TNode;
        }
    }
    return node;
}

async function generateFile(alphaTabRelativeFile: string, visitor: ts.Visitor) {
    const fullFile = path.resolve(import.meta.dirname, '../../alphatab/src/', alphaTabRelativeFile);
    let source = ts.createSourceFile(
        'file.ts',
        await fs.promises.readFile(fullFile, 'utf-8'),
        {
            languageVersion: ts.ScriptTarget.ES2022,
            jsDocParsingMode: ts.JSDocParsingMode.ParseAll
        },
        true,
        ts.ScriptKind.TS
    );

    source = ts.visitEachChild(source, visitor, undefined);

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        noEmitHelpers: true,
        omitTrailingSemicolon: true,
        removeComments: false
    });

    await fs.promises.writeFile(fullFile, printer.printFile(source));

    child_process.execSync(`npx @biomejs/biome format --write "${fullFile}"`);
}

async function generateLanguageDefinitions() {
    const ctx: LanguageDefinitionsVisitorContext = {
        foundBarMetaDataSignatures: false,
        foundDefinitions: false,
        foundMetaDataProperties: false,
        foundScoreMetaDataSignatures: false,
        foundStaffMetaDataSignatures: false,
        foundStructuralMetaDataSignatures: false,
        foundDurationChangeProperties: false,
        foundBeatProperties: false,
        foundNoteProperties: false
    };
    const visitor = (node: ts.Node) => languageDefinitionsVisitor(node, ctx, visitor);

    await generateFile('importer/alphaTex/AlphaTex1LanguageDefinitions.ts', visitor);
    const error = Object.values(ctx).includes(false);
    if (error) {
        throw new Error(
            `AlphaTex1LanguageDefinitions.ts changed unexpectedly, some props are missing: ${JSON.stringify(ctx)}`
        );
    }
}

type EnumMappingsVisitorContext = {
    foundEnumMappings: boolean;
};

function generateEnumMapping(type: AlphaTexMappedEnumName) {
    return [
        ts.factory.createPropertyDeclaration(
            [
                ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
                ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
                ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
            ],
            type.substring(0, 1).toLowerCase() + type.substring(1),
            undefined,
            undefined,
            ts.factory.createNewExpression(
                ts.factory.createIdentifier('Map'),
                [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createTypeReferenceNode(type)
                ],
                [
                    ts.factory.createArrayLiteralExpression([
                        ...Object.entries(alphaTexMappedEnumMapping[type])
                            .filter(e => e[1] !== null)
                            .map(e =>
                                ts.factory.createArrayLiteralExpression([
                                    ts.factory.createStringLiteral(e[1]!.snippet.toLowerCase()),
                                    createNumericLiteral((alphaTexMappedEnumLookup[type] as any)[e[0]])
                                ])
                            ),
                        ...Object.entries(alphaTexMappedEnumMapping[type])
                            .filter(e => e[1]?.aliases)
                            .flatMap(e =>
                                e[1]!.aliases!.map(a =>
                                    ts.factory.createArrayLiteralExpression([
                                        ts.factory.createStringLiteral(a.toLowerCase()),
                                        createNumericLiteral((alphaTexMappedEnumLookup[type] as any)[e[0]])
                                    ])
                                )
                            )
                    ])
                ]
            )
        ),
        ts.factory.createPropertyDeclaration(
            [
                ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
                ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
                ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
            ],
            `${type.substring(0, 1).toLowerCase() + type.substring(1)}Reversed`,
            undefined,
            undefined,
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('AlphaTex1EnumMappings'),
                    '_reverse'
                ),
                undefined,
                [
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('AlphaTex1EnumMappings'),
                        `${type.substring(0, 1).toLowerCase() + type.substring(1)}`
                    )
                ]
            )
        )
    ];
}

function generateKeySignaturesReversed(name: string, selectMapping: (entry: AlphaTexMappedEnumMappingEntry) => string) {
    return ts.factory.createPropertyDeclaration(
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
            ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
        ],
        name,
        undefined,
        undefined,
        ts.factory.createNewExpression(
            ts.factory.createIdentifier('Map'),
            [
                ts.factory.createTypeReferenceNode('KeySignature'),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            ],
            [
                ts.factory.createArrayLiteralExpression([
                    ...Object.entries(alphaTexMappedEnumMapping.KeySignature)
                        .filter(e => e[1] !== null)
                        .map(e =>
                            ts.factory.createArrayLiteralExpression([
                                createNumericLiteral((alphaTexMappedEnumLookup.KeySignature as any)[e[0]]),
                                ts.factory.createStringLiteral(selectMapping(e[1]))
                            ])
                        )
                ])
            ]
        )
    );
}

function enumMappingsVisitor<TNode extends ts.Node>(
    node: TNode,
    context: EnumMappingsVisitorContext
): TNode | undefined {
    if (ts.isClassDeclaration(node) && node.name?.text === 'AlphaTex1EnumMappings') {
        context.foundEnumMappings = true;
        const members = node.members.filter(m => m.name?.getText().startsWith('_'));
        members.push(
            ...Object.keys(alphaTexMappedEnumMapping).flatMap(e => generateEnumMapping(e as AlphaTexMappedEnumName))
        );

        members.push(
            generateKeySignaturesReversed('keySignaturesMinorReversed', (entry: AlphaTexMappedEnumMappingEntry) => {
                return entry?.aliases!.find(a => a.endsWith('minor'))!;
            })
        );
        members.push(
            generateKeySignaturesReversed('keySignaturesMajorReversed', (entry: AlphaTexMappedEnumMappingEntry) => {
                return entry!.snippet.toLowerCase();
            })
        );

        return ts.factory.updateClassDeclaration(
            node,
            node.modifiers,
            node.name,
            node.typeParameters,
            node.heritageClauses,
            members
        ) as unknown as TNode;
    }
    return node;
}

async function generateEnumMappings() {
    const ctx: EnumMappingsVisitorContext = {
        foundEnumMappings: false
    };
    const visitor = (node: ts.Node) => enumMappingsVisitor(node, ctx);

    await generateFile('importer/alphaTex/AlphaTex1EnumMappings.ts', visitor);

    const error = Object.values(ctx).includes(false);
    if (error) {
        throw new Error(
            `AlphaTex1EnumMappings.ts changed unexpectedly, some props are missing: ${JSON.stringify(ctx)}`
        );
    }
}

export async function generateParser() {
    await generateLanguageDefinitions();
    await generateEnumMappings();
}
function createNumericLiteral(value: number): ts.Expression {
    if (value < 0) {
        return ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.MinusToken,
            ts.factory.createNumericLiteral(Math.abs(value))
        );
    } else {
        return ts.factory.createNumericLiteral(value);
    }
}
