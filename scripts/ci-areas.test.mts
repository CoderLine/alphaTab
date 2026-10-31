import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    type Area,
    allAreas,
    areaNames,
    areasOf,
    detectAreas,
    type Git,
    isWebsiteRelevant,
    lintWorkspaces,
    noAreas,
    resolveBase
} from './ci-areas.mts';

function only(...areas: Area[]) {
    const expected = noAreas();
    for (const a of areas) {
        expected[a] = true;
    }
    return expected;
}

const existing = [
    'packages/alphatab',
    'packages/alphatex',
    'packages/csharp',
    'packages/kotlin',
    'packages/lsp',
    'packages/monaco',
    'packages/playground',
    'packages/tooling',
    'packages/transpiler',
    'packages/vite',
    'packages/webpack'
];

class FakeGit implements Git {
    commits: Set<string>;
    remote: Set<string>;
    files: string[];
    fetched: string[] = [];

    constructor(commits: string[], files: string[], remote: string[] = []) {
        this.commits = new Set(commits);
        this.remote = new Set(remote);
        this.files = files;
    }

    hasCommit(rev: string) {
        return this.commits.has(rev);
    }

    fetchCommit(sha: string) {
        this.fetched.push(sha);
        if (this.remote.has(sha)) {
            this.commits.add(sha);
            return true;
        }
        return false;
    }

    changedFiles() {
        return this.files;
    }
}

describe('areasOf', () => {
    it('website-only change', () => {
        assert.deepEqual(areasOf(['website/docs/intro.mdx', 'website/static/llms.txt']), only('website'));
    });

    it('csharp-only change', () => {
        assert.deepEqual(areasOf(['packages/csharp/src/AlphaTab/Platform/Foo.cs']), only('csharp'));
    });

    it('alphaTab core change', () => {
        assert.deepEqual(areasOf(['packages/alphatab/src/model/Score.ts']), only('core'));
        assert.deepEqual(areasOf(['packages/transpiler/src/TranspilerBase.ts']), only('core'));
    });

    it('root markdown changes nothing', () => {
        assert.deepEqual(areasOf(['README.md', 'AGENTS.md', 'CONTRIBUTING.md']), noAreas());
    });

    it('lockfile change is core', () => {
        assert.deepEqual(areasOf(['package-lock.json']), only('core'));
    });

    it('workflow change is core', () => {
        assert.deepEqual(areasOf(['.github/workflows/build.yml']), only('core'));
    });

    it('github tooling', () => {
        assert.deepEqual(
            areasOf([
                '.github/scripts/triage.mjs',
                '.github/ISSUE_TEMPLATE/bug_report_form.yml',
                '.github/pull_request_template.md'
            ]),
            only('github')
        );
    });

    it('web packages, player and playground', () => {
        assert.deepEqual(
            areasOf(['packages/lsp/src/a.ts', 'packages/ui/src/b.tsx', 'packages/playground/c.ts']),
            only('webpkgs', 'player', 'playground')
        );
    });

    it('a root-level file named like a package directory is not a package change', () => {
        assert.deepEqual(areasOf(['packages']), noAreas());
    });
});

describe('resolveBase', () => {
    it('pull request diffs the merge commit against its first parent', () => {
        const git = new FakeGit(['HEAD', 'HEAD^1'], []);
        assert.equal(resolveBase(git, 'pull_request', '', 'HEAD'), 'HEAD^1');
    });

    it('pull request without the parent in the checkout falls back', () => {
        const git = new FakeGit(['HEAD'], []);
        assert.equal(resolveBase(git, 'pull_request', '', 'HEAD'), undefined);
    });

    it('push with an all-zero before falls back to everything', () => {
        const git = new FakeGit(['abc'], ['README.md']);
        assert.deepEqual(detectAreas(git, 'push', '0000000000000000000000000000000000000000', 'abc'), allAreas());
        assert.deepEqual(git.fetched, []);
    });

    it('push fetches a missing before commit', () => {
        const git = new FakeGit(['abc'], ['website/a.mdx'], ['def']);
        assert.deepEqual(detectAreas(git, 'push', 'def', 'abc'), only('website'));
        assert.deepEqual(git.fetched, ['def']);
    });

    it('push with an unreachable before falls back to everything', () => {
        const git = new FakeGit(['abc'], ['website/a.mdx']);
        assert.deepEqual(detectAreas(git, 'push', 'def', 'abc'), allAreas());
    });

    it('workflow_dispatch is everything', () => {
        const git = new FakeGit(['abc', 'def'], ['website/a.mdx']);
        assert.deepEqual(detectAreas(git, 'workflow_dispatch', 'def', 'abc'), allAreas());
    });
});

describe('lintWorkspaces', () => {
    it('core lints every existing package workspace', () => {
        assert.deepEqual(lintWorkspaces(only('core'), existing), existing);
    });

    it('website and kotlin alone need no package lint', () => {
        assert.deepEqual(lintWorkspaces(only('website', 'kotlin', 'github'), existing), []);
    });

    it('csharp lints csharp and the generator inputs', () => {
        assert.deepEqual(lintWorkspaces(only('csharp'), existing), [
            'packages/alphatab',
            'packages/csharp',
            'packages/tooling',
            'packages/transpiler'
        ]);
    });

    it('player skips packages that do not exist yet', () => {
        const ws = lintWorkspaces(only('player'), existing);
        assert.ok(!ws.includes('packages/react'));
        assert.ok(ws.includes('packages/playground'));
        assert.ok(lintWorkspaces(only('player'), [...existing, 'packages/ui']).includes('packages/ui'));
    });
});

describe('isWebsiteRelevant', () => {
    it('matches website, website-consumed packages and the lockfile', () => {
        for (const f of [
            'website/docs/a.mdx',
            'packages/alphatab/src/a.ts',
            'packages/lsp/src/a.ts',
            'packages/monaco/src/a.ts',
            'packages/webpack/src/a.ts',
            'packages/react/src/a.tsx',
            'packages/ui/src/a.tsx',
            'package-lock.json'
        ]) {
            assert.ok(isWebsiteRelevant(f), f);
        }
    });

    it('ignores other packages and root files', () => {
        for (const f of ['packages/csharp/src/a.cs', 'packages/kotlin/a.kt', 'README.md', 'package.json']) {
            assert.ok(!isWebsiteRelevant(f), f);
        }
    });
});

it('area names are unique', () => {
    assert.equal(new Set(areaNames).size, areaNames.length);
});
