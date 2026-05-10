import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

import csharpCreateEmit from '../src/csharp/CSharpEmitter';
import kotlinCreateEmit from '../src/kotlin/KotlinEmitter';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export type Target = 'csharp' | 'kotlin';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

/** Discover fixture directories: each subdir of test/fixtures with an input.ts. */
export function discoverFixtures(): { name: string; dir: string }[] {
    if (!fs.existsSync(FIXTURES_DIR)) {
        return [];
    }
    const out: { name: string; dir: string }[] = [];
    function rec(dir: string, relName: string) {
        for (const entry of fs.readdirSync(dir)) {
            const abs = path.join(dir, entry);
            const stat = fs.statSync(abs);
            if (!stat.isDirectory()) {
                continue;
            }
            const rel = relName ? `${relName}/${entry}` : entry;
            if (fs.existsSync(path.join(abs, 'input.ts'))) {
                out.push({ name: rel, dir: abs });
            } else {
                rec(abs, rel);
            }
        }
    }
    rec(FIXTURES_DIR, '');
    return out.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Compiler options matching tsconfig.base.json. Inlined here so fixtures
 * don't need a tsconfig.json and don't reach back into the main alphaTab
 * source tree for path aliases.
 */
function fixtureCompilerOptions(): ts.CompilerOptions {
    return {
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.Preserve,
        lib: [
            'lib.es2015.d.ts',
            'lib.es2016.d.ts',
            'lib.es2017.d.ts',
            'lib.es2021.d.ts',
            'lib.es2022.regexp.d.ts',
            'lib.es2022.error.d.ts',
            'lib.es2024.promise.d.ts',
            "lib.esnext.disposable.d.ts",
            'lib.webworker.d.ts',
            'lib.dom.d.ts',
            'lib.dom.iterable.d.ts',
            'lib.es2017.arraybuffer.d.ts',
            'lib.es2024.arraybuffer.d.ts'
        ],
        isolatedModules: true,
        moduleDetection: ts.ModuleDetectionKind.Force,
        noEmit: true,
        strict: true,
        allowSyntheticDefaultImports: true,
        strictNullChecks: true,
        strictPropertyInitialization: true,
        emitDecoratorMetadata: false,
        noImplicitAny: true,
        noImplicitThis: true,
        noImplicitReturns: true,
        noUnusedLocals: false, // fixtures may have unused locals for clarity
        noImplicitOverride: true,
        skipLibCheck: true,
        resolveJsonModule: true
    };
}

export interface FixtureRunResult {
    /** Absolute path of the temp directory that holds the emitted output. */
    tempRoot: string;
    /** TS semantic + syntactic diagnostics from the fixture program. */
    tsDiagnostics: ts.Diagnostic[];
    /** Diagnostics produced by the emitter (errors / warnings on the fixture). */
    emitDiagnostics: ts.Diagnostic[];
    /** Map of POSIX-relative path -> file contents for everything emitted. */
    files: Map<string, string>;
}

/**
 * Builds a ts.Program rooted at `<dir>/input.ts`, runs the chosen emitter
 * into a temp directory, and returns the resulting file map alongside any
 * diagnostics. Caller is responsible for cleaning up `tempRoot`.
 */
export function runFixture(target: Target, dir: string): FixtureRunResult {
    const inputFile = path.join(dir, 'input.ts');
    if (!fs.existsSync(inputFile)) {
        throw new Error(`Fixture missing input.ts: ${dir}`);
    }

    const options = fixtureCompilerOptions();
    // The transformer reads `compilerOptions.configFilePath` to compute the
    // emitted file's relative path. Point it at a virtual tsconfig inside the
    // fixture dir so `path.relative(dir, input.ts)` resolves to `input.ts`.
    options.configFilePath = path.join(dir, 'tsconfig.json');
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram({
        rootNames: [inputFile],
        options,
        host
    });

    const tsDiagnostics: ts.Diagnostic[] = [
        ...program.getSyntacticDiagnostics(),
        ...program.getOptionsDiagnostics(),
        ...program.getGlobalDiagnostics(),
        ...program.getSemanticDiagnostics()
    ];

    program.getTypeChecker();

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `alphatab-fixture-${target}-`));
    const srcOut = path.join(tempRoot, 'main');
    const testOut = path.join(tempRoot, 'test');
    const emitDiagnostics: ts.Diagnostic[] = [];

    const factory = target === 'csharp' ? csharpCreateEmit : kotlinCreateEmit;
    factory(srcOut, testOut)(program, emitDiagnostics);

    const files = readAllFiles(tempRoot);
    return { tempRoot, tsDiagnostics, emitDiagnostics, files };
}

function readAllFiles(root: string): Map<string, string> {
    const out = new Map<string, string>();
    if (!fs.existsSync(root)) {
        return out;
    }
    function rec(dir: string, rel: string) {
        for (const name of fs.readdirSync(dir)) {
            const abs = path.join(dir, name);
            const r = rel ? `${rel}/${name}` : name;
            const stat = fs.statSync(abs);
            if (stat.isDirectory()) {
                rec(abs, r);
            } else {
                out.set(r, fs.readFileSync(abs, 'utf8'));
            }
        }
    }
    rec(root, '');
    return out;
}

/** Where the golden file for a target lives. */
export function goldenPath(dir: string, target: Target): string {
    return path.join(dir, target === 'csharp' ? 'expected.cs' : 'expected.kt');
}

/** Where the negative-fixture error listing lives. */
export function errorsPath(dir: string): string {
    return path.join(dir, 'errors.txt');
}

/**
 * Produce a normalized, deterministic listing of emitter diagnostics suitable
 * for use as a golden file in negative fixtures. One line per diagnostic,
 * sorted lexicographically:
 *
 *   <basename>:<line>:<col>: <message>
 *
 * Diagnostics without a file/position degrade gracefully to just the message.
 */
export function formatEmitDiagnostics(diags: ts.Diagnostic[]): string {
    const lines = diags.map(d => {
        const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        if (d.file && d.start !== undefined) {
            const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
            return `${path.basename(d.file.fileName)}:${line + 1}:${character + 1}: ${msg}`;
        }
        return msg;
    });
    lines.sort();
    return lines.join('\n');
}

/**
 * Pick the emitted source files that represent the fixture. The
 * transformer routes `input.ts` to either `main/...` or `test/...`
 * depending on whether the source path contains `/test/`. Since fixture
 * dirs live under `test/fixtures/...` they end up in the test bucket,
 * which we accept here.
 *
 * Returns a single string. If multiple files were emitted (rare for
 * fixtures), they are concatenated in path order with `// === path ===`
 * markers so a single golden file can cover them.
 */
export function pickEmittedSource(files: Map<string, string>): string {
    const entries = Array.from(files.entries()).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) {
        return '';
    }
    if (entries.length === 1) {
        return entries[0][1];
    }
    return entries.map(([p, c]) => `// === ${p} ===\n${c}`).join('\n');
}

export const UPDATE_FIXTURES = process.env.UPDATE_FIXTURES === '1';
