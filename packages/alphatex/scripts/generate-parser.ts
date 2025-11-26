import * as definitions from '@coderline/alphatab-alphatex/definitions';

import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

type LanguageDefinitionsVisitorContext = {
    foundDefinitions?: true;
    foundScoreMetaDataSignatures?: true;
    foundStaffMetaDataSignatures?: true;
    foundStructuralMetaDataSignatures?: true;
    foundBarMetaDataSignatures?: true;
};

function updateMetaDataSignatures(element: ts.PropertyDeclaration, definitions: MetadataTagDefinition[]) {
    console.log(`Start update of ${element.name.getText()}`);

    const newMap = ts.factory.createNewExpression(ts.factory.createIdentifier('Map'), [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode('AlphaTexSignatureDefinition')),
    ], [

    ]);

    return ts.factory.updatePropertyDeclaration(
        element,
        element.modifiers,
        element.name,
        element.questionToken,
        element.type,
        newMap
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
}
