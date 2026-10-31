// Contribution-rules triage.
//
// Runs on every issue/PR open/edit event. Detects rule violations, applies
// or removes the `state-needs-updates` label, and posts or updates a warning
// comment listing the specific things the author needs to address. When all
// violations are resolved, the label is removed and the bot's warning
// comment is deleted so the thread stays clean.
//
// The companion script close-unaddressed.mjs runs on a schedule and closes
// items that still have `state-needs-updates` after the grace period.
//
// Parameters (passed as a single object):
//   github  — Octokit REST client bound to the workflow's GITHUB_TOKEN.
//   context — @actions/github context.
//   core    — @actions/core helpers.

import { readFile } from 'node:fs/promises';
import {
    aiDisclosureToken,
    docsOnlyPathPrefixes,
    gracePeriodDays,
    issueTemplates,
    labelDefs,
    labels,
    pullRequestHeaders
} from './triage-config.mjs';

// HTML marker used to find the bot's own prior comment on re-runs.
const commentMarker = '<!-- triage-bot -->';

// Additional AI-authorship signal for PRs: many AI coding assistants
// (Claude Code, Cursor, Copilot Workspace, Codex) automatically add a
// trailer or "Generated with …" line to the commits they produce. Anchored
// to line start so unrelated prose mentions of these words don't trigger.
const aiCommitTrailerPattern =
    /^\s*(?:co-authored-by:|generated with)[^\n]*?(?:claude|anthropic|openai|codex|cursor|chatgpt|copilot|gpt-)/im;

// What GitHub issue forms render for an optional field left empty.
const noResponse = '_No response_';

// Matches the linked-issue references GitHub itself accepts as closing
// keywords on PRs:
//   Fixes #123  |  Closes owner/repo#123  |  Resolves https://github.com/o/r/issues/123
// (and all tense variants of fix / close / resolve).
const linkedIssuePattern =
    /(?:close(?:s|d)?|fix(?:es|ed)?|resolve(?:s|d)?)\s+(?:https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/\d+|[\w.-]+\/[\w.-]+#\d+|#\d+)/i;

// ── Templates ────────────────────────────────────────────────────────────

/**
 * The section headers an issue form renders, in form order: the `label` of
 * every non-markdown body item (each becomes `### <label>` in the issue).
 * Checkbox options (`- label:`) are not headers.
 */
export function formHeaders(yaml) {
    const headers = [];
    let itemType = null;
    for (const line of yaml.split(/\r?\n/)) {
        const item = /^- type:\s*(\S+)/.exec(line);
        if (item) {
            itemType = item[1];
            continue;
        }
        const label = /^ {4}label:\s*(.+?)\s*$/.exec(line);
        if (label && itemType !== 'markdown') {
            headers.push(unquote(label[1]));
        }
    }
    return headers;
}

function unquote(value) {
    if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1).replaceAll("''", "'");
    }
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replaceAll('\\"', '"');
    }
    return value;
}

/** The registry entries of triage-config.mjs, each with its form's `headers`. */
export async function loadIssueTemplates() {
    return Promise.all(
        issueTemplates.map(async template => {
            const yaml = await readFile(new URL(`../ISSUE_TEMPLATE/${template.file}`, import.meta.url), 'utf8');
            return { ...template, headers: formHeaders(yaml) };
        })
    );
}

/**
 * The template whose own headers (those no other template has) appear most
 * often in `body`, or null when none of them appear. Labels play no part,
 * so relabelling an issue doesn't change the match.
 */
export function matchTemplate(body, templates) {
    let best = null;
    let bestScore = 0;
    for (const template of templates) {
        const isUnique = h => !templates.some(other => other !== template && other.headers.includes(h));
        const score = template.headers.filter(h => isUnique(h) && bodyContainsHeader(body, h)).length;
        if (score > bestScore) {
            best = template;
            bestScore = score;
        }
    }
    return best;
}

function splitLines(body) {
    return body.split(/\r?\n/);
}

function bodyContainsHeader(body, header) {
    const expected = `### ${header}`;
    return splitLines(body).some(line => line.trimEnd() === expected);
}

function missingHeaders(body, expected) {
    return expected.filter(h => !bodyContainsHeader(body, h));
}

/**
 * The trimmed text between `### <header>` and the next `### ` line, or null
 * when the header is absent. An optional form field left empty yields
 * `_No response_`.
 */
export function sectionContent(body, header) {
    const lines = splitLines(body);
    const start = lines.findIndex(line => line.trimEnd() === `### ${header}`);
    if (start < 0) {
        return null;
    }
    const end = lines.findIndex((line, i) => i > start && line.startsWith('### '));
    return lines
        .slice(start + 1, end < 0 ? undefined : end)
        .join('\n')
        .trim();
}

