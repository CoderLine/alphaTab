import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import triage, { formHeaders, loadIssueTemplates, sectionContent } from './triage.mjs';
import { aiDisclosureToken, issueTemplates, labels, pullRequestHeaders } from './triage-config.mjs';

const bugHeaders = [
    'Is there an existing issue for this?',
    'I have read the contribution rules',
    'AI authorship',
    'Current Behavior',
    'Expected Behavior',
    'Steps To Reproduce',
    'Link to jsFiddle, CodePen, Project',
    'Version and Environment',
    'Platform',
    'Anything else?'
];

const docsHeaders = [
    'Is there an existing issue for this?',
    'I have read the contribution rules',
    'AI authorship',
    'Kind of problem',
    'Affected page',
    'Section or element',
    'What is wrong or missing?',
    'What did you expect?',
    'Browser and operating system',
    'Screenshots, anything else?'
];

const readRepoFile = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Mirrors how GitHub renders a submitted issue form.
function renderIssue(headers, values = {}) {
    return headers.map(h => `### ${h}\n\n${values[h] ?? '_No response_'}`).join('\n\n');
}

const commonValues = {
    'Is there an existing issue for this?': '- [X] I have searched the existing issues',
    'I have read the contribution rules': '- [X] I have read CONTRIBUTING.md',
    'AI authorship': 'Written by a human, no AI assistance'
};

const completeBug = renderIssue(bugHeaders, {
    ...commonValues,
    'Current Behavior': 'The tie is drawn below the staff.',
    'Expected Behavior': 'The tie is drawn above the staff.',
    'Steps To Reproduce': '1. Load the attached file',
    'Version and Environment': '[AlphaTab][VersionInfo] alphaTab 1.8.4',
    Platform: 'Web'
});

const docsValues = {
    ...commonValues,
    'Kind of problem': 'Wrong or outdated information',
    'Affected page': 'https://www.alphatab.net/docs/getting-started/installation-web',
    'What is wrong or missing?': 'The page says "Install with yarn".',
    'What did you expect?': 'The npm command that works with alphaTab 1.8.4.'
};

function fakeGithub({ comments = [], commits = [], files = [] } = {}) {
    const calls = [];
    const record = name => async params => {
        calls.push({ name, params });
        return { data: {} };
    };
    const list = data => Object.assign(async () => ({ data }), { data });
    return {
        calls,
        called: name => calls.filter(c => c.name === name),
        rest: {
            issues: {
                createLabel: record('createLabel'),
                addLabels: record('addLabels'),
                removeLabel: record('removeLabel'),
                createComment: record('createComment'),
                updateComment: record('updateComment'),
                deleteComment: record('deleteComment'),
                listComments: list(comments)
            },
            pulls: {
                listCommits: list(commits),
                listFiles: list(files)
            }
        },
        paginate: Object.assign(async fn => fn.data, {
            async *iterator(fn) {
                yield { data: fn.data };
            }
        })
    };
}

function fakeCore() {
    const raw = [];
    const summary = {
        addHeading: () => summary,
        addRaw: text => {
            raw.push(text);
            return summary;
        },
        write: async () => {}
    };
    return {
        info: () => {},
        summary,
        violations: () => {
            const line = raw.join('').match(/Violations: (.*)/)[1];
            return line === 'none' ? [] : line.split(', ');
        },
        template: () => raw.join('').match(/Template: (.*)/)?.[1]
    };
}

async function runIssue(body, { labels: issueLabels = [], comments = [] } = {}) {
    const github = fakeGithub({ comments });
    const core = fakeCore();
    const context = {
        repo: { owner: 'CoderLine', repo: 'alphaTab' },
        payload: { issue: { number: 1, body, labels: issueLabels.map(name => ({ name })) } }
    };
    await triage({ github, context, core });
    return { github, core };
}

