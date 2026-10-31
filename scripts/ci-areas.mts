/**
 * Maps the files changed by a CI event to the areas of the repository that need verification.
 *
 * Usage (in GitHub Actions, writes `<area>=true|false`, `lint` and `lint_workspaces` to `$GITHUB_OUTPUT`):
 *
 *   node scripts/ci-areas.mts --event <github.event_name> --before <github.event.before> --head <sha>
 *
 * Pull requests diff the merge commit against its first parent and need a checkout with `fetch-depth: 2`. Pushes
 * diff `before` against `head` and fetch `before` on demand. Any event or range that cannot be diffed reports every
 * area as changed.
 *
 * Runs with plain `node` (no `npm ci`): only erasable TypeScript syntax and Node built-ins.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { parseArgs } from 'node:util';

export const areaNames = ['core', 'webpkgs', 'csharp', 'kotlin', 'player', 'website', 'playground', 'github'] as const;
export type Area = (typeof areaNames)[number];
export type Areas = Record<Area, boolean>;

const packageAreas: Record<string, Area> = {
    alphatab: 'core',
    transpiler: 'core',
    alphatex: 'core',
    tooling: 'core',
    lsp: 'webpkgs',
    monaco: 'webpkgs',
    webpack: 'webpkgs',
    vite: 'webpkgs',
    csharp: 'csharp',
    kotlin: 'kotlin',
    react: 'player',
    ui: 'player',
    playground: 'playground'
};

const rootFileAreas: Record<string, Area> = {
    'package.json': 'core',
    'package-lock.json': 'core',
    'tsconfig.base.json': 'core',
    'biome.jsonc': 'core',
    '.github/pull_request_template.md': 'github'
};

const directoryAreas: [prefix: string, area: Area][] = [
    ['.github/workflows/', 'core'],
    ['scripts/', 'core'],
    ['website/', 'website'],
    ['.github/scripts/', 'github'],
    ['.github/ISSUE_TEMPLATE/', 'github']
];

/** Packages whose published or source state ends up in the deployed website. */
const websitePackages = new Set(['alphatab', 'lsp', 'monaco', 'webpack', 'react', 'ui']);

export function noAreas(): Areas {
    return Object.fromEntries(areaNames.map(a => [a, false])) as Areas;
}

export function allAreas(): Areas {
    return Object.fromEntries(areaNames.map(a => [a, true])) as Areas;
}

/** The area a repository-relative path belongs to, or `undefined` if no CI job verifies it. */
export function areaOf(file: string): Area | undefined {
    const parts = file.split('/');
    if (parts[0] === 'packages' && parts.length > 2) {
        return packageAreas[parts[1]];
    }
    const rootArea = rootFileAreas[file];
    if (rootArea) {
        return rootArea;
    }
    for (const [prefix, area] of directoryAreas) {
        if (file.startsWith(prefix)) {
            return area;
        }
    }
    return undefined;
}

export function areasOf(files: readonly string[]): Areas {
    const areas = noAreas();
    for (const file of files) {
        const area = areaOf(file);
        if (area) {
            areas[area] = true;
        }
    }
    return areas;
}

/** Whether a change to this path needs a website redeploy (nightly). */
export function isWebsiteRelevant(file: string): boolean {
    if (file === 'package-lock.json' || file.startsWith('website/')) {
        return true;
    }
    const parts = file.split('/');
    return parts[0] === 'packages' && parts.length > 2 && websitePackages.has(parts[1]);
}

const alwaysLinted = ['packages/alphatab', 'packages/transpiler', 'packages/tooling'];

const lintedWithArea: Record<Exclude<Area, 'core' | 'kotlin' | 'website' | 'github'>, string[]> = {
    webpkgs: [
        'packages/alphatex',
        'packages/lsp',
        'packages/monaco',
        'packages/webpack',
        'packages/vite',
        'packages/playground'
    ],
    csharp: ['packages/csharp'],
    player: [
        'packages/alphatex',
        'packages/lsp',
        'packages/monaco',
        'packages/react',
        'packages/ui',
        'packages/playground'
    ],
    playground: ['packages/alphatex', 'packages/lsp', 'packages/monaco', 'packages/playground']
};

