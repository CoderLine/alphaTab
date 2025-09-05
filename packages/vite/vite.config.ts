import { commonjs, defaultBuildUserConfig, esm } from '@coderline/alphatab-tooling/src/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') {
        return {};
    } else {
        const config = defaultBuildUserConfig();

        switch (mode) {
            case 'cjs':
                commonjs(config, 'alphaTab.vite', 'src/alphaTab.vite.ts');
                break;
            // case 'esm':
            default:
                esm(config, 'alphaTab.vite', 'src/alphaTab.vite.ts');
                break;
        }

        return config;
    }
});
