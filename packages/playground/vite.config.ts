import { defineConfig, type UserConfig } from 'vite';
import { elementStyleUsingTransformer } from '../tooling/src/typescript';
import { enableTypeScript } from '../tooling/src/vite';
import server from './vite.plugin.server';

export default defineConfig(_ => {
    const config: UserConfig = {
        plugins: [server()],
        server: {
            open: '/control.html'
        },
        esbuild: false
    };
    enableTypeScript(config, {
        transformers: {
            before: [elementStyleUsingTransformer()]
        }
    });

    return config;
});
