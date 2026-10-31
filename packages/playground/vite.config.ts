import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';
import { buildTsconfigAliases } from '../tooling/src/tsconfig-aliases';
import { stripProfilingPlugin } from '../tooling/src/vite.plugin.strip-profiling';
import { elementStyleUsingPlugin } from '../tooling/src/vite.plugin.transform';
import server from './vite.plugin.server';

export default defineConfig(_ => {
    const config: UserConfig = {
        plugins: [react(), server(), elementStyleUsingPlugin(), stripProfilingPlugin({ enabled: false })],
        resolve: {
            alias: buildTsconfigAliases(__dirname),
            // The ui and react packages resolve to their sources and must share the playground's React.
            dedupe: ['react', 'react-dom']
        },
        optimizeDeps: {
            // Pre-bundling these at server start retains hundreds of MB of native memory for the server's
            // lifetime. Monaco is served as plain ESM only when the editor demo is opened; lucide icons are
            // imported per icon (see src/util/Icons.ts) instead of through the ~3.7k-icon barrel.
            exclude: ['monaco-editor', 'lucide']
        },
        server: {
            open: process.stdout.isTTY ? '/index.html' : false
        }
    };

    return config;
});