async function runPr(body, files, { commits = [] } = {}) {
    const github = fakeGithub({ files: files.map(filename => ({ filename })), commits });
    const core = fakeCore();
    const context = {
        repo: { owner: 'CoderLine', repo: 'alphaTab' },
        payload: { pull_request: { number: 2, body, labels: [] } }
    };
    await triage({ github, context, core });
    return { github, core };
}

function addedLabels(github) {
    return github.called('addLabels').flatMap(c => c.params.labels);
}

describe('templates', () => {
    it('reads the bug form headers', async () => {
        assert.deepEqual(formHeaders(await readRepoFile('ISSUE_TEMPLATE/bug_report_form.yml')), bugHeaders);
    });

    it('reads the docs form headers', async () => {
        assert.deepEqual(formHeaders(await readRepoFile('ISSUE_TEMPLATE/docs_report_form.yml')), docsHeaders);
    });

    it('pins the pull request template headers', async () => {
        const template = await readRepoFile('pull_request_template.md');
        const headers = [...template.matchAll(/^### (.+?)\s*$/gm)].map(m => m[1]);
        assert.deepEqual(headers, pullRequestHeaders);
        assert.deepEqual(pullRequestHeaders, ['Issues', 'Proposed changes', 'Checklist', 'AI authorship disclosure']);
    });

    it('names each registry entry like its form', async () => {
        for (const template of issueTemplates) {
            const yaml = await readRepoFile(`ISSUE_TEMPLATE/${template.file}`);
            assert.equal(yaml.match(/^name:\s*(.+?)\s*$/m)[1], template.name);
        }
        assert.deepEqual(
            (await loadIssueTemplates()).map(t => t.id),
            ['bug', 'docs']
        );
    });

    it('strips quotes from labels', () => {
        const yaml =
            "body:\n- type: input\n  attributes:\n    label: 'It''s here'\n- type: textarea\n  attributes:\n    label: \"Quoted\"\n";
        assert.deepEqual(formHeaders(yaml), ["It's here", 'Quoted']);
    });

    it('reads a section up to the next header', () => {
        const body = renderIssue(docsHeaders, docsValues);
        assert.equal(sectionContent(body, 'Affected page'), docsValues['Affected page']);
        assert.equal(sectionContent(body, 'Section or element'), '_No response_');
        assert.equal(sectionContent(body, 'Not there'), null);
    });
});

describe('issues', () => {
    it('accepts a complete bug report', async () => {
        const { github, core } = await runIssue(completeBug);
        assert.equal(core.template(), 'bug');
        assert.deepEqual(core.violations(), []);
        assert.equal(github.called('createComment').length, 0);
        assert.deepEqual(addedLabels(github), []);
    });

    it('accepts a complete docs report', async () => {
        const { github, core } = await runIssue(renderIssue(docsHeaders, docsValues), {
            labels: ['area-documentation']
        });
        assert.equal(core.template(), 'docs');
        assert.deepEqual(core.violations(), []);
        assert.equal(github.called('createComment').length, 0);
        assert.deepEqual(addedLabels(github), []);
    });

    it('asks for the page URL', async () => {
        const body = renderIssue(docsHeaders, { ...docsValues, 'Affected page': 'the installation page' });
        const { github, core } = await runIssue(body);
        assert.deepEqual(core.violations(), ['docs-page-url']);
        assert.deepEqual(addedLabels(github), [labels.needsUpdates]);
        assert.match(github.called('createComment')[0].params.body, /Link the affected page/);
    });

    it('asks for the browser when an example is broken', async () => {
        const kind = 'Broken interactive example or player (score, playback, editor)';
        const { core } = await runIssue(renderIssue(docsHeaders, { ...docsValues, 'Kind of problem': kind }));
        assert.deepEqual(core.violations(), ['docs-broken-needs-environment']);

        const { core: withBrowser } = await runIssue(
            renderIssue(docsHeaders, {
                ...docsValues,
                'Kind of problem': kind,
                'Browser and operating system': 'Firefox 144 on Windows 11'
            })
        );
        assert.deepEqual(withBrowser.violations(), []);
    });

    it('names both templates for free text', async () => {
        const { github, core } = await runIssue('The player does not work on my site. Please help!');
        assert.equal(core.template(), 'none');
        assert.deepEqual(core.violations(), ['issue-template-incomplete']);
        const comment = github.called('createComment')[0].params.body;
        assert.match(comment, /🕷️ Bug Report \(alphaTab behaves wrong\) or 📖 Documentation \/ Website/);
    });

    it('names the matched template for missing sections', async () => {
        const body = renderIssue(
            docsHeaders.filter(h => h !== 'Screenshots, anything else?'),
            docsValues
        );
        const { github, core } = await runIssue(body);
        assert.deepEqual(core.violations(), ['issue-template-incomplete']);
        const comment = github.called('createComment')[0].params.body;
        assert.match(comment, /of the 📖 Documentation \/ Website template: `Screenshots, anything else\?`/);
    });

    it('matches by headers after the label is removed', async () => {
        const priorComment = { id: 7, body: '<!-- triage-bot -->\n\nold warning' };
        const { github, core } = await runIssue(renderIssue(docsHeaders, docsValues), {
            labels: [labels.needsUpdates],
            comments: [priorComment]
        });
        assert.equal(core.template(), 'docs');
        assert.deepEqual(core.violations(), []);
        assert.deepEqual(
            github.called('removeLabel').map(c => c.params.name),
            [labels.needsUpdates]
        );
        assert.equal(github.called('deleteComment')[0].params.comment_id, 7);

        const { core: withoutUrl } = await runIssue(
            renderIssue(docsHeaders, { ...docsValues, 'Affected page': '_No response_' })
        );
        assert.deepEqual(withoutUrl.violations(), ['docs-page-url']);
    });

    it('labels AI-authored issues', async () => {
        const body = renderIssue(bugHeaders, {
            ...commonValues,
            'Current Behavior': `> **AI-authored disclosure (\`${aiDisclosureToken}\`)**\n\nThe tie is wrong.`
        });
        const { github } = await runIssue(body);
        assert.ok(addedLabels(github).includes(labels.aiAuthored));
    });
});

describe('pull requests', () => {
    it('accepts the template with a linked issue', async () => {
        const body = (await readRepoFile('pull_request_template.md')).replace('Fixes #', 'Fixes #123');
        const { core } = await runPr(body, ['packages/alphatab/src/Settings.ts']);
        assert.deepEqual(core.violations(), []);
    });

    it('accepts a docs-only change without a linked issue', async () => {
        const body = await readRepoFile('pull_request_template.md');
        const { core } = await runPr(body, ['website/docs/guides/lowlevel.mdx', 'website/static/llms.txt']);
        assert.deepEqual(core.violations(), []);
    });

    it('requires a linked issue for code changes', async () => {
        const body = await readRepoFile('pull_request_template.md');
        const { core } = await runPr(body, ['website/docs/guides/lowlevel.mdx', 'packages/alphatab/src/Settings.ts']);
        assert.deepEqual(core.violations(), ['pr-needs-linked-issue']);
    });

    it('still checks the template on docs-only changes', async () => {
        const { core } = await runPr('Fixed a typo.', ['website/docs/introduction.mdx']);
        assert.deepEqual(core.violations(), ['pr-template-incomplete']);
    });

    it('labels PRs with AI commit trailers', async () => {
        const body = (await readRepoFile('pull_request_template.md')).replace('Fixes #', 'Fixes #123');
        const { github } = await runPr(body, ['packages/alphatab/src/Settings.ts'], {
            commits: [{ commit: { message: 'fix: tie\n\nCo-Authored-By: Claude <noreply@anthropic.com>' } }]
        });
        assert.ok(addedLabels(github).includes(labels.aiAuthored));
    });
});
