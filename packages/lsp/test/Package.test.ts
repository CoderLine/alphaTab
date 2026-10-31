import fs from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

type ExportTarget = string | { [condition: string]: ExportTarget } | null;

function resolveExport(target: ExportTarget, conditions: string[]): string | undefined {
    if (typeof target === 'string') {
        return target;
    }
    if (!target) {
        return undefined;
    }
    for (const [condition, value] of Object.entries(target)) {
        if (condition === 'default' || conditions.includes(condition)) {
            const resolved = resolveExport(value, conditions);
            if (resolved) {
                return resolved;
            }
        }
    }
    return undefined;
}

describe('package', () => {
    const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

    it('resolves every export for require as for import', () => {
        for (const [subpath, target] of Object.entries(pkg.exports as Record<string, ExportTarget>)) {
            for (const platform of ['node', 'browser']) {
                const imported = resolveExport(target, [platform, 'import']);
                expect(imported, `${subpath} (${platform}, import)`).toBeDefined();
                expect(resolveExport(target, [platform, 'require']), `${subpath} (${platform}, require)`).toBe(
                    imported
                );
            }
        }
    });

    it('exports package.json', () => {
        const require = createRequire(import.meta.url);
        expect(require.resolve(`${pkg.name}/package.json`)).toBe(
            fs.realpathSync(new URL('../package.json', import.meta.url))
        );
    });
});
