import { defineConfig, type UserConfig } from 'vite';
import { elementStyleUsingPlugin } from '../tooling/src/vite.plugin.transform';
import server from './vite.plugin.server';

export default defineConfig(_ => {
    const config: UserConfig = {
        plugins: [server(), elementStyleUsingPlugin()],
        server: {
            open: '/index.html'
        }
    };

    return config;
});
