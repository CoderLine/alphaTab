/**
 * Verifies the type declarations of the npm packages as consumers receive them: packs the built packages, installs
 * the tarballs into a project outside the repository and type checks every public entry point, including the
 * shipped `.d.ts` files themselves (`skipLibCheck: false`).
 *
 * Usage (after building the web packages):
 *
 *   node scripts/check-published-types.mts [--work-dir <dir>]
 *
 * `--work-dir` keeps the packed tarballs and the consumer project in the given directory instead of a temporary one.
 * Installing the consumer project needs registry access for the third-party dependencies.
 *
 * Runs with plain `node` (no `npm ci`): only erasable TypeScript syntax and Node built-ins. Packing runs the
 * packages' `prepack` scripts, so their workspace dependencies must be installed.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { parseArgs } from 'node:util';

/** Workspaces published to npm, or meant to be. */
export const publishedWorkspaces = [
    'packages/alphatab',
    'packages/lsp',
    'packages/monaco',
    'packages/webpack',
    'packages/vite',
    'packages/react'
];

/**
 * Declaration files, relative to their package, of entry points that run in a web worker. They are checked against
 * the WebWorker library and the `browser` export condition, the other files against the DOM library.
 */
const workerDeclarations: Record<string, string[]> = {
    '@coderline/alphatab-language-server': ['dist/server/browser.d.ts']
};

/** Third-party packages a consumer installs next to ours: compiler, environment types and optional peers. */
const consumerDependencies = ['typescript@^6.0.3', '@types/node', '@types/react@^19'];

const repositoryRoot = path.resolve(import.meta.dirname, '..');

export interface PackageJson {
    name: string;
    exports?: unknown;
    types?: string;
}

export interface Finding {
    file: string;
    message: string;
}

const specifierPatterns = [
    /\bfrom\s*['"]([^'"\n]+)['"]/g,
    /\bimport\s*['"]([^'"\n]+)['"]/g,
    /\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g,
    /\/\/\/\s*<reference\s+path\s*=\s*['"]([^'"\n]+)['"]/g
];

/** The module specifiers and reference paths a declaration file refers to. */
export function moduleSpecifiers(source: string): string[] {
    const specifiers = new Set<string>();
    for (const pattern of specifierPatterns) {
        for (const match of source.matchAll(pattern)) {
            specifiers.add(match[1]);
        }
    }
    return [...specifiers];
}

const declarationExtensions = ['', '.d.ts', '.d.mts', '/index.d.ts'];

/**
 * Problems of the specifiers in the declaration file `file` of the package installed at `packageRoot`: relative
 * specifiers that leave the package or point at nothing, and paths into a `src/` folder.
 */
export function checkSpecifiers(
    packageRoot: string,
    file: string,
    source: string,
    exists: (file: string) => boolean
): string[] {
    const problems: string[] = [];
    for (const specifier of moduleSpecifiers(source)) {
        if (/(^|\/)src\//.test(specifier)) {
            problems.push(`'${specifier}' refers to sources`);
        }
        if (!specifier.startsWith('.')) {
            continue;
        }
        const target = path.resolve(path.dirname(file), specifier);
        const relative = path.relative(packageRoot, target);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            problems.push(`'${specifier}' resolves outside of the package`);
        } else if (!declarationExtensions.some(ext => exists(target.replace(/\.(m?js)$/, '') + ext))) {
            problems.push(`'${specifier}' resolves to no declaration file`);
        }
    }
    return problems;
}

function collectFiles(dir: string, accept: (file: string) => boolean, files: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') {
                collectFiles(full, accept, files);
            }
        } else if (accept(full)) {
            files.push(full);
        }
    }
    return files;
}

function isDeclarationFile(file: string) {
    return /\.d\.[cm]?ts$/.test(file);
}

/** Every `types` target in the `exports` of a package, keyed by the subpath it is exported as. */
export function exportedTypes(pkg: PackageJson): [subpath: string, types: string][] {
    const result: [string, string][] = [];
    const visit = (subpath: string, value: unknown) => {
        if (typeof value !== 'object' || value === null) {
            return;
        }
        for (const [key, nested] of Object.entries(value)) {
            if (key === 'types' && typeof nested === 'string') {
                result.push([subpath, nested]);
            } else {
                visit(subpath, nested);
            }
        }
    };
    if (pkg.types) {
        result.push(['.', pkg.types]);
    }
    if (typeof pkg.exports === 'object' && pkg.exports !== null) {
        for (const [subpath, value] of Object.entries(pkg.exports)) {
            visit(subpath, value);
        }
    }
    return result;
}

/** The importable subpaths for an export entry; wildcard entries expand to the shipped files they match. */
function expandExport(packageRoot: string, subpath: string, types: string, files: string[]): [string, string][] {
    const star = types.indexOf('*');
    if (star < 0) {
        return [[subpath, path.resolve(packageRoot, types)]];
    }
    const prefix = path.resolve(packageRoot, types.substring(0, star));
    const suffix = types.substring(star + 1);
    return files
        .filter(f => f.startsWith(prefix) && f.endsWith(suffix))
        .map(f => [subpath.replace('*', f.substring(prefix.length, f.length - suffix.length)), f]);
}

interface Environment {
    readonly name: string;
    readonly compilerOptions: Record<string, unknown>;
    readonly files: string[];
    readonly imports: string[];
}

