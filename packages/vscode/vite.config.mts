import fs from 'node:fs';
import path from 'node:path';
import { defaultClientMainFields, defineConfig, type LibraryOptions } from 'vite';
import { commonjs, defaultBuildUserConfig, umd } from '../tooling/src/vite';

export default defineConfig(({ mode }) => {
    const config = defaultBuildUserConfig();
    config.build!.sourcemap = true;
    config.resolve ??= {};
    config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');
    config.resolve.mainFields.unshift('require');
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push(/^vscode/);

    if (mode === 'previewApp') {
        umd(
            config,
            import.meta.dirname,
            'preview',
            'src/preview/app/index.ts',
            {
                module: 'preserve'
            },
            false
        );

        const alphaTabPath = path.resolve(__dirname, '../alphatab/');
        config.plugins!.push({
            name: 'copy-alphatab-assets',
            apply: 'build',
            async writeBundle() {
                const outDir = path.join(import.meta.dirname, 'dist', 'assets');
                await fs.promises.mkdir(outDir, { recursive: true });
                await fs.promises.copyFile(
                    path.join(alphaTabPath, 'font/sonivox/sonivox.sf3'),
                    path.join(outDir, 'sonivox.sf3')
                );
                await fs.promises.copyFile(
                    path.join(alphaTabPath, 'font/bravura/Bravura.woff2'),
                    path.join(outDir, 'Bravura.woff2')
                );
            }
        });
        config.plugins!.push({
            name: 'app-html',
            apply: 'build',
            async writeBundle() {
                await fs.promises.copyFile(
                    path.join(import.meta.dirname, 'src/preview/app/index.html'),
                    path.join(import.meta.dirname, 'dist/preview.html')
                );
            }
        });

        return config;
    } else {
        commonjs(config, import.meta.dirname, 'extension', 'src/extension.ts', {
            module: 'preserve'
        });

        const lib = config.build!.lib! as LibraryOptions;
        const entry = lib.entry! as Record<string, string>;
        entry.server = path.resolve(__dirname, 'src/server.ts');

        config.plugins!.push({
            name: 'language-files',
            apply: 'build',
            async buildStart() {
                await fs.promises.copyFile(
                    path.join(import.meta.dirname, '../lsp/src/language-configuration.json'),
                    path.join(import.meta.dirname, 'language-configuration.json')
                );
                await fs.promises.mkdir(path.join(import.meta.dirname, 'syntaxes'), { recursive: true });
                await fs.promises.copyFile(
                    path.join(import.meta.dirname, '../lsp/src/alphatex.tmLanguage.json'),
                    path.join(import.meta.dirname, 'syntaxes/alphatex.tmLanguage.json')
                );
            }
        });

        return config;
    }
});