/**
 * The workspaces the lint job installs, lints and typechecks, restricted to `existing`. Empty when no package
 * workspace is affected. The website is linted in its own job, against the built packages.
 */
export function lintWorkspaces(areas: Areas, existing: readonly string[]): string[] {
    const selected = new Set<string>();
    if (areas.core) {
        for (const ws of existing) {
            selected.add(ws);
        }
    }
    for (const [area, workspaces] of Object.entries(lintedWithArea) as [Area, string[]][]) {
        if (areas[area]) {
            for (const ws of workspaces) {
                selected.add(ws);
            }
        }
    }
    if (selected.size === 0) {
        return [];
    }
    for (const ws of alwaysLinted) {
        selected.add(ws);
    }
    return existing.filter(ws => selected.has(ws));
}

export interface Git {
    hasCommit(rev: string): boolean;
    fetchCommit(sha: string): boolean;
    changedFiles(base: string, head: string): string[];
}

const zeroSha = /^0+$/;

/** The diff base for the event, or `undefined` if every area has to be treated as changed. */
export function resolveBase(git: Git, event: string, before: string, head: string): string | undefined {
    switch (event) {
        case 'pull_request': {
            const base = `${head}^1`;
            return git.hasCommit(base) ? base : undefined;
        }
        case 'push': {
            if (!before || zeroSha.test(before)) {
                return undefined;
            }
            if (git.hasCommit(before) || (git.fetchCommit(before) && git.hasCommit(before))) {
                return before;
            }
            return undefined;
        }
        default:
            return undefined;
    }
}

export function detectAreas(git: Git, event: string, before: string, head: string): Areas {
    const base = resolveBase(git, event, before, head);
    if (base === undefined) {
        console.info(`No diffable range for event '${event}' (before: '${before}'), treating everything as changed`);
        return allAreas();
    }
    const files = git.changedFiles(base, head);
    console.info(`Changed files ${base}..${head}:`, files);
    return areasOf(files);
}

function gitCommand(args: string[]): string {
    return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export const processGit: Git = {
    hasCommit(rev) {
        try {
            gitCommand(['cat-file', '-e', `${rev}^{commit}`]);
            return true;
        } catch {
            return false;
        }
    },
    fetchCommit(sha) {
        try {
            gitCommand(['fetch', '--no-tags', '--depth=1', 'origin', sha]);
            return true;
        } catch {
            return false;
        }
    },
    changedFiles(base, head) {
        return gitCommand(['diff', '--name-only', base, head])
            .split('\n')
            .filter(l => l.length > 0);
    }
};

const repositoryRoot = path.resolve(import.meta.dirname, '..');

export function existingPackageWorkspaces(): string[] {
    return readdirSync(path.join(repositoryRoot, 'packages'), { withFileTypes: true })
        .filter(e => e.isDirectory() && existsSync(path.join(repositoryRoot, 'packages', e.name, 'package.json')))
        .map(e => `packages/${e.name}`)
        .sort();
}

function main() {
    const args = parseArgs({
        options: {
            event: { type: 'string', default: process.env.GITHUB_EVENT_NAME ?? '' },
            before: { type: 'string', default: '' },
            head: { type: 'string', default: 'HEAD' }
        },
        strict: true
    }).values;

    const areas = detectAreas(processGit, args.event!, args.before!, args.head!);
    const workspaces = lintWorkspaces(areas, existingPackageWorkspaces());
    const lint = workspaces.length > 0 || areas.github;

    const lines = [
        ...areaNames.map(a => `${a}=${areas[a]}`),
        `lint=${lint}`,
        `lint_workspaces=${workspaces.map(ws => `-w ${ws}`).join(' ')}`
    ];
    console.info(lines.join('\n'));
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
    main();
}
