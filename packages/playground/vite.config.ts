import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { elementStyleUsingTransformer } from '../alphatab/scripts/element-style-transformer';
import server from './vite.plugin.server';

export default defineConfig(_ => {
    return {
        plugins: [
            tsconfigPaths(),
            typescript({
                tsconfig: './tsconfig.json',
                include: [
                    "*.ts", 
                    "../alphatab/src/**/*.ts"
                ],
                transformers: {
                    before: [elementStyleUsingTransformer()]
                }
            }),
            server()
        ],
        server: {
            open: '/control.html'
        },
        esbuild: false
    };
});