function isBlank(content) {
    return content === '' || content === noResponse;
}

function sectionList(missing) {
    const plural = missing.length > 1 ? 's' : '';
    const list = missing.map(m => `\`${m}\``).join(', ');
    return { plural, list, pronoun: missing.length > 1 ? 'them' : 'it' };
}

function describeIssueTemplateProblem({ body, template, templates }) {
    if (!template) {
        const choices = templates.map(t => `${t.name} (${t.purpose})`).join(' or ');
        return `The issue doesn't appear to use one of our templates. Please open the issue via ${choices} — the form collects the specific info we need to act on it.`;
    }
    const { plural, list, pronoun } = sectionList(missingHeaders(body, template.headers));
    return `The description is missing section${plural} of the ${template.name} template: ${list}. Please include ${pronoun} — even a short answer keeps the report actionable.`;
}

function describeMissingPrSections({ body }) {
    const missing = missingHeaders(body, pullRequestHeaders);
    // Nearly everything gone means the template was replaced, not edited.
    if (missing.length >= pullRequestHeaders.length - 1) {
        return 'The pull request template appears to have been overwritten. Please put the sections back — each one serves a specific purpose in review.';
    }
    const { plural, list, pronoun } = sectionList(missing);
    return `The description is missing section${plural}: ${list}. Please include ${pronoun} — even a short answer keeps the report actionable.`;
}

function isDocsOnly(changedFiles) {
    const isDocsPath = path => docsOnlyPathPrefixes.some(prefix => path.startsWith(prefix));
    return (
        changedFiles.length > 0 &&
        changedFiles.every(f => isDocsPath(f.filename) && (!f.previous_filename || isDocsPath(f.previous_filename)))
    );
}

// ── AI disclosure ────────────────────────────────────────────────────────

// HTML comments (an unclosed one hides the rest of the body, as on GitHub).
function withoutHtmlComments(body) {
    return body.replace(/<!--[\s\S]*?(?:-->|$)/g, '');
}

/**
 * Whether the body carries the disclosure token outside the places where the
 * PR template itself mentions it: HTML comments and task-list items (with
 * their indented continuation lines).
 */
export function hasDisclosureToken(body) {
    const kept = [];
    let inTaskItem = false;
    for (const line of splitLines(withoutHtmlComments(body))) {
        if (/^\s*[-*+]\s+\[[ xX]\]/.test(line)) {
            inTaskItem = true;
            continue;
        }
        if (inTaskItem && /^\s+\S/.test(line)) {
            continue;
        }
        inTaskItem = false;
        kept.push(line);
    }
    return kept.join('\n').includes(aiDisclosureToken);
}

// The PR template's "An AI agent contributed to this PR" checkbox, ticked.
function declaresAiContribution(body) {
    return /^\s*[-*+]\s+\[[xX]\]\s+An AI agent contributed\b/m.test(withoutHtmlComments(body));
}

// ── Rules ────────────────────────────────────────────────────────────────
// A rule has:
//   id          — stable machine identifier for logs / summaries.
//   appliesTo   — 'pr', 'issue', or 'both'.
//   template    — optional issue template id; the rule then only applies
//                 to issues matched to that template.
//   skip        — optional predicate: (ctx) => boolean. True = not checked.
//   passes      — predicate: (ctx) => boolean. True = the body is fine.
//   title       — string OR (ctx) => string; the bullet's bold prefix.
//   body        — string OR (ctx) => string. Function form lets the rule
//                 generate a dynamic description (e.g. "missing X, Y, Z").
// `ctx` is { body, templates, template, changedFiles }: `template` is the
// matched issue template (null for PRs or when none matches),
// `changedFiles` the PR's files as returned by pulls.listFiles.
// To add a rule: append an entry below.
// ─────────────────────────────────────────────────────────────────────────

