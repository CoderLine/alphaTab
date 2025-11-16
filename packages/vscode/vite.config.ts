import fs from 'node:fs';
import path from 'node:path';
import { commonjs, defaultBuildUserConfig, umd } from '@coderline/alphatab-tooling/src/vite';
import { defaultClientMainFields, defineConfig, type LibraryOptions } from 'vite';
import { languageConfiguration, textMateGrammar } from '@coderline/alphatab-lsp';

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') {
        return {};
    } else {
        const config = defaultBuildUserConfig();
        config.build!.sourcemap = 'inline';
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
                    module: 'preserve',
                    include: ['src/**', 'test/**']
                },
                false
            );

            const alphaTabPath = path.dirname(require.resolve('@coderline/alphatab'));
            config.plugins!.push({
                name: 'copy-alphatab-assets',
                apply: 'build',
                async writeBundle() {
                    const outDir = path.join(import.meta.dirname, 'dist', 'assets');
                    await fs.promises.mkdir(outDir, { recursive: true });
                    await fs.promises.copyFile(
                        path.join(alphaTabPath, 'soundfont/sonivox.sf3'),
                        path.join(outDir, 'sonivox.sf3')
                    );
                    await fs.promises.copyFile(
                        path.join(alphaTabPath, 'font/Bravura.woff2'),
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
                module: 'preserve',
                include: ['src/**', 'test/**']
            });

            const lib = config.build!.lib! as LibraryOptions;
            const entry = lib.entry! as Record<string, string>;
            entry.server = path.resolve(__dirname, 'src/server.ts');

            config.plugins!.push({
                name: 'language-files',
                apply: 'build',
                async buildStart() {
                    await fs.promises.writeFile(
                        path.join(import.meta.dirname, 'language-configuration.json'),
                        JSON.stringify(languageConfiguration, undefined, 4)
                    );
                    await fs.promises.mkdir(path.join(import.meta.dirname, 'syntaxes'), { recursive: true });
                    await fs.promises.writeFile(
                        path.join(import.meta.dirname, 'syntaxes', 'alphatex.tmLanguage.json'),
                        JSON.stringify(textMateGrammar, undefined, 4)
                    );
                }
            });

            return config;
        }
    }
});
