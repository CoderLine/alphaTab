/**
 * This file contains an emitter which generates classes to clone
 * any data models following certain rules.
 */
import * as path from 'path';
import * as ts from 'typescript';
import createEmitter from './EmitterBase'
import { addNewLines } from '../BuilderHelpers';
import { getTypeWithNullableInfo } from '../BuilderHelpers';
import { unwrapArrayItemType } from '../BuilderHelpers';

function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}

function toImportPath(fileName: string) {
    return "@" + removeExtension(fileName).split('\\').join('/');
}

function isClonable(type: ts.Type): boolean {
    if (!type.symbol) {
        return false;
    }

    const declaration = type.symbol.valueDeclaration;
    if (declaration) {
        return !!ts.getJSDocTags(declaration).find(t => t.tagName.text === 'cloneable');
    }

    return false;
}

function isCloneMember(propertyDeclaration: ts.PropertyDeclaration) {
    if (propertyDeclaration.modifiers) {
        if (propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword || m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
            return false;
        }

        if (!propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.PublicKeyword)) {
            return false;
        }
    }

    if (ts.getJSDocTags(propertyDeclaration).find(t => t.tagName.text === 'clone_ignore')) {
        return false;
    }

    return true;
}

function generateClonePropertyStatements(prop: ts.PropertyDeclaration, typeChecker: ts.TypeChecker,
    importer: (name: string, module: string) => void): ts.Statement[] {
    const propertyType = getTypeWithNullableInfo(typeChecker, prop.type!);

    const statements: ts.Statement[] = [];

    const propertyName = (prop.name as ts.Identifier).text;

    function assign(expr: ts.Expression) {
        return [ts.factory.createExpressionStatement(
            ts.factory.createAssignment(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('clone'),
                    propertyName
                ),
                expr
            )
        )];
    }

    const arrayItemType = unwrapArrayItemType(propertyType.type!, typeChecker);
    if (arrayItemType) {
        if (isClonable(arrayItemType)) {
            const collectionAddMethod = ts.getJSDocTags(prop)
                .filter(t => t.tagName.text === 'clone_add')
                .map(t => t.comment ?? "")[0];

            importer(arrayItemType.symbol!.name + "Cloner", './' + arrayItemType.symbol!.name + "Cloner");
            const loopItems = [
                ...assign(ts.factory.createArrayLiteralExpression(undefined)),

                ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [ts.factory.createVariableDeclaration('i')],
                        ts.NodeFlags.Const
                    ),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('original'),
                        propertyName
                    ),
                    ts.factory.createBlock([
                        ts.factory.createExpressionStatement(
                            collectionAddMethod
                                // clone.addProp(ItemTypeCloner.clone(i))
                                ? ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('clone'),
                                        collectionAddMethod
                                    ),
                                    undefined,
                                    [ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(arrayItemType.symbol!.name + "Cloner"),
                                            'clone'
                                        ),
                                        undefined,
                                        [
                                            ts.factory.createIdentifier('i')
                                        ]
                                    )]
                                )
                                // clone.prop.push(ItemTypeCloner.clone(i))
                                : ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('clone'),
                                            propertyName
                                        ),
                                        'push'
                                    ),
                                    undefined,
                                    [ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(arrayItemType.symbol!.name + "Cloner"),
                                            'clone'
                                        ),
                                        undefined,
                                        [
                                            ts.factory.createIdentifier('i')
                                        ]
                                    )]
                                )
                        )
                    ])
                )];

            if (propertyType.isNullable) {
                // if(original.prop) {
                //   clone.prop = [];
                //   for(const i of original.prop) { clone.addProp(ItemTypeCloner.clone(i)); }
                //   // or 
                //   for(const i of original.prop) { clone.prop.add(ItemTypeCloner.clone(i)); }
                // }
                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('original'),
                            propertyName
                        ),
                        ts.factory.createBlock(
                            loopItems
                        ),
                        undefined
                    )
                )
            } else {
                // clone.prop = [];
                // for(const i of original.prop) { clone.addProp(ItemTypeCloner.clone(i)); }
                // // or 
                // for(const i of original.prop) { clone.prop.add(ItemTypeCloner.clone(i)); }
                statements.push(...loopItems);
            }
        } else {
            const sliceCall =
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('original'),
                            propertyName
                        ),
                        'slice'
                    ),
                    undefined,
                    []
                );

            if (propertyType.isNullable) {
                statements.push(...assign(
                    ts.factory.createConditionalExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('original'),
                            propertyName
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        sliceCall,
                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                        ts.factory.createNull()
                    )
                ));
            } else {
                // clone.prop = original.prop.splice()
                statements.push(...assign(sliceCall));
            }
        }
    } else {
        if (isClonable(propertyType.type!)) {
            importer(propertyType.type.symbol!.name + "Cloner", './' + propertyType.type.symbol!.name + "Cloner");

            // clone.prop = original.prop ? TypeNameCloner.clone(original.prop) : null
            statements.push(...assign(
                ts.factory.createConditionalExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('original'),
                        propertyName
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(propertyType.type.symbol!.name + "Cloner"),
                            'clone'
                        ),
                        undefined,
                        [
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('original'),
                                propertyName
                            )
                        ]
                    ),
                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                    ts.factory.createNull()
                )
            ));
        } else {
            // clone.prop = original.prop
            statements.push(...assign(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('original'),
                    propertyName
                )
            ));
        }
    }

    return statements;
}

