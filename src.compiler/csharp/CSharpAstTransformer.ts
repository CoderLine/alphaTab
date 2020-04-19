import * as ts from 'typescript';
import * as cs from './CSharpAst';
import * as path from 'path';
import CSharpEmitterContext from './CSharpEmitterContext';

export default class CSharpAstTransformer {
    private _typeScriptFile: ts.SourceFile;
    private _csharpFile: cs.SourceFile;
    private _context: CSharpEmitterContext;

    public constructor(typeScript: ts.SourceFile, context: CSharpEmitterContext) {
        this._typeScriptFile = typeScript;
        this._context = context;

        let fileName = path.relative(
            path.resolve(this._context.compilerOptions.baseUrl!),
            path.resolve(this._typeScriptFile.fileName)
        );
        fileName = path.join(context.compilerOptions.outDir!, this.removeExtension(fileName) + '.cs');

        this._csharpFile = {
            parent: null,
            tsNode: this._typeScriptFile,
            nodeType: cs.SyntaxKind.SourceFile,
            fileName: fileName,
            usings: [],
            namespace: {
                parent: null,
                nodeType: cs.SyntaxKind.NamespaceDeclaration,
                namespace: 'AlphaTab',
                declarations: []
            }
        };
        this._csharpFile.namespace.parent = this._csharpFile;
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

        this._typeScriptFile.statements.forEach(s => {
            if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isEnumDeclaration(s)) {
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
                } else {
                    this._context.addTsNodeDiagnostics(
                        s,
                        'Only FunctionType type aliases are allowed',
                        ts.DiagnosticCategory.Error
                    );
                }
            } else if (ts.isVariableDeclaration(s) || ts.isFunctionDeclaration(s)) {
                const isExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
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
            } else if (ts.isExportDeclaration(s)) {
                globalExports.push(s);
            }
        });

        // TODO: Introduce setting for main library name.
        if (path.basename(this._typeScriptFile.fileName).toLowerCase() === 'alphatab.ts') {
            // TODO: register global exports
        } else {
            // validate global statements
            if (!defaultExport || !ts.isClassDeclaration(defaultExport)) {
                globalStatements.forEach(s => {
                    this._context.addTsNodeDiagnostics(
                        s,
                        'Global statements in modules are only allowed if there is a default class export',
                        ts.DiagnosticCategory.Error
                    );
                });
                additionalNestedExportDeclarations.forEach(s => {
                    this._context.addTsNodeDiagnostics(
                        s,
                        'Global statements in modules are only allowed if there is a default class export',
                        ts.DiagnosticCategory.Error
                    );
                });
                additionalNestedNonExportsDeclarations.forEach(s => {
                    this._context.addTsNodeDiagnostics(
                        s,
                        'Global statements in modules are only allowed if there is a default class export',
                        ts.DiagnosticCategory.Error
                    );
                });
            }

            // TODO: make root namespace configurable from outside.
            let folders = path
                .dirname(
                    path.relative(
                        path.resolve(this._context.compilerOptions.baseUrl!),
                        path.resolve(this._typeScriptFile.fileName)
                    )
                )
                .split(path.sep);
            // TODO: make default root folders configurable from outside
            if (folders.length > 0 && (folders[0] === 'src' || folders[0] === 'test')) {
                folders.shift();
            }
            this._csharpFile.namespace.namespace =
                'AlphaTab' + folders.map(f => '.' + f.substr(0, 1).toUpperCase() + f.substr(1)).join('');

            if (defaultExport) {
                this.visit(
                    defaultExport,
                    additionalNestedExportDeclarations,
                    additionalNestedNonExportsDeclarations,
                    globalStatements
                );
            }
            additionalExportDeclarations.forEach(d => this.visit(d));
            additionalNonExportDeclarations.forEach(d => this.visit(d));

            this._context.addSourceFile(this._csharpFile);
        }
    }

    private isDefaultExport(s: ts.NamedDeclaration): boolean {
        const isDefaultExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword);
        if (isDefaultExport) {
            return true;
        }

        // if the declaration has the same name as the file we consider it as default export
        const fileName = this.removeExtension(path.basename(this._typeScriptFile.fileName));
        if (s.name && ts.isIdentifier(s.name) && fileName === s.name.text) {
            return true;
        }

        return false;
    }

    private visit(
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
        } else if (ts.isTypeAliasDeclaration(node) && ts.isFunctionTypeNode(node.type)) {
            this.visitTypeAliasDeclaration(node);
        }

        return node;
    }

    private visitEnumDeclaration(node: ts.EnumDeclaration) {
        const csEnum: cs.EnumDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.EnumDeclaration,
            parent: this._csharpFile.namespace,
            members: [],
            tsNode: node
        };

        if (node.name) {
            csEnum.documentation = this.visitDocumentation(node.name);
        }

        node.members.forEach(m => this.visitEnumMember(csEnum, m));

        this._csharpFile.namespace.declarations.push(csEnum);
        this._context.registerSymbol(csEnum, node);
    }

    private visitEnumMember(parent: cs.EnumDeclaration, enumMember: ts.EnumMember) {
        const csEnumMember: cs.EnumMember = {
            parent: parent,
            tsNode: enumMember,
            nodeType: cs.SyntaxKind.EnumMember,
            name: enumMember.name.getText()
        };

        if (enumMember.initializer) {
            csEnumMember.initializer = this.visitExpression(csEnumMember, enumMember.initializer);
        }

        if (enumMember.name) {
            csEnumMember.documentation = this.visitDocumentation(enumMember.name);
        }

        parent.members.push(csEnumMember);
        // this._context.registerSymbol(csEnumMember, node);
    }

    private visitTypeAliasDeclaration(node: ts.TypeAliasDeclaration) {
        //throw new Error("Method not implemented.");
    }

    private visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
        let extendsClauses: ts.Node[] = [];

        node.heritageClauses?.forEach(c => {
            if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                extendsClauses = c.types.slice();
            }
        });

        const csInterface: cs.InterfaceDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name.text,
            nodeType: cs.SyntaxKind.InterfaceDeclaration,
            parent: this._csharpFile.namespace,
            members: [],
            tsNode: node
        };

        if (node.name) {
            csInterface.documentation = this.visitDocumentation(node.name);
        }

        if (node.typeParameters) {
            csInterface.typeParameters = node.typeParameters.map(p =>
                this.visitTypeParameterDeclaration(csInterface, p)
            );
        }

        if (extendsClauses && extendsClauses.length > 0) {
            csInterface.interfaces = extendsClauses.map(n => this.createUnresolvedTypeNode(csInterface, n));
        }

        node.members.forEach(m => this.visitInterfaceElement(csInterface, m));

        this._csharpFile.namespace.declarations.push(csInterface);
        this._context.registerSymbol(csInterface, node);
    }

    private visitTypeParameterDeclaration(parent: cs.Node, p: ts.TypeParameterDeclaration): any {
        const csTypeParameter: cs.TypeParameterDeclaration = {
            nodeType: cs.SyntaxKind.TypeParameterDeclaration,
            name: p.name.text,
            parent: parent,
            tsNode: p
        };

        return csTypeParameter;
    }

    private createUnresolvedTypeNode(parent: cs.Node | null, tsNode: ts.Node, tsType?: ts.Type): cs.TypeNode {
        if (!tsType) {
            tsType = this._context.typeChecker.getTypeAtLocation(tsNode);
        }

        const unresolved = {
            nodeType: cs.SyntaxKind.UnresolvedTypeNode,
            tsNode: tsNode,
            tsType: tsType,
            parent: parent
        } as cs.UnresolvedTypeNode;
        this._context.registerUnresolvedTypeNode(unresolved);
        return unresolved;
    }

    private visitClassDeclaration(
        node: ts.ClassDeclaration,
        additionalNestedExportDeclarations?: ts.Declaration[],
        additionalNestedNonExportsDeclarations?: ts.Declaration[],
        globalStatements?: ts.Statement[]
    ) {
        let extendsClause: ts.Node | null = null;
        let implementsClauses: ts.Node[] = [];

        node.heritageClauses?.forEach(c => {
            if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                extendsClause = c.types[0];
            }
            if (c.token === ts.SyntaxKind.ImplementsKeyword) {
                implementsClauses = c.types.slice();
            }
        });

        const csClass: cs.ClassDeclaration = {
            visibility: cs.Visibility.Public,
            name: node.name!.text,
            tsNode: node,
            nodeType: cs.SyntaxKind.ClassDeclaration,
            parent: this._csharpFile.namespace,
            isAbstract: !!node.modifiers && !!node.modifiers.find(m => m.kind === ts.SyntaxKind.AbstractKeyword),
            members: []
        };

        if (node.name) {
            csClass.documentation = this.visitDocumentation(node.name);
        }

        if (node.typeParameters) {
            csClass.typeParameters = node.typeParameters.map(p => this.visitTypeParameterDeclaration(csClass, p));
        }

        if (extendsClause) {
            csClass.baseClass = this.createUnresolvedTypeNode(csClass, extendsClause);
        }

        if (implementsClauses && implementsClauses.length > 0) {
            csClass.interfaces = implementsClauses.map(n => this.createUnresolvedTypeNode(csClass, n));
        }

        node.members.forEach(m => this.visitClassElement(csClass, m));

        this._csharpFile.namespace.declarations.push(csClass);
        this._context.registerSymbol(csClass, node);
    }
    private visitDocumentation(node: ts.Node): string | undefined {
        let symbol = this._context.typeChecker.getSymbolAtLocation(node);
        if (!symbol) {
            return undefined;
        }

        const docs = symbol.getDocumentationComment(this._context.typeChecker);
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

    private visitClassElement(parent: cs.ClassDeclaration, classElement: ts.ClassElement) {
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
            this._context.addTsNodeDiagnostics(
                classElement,
                'Unsupported class element: ' + ts.SyntaxKind[classElement.kind],
                ts.DiagnosticCategory.Error
            );
        }
    }

    private visitInterfaceElement(parent: cs.InterfaceDeclaration, classElement: ts.TypeElement) {
        if (ts.isMethodSignature(classElement)) {
            this.visitMethodSignature(parent, classElement);
        } else if (ts.isPropertySignature(classElement)) {
            this.visitPropertySignature(parent, classElement);
        } else {
            this._context.addTsNodeDiagnostics(
                classElement,
                'Unsupported interface element: ' + ts.SyntaxKind[classElement.kind],
                ts.DiagnosticCategory.Error
            );
        }
    }

    private visitPropertySignature(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.PropertySignature
    ) {
        const type = this._context.typeChecker.getTypeAtLocation(classElement);
        const csProperty: cs.PropertyDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            name: this.toPascalCase((classElement.name as ts.Identifier).text),
            type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, type),
            visibility: cs.Visibility.None,
            tsNode: classElement
        };

        if (classElement.name) {
            csProperty.documentation = this.visitDocumentation(classElement.name);
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

        parent.members.push(csProperty);
    }

    private toPascalCase(text: string): string {
        return text ? text.substr(0, 1).toUpperCase() + text.substr(1) : '';
    }

    private visitGetAccessor(parent: cs.ClassDeclaration, classElement: ts.GetAccessorDeclaration) {
        const propertyName = this.toPascalCase(classElement.name.getText());
        const member = parent.members.find(m => m.name === propertyName);
        if (member && member.nodeType === cs.SyntaxKind.PropertyDeclaration) {
            let existingProperty = member as cs.PropertyDeclaration;
            existingProperty.getAccessor = {
                keyword: 'get',
                parent: existingProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(existingProperty, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;
        } else {
            const signature = this._context.typeChecker.getSignatureFromDeclaration(classElement);
            const returnType = this._context.typeChecker.getReturnTypeOfSignature(signature!);

            let newProperty: cs.PropertyDeclaration = {
                isAbstract: false,
                isOverride: false,
                isVirtual: false,
                isStatic: false,
                name: propertyName,
                nodeType: cs.SyntaxKind.PropertyDeclaration,
                parent: parent,
                visibility: this.mapVisibility(classElement.modifiers),
                type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType)
            };

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

    private visitSetAccessor(parent: cs.ClassDeclaration, classElement: ts.SetAccessorDeclaration) {
        const propertyName = this.toPascalCase(classElement.name.getText());
        const member = parent.members.find(m => m.name === propertyName);
        if (member && member.nodeType === cs.SyntaxKind.PropertyDeclaration) {
            let existingProperty = member as cs.PropertyDeclaration;
            existingProperty.setAccessor = {
                keyword: 'set',
                parent: existingProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(existingProperty, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;
        } else {
            const signature = this._context.typeChecker.getSignatureFromDeclaration(classElement);
            const returnType = this._context.typeChecker.getReturnTypeOfSignature(signature!);

            let newProperty: cs.PropertyDeclaration = {
                isAbstract: false,
                isOverride: false,
                isVirtual: false,
                isStatic: false,
                name: propertyName,
                nodeType: cs.SyntaxKind.PropertyDeclaration,
                parent: parent,
                visibility: this.mapVisibility(classElement.modifiers),
                type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType)
            };

            newProperty.type.parent = newProperty;

            newProperty.setAccessor = {
                keyword: 'set',
                parent: newProperty,
                nodeType: cs.SyntaxKind.PropertyAccessorDeclaration,
                tsNode: classElement,
                body: classElement.body ? this.visitBlock(newProperty, classElement.body) : null
            } as cs.PropertyAccessorDeclaration;

            parent.members.push(newProperty);
        }
    }

    private visitPropertyDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.PropertyDeclaration
    ) {
        const visibility = this.mapVisibility(classElement.modifiers);
        if (parent.nodeType === cs.SyntaxKind.ClassDeclaration && visibility === cs.Visibility.Private) {
            this.visitPropertyDeclarationAsField(parent as cs.ClassDeclaration, classElement);
        } else {
            const type = this._context.typeChecker.getTypeAtLocation(classElement);
            const csProperty: cs.PropertyDeclaration = {
                parent: parent,
                nodeType: cs.SyntaxKind.PropertyDeclaration,
                isAbstract: false,
                isOverride: false,
                isStatic: false,
                isVirtual: false,
                name: this.toPascalCase(classElement.name.getText()),
                type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, type),
                visibility: visibility,
                tsNode: classElement
            };

            if (classElement.name) {
                csProperty.documentation = this.visitDocumentation(classElement.name);
            }

            let isReadonly = false;
            if (classElement.modifiers) {
                classElement.modifiers.forEach(m => {
                    switch (m.kind) {
                        case ts.SyntaxKind.AbstractKeyword:
                            csProperty.isAbstract = true;
                            break;
                        case ts.SyntaxKind.StaticKeyword:
                            csProperty.isStatic = true;
                            break;
                        case ts.SyntaxKind.ReadonlyKeyword:
                            isReadonly = true;
                            break;
                    }
                });
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
                csProperty.initializer = this.visitExpression(csProperty, classElement.initializer);
            }

            parent.members.push(csProperty);
        }
    }

    private visitPropertyDeclarationAsField(parent: cs.ClassDeclaration, classElement: ts.PropertyDeclaration) {
        const type = this._context.typeChecker.getTypeAtLocation(classElement);
        const csField: cs.FieldDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.FieldDeclaration,
            isStatic: false,
            isReadonly: false,
            name: this.toPascalCase(classElement.name.getText()),
            type: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, type),
            visibility: cs.Visibility.Private,
            tsNode: classElement
        };

        if (classElement.name) {
            csField.documentation = this.visitDocumentation(classElement.name);
        }

        if (classElement.modifiers) {
            classElement.modifiers.forEach(m => {
                switch (m.kind) {
                    case ts.SyntaxKind.StaticKeyword:
                        csField.isStatic = true;
                        break;
                    case ts.SyntaxKind.ReadonlyKeyword:
                        csField.isReadonly = true;
                        break;
                }
            });
        }

        csField.type.parent = csField;

        if (classElement.initializer) {
            csField.initializer = this.visitExpression(csField, classElement.initializer);
        }

        parent.members.push(csField);
    }

    private visitMethodDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodDeclaration
    ) {
        const signature = this._context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType = this._context.typeChecker.getReturnTypeOfSignature(signature!);

        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            name: this.toPascalCase((classElement.name as ts.Identifier).text),
            parameters: [],
            returnType: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType),
            visibility: this.mapVisibility(classElement.modifiers),
            tsNode: classElement
        };

        if (classElement.name) {
            csMethod.documentation = this.visitDocumentation(classElement.name);
        }

        if (classElement.modifiers) {
            classElement.modifiers.forEach(m => {
                switch (m.kind) {
                    case ts.SyntaxKind.AbstractKeyword:
                        csMethod.isAbstract = true;
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        csMethod.isStatic = true;
                        break;
                }
            });
        }

        // TODO: virtual/override

        csMethod.returnType.parent = csMethod;

        if (classElement.typeParameters && classElement.typeParameters.length > 0) {
            csMethod.typeParameters = classElement.typeParameters.map(
                p =>
                    ({
                        parent: csMethod,
                        name: p.name.text,
                        nodeType: cs.SyntaxKind.TypeParameterDeclaration,
                        tsNode: p
                    } as cs.TypeParameterDeclaration)
            );
        }

        classElement.parameters.forEach(p => this.visitMethodParameter(csMethod, p));

        if (classElement.body) {
            csMethod.body = this.visitBlock(csMethod, classElement.body);
        }

        parent.members.push(csMethod);
    }

    private visitBlock(parent: cs.Node, block: ts.Block): cs.Block {
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

    private visitStatement(parent: cs.Block, s: ts.Statement): cs.Statement | null {
        return null;
    }

    private visitMethodSignature(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodSignature
    ) {
        const signature = this._context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType = this._context.typeChecker.getReturnTypeOfSignature(signature!);

        const csMethod: cs.MethodDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.MethodDeclaration,
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            name: this.toPascalCase((classElement.name as ts.Identifier).text),
            parameters: [],
            returnType: this.createUnresolvedTypeNode(null, classElement.type ?? classElement, returnType),
            visibility: cs.Visibility.None,
            tsNode: classElement
        };

        if (classElement.name) {
            csMethod.documentation = this.visitDocumentation(classElement.name);
        }

        csMethod.returnType.parent = csMethod;

        if (classElement.typeParameters && classElement.typeParameters.length > 0) {
            csMethod.typeParameters = classElement.typeParameters.map(
                p =>
                    ({
                        parent: csMethod,
                        name: p.name.text,
                        nodeType: cs.SyntaxKind.TypeParameterDeclaration,
                        tsNode: p
                    } as cs.TypeParameterDeclaration)
            );
        }

        classElement.parameters.forEach(p => this.visitMethodParameter(csMethod, p));

        parent.members.push(csMethod);
    }
    private mapVisibility(modifiers: ts.ModifiersArray | undefined): cs.Visibility {
        if (modifiers) {
            for (const m of modifiers) {
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
        return cs.Visibility.Public;
    }
    private visitMethodParameter(csMethod: cs.MethodDeclarationBase, p: ts.ParameterDeclaration): void {
        const symbol = this._context.typeChecker.getSymbolAtLocation(p.name);
        const type = this._context.typeChecker.getTypeOfSymbolAtLocation(symbol!, p);

        const csMethodParameter: cs.ParameterDeclaration = {
            nodeType: cs.SyntaxKind.ParameterDeclaration,
            name: p.name.getText(),
            parent: csMethod,
            type: this.createUnresolvedTypeNode(null, p.type ?? p, type)
        };
        csMethodParameter.type.parent = csMethodParameter;

        if (p.questionToken) {
            csMethodParameter.type.isOptional = true;
        }

        if (p.name) {
            csMethodParameter.documentation = this.visitDocumentation(p.name);
        }

        csMethod.parameters.push(csMethodParameter);
    }

    private visitConstructorDeclaration(parent: cs.ClassDeclaration, classElement: ts.ConstructorDeclaration) {
        const csConstructor: cs.ConstructorDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.ConstructorDeclaration,
            name: '.ctor',
            parameters: [],
            isStatic: false,
            visibility: this.mapVisibility(classElement.modifiers),
            tsNode: classElement
        };

        classElement.parameters.forEach(p => this.visitMethodParameter(csConstructor, p));

        if (classElement.body) {
            csConstructor.body = this.visitBlock(csConstructor, classElement.body);
        }

        parent.members.push(csConstructor);
    }

    private visitExpression(parent: cs.Node, expression: ts.Expression): cs.Expression | undefined {
        return undefined;
    }

    private removeExtension(fileName: string) {
        return fileName.substring(0, fileName.lastIndexOf('.'));
    }
}