/** Writes a project type checking `environment` into `consumerDir` and returns whether it type checks. */
function typecheck(consumerDir: string, environment: Environment): boolean {
    const entry = `${environment.name}.ts`;
    const imports = [...new Set(environment.imports)];
    writeFileSync(
        path.join(consumerDir, entry),
        `${imports.map((specifier, i) => `export * as m${i} from '${specifier}';`).join('\n')}\n`
    );
    const tsconfig = `tsconfig.${environment.name}.json`;
    writeFileSync(
        path.join(consumerDir, tsconfig),
        JSON.stringify(
            {
                compilerOptions: {
                    target: 'ES2022',
                    module: 'preserve',
                    moduleResolution: 'bundler',
                    strict: true,
                    skipLibCheck: false,
                    noEmit: true,
                    types: ['node'],
                    ...environment.compilerOptions
                },
                files: [entry, ...environment.files.map(f => path.relative(consumerDir, f))]
            },
            null,
            4
        )
    );
    console.info(`Type checking ${imports.length} entry points in ${tsconfig}`);
    try {
        run(path.join(consumerDir, 'node_modules', '.bin', 'tsc'), ['-p', tsconfig], consumerDir);
        return true;
    } catch (e) {
        console.error((e as { stdout?: string }).stdout ?? e);
        return false;
    }
}

function run(command: string, args: string[], cwd: string): string {
    return execFileSync(command, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'inherit'] });
}

/** Packs the workspace into `destination`, restoring a `package.json` its `prepack` script rewrites. */
function pack(workspace: string, destination: string): string {
    const cwd = path.join(repositoryRoot, workspace);
    const packageJsonPath = path.join(cwd, 'package.json');
    const packageJson = readFileSync(packageJsonPath, 'utf-8');
    try {
        const output = run('npm', ['pack', '--json', '--pack-destination', destination], cwd);
        // lifecycle scripts may print before the JSON report
        const report = JSON.parse(output.substring(output.indexOf('[')));
        return path.join(destination, report[0].filename);
    } finally {
        writeFileSync(packageJsonPath, packageJson);
    }
}

function main() {
    const args = parseArgs({ options: { 'work-dir': { type: 'string' } }, strict: true }).values;
    const workDir = args['work-dir']
        ? path.resolve(args['work-dir'])
        : mkdtempSync(path.join(os.tmpdir(), 'alphatab-published-types-'));
    const tarballDir = path.join(workDir, 'tarballs');
    const consumerDir = path.join(workDir, 'consumer');
    rmSync(tarballDir, { recursive: true, force: true });
    rmSync(consumerDir, { recursive: true, force: true });
    mkdirSync(tarballDir, { recursive: true });
    mkdirSync(consumerDir, { recursive: true });

    const workspaces = publishedWorkspaces.filter(ws => existsSync(path.join(repositoryRoot, ws, 'package.json')));
    const tarballs = workspaces.map(ws => {
        console.info(`Packing ${ws}`);
        return pack(ws, tarballDir);
    });

    writeFileSync(
        path.join(consumerDir, 'package.json'),
        JSON.stringify({ name: 'published-types-consumer', private: true, type: 'module' }, null, 4)
    );
    console.info('Installing the packed packages into', consumerDir);
    run('npm', ['install', '--no-audit', '--no-fund', ...tarballs, ...consumerDependencies], consumerDir);

    const findings: Finding[] = [];
    const page: Environment = {
        name: 'page',
        compilerOptions: { lib: ['ES2022', 'DOM', 'DOM.Iterable'] },
        files: [],
        imports: []
    };
    const worker: Environment = {
        name: 'worker',
        compilerOptions: { lib: ['ES2022', 'WebWorker'], customConditions: ['browser'] },
        files: [],
        imports: []
    };
    for (const ws of workspaces) {
        const pkg = JSON.parse(readFileSync(path.join(repositoryRoot, ws, 'package.json'), 'utf-8')) as PackageJson;
        const packageRoot = path.join(consumerDir, 'node_modules', pkg.name);
        const declarations = collectFiles(packageRoot, isDeclarationFile);
        const filesOf = (listed: Record<string, string[]>) =>
            new Set((listed[pkg.name] ?? []).map(f => path.join(packageRoot, f)));
        const workerFiles = filesOf(workerDeclarations);
        const environmentOf = (file: string) => (workerFiles.has(file) ? worker : page);
        for (const file of declarations) {
            for (const message of checkSpecifiers(packageRoot, file, readFileSync(file, 'utf-8'), existsSync)) {
                findings.push({ file: path.relative(consumerDir, file), message });
            }
            environmentOf(file).files.push(file);
        }

        for (const [subpath, types] of exportedTypes(pkg)) {
            for (const [specifier, file] of expandExport(packageRoot, subpath, types, declarations)) {
                if (!existsSync(file)) {
                    findings.push({ file: `${pkg.name}/package.json`, message: `types of '${specifier}' are missing` });
                } else {
                    environmentOf(file).imports.push(path.posix.join(pkg.name, specifier));
                }
            }
        }
        console.info(`${pkg.name}: ${declarations.length} declaration files`);
    }

    let typecheckFailed = false;
    for (const environment of [page, worker]) {
        if (!typecheck(consumerDir, environment)) {
            typecheckFailed = true;
        }
    }

    for (const finding of findings) {
        console.error(`${finding.file}: ${finding.message}`);
    }
    if (findings.length > 0 || typecheckFailed) {
        console.error(`Published type declarations are broken, see ${consumerDir}`);
        process.exitCode = 1;
        return;
    }
    console.info(`Published type declarations of ${workspaces.length} packages type check`);
    if (!args['work-dir']) {
        rmSync(workDir, { recursive: true, force: true });
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
    main();
}
