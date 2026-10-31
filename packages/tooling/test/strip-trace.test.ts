import { parseAst } from 'rolldown/parseAst';
import { describe, expect, it } from 'vitest';
import { stripTracePlugin } from '../src/vite.plugin.strip-trace';

const context = {
    error(message: string): never {
        throw new Error(message);
    },
    info() {}
};

function strip(code: string): string {
    const plugin = stripTracePlugin();
    const transform = plugin.transform as { handler: (code: string, id: string) => { code: string } | null };
    const result = transform.handler.call(context, code, '/src/File.ts');
    const output = result ? result.code : code;
    parseAst(output, { lang: 'ts', sourceType: 'module' });
    return output;
}

function check(code: string): void {
    const plugin = stripTracePlugin();
    (plugin.renderChunk as (code: string, chunk: { fileName: string }) => null).call(context, code, {
        fileName: 'alphaTab.mjs'
    });
}

describe('stripTracePlugin', () => {
    it('applies to builds only', () => {
        expect(stripTracePlugin().apply).toBe('build');
    });

    it('removes trace statements with their arguments', () => {
        const code = [
            'class A {',
            '    run(partial: P): void {',
            "        Logger.trace(this.name, 'Start');",
            '        Logger.trace(',
            '            this.name,',
            '            `From ${partial.bars[0].index} to ${partial.bars[partial.bars.length - 1].index}`',
            '        );',
            "        alphaTab.Logger.trace('Main', `${(x as number) + 1} ${y!.z} ${a ? b : c} ${-d} ${[e]}`);",
            "        Logger.debug('Keep', 'debug');",
            '    }',
            '}'
        ].join('\n');
        const output = strip(code);
        expect(output).not.toContain('trace');
        expect(output).toContain("Logger.debug('Keep', 'debug');");
    });

    it('keeps braceless branches valid', () => {
        const output = strip("if (a) Logger.trace('A', 'a');\nelse b();\nfor (;;) Logger.trace('A', 'b');");
        expect(output).toBe('if (a) ;\nelse b();\nfor (;;) ;');
    });

    it('removes trace guards with their body', () => {
        const output = strip(
            "before();\nif (Logger.isTraceEnabled) {\n    const m = compute();\n    Logger.trace('A', m);\n}\nafter();"
        );
        expect(output).toBe('before();\n;\nafter();');
    });

    it('rejects trace guards with an else branch', () => {
        expect(() => strip("if (Logger.isTraceEnabled) { Logger.trace('A', 'a'); } else { b(); }")).toThrow(
            /File\.ts:1: .*else branch/
        );
    });

    it('rejects trace calls that are not plain statements', () => {
        const cases = [
            "a && Logger.trace('A', 'a');",
            "function f() { return Logger.trace('A', 'a'); }",
            "const f = () => Logger.trace('A', 'a');",
            'const f = Logger.trace;',
            "Logger?.trace('A', 'a');",
            "Logger.trace?.('A', 'a');",
            'const t = Logger.isTraceEnabled;',
            "if (Logger.isTraceEnabled && a) { Logger.trace('A', 'a'); }"
        ];
        for (const code of cases) {
            expect(() => strip(code), code).toThrow(/plain statement|isTraceEnabled/);
        }
    });

    it('rejects arguments with side effects', () => {
        const cases = [
            "Logger.trace('A', `${list.join(', ')}`);",
            "Logger.trace('A', 'a', new Error());",
            "Logger.trace('A', `${(i = 1)}`);",
            "Logger.trace('A', `${i++}`);",
            "Logger.trace('A', `${delete o.p}`);",
            "async function f() { Logger.trace('A', `${await p}`); }",
            "Logger.trace('A', tag`a`);",
            "Logger.trace('A', 'a', () => 1);",
            "Logger.trace('A', `${a?.b()}`);",
            "Logger.trace('A', 'a', ...list.map(x => x));"
        ];
        for (const code of cases) {
            expect(() => strip(code), code).toThrow(/side effects/);
        }
    });

    it('leaves other code untouched', () => {
        const code = "class Logger { static trace(c: string, m: string) {} }\nconsole.debug('trace');\nx.trace = 1;";
        expect(strip(code)).toBe(code);
    });

    it('fails when trace logging survives in the output', () => {
        expect(() => check("Logger$1.trace('A', 'a');")).toThrow(/alphaTab\.mjs:1: trace logging survived/);
        expect(() => check("x();\nalphaTab.Logger.trace('A', 'a');")).toThrow(/alphaTab\.mjs:2/);
        expect(() => check('if (Logger.isTraceEnabled) {}')).toThrow(/survived/);
        expect(() =>
            check(
                'class Logger { static trace(c, m) {} static get isTraceEnabled() { return true; } }\nLogger.debug("trace");'
            )
        ).not.toThrow();
    });
});
