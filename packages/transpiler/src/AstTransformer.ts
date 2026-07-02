import path from 'node:path';
import ts from 'typescript';
import type EmitterContextBase from './EmitterContextBase';
import { HandlerRegistry } from './HandlerRegistry';
import * as cs from './ir/Ir';
import { findAllTags, JsDocTag } from './jsDocTags';
import { SmartCastLowering } from './passes/SmartCastLoweringPass';
import { createLazyTypeRef } from './TransformerHelpers';
import { removeExtension } from './transforms/ExprHelpers';
import { visitTopLevelFunctionDeclaration, visitTopLevelVariableStatement } from './transforms/Members';
import { AlphaTabCore } from './typeRegistry';
import { fileNameToWrapperClassName } from './casing';

export interface AttributeNames {
    testClassAttribute: string;
    testMethodAttribute: string;
    snapshotFileAttribute: string;
    deprecatedAttributeName: string;
}

export interface LanguageDescriptor {
    readonly fileExtension: string;
    readonly attributeNames: AttributeNames;
    buildFileName(fileName: string, context: EmitterContextBase, isTestFile: boolean): string;
    registerHandlers(registry: HandlerRegistry): void;
    postInit?(transformer: AstTransformer): void;
}

export default class AstTransformer {
    readonly typeScriptFile: ts.SourceFile;
    readonly csharpFile: cs.SourceFile;
    readonly context: EmitterContextBase;
    readonly smartCastLowering: SmartCastLowering;
    readonly attributeNames: AttributeNames;

    currentClassElement: ts.ClassElement | null = null;
    readonly declarationOrAssignmentTypeStack: ts.Type[] = [];

    /** Optional post-processor for type parameter declarations, set by language descriptors. */
    typeParameterProcessor: ((d: cs.TypeParameterDeclaration, p: ts.TypeParameterDeclaration) => void) | null = null;

    /** Optional wrapper for visitTestClassMethod, set by language descriptors needing param scoping. */
    visitTestClassMethodWrapper:
        | ((
              parent: cs.ClassDeclaration,
              d: ts.FunctionDeclaration,
              base: (parent: cs.ClassDeclaration, d: ts.FunctionDeclaration) => cs.MethodDeclaration
          ) => cs.MethodDeclaration)
        | null = null;

    private readonly _registry: HandlerRegistry;

    constructor(typeScript: ts.SourceFile, context: EmitterContextBase, descriptor: LanguageDescriptor) {
        this.typeScriptFile = typeScript;
        this.context = context;
        this.attributeNames = descriptor.attributeNames;
        this.smartCastLowering = new SmartCastLowering(context, (parent, tsNode, tsType, tsSymbol) =>
            createLazyTypeRef(context, parent, tsNode, tsType, tsSymbol)
        );

        const fileName = descriptor.buildFileName(
            path.relative(
                path.dirname(context.compilerOptions.configFilePath as string),
                path.resolve(typeScript.fileName)
            ),
            context,
            typeScript.fileName.includes('/test/')
        );

        this.csharpFile = {
            parent: null,
            tsNode: typeScript,
            nodeType: cs.SyntaxKind.SourceFile,
            fileName,
            usings: context.getDefaultUsings().map(
                u =>
                    ({
                        name: u,
                        nodeType: cs.SyntaxKind.UsingDeclaration
                    }) as cs.UsingDeclaration
            ),
            namespace: {
                parent: null,
                nodeType: cs.SyntaxKind.NamespaceDeclaration,
                namespace: context.toNamespaceNameCase('alphaTab'),
                declarations: []
            }
        };
        this.csharpFile.namespace.parent = this.csharpFile;

        this._registry = new HandlerRegistry();
        descriptor.registerHandlers(this._registry);
        descriptor.postInit?.(this);
    }

    visit(parent: cs.Node, node: ts.Node): cs.Node | null {
        return this._registry.resolve(node.kind)(this, parent, node);
    }

    // Typed convenience wrappers — delegate to visit() with result cast.
    // These allow transform modules to keep their existing call-sites unchanged
    // during migration from TransformerState.
    visitExpression(parent: cs.Node, expression: ts.Expression): cs.Expression | null {
        const visited = this.visit(parent, expression) as cs.Expression | null;
        if (!visited?.tsNode) {
            return visited;
        }
        return this.smartCastLowering.wrapToSmartCast(parent, visited, expression);
    }

