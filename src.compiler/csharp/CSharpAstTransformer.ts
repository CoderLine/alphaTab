import ts from 'typescript';
import * as cs from './CSharpAst';
import path from 'node:path';
import fs from 'node:fs';
import type CSharpEmitterContext from './CSharpEmitterContext';

export default class CSharpAstTransformer {
    protected typeScriptFile: ts.SourceFile;
    protected csharpFile: cs.SourceFile;
    protected context: CSharpEmitterContext;
    protected currentClassElement: ts.ClassElement | null = null;
    protected declarationOrAssignmentTypeStack: ts.Type[] = [];

    protected testClassAttribute: string = 'alphaTab.test.TestClass';
    protected testMethodAttribute: string = 'alphaTab.test.TestMethod';
    protected snapshotFileAttribute: string = 'alphaTab.test.SnapshotFile';
    protected deprecatedAttributeName: string = 'system.ObsoleteAttribute';

    public get extension(): string {
        return '.cs';
    }

    public constructor(typeScript: ts.SourceFile, context: CSharpEmitterContext) {
        this.typeScriptFile = typeScript;
        this.context = context;

        let fileName = path.relative(
            path.resolve(this.context.compilerOptions.baseUrl!),
            path.resolve(this.typeScriptFile.fileName)
        );
        fileName = this.buildFileName(fileName, context);

        this.csharpFile = {
            parent: null,
            tsNode: this.typeScriptFile,
            nodeType: cs.SyntaxKind.SourceFile,
            fileName: fileName,
            usings: this.context.getDefaultUsings().map(u => {
                return {
                    namespaceOrTypeName: u,
                    nodeType: cs.SyntaxKind.UsingDeclaration
                } as cs.UsingDeclaration;
            }),
            namespace: {
                parent: null,
                nodeType: cs.SyntaxKind.NamespaceDeclaration,
                namespace: this.context.toPascalCase('alphaTab'),
                declarations: []
            }
        };
        this.csharpFile.namespace.parent = this.csharpFile;
    }

    protected buildFileName(fileName: string, context: CSharpEmitterContext): string {
        return path.join(context.compilerOptions.outDir!, this.removeExtension(fileName) + this.extension);
    }

