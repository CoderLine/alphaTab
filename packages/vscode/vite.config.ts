import { commonjs, defaultBuildUserConfig } from '@coderline/alphatab-tooling/src/vite';
import path from 'node:path';
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
        (config.build!.rollupOptions!.external as RegExp[]).push(/^vscode/);

        commonjs(config, import.meta.dirname, 'extension', 'src/extension.ts', {
            module: 'preserve',
            include: ['src/**', 'test/**', '../alphatab/src/**/*.ts']
        });
        const lib = config.build!.lib! as LibraryOptions;
        const entry = lib.entry! as Record<string, string>;
        entry.server = path.resolve(__dirname, 'src/server/index.ts');

        return config;
    }
});