const rules = [
    {
        id: 'issue-template-incomplete',
        appliesTo: 'issue',
        passes: ({ body, template }) => template !== null && missingHeaders(body, template.headers).length === 0,
        title: ({ template }) => (template ? `Complete the ${template.name} template` : 'Use an issue template'),
        body: describeIssueTemplateProblem
    },
    {
        id: 'docs-page-url',
        appliesTo: 'issue',
        template: 'docs',
        passes: ({ body }) => {
            const page = sectionContent(body, 'Affected page');
            return page === null || /\balphatab\.net\b/i.test(page);
        },
        title: 'Link the affected page',
        body: 'Put the full URL of the page into `Affected page`, e.g. `https://www.alphatab.net/docs/…` or `https://next.alphatab.net/docs/…`. The host tells us which release the page belongs to.'
    },
    {
        id: 'docs-broken-needs-environment',
        appliesTo: 'issue',
        template: 'docs',
        passes: ({ body }) => {
            const kind = sectionContent(body, 'Kind of problem');
            const environment = sectionContent(body, 'Browser and operating system');
            return !kind?.startsWith('Broken') || environment === null || !isBlank(environment);
        },
        title: 'Name your browser and operating system',
        body: 'Broken pages and examples often depend on the browser. Please fill in `Browser and operating system`, e.g. "Firefox 144 on Windows 11".'
    },
    {
        id: 'pr-template-incomplete',
        appliesTo: 'pr',
        passes: ({ body }) => missingHeaders(body, pullRequestHeaders).length === 0,
        title: 'Keep the pull request template sections',
        body: describeMissingPrSections
    },
    {
        id: 'pr-needs-linked-issue',
        appliesTo: 'pr',
        skip: ({ changedFiles }) => isDocsOnly(changedFiles),
        passes: ({ body }) => linkedIssuePattern.test(body),
        title: 'Link the issue this addresses',
        body: 'Reference it in the description with `Fixes #<n>` (or `Closes` / `Resolves`) so the change can be traced back to the discussion we agreed on.'
    },
    {
        id: 'pr-ai-disclosure-missing',
        appliesTo: 'pr',
        passes: ({ body }) => !declaresAiContribution(body) || hasDisclosureToken(body),
        title: 'Add the AI-authored disclosure block',
        body: 'You ticked that an AI agent contributed to this PR. Please put the disclosure block from [AGENTS.md § Mandatory disclosure](https://github.com/CoderLine/alphaTab/blob/develop/AGENTS.md#mandatory-disclosure-read-this-first) at the very top of the description.'
    }
    // ─────────────────────────────────────────────────────────────────────
    // FUTURE: LLM-based rule — "issue talks about a solution, not a problem".
    //
    // Some issues describe a proposed fix ("the bug is at line X", diff
    // snippets, "the fix would be…") instead of the observed behavior. A
    // regex would false-positive on legitimate reports that include a small
    // code snippet, so this needs an LLM classifier. To wire it in:
    //
    //   1. Add a workflow step BEFORE this one that pipes the item body to
    //      an LLM classifier and writes
    //          { suggestsFix: boolean, evidence: string }
    //      to $RUNNER_TEMP/classification.json.
    //   2. Load it in triage() and push a violation when suggestsFix is true:
    //
    //      const fs = await import('node:fs/promises');
    //      const c = JSON.parse(await fs.readFile(
    //          `${process.env.RUNNER_TEMP}/classification.json`, 'utf8'
    //      ));
    //      if (c.suggestsFix) {
    //          violations.push({
    //              id: 'issue-suggests-fix-rather-than-problem',
    //              title: 'Describe the problem, not the fix',
    //              description: `Please focus on what you observe rather than a proposed change. ${c.evidence}`
    //          });
    //      }
    // ─────────────────────────────────────────────────────────────────────
];

function ruleAppliesTo(rule, isPr, template) {
    if (rule.template !== undefined && rule.template !== template?.id) {
        return false;
    }
    if (rule.appliesTo === 'both') {
        return true;
    }
    return (rule.appliesTo === 'pr') === isPr;
}

function composeWarning(isPr, violations) {
    const kind = isPr ? 'pull request' : 'issue';
    const opener = isPr
        ? 'Thanks for the pull request. Before we dig into the code, a couple of things need addressing in the description:'
        : 'Thanks for opening this. Before we dig in, a couple of things need addressing in the description:';
    const bullets = violations.map(v => `- **${v.title}.** ${v.description}`).join('\n');
    const tail = [
        `If the description isn't updated within **${gracePeriodDays} days**, this ${kind} will be closed automatically and labeled \`${labels.rulesNotFollowed}\`. Reopen any time — an edit to the description is all it takes.`,
        `If an AI helped draft this, \`AGENTS.md\` covers the same expectations from the AI side.`
    ].join('\n\n');
    return `${commentMarker}\n\n${opener}\n\n${bullets}\n\n${tail}`;
}