    public transform() {
        // if the default export is a class:
        //  - global statements will be put into the static constructor of the class
        //  - non exported variable declarations will become private static fields
        //  - non exported function declarations will become private static methods
        //  - exported variable declarations will become public static fields
        //  - exported function declarations will become public static methods
        //  - exported non default classes/enums/interfaces will just be normal namespace members (might need special treatment to avoid name clashes)

        // if the default export is no class:
        //  - global statements will raise an error (unsupported for now)
        //  - global variable declarations will raise an error (unsupported for now)
        //  - global method declarations will raise an error (unsupported for now)
        //  - exported non default classes/enums/interfaces will just be normal namespace members (might need special treatment to avoid name clashes)

        // type aliases for function types will become delegates
        // other type aliases will raise an error (unsupported for now)

        // describe() calls are translated as Test Classes
        // it() calls will be translated to Test Methods

        // if the file is the main library file, we remember the exported types
        // to make them public within the .net library

        // collect exports and declarations
        let defaultExport: ts.Declaration | null = null;
        const additionalExportDeclarations: ts.Declaration[] = [];
        const additionalNonExportDeclarations: ts.Declaration[] = [];
        const additionalNestedExportDeclarations: ts.Declaration[] = [];
        const additionalNestedNonExportsDeclarations: ts.Declaration[] = [];
        const globalStatements: ts.Statement[] = [];
        const testClasses: ts.CallExpression[] = [];
        const globalExports: ts.ExportDeclaration[] = [];

        switch (this.typeScriptFile.statements[0].kind) {
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.InterfaceDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.EnumDeclaration:
            case ts.SyntaxKind.TypeAliasDeclaration:
                break;
            default:
                if (this.shouldSkip(this.typeScriptFile.statements[0], false)) {
                    return;
                }
                break;
        }

        for (const s of this.typeScriptFile.statements) {
            if (ts.isExportDeclaration(s)) {
                globalExports.push(s);
            } else if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isEnumDeclaration(s)) {
                const isExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                const isDefaultExport = this.isDefaultExport(s);
                if (isExport && isDefaultExport) {
                    defaultExport = s;
                } else if (isExport) {
                    additionalExportDeclarations.push(s);
                } else {
                    additionalNonExportDeclarations.push(s);
                }
            } else if (ts.isTypeAliasDeclaration(s)) {
                if (ts.isFunctionTypeNode(s.type)) {
                    const isExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                    const isDefaultExport = this.isDefaultExport(s);
                    if (isExport && isDefaultExport) {
                        defaultExport = s;
                    } else if (isExport) {
                        additionalExportDeclarations.push(s);
                    } else {
                        additionalNonExportDeclarations.push(s);
                    }
                } else if (!this.shouldSkip(s, false)) {
                    this.context.addTsNodeDiagnostics(
                        s,
                        'Only FunctionType type aliases are allowed',
                        ts.DiagnosticCategory.Error
                    );
                }
            } else if (ts.isVariableDeclaration(s) || ts.isFunctionDeclaration(s)) {
                const isExport =
                    'modifiers' in s && s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExport) {
                    additionalNestedExportDeclarations.push(s);
                } else {
                    additionalNestedNonExportsDeclarations.push(s);
                }
            } else if (
                ts.isExpressionStatement(s) &&
                ts.isCallExpression(s.expression) &&
                ts.isIdentifier(s.expression.expression) &&
                s.expression.expression.text === 'describe'
            ) {
                testClasses.push(s.expression);
            } else if (!ts.isImportDeclaration(s)) {
                globalStatements.push(s);
            }
        }

        // TODO: Introduce setting for main library name.
        if (path.basename(this.typeScriptFile.fileName).toLowerCase() === 'alphatab.core.ts') {
            for (const x of globalExports) {
                if (!x.name && x.exportClause) {
                    if (ts.isNamespaceExport(x.exportClause)) {
                        if (!x.moduleSpecifier) {
                            this.context.addTsNodeDiagnostics(
                                x.exportClause,
                                'Failed to export namespace, missing module specifier',
                                ts.DiagnosticCategory.Error
                            );
                        } else {
                            const module = this.context.typeChecker.getSymbolAtLocation(x.moduleSpecifier);
                            if (!module) {
                                this.context.addTsNodeDiagnostics(
                                    x.exportClause,
                                    'Failed to export namespace, cannot resolve module',
                                    ts.DiagnosticCategory.Error
                                );
                            } else {
                                const exports = this.context.typeChecker.getExportsOfModule(module);
                                for (const exp of exports) {
                                    this.context.registerSymbolAsExported(exp);
                                }
                            }
                        }
                    } else {
                        for (const e of x.exportClause.elements) {
                            const symbol =
                                this.context.typeChecker.getTypeAtLocation(e.name)?.symbol ??
                                this.context.typeChecker.getSymbolAtLocation(e.name);
                            if (symbol) {
                                this.context.registerSymbolAsExported(symbol);
                            } else {
                                this.context.addTsNodeDiagnostics(
                                    e,
                                    'Exported symbol could not be resolved',
                                    ts.DiagnosticCategory.Error
                                );
                            }
                        }
                    }
                } else {
                    this.context.addTsNodeDiagnostics(x, 'Unsupported export', ts.DiagnosticCategory.Error);
                }
            }

            for (const s of globalStatements) {
                if (ts.isVariableStatement(s) && s.modifiers?.find(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    for (const d of s.declarationList.declarations) {
                        if (d.initializer && ts.isObjectLiteralExpression(d.initializer)) {
                            for (const p of d.initializer.properties) {
                                if (ts.isShorthandPropertyAssignment(p)) {
                                    const symbol = this.context.typeChecker.getTypeAtLocation(p.name)?.symbol;
                                    if (symbol) {
                                        this.context.registerSymbolAsExported(symbol);
                                    } else {
                                        this.context.addTsNodeDiagnostics(
                                            p,
                                            'Exported symbol could not be resolved',
                                            ts.DiagnosticCategory.Error
                                        );
                                    }
                                } else {
                                    this.context.addTsNodeDiagnostics(
                                        p,
                                        'Unsupported export',
                                        ts.DiagnosticCategory.Message
                                    );
                                }
                            }
                        } else {
                            this.context.addTsNodeDiagnostics(d, 'Unsupported export', ts.DiagnosticCategory.Message);
                        }
                    }
                }
            }

            // TODO: register global exports
        } else {
            // validate global statements
            if (!defaultExport || !ts.isClassDeclaration(defaultExport)) {
                for (const s of globalStatements) {
                    if (!this.shouldSkip(s, true)) {
                        this.context.addTsNodeDiagnostics(
                            s,
                            'Global statements in modules are only allowed if there is a default class export',
                            ts.DiagnosticCategory.Error
                        );
                    }
                }
            }

            for (const s of additionalNestedExportDeclarations) {
                if (!this.shouldSkip(s, true)) {
                    this.context.addTsNodeDiagnostics(
                        s,
                        'Global statements in modules are not yet supported',
                        ts.DiagnosticCategory.Error
                    );
                }
            }

            for (const s of additionalNestedNonExportsDeclarations) {
                if (!this.shouldSkip(s, true)) {
                    this.context.addTsNodeDiagnostics(
                        s,
                        'Global statements in modules are not yet supported',
                        ts.DiagnosticCategory.Error
                    );
                }
            }

            // TODO: make root namespace configurable from outside.
            const folders = path
                .dirname(
                    path.relative(
                        path.resolve(this.context.compilerOptions.baseUrl!),
                        path.resolve(this.typeScriptFile.fileName)
                    )
                )
                .split(path.sep);
            // TODO: make default root folders configurable from outside
            if (folders.length > 0 && (folders[0] === 'src' || folders[0] === 'test')) {
                folders.shift();
            }
            this.csharpFile.namespace.namespace =
                this.context.toPascalCase('alphaTab') + folders.map(f => `.${this.context.toPascalCase(f)}`).join('');

            if (defaultExport) {
                this.visit(
                    defaultExport,
                    additionalNestedExportDeclarations,
                    additionalNestedNonExportsDeclarations,
                    globalStatements
                );
            }
            for (const d of additionalExportDeclarations) {
                this.visit(d);
            }
            for (const d of additionalNonExportDeclarations) {
                this.visit(d);
            }
            for (const d of testClasses) {
                this.visitTestClass(d);
            }

            if (this.csharpFile.namespace.declarations.length > 0) {
                this.context.addSourceFile(this.csharpFile);
            }
        }
    }

    protected isDefaultExport(s: ts.NamedDeclaration): boolean {
        const isDefaultExport =
            'modifiers' in s &&
            s.modifiers &&
            !!(s.modifiers as ts.NodeArray<ts.Modifier>).find(m => m.kind === ts.SyntaxKind.DefaultKeyword);
        if (isDefaultExport) {
            return true;
        }

        // if the declaration has the same name as the file we consider it as default export
        const fileName = this.removeExtension(path.basename(this.typeScriptFile.fileName));
        if (s.name && ts.isIdentifier(s.name) && fileName === s.name.text) {
            return true;
        }

        return false;
    }

    protected visit(
        node: ts.Node,
        additionalNestedExportDeclarations?: ts.Declaration[],
        additionalNestedNonExportsDeclarations?: ts.Declaration[],
        globalStatements?: ts.Statement[]
    ): ts.Node {
        if (ts.isClassDeclaration(node)) {
            this.visitClassDeclaration(
                node,
                additionalNestedExportDeclarations,
                additionalNestedNonExportsDeclarations,
                globalStatements
            );
        } else if (ts.isEnumDeclaration(node)) {
            this.visitEnumDeclaration(node);
        } else if (ts.isInterfaceDeclaration(node)) {
            this.visitInterfaceDeclaration(node);
        }

        return node;
    }

    protected shouldSkip(node: ts.Node, checkComments: boolean) {
        if (checkComments) {
            const text = node.getSourceFile().text;
            // check for /*@target web*/ marker
            const commentText = text.substr(
                node.getStart() - node.getLeadingTriviaWidth(),
                node.getLeadingTriviaWidth()
            );
            if (commentText.indexOf('/*@target web*/') >= 0) {
                return true;
            }
        }
        const tags = ts.getJSDocTags(node).filter(t => t.tagName.text === 'target');
        if (tags.length > 0) {
            return !tags.find(t => t.comment === this.context.targetTag);
        }

        return false;
    }

    protected visitEnumDeclaration(node: ts.EnumDeclaration) {
        const csEnum: cs.EnumDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.EnumDeclaration,
            parent: this.csharpFile.namespace,
            members: [],
            tsNode: node,
            partial: false,
            skipEmit: this.shouldSkip(node, false),
            tsSymbol: this.context.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false
        };

        if (node.name) {
            csEnum.documentation = this.visitDocumentation(node.name);
        }

        this.visitDocumentationAttributes(csEnum, node);

        for (const m of node.members) {
            this.visitEnumMember(csEnum, m);
        }

        this.csharpFile.namespace.declarations.push(csEnum);
        this.context.registerSymbol(csEnum);
    }

    protected visitEnumMember(parent: cs.EnumDeclaration, enumMember: ts.EnumMember) {
        const csEnumMember: cs.EnumMember = {
            parent: parent,
            tsNode: enumMember,
            nodeType: cs.SyntaxKind.EnumMember,
            name: enumMember.name.getText(),
            skipEmit: this.shouldSkip(enumMember, false)
        };

        if (enumMember.initializer) {
            csEnumMember.initializer = this.visitExpression(csEnumMember, enumMember.initializer) ?? undefined;
        }

        if (enumMember.name) {
            csEnumMember.documentation = this.visitDocumentation(enumMember.name);
        }

        this.visitDocumentationAttributes(csEnumMember, enumMember);

        parent.members.push(csEnumMember);
        this.context.registerSymbol(csEnumMember);
    }

    protected visitTypeAliasDeclaration(node: ts.TypeAliasDeclaration) {
        if (!ts.isFunctionTypeNode(node.type)) {
            return;
        }

        const signature = this.context.typeChecker.getSignatureFromDeclaration(node.type);
        const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);

        const typeDeclaration: cs.DelegateDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.DelegateDeclaration,
            parent: this.csharpFile.namespace,
            parameters: [],
            tsNode: node,
            skipEmit: this.shouldSkip(node, false),
            partial: false,
            tsSymbol: this.context.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false,
            isStatic: false,
            returnType: this.createUnresolvedTypeNode(null, node.type.type, returnType)
        };

        if (node.name) {
            typeDeclaration.documentation = this.visitDocumentation(node.name);
        }

        this.visitDocumentationAttributes(typeDeclaration, node);

        if (node.typeParameters) {
            typeDeclaration.typeParameters = node.typeParameters.map(p =>
                this.visitTypeParameterDeclaration(typeDeclaration, p)
            );
        }

        if (!typeDeclaration.skipEmit) {
            for (const m of node.type.parameters) {
                this.visitMethodParameter(typeDeclaration, m);
            }
        }

        this.csharpFile.namespace.declarations.push(typeDeclaration);
        this.context.registerSymbol(typeDeclaration);
    }

    protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
        if (ts.getJSDocTags(node).some(t => t.tagName.text === 'record')) {
            this.visitRecordDeclaration(node);
            return;
        }

        let extendsClauses: ts.ExpressionWithTypeArguments[] = [];

        if (node.heritageClauses) {
            for (const c of node.heritageClauses) {
                if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                    extendsClauses = c.types.slice();
                }
            }
        }

        const csInterface: cs.InterfaceDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.InterfaceDeclaration,
            parent: this.csharpFile.namespace,
            members: [],
            tsNode: node,
            skipEmit: this.shouldSkip(node, false),
            partial: !!ts.getJSDocTags(node).find(t => t.tagName.text === 'partial'),
            tsSymbol: this.context.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false
        };

        if (node.name) {
            csInterface.documentation = this.visitDocumentation(node.name);
        }

        this.visitDocumentationAttributes(csInterface, node);

        if (node.typeParameters) {
            csInterface.typeParameters = node.typeParameters.map(p =>
                this.visitTypeParameterDeclaration(csInterface, p)
            );
        }

        if (extendsClauses && extendsClauses.length > 0) {
            csInterface.interfaces = extendsClauses.map(n => {
                const inter = this.createUnresolvedTypeNode(csInterface, n);
                if (n.typeArguments) {
                    inter.typeArguments = n.typeArguments.map(a => this.createUnresolvedTypeNode(csInterface, a));
                } else {
                    inter.typeArguments = undefined;
                }

                return inter;
            });
        }

        if (!csInterface.skipEmit) {
            for (const m of node.members) {
                this.visitInterfaceElement(csInterface, m);
            }
        }

        this.csharpFile.namespace.declarations.push(csInterface);
        this.context.registerSymbol(csInterface);
    }

    protected visitRecordDeclaration(node: ts.InterfaceDeclaration) {
        let extendsClause: ts.ExpressionWithTypeArguments | null = null;
        let implementsClauses: ts.ExpressionWithTypeArguments[] = [];

        if (node.heritageClauses) {
            for (const c of node.heritageClauses) {
                if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                    extendsClause = c.types[0];
                }
                if (c.token === ts.SyntaxKind.ImplementsKeyword) {
                    implementsClauses = c.types.slice();
                }
            }
        }

        const csClass: cs.ClassDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.ClassDeclaration,
            parent: this.csharpFile.namespace,
            isAbstract: false,
            members: [],
            tsNode: node,
            skipEmit: this.shouldSkip(node, false),
            partial: !!ts.getJSDocTags(node).find(t => t.tagName.text === 'partial'),
            tsSymbol: this.context.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false
        };

        if (node.name) {
            csClass.documentation = this.visitDocumentation(node.name);
        }

        this.visitDocumentationAttributes(csClass, node);

        if (node.typeParameters) {
            csClass.typeParameters = node.typeParameters.map(p => this.visitTypeParameterDeclaration(csClass, p));
        }

        if (extendsClause) {
            const ex = extendsClause as ts.ExpressionWithTypeArguments;
            const baseClass = this.createUnresolvedTypeNode(csClass, ex);
            if (ex.typeArguments) {
                baseClass.typeArguments = ex.typeArguments.map(a => this.createUnresolvedTypeNode(csClass, a));
            } else {
                baseClass.typeArguments = [];
            }
            csClass.baseClass = baseClass;
        }

        if (implementsClauses && implementsClauses.length > 0) {
            csClass.interfaces = implementsClauses.map(n => {
                const inter = this.createUnresolvedTypeNode(csClass, n);
                if (n.typeArguments) {
                    inter.typeArguments = n.typeArguments.map(a => this.createUnresolvedTypeNode(csClass, a));
                } else {
                    inter.typeArguments = undefined;
                }

                return inter;
            });
        }

        if (!csClass.skipEmit) {
            const recordMembers: ts.PropertySignature[] = [];
            for (const m of node.members) {
                if (ts.isPropertySignature(m)) {
                    const type = this.context.typeChecker.getTypeAtLocation(m);
                    recordMembers.push(m);
                    const csProperty: cs.PropertyDeclaration = {
                        parent: csClass,
                        nodeType: cs.SyntaxKind.PropertyDeclaration,
                        isAbstract: false,
                        isOverride: false,
                        isStatic: false,
                        isVirtual: false,
                        name: this.context.toPascalCase(m.name.getText()),
                        type: this.createUnresolvedTypeNode(null, m.type ?? m, type),
                        visibility: cs.Visibility.Public,
                        tsNode: m,
                        tsSymbol: this.context.getSymbolForDeclaration(m),
                        skipEmit: this.shouldSkip(m, false)
                    };

                    if (m.name) {
                        csProperty.documentation = this.visitDocumentation(m.name);
                    }

                    csProperty.type.parent = csProperty;
                    csProperty.getAccessor = {
                        parent: csProperty,
                        nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                        keyword: 'get'
                    };
                    csProperty.setAccessor = {
                        parent: csProperty,
                        nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                        keyword: 'set'
                    };

                    csClass.members.push(csProperty);

                    this.context.registerSymbol(csProperty);
                } else {
                    this.context.addTsNodeDiagnostics(
                        m,
                        `Record interfaces can only declare property signatures, found ${ts.SyntaxKind[m.kind]}`,
                        ts.DiagnosticCategory.Error
                    );
                }
            }

            const csConstructor: cs.ConstructorDeclaration = {
                parent: csClass,
                nodeType: cs.SyntaxKind.ConstructorDeclaration,
                name: '.ctor',
                parameters: [],
                isStatic: false,
                visibility: cs.Visibility.Public,
                tsNode: node,
                skipEmit: this.shouldSkip(node, false)
            };

            for (const p of recordMembers) {
                const type = this.context.typeChecker.getTypeAtLocation(p);
                const csParameter: cs.ParameterDeclaration = {
                    nodeType: cs.SyntaxKind.ParameterDeclaration,
                    name: (p.name as ts.Identifier).text,
                    parent: csConstructor,
                    type: this.createUnresolvedTypeNode(null, p.type ?? p, type),
                    tsNode: p,
                    params: false,
                    isOptional: false
                };
                csParameter.type!.parent = csParameter;
                csConstructor.parameters.push(csParameter);
            }

            csConstructor.body = {
                nodeType: cs.SyntaxKind.Block,
                parent: csConstructor,
                statements: []
            };

            for (const p of recordMembers) {
                const stmt: cs.ExpressionStatement = {
                    nodeType: cs.SyntaxKind.ExpressionStatement,
                    parent: csConstructor.body,
                    expression: null!
                };

                stmt.expression = {
                    nodeType: cs.SyntaxKind.BinaryExpression,
                    parent: stmt,
                    operator: '=',
                    left: null!,
                    right: null!
                } as cs.BinaryExpression;

                (stmt.expression as cs.BinaryExpression).left = {
                    nodeType: cs.SyntaxKind.MemberAccessExpression,
                    parent: stmt.expression,
                    expression: {
                        nodeType: cs.SyntaxKind.ThisLiteral,
                        parent: stmt.expression
                    } as cs.ThisLiteral,
                    member: this.context.toPascalCase(p.name.getText())
                } as cs.MemberAccessExpression;

                ((stmt.expression as cs.BinaryExpression).left as cs.MemberAccessExpression).expression.parent = (
                    stmt.expression as cs.BinaryExpression
                ).left;

                (stmt.expression as cs.BinaryExpression).right = {
                    nodeType: cs.SyntaxKind.Identifier,
                    parent: stmt.expression,
                    text: (p.name as ts.Identifier).text
                } as cs.Identifier;

                csConstructor.body.statements.push(stmt);
            }

            csClass.members.push(csConstructor);
        }

        this.csharpFile.namespace.declarations.push(csClass);
        this.context.registerSymbol(csClass);
    }

    protected visitTypeParameterDeclaration(
        parent: cs.Node,
        p: ts.TypeParameterDeclaration
    ): cs.TypeParameterDeclaration {
        const csTypeParameter: cs.TypeParameterDeclaration = {
            nodeType: cs.SyntaxKind.TypeParameterDeclaration,
            name: p.name.text,
            parent: parent,
            tsNode: p
        };

        if (p.constraint) {
            const constraintType = ts.isUnionTypeNode(p.constraint) ? p.constraint.types[0] : p.constraint;
            csTypeParameter.constraint = this.createUnresolvedTypeNode(csTypeParameter, constraintType);
        }

        return csTypeParameter;
    }

    protected createUnresolvedTypeNode(
        parent: cs.Node | null,
        tsNode: ts.Node,
        tsType?: ts.Type,
        tsSymbol?: ts.Symbol
    ): cs.UnresolvedTypeNode {
        if (!tsType) {
            tsType = this.context.typeChecker.getTypeAtLocation(tsNode);
        }

        const unresolved = {
            nodeType: cs.SyntaxKind.UnresolvedTypeNode,
            tsNode: tsNode,
            tsType: tsType,
            tsSymbol: tsSymbol,
            parent: parent
        } as cs.UnresolvedTypeNode;

        let typeArguments = (tsType as ts.TypeReference)?.typeArguments;
        if (tsType && !typeArguments) {
            const nonNullable = this.context.typeChecker.getNonNullableType(tsType);
            typeArguments = (nonNullable as ts.TypeReference)?.typeArguments;
        }
        if (typeArguments) {
            unresolved.typeArguments = typeArguments.map(a => this.createUnresolvedTypeNode(parent, tsNode, a));
        }

        this.context.registerUnresolvedTypeNode(unresolved);
        return unresolved;
    }

    protected createVarTypeNode(parent: cs.Node | null, tsNode: ts.Node): cs.PrimitiveTypeNode {
        const varNode = {
            nodeType: cs.SyntaxKind.PrimitiveTypeNode,
            tsNode: tsNode,
            parent: parent,
            type: cs.PrimitiveType.Var
        } as cs.PrimitiveTypeNode;
        return varNode;
    }

    public visitTestClass(d: ts.CallExpression): void {
        const csClass: cs.ClassDeclaration = {
            visibility: cs.Visibility.Public,
            name: (d.arguments[0] as ts.StringLiteral).text,
            tsNode: d,
            nodeType: cs.SyntaxKind.ClassDeclaration,
            parent: this.csharpFile.namespace,
            isAbstract: false,
            partial: false,
            members: [],
            hasVirtualMembersOrSubClasses: false
        };

        if (this.testClassAttribute.length > 0) {
            csClass.attributes ??= [];
            csClass.attributes.push({
                parent: csClass,
                nodeType: cs.SyntaxKind.Attribute,
                type: {
                    parent: null,
                    nodeType: cs.SyntaxKind.TypeReference,
                    reference: this.context.makeTypeName(this.testClassAttribute)
                } as cs.TypeReference
            });
        }

        for (const s of ((d.arguments![1] as ts.ArrowFunction).body as ts.Block).statements) {
            if (ts.isExpressionStatement(s)) {
                if (ts.isCallExpression(s.expression)) {
                    if (ts.isIdentifier(s.expression.expression) && s.expression.expression.text === 'it') {
                        this.visitTestMethod(csClass, s.expression);
                    } else {
                        this.context.addTsNodeDiagnostics(
                            s,
                            `Unsupported test method function call ${s.expression.expression.getText()}`,
                            ts.DiagnosticCategory.Error
                        );
                    }
                } else {
                    this.context.addTsNodeDiagnostics(
                        s,
                        `Unsupported test class member ${ts.SyntaxKind[s.expression.kind]}`,
                        ts.DiagnosticCategory.Error
                    );
                }
            } else if (ts.isVariableStatement(s)) {
                this.visitTestClassProperty(csClass, s);
            } else if (ts.isFunctionDeclaration(s)) {
                this.visitTestClassMethod(csClass, s);
            } else {
                this.context.addTsNodeDiagnostics(
                    s,
                    `Unsupported test class member ${ts.SyntaxKind[s.kind]}`,
                    ts.DiagnosticCategory.Error
                );
            }
        }

        this.csharpFile.namespace.declarations.push(csClass);
    }

    protected visitTestClassMethod(parent: cs.ClassDeclaration, d: ts.FunctionDeclaration) {
        const signature = this.context.typeChecker.getSignatureFromDeclaration(d);
        const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);

        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            isGeneratorFunction: false,
            partial: !!ts.getJSDocTags(d).find(t => t.tagName.text === 'partial'),
            name: this.context.toPascalCase((d.name as ts.Identifier).text),
            parameters: [],
            returnType: this.createUnresolvedTypeNode(null, d.type ?? d, returnType),
            visibility: this.mapVisibility(d, cs.Visibility.Private),
            tsNode: d,
            skipEmit: this.shouldSkip(d, true),
            isTestMethod: false
        };
        csMethod.isAsync = !!d.modifiers && !!d.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

        const type = this.context.typeChecker.getTypeAtLocation(d.name!);
        csMethod.returnType.parent = csMethod;

        for (const p of d.parameters) {
            csMethod.parameters.push(this.makeParameter(csMethod, p));
        }
        this.declarationOrAssignmentTypeStack.push(type);
        csMethod.body = this.visitBlock(csMethod, d.body as ts.Block);
        this.declarationOrAssignmentTypeStack.pop();

        parent.members.push(csMethod);
        this.context.registerSymbol(csMethod);

        return csMethod;
    }

    protected visitTestMethod(parent: cs.ClassDeclaration, d: ts.CallExpression) {
        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            isTestMethod: true,
            isGeneratorFunction: false,
            partial: !!ts.getJSDocTags(d).find(t => t.tagName.text === 'partial'),
            name: this.context.toMethodName((d.arguments[0] as ts.StringLiteral).text),
            parameters: [],
            returnType: {
                parent: null,
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void,
                tsNode: d.arguments[1]
            } as cs.PrimitiveTypeNode,
            visibility: cs.Visibility.Public,
            tsNode: d,
            skipEmit: this.shouldSkip(d, true)
        };

        if (csMethod.name.match(/^[^a-zA-Z].*/)) {
            csMethod.name = `Test${csMethod.name}`;
        }

        csMethod.attributes ??= [];
        csMethod.attributes.push({
            parent: csMethod,
            nodeType: cs.SyntaxKind.Attribute,
            type: {
                parent: null,
                nodeType: cs.SyntaxKind.TypeReference,
                reference: this.context.makeTypeName(this.testMethodAttribute)
            } as cs.TypeReference,
            arguments: [
                {
                    parent: null,
                    nodeType: cs.SyntaxKind.StringLiteral,
                    text: (d.arguments[0] as ts.StringLiteral).text
                } as cs.StringLiteral
            ]
        });

        const testFunction = d.arguments![1] as ts.ArrowFunction;
        csMethod.isAsync =
            !!testFunction.modifiers && !!testFunction.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

        if (csMethod.isAsync) {
            csMethod.returnType = {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: csMethod,
                tsNode: d.arguments[1],
                isAsync: true,
                reference: {
                    nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                    type: cs.PrimitiveType.Void
                } as cs.PrimitiveTypeNode,
                typeArguments: []
            } as cs.TypeReference;
        }

        csMethod.body = this.visitBlock(csMethod, testFunction.body as ts.Block);

        parent.members.push(csMethod);

        const sourcePath = d.getSourceFile().fileName;
        const snapshotFilePath = path.resolve(sourcePath, '..', '__snapshots__', `${path.basename(sourcePath)}.snap`);
        if (fs.existsSync(snapshotFilePath)) {
            const relative = path.relative(path.resolve(this.context.compilerOptions.baseUrl!), snapshotFilePath);
            csMethod.attributes.push({
                parent: csMethod,
                nodeType: cs.SyntaxKind.Attribute,
                type: {
                    parent: null,
                    nodeType: cs.SyntaxKind.TypeReference,
                    reference: this.context.makeTypeName(this.snapshotFileAttribute)
                } as cs.TypeReference,
                arguments: [
                    {
                        parent: null,
                        nodeType: cs.SyntaxKind.StringLiteral,
                        text: relative.replaceAll('\\', '/')
                    } as cs.StringLiteral
                ]
            });
        }
    }

    protected visitTestClassProperty(parent: cs.ClassDeclaration, s: ts.VariableStatement) {
        for (const d of s.declarationList.declarations) {
            const type = this.context.typeChecker.getTypeAtLocation(d.name);
            if (this.context.isFunctionType(type) && d.initializer && ts.isArrowFunction(d.initializer)) {
                const csMethod: cs.MethodDeclaration = {
                    parent: parent,
                    nodeType: cs.SyntaxKind.MethodDeclaration,
                    isAbstract: false,
                    isOverride: false,
                    isStatic: false,
                    isVirtual: false,
                    isTestMethod: false,
                    isGeneratorFunction: false,
                    partial: !!ts.getJSDocTags(d).find(t => t.tagName.text === 'partial'),
                    name: this.context.toPascalCase(d.name.getText()),
                    returnType: {} as cs.TypeNode,
                    visibility: cs.Visibility.Private,
                    tsNode: d,
                    parameters: []
                };
                csMethod.isAsync =
                    !!d.initializer.modifiers &&
                    !!d.initializer.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

                const functionType = type.symbol.declarations!.find(d =>
                    ts.isFunctionTypeNode(d)
                ) as ts.FunctionTypeNode;

                if (csMethod.isAsync) {
                    const mapped = this.createUnresolvedTypeNode(csMethod, functionType.type);
                    if (mapped.tsType && mapped.tsType.symbol && mapped.tsType.symbol.name === 'Promise') {
                        csMethod.returnType = mapped.typeArguments![0];
                    } else {
                        csMethod.returnType = mapped;
                    }
                } else {
                    csMethod.returnType = this.createUnresolvedTypeNode(csMethod, functionType.type);
                }

                csMethod.returnType.parent = csMethod;

                for (const p of d.initializer.parameters) {
                    csMethod.parameters.push(this.makeParameter(csMethod, p));
                }
                this.declarationOrAssignmentTypeStack.push(type);
                csMethod.body = this.visitBlock(csMethod, d.initializer.body as ts.Block);
                this.declarationOrAssignmentTypeStack.pop();

                parent.members.push(csMethod);
                this.context.registerSymbol(csMethod);
            } else {
                const csProperty: cs.PropertyDeclaration = {
                    parent: parent,
                    nodeType: cs.SyntaxKind.PropertyDeclaration,
                    isAbstract: false,
                    isOverride: false,
                    isStatic: false,
                    isVirtual: false,
                    name: this.context.toPascalCase(d.name.getText()),
                    type: this.createUnresolvedTypeNode(null, d.type ?? d, type),
                    visibility: cs.Visibility.Private,
                    tsNode: d
                };

                csProperty.type.parent = csProperty;
                csProperty.getAccessor = {
                    parent: csProperty,
                    nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                    keyword: 'get'
                };

                if (d.initializer) {
                    this.declarationOrAssignmentTypeStack.push(type);
                    csProperty.initializer = this.visitExpression(csProperty, d.initializer) ?? undefined;
                    this.declarationOrAssignmentTypeStack.pop();
                }

                parent.members.push(csProperty);
                this.context.registerSymbol(csProperty);
            }
        }
    }

    protected visitClassDeclaration(
        node: ts.ClassDeclaration,
        additionalNestedExportDeclarations?: ts.Declaration[],
        additionalNestedNonExportsDeclarations?: ts.Declaration[],
        globalStatements?: ts.Statement[]
    ) {
        let extendsClause: ts.ExpressionWithTypeArguments | null = null;
        let implementsClauses: ts.ExpressionWithTypeArguments[] = [];

        if (node.heritageClauses) {
            for (const c of node.heritageClauses) {
                if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                    extendsClause = c.types[0];
                }
                if (c.token === ts.SyntaxKind.ImplementsKeyword) {
                    implementsClauses = c.types.slice();
                }
            }
        }

        const csClass: cs.ClassDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name!.text,
            tsNode: node,
            nodeType: cs.SyntaxKind.ClassDeclaration,
            parent: this.csharpFile.namespace,
            isAbstract: !!node.modifiers && !!node.modifiers.find(m => m.kind === ts.SyntaxKind.AbstractKeyword),
            partial: !!ts.getJSDocTags(node).find(t => t.tagName.text === 'partial'),
            members: [],
            skipEmit: this.shouldSkip(node, false),
            tsSymbol: this.context.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false
        };

        if (node.name) {
            csClass.documentation = this.visitDocumentation(node.name);
        }

        this.visitDocumentationAttributes(csClass, node);

        if (node.typeParameters) {
            csClass.typeParameters = node.typeParameters.map(p => this.visitTypeParameterDeclaration(csClass, p));
        }

        if (extendsClause) {
            const ex = extendsClause as ts.ExpressionWithTypeArguments;
            const baseClass = this.createUnresolvedTypeNode(csClass, ex);
            if (ex.typeArguments) {
                baseClass.typeArguments = ex.typeArguments.map(a => this.createUnresolvedTypeNode(csClass, a));
            } else {
                baseClass.typeArguments = [];
            }
            csClass.baseClass = baseClass;
        }

        if (implementsClauses && implementsClauses.length > 0) {
            csClass.interfaces = implementsClauses.map(n => {
                const inter = this.createUnresolvedTypeNode(csClass, n);
                if (n.typeArguments) {
                    inter.typeArguments = n.typeArguments.map(a => this.createUnresolvedTypeNode(csClass, a));
                } else {
                    inter.typeArguments = undefined;
                }

                return inter;
            });
        }

        if (!csClass.skipEmit) {
            for (const m of node.members) {
                this.visitClassElement(csClass, m);
            }

            if (globalStatements && globalStatements.length > 0) {
                const staticConstructor = {
                    parent: csClass,
                    isStatic: true,
                    name: 'cctor',
                    nodeType: cs.SyntaxKind.ConstructorDeclaration,
                    parameters: [],
                    visibility: cs.Visibility.None,
                    tsNode: node,
                    body: {
                        parent: null,
                        nodeType: cs.SyntaxKind.Block,
                        statements: []
                    } as cs.Block
                } as cs.ConstructorDeclaration;

                for (const s of globalStatements) {
                    const st = this.visitStatement(staticConstructor.body!, s)!;
                    if (st) {
                        (staticConstructor.body as cs.Block).statements.push(st);
                    }
                }

                csClass.members.push(staticConstructor);
            }
        }

        this.csharpFile.namespace.declarations.push(csClass);
        this.context.registerSymbol(csClass);
    }

    private visitDocumentationAttributes(a: cs.AttributedElement, node: ts.Node) {
        const deprecated = ts.getJSDocDeprecatedTag(node);
        if (deprecated) {
            a.attributes ??= [];

            a.attributes.push({
                nodeType: cs.SyntaxKind.Attribute,
                parent: a,
                type: {
                    parent: null,
                    nodeType: cs.SyntaxKind.TypeReference,
                    reference: this.context.makeTypeName(this.deprecatedAttributeName)
                } as cs.TypeReference,
                arguments: [
                    {
                        nodeType: cs.SyntaxKind.StringLiteral,
                        text: this.jsDocToString(deprecated.comment)
                    } as cs.StringLiteral
                ]
            });
        }
    }

    private jsDocToString(
        comment:
            | string
            | ts.NodeArray<ts.JSDocComment>
            | ts.JSDocComment
            | ts.EntityName
            | ts.JSDocMemberName
            | undefined
    ): string {
        switch (typeof comment) {
            case 'string':
                return comment;
            case 'undefined':
                return '';
            default:
                if ('kind' in comment) {
                    switch (comment.kind) {
                        case ts.SyntaxKind.Identifier:
                            return comment.text;
                        case ts.SyntaxKind.QualifiedName:
                        case ts.SyntaxKind.JSDocMemberName:
                            return `${this.jsDocToString(comment.left)}.${this.jsDocToString(comment.right)}`;
                        case ts.SyntaxKind.JSDocText:
                            return comment.text;
                        case ts.SyntaxKind.JSDocLink:
                        case ts.SyntaxKind.JSDocLinkCode:
                        case ts.SyntaxKind.JSDocLinkPlain:
                            return comment.text || this.jsDocToString(comment.name);
                    }
                }
                return comment.map(v => this.jsDocToString(v)).join('');
        }
    }

    protected visitDocumentation(node: ts.Node): string | undefined {
        const symbol = this.context.typeChecker.getSymbolAtLocation(node);
        if (!symbol) {
            return undefined;
        }

        const docs = symbol.getDocumentationComment(this.context.typeChecker);
        if (!docs || docs.length === 0) {
            return undefined;
        }

        let s = '';

        for (const d of docs) {
            switch ((ts.SymbolDisplayPartKind as any)[d.kind]) {
                case ts.SymbolDisplayPartKind.text:
                    s += d.text.split('\r').join('');
                    break;
                case ts.SymbolDisplayPartKind.lineBreak:
                    s += '\n';
                    break;
                case ts.SymbolDisplayPartKind.space:
                    s += ' ';
                    break;
                case ts.SymbolDisplayPartKind.aliasName:
                case ts.SymbolDisplayPartKind.className:
                case ts.SymbolDisplayPartKind.enumName:
                case ts.SymbolDisplayPartKind.fieldName:
                case ts.SymbolDisplayPartKind.interfaceName:
                case ts.SymbolDisplayPartKind.keyword:
                case ts.SymbolDisplayPartKind.numericLiteral:
                case ts.SymbolDisplayPartKind.stringLiteral:
                case ts.SymbolDisplayPartKind.localName:
                case ts.SymbolDisplayPartKind.methodName:
                case ts.SymbolDisplayPartKind.moduleName:
                case ts.SymbolDisplayPartKind.operator:
                case ts.SymbolDisplayPartKind.parameterName:
                case ts.SymbolDisplayPartKind.propertyName:
                case ts.SymbolDisplayPartKind.punctuation:
                case ts.SymbolDisplayPartKind.typeParameterName:
                case ts.SymbolDisplayPartKind.enumMemberName:
                case ts.SymbolDisplayPartKind.functionName:
                case ts.SymbolDisplayPartKind.regularExpressionLiteral:
                    s += d.text.split('\r').join('');
                    break;
            }
        }

        return s;
    }

    protected visitClassElement(parent: cs.ClassDeclaration, classElement: ts.ClassElement) {
        const isSkipped = this.shouldSkip(classElement, false);
        if (isSkipped) {
            this.context.processingSkippedElement = true;
        }

        this.currentClassElement = classElement;

        if (ts.isConstructorDeclaration(classElement)) {
            this.visitConstructorDeclaration(parent, classElement);
        } else if (ts.isMethodSignature(classElement)) {
            this.visitMethodSignature(parent, classElement);
        } else if (ts.isMethodDeclaration(classElement)) {
            this.visitMethodDeclaration(parent, classElement);
        } else if (ts.isPropertySignature(classElement)) {
            this.visitPropertySignature(parent, classElement);
        } else if (ts.isPropertyDeclaration(classElement)) {
            this.visitPropertyDeclaration(parent, classElement);
        } else if (ts.isGetAccessor(classElement)) {
            this.visitGetAccessor(parent, classElement);
        } else if (ts.isSetAccessor(classElement)) {
            this.visitSetAccessor(parent, classElement);
        } else {
            this.context.addTsNodeDiagnostics(
                classElement,
                `Unsupported class element: ${ts.SyntaxKind[classElement.kind]}`,
                ts.DiagnosticCategory.Error
            );
        }

        this.currentClassElement = null;

        if (isSkipped) {
            this.context.processingSkippedElement = false;
        }
    }

    protected visitInterfaceElement(parent: cs.InterfaceDeclaration, classElement: ts.TypeElement) {
        if (ts.isMethodSignature(classElement)) {
            this.visitMethodSignature(parent, classElement);
        } else if (ts.isPropertySignature(classElement)) {
            this.visitPropertySignature(parent, classElement);
        } else {
            this.context.addTsNodeDiagnostics(
                classElement,
                `Unsupported interface element: ${ts.SyntaxKind[classElement.kind]}`,
                ts.DiagnosticCategory.Error
            );
        }
    }

    protected visitPropertySignature(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.PropertySignature
    ) {
        const type = this.context.typeChecker.getTypeAtLocation(classElement);
        const csProperty: cs.PropertyDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            name: this.context.toPascalCase((classElement.name as ts.Identifier).text),
            type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, type),
            visibility: cs.Visibility.None,
            tsNode: classElement,
            skipEmit: this.shouldSkip(classElement, false)
        };

        if (classElement.name) {
            csProperty.documentation = this.visitDocumentation(classElement.name);
        }

        this.visitDocumentationAttributes(csProperty, classElement);

        let isReadonly = false;
        if (classElement.modifiers) {
            for (const m of classElement.modifiers) {
                switch (m.kind) {
                    case ts.SyntaxKind.ReadonlyKeyword:
                        isReadonly = true;
                        break;
                }
            }
        }

        csProperty.type.parent = csProperty;
        csProperty.getAccessor = {
            parent: csProperty,
            nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
            keyword: 'get'
        };
        if (!isReadonly) {
            csProperty.setAccessor = {
                parent: csProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                keyword: 'set'
            };
        }

        parent.members.push(csProperty);
        this.context.registerSymbol(csProperty);
    }

    protected visitGetAccessor(parent: cs.ClassDeclaration, classElement: ts.GetAccessorDeclaration) {
        const propertyName = this.context.toPascalCase(classElement.name.getText());
        const member = parent.members.find(m => m.name === propertyName);
        if (member && cs.isPropertyDeclaration(member)) {
            member.getAccessor = {
                keyword: 'get',
                parent: member,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(member, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;

            this.applyPropertyOverride(member, classElement);
        } else {
            const signature = this.context.typeChecker.getSignatureFromDeclaration(classElement);
            const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);

            const newProperty: cs.PropertyDeclaration = {
                isAbstract: false,
                isOverride: false,
                isVirtual: false,
                isStatic: false,
                name: propertyName,
                nodeType: cs.SyntaxKind.PropertyDeclaration,
                parent: parent,
                visibility: this.mapVisibility(classElement, cs.Visibility.Public),
                type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType),
                skipEmit: this.shouldSkip(classElement, false),
                tsNode: classElement,
                tsSymbol: this.context.getSymbolForDeclaration(classElement)
            };

            this.applyPropertyOverride(newProperty, classElement);

            if (classElement.modifiers) {
                for (const m of classElement.modifiers) {
                    switch (m.kind) {
                        case ts.SyntaxKind.AbstractKeyword:
                            newProperty.isAbstract = true;
                            parent.isAbstract = true;
                            newProperty.isVirtual = false;
                            newProperty.isOverride = false;
                            break;
                        case ts.SyntaxKind.StaticKeyword:
                            newProperty.isStatic = true;
                            newProperty.isVirtual = false;
                            newProperty.isOverride = false;
                            break;
                    }
                }
            }

            newProperty.type.parent = newProperty;

            newProperty.getAccessor = {
                keyword: 'get',
                parent: newProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(newProperty, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;

            parent.members.push(newProperty);
        }
    }

    protected visitSetAccessor(parent: cs.ClassDeclaration, classElement: ts.SetAccessorDeclaration) {
        const propertyName = this.context.toPascalCase(classElement.name.getText());
        const member = parent.members.find(m => m.name === propertyName);
        if (member && cs.isPropertyDeclaration(member)) {
            member.setAccessor = {
                keyword: 'set',
                parent: member,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(member, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;

            this.applyPropertyOverride(member, classElement);

            return member.setAccessor;
        }
        const signature = this.context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);

        const newProperty: cs.PropertyDeclaration = {
            isAbstract: false,
            isOverride: false,
            isVirtual: false,
            isStatic: false,
            name: propertyName,
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            parent: parent,
            visibility: this.mapVisibility(classElement, cs.Visibility.Public),
            type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType),
            skipEmit: this.shouldSkip(classElement, false),
            tsNode: classElement,
            tsSymbol: this.context.getSymbolForDeclaration(classElement)
        };

        this.applyPropertyOverride(newProperty, classElement);

        if (classElement.modifiers) {
            for (const m of classElement.modifiers) {
                switch (m.kind) {
                    case ts.SyntaxKind.AbstractKeyword:
                        newProperty.isAbstract = true;
                        parent.isAbstract = true;
                        newProperty.isVirtual = false;
                        newProperty.isOverride = false;
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        newProperty.isStatic = true;
                        newProperty.isVirtual = false;
                        newProperty.isOverride = false;
                        break;
                }
            }
        }

        newProperty.type.parent = newProperty;

        newProperty.setAccessor = {
            keyword: 'set',
            parent: newProperty,
            nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
            tsNode: classElement,
            body: classElement.body ? this.visitBlock(newProperty, classElement.body) : null
        } as cs.PropertyAccessorDeclaration;

        parent.members.push(newProperty);

        return newProperty.setAccessor;
    }

    protected applyMethodOverride(csMethod: cs.MethodDeclaration, classElement: ts.MethodDeclaration) {
        const overrides = this.context.markOverride(classElement);
        if (overrides.length > 0) {
            csMethod.isOverride = true;
            for (const o of overrides) {
                let type: ts.Type | undefined = undefined;
                let typeNode: ts.TypeNode | undefined = undefined;
                if (ts.isMethodDeclaration(classElement)) {
                    const signature = this.context.typeChecker.getSignatureFromDeclaration(classElement);
                    type = signature ? this.context.typeChecker.getReturnTypeOfSignature(signature) : undefined;
                }

                if (!type) {
                    return;
                }

                if (ts.isMethodDeclaration(o)) {
                    typeNode = o.type;
                } else if (ts.isMethodSignature(o)) {
                    typeNode = o.type;
                }

                this.context.removeUnresolvedTypeNode(csMethod.returnType as cs.UnresolvedTypeNode);
                csMethod.returnType = this.createUnresolvedTypeNode(csMethod, typeNode ?? o, type);

                // NOTE: we could also ensure the correct parameter list here
                return;
            }
        }
    }

    private applyPropertyOverride(
        csProperty: cs.PropertyDeclaration,
        classElement: ts.PropertyDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration
    ) {
        const overrides = this.context.markOverride(classElement);
        if (overrides.length > 0) {
            csProperty.isOverride = true;
            for (const o of overrides) {
                let type: ts.Type | undefined = undefined;
                let typeNode: ts.TypeNode | undefined = undefined;

                if (ts.isGetAccessorDeclaration(o)) {
                    const signature = this.context.typeChecker.getSignatureFromDeclaration(o);
                    type = signature ? this.context.typeChecker.getReturnTypeOfSignature(signature) : undefined;
                    typeNode = o.type;
                } else if (ts.isSetAccessorDeclaration(o)) {
                    const signature = this.context.typeChecker.getSignatureFromDeclaration(o);
                    type = signature ? this.context.typeChecker.getTypeOfSymbol(signature.parameters[0]) : undefined;
                    typeNode = o.parameters[0].type;
                } else if (ts.isPropertyDeclaration(o)) {
                    type = this.context.typeChecker.getTypeAtLocation(o);
                    typeNode = o.type;
                } else if (ts.isPropertySignature(o)) {
                    type = this.context.typeChecker.getTypeAtLocation(o);
                    typeNode = o.type;
                }

                if (!type) {
                    return;
                }

                this.context.removeUnresolvedTypeNode(csProperty.type as cs.UnresolvedTypeNode);
                csProperty.type = this.createUnresolvedTypeNode(csProperty, typeNode ?? o, type);
                return;
            }
        }
    }

    protected visitPropertyDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.PropertyDeclaration
    ) {
        const visibility = this.mapVisibility(classElement, cs.Visibility.Public);
        const type = this.context.typeChecker.getTypeAtLocation(classElement);
        const csProperty: cs.PropertyDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            name: this.context.toPascalCase(classElement.name.getText()),
            type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, type),
            visibility: visibility,
            tsNode: classElement,
            tsSymbol: this.context.getSymbolForDeclaration(classElement),
            skipEmit: this.shouldSkip(classElement, false)
        };

        if (classElement.name) {
            csProperty.documentation = this.visitDocumentation(classElement.name);
        }

        this.visitDocumentationAttributes(csProperty, classElement);
        this.applyPropertyOverride(csProperty, classElement);

        let isReadonly = false;
        if (classElement.modifiers) {
            for (const m of classElement.modifiers) {
                switch (m.kind) {
                    case ts.SyntaxKind.AbstractKeyword:
                        csProperty.isAbstract = true;
                        if (cs.isClassDeclaration(parent)) {
                            parent.isAbstract = true;
                        }
                        csProperty.isVirtual = false;
                        csProperty.isOverride = false;
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        csProperty.isStatic = true;
                        csProperty.isVirtual = false;
                        csProperty.isOverride = false;
                        break;
                    case ts.SyntaxKind.ReadonlyKeyword:
                        isReadonly = true;
                        break;
                }
            }
        }

        csProperty.type.parent = csProperty;
        csProperty.getAccessor = {
            parent: csProperty,
            nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
            keyword: 'get'
        };

        if (!isReadonly) {
            csProperty.setAccessor = {
                parent: csProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                keyword: 'set'
            };
        }

        if (classElement.initializer) {
            this.declarationOrAssignmentTypeStack.push(type);
            csProperty.initializer = this.visitExpression(csProperty, classElement.initializer) ?? undefined;
            this.declarationOrAssignmentTypeStack.pop();
        } else if (classElement.exclamationToken) {
            csProperty.initializer = {
                parent: csProperty,
                expression: {
                    nodeType: cs.SyntaxKind.NullLiteral,
                    tsNode: csProperty.tsNode
                } as cs.NullLiteral,
                nodeType: cs.SyntaxKind.NonNullExpression,
                tsNode: csProperty.tsNode
            } as cs.NonNullExpression;

            (csProperty.initializer as cs.NonNullExpression).expression.parent = csProperty.initializer;
        }

        parent.members.push(csProperty);

        this.context.registerSymbol(csProperty);

        return csProperty;
    }

    protected visitMethodDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodDeclaration
    ) {
        const signature = this.context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType: ts.Type | undefined = signature
            ? this.context.typeChecker.getReturnTypeOfSignature(signature)
            : undefined;

        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            isTestMethod: false,
            isGeneratorFunction: !!classElement.asteriskToken,
            partial: !!ts.getJSDocTags(classElement).find(t => t.tagName.text === 'partial'),
            name: this.context.buildMethodName(classElement.name),
            parameters: [],
            returnType: this.createUnresolvedTypeNode(
                null,
                classElement.type ?? classElement,
                returnType,
                returnType?.getSymbol()
            ),
            visibility: this.mapVisibility(classElement, cs.Visibility.Public),
            tsNode: classElement,
            tsSymbol: this.context.getSymbolForDeclaration(classElement),
            skipEmit: this.shouldSkip(classElement, false)
        };

        if (classElement.name) {
            csMethod.documentation = this.visitDocumentation(classElement.name);
        }

        this.visitDocumentationAttributes(csMethod, classElement);
        this.applyMethodOverride(csMethod, classElement);

        if (classElement.modifiers) {
            for (const m of classElement.modifiers) {
                switch (m.kind) {
                    case ts.SyntaxKind.AbstractKeyword:
                        csMethod.isAbstract = true;
                        if (cs.isClassDeclaration(parent)) {
                            parent.isAbstract = true;
                        }
                        csMethod.isVirtual = false;
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        csMethod.isStatic = true;
                        csMethod.isVirtual = false;
                        csMethod.isOverride = false;
                        break;
                    case ts.SyntaxKind.AsyncKeyword:
                        csMethod.isAsync = true;
                        break;
                }
            }
        }

        csMethod.returnType.parent = csMethod;

        if (classElement.typeParameters && classElement.typeParameters.length > 0) {
            csMethod.typeParameters = [];
            for (const p of classElement.typeParameters) {
                const csp = this.visitTypeParameterDeclaration(csMethod, p);
                csMethod.typeParameters!.push(csp);
            }
        }

        for (const p of classElement.parameters) {
            this.visitMethodParameter(csMethod, p);
        }

        if (classElement.body && !csMethod.skipEmit) {
            csMethod.body = this.visitBlock(csMethod, classElement.body);
        }

        switch (csMethod.name) {
            case this.context.toMethodName('toString'):
                if (csMethod.parameters.length === 0) {
                    csMethod.isVirtual = false;
                    csMethod.isOverride = true;
                }
                break;
            case this.context.toMethodName('equals'):
                if (csMethod.parameters.length === 1) {
                    csMethod.isVirtual = false;
                    csMethod.isOverride = true;
                }
                break;
        }

        if (!csMethod.skipEmit) {
            parent.members.push(csMethod);
        }

        this.context.registerSymbol(csMethod);

        return csMethod;
    }

    protected visitStatement(parent: cs.Node, s: ts.Statement): cs.Statement | null {
        if (this.shouldSkip(s, true)) {
            return null;
        }

        switch (s.kind) {
            case ts.SyntaxKind.EmptyStatement:
                return this.visitEmptyStatement(parent, s as ts.EmptyStatement);
            case ts.SyntaxKind.DebuggerStatement:
                return this.visitDebuggerStatement(parent, s as ts.DebuggerStatement);
            case ts.SyntaxKind.Block:
                return this.visitBlock(parent, s as ts.Block);
            case ts.SyntaxKind.VariableStatement:
                return this.visitVariableStatement(parent, s as ts.VariableStatement);
            case ts.SyntaxKind.ExpressionStatement:
                return this.visitExpressionStatement(parent, s as ts.ExpressionStatement);
            case ts.SyntaxKind.IfStatement:
                return this.visitIfStatement(parent, s as ts.IfStatement);
            case ts.SyntaxKind.DoStatement:
                return this.visitDoStatement(parent, s as ts.DoStatement);
            case ts.SyntaxKind.WhileStatement:
                return this.visitWhileStatement(parent, s as ts.WhileStatement);
            case ts.SyntaxKind.ForStatement:
                return this.visitForStatement(parent, s as ts.ForStatement);
            case ts.SyntaxKind.ForOfStatement:
                return this.visitForOfStatement(parent, s as ts.ForOfStatement);
            case ts.SyntaxKind.ForInStatement:
                return this.visitForInStatement(parent, s as ts.ForInStatement);
            case ts.SyntaxKind.BreakStatement:
                return this.visitBreakStatement(parent, s as ts.BreakStatement);
            case ts.SyntaxKind.ContinueStatement:
                return this.visitContinueStatement(parent, s as ts.ContinueStatement);
            case ts.SyntaxKind.ReturnStatement:
                return this.visitReturnStatement(parent, s as ts.ReturnStatement);
            case ts.SyntaxKind.WithStatement:
                this.context.addTsNodeDiagnostics(s, 'With statement is not supported', ts.DiagnosticCategory.Error);
                return {} as cs.ThrowStatement;
            case ts.SyntaxKind.SwitchStatement:
                return this.visitSwitchStatement(parent, s as ts.SwitchStatement);
            case ts.SyntaxKind.LabeledStatement:
                this.context.addTsNodeDiagnostics(s, 'Labeled statement is not supported', ts.DiagnosticCategory.Error);
                return {} as cs.ThrowStatement;
            case ts.SyntaxKind.ThrowStatement:
                return this.visitThrowStatement(parent, s as ts.ThrowStatement);
            case ts.SyntaxKind.TryStatement:
                return this.visitTryStatement(parent, s as ts.TryStatement);

            case ts.SyntaxKind.FunctionDeclaration:
                return this.visitFunctionDeclaration(parent, s as ts.FunctionDeclaration);
        }
        return {} as cs.ThrowStatement;
    }

    protected visitEmptyStatement(parent: cs.Node, s: ts.EmptyStatement) {
        return {
            nodeType: cs.SyntaxKind.EmptyStatement,
            parent: parent,
            tsNode: s
        } as cs.EmptyStatement;
    }
    protected visitDebuggerStatement(parent: cs.Node, s: ts.DebuggerStatement) {
        return {} as cs.ThrowStatement;

        // {
        //     nodeType: cs.SyntaxKind.ExpressionStatement,
        //     parent: parent,
        //     tsNode: s,
        //     expression: {} as cs.Expression // TOOD: call System.Diagnostics.Debugger.Break();
        // } as cs.ExpressionStatement;
    }

    protected visitBlock(parent: cs.Node, block: ts.Block): cs.Block {
        const csBlock: cs.Block = {
            nodeType: cs.SyntaxKind.Block,
            parent: parent,
            statements: [],
            tsNode: block
        };

        for (const s of block.statements) {
            const csStatement = this.visitStatement(csBlock, s);
            if (csStatement) {
                csBlock.statements.push(csStatement);
            }
        }

        return csBlock;
    }

    protected visitVariableStatement(parent: cs.Node, s: ts.VariableStatement) {
        const variableStatement = {
            nodeType: cs.SyntaxKind.VariableStatement,
            parent: parent,
            tsNode: s,
            declarationList: {} as cs.VariableDeclarationList,
            variableStatementKind: cs.VariableStatementKind.Normal
        } as cs.VariableStatement;

        variableStatement.declarationList = this.visitVariableDeclarationList(variableStatement, s.declarationList);

        if ((s.declarationList.flags & ts.NodeFlags.Const) !== 0) {
            variableStatement.variableStatementKind = cs.VariableStatementKind.Const;
        } else if ((s.declarationList.flags & ts.NodeFlags.Using) !== 0) {
            variableStatement.variableStatementKind = cs.VariableStatementKind.Using;
        } else if ((s.declarationList.flags & ts.NodeFlags.AwaitUsing) !== 0) {
            variableStatement.variableStatementKind = cs.VariableStatementKind.AwaitUsing;
        }

        return variableStatement;
    }

    protected visitVariableDeclarationList(parent: cs.Node, s: ts.VariableDeclarationList): cs.VariableDeclarationList {
        const variableStatement = {
            nodeType: cs.SyntaxKind.VariableDeclarationList,
            parent: parent,
            tsNode: s,
            declarations: [],
            isConst: (s.flags & ts.NodeFlags.Const) !== 0
        } as cs.VariableDeclarationList;

        for (const d of s.declarations) {
            variableStatement.declarations.push(this.visitVariableDeclaration(variableStatement, d));
        }

        return variableStatement;
    }
    protected visitVariableDeclaration(parent: cs.Node, s: ts.VariableDeclaration): cs.VariableDeclaration {
        const variableStatement = {
            nodeType: cs.SyntaxKind.VariableDeclaration,
            parent: parent,
            tsNode: s,
            name: '',
            type: {} as cs.TypeNode
        } as cs.VariableDeclaration;

        if (ts.isIdentifier(s.name)) {
            const symbol = this.context.typeChecker.getSymbolAtLocation(s.name);
            const type = this.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, s);

            variableStatement.name = s.name.text;
            if (cs.isCatchClause(parent)) {
                variableStatement.type = {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: variableStatement,
                    tsNode: s,
                    reference: this.context.makeExceptionType(),
                    isAsync: false
                } as cs.TypeReference;
            } else {
                variableStatement.type = this.createUnresolvedTypeNode(variableStatement, s.type ?? s, type);
            }

            variableStatement.type.parent = variableStatement;

            if (s.initializer) {
                this.declarationOrAssignmentTypeStack.push(type);
                variableStatement.initializer = this.visitExpression(variableStatement, s.initializer) ?? undefined;
                this.declarationOrAssignmentTypeStack.pop();
            }
        } else if (ts.isArrayBindingPattern(s.name)) {
            variableStatement.type = this.createVarTypeNode(variableStatement, s.type ?? s);
            variableStatement.deconstructNames = [];
            for (const el of s.name.elements) {
                if (ts.isOmittedExpression(el)) {
                    variableStatement.deconstructNames.push('_');
                } else if (ts.isBindingElement(el)) {
                    variableStatement.deconstructNames.push((el.name as ts.Identifier).text);
                }
            }

            if (s.initializer) {
                const type = this.context.typeChecker.getTypeAtLocation(s);
                this.declarationOrAssignmentTypeStack.push(type);
                variableStatement.initializer = this.visitExpression(variableStatement, s.initializer) ?? undefined;
                this.declarationOrAssignmentTypeStack.pop();
            }
        }

        return variableStatement;
    }

    protected visitExpressionStatement(parent: cs.Node, s: ts.ExpressionStatement) {
        const expressionStatement = {
            nodeType: cs.SyntaxKind.ExpressionStatement,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression
        } as cs.ExpressionStatement;

        expressionStatement.expression = this.visitExpression(expressionStatement, s.expression)!;
        if (!expressionStatement.expression) {
            return null;
        }

        return expressionStatement;
    }

    protected visitIfStatement(parent: cs.Node, s: ts.IfStatement) {
        const ifStatement = {
            nodeType: cs.SyntaxKind.IfStatement,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression,
            thenStatement: {} as cs.Statement
        } as cs.IfStatement;

        ifStatement.expression = this.visitExpression(ifStatement, s.expression)!;
        if (!ifStatement.expression) {
            return null;
        }
        ifStatement.thenStatement = this.visitStatement(ifStatement, s.thenStatement)!;
        if (!ifStatement.thenStatement) {
            return null;
        }

        if (s.elseStatement) {
            ifStatement.elseStatement = this.visitStatement(ifStatement, s.elseStatement)!;
            if (!ifStatement.elseStatement) {
                return null;
            }
        }

        return ifStatement;
    }

    protected visitDoStatement(parent: cs.Node, s: ts.DoStatement) {
        const doStatement = {
            nodeType: cs.SyntaxKind.DoStatement,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression,
            statement: {} as cs.Statement
        } as cs.DoStatement;

        doStatement.expression = this.visitExpression(doStatement, s.expression)!;
        if (!doStatement.expression) {
            return null;
        }

        doStatement.statement = this.visitStatement(doStatement, s.statement)!;
        if (!doStatement.statement) {
            return null;
        }

        return doStatement;
    }

    protected visitWhileStatement(parent: cs.Node, s: ts.WhileStatement) {
        const whileStatement = {
            nodeType: cs.SyntaxKind.WhileStatement,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression,
            statement: {} as cs.Statement
        } as cs.WhileStatement;

        whileStatement.expression = this.visitExpression(whileStatement, s.expression)!;
        if (!whileStatement.expression) {
            return null;
        }

        whileStatement.statement = this.visitStatement(whileStatement, s.statement)!;
        if (!whileStatement.statement) {
            return null;
        }

        return whileStatement;
    }

    protected visitForStatement(parent: cs.Node, s: ts.ForStatement) {
        const forStatement = {
            nodeType: cs.SyntaxKind.ForStatement,
            parent: parent,
            tsNode: s,
            statement: {} as cs.Statement
        } as cs.ForStatement;

        if (s.initializer) {
            if (ts.isVariableDeclarationList(s.initializer)) {
                forStatement.initializer = this.visitVariableDeclarationList(forStatement, s.initializer);
            } else {
                forStatement.initializer = this.visitExpression(forStatement, s.initializer)!;
                if (!forStatement.initializer) {
                    return null;
                }
            }
        }
        if (s.condition) {
            forStatement.condition = this.visitExpression(forStatement, s.condition)!;
            if (!forStatement.condition) {
                return null;
            }
        }

        if (s.incrementor) {
            forStatement.incrementor = this.visitExpression(forStatement, s.incrementor)!;
            if (!forStatement.incrementor) {
                return null;
            }
        }

        forStatement.statement = this.visitStatement(forStatement, s.statement)!;
        if (!forStatement.statement) {
            return null;
        }

        return forStatement;
    }

    protected visitForOfStatement(parent: cs.Node, s: ts.ForOfStatement) {
        const forEachStatement = {
            nodeType: cs.SyntaxKind.ForEachStatement,
            parent: parent,
            tsNode: s,
            statement: {} as cs.Statement,
            expression: {} as cs.Expression,
            initializer: {} as cs.VariableDeclaration
        } as cs.ForEachStatement;

        if (ts.isVariableDeclarationList(s.initializer)) {
            forEachStatement.initializer = this.visitVariableDeclarationList(forEachStatement, s.initializer);
        } else {
            forEachStatement.initializer = this.visitExpression(forEachStatement, s.initializer)!;
            if (!forEachStatement.initializer) {
                return null;
            }
        }

        forEachStatement.expression = this.visitExpression(forEachStatement, s.expression)!;
        if (!forEachStatement.expression) {
            return null;
        }
        forEachStatement.statement = this.visitStatement(forEachStatement, s.statement)!;
        if (!forEachStatement.statement) {
            return null;
        }

        return forEachStatement;
    }
    protected visitForInStatement(parent: cs.Node, s: ts.ForInStatement) {
        // TODO: Detect raw object iteration and map it
        const forEachStatement = {
            nodeType: cs.SyntaxKind.ForEachStatement,
            parent: parent,
            tsNode: s,
            statement: {} as cs.Statement,
            expression: {} as cs.Expression,
            initializer: {} as cs.VariableDeclaration
        } as cs.ForEachStatement;

        if (ts.isVariableDeclarationList(s.initializer)) {
            forEachStatement.initializer = this.visitVariableDeclarationList(forEachStatement, s.initializer);
        } else {
            forEachStatement.initializer = this.visitExpression(forEachStatement, s.initializer)!;
            if (!forEachStatement.initializer) {
                return null;
            }
        }

        forEachStatement.expression = this.visitExpression(forEachStatement, s.expression)!;
        if (!forEachStatement.expression) {
            return null;
        }
        forEachStatement.statement = this.visitStatement(forEachStatement, s.statement)!;
        if (!forEachStatement.statement) {
            return null;
        }

        return forEachStatement;
    }

    protected visitBreakStatement(parent: cs.Node, s: ts.BreakStatement) {
        const breakStatement = {
            nodeType: cs.SyntaxKind.BreakStatement,
            parent: parent,
            tsNode: s
        } as cs.BreakStatement;

        return breakStatement;
    }

    protected visitContinueStatement(parent: cs.Node, s: ts.ContinueStatement) {
        const continueStatement = {
            nodeType: cs.SyntaxKind.ContinueStatement,
            parent: parent,
            tsNode: s
        } as cs.ContinueStatement;

        return continueStatement;
    }

    protected visitReturnStatement(parent: cs.Node, s: ts.ReturnStatement) {
        const returnStatement = {
            nodeType: cs.SyntaxKind.ReturnStatement,
            parent: parent,
            tsNode: s
        } as cs.ReturnStatement;

        if (s.expression) {
            returnStatement.expression = this.visitExpression(returnStatement, s.expression)!;
            if (!returnStatement.expression) {
                return null;
            }
        }

        return returnStatement;
    }

    protected visitSwitchStatement(parent: cs.Node, s: ts.SwitchStatement) {
        const switchStatement = {
            nodeType: cs.SyntaxKind.SwitchStatement,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression,
            caseClauses: []
        } as cs.SwitchStatement;

        switchStatement.expression = this.visitExpression(switchStatement, s.expression)!;
        if (!switchStatement.expression) {
            return null;
        }

        for (const c of s.caseBlock.clauses) {
            if (ts.isDefaultClause(c)) {
                switchStatement.caseClauses.push(this.visitDefaultClause(switchStatement, c));
            } else {
                const cl = this.visitCaseClause(switchStatement, c);
                if (cl) {
                    switchStatement.caseClauses.push(cl);
                }
            }
        }

        return switchStatement;
    }

    protected visitDefaultClause(parent: cs.SwitchStatement, s: ts.DefaultClause): cs.DefaultClause {
        const defaultClause = {
            nodeType: cs.SyntaxKind.DefaultClause,
            parent: parent,
            tsNode: s,
            statements: []
        } as cs.DefaultClause;

        for (const c of s.statements) {
            const statement = this.visitStatement(defaultClause, c);
            if (statement) {
                defaultClause.statements.push(statement);
            }
        }

        return defaultClause;
    }

    protected visitCaseClause(parent: cs.SwitchStatement, s: ts.CaseClause) {
        if (this.shouldSkip(s, true)) {
            return null;
        }

        const caseClause = {
            nodeType: cs.SyntaxKind.CaseClause,
            parent: parent,
            tsNode: s,
            expression: {} as cs.Expression,
            statements: []
        } as cs.CaseClause;

        caseClause.expression = this.visitExpression(caseClause, s.expression)!;
        if (!caseClause.expression) {
            return null;
        }
        for (const c of s.statements) {
            const statement = this.visitStatement(caseClause, c);
            if (statement) {
                caseClause.statements.push(statement);
            }
        }

        return caseClause;
    }

    protected visitThrowStatement(parent: cs.Node, s: ts.ThrowStatement) {
        const throwStatement = {
            nodeType: cs.SyntaxKind.ThrowStatement,
            parent: parent,
            tsNode: s
        } as cs.ThrowStatement;

        if (s.expression) {
            throwStatement.expression = this.visitExpression(throwStatement, s.expression)!;
            if (!throwStatement.expression) {
                return null;
            }
        }

        return throwStatement;
    }
    protected visitTryStatement(parent: cs.Node, s: ts.TryStatement) {
        const tryStatement = {
            nodeType: cs.SyntaxKind.TryStatement,
            parent: parent,
            tsNode: s,
            tryBlock: {} as cs.Block
        } as cs.TryStatement;

        tryStatement.tryBlock = this.visitBlock(tryStatement, s.tryBlock);
        if (s.catchClause) {
            tryStatement.catchClauses = [
                // TODO: detect type checks and convert them to catch clauses
                this.visitCatchClause(tryStatement, s.catchClause)
            ];
        }

        if (s.finallyBlock) {
            tryStatement.finallyBlock = this.visitBlock(tryStatement, s.finallyBlock);
        }

        return tryStatement;
    }

    protected visitCatchClause(parent: cs.TryStatement, s: ts.CatchClause): cs.CatchClause {
        const catchClause = {
            nodeType: cs.SyntaxKind.CatchClause,
            parent: parent,
            tsNode: s,
            variableDeclaration: {} as cs.VariableDeclaration,
            block: {} as cs.Block
        } as cs.CatchClause;

        catchClause.variableDeclaration = this.visitVariableDeclaration(catchClause, s.variableDeclaration!);
        catchClause.block = this.visitBlock(catchClause, s.block);

        return catchClause;
    }

    protected visitMethodSignature(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodSignature
    ): cs.MethodDeclaration {
        const signature = this.context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);

        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            isTestMethod: false,
            isGeneratorFunction: false,
            partial: !!ts.getJSDocTags(classElement).find(t => t.tagName.text === 'partial'),
            name: this.context.buildMethodName(classElement.name),
            parameters: [],
            returnType: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType),
            visibility: cs.Visibility.None,
            tsNode: classElement,
            skipEmit: this.shouldSkip(classElement, false)
        };

        if (classElement.name) {
            csMethod.documentation = this.visitDocumentation(classElement.name);
        }

        this.visitDocumentationAttributes(csMethod, classElement);
        csMethod.returnType.parent = csMethod;

        if (classElement.typeParameters && classElement.typeParameters.length > 0) {
            csMethod.typeParameters = [];
            for (const p of classElement.typeParameters) {
                const csp = {
                    parent: csMethod,
                    name: p.name.text,
                    nodeType: cs.SyntaxKind.TypeParameterDeclaration,
                    tsNode: p
                } as cs.TypeParameterDeclaration;
                if (p.constraint) {
                    csp.constraint = this.createUnresolvedTypeNode(csp, p.constraint);
                }

                csMethod.typeParameters!.push(csp);
            }
        }

        for (const p of classElement.parameters) {
            this.visitMethodParameter(csMethod, p);
        }

        if (!csMethod.skipEmit) {
            parent.members.push(csMethod);
        }

        this.context.registerSymbol(csMethod);

        return csMethod;
    }
    protected mapVisibility(node: ts.Node, fallback: cs.Visibility): cs.Visibility {
        if (this.context.isInternal(node)) {
            return cs.Visibility.Internal;
        }

        if ('modifiers' in node && node.modifiers) {
            for (const m of node.modifiers as ts.NodeArray<ts.Modifier>) {
                switch (m.kind) {
                    case ts.SyntaxKind.PublicKeyword:
                        return cs.Visibility.Public;
                    case ts.SyntaxKind.PrivateKeyword:
                        return cs.Visibility.Private;
                    case ts.SyntaxKind.ProtectedKeyword:
                        return cs.Visibility.Protected;
                }
            }
        }
        return fallback;
    }
    protected visitMethodParameter(parent: cs.MethodDeclarationBase, p: ts.ParameterDeclaration): void {
        parent.parameters.push(this.makeParameter(parent, p));
    }

    protected makeParameter(csMethod: cs.Node, p: ts.ParameterDeclaration): cs.ParameterDeclaration {
        const symbol = this.context.typeChecker.getSymbolAtLocation(p.name);
        const type = this.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, p);

        const csParameter: cs.ParameterDeclaration = {
            nodeType: cs.SyntaxKind.ParameterDeclaration,
            name: (p.name as ts.Identifier).text,
            parent: csMethod,
            type: this.createUnresolvedTypeNode(null, p.type ?? p, type),
            tsNode: p,
            params: !!p.dotDotDotToken,
            isOptional: !!p.questionToken
        };
        csParameter.type!.parent = csParameter;

        if (p.initializer) {
            csParameter.initializer = this.visitExpression(csParameter, p.initializer) ?? undefined;
            if (csParameter.initializer && cs.isNullLiteral(csParameter.initializer)) {
                csParameter.type!.isNullable = true;
            }
        }

        if (p.name) {
            csParameter.documentation = this.visitDocumentation(p.name);
        }
        return csParameter;
    }

    protected visitConstructorDeclaration(parent: cs.ClassDeclaration, classElement: ts.ConstructorDeclaration) {
        const csConstructor: cs.ConstructorDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.ConstructorDeclaration,
            name: '.ctor',
            parameters: [],
            isStatic: false,
            visibility: this.mapVisibility(classElement, cs.Visibility.Public),
            tsNode: classElement,
            skipEmit: this.shouldSkip(classElement, false)
        };

        for (const p of classElement.parameters) {
            this.visitMethodParameter(csConstructor, p);
        }

        if (classElement.body) {
            csConstructor.body = this.visitBlock(csConstructor, classElement.body);
            const block = csConstructor.body as cs.Block;
            if (
                block.statements.length > 0 &&
                cs.isExpressionStatement(block.statements[0]) &&
                cs.isInvocationExpression((block.statements[0] as cs.ExpressionStatement).expression) &&
                cs.isBaseLiteralExpression(
                    ((block.statements[0] as cs.ExpressionStatement).expression as cs.InvocationExpression).expression
                )
            ) {
                csConstructor.baseConstructorArguments = (
                    (block.statements[0] as cs.ExpressionStatement).expression as cs.InvocationExpression
                ).arguments;
                block.statements.shift();

                // subclassing errors with cause forwarding
                if (
                    csConstructor.baseConstructorArguments.length === 2 &&
                    cs.isAnonymousObjectCreationExpression(csConstructor.baseConstructorArguments[1]) &&
                    !!csConstructor.baseConstructorArguments[1].properties.find(p => p.name === 'cause')
                ) {
                    csConstructor.baseConstructorArguments[1] =
                        csConstructor.baseConstructorArguments[1].properties.find(p => p.name === 'cause')!.value;
                }
            }
        }

        parent.members.push(csConstructor);
        return csConstructor;
    }

    protected visitExpression(parent: cs.Node, expression: ts.Expression): cs.Expression | null {
        switch (expression.kind) {
            case ts.SyntaxKind.PrefixUnaryExpression:
                return this.visitPrefixUnaryExpression(parent, expression as ts.PrefixUnaryExpression);
            case ts.SyntaxKind.PostfixUnaryExpression:
                return this.visitPostfixUnaryExpression(parent, expression as ts.PostfixUnaryExpression);
            case ts.SyntaxKind.NullKeyword:
                return this.visitNullLiteral(parent, expression as ts.NullLiteral);
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
                return this.visitBooleanLiteral(parent, expression as ts.BooleanLiteral);
            case ts.SyntaxKind.ThisKeyword:
                return this.visitThisExpression(parent, expression as ts.ThisExpression);
            case ts.SyntaxKind.SuperKeyword:
                return this.visitSuperLiteralExpression(parent, expression as ts.SuperExpression);
            case ts.SyntaxKind.TypeOfExpression:
                return this.visitTypeOfExpression(parent, expression as ts.TypeOfExpression);
            case ts.SyntaxKind.AwaitExpression:
                return this.visitAwaitExpression(parent, expression as ts.AwaitExpression);
            case ts.SyntaxKind.BinaryExpression:
                return this.visitBinaryExpression(parent, expression as ts.BinaryExpression);
            case ts.SyntaxKind.ConditionalExpression:
                return this.visitConditionalExpression(parent, expression as ts.ConditionalExpression);
            case ts.SyntaxKind.FunctionExpression:
                return this.visitFunctionExpression(parent, expression as ts.FunctionExpression);
            case ts.SyntaxKind.ArrowFunction:
                return this.visitArrowExpression(parent, expression as ts.ArrowFunction);
            case ts.SyntaxKind.RegularExpressionLiteral:
                return this.visitRegularExpressionLiteral(parent, expression as ts.RegularExpressionLiteral);
            case ts.SyntaxKind.NumericLiteral:
                return this.visitNumericLiteral(parent, expression as ts.NumericLiteral);
            case ts.SyntaxKind.BigIntLiteral:
                return this.visitBigIntLiteral(parent, expression as ts.BigIntLiteral);
            case ts.SyntaxKind.TemplateExpression:
                return this.visitTemplateExpression(parent, expression as ts.TemplateExpression);
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                return this.visitNoSubstitutionTemplateLiteral(parent, expression as ts.NoSubstitutionTemplateLiteral);
            case ts.SyntaxKind.TypeAssertionExpression:
                return this.visitTypeAssertionExpression(parent, expression as ts.TypeAssertion);
            case ts.SyntaxKind.ParenthesizedExpression:
                return this.visitParenthesizedExpression(parent, expression as ts.ParenthesizedExpression);
            case ts.SyntaxKind.ArrayLiteralExpression:
                return this.visitArrayLiteralExpression(parent, expression as ts.ArrayLiteralExpression);
            case ts.SyntaxKind.PropertyAccessExpression:
                return this.visitPropertyAccessExpression(parent, expression as ts.PropertyAccessExpression);
            case ts.SyntaxKind.ObjectLiteralExpression:
                return this.visitObjectLiteralExpression(parent, expression as ts.ObjectLiteralExpression);
            case ts.SyntaxKind.ElementAccessExpression:
                return this.visitElementAccessExpression(parent, expression as ts.ElementAccessExpression);
            case ts.SyntaxKind.CallExpression:
                return this.visitCallExpression(parent, expression as ts.CallExpression);
            case ts.SyntaxKind.NewExpression:
                return this.visitNewExpression(parent, expression as ts.NewExpression);
            case ts.SyntaxKind.AsExpression:
                return this.visitAsExpression(parent, expression as ts.AsExpression);
            case ts.SyntaxKind.NonNullExpression:
                return this.visitNonNullExpression(parent, expression as ts.NonNullExpression);
            case ts.SyntaxKind.Identifier:
                return this.visitIdentifier(parent, expression as ts.Identifier);
            case ts.SyntaxKind.StringLiteral:
                return this.visitStringLiteral(parent, expression as ts.Identifier);
            case ts.SyntaxKind.SpreadElement:
                return this.visitSpreadElement(parent, expression as ts.SpreadElement);
            case ts.SyntaxKind.YieldExpression:
                return this.visitYieldExpression(parent, expression as ts.YieldExpression);

            // case ts.SyntaxKind.SyntheticReferenceExpression:
            // case ts.SyntaxKind.CommaListExpression:
            // case ts.SyntaxKind.ClassExpression:
            // case ts.SyntaxKind.JSDocTypeExpression:
            // case ts.SyntaxKind.JsxExpression:
            // case ts.SyntaxKind.OmittedExpression:
            // case ts.SyntaxKind.PartiallyEmittedExpression:
            // case ts.SyntaxKind.ImportKeyword:
            // case ts.SyntaxKind.DeleteExpression:
            // case ts.SyntaxKind.VoidExpression:
            // case ts.SyntaxKind.SyntheticExpression:
            // case ts.SyntaxKind.TaggedTemplateExpression:
            default:
                this.context.addTsNodeDiagnostics(
                    expression,
                    `Unsupported expression type ${ts.SyntaxKind[expression.kind]}`,
                    ts.DiagnosticCategory.Error
                );
                break;
        }

        return {
            nodeType: cs.SyntaxKind.ToDoExpression,
            parent: parent,
            tsNode: expression
        } as cs.Expression;
    }
    protected visitSpreadElement(parent: cs.Node, expression: ts.SpreadElement): cs.SpreadExpression {
        return {
            nodeType: cs.SyntaxKind.SpreadExpression,
            expression: this.visitExpression(parent, expression.expression)
        } as cs.SpreadExpression;
    }

    protected visitPrefixUnaryExpression(parent: cs.Node, expression: ts.PrefixUnaryExpression) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.PrefixUnaryExpression,
            operand: {} as cs.Expression,
            operator: this.mapOperator(expression.operator)
        } as cs.PrefixUnaryExpression;

        csExpr.operand = this.visitExpression(csExpr, expression.operand)!;
        if (!csExpr.operand) {
            return null;
        }

        if (csExpr.operator === '~') {
            csExpr.operand = this.makeInt(csExpr.operand, true);
        }

        // ensure number literals assigned to any/unknown
        // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
        if (this.context.isUnknownSmartCast(expression)) {
            return this.wrapIntoCastToTargetType(csExpr);
        }

        return csExpr;
    }

    public wrapIntoCastToTargetType(expression: cs.Expression): cs.Expression {
        const actualType = this.context.typeChecker.getTypeAtLocation(expression.tsNode!);
        const cast = {
            parent: expression.parent,
            nodeType: cs.SyntaxKind.CastExpression,
            tsNode: expression.tsNode,
            expression: expression,
            type: this.createUnresolvedTypeNode(null, expression.tsNode!, actualType)
        } as cs.CastExpression;

        cast.expression.parent = cast;
        cast.type.parent = cast;
        return cast;
    }

    protected visitPostfixUnaryExpression(parent: cs.Node, expression: ts.PostfixUnaryExpression) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.PostfixUnaryExpression,
            operand: {} as cs.Expression,
            operator: this.mapOperator(expression.operator)
        } as cs.PostfixUnaryExpression;

        csExpr.operand = this.visitExpression(csExpr, expression.operand)!;
        if (!csExpr.operand) {
            return null;
        }

        return csExpr;
    }

    protected visitNullLiteral(parent: cs.Node, expression: ts.NullLiteral) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NullLiteral
        } as cs.NullLiteral;

        return csExpr;
    }

    protected visitBooleanLiteral(parent: cs.Node, expression: ts.BooleanLiteral) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType:
                expression.kind === ts.SyntaxKind.TrueKeyword ? cs.SyntaxKind.TrueLiteral : cs.SyntaxKind.FalseLiteral
        } as cs.BooleanLiteral;

        return csExpr;
    }

    protected visitThisExpression(parent: cs.Node, expression: ts.ThisExpression) {
        if (cs.isMemberAccessExpression(parent) && parent.tsSymbol && this.context.isStaticSymbol(parent.tsSymbol)) {
            const identifier = {
                parent: parent,
                tsNode: expression,
                tsSymbol: this.context.typeChecker.getSymbolAtLocation(expression),
                nodeType: cs.SyntaxKind.Identifier,
                text: parent.tsSymbol.name
            } as cs.Identifier;

            return identifier;
        }
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.ThisLiteral
        } as cs.ThisLiteral;

        return csExpr;
    }

    protected visitSuperLiteralExpression(parent: cs.Node, expression: ts.SuperExpression) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.BaseLiteralExpression
        } as cs.BaseLiteralExpression;

        return csExpr;
    }

    protected visitTypeOfExpression(parent: cs.Node, expression: ts.TypeOfExpression) {
        // AlphaTab.Core.TypeHelper.TypeOf(expr)
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.InvocationExpression,
            arguments: [],
            expression: {} as cs.Expression
        } as cs.InvocationExpression;

        csExpr.expression = this.makeMemberAccess(
            csExpr,
            this.context.makeTypeName('alphaTab.core.TypeHelper'),
            this.context.toMethodName('typeOf')
        );
        const e = this.visitExpression(csExpr, expression.expression);
        if (e) {
            csExpr.arguments.push(e);
        }

        return csExpr;
    }

    protected makeMemberAccess(parent: cs.Node, identifier: string, member: string): cs.Node {
        const memberAccess = {
            expression: {
                nodeType: cs.SyntaxKind.Identifier,
                text: identifier,
                parent: null
            } as cs.Identifier,
            member: member,
            parent: parent,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;

        memberAccess.parent = memberAccess;

        return memberAccess;
    }

    protected visitAwaitExpression(parent: cs.Node, expression: ts.AwaitExpression) {
        const awaitExpression = {
            parent: parent,
            nodeType: cs.SyntaxKind.AwaitExpression,
            tsNode: expression,
            expression: {} as cs.Expression
        } as cs.AwaitExpression;

        awaitExpression.expression = this.visitExpression(awaitExpression, expression.expression)!;
        if (!awaitExpression.expression) {
            return null;
        }

        return awaitExpression;
    }

    protected visitBinaryExpression(parent: cs.Node, expression: ts.BinaryExpression) {
        if (expression.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            // AlphaTab.Core.TypeHelper.In('Text', expr)
            const csExpr = {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.InvocationExpression,
                arguments: [],
                expression: {} as cs.Expression
            } as cs.InvocationExpression;

            csExpr.expression = this.makeMemberAccess(
                csExpr,
                this.context.makeTypeName('alphaTab.core.TypeHelper'),
                this.context.toMethodName('in')
            );

            let e = this.visitExpression(csExpr, expression.left)!;
            if (e) {
                csExpr.arguments.push(e);
            }
            e = this.visitExpression(csExpr, expression.right)!;
            if (e) {
                csExpr.arguments.push(e);
            }

            return csExpr;
        }

        if (expression.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            const csExpr = {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.IsExpression,
                expression: null!,
                type: null!
            } as cs.IsExpression;

            csExpr.expression = this.visitExpression(csExpr, expression.left)!;
            csExpr.type = this.createUnresolvedTypeNode(
                csExpr,
                expression.right,
                this.context.typeChecker.getTypeAtLocation(expression.right),
                this.context.typeChecker.getSymbolAtLocation(expression.right)
            );

            return csExpr;
        }

        if (expression.operatorToken.kind === ts.SyntaxKind.AsteriskAsteriskToken) {
            this.context.addTsNodeDiagnostics(
                expression,
                'Exponentiation expresssions are not yet supported',
                ts.DiagnosticCategory.Error
            );
            return {
                nodeType: cs.SyntaxKind.ToDoExpression,
                parent: parent,
                tsNode: expression
            } as cs.ToDoExpression;
        }

        if (
            expression.operatorToken.kind === ts.SyntaxKind.BarEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.BarBarEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.CaretEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.LessThanLessThanEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.GreaterThanGreaterThanEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.AmpersandEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken
        ) {
            // x >>= 3; => x = ((int)x) >> (3);
            const assignment = {
                parent: parent,
                nodeType: cs.SyntaxKind.BinaryExpression,
                tsNode: expression,
                left: {} as cs.Expression,
                right: {} as cs.Expression,
                operator: '='
            } as cs.BinaryExpression;
            assignment.left = this.visitExpression(assignment, expression.left)!;
            if (!assignment.left) {
                return null;
            }

            const bitOp = {
                parent: assignment,
                nodeType: cs.SyntaxKind.BinaryExpression,
                tsNode: expression,
                left: {
                    parent: null,
                    nodeType: cs.SyntaxKind.ParenthesizedExpression,
                    expression: {} as cs.Expression,
                    tsNode: expression
                } as cs.ParenthesizedExpression,
                right: {
                    parent: null,
                    nodeType: cs.SyntaxKind.ParenthesizedExpression,
                    expression: {} as cs.Expression,
                    tsNode: expression
                } as cs.ParenthesizedExpression,
                operator: ''
            } as cs.BinaryExpression;

            assignment.right = bitOp;
            bitOp.right.parent = bitOp;

            switch (expression.operatorToken.kind) {
                case ts.SyntaxKind.BarBarEqualsToken:
                    bitOp.operator = '||';
                    break;
                case ts.SyntaxKind.BarEqualsToken:
                    bitOp.operator = '|';
                    break;
                case ts.SyntaxKind.CaretEqualsToken:
                    bitOp.operator = '^';
                    break;
                case ts.SyntaxKind.LessThanLessThanEqualsToken:
                    bitOp.operator = '<<';
                    break;
                case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                    bitOp.operator = '>>';
                    break;
                case ts.SyntaxKind.AmpersandEqualsToken:
                    bitOp.operator = '&';
                    break;
                case ts.SyntaxKind.AmpersandAmpersandEqualsToken:
                    bitOp.operator = '&&';
                    break;
            }

            const leftType = this.context.typeChecker.getTypeAtLocation(expression.left);
            const rightType = this.context.typeChecker.getTypeAtLocation(expression.right);

            const isLeftEnum = leftType.flags & ts.TypeFlags.Enum || leftType.flags & ts.TypeFlags.EnumLiteral;
            const isRightEnum = rightType.flags & ts.TypeFlags.Enum || rightType.flags & ts.TypeFlags.EnumLiteral;

            if (!isLeftEnum || !isRightEnum) {
                const toInt = {
                    parent: bitOp,
                    nodeType: cs.SyntaxKind.CastExpression,
                    expression: {} as cs.Expression,
                    type: {
                        parent: null,
                        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                        type: cs.PrimitiveType.Int,
                        tsNode: expression
                    } as cs.PrimitiveTypeNode,
                    tsNode: expression
                } as cs.CastExpression;
                (bitOp.left as cs.ParenthesizedExpression).expression = toInt;
                toInt.expression = this.visitExpression(assignment, expression.left)!;
                if (!toInt.expression) {
                    return null;
                }

                (bitOp.right as cs.ParenthesizedExpression).expression = this.visitExpression(
                    bitOp.right,
                    expression.right
                )!;

                if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
                    return null;
                }
            } else {
                (bitOp.left as cs.ParenthesizedExpression).expression = this.visitExpression(
                    assignment,
                    expression.left
                )!;

                if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
                    return null;
                }

                (bitOp.right as cs.ParenthesizedExpression).expression = this.visitExpression(
                    bitOp.right,
                    expression.right
                )!;

                if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
                    return null;
                }
            }

            assignment.right = this.makeDouble(assignment.right);
            return assignment;
        }
        const binaryExpression = {
            parent: parent,
            nodeType: cs.SyntaxKind.BinaryExpression,
            tsNode: expression,
            left: {} as cs.Expression,
            right: {} as cs.Expression,
            operator: this.mapOperator(expression.operatorToken.kind)
        } as cs.BinaryExpression;

        binaryExpression.left = this.visitExpression(binaryExpression, expression.left)!;
        if (!binaryExpression.left) {
            return null;
        }

        binaryExpression.right = this.visitExpression(binaryExpression, expression.right)!;
        if (!binaryExpression.right) {
            return null;
        }

        const leftType = this.context.typeChecker.getTypeAtLocation(expression.left);
        const rightType = this.context.typeChecker.getTypeAtLocation(expression.right);

        const isLeftEnum = this.context.isEnum(leftType);
        const isRightEnum = this.context.isEnum(rightType);

        if (!isLeftEnum || !isRightEnum) {
            switch (expression.operatorToken.kind) {
                case ts.SyntaxKind.PlusToken:
                case ts.SyntaxKind.PlusEqualsToken:
                    // string and number concatenation
                    if (
                        leftType.flags & ts.TypeFlags.Number &&
                        rightType.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)
                    ) {
                        binaryExpression.left = this.toInvariantString(binaryExpression.left);
                    } else if (
                        rightType.flags & ts.TypeFlags.Number &&
                        leftType.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)
                    ) {
                        binaryExpression.right = this.toInvariantString(binaryExpression.right);
                    } else {
                        // number arithmetics
                        if (isLeftEnum) {
                            binaryExpression.left = this.makeDouble(binaryExpression.left);
                        }
                        if (isRightEnum) {
                            binaryExpression.right = this.makeDouble(binaryExpression.right);
                        }
                    }
                    break;
                case ts.SyntaxKind.AmpersandToken:
                case ts.SyntaxKind.GreaterThanGreaterThanToken:
                case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                case ts.SyntaxKind.LessThanLessThanToken:
                case ts.SyntaxKind.BarToken:
                case ts.SyntaxKind.CaretToken:
                    if (!this.hasBinaryOperationMakeInt(binaryExpression.left)) {
                        binaryExpression.left = this.makeInt(binaryExpression.left, true);
                    }

                    if (!this.hasBinaryOperationMakeInt(binaryExpression.right)) {
                        let allowLongOnRight = false;
                        switch (expression.operatorToken.kind) {
                            case ts.SyntaxKind.AmpersandToken:
                            case ts.SyntaxKind.BarToken:
                            case ts.SyntaxKind.CaretToken:
                                allowLongOnRight = true;
                                break;
                            default:
                                allowLongOnRight = false;
                                break;
                        }

                        binaryExpression.right = this.makeInt(binaryExpression.right, allowLongOnRight);
                    }

                    let nextParent = parent;
                    while (cs.isParenthesizedExpression(nextParent)) {
                        nextParent = nextParent.parent!;
                    }

                    if (
                        nextParent.nodeType !== cs.SyntaxKind.BinaryExpression ||
                        (nextParent as cs.BinaryExpression).operator === '='
                    ) {
                        return this.makeDouble(binaryExpression);
                    }
                    break;
                case ts.SyntaxKind.SlashToken:
                case ts.SyntaxKind.AsteriskToken:
                case ts.SyntaxKind.MinusToken:
                    if (expression.left.kind === ts.SyntaxKind.NumericLiteral) {
                        binaryExpression.left = this.makeDouble(binaryExpression.left);
                    } else if (isLeftEnum) {
                        binaryExpression.left = this.makeDouble(binaryExpression.left);
                    }

                    if (expression.right.kind === ts.SyntaxKind.NumericLiteral) {
                        binaryExpression.right = this.makeDouble(binaryExpression.right);
                    } else if (isRightEnum) {
                        binaryExpression.right = this.makeDouble(binaryExpression.right);
                    }

                    break;
            }
        }

        return binaryExpression;
    }

    private hasBinaryOperationMakeInt(left: cs.Expression): boolean {
        if (cs.isParenthesizedExpression(left)) {
            return this.hasBinaryOperationMakeInt(left.expression);
        }

        if (left.nodeType !== cs.SyntaxKind.BinaryExpression) {
            return false;
        }

        switch ((left as cs.BinaryExpression).operator) {
            case '&':
            case '>>':
            case '>>>':
            case '<<':
            case '^':
            case '|':
                return true;
        }

        return false;
    }

    protected makeDouble(expression: cs.Expression): cs.Expression {
        // (double)(expr)

        let targetType = cs.PrimitiveType.Double;
        if (expression.tsNode) {
            const nodeType = this.context.getType(expression.tsNode);

            // no casting on bools
            if ((nodeType.flags & ts.TypeFlags.Boolean) !== 0 || (nodeType.flags & ts.TypeFlags.BooleanLike) !== 0) {
                return expression;
            }

            // do not cast to doubles if we're working with bigints
            if ((nodeType.flags & ts.TypeFlags.BigInt) !== 0 || (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
                targetType = cs.PrimitiveType.Long;
            }
        }

        const cast = {
            parent: expression.parent,
            tsNode: expression.tsNode,
            nodeType: cs.SyntaxKind.CastExpression,
            expression: {
                parent: null,
                tsNode: expression.tsNode,
                nodeType: cs.SyntaxKind.ParenthesizedExpression,
                expression: expression
            } as cs.ParenthesizedExpression,
            type: {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: null,
                tsNode: expression.tsNode,
                type: targetType
            } as cs.PrimitiveTypeNode
        } as cs.CastExpression;

        cast.expression.parent = cast;
        cast.type.parent = cast;

        return cast;
    }

    protected makeInt(expression: cs.Expression, bigIntToLong: boolean): cs.Expression {
        switch (expression.nodeType) {
            case cs.SyntaxKind.NumericLiteral:
                const value = (expression as cs.NumericLiteral).value;
                if (value.indexOf('.') === -1) {
                    if (value.includes('L') && !bigIntToLong) {
                        (expression as cs.NumericLiteral).value = value.substring(0, value.length - 1);
                    }
                    return expression;
                }
                break;
        }
        // (int)(expr)

        // use longs when required
        let targetType = cs.PrimitiveType.Int;
        if (expression.tsNode) {
            const nodeType = this.context.getType(expression.tsNode);
            if (bigIntToLong) {
                // no casting on bools
                if (
                    (nodeType.flags & ts.TypeFlags.Boolean) !== 0 ||
                    (nodeType.flags & ts.TypeFlags.BooleanLike) !== 0
                ) {
                    return expression;
                }

                if (
                    (nodeType.flags & ts.TypeFlags.BigInt) !== 0 ||
                    (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0
                ) {
                    targetType = cs.PrimitiveType.Long;
                }
            } else {
                if (
                    (nodeType.flags & ts.TypeFlags.BigInt) !== 0 ||
                    (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0
                ) {
                    targetType = cs.PrimitiveType.Int;
                }
            }
        }

        const cast = {
            parent: expression.parent,
            tsNode: expression.tsNode,
            nodeType: cs.SyntaxKind.CastExpression,
            expression: {
                parent: null,
                tsNode: expression.tsNode,
                nodeType: cs.SyntaxKind.ParenthesizedExpression,
                expression: expression
            } as cs.ParenthesizedExpression,
            type: {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: null,
                tsNode: expression.tsNode,
                type: targetType
            } as cs.PrimitiveTypeNode
        } as cs.CastExpression;

        cast.expression.parent = cast;
        cast.type.parent = cast;

        return cast;
    }

    protected visitConditionalExpression(parent: cs.Node, expression: ts.ConditionalExpression) {
        const conditionalExpression = {
            parent: parent,
            nodeType: cs.SyntaxKind.ConditionalExpression,
            tsNode: expression,
            condition: {} as cs.Expression,
            whenTrue: {} as cs.Expression,
            whenFalse: {} as cs.Expression
        } as cs.ConditionalExpression;

        conditionalExpression.condition = this.visitExpression(conditionalExpression, expression.condition)!;
        if (!conditionalExpression.condition) {
            return null;
        }

        conditionalExpression.whenTrue = this.visitExpression(conditionalExpression, expression.whenTrue)!;
        if (!conditionalExpression.whenTrue) {
            return null;
        }

        conditionalExpression.whenFalse = this.visitExpression(conditionalExpression, expression.whenFalse)!;
        if (!conditionalExpression.whenFalse) {
            return null;
        }

        return conditionalExpression;
    }

    protected makeTruthy(expression: cs.Node, force: boolean = false): cs.Expression {
        if (!force) {
            if (!this.context.isBooleanSmartCast(expression.tsNode!)) {
                return expression;
            }
        }

        const type = this.context.typeChecker.getTypeAtLocation(expression.tsNode!);
        if (type.flags & ts.TypeFlags.Boolean || type.flags & ts.TypeFlags.BooleanLiteral) {
            return expression;
        }

        // AlphaTab.Core.TypeHelper.IsTruthy(expression);
        const call = {
            parent: expression.parent,
            tsNode: expression.tsNode,
            nodeType: cs.SyntaxKind.InvocationExpression,
            expression: {} as cs.Expression,
            arguments: []
        } as cs.InvocationExpression;

        const access = {
            parent: call,
            tsNode: expression.tsNode,
            nodeType: cs.SyntaxKind.MemberAccessExpression,
            expression: {} as cs.Expression,
            member: this.context.toMethodName('isTruthy')
        } as cs.MemberAccessExpression;
        call.expression = access;

        access.expression = {
            parent: access,
            tsNode: expression.tsNode,
            nodeType: cs.SyntaxKind.Identifier,
            text: this.context.makeTypeName('alphaTab.core.TypeHelper')
        } as cs.Identifier;

        expression.parent = call;
        call.arguments.push(expression);

        return call;
    }

    protected visitFunctionDeclaration(parent: cs.Node, expression: ts.FunctionDeclaration) {
        const localFunction: cs.LocalFunctionDeclaration = {
            name: (expression.name as ts.Identifier)?.text,
            nodeType: cs.SyntaxKind.LocalFunction,
            parent: parent,
            tsNode: expression,
            body: {} as cs.Block,
            parameters: [],
            returnType: {} as cs.TypeNode
        };

        for (const p of expression.parameters) {
            localFunction.parameters.push(this.makeParameter(localFunction, p));
        }

        const signature = this.context.typeChecker.getSignatureFromDeclaration(expression);
        if (!signature) {
            this.context.addCsNodeDiagnostics(
                localFunction,
                'Could not get signature for function',
                ts.DiagnosticCategory.Error
            );
            localFunction.returnType = {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: localFunction,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        } else {
            const returnType = signature.getReturnType();
            localFunction.returnType = this.createUnresolvedTypeNode(
                localFunction,
                expression.type ?? expression,
                returnType
            );
        }

        if (expression.body) {
            localFunction.body = this.visitBlock(localFunction, expression.body);
        } else {
            localFunction.body = {
                nodeType: cs.SyntaxKind.Block,
                statements: [],
                parent: localFunction
            };
        }

        return localFunction;
    }

    protected visitFunctionExpression(parent: cs.Node, expression: ts.FunctionExpression) {
        if (expression.name) {
            this.context.addTsNodeDiagnostics(
                expression,
                'Local functions with names have no matching kind in C#, name will be omitted',
                ts.DiagnosticCategory.Warning
            );
        }

        const lambdaExpression = {
            nodeType: cs.SyntaxKind.LambdaExpression,
            parent: parent,
            tsNode: expression,
            body: {} as cs.Expression,
            parameters: [],
            returnType: {} as cs.TypeNode
        } as cs.LambdaExpression;

        const signature = this.context.typeChecker.getSignatureFromDeclaration(expression);
        if (!signature) {
            this.context.addCsNodeDiagnostics(
                lambdaExpression,
                'Could not get signature for function',
                ts.DiagnosticCategory.Error
            );
            lambdaExpression.returnType = {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: lambdaExpression,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        } else {
            const returnType = signature.getReturnType();
            lambdaExpression.returnType = this.createUnresolvedTypeNode(
                lambdaExpression,
                expression.type ?? expression,
                returnType
            );
        }

        for (const p of expression.parameters) {
            lambdaExpression.parameters.push(this.makeParameter(lambdaExpression, p));
        }

        lambdaExpression.body = this.visitBlock(lambdaExpression, expression.body);

        return lambdaExpression;
    }

    protected visitArrowExpression(parent: cs.Node, expression: ts.ArrowFunction) {
        const lambdaExpression = {
            nodeType: cs.SyntaxKind.LambdaExpression,
            parent: parent,
            tsNode: expression,
            body: {} as cs.Expression,
            parameters: [],
            returnType: {} as cs.TypeNode
        } as cs.LambdaExpression;

        for (const p of expression.parameters) {
            lambdaExpression.parameters.push(this.makeParameter(lambdaExpression, p));
        }

        const signature = this.context.typeChecker.getSignatureFromDeclaration(expression);
        if (!signature) {
            this.context.addTsNodeDiagnostics(
                expression,
                'Could not find signature from arrow function',
                ts.DiagnosticCategory.Error
            );
            lambdaExpression.returnType = {
                parent: lambdaExpression,
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        } else {
            const returnType = this.context.typeChecker.getReturnTypeOfSignature(signature!);
            lambdaExpression.returnType = this.createUnresolvedTypeNode(lambdaExpression, expression, returnType);
        }

        if (ts.isBlock(expression.body)) {
            lambdaExpression.body = this.visitBlock(lambdaExpression, expression.body);
        } else {
            lambdaExpression.body = this.visitExpression(lambdaExpression, expression.body)!;
            if (!lambdaExpression.body) {
                lambdaExpression.body = {
                    parent: lambdaExpression,
                    nodeType: cs.SyntaxKind.Block,
                    statements: []
                } as cs.Block;
            }
        }

        return lambdaExpression;
    }

    protected visitRegularExpressionLiteral(parent: cs.Node, expression: ts.RegularExpressionLiteral) {
        // AlphaTab.Core.TypeHelper.CreateRegex(expr)
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.InvocationExpression,
            arguments: [],
            expression: {} as cs.Expression
        } as cs.InvocationExpression;

        const parts = expression.text.split('/');
        csExpr.expression = this.makeMemberAccess(
            csExpr,
            this.context.makeTypeName('alphaTab.core.TypeHelper'),
            this.context.toMethodName('createRegex')
        );
        csExpr.arguments.push({
            parent: csExpr,
            nodeType: cs.SyntaxKind.StringLiteral,
            tsNode: expression,
            text: parts[1]
        } as cs.StringLiteral);

        csExpr.arguments.push({
            parent: csExpr,
            nodeType: cs.SyntaxKind.StringLiteral,
            tsNode: expression,
            text: parts[2]
        } as cs.StringLiteral);

        return csExpr;
    }

    protected visitNumericLiteral(parent: cs.Node, expression: ts.NumericLiteral) {
        const numeric = {
            parent: parent,
            nodeType: cs.SyntaxKind.NumericLiteral,
            tsNode: expression,
            value: expression.text
        } as cs.NumericLiteral;

        // ensure number literals assigned to any/unknown
        // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
        if (this.context.isUnknownSmartCast(expression)) {
            return this.wrapIntoCastToTargetType(numeric);
        }

        return numeric;
    }

    protected visitBigIntLiteral(parent: cs.Node, expression: ts.BigIntLiteral) {
        const numeric = {
            parent: parent,
            nodeType: cs.SyntaxKind.NumericLiteral,
            tsNode: expression,
            value: expression.text.replace('n', 'L') // map javascript bigints to 64bit longs in target language
        } as cs.NumericLiteral;

        // ensure number literals assigned to any/unknown
        // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
        if (this.context.isUnknownSmartCast(expression)) {
            return this.wrapIntoCastToTargetType(numeric);
        }

        return numeric;
    }

    protected visitNoSubstitutionTemplateLiteral(
        parent: cs.Node,
        expression: ts.NoSubstitutionTemplateLiteral
    ): cs.Expression {
        const stringLiteral = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.StringLiteral,
            text: expression.text
        } as cs.StringLiteral;

        return stringLiteral;
    }

    protected visitTemplateExpression(parent: cs.Node, expression: ts.TemplateExpression): cs.Expression {
        const templateString = {
            parent: parent,
            nodeType: cs.SyntaxKind.StringTemplateExpression,
            tsNode: expression,
            chunks: []
        } as cs.StringTemplateExpression;

        if (expression.head.text) {
            templateString.chunks.push({
                parent: templateString,
                nodeType: cs.SyntaxKind.StringLiteral,
                tsNode: expression.head,
                text: expression.head.text
            } as cs.StringLiteral);
        }

        for (const s of expression.templateSpans) {
            const e = this.visitExpression(templateString, s.expression);
            if (e) {
                templateString.chunks.push(e);
            }
            templateString.chunks.push({
                parent: templateString,
                nodeType: cs.SyntaxKind.StringLiteral,
                tsNode: s,
                text: s.literal.text
            } as cs.StringLiteral);
        }

        return templateString;
    }

    protected visitTypeAssertionExpression(parent: cs.Node, expression: ts.TypeAssertion) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.IsExpression,
            type: this.createUnresolvedTypeNode(null, expression.type),
            expression: {} as cs.Expression
        } as cs.IsExpression;

        // TODO: introduce new name for typechecked expression and use it within the current block
        csExpr.expression = this.visitExpression(csExpr, expression.expression)!;
        if (!csExpr.expression) {
            return csExpr.expression;
        }

        return csExpr;
    }

    protected visitParenthesizedExpression(parent: cs.Node, expression: ts.ParenthesizedExpression) {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.ParenthesizedExpression,
            expression: {} as cs.Expression
        } as cs.ParenthesizedExpression;

        csExpr.expression = this.visitExpression(csExpr, expression.expression)!;
        if (!csExpr.expression) {
            return null;
        }

        return csExpr;
    }

    protected visitArrayLiteralExpression(parent: cs.Node, expression: ts.ArrayLiteralExpression): cs.Expression {
        const type = this.context.typeChecker.getTypeAtLocation(expression);
        if (this.context.typeChecker.isTupleType(type)) {
            // deconstruction
            // [x, y] = expression
            if (
                ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                expression.parent.left === expression
            ) {
                const csExpr = {
                    parent: parent,
                    nodeType: cs.SyntaxKind.DeconstructDeclaration,
                    names: []
                } as cs.DeconstructDeclaration;

                for (const m of expression.elements) {
                    if (ts.isIdentifier(m)) {
                        csExpr.names.push(m.text);
                    } else {
                        this.context.addCsNodeDiagnostics(
                            parent,
                            'Unsupported tuple destruction',
                            ts.DiagnosticCategory.Error
                        );
                    }
                }

                return csExpr;
            }

            const csExpr = {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.NewExpression,
                type: null!,
                arguments: []
            } as cs.NewExpression;

            csExpr.type = this.context.makeArrayTupleType(csExpr, []);

            let tupleType = this.context.typeChecker.getContextualType(expression);
            let typeArgs = tupleType
                ? this.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference)
                : undefined;
            if (!typeArgs || typeArgs.length !== expression.elements.length) {
                tupleType = type;
                typeArgs = this.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference);
            }

            (csExpr.type as cs.ArrayTupleNode).types = typeArgs!.map((p, i) =>
                this.createUnresolvedTypeNode(csExpr.type, expression.elements[i], p)
            );

            for (const e of expression.elements) {
                const ex = this.visitExpression(csExpr, e);
                if (ex) {
                    csExpr.arguments!.push(ex);
                }
            }

            return csExpr;
        }
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.ArrayCreationExpression,
            values: []
        } as cs.ArrayCreationExpression;

        const contextual = this.context.typeChecker.getContextualType(expression);
        if (!contextual || !contextual.symbol || contextual.symbol.name !== 'Iterable') {
            csExpr.type = this.createUnresolvedTypeNode(csExpr, expression, contextual);
        }

        for (const e of expression.elements) {
            const ex = this.visitExpression(csExpr, e);
            if (ex) {
                csExpr.values!.push(ex);
            }
        }

        return csExpr;
    }
    protected createMapEntry(parent: cs.Node, expression: ts.ArrayLiteralExpression): cs.Expression {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NewExpression,
            type: null!,
            arguments: []
        } as cs.NewExpression;

        csExpr.type = {
            nodeType: cs.SyntaxKind.ArrayTupleNode,
            parent: csExpr,
            types: [],
            isNullable: false
        } as cs.ArrayTupleNode;

        for (const e of expression.elements) {
            const ex = this.visitExpression(csExpr, e);
            if (ex) {
                (csExpr.type as cs.ArrayTupleNode).types.push(
                    this.createUnresolvedTypeNode(csExpr.type, e, this.context.typeChecker.getTypeAtLocation(e))
                );
                csExpr.arguments.push(ex);
            }
        }

        return csExpr;
    }

    protected isSetInitializer(expression: ts.ArrayLiteralExpression) {
        const isCandidate = expression.parent.kind === ts.SyntaxKind.NewExpression;
        if (!isCandidate) {
            return false;
        }

        return this.context.typeChecker.getTypeAtLocation(expression.parent).symbol.name === 'Set';
    }

    protected visitPropertyAccessExpression(parent: cs.Node, expression: ts.PropertyAccessExpression) {
        const tsSymbol = this.context.typeChecker.getSymbolAtLocation(expression);

        // check if member is delegated
        const delegation = this.context.getDelegatedName(tsSymbol);
        if (delegation != null) {
            return {
                parent: parent,
                nodeType: cs.SyntaxKind.Identifier,
                text: delegation
            } as cs.Identifier;
        }

        const memberAccess = {
            expression: {} as cs.Expression,
            member: this.context.toPropertyName(expression.name.text),
            parent: parent,
            tsNode: expression,
            tsSymbol: tsSymbol,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;

        let convertToInvocation = false;

        if (memberAccess.tsSymbol) {
            if (this.context.isMethodSymbol(memberAccess.tsSymbol)) {
                memberAccess.member = this.context.buildMethodName(expression.name);
            } else if (this.context.isPropertySymbol(memberAccess.tsSymbol)) {
                memberAccess.member = this.context.toPropertyName(expression.name.text);
            }
        }

        if (
            memberAccess.tsSymbol &&
            expression.parent.kind === ts.SyntaxKind.CaseClause &&
            (expression.parent as ts.CaseClause).expression === expression
        ) {
            this.context.registerSymbolAsConst(memberAccess.tsSymbol);
        }

        if (memberAccess.tsSymbol) {
            const parentSymbol = (memberAccess.tsSymbol as any).parent as ts.Symbol;
            if (parentSymbol) {
                const renamed = this.getSymbolName(parentSymbol!, memberAccess.tsSymbol!);
                if (renamed) {
                    memberAccess.member = renamed;
                }

                convertToInvocation = this.convertPropertyToInvocation(parentSymbol!, memberAccess.tsSymbol!);
            }
        }

        if (expression.questionDotToken) {
            memberAccess.nullSafe = true;
        }

        memberAccess.expression = this.visitExpression(memberAccess, expression.expression)!;
        if (!memberAccess.expression) {
            return null;
        }

        if (convertToInvocation && !ts.isCallExpression(expression.parent)) {
            const invocation: cs.InvocationExpression = {
                nodeType: cs.SyntaxKind.InvocationExpression,
                expression: memberAccess,
                arguments: [],
                tsNode: memberAccess.tsNode,
                tsSymbol: memberAccess.tsSymbol,
                parent: memberAccess.parent,
                skipEmit: memberAccess.skipEmit
            };

            memberAccess.parent = invocation;

            return this.wrapToSmartCast(parent, invocation, expression);
        }
        return this.wrapToSmartCast(parent, memberAccess, expression);
    }

    protected convertPropertyToInvocation(parentSymbol: ts.Symbol, symbol: ts.Symbol): boolean {
        switch (parentSymbol.name) {
            case 'Error':
                switch (symbol.name) {
                    case 'stack':
                    case 'cause':
                        return true;
                }
                break;
            // chai assertions
            case 'Assertion':
                return true;
        }
        return false;
    }

    protected getSymbolName(parentSymbol: ts.Symbol, symbol: ts.Symbol): string | null {
        switch (parentSymbol.name) {
            case 'Array':
                switch (symbol.name) {
                    case 'length':
                        return 'Count';
                    case 'reverse':
                        return 'Reversed';
                    case 'push':
                        return 'Add';
                }
                break;
            case 'String':
                switch (symbol.name) {
                    case 'includes':
                        return 'Contains';
                    case 'trimRight':
                        return 'TrimEnd';
                    case 'trimLeft':
                        return 'TrimStart';
                    case 'substring':
                        return 'SubstringIndex';
                }
                break;
            case 'Number':
                switch (symbol.name) {
                    case 'toString':
                        return 'ToInvariantString';
                }
                break;
        }
        return null;
    }

    protected visitObjectLiteralExpression(parent: cs.Node, expression: ts.ObjectLiteralExpression) {
        const type = this.context.typeChecker.getContextualType(expression);
        const isRecord =
            type?.symbol?.declarations?.some(d => ts.getJSDocTags(d).some(t => t.tagName.text === 'record')) ||
            this._recordCreation > 0;
        if (isRecord) {
            const newObject = {
                nodeType: cs.SyntaxKind.NewExpression,
                type: this.createUnresolvedTypeNode(null, expression, type, type!.symbol),
                arguments: [],
                parent: parent
            } as cs.NewExpression;

            for (const p of expression.properties) {
                const assignment = {
                    parent: newObject,
                    nodeType: cs.SyntaxKind.LabeledExpression,
                    label: '',
                    expression: {} as cs.Expression
                } as cs.LabeledExpression;

                if (ts.isPropertyAssignment(p)) {
                    assignment.label = p.name.getText();
                    assignment.expression = this.visitExpression(assignment, p.initializer)!;
                    newObject.arguments.push(assignment);
                } else if (ts.isShorthandPropertyAssignment(p)) {
                    assignment.label = p.name.getText();
                    if (p.objectAssignmentInitializer) {
                        assignment.expression = this.visitExpression(assignment, p.objectAssignmentInitializer)!;
                    } else {
                        assignment.expression = {
                            nodeType: cs.SyntaxKind.Identifier,
                            parent: assignment,
                            tsNode: p.name,
                            text: p.name.getText()
                        } as cs.Identifier;
                    }
                    newObject.arguments.push(assignment);
                } else if (ts.isSpreadAssignment(p)) {
                    this.context.addTsNodeDiagnostics(p, 'Spread operator not supported', ts.DiagnosticCategory.Error);
                } else if (ts.isMethodDeclaration(p)) {
                    this.context.addTsNodeDiagnostics(
                        p,
                        'Method declarations in object literals not supported',
                        ts.DiagnosticCategory.Error
                    );
                } else if (ts.isGetAccessorDeclaration(p)) {
                    this.context.addTsNodeDiagnostics(
                        p,
                        'Get accessor declarations in object literals not supported',
                        ts.DiagnosticCategory.Error
                    );
                } else if (ts.isSetAccessorDeclaration(p)) {
                    this.context.addTsNodeDiagnostics(
                        p,
                        'Set accessor declarations in object literals not supported',
                        ts.DiagnosticCategory.Error
                    );
                }
            }

            if (type?.aliasSymbol?.name === 'Record' || type?.getNonNullableType()?.aliasSymbol?.name === 'Record') {
                const exprs = newObject.arguments;
                newObject.arguments = [];
                for (const e of exprs) {
                    const label = e as cs.LabeledExpression;

                    const newTupleExpr = {
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.NewExpression,
                        type: null!,
                        arguments: []
                    } as cs.NewExpression;
                    newObject.arguments.push(newTupleExpr);

                    newTupleExpr.type = this.context.makeArrayTupleType(newTupleExpr, []);
                    const csTupleType = newTupleExpr.type as cs.ArrayTupleNode;

                    csTupleType.types.push({
                        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                        type: cs.PrimitiveType.String
                    } as cs.PrimitiveTypeNode);

                    const typeArgs = type.aliasTypeArguments ?? type?.getNonNullableType()?.aliasTypeArguments;

                    csTupleType.types.push(
                        this.createUnresolvedTypeNode(csTupleType, expression, typeArgs![1], typeArgs![1]!.symbol)
                    );

                    newTupleExpr.arguments.push({
                        nodeType: cs.SyntaxKind.StringLiteral,
                        text: label.label
                    } as cs.StringLiteral);

                    newTupleExpr.arguments.push(label.expression);
                }
            }

            this._recordCreation--;

            return newObject;
        }

        const objectLiteral = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.AnonymousObjectCreationExpression,
            properties: []
        } as cs.AnonymousObjectCreationExpression;

        for (const p of expression.properties) {
            if (ts.isPropertyAssignment(p)) {
                const assignment = {
                    parent: objectLiteral,
                    nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                    name: p.name.getText(),
                    value: {} as cs.Expression
                } as cs.AnonymousObjectProperty;

                assignment.value = this.visitExpression(objectLiteral, p.initializer)!;
                if (assignment.value) {
                    objectLiteral.properties.push(assignment);
                }
            } else if (ts.isShorthandPropertyAssignment(p)) {
                const assignment = {
                    parent: objectLiteral,
                    nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                    name: p.name.getText(),
                    value: {} as cs.Expression
                } as cs.AnonymousObjectProperty;

                assignment.value = this.visitExpression(objectLiteral, p.objectAssignmentInitializer!)!;
                if (assignment.value) {
                    objectLiteral.properties.push(assignment);
                }
            } else if (ts.isSpreadAssignment(p)) {
                this.context.addTsNodeDiagnostics(p, 'Spread operator not supported', ts.DiagnosticCategory.Error);
            } else if (ts.isMethodDeclaration(p)) {
                const assignment = {
                    parent: objectLiteral,
                    nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                    name: p.name.getText(),
                    value: {} as cs.Expression
                } as cs.AnonymousObjectProperty;

                const lambda = {
                    nodeType: cs.SyntaxKind.LambdaExpression,
                    parent: objectLiteral,
                    parameters: [],
                    body: {} as cs.Block,
                    tsNode: p,
                    returnType: {} as cs.TypeNode
                } as cs.LambdaExpression;

                const signature = this.context.typeChecker.getSignatureFromDeclaration(p);
                if (!signature) {
                    this.context.addCsNodeDiagnostics(
                        lambda,
                        'Could not get signature for function',
                        ts.DiagnosticCategory.Error
                    );
                    lambda.returnType = {
                        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                        parent: lambda,
                        type: cs.PrimitiveType.Void
                    } as cs.PrimitiveTypeNode;
                } else {
                    const returnType = signature.getReturnType();
                    lambda.returnType = this.createUnresolvedTypeNode(lambda, p.type ?? p, returnType);
                }

                for (const param of p.parameters) {
                    lambda.parameters.push(this.makeParameter(lambda, param));
                }
                lambda.body = this.visitBlock(parent, p.body!);

                assignment.value = lambda;

                objectLiteral.properties.push(assignment);
            } else if (ts.isGetAccessorDeclaration(p)) {
                this.context.addTsNodeDiagnostics(
                    p,
                    'Get accessor declarations in object literals not supported',
                    ts.DiagnosticCategory.Error
                );
            } else if (ts.isSetAccessorDeclaration(p)) {
                this.context.addTsNodeDiagnostics(
                    p,
                    'Set accessor declarations in object literals not supported',
                    ts.DiagnosticCategory.Error
                );
            }
        }

        return objectLiteral;
    }

    protected toInvariantString(expr: cs.Expression): cs.Expression {
        const callExpr = {
            parent: expr.parent,
            arguments: [],
            expression: {} as cs.Expression,
            nodeType: cs.SyntaxKind.InvocationExpression,
            tsNode: expr.tsNode
        } as cs.InvocationExpression;
        const memberAccess = {
            expression: null!,
            member: this.context.toPascalCase('toInvariantString'),
            parent: callExpr,
            tsNode: expr.tsNode,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;
        callExpr.expression = memberAccess;

        const par = {
            parent: memberAccess,
            nodeType: cs.SyntaxKind.ParenthesizedExpression,
            tsNode: expr.tsNode,
            tsSymbol: expr.tsSymbol,
            expression: expr
        } as cs.ParenthesizedExpression;
        expr.parent = par;
        memberAccess.expression = par;

        return callExpr;
    }

    protected visitElementAccessExpression(parent: cs.Node, expression: ts.ElementAccessExpression) {
        // Enum[enumValue] => value.toString()
        // Enum[string] => TypeHelper.parseEnum<Type>(value, Type)
        if (this.isEnumFromOrToString(expression)) {
            const elementType = this.context.typeChecker.getTypeAtLocation(expression);

            if (elementType === this.context.typeChecker.getStringType()) {
                const callExpr = {
                    parent: parent,
                    arguments: [],
                    expression: {} as cs.Expression,
                    nodeType: cs.SyntaxKind.InvocationExpression,
                    tsNode: expression
                } as cs.InvocationExpression;

                const memberAccess = {
                    expression: {} as cs.Expression,
                    member: this.context.toPascalCase('toString'),
                    parent: callExpr,
                    tsNode: expression,
                    nodeType: cs.SyntaxKind.MemberAccessExpression
                } as cs.MemberAccessExpression;
                callExpr.expression = memberAccess;

                memberAccess.expression = this.visitExpression(memberAccess, expression.argumentExpression)!;
                if (!memberAccess.expression) {
                    return null;
                }

                return callExpr;
            }

            const callExpr = {
                parent: parent,
                arguments: [],
                expression: {} as cs.Expression,
                nodeType: cs.SyntaxKind.InvocationExpression,
                tsNode: expression
            } as cs.InvocationExpression;

            callExpr.expression = this.makeMemberAccess(
                callExpr,
                this.context.makeTypeName('alphaTab.core.TypeHelper'),
                this.context.toMethodName('parseEnum')
            );

            const enumType = this.context.typeChecker.getTypeAtLocation(expression.expression);
            callExpr.typeArguments = [
                this.createUnresolvedTypeNode(callExpr, expression.argumentExpression, enumType, enumType.symbol)
            ];

            const typeOf: cs.TypeOfExpression = {
                nodeType: cs.SyntaxKind.TypeOfExpression,
                parent: callExpr
            };
            typeOf.type = this.createUnresolvedTypeNode(
                typeOf,
                expression.argumentExpression,
                enumType,
                enumType.symbol
            );

            callExpr.arguments = [this.visitExpression(callExpr, expression.argumentExpression)!, typeOf];

            return callExpr;
        }

        const argumentSymbol = this.context.typeChecker.getSymbolAtLocation(expression.argumentExpression);
        const elementAccessMethod = argumentSymbol ? this.context.getMethodNameFromSymbol(argumentSymbol) : '';
        if (elementAccessMethod) {
            const memberAccess = {
                nodeType: cs.SyntaxKind.MemberAccessExpression,
                expression: {} as cs.Expression,
                member: this.context.toMethodName(elementAccessMethod),
                parent: parent,
                tsNode: expression,
                nullSafe: !!expression.questionDotToken
            } as cs.MemberAccessExpression;

            memberAccess.expression = this.visitExpression(memberAccess, expression.expression)!;
            if (!memberAccess.expression) {
                return null;
            }

            return memberAccess;
        }

        const elementAccess = {
            expression: {} as cs.Expression,
            argumentExpression: {} as cs.Expression,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.ElementAccessExpression,
            nullSafe: !!expression.questionDotToken
        } as cs.ElementAccessExpression;

        elementAccess.expression = this.visitExpression(elementAccess, expression.expression)!;
        if (!elementAccess.expression) {
            return null;
        }

        const argumentExpression = this.visitExpression(elementAccess, expression.argumentExpression)!;
        if (!argumentExpression) {
            return null;
        }

        const symbol = this.context.typeChecker.getSymbolAtLocation(expression.expression);
        let type = symbol
            ? this.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, expression.expression)
            : this.context.typeChecker.getTypeAtLocation(expression.expression);
        if (type) {
            type = this.context.typeChecker.getNonNullableType(type);
        }
        const isArrayTupleAccessor = type && this.context.typeChecker.isTupleType(type);
        const isArrayAccessor =
            (!isArrayTupleAccessor && !symbol) ||
            (type && type.symbol && !!type.symbol.members?.has(ts.escapeLeadingUnderscores('slice')));

        const forceCast = false;
        if (isArrayAccessor) {
            const csArg = {
                expression: {} as cs.Expression,
                nodeType: cs.SyntaxKind.CastExpression,
                parent: parent,
                tsNode: expression.argumentExpression,
                type: {
                    nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                    type: cs.PrimitiveType.Int
                } as cs.PrimitiveTypeNode
            } as cs.CastExpression;
            elementAccess.argumentExpression = csArg;

            const par = {
                nodeType: cs.SyntaxKind.ParenthesizedExpression,
                parent: csArg,
                expression: argumentExpression
            } as cs.ParenthesizedExpression;
            argumentExpression.parent = par;
            csArg.expression = par;
        } else if (isArrayTupleAccessor) {
            let index = expression.argumentExpression;
            while (ts.isParenthesizedExpression(index)) {
                index = index.expression;
            }

            // x[0] -> x.V1
            if (ts.isNumericLiteral(index)) {
                return {
                    expression: elementAccess.expression,
                    member: this.context.toPropertyName(`v${index.text}`),
                    parent: parent,
                    tsNode: expression,
                    nodeType: cs.SyntaxKind.MemberAccessExpression,
                    nullSafe: !!expression.questionDotToken
                } as cs.MemberAccessExpression;
            }
            // x[expr] -> x[expr] as Type
            this.context.addTsNodeDiagnostics(
                expression,
                'Dynamic expressions on tuple types are not supported',
                ts.DiagnosticCategory.Error
            );
        } else {
            elementAccess.argumentExpression = argumentExpression;
            argumentExpression.parent = elementAccess;
        }

        return this.wrapToSmartCast(parent, elementAccess, expression, forceCast);
    }

    protected isEnumFromOrToString(expression: ts.ElementAccessExpression): boolean {
        const enumType = this.context.typeChecker.getTypeAtLocation(expression.expression);
        return !!(enumType?.symbol && enumType.symbol.flags & ts.SymbolFlags.RegularEnum);
    }

    protected visitCallExpression(parent: cs.Node, expression: ts.CallExpression) {
        if (this.isBind(expression)) {
            return this.visitExpression(parent, (expression.expression as ts.PropertyAccessExpression).expression);
        }

        // String(x), BigInt(x), Number(x)
        if (ts.isIdentifier(expression.expression) && expression.arguments.length === 1) {
            switch (expression.expression.text) {
                case 'String':
                    const addWithString = {
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.BinaryExpression,
                        left: null! as cs.Expression,
                        right: null! as cs.Expression,
                        operator: '+'
                    } as cs.BinaryExpression;

                    addWithString.left = {
                        nodeType: cs.SyntaxKind.StringLiteral,
                        text: '',
                        parent: addWithString
                    } as cs.StringLiteral;

                    const stringValue = this.visitExpression(addWithString, expression.arguments[0]);
                    if (!stringValue) {
                        return null;
                    }

                    addWithString.right = stringValue;

                    return addWithString;
                case 'BigInt':
                    const bigIntCastExpression = {
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.CastExpression,
                        expression: null! as cs.Expression,
                        type: {
                            nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                            type: cs.PrimitiveType.Long
                        } as cs.PrimitiveTypeNode
                    } as cs.CastExpression;

                    const bigIntValue = this.visitExpression(bigIntCastExpression, expression.arguments[0])!;
                    if (!bigIntValue) {
                        return null;
                    }

                    bigIntCastExpression.expression = bigIntValue;
                    return bigIntCastExpression;
                case 'Number':
                    const numebrCastExpression = {
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.CastExpression,
                        expression: null! as cs.Expression,
                        type: {
                            nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                            type: cs.PrimitiveType.Double
                        } as cs.PrimitiveTypeNode
                    } as cs.CastExpression;

                    const numberValue = this.visitExpression(numebrCastExpression, expression.arguments[0])!;
                    if (!numberValue) {
                        return null;
                    }

                    numebrCastExpression.expression = numberValue;
                    return numebrCastExpression;
            }
        }

        const callExpression = {
            arguments: [],
            expression: {} as cs.Expression,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.InvocationExpression,
            nullSafe: !!expression.questionDotToken
        } as cs.InvocationExpression;

        // chai
        if (ts.isIdentifier(expression.expression) && (expression.expression as ts.Identifier).text === 'expect') {
            callExpression.expression = {
                parent: callExpression,
                tsNode: expression.expression,
                nodeType: cs.SyntaxKind.Identifier,
                text: `TestGlobals.${this.context.toPascalCase('expect')}`
            } as cs.Identifier;
        } else {
            callExpression.expression = this.visitExpression(callExpression, expression.expression)!;
        }

        if (!callExpression.expression) {
            return null;
        }

        if (
            ts.isPropertyAccessExpression(expression.expression) &&
            expression.expression.name.text === 'setPrototypeOf'
        ) {
            return null;
        }

        for (const a of expression.arguments) {
            const e = this.visitExpression(callExpression, a);
            if (e) {
                callExpression.arguments.push(e);
            }
        }

        if (expression.typeArguments) {
            callExpression.typeArguments = [];
            for (const a of expression.typeArguments) {
                callExpression.typeArguments!.push(this.createUnresolvedTypeNode(callExpression, a));
            }
        }

        return this.makeTruthy(callExpression);
    }
    protected isBind(expression: ts.CallExpression) {
        if (ts.isPropertyAccessExpression(expression.expression)) {
            return expression.expression.name.text === 'bind' && expression.arguments.length === 1;
        }
        return false;
    }

    protected visitNewExpression(parent: cs.Node, expression: ts.NewExpression) {
        const symbol = this.context.typeChecker.getSymbolAtLocation(expression.expression);
        let type: ts.Type | undefined = undefined;
        if (symbol) {
            type = this.context.typeChecker.getTypeOfSymbolAtLocation(symbol, expression.expression) ?? null;
        }

        if (type?.symbol?.name === 'PromiseConstructor') {
            const invocation = {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.InvocationExpression,
                expression: {} as cs.Identifier,
                arguments: []
            } as cs.InvocationExpression;

            invocation.expression = this.makeMemberAccess(
                invocation,
                this.context.makeTypeName('alphaTab.core.TypeHelper'),
                this.context.toMethodName('createPromise')
            );

            const e = this.visitExpression(invocation, expression.arguments![0]);
            if (e) {
                invocation.arguments.push(e);
            }

            const isVoidPromise =
                !expression.typeArguments || expression.typeArguments[0].kind === ts.SyntaxKind.VoidKeyword;

            if (!isVoidPromise) {
                invocation.typeArguments = [];
                for (const a of expression.typeArguments!) {
                    invocation.typeArguments!.push(this.createUnresolvedTypeNode(invocation, a));
                }
            } else if (e && cs.isLambdaExpression(e)) {
                e.parameters[0].type = {
                    nodeType: cs.SyntaxKind.FunctionTypeNode,
                    parameterTypes: [],
                    parent: e,
                    returnType: {
                        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                        parent: e,
                        type: cs.PrimitiveType.Void
                    } as cs.PrimitiveTypeNode
                } as cs.FunctionTypeNode;
            }
            return invocation;
        }

        const csType = this.createUnresolvedTypeNode(null, expression.expression, type, symbol);
        const newExpression = {
            arguments: [],
            type: csType,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NewExpression
        } as cs.NewExpression;

        newExpression.type.parent = newExpression;

        if (expression.typeArguments) {
            csType.typeArguments = [];
            for (const a of expression.typeArguments) {
                csType.typeArguments!.push(this.createUnresolvedTypeNode(newExpression, a));
            }
        } else {
            const typeAtLocation = this.context.typeChecker.getTypeAtLocation(expression) as ts.TypeReference;
            if (typeAtLocation.typeArguments && typeAtLocation.typeArguments.length > 0) {
                const declarationOrAssignmentType = this.getDeclarationOrAssignmentType();
                const actualTypeArguments = (declarationOrAssignmentType as ts.TypeReference)?.typeArguments;
                // we have some inferred type arguments here
                if (actualTypeArguments && actualTypeArguments.length === typeAtLocation.typeArguments.length) {
                    csType.typeArguments = [];
                    for (const a of actualTypeArguments) {
                        csType.typeArguments!.push(
                            this.createUnresolvedTypeNode(newExpression, expression.expression, a)
                        );
                    }
                } else {
                    csType.typeArguments = [];

                    // ignore and hope for the best in the target language (e.g. new Uint8Array is nowadays a Uint8Array<ArrayBuffer>)
                    // this._context.addTsNodeDiagnostics(
                    //     expression,
                    //     'Cannot infer type arguments on generic object creation',
                    //     ts.DiagnosticCategory.Error
                    // );
                }
            }
        }

        if (expression.arguments) {
            for (const a of expression.arguments) {
                const e = this.visitExpression(newExpression, a);
                if (e) {
                    newExpression.arguments.push(e);
                }
            }
        }

        if (type && type.symbol && type.symbol.name === 'ArrayConstructor' && newExpression.arguments.length === 1) {
            newExpression.arguments[0] = this.makeInt(newExpression.arguments[0], false);
        }

        return newExpression;
    }
    protected getDeclarationOrAssignmentType(): ts.Type | undefined {
        return this.declarationOrAssignmentTypeStack.length === 0
            ? undefined
            : this.declarationOrAssignmentTypeStack[this.declarationOrAssignmentTypeStack.length - 1];
    }

    protected visitAsExpression(parent: cs.Node, expression: ts.AsExpression): cs.Expression | null {
        const castExpression = {
            type: this.createUnresolvedTypeNode(null, expression.type),
            expression: {} as cs.Expression,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.CastExpression
        } as cs.CastExpression;

        castExpression.type.parent = castExpression;
        castExpression.expression = this.visitExpression(castExpression, expression.expression)!;
        if (!castExpression.expression) {
            return null;
        }

        return castExpression;
    }

    protected visitNonNullExpression(parent: cs.Node, expression: ts.NonNullExpression) {
        if (this.context.isValueTypeExpression(expression)) {
            const valueAccessExpression = {
                expression: {} as cs.Expression,
                member: 'Value',
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.MemberAccessExpression
            } as cs.MemberAccessExpression;

            valueAccessExpression.expression = this.visitExpression(valueAccessExpression, expression.expression)!;
            if (!valueAccessExpression.expression) {
                return null;
            }

            return valueAccessExpression;
        }
        const nonNullExpression = {
            expression: {} as cs.Expression,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NonNullExpression
        } as cs.NonNullExpression;

        nonNullExpression.expression = this.visitExpression(nonNullExpression, expression.expression)!;
        if (!nonNullExpression.expression) {
            return null;
        }

        return nonNullExpression;
    }

    protected visitYieldExpression(parent: cs.Node, expression: ts.YieldExpression) {
        const yieldExpression = {
            expression: {} as cs.Expression,
            member: 'Value',
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.YieldExpression
        } as cs.YieldExpression;

        yieldExpression.expression = expression.expression
            ? this.visitExpression(yieldExpression, expression.expression)
            : null;

        if (expression.expression && !yieldExpression.expression) {
            return null;
        }

        return yieldExpression;
    }

    protected visitIdentifier(parent: cs.Node, expression: ts.Identifier) {
        if (expression.text === 'undefined') {
            return {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.DefaultExpression
            } as cs.DefaultExpression;
        }

        const identifier = {
            parent: parent,
            tsNode: expression,
            tsSymbol: this.context.typeChecker.getSymbolAtLocation(expression),
            nodeType: cs.SyntaxKind.Identifier,
            text: ''
        } as cs.Identifier;

        identifier.text = this.getIdentifierName(identifier, expression);

        if (identifier.tsSymbol) {
            switch (expression.parent.kind) {
                case ts.SyntaxKind.PropertyAccessExpression:
                case ts.SyntaxKind.BinaryExpression:
                    break;
                default:
                    switch (identifier.tsSymbol.flags) {
                        case ts.SymbolFlags.Alias:
                        case ts.SymbolFlags.RegularEnum:
                            return {
                                parent: parent,
                                nodeType: cs.SyntaxKind.TypeOfExpression,
                                tsNode: expression,
                                expression: identifier
                            } as cs.TypeOfExpression;
                    }
                    break;
            }
        }

        return this.wrapToSmartCast(parent, identifier, expression);
    }

    protected getIdentifierName(identifier: cs.Identifier, expression: ts.Identifier): string {
        return expression.text;
    }

    protected wrapToSmartCast(
        parent: cs.Node,
        node: cs.Node,
        expression: ts.Expression,
        forceCast: boolean = false
    ): cs.Expression {
        if (node.tsSymbol) {
            if (
                (node.tsSymbol.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property ||
                (node.tsSymbol.flags & ts.SymbolFlags.Variable) === ts.SymbolFlags.Variable ||
                (node.tsSymbol.flags & ts.SymbolFlags.EnumMember) === ts.SymbolFlags.EnumMember ||
                (node.tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable) ===
                    ts.SymbolFlags.FunctionScopedVariable ||
                (node.tsSymbol.flags & ts.SymbolFlags.BlockScopedVariable) === ts.SymbolFlags.BlockScopedVariable
            ) {
                const smartCastType = this.context.getSmartCastType(expression);
                if (smartCastType && !this.context.isIterable(smartCastType)) {
                    if (smartCastType.flags & ts.TypeFlags.Boolean) {
                        return this.makeTruthy(node, true);
                    }

                    const paren = {
                        expression: {} as cs.Expression,
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.ParenthesizedExpression
                    } as cs.ParenthesizedExpression;

                    const castExpression = {
                        type: this.createUnresolvedTypeNode(
                            null,
                            expression,
                            smartCastType,
                            smartCastType.symbol ?? node.tsSymbol
                        ),
                        expression: node,
                        parent: paren,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.CastExpression
                    } as cs.CastExpression;
                    paren.expression = castExpression;

                    castExpression.type.parent = castExpression;
                    castExpression.expression.parent = castExpression;

                    return this.makeTruthy(paren);
                }

                const isValueTypeNotNullSmartCast = this.context.isValueTypeNotNullSmartCast(expression);
                if (isValueTypeNotNullSmartCast !== undefined) {
                    if (isValueTypeNotNullSmartCast) {
                        return {
                            parent: parent,
                            nodeType: cs.SyntaxKind.MemberAccessExpression,
                            tsNode: expression,
                            expression: node,
                            member: 'Value'
                        } as cs.MemberAccessExpression;
                    }
                    return this.makeTruthy({
                        parent: parent,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        tsNode: expression,
                        expression: node
                    } as cs.NonNullExpression);
                }

                if (this.context.isNonNullSmartCast(expression)) {
                    return this.makeTruthy({
                        parent: parent,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        tsNode: expression,
                        expression: node
                    } as cs.NonNullExpression);
                }
            }
        }

        return this.makeTruthy(node);
    }

    protected visitStringLiteral(parent: cs.Node, expression: ts.Identifier) {
        const stringLiteral = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.StringLiteral,
            text: expression.text
        } as cs.StringLiteral;

        return stringLiteral;
    }

    protected removeExtension(fileName: string) {
        return fileName.substring(0, fileName.lastIndexOf('.'));
    }

    protected mapOperator(operator: ts.SyntaxKind): string {
        switch (operator) {
            case ts.SyntaxKind.PlusPlusToken:
                return '++';
            case ts.SyntaxKind.MinusMinusToken:
                return '--';
            case ts.SyntaxKind.TildeToken:
                return '~';
            case ts.SyntaxKind.ExclamationToken:
                return '!';

            case ts.SyntaxKind.CommaToken:
                return ',';

            case ts.SyntaxKind.QuestionQuestionToken:
                return '??';

            case ts.SyntaxKind.AsteriskToken:
                return '*';
            case ts.SyntaxKind.SlashToken:
                return '/';
            case ts.SyntaxKind.PercentToken:
                return '%';

            case ts.SyntaxKind.PlusToken:
                return '+';
            case ts.SyntaxKind.MinusToken:
                return '-';

            case ts.SyntaxKind.LessThanLessThanToken:
                return '<<';
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                return '>>';

            case ts.SyntaxKind.LessThanToken:
                return '<';
            case ts.SyntaxKind.LessThanEqualsToken:
                return '<=';
            case ts.SyntaxKind.GreaterThanToken:
                return '>';
            case ts.SyntaxKind.GreaterThanEqualsToken:
                return '>=';
            case ts.SyntaxKind.InstanceOfKeyword:
                return 'is';

            case ts.SyntaxKind.EqualsEqualsToken:
            case ts.SyntaxKind.EqualsEqualsEqualsToken:
                return '==';
            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
            case ts.SyntaxKind.ExclamationEqualsToken:
                return '!=';

            case ts.SyntaxKind.AmpersandToken:
                return '&';
            case ts.SyntaxKind.BarToken:
                return '|';
            case ts.SyntaxKind.CaretToken:
                return '^';

            case ts.SyntaxKind.AmpersandAmpersandToken:
                return '&&';
            case ts.SyntaxKind.BarBarToken:
                return '||';

            case ts.SyntaxKind.EqualsToken:
                return '=';
            case ts.SyntaxKind.PlusEqualsToken:
                return '+=';
            case ts.SyntaxKind.MinusEqualsToken:
                return '-=';
            case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
                return '??=';
            case ts.SyntaxKind.AsteriskEqualsToken:
                return '*=';
            case ts.SyntaxKind.SlashEqualsToken:
                return '/=';
            case ts.SyntaxKind.PercentEqualsToken:
                return '%=';
            case ts.SyntaxKind.AmpersandEqualsToken:
                return '&=';
            case ts.SyntaxKind.BarEqualsToken:
                return '|=';
            case ts.SyntaxKind.CaretEqualsToken:
                return '^=';
            case ts.SyntaxKind.LessThanLessThanEqualsToken:
                return '<<=';
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                return '>>>=';
            case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                return '>>=';
            case ts.SyntaxKind.QuestionQuestionEqualsToken:
                return '??=';
        }
        return '';
    }
}
