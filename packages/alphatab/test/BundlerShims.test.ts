/** @target web */
import fs from 'node:fs';
import { alphaTab } from '@coderline/alphatab-vite';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';
import { describe, expect, it, vi } from 'vitest';

/**
 * The deprecated `@coderline/alphatab/vite` and `/webpack` subpaths ship the shims from `bundler/`
 * (copied into `dist/` by `prepack`), which forward to the plugin packages declared as optional peers.
 */
describe('BundlerShimTests', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const cases = [
        { subpath: 'vite', target: '@coderline/alphatab-vite', exportName: 'alphaTab', expected: alphaTab },
        {
            subpath: 'webpack',
            target: '@coderline/alphatab-webpack',
            exportName: 'AlphaTabWebPackPlugin',
            expected: AlphaTabWebPackPlugin
        }
    ];

    for (const c of cases) {
        it(`${c.subpath}-forwards-to-plugin-package`, async () => {
            expect(pkg.peerDependencies[c.target]).toBeDefined();
            expect(pkg.peerDependenciesMeta[c.target].optional).toBe(true);
            expect(pkg.exports[`./${c.subpath}`]).toEqual({
                types: `./dist/alphaTab.${c.subpath}.d.ts`,
                import: `./dist/alphaTab.${c.subpath}.mjs`,
                require: `./dist/alphaTab.${c.subpath}.js`
            });

            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const esm = await import(`../bundler/alphaTab.${c.subpath}.mjs`);
                expect(esm[c.exportName]).toBe(c.expected);

                const required: string[] = [];
                const plugin = {};
                const module = { exports: {} as unknown };
                new Function('require', 'module', fs.readFileSync(`bundler/alphaTab.${c.subpath}.js`, 'utf8'))(
                    (id: string) => {
                        required.push(id);
                        return plugin;
                    },
                    module
                );
                expect(required).toEqual([c.target]);
                expect(module.exports).toBe(plugin);
                expect(warn).toHaveBeenCalled();
            } finally {
                warn.mockRestore();
            }

            expect(fs.readFileSync(`bundler/alphaTab.${c.subpath}.d.ts`, 'utf8')).toContain(
                `export { ${c.exportName} } from '${c.target}';`
            );
        });
    }
});
