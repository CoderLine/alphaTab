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

type LanguageDefinitionsVisitorContext = {
    foundDefinitions?: true;
    foundScoreMetaDataSignatures?: true;
    foundStaffMetaDataSignatures?: true;
    foundStructuralMetaDataSignatures?: true;
    foundBarMetaDataSignatures?: true;
    foundMetaDataProperties?: true;
};

function createAlphaTexParameterDefinition(e: ParameterDefinition) {
    const typeArray = Array.isArray(e.type) ? e.type : [e.type];

    return ts.factory.createArrayLiteralExpression([
        ts.factory.createArrayLiteralExpression(typeArray.map(t => ts.factory.createNumericLiteral(t))),
        ts.factory.createNumericLiteral(e.parseMode),
        ts.factory.createArrayLiteralExpression(
            e.values && !e.valuesOnlyForCompletion
                ? e.values.map(v => ts.factory.createStringLiteral(v.name.toLowerCase()))
                : undefined
        )
    ]);
}

function createAlphaTexSignatureDefinition(e: SignatureDefinition) {
    return ts.factory.createArrayLiteralExpression(e.parameters.map(createAlphaTexParameterDefinition));
}

function updateMetaDataSignatures(element: ts.PropertyDeclaration, definitions: MetadataTagDefinition[]) {
    console.log(`Start update of ${element.name.getText()}`);

    const sigs = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('AlphaTex1LanguageDefinitions'),
            '_signatures'
        ),
        undefined,
        [
            ts.factory.createArrayLiteralExpression(
                definitions.map(d =>
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

function updateMetaDataProperties(element: ts.PropertyDeclaration, tags: MetadataTagDefinition[]) {
    console.log(`Start update of ${element.name.getText()}`);

    const props = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('AlphaTex1LanguageDefinitions'),
            '_metaProps'
        ),
        undefined,
        [
            ts.factory.createArrayLiteralExpression(
                tags.map(d =>
                    ts.factory.createArrayLiteralExpression([
                        ts.factory.createStringLiteral(d.tag.substring(1).toLowerCase()),
                        d.properties === undefined
                            ? ts.factory.createNull()
                            : ts.factory.createArrayLiteralExpression(
                                  d.properties.map(createAlphaTexPropertyDefinition)
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
                return updateMetaDataProperties(
                    node,
                    [
                        definitions.scoreMetaData,
                        definitions.structuralMetaData,
                        definitions.staffMetaData,
                        definitions.barMetaData
                    ].flat()
                ) as unknown as TNode;
        }
    }
    return node;
}

export async function generateParser() {
    const languageDefinitionsFile = path.resolve(
        import.meta.dirname,
        '../../alphatab/src/importer/alphaTex/AlphaTex1LanguageDefinitions.ts'
    );
    let source = ts.createSourceFile(
        'AlphaTex1LanguageDefinitions.ts',
        await fs.promises.readFile(languageDefinitionsFile, 'utf-8'),
        {
            languageVersion: ts.ScriptTarget.ES2022,
            jsDocParsingMode: ts.JSDocParsingMode.ParseAll
        },
        true,
        ts.ScriptKind.TS
    );

    const ctx: LanguageDefinitionsVisitorContext = {};
    const visitor = (node: ts.Node) => languageDefinitionsVisitor(node, ctx, visitor);

    source = ts.visitEachChild(source, visitor, undefined);

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        noEmitHelpers: true,
        omitTrailingSemicolon: true,
        removeComments: false
    });

    await fs.promises.writeFile(languageDefinitionsFile, printer.printFile(source));

    child_process.execSync(`npx @biomejs/biome format --write "${languageDefinitionsFile}"`);
}
