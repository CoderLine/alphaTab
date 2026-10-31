import MagicString from 'magic-string';
import type { Plugin } from 'vite';

/**
 * Strips `Profiler.<method>(...)` statements and the `Profiler` import from
 * alphatab source at transform time when `enabled: false`. With the call
 * sites gone, tree-shaking drops the {@link Profiler} module from the
 * bundle. The Profiler module itself is exempt. With `enabled: true` the
 * plugin is a passthrough.
 */
export function stripProfilingPlugin(options: { enabled: boolean }): Plugin {
    const importLine = /^[\t ]*import\s*\{\s*Profiler\s*\}\s*from\s*['"][^'"]*profiling\/Profiler['"]\s*;?[\t ]*\r?\n/m;
    const callStatement = /^[\t ]*Profiler\.[A-Za-z_$][\w$]*\s*\([^()\n]*\)\s*;?[\t ]*\r?\n/gm;

    return {
        name: 'alphatab:strip-profiling',
        enforce: 'pre',
        transform(code, id) {
            if (options.enabled) {
                return null;
            }
            if (!code.includes('Profiler')) {
                return null;
            }
            // Skip the Profiler module itself.
            if (/[\\/]profiling[\\/]Profiler\.ts$/.test(id)) {
                return null;
            }

            const ms = new MagicString(code);
            let changed = false;

            const importMatch = importLine.exec(code);
            if (importMatch && importMatch.index !== undefined) {
                ms.remove(importMatch.index, importMatch.index + importMatch[0].length);
                changed = true;
            }

            for (const m of code.matchAll(callStatement)) {
                if (m.index === undefined) {
                    continue;
                }
                ms.remove(m.index, m.index + m[0].length);
                changed = true;
            }

            if (!changed) {
                return null;
            }

            return {
                code: ms.toString(),
                map: ms.generateMap({ hires: 'boundary' })
            };
        }
    };
}
