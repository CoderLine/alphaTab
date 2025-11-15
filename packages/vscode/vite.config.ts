import { commonjs, defaultBuildUserConfig } from '@coderline/alphatab-tooling/src/vite';
import path from 'node:path';
import fs from 'node:fs';
import { defaultClientMainFields, defineConfig, type LibraryOptions } from 'vite';

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        return {};
    } else {
        const config = defaultBuildUserConfig();
        config.build!.sourcemap = 'inline';
        config.resolve ??= {};
        config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');
        config.resolve.mainFields.unshift('require');
        (config.build!.rollupOptions!.external as (RegExp|string)[]).push(/^vscode/, "./preview.js");

        commonjs(config, import.meta.dirname, 'extension', 'src/extension.ts', {
            module: 'preserve',
            include: ['src/**', 'test/**', '../alphatab/src/**/*.ts']
        });
        const lib = config.build!.lib! as LibraryOptions;
        const entry = lib.entry! as Record<string, string>;
        entry.server = path.resolve(__dirname, 'src/server/index.ts');
        entry.preview = path.resolve(__dirname, 'src/preview/app/index.ts');

        const alphaTabPath = path.dirname(require.resolve('@coderline/alphatab'));

        config.plugins!.push({
            name: 'copy-alphatab-assets',
            apply: 'build',
            async writeBundle() {
                const outDir = path.join(import.meta.dirname, 'dist', 'assets');
                await fs.promises.mkdir(outDir, {recursive: true})
                await fs.promises.copyFile(path.join(alphaTabPath, 'soundfont/sonivox.sf3'), path.join(outDir, 'sonivox.sf3'));
            }
        })

        return config;
    }
});
