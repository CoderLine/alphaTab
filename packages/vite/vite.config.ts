import url from 'node:url';
import { commonjs, defaultBuildUserConfig, esm } from '@coderline/alphatab-tooling/src/vite';
import { defineConfig } from 'vite';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') {
        return {};
    } else {
        const config = defaultBuildUserConfig();

        switch (mode) {
            case 'cjs':
                commonjs(config, __dirname, 'alphaTab.vite', 'src/alphaTab.vite.ts');
                break;
            // case 'esm':
            default:
                esm(config, __dirname, 'alphaTab.vite', 'src/alphaTab.vite.ts');
                break;
        }

        return config;
    }
});