function generateCloneBody(program: ts.Program, input: ts.ClassDeclaration, importer: (name: string, module: string) => void): ts.Block {
    const typeChecker = program.getTypeChecker();
    const propertiesToSerialize = input.members.filter(
        m => ts.isPropertyDeclaration(m) && isCloneMember(m)
    ).map(m => m as ts.PropertyDeclaration);

    const bodyStatements = propertiesToSerialize.reduce((stmts, prop) => {
        stmts.push(...generateClonePropertyStatements(prop, typeChecker, importer));
        return stmts;
    }, new Array<ts.Statement>());

    return ts.factory.createBlock(addNewLines([
        // const clone = new Type();
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
                ts.factory.createVariableDeclaration(
                    'clone',
                    undefined,
                    undefined,
                    ts.factory.createNewExpression(
                        ts.factory.createIdentifier(input.name!.text),
                        undefined,
                        []
                    )
                )
            ], ts.NodeFlags.Const)
        ),
        ...bodyStatements,
        // return json;
        ts.factory.createReturnStatement(ts.factory.createIdentifier('clone'))
    ]));
}


function createCloneMethod(program: ts.Program, input: ts.ClassDeclaration, importer: (name: string, module: string) => void) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
        ],
        undefined,
        'clone',
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'original',
                undefined,
                ts.factory.createTypeReferenceNode(
                    input.name!.text,
                    undefined
                ),
                undefined
            )
        ],
        ts.factory.createTypeReferenceNode(
            input.name!.text,
            undefined
        ),
        generateCloneBody(program, input, importer)
    )
}

export default createEmitter('cloneable', (program, input) => {
    console.log(`Writing Cloner for ${input.name!.text}`);
    const sourceFileName = path.relative(
        path.join(path.resolve(program.getCompilerOptions().baseUrl!)),
        path.resolve(input.getSourceFile().fileName)
    );

    const statements: ts.Statement[] = [];

    function importer(name: string, module: string) {
        statements.push(ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamedImports([ts.factory.createImportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(name)
                )])
            ),
            ts.factory.createStringLiteral(module)
        ))
    }

    statements.push(ts.factory.createClassDeclaration(
        [],
        [
            ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
        ],
        input.name!.text + 'Cloner',
        undefined,
        undefined,
        [
            createCloneMethod(program, input, importer)
        ]
    ));

    const sourceFile = ts.factory.createSourceFile([
        ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createImportClause(false,
                undefined,
                ts.factory.createNamedImports([ts.factory.createImportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(input.name!.text)
                )])
            ),
            ts.factory.createStringLiteral(toImportPath(sourceFileName))
        ),
        ...statements
    ], ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), ts.NodeFlags.None);

    return sourceFile;
});