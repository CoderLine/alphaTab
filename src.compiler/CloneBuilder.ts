import * as ts from 'typescript';
import { getTypeWithNullableInfo } from './BuilderHelpers';
import { isPrimitiveType } from './BuilderHelpers';

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

function unwrapArrayItemType(type: ts.Type, typeChecker: ts.TypeChecker): ts.Type | null {
    if (type.symbol && type.symbol.name === 'Array') {
        return (type as ts.TypeReference).typeArguments![0];
    }

    if (isPrimitiveType(type)) {
        return null;
    }

    if (type.isUnion()) {
        const nonNullable = typeChecker.getNonNullableType(type);
        return unwrapArrayItemType(nonNullable, typeChecker);
    }

    return null;
}

function generateClonePropertyStatements(prop: ts.PropertyDeclaration, typeChecker: ts.TypeChecker, factory: ts.NodeFactory): ts.Statement[] {
    const propertyType = getTypeWithNullableInfo(typeChecker, prop.type);

    const propertyName = (prop.name as ts.Identifier).text;

    function assign(expr: ts.Expression) {
        return [factory.createExpressionStatement(
            factory.createAssignment(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier('clone'),
                    propertyName
                ),
                expr
            )
        )];
    }

    const arrayItemType = unwrapArrayItemType(propertyType.type, typeChecker);
    if (arrayItemType) {
        if (isClonable(arrayItemType)) {
            const collectionAddMethod = ts.getJSDocTags(prop)
                .filter(t => t.tagName.text === 'clone_add')
                .map(t => t.comment ?? "")[0];

            const loopItems = [
                ...assign(factory.createArrayLiteralExpression(undefined)),

                factory.createForOfStatement(
                    undefined,
                    factory.createVariableDeclarationList(
                        [factory.createVariableDeclaration('i')],
                        ts.NodeFlags.Const
                    ),
                    factory.createPropertyAccessExpression(
                        factory.createThis(),
                        propertyName
                    ),
                    factory.createExpressionStatement(
                        collectionAddMethod
                            // clone.addProp(i.clone())
                            ? factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier('clone'),
                                    collectionAddMethod
                                ),
                                undefined,
                                [factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier('i'),
                                        'clone'
                                    ),
                                    undefined,
                                    []
                                ), factory.createIdentifier('i')]
                            )
                            // clone.prop.push(i.clone()
                            : factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier('clone'),
                                        propertyName
                                    ),
                                    'push'
                                ),
                                undefined,
                                [factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier('i'),
                                        'clone'
                                    ),
                                    undefined,
                                    []
                                )]
                            )
                    )
                )];

            if (propertyType.isNullable) {
                // if(this.prop) {
                //   clone.prop = [];
                //   for(const i of this.prop) { clone.addProp(i.clone()); }
                //   // or 
                //   for(const i of this.prop) { clone.prop.add(i.clone()); }
                // }
                return [factory.createIfStatement(
                    factory.createPropertyAccessExpression(
                        factory.createThis(),
                        propertyName
                    ),
                    factory.createBlock(
                        loopItems
                    ),
                    undefined
                )];
            } else {
                // clone.prop = [];
                // for(const i of this.prop) { clone.addProp(i.clone()); }
                // // or 
                // for(const i of this.prop) { clone.prop.add(i.clone()); }
                return loopItems;
            }
        } else {
            const sliceCall =
                factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createPropertyAccessExpression(
                            factory.createThis(),
                            propertyName
                        ),
                        'slice'
                    ),
                    undefined,
                    []
                );

            if (propertyType.isNullable) {
                return assign(
                    factory.createConditionalExpression(
                        factory.createPropertyAccessExpression(
                            factory.createThis(),
                            propertyName
                        ),
                        factory.createToken(ts.SyntaxKind.QuestionToken),
                        sliceCall,
                        factory.createToken(ts.SyntaxKind.ColonToken),
                        factory.createNull()
                    )
                );
            } else {
                // clone.prop = this.prop.splice()
                return assign(sliceCall);
            }
        }
    } else {
        if (isClonable(propertyType.type)) {
            // clone.prop = this.prop ? this.prop.clone() : null
            return assign(
                factory.createConditionalExpression(
                    factory.createPropertyAccessExpression(
                        factory.createThis(),
                        propertyName
                    ),
                    factory.createToken(ts.SyntaxKind.QuestionToken),
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createPropertyAccessExpression(
                                factory.createThis(),
                                propertyName
                            ),
                            'clone'
                        ),
                        undefined,
                        []
                    ),
                    factory.createToken(ts.SyntaxKind.ColonToken),
                    factory.createNull()
                )
            );
        } else {
            // clone.prop = this.prop
            return assign(
                factory.createPropertyAccessExpression(
                    factory.createThis(),
                    propertyName
                )
            );
        }
    }
}

function generateCloneBody(classDeclaration: ts.ClassDeclaration, propertiesToSerialize: ts.PropertyDeclaration[], factory: ts.NodeFactory, typeChecker: ts.TypeChecker): ts.Block {

    const bodyStatements = propertiesToSerialize.reduce((stmts, prop) => {
        stmts.push(...generateClonePropertyStatements(prop, typeChecker, factory));
        return stmts;
    }, new Array<ts.Statement>());

    return factory.createBlock([
        // const clone = new Type();
        factory.createVariableStatement(
            [factory.createModifier(ts.SyntaxKind.ConstKeyword)],
            [
                factory.createVariableDeclaration(
                    'clone',
                    undefined,
                    undefined,
                    factory.createNewExpression(factory.createIdentifier(classDeclaration.name.text), [], [])
                )
            ]
        ),
        ...bodyStatements,
        // return json;
        factory.createReturnStatement(factory.createIdentifier('clone'))
    ]);
}

function isCloneMember(propertyDeclaration: ts.PropertyDeclaration) {
    if (propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword || m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
        return false;
    }

    if (!propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.PublicKeyword)) {
        return false;
    }

    if (ts.getJSDocTags(propertyDeclaration).find(t => t.tagName.text === 'computed')) {
        return false;
    }

    return true;
}

function rewriteClassForCloneable(
    classDeclaration: ts.ClassDeclaration,
    factory: ts.NodeFactory,
    typeChecker: ts.TypeChecker
): ts.ClassDeclaration {
    console.debug(`Rewriting ${classDeclaration.name.escapedText} for cloning`);
    let cloneMethod: ts.MethodDeclaration = undefined;
    let propertiesToSerialize: ts.PropertyDeclaration[] = [];

    var newMembers = [];

    // collect class state
    classDeclaration.members.forEach(member => {
        if (ts.isPropertyDeclaration(member)) {
            const propertyDeclaration = member as ts.PropertyDeclaration;
            if (isCloneMember(propertyDeclaration)) {
                propertiesToSerialize.push(propertyDeclaration);
            }
            newMembers.push(member);
        } else if (ts.isMethodDeclaration(member)) {
            if (ts.isIdentifier(member.name)) {
                const methodName = (member.name as ts.Identifier).escapedText;
                switch (methodName) {
                    case 'clone':
                        cloneMethod = member;
                        break;
                    default:
                        newMembers.push(member);
                        break;
                }
            }
        } else {
            newMembers.push(member);
        }
    });

    if (!cloneMethod) {
        cloneMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'clone',
            undefined,
            undefined,
            [],
            factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            undefined
        );
    }

    cloneMethod = factory.updateMethodDeclaration(
        cloneMethod,
        cloneMethod.decorators,
        cloneMethod.modifiers,
        cloneMethod.asteriskToken,
        cloneMethod.name,
        cloneMethod.questionToken,
        cloneMethod.typeParameters,
        cloneMethod.parameters,
        cloneMethod.type,
        generateCloneBody(classDeclaration, propertiesToSerialize, factory, typeChecker)
    )
    newMembers.push(cloneMethod);

    console.debug(`Rewriting ${classDeclaration.name.escapedText} done`);

    return factory.updateClassDeclaration(
        classDeclaration,
        classDeclaration.decorators,
        classDeclaration.modifiers,
        classDeclaration.name,
        classDeclaration.typeParameters,
        classDeclaration.heritageClauses,
        newMembers
    );
}

export default function (program: ts.Program) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            function visitor(node: ts.Node): ts.Node {
                if (ts.isClassDeclaration(node)) {
                    if (ts.getJSDocTags(node).find(t => t.tagName.text === 'cloneable')) {
                        return rewriteClassForCloneable(node, ctx.factory, program.getTypeChecker());
                    }
                }

                return node;
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}
