import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createApiDtsFiles, unresolvedRelativeImports } from '../src/typescript';

describe('createApiDtsFiles', () => {
    let projectDir = '';

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    async function run(entry: string, extraFiles: Record<string, string> = {}) {
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphatab-dts-'));
        const typesDir = path.join(projectDir, 'types');
        fs.mkdirSync(typesDir);
        fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
        const files: Record<string, string> = {
            'internal.d.ts':
                '/**\n * @internal\n */\nexport interface Hidden {\n}\n/**\n * @public\n */\nexport interface Shown {\n}\n',
            'entry.d.ts': entry,
            ...extraFiles
        };
        for (const [name, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(typesDir, name), content);
        }

        const errors: string[] = [];
        const logger = { error: (m: string) => errors.push(m), info() {}, log() {}, warn() {} };
        await createApiDtsFiles(
            typesDir,
            Object.keys(files).map(name => path.join(typesDir, name)),
            projectDir,
            path.join(projectDir, 'out'),
            logger
        );
        return errors;
    }

    it('rejects public declarations that reference a removed internal type', async () => {
        const errors = await run(
            "import type { Hidden } from './internal';\n/**\n * @public\n */\nexport declare function f(): Hidden[];\n"
        );
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("'Hidden' is still referenced");
    });

    it('accepts public declarations that only reference public types', async () => {
        const errors = await run(
            "import type { Hidden, Shown } from './internal';\n/**\n * @public\n */\nexport declare function f(): Shown;\n/**\n * @internal\n */\nexport declare function g(): Hidden;\n"
        );
        expect(errors).toEqual([]);
        const out = fs.readFileSync(path.join(projectDir, 'out', 'entry.d.ts'), 'utf8');
        expect(out).toContain("import type { Shown } from './internal';");
        expect(out).not.toContain('Hidden');
    });

    it('rejects relative imports of files that are not shipped', async () => {
        const errors = await run(
            "import type { Shown } from './internal';\nimport type { Other } from '../../other/src/types';\n/**\n * @public\n */\nexport declare function f(a: Other): Shown;\n"
        );
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("'../../other/src/types' does not resolve to a declaration file of the package");
    });
});

describe('unresolvedRelativeImports', () => {
    let rootDir = '';

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    it('accepts package imports and relative imports of declaration files inside the root', () => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphatab-dts-'));
        fs.mkdirSync(path.join(rootDir, 'sub'));
        fs.writeFileSync(path.join(rootDir, 'a.d.ts'), '');
        fs.writeFileSync(path.join(rootDir, 'sub', 'index.d.ts'), '');
        const content =
            "import type { A } from './a';\nexport * from './sub';\nexport type B = import('./a.js').B;\nimport type { C } from 'pkg/sub';\n";
        expect(unresolvedRelativeImports(path.join(rootDir, 'entry.d.ts'), content, rootDir)).toEqual([]);
    });

    it('rejects relative imports that leave the root or point at nothing', () => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphatab-dts-'));
        fs.writeFileSync(path.join(rootDir, 'source.ts'), '');
        const content =
            "import type { A } from '../outside';\nexport type B = import('./missing').B;\nimport type { C } from './source';\n";
        expect(unresolvedRelativeImports(path.join(rootDir, 'entry.d.ts'), content, rootDir)).toEqual([
            '../outside',
            './missing',
            './source'
        ]);
    });
});
