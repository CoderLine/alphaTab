import path from 'node:path';
import ts from 'typescript';

function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds Vite `resolve.alias` entries from the project's `tsconfig.json`
 * `compilerOptions.paths`. `tsconfig.base.json` is the single source of truth;
 * `ts.parseJsonConfigFileContent` handles the `extends` chain and the
 * `${configDir}` template substitution.
 */
export function buildTsconfigAliases(projectDir: string): Array<{ find: RegExp; replacement: string }> {
    const tsconfigPath = ts.findConfigFile(projectDir, ts.sys.fileExists);
    if (!tsconfigPath) {
        return [];
    }
    const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (error || !config) {
        return [];
    }
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(tsconfigPath));
    const aliases: Array<{ find: RegExp; replacement: string }> = [];
    for (const [pattern, targets] of Object.entries(parsed.options.paths ?? {})) {
        const target = targets?.[0];
        if (!target) {
            continue;
        }
        if (pattern.endsWith('/*') && target.endsWith('/*')) {
            aliases.push({
                find: new RegExp(`^${escapeRegExp(pattern.slice(0, -2))}/(.*)$`),
                replacement: `${target.slice(0, -2)}/$1`
            });
        } else {
            aliases.push({ find: new RegExp(`^${escapeRegExp(pattern)}$`), replacement: target });
        }
    }
    return aliases;
}
