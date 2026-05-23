import path from 'node:path';
import ts from 'typescript';
import type { Plugin } from 'vite';

/**
 * `afterDeclarations` transformer that rewrites tsconfig-path-aliased imports
 * in emitted `.d.ts` files back to relative paths, so bundled declarations
 * carry no `@coderline/alphatab/X` references that won't resolve at
 * consumption time.
 */
export function dtsPathsTransformer(
    mapping?: Record<string, string>,
    externals?: (string | RegExp)[]
): ts.TransformerFactory<ts.SourceFile | ts.Bundle> {
    return (context: ts.TransformationContext) => {
        if (!mapping) {
            mapping = {};
            const options = context.getCompilerOptions();
            if (options.paths) {
                for (const [k, v] of Object.entries(options.paths)) {
                    if (k.endsWith('*') && v[0].endsWith('*')) {
                        mapping[k.substring(0, k.length - 1)] = v[0].substring(0, v[0].length - 1);
                    }
                }
            }
        }

        const isExternal = (input: string) => {
            if (!externals) {
                return false;
            }
            for (const e of externals) {
                if (typeof e === 'string') {
                    if (input === e) {
                        return true;
                    }
                } else if (e instanceof RegExp) {
                    if (e.test(input)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const mapPath = (filePath: string, input: string): string | undefined => {
            for (const [k, v] of Object.entries(mapping!)) {
                if (input.startsWith(k) && !isExternal(input)) {
                    const absoluteFile = path.resolve(v, input.substring(k.length));
                    return `./${path.relative(path.dirname(filePath), absoluteFile).replaceAll('\\', '/')}`;
                }
            }
            return undefined;
        };

        return (source: ts.SourceFile | ts.Bundle) => {
            const sourceFilePath = ts.isSourceFile(source) ? source.fileName : source.sourceFiles[0].fileName;

            const visitor = (node: ts.Node): ts.Node => {
                if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    const mapped = mapPath(sourceFilePath, node.moduleSpecifier.text);
                    if (mapped) {
                        return ts.factory.createExportDeclaration(
                            node.modifiers,
                            node.isTypeOnly,
                            node.exportClause,
                            ts.factory.createStringLiteral(mapped),
                            node.attributes
                        );
                    }
                    return node;
                }
                if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
                    const mapped = mapPath(sourceFilePath, node.moduleSpecifier.text);
                    if (mapped) {
                        return ts.factory.createImportDeclaration(
                            node.modifiers,
                            node.importClause,
                            ts.factory.createStringLiteral(mapped),
                            node.attributes
                        );
                    }
                    return node;
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitEachChild(source, visitor, context);
        };
    };
}

export interface EmitDtsOptions {
    projectDir: string;
    tsconfigPath?: string;
    /** Output directory for emitted per-file `.d.ts`. Default: `dist/types`. */
    declarationDir?: string;
    /** Extra `afterDeclarations` transformers; `dtsPathsTransformer()` is appended automatically. */
    afterDeclarations?: ts.TransformerFactory<ts.SourceFile | ts.Bundle>[];
}

/**
 * Vite plugin that drives `ts.createProgram(...).emit(emitOnlyDtsFiles)` once
 * per process per `(projectDir, declarationDir)` pair, applying
 * {@link dtsPathsTransformer} as `afterDeclarations`. Produces the per-file
 * `.d.ts` tree under `declarationDir` that the api-extractor bundling step in
 * `vite.ts` rolls up into a single bundled `.d.ts` per entry.
 */
const emitCache = new Map<string, boolean>();

export function emitDtsPlugin(options: EmitDtsOptions): Plugin {
    const tsconfigPath = options.tsconfigPath ?? path.resolve(options.projectDir, 'tsconfig.json');
    const declarationDir = path.resolve(options.projectDir, options.declarationDir ?? 'dist/types');
    const cacheKey = `${options.projectDir}::${declarationDir}`;

    return {
        name: 'alphatab:emit-dts',
        async buildStart() {
            if (emitCache.get(cacheKey)) {
                return;
            }

            const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
            if (configFile.error) {
                this.error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
            }

            const srcDir = path.resolve(options.projectDir, 'src');
            const parsed = ts.parseJsonConfigFileContent(
                configFile.config,
                ts.sys,
                path.dirname(tsconfigPath),
                {
                    declaration: true,
                    emitDeclarationOnly: true,
                    declarationDir,
                    noEmit: false,
                    declarationMap: false,
                    // root the emit at src/ so paths mirror the source tree
                    // (src/Foo.ts -> dist/types/Foo.d.ts).
                    rootDir: srcDir
                },
                tsconfigPath
            );

            if (parsed.errors.length > 0) {
                for (const diagnostic of parsed.errors) {
                    this.warn(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                }
            }

            const program = ts.createProgram({
                rootNames: parsed.fileNames,
                options: parsed.options,
                projectReferences: parsed.projectReferences
            });

            const transformers: ts.TransformerFactory<ts.SourceFile | ts.Bundle>[] = [
                ...(options.afterDeclarations ?? []),
                dtsPathsTransformer()
            ];

            // confine emit to `declarationDir`; TS would otherwise also write
            // `.d.ts` next to any source outside `rootDir` (cross-package
            // imports in monorepos).
            const declarationDirPrefix = declarationDir + path.sep;
            const filteredWriteFile: ts.WriteFileCallback = (
                fileName,
                content,
                writeByteOrderMark,
                onError,
                sourceFiles,
                data
            ) => {
                const normalized = path.resolve(fileName);
                if (!normalized.startsWith(declarationDirPrefix)) {
                    return;
                }
                ts.sys.writeFile(normalized, content, writeByteOrderMark);
                void onError;
                void sourceFiles;
                void data;
            };

            const emitResult = program.emit(
                undefined,
                filteredWriteFile,
                undefined,
                /*emitOnlyDtsFiles*/ true,
                { afterDeclarations: transformers }
            );

            // Tolerated diagnostics that don't block emission:
            // TS6059: file not under 'rootDir' (expected for cross-package
            //   monorepo imports — TS still emits the per-file .d.ts).
            // TS18003: no inputs were found (false alarm when the program is
            //   constrained via fileNames).
            const tolerated = new Set<number>([6059, 18003]);

            const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            for (const diagnostic of diagnostics) {
                if (tolerated.has(diagnostic.code)) {
                    continue;
                }
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                const location =
                    diagnostic.file && diagnostic.start !== undefined
                        ? (() => {
                              const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
                                  diagnostic.start!
                              );
                              return `${diagnostic.file.fileName}:${line + 1}:${character + 1}: `;
                          })()
                        : '';
                this.warn(`${location}${message}`);
            }

            // semantic errors surface as warnings; TS still emits `.d.ts`.
            // `npm run typecheck` is the canonical strict gate.
            if (emitResult.emitSkipped) {
                this.error('TypeScript declaration emit was skipped');
            }

            emitCache.set(cacheKey, true);
        }
    };
}