export default async function triage({ github, context, core }) {
    const isPr = !!context.payload.pull_request;
    const target = isPr ? context.payload.pull_request : context.payload.issue;
    const body = target.body || '';

    const args = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: target.number
    };

    const templates = isPr ? [] : await loadIssueTemplates();
    const ctx = {
        body,
        templates,
        template: isPr ? null : matchTemplate(body, templates),
        changedFiles: isPr ? await listPrFiles(github, args.owner, args.repo, target.number) : []
    };
    const resolve = value => (typeof value === 'function' ? value(ctx) : value);

    const violations = rules
        .filter(r => ruleAppliesTo(r, isPr, ctx.template) && !r.skip?.(ctx) && !r.passes(ctx))
        .map(r => ({
            id: r.id,
            title: resolve(r.title),
            description: resolve(r.body)
        }));
    const hasAiToken = hasDisclosureToken(body);
    const hasAiCheckbox = isPr && declaresAiContribution(body);

    const hasAiCommitTrailer = isPr
        ? await prCommitsHaveAiTrailer(github, args.owner, args.repo, target.number)
        : false;

    // Snapshot of labels already on the item at event fire time. Used to
    // skip no-op API calls — important because addLabels on a label that's
    // already applied may create a duplicate `labeled` timeline event,
    // which would reset the grace-period clock in close-unaddressed.mjs.
    const currentLabels = new Set((target.labels ?? []).map(l => l.name));

    const ensureLabel = async name => {
        const def = labelDefs[name];
        if (!def) {
            throw new Error(`No labelDefs entry for ${name}`);
        }
        try {
            await github.rest.issues.createLabel({
                owner: args.owner,
                repo: args.repo,
                name,
                ...def
            });
        } catch (e) {
            // 422 = already exists
            if (e.status !== 422) {
                throw e;
            }
        }
    };

    const setLabel = async (name, on) => {
        const alreadyApplied = currentLabels.has(name);
        if (!on) {
            if (!alreadyApplied) {
                return; // nothing to remove
            }
            try {
                await github.rest.issues.removeLabel({ ...args, name });
            } catch (e) {
                // label wasn't on the issue (race with a manual removal)
                if (e.status !== 404) {
                    throw e;
                }
            }
            return;
        }
        if (alreadyApplied) {
            return; // skip the no-op addLabels — see currentLabels comment
        }
        try {
            await github.rest.issues.addLabels({ ...args, labels: [name] });
        } catch (e) {
            if (e.status !== 422) {
                throw e;
            }
            // 422 = label doesn't exist in the repo yet; create it and retry.
            await ensureLabel(name);
            await github.rest.issues.addLabels({ ...args, labels: [name] });
        }
    };

    // Locate any prior bot comment (for idempotent update / delete).
    const priorBotComment = await findPriorBotComment(github, args);
    const hasViolations = violations.length > 0;

    if (hasViolations) {
        const commentBody = composeWarning(isPr, violations);
        if (priorBotComment) {
            if (priorBotComment.body !== commentBody) {
                await github.rest.issues.updateComment({
                    owner: args.owner,
                    repo: args.repo,
                    comment_id: priorBotComment.id,
                    body: commentBody
                });
            }
        } else {
            await github.rest.issues.createComment({ ...args, body: commentBody });
        }
        await setLabel(labels.needsUpdates, true);
    } else {
        // Author addressed everything — clear the label and remove any prior
        // bot comment so the thread doesn't carry the old nag.
        if (priorBotComment) {
            await github.rest.issues.deleteComment({
                owner: args.owner,
                repo: args.repo,
                comment_id: priorBotComment.id
            });
        }
        await setLabel(labels.needsUpdates, false);
    }

    if (hasAiToken || hasAiCheckbox || hasAiCommitTrailer) {
        await setLabel(labels.aiAuthored, true);
    }

    const aiSignals = [
        hasAiToken && 'disclosure token',
        hasAiCheckbox && 'AI checkbox',
        hasAiCommitTrailer && 'commit trailer'
    ].filter(Boolean);
    core.summary
        .addHeading(`Triage: #${target.number} (${isPr ? 'PR' : 'issue'})`)
        .addRaw(isPr ? '' : `\nTemplate: ${ctx.template?.id ?? 'none'}\n`)
        .addRaw(`\nViolations: ${violations.map(v => v.id).join(', ') || 'none'}\n`)
        .addRaw(`AI signals: ${aiSignals.join(', ') || 'none detected'}\n`)
        .write();
}

async function listPrFiles(github, owner, repo, pullNumber) {
    return github.paginate(github.rest.pulls.listFiles, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100
    });
}

async function prCommitsHaveAiTrailer(github, owner, repo, pullNumber) {
    for await (const { data } of github.paginate.iterator(github.rest.pulls.listCommits, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100
    })) {
        if (data.some(c => aiCommitTrailerPattern.test(c.commit?.message ?? ''))) {
            return true;
        }
    }
    return false;
}

async function findPriorBotComment(github, args) {
    for await (const { data } of github.paginate.iterator(github.rest.issues.listComments, args)) {
        const found = data.find(c => (c.body || '').includes(commentMarker));
        if (found) {
            return found;
        }
    }
    return null;
}
