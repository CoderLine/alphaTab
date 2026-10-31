import MagicString from 'magic-string';
import type { Plugin, ResolvedConfig } from 'vite';

const marker = '__ALPHATAB_VITE__';

/**
 * @public
 */
export function detectionGlobalPlugin(): Plugin {
    let resolvedConfig: ResolvedConfig;
    return {
        name: 'vite-plugin-alphatab-global',

        configResolved(config) {
            resolvedConfig = config;
        },

        shouldTransformCachedModule({ code }) {
            return code.includes(marker);
        },

        async transform(code, id) {
            if (!code.includes(marker)) {
                return;
            }

            const s = new MagicString(code);
            s.replaceAll(marker, JSON.stringify(true));
            return {
                code: s.toString(),
                map:
                    resolvedConfig.command === 'build' && resolvedConfig.build.sourcemap
                        ? s.generateMap({ hires: 'boundary', source: id })
                        : null
            };
        }
    };
}
