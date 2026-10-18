import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { declaredDependenciesPlugin } from '../src/vite';

describe('declaredDependenciesPlugin', () => {
    let projectDir = '';

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    function run(imports: string[], dynamicImports: string[] = []) {
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphatab-deps-'));
        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            JSON.stringify({
                name: '@scope/pkg',
                dependencies: { dep: '1' },
                peerDependencies: { '@scope/peer': '1' }
            })
        );
        const errors: string[] = [];
        const plugin = declaredDependenciesPlugin(projectDir);
        const bundle = {
            'entry.mjs': { type: 'chunk', fileName: 'entry.mjs', imports, dynamicImports },
            'shared.mjs': { type: 'chunk', fileName: 'shared.mjs', imports: [], dynamicImports: [] }
        };
        (plugin.generateBundle as any).call({ error: (m: string) => errors.push(m) }, {}, bundle, false);
        return errors;
    }

    it('accepts declared, builtin, self and chunk imports', () => {
        expect(
            run(['dep', 'dep/sub', '@scope/peer/x', '@scope/pkg/other', 'node:fs', 'fs', 'shared.mjs'], ['optional'])
        ).toEqual([]);
    });

    it('rejects undeclared static imports', () => {
        const errors = run(['undeclared/browser', '@other/pkg']);
        expect(errors).toHaveLength(2);
        expect(errors[0]).toContain("does not declare 'undeclared'");
        expect(errors[1]).toContain("does not declare '@other/pkg'");
    });
});
