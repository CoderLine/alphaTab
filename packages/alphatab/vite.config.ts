import path from 'node:path';
import url from 'node:url';
import type { Class, VariableDeclaration } from '@oxc-project/types';
import MagicString from 'magic-string';
import { parseAst } from 'rolldown/parseAst';
import type { OutputOptions } from 'rollup';
import { defineConfig, type LibraryOptions, type Plugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { addDts, defaultBuildUserConfig, esm, umd } from '../tooling/src/vite';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// ensure we have file extensions in the URL worker resolve area
const adjustScriptPathsPlugin = (min: boolean) => {
    return {
        name: 'adjust-script-paths',
        renderChunk(code) {
            const modifiedCode = new MagicString(code);
            const extension = min ? '.min.mjs' : '.mjs';
            modifiedCode.replaceAll(
                /(@coderline\/alphatab|\.)\/alphaTab\.(core|worker|worklet)(\.ts)?(['"])/g,
                `./alphaTab.$2${extension}$4`
            );

            return {
                code: modifiedCode.toString(),
                map: modifiedCode.generateMap()
            };
        }
    } satisfies Plugin;
};

// Rolldown unconditionally lowers top-level `class X { ... }` declarations to
// `var X = class { ... };` (documented as TDZ-hoisting behaviour, independent
// of `output.topLevelVar`). Downstream tooling that pattern-matches the
// published bundle on `class X` substrings — like the alphatab webpack plugin
// — depends on the declaration form, so we restore it here.
const preserveClassDeclarationsPlugin = (): Plugin => ({
    name: 'preserve-class-declarations',
    renderChunk(code) {
        const program = parseAst(code, { lang: 'js', sourceType: 'module' });
        const ms = new MagicString(code);
        let changed = false;

        for (const stmt of program.body) {
            if (stmt.type !== 'VariableDeclaration') {
                continue;
            }
            const varStmt = stmt as VariableDeclaration;
            if (varStmt.declarations.length !== 1) {
                continue;
            }
            const decl = varStmt.declarations[0];
            if (decl.id.type !== 'Identifier' || !decl.init || decl.init.type !== 'ClassExpression') {
                continue;
            }
            const classExpr = decl.init as Class;
            // skip when the inner name differs from the outer binding — that
            // would change semantics if the body self-references the inner name.
            if (classExpr.id && classExpr.id.name !== decl.id.name) {
                continue;
            }

            // drop `var <id> = ` prefix, leaving the class expression
            ms.remove(varStmt.start, classExpr.start);
            // promote to class declaration: insert the binding name after `class`
            // if it isn't already present as an inner name.
            if (!classExpr.id) {
                ms.appendLeft(classExpr.start + 'class'.length, ` ${decl.id.name}`);
            }
            // drop the trailing semicolon of the var statement
            if (code[varStmt.end - 1] === ';') {
                ms.remove(varStmt.end - 1, varStmt.end);
            }
            changed = true;
        }

        if (!changed) {
            return null;
        }
        return { code: ms.toString(), map: ms.generateMap({ hires: 'boundary' }) };
    }
});

export default defineConfig(({ mode }) => {
    const config = defaultBuildUserConfig(__dirname);
    config.plugins!.push(
        viteStaticCopy({
            // `stripBase` flattens so files land directly under `font/` and
            // `soundfont/` instead of preserving the `font/bravura/` prefix.
            targets: [
                { src: 'font/bravura/*', dest: 'font/', rename: { stripBase: true } },
                { src: 'font/sonivox/*', dest: 'soundfont/', rename: { stripBase: true } }
            ]
        })
    );

    const lib = config.build!.lib! as LibraryOptions;
    lib.name = 'alphaTab';

    switch (mode) {
        case 'umd':
            umd(config, __dirname, 'alphaTab', 'src/alphaTab.main.ts', true);
            break;
        //case 'esm':
        default: {
            esm(config, __dirname, 'alphaTab', 'src/alphaTab.main.ts');

            const entry = lib.entry as Record<string, string>;
            entry['alphaTab.core'] = path.resolve(__dirname, 'src/alphaTab.core.ts');
            entry['alphaTab.worker'] = path.resolve(__dirname, 'src/alphaTab.worker.ts');
            entry['alphaTab.worklet'] = path.resolve(__dirname, 'src/alphaTab.worklet.ts');

            (config.build!.rollupOptions!.external as string[]).push('@coderline/alphatab/alphaTab.core');

            for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
                const isMin = (output.entryFileNames as string).includes('.min');
                (output.plugins as Plugin[]).push(
                    adjustScriptPathsPlugin(isMin),
                    preserveClassDeclarationsPlugin()
                );
            }

            // alphaTab.core is an internal runtime-split JS chunk; its types
            // are already re-exported through alphaTab.main, so no separate
            // bundled `alphaTab.core.d.ts` is published.
            addDts(config, __dirname, {
                shouldEmitForChunk: chunk => !chunk.facadeModuleId!.endsWith('alphaTab.core.ts')
            });
            break;
        }
    }

    return config;
});