    visitStatement(parent: cs.Node, s: ts.Statement): cs.Statement | null {
        return this.visit(parent, s) as cs.Statement | null;
    }

    visitBlock(parent: cs.Node, block: ts.Block): cs.Block {
        return this.visit(parent, block) as cs.Block;
    }

    visitClassElement(parent: cs.ClassDeclaration, classElement: ts.ClassElement): void {
        this.currentClassElement = classElement;
        if (!this._registry.has(classElement.kind)) {
            this.context.addTsNodeDiagnostics(
                classElement,
                `Unsupported class element: ${ts.SyntaxKind[classElement.kind]}`,
                ts.DiagnosticCategory.Error
            );
        } else {
            this.visit(parent as unknown as cs.Node, classElement);
        }
        this.currentClassElement = null;
    }

    transform(): void {
        if (this.typeScriptFile.statements.length === 0) {
            return;
        }

        switch (this.typeScriptFile.statements[0].kind) {
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.InterfaceDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.EnumDeclaration:
            case ts.SyntaxKind.TypeAliasDeclaration:
                break;
            default:
                if (shouldSkip(this.typeScriptFile.statements[0], false, this.context.targetTag)) {
                    return;
                }
                break;
        }

        let defaultExport: ts.Declaration | null = null;
        const additionalExportDeclarations: ts.Declaration[] = [];
        const additionalNonExportDeclarations: ts.Declaration[] = [];
        const additionalNestedExportDeclarations: ts.Declaration[] = [];
        const additionalNestedNonExportsDeclarations: ts.Declaration[] = [];
        const globalStatements: ts.Statement[] = [];
        const testClasses: ts.CallExpression[] = [];
        const globalExports: ts.ExportDeclaration[] = [];

        for (const s of this.typeScriptFile.statements) {
            if (ts.isExportDeclaration(s)) {
                globalExports.push(s);
            } else if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isEnumDeclaration(s)) {
                const isExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                const isDefaultExport = _isDefaultExport(s, this.typeScriptFile);
                if (isExport && isDefaultExport) {
                    defaultExport = s;
                } else if (isExport) {
                    additionalExportDeclarations.push(s);
                } else {
                    additionalNonExportDeclarations.push(s);
                }
            } else if (ts.isTypeAliasDeclaration(s)) {
                const isExport = s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                const isDefaultExport = _isDefaultExport(s, this.typeScriptFile);
                if (isExport && isDefaultExport) {
                    defaultExport = s;
                } else if (isExport) {
                    additionalExportDeclarations.push(s);
                } else {
                    additionalNonExportDeclarations.push(s);
                }
            } else if (ts.isVariableStatement(s) || ts.isFunctionDeclaration(s)) {
                const isExport =
                    'modifiers' in s && s.modifiers && !!s.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExport) {
                    additionalNestedExportDeclarations.push(s as ts.Declaration);
                } else {
                    additionalNestedNonExportsDeclarations.push(s as ts.Declaration);
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

        if (path.basename(this.typeScriptFile.fileName).toLowerCase() === AlphaTabCore.coreEntryFile) {
            _validateCoreEntryExports(this, globalExports, globalStatements);
        } else {
            const targetTag = this.context.targetTag;
            if (!defaultExport || !ts.isClassDeclaration(defaultExport)) {
                for (const s of globalStatements) {
                    if (!shouldSkip(s, true, targetTag)) {
                        this.context.addTsNodeDiagnostics(
                            s,
                            'Global statements in modules are only allowed if there is a default class export',
                            ts.DiagnosticCategory.Error
                        );
                    }
                }
            }
            const folders: string[] = path
                .dirname(
                    path.relative(
                        path.dirname(this.context.compilerOptions.configFilePath as string),
                        path.resolve(this.typeScriptFile.fileName)
                    )
                )
                .split(path.sep);
            if (folders.length > 0 && (folders[0] === 'src' || folders[0] === 'test')) {
                folders.shift();
            }
            const namespaceFolders = folders.filter(f => f !== '' && f !== '.');
            this.csharpFile.namespace.namespace =
                this.context.toNamespaceNameCase('alphaTab') +
                namespaceFolders.map(f => `.${this.context.toNamespaceNameCase(f)}`).join('');

            const ns = this.csharpFile.namespace as cs.Node;
            if (defaultExport) {
                // Per the wrapper-class extension: top-level functions and var/let/const
                // always land in the synthetic <FileName>Globals wrapper, not absorbed
                // into the default class. Only module-level expression statements still
                // ride along with the default class via _pendingGlobalStatements.
                this._visitTopLevelDeclaration(defaultExport, [], [], globalStatements);
            }
            for (const d of additionalExportDeclarations) {
                this._visitTopLevelDeclaration(d);
            }
            for (const d of additionalNonExportDeclarations) {
                this._visitTopLevelDeclaration(d);
            }
            this._visitGlobalsWrapper(
                additionalNestedExportDeclarations,
                additionalNestedNonExportsDeclarations
            );
            for (const d of testClasses) {
                this.visit(ns, d);
            }

            if (this.csharpFile.namespace.declarations.length > 0) {
                this.context.addSourceFile(this.csharpFile);
            }
        }
    }

    private _visitTopLevelDeclaration(
        node: ts.Declaration,
        additionalNestedExportDeclarations?: ts.Declaration[],
        additionalNestedNonExportsDeclarations?: ts.Declaration[],
        globalStatements?: ts.Statement[]
    ): void {
        // Top-level class declarations carry extra context (nested decls, global statements).
        // Pass these via transformer state so the ClassDeclaration handler can pick them up.
        if (ts.isClassDeclaration(node)) {
            this._pendingNestedExports = additionalNestedExportDeclarations ?? [];
            this._pendingNestedNonExports = additionalNestedNonExportsDeclarations ?? [];
            this._pendingGlobalStatements = globalStatements ?? [];
        }
        this.visit(this.csharpFile.namespace as unknown as cs.Node, node);
        this._pendingNestedExports = [];
        this._pendingNestedNonExports = [];
        this._pendingGlobalStatements = [];
    }

    /** Scratch storage for top-level class declaration extra context. */
    _pendingNestedExports: ts.Declaration[] = [];
    _pendingNestedNonExports: ts.Declaration[] = [];
    _pendingGlobalStatements: ts.Statement[] = [];

    /**
     * Builds a synthetic `<FileName>Globals` class hosting all top-level
     * functions and var/let/const declarations as static members. The
     * wrapper class is internal by default and promoted to public if any
     * member is `@public`.
     */
    private _visitGlobalsWrapper(
        exportDeclarations: ts.Declaration[],
        nonExportDeclarations: ts.Declaration[]
    ): void {
        if (exportDeclarations.length === 0 && nonExportDeclarations.length === 0) {
            return;
        }

        const targetTag = this.context.targetTag;
        const allDecls = [...exportDeclarations, ...nonExportDeclarations].filter(
            d => !shouldSkip(d, true, targetTag)
        );
        if (allDecls.length === 0) {
            return;
        }

        const className = fileNameToWrapperClassName(this.typeScriptFile.fileName);
        const wrapper: cs.ClassDeclaration = {
            parent: this.csharpFile.namespace,
            nodeType: cs.SyntaxKind.ClassDeclaration,
            name: className,
            members: [],
            visibility: cs.Visibility.Internal,
            isAbstract: false,
            isStatic: true,
            partial: false,
            hasVirtualMembersOrSubClasses: false,
            tsNode: this.typeScriptFile
        };
        this.csharpFile.namespace.declarations.push(wrapper);

        // Skip overload signatures: only emit one MethodDeclaration per name
        // (the implementation with a body). TS guarantees at most one body
        // per overload set.
        const emittedFunctionNames = new Set<string>();
        for (const d of allDecls) {
            if (ts.isFunctionDeclaration(d)) {
                if (!d.body) {
                    continue;
                }
                if (!d.name) {
                    continue;
                }
                const name = d.name.text;
                if (emittedFunctionNames.has(name)) {
                    this.context.addTsNodeDiagnostics(
                        d,
                        `Multiple function declarations with body for "${name}" are not supported`,
                        ts.DiagnosticCategory.Error
                    );
                    continue;
                }
                emittedFunctionNames.add(name);
                visitTopLevelFunctionDeclaration(this, wrapper, d);
            } else if (ts.isVariableStatement(d)) {
                visitTopLevelVariableStatement(this, wrapper, d);
            }
        }

        if (wrapper.members.length === 0) {
            // All decls were skipped (e.g. signature-only overloads); drop wrapper.
            const idx = this.csharpFile.namespace.declarations.indexOf(wrapper);
            if (idx >= 0) {
                this.csharpFile.namespace.declarations.splice(idx, 1);
            }
            return;
        }

        // Promote wrapper visibility to Public if any member is Public.
        for (const m of wrapper.members) {
            if ('visibility' in m && m.visibility === cs.Visibility.Public) {
                wrapper.visibility = cs.Visibility.Public;
                break;
            }
        }
    }
}

function _isDefaultExport(s: ts.NamedDeclaration, typeScriptFile: ts.SourceFile): boolean {
    if (
        'modifiers' in s &&
        s.modifiers &&
        (s.modifiers as ts.NodeArray<ts.Modifier>).find(m => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
        return true;
    }
    const fileName = removeExtension(path.basename(typeScriptFile.fileName));
    return !!(s.name && ts.isIdentifier(s.name) && fileName === s.name.text);
}

export function shouldSkip(node: ts.Node, checkComments: boolean, targetTag: string): boolean {
    if (checkComments) {
        const text = node.getSourceFile().text;
        const commentText = text.substr(node.getStart() - node.getLeadingTriviaWidth(), node.getLeadingTriviaWidth());
        if (commentText.indexOf('/*@target web*/') >= 0) {
            return true;
        }
    }
    const tags = findAllTags(node, JsDocTag.target);
    if (tags.length > 0) {
        return !tags.find(t => t.comment === targetTag);
    }
    return false;
}

function _validateCoreEntryExports(
    transformer: AstTransformer,
    globalExports: ts.ExportDeclaration[],
    globalStatements: ts.Statement[]
): void {
    for (const x of globalExports) {
        if (!x.name && x.exportClause) {
            if (ts.isNamespaceExport(x.exportClause)) {
                if (!x.moduleSpecifier) {
                    transformer.context.addTsNodeDiagnostics(
                        x.exportClause,
                        'Failed to export namespace, missing module specifier',
                        ts.DiagnosticCategory.Error
                    );
                } else {
                    const module = transformer.context.typeChecker.getSymbolAtLocation(x.moduleSpecifier);
                    if (!module) {
                        transformer.context.addTsNodeDiagnostics(
                            x.exportClause,
                            'Failed to export namespace, cannot resolve module',
                            ts.DiagnosticCategory.Error
                        );
                    }
                }
            } else {
                for (const e of x.exportClause.elements) {
                    const symbol =
                        transformer.context.typeChecker.getTypeAtLocation(e.name)?.symbol ??
                        transformer.context.typeChecker.getSymbolAtLocation(e.name);
                    if (!symbol) {
                        transformer.context.addTsNodeDiagnostics(
                            e,
                            'Exported symbol could not be resolved',
                            ts.DiagnosticCategory.Error
                        );
                    }
                }
            }
        } else {
            transformer.context.addTsNodeDiagnostics(x, 'Unsupported export', ts.DiagnosticCategory.Error);
        }
    }
    for (const s of globalStatements) {
        if (ts.isVariableStatement(s) && s.modifiers?.find(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            for (const d of s.declarationList.declarations) {
                if (d.initializer && ts.isObjectLiteralExpression(d.initializer)) {
                    for (const p of d.initializer.properties) {
                        if (ts.isShorthandPropertyAssignment(p)) {
                            const symbol = transformer.context.typeChecker.getTypeAtLocation(p.name)?.symbol;
                            if (!symbol) {
                                transformer.context.addTsNodeDiagnostics(
                                    p,
                                    'Exported symbol could not be resolved',
                                    ts.DiagnosticCategory.Error
                                );
                            }
                        } else {
                            transformer.context.addTsNodeDiagnostics(
                                p,
                                'Unsupported export',
                                ts.DiagnosticCategory.Message
                            );
                        }
                    }
                } else {
                    transformer.context.addTsNodeDiagnostics(d, 'Unsupported export', ts.DiagnosticCategory.Message);
                }
            }
        }
    }
}
