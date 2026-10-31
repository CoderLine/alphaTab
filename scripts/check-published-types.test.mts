import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { checkSpecifiers, exportedTypes, moduleSpecifiers } from './check-published-types.mts';

const packageRoot = path.resolve('/consumer/node_modules/@scope/pkg');
const entry = path.join(packageRoot, 'dist', 'index.d.ts');

function existing(...files: string[]) {
    const set = new Set(files.map(f => path.join(packageRoot, f)));
    return (file: string) => set.has(file);
}

describe('moduleSpecifiers', () => {
    it('finds imports, re-exports, import types and reference paths', () => {
        const source = [
            "import type { A } from './a';",
            'export * from "./b";',
            "import './side-effect';",
            "export type C = import('./c').C;",
            '/// <reference path="./d.d.ts" />',
            "import { E } from 'pkg';"
        ].join('\n');
        assert.deepEqual(moduleSpecifiers(source).sort(), ['./a', './b', './c', './d.d.ts', './side-effect', 'pkg']);
    });
});

describe('checkSpecifiers', () => {
    it('accepts package imports and relative imports of shipped declarations', () => {
        const source =
            "import type { A } from './a';\nimport type { B } from './sub';\nimport { C } from 'other/sub';\n";
        assert.deepEqual(
            checkSpecifiers(packageRoot, entry, source, existing('dist/a.d.ts', 'dist/sub/index.d.ts')),
            []
        );
    });

    it('rejects relative imports leaving the package, missing targets and source paths', () => {
        const source =
            "import type { A } from './../../alphatex/src/types';\nimport type { B } from './missing';\nimport { C } from '@scope/other/src/c';\n";
        assert.deepEqual(checkSpecifiers(packageRoot, entry, source, existing()), [
            "'./../../alphatex/src/types' refers to sources",
            "'./../../alphatex/src/types' resolves outside of the package",
            "'./missing' resolves to no declaration file",
            "'@scope/other/src/c' refers to sources"
        ]);
    });
});

describe('exportedTypes', () => {
    it('collects the types of every condition and the top-level types field', () => {
        assert.deepEqual(
            exportedTypes({
                name: '@scope/pkg',
                types: './dist/index.d.ts',
                exports: {
                    '.': {
                        browser: { types: './dist/index.browser.d.ts', default: './dist/index.browser.mjs' },
                        default: { types: './dist/index.d.ts', default: './dist/index.mjs' }
                    },
                    './*': { types: './dist/*.d.ts', import: './dist/*.mjs' },
                    './package.json': './package.json'
                }
            }),
            [
                ['.', './dist/index.d.ts'],
                ['.', './dist/index.browser.d.ts'],
                ['.', './dist/index.d.ts'],
                ['./*', './dist/*.d.ts']
            ]
        );
    });
});
