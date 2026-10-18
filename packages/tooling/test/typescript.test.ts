import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createApiDtsFiles } from '../src/typescript';

describe('createApiDtsFiles', () => {
    let projectDir = '';

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    async function run(entry: string) {
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphatab-dts-'));
        const typesDir = path.join(projectDir, 'types');
        fs.mkdirSync(typesDir);
        fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
        fs.writeFileSync(
            path.join(typesDir, 'internal.d.ts'),
            '/**\n * @internal\n */\nexport interface Hidden {\n}\n/**\n * @public\n */\nexport interface Shown {\n}\n'
        );
        fs.writeFileSync(path.join(typesDir, 'entry.d.ts'), entry);

        const errors: string[] = [];
        const logger = { error: (m: string) => errors.push(m), info() {}, log() {}, warn() {} };
        await createApiDtsFiles(
            typesDir,
            [path.join(typesDir, 'internal.d.ts'), path.join(typesDir, 'entry.d.ts')],
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
});
