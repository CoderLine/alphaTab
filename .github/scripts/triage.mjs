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

import { aiDisclosureToken, gracePeriodDays, labelDefs, labels } from './triage-config.mjs';

// HTML marker used to find the bot's own prior comment on re-runs.
const commentMarker = '<!-- triage-bot -->';

// Additional AI-authorship signal for PRs: many AI coding assistants
// (Claude Code, Cursor, Copilot Workspace, Codex) automatically add a
// trailer or "Generated with …" line to the commits they produce. Anchored
// to line start so unrelated prose mentions of these words don't trigger.
const aiCommitTrailerPattern =
    /^\s*(?:co-authored-by:|generated with)[^\n]*?(?:claude|anthropic|openai|codex|cursor|chatgpt|copilot|gpt-)/im;

// ── Rules ────────────────────────────────────────────────────────────────
// A rule has:
//   id          — stable machine identifier for logs / summaries.
//   appliesTo   — 'pr', 'issue', or 'both'.
//   passes      — predicate: (body) => boolean. True = the body is fine.
//   title       — short headline shown as the bullet's bold prefix.
//   body        — string OR (itemBody) => string. Function form lets the
//                 rule generate a dynamic description (e.g. "missing X, Y, Z").
// To add a rule: append an entry below.
// ─────────────────────────────────────────────────────────────────────────

// Section headers emitted by the bug-report form template (each `label:` in
// .github/ISSUE_TEMPLATE/bug_report_form.yml renders as `### <label>`).
// Keep in sync with that file.
const expectedIssueHeaders = [
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

// Section headers in .github/pull_request_template.md.
const expectedPrHeaders = [
    'Issues',
    'Proposed changes',
    'Root-cause analysis',
    'Checklist',
    'AI authorship disclosure'
];

// Matches the linked-issue references GitHub itself accepts as closing
// keywords on PRs:
//   Fixes #123  |  Closes owner/repo#123  |  Resolves https://github.com/o/r/issues/123
// (and all tense variants of fix / close / resolve).
const linkedIssuePattern =
    /(?:close(?:s|d)?|fix(?:es|ed)?|resolve(?:s|d)?)\s+(?:https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/\d+|[\w.-]+\/[\w.-]+#\d+|#\d+)/i;

function bodyContainsHeader(body, header) {
    const expected = `### ${header}`;
    return body.split('\n').some(line => line.trimEnd() === expected);
}

function missingHeaders(body, expected) {
    return expected.filter(h => !bodyContainsHeader(body, h));
}

function describeMissing(missing, all, kind) {
    // If almost everything is missing, we assume the template wasn't used
    // at all rather than just partially edited.
    if (missing.length >= all.length - 1) {
        return kind === 'issue'
            ? 'The bug report template doesn\'t appear to have been used. Please open the issue via the "Bug Report" template — the form collects the specific info we need to reproduce the problem.'
            : 'The pull request template appears to have been overwritten. Please put the sections back — each one serves a specific purpose in review.';
    }
    const plural = missing.length > 1 ? 's' : '';
    const list = missing.map(m => `\`${m}\``).join(', ');
    return `The description is missing section${plural}: ${list}. Please include ${missing.length > 1 ? 'them' : 'it'} — even a short answer keeps the report actionable.`;
}

const rules = [
    {
        id: 'issue-template-incomplete',
        appliesTo: 'issue',
        passes: body => missingHeaders(body, expectedIssueHeaders).length === 0,
        title: 'Use the bug report template',
        body: itemBody => describeMissing(missingHeaders(itemBody, expectedIssueHeaders), expectedIssueHeaders, 'issue')
    },
    {
        id: 'pr-template-incomplete',
        appliesTo: 'pr',
        passes: body => missingHeaders(body, expectedPrHeaders).length === 0,
        title: 'Keep the pull request template sections',
        body: itemBody => describeMissing(missingHeaders(itemBody, expectedPrHeaders), expectedPrHeaders, 'pr')
    },
    {
        id: 'pr-needs-linked-issue',
        appliesTo: 'pr',
        passes: body => linkedIssuePattern.test(body),
        title: 'Link the issue this addresses',
        body: 'Reference it in the description with `Fixes #<n>` (or `Closes` / `Resolves`) so the change can be traced back to the discussion we agreed on.'
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

function ruleAppliesTo(rule, isPr) {
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

    const violations = rules
        .filter(r => ruleAppliesTo(r, isPr) && !r.passes(body))
        .map(r => ({
            id: r.id,
            title: r.title,
            description: typeof r.body === 'function' ? r.body(body) : r.body
        }));
    const hasAiToken = body.includes(aiDisclosureToken);

    const args = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: target.number
    };

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

    if (hasAiToken || hasAiCommitTrailer) {
        await setLabel(labels.aiAuthored, true);
    }

    const aiSignals = [hasAiToken && 'disclosure token', hasAiCommitTrailer && 'commit trailer'].filter(Boolean);
    core.summary
        .addHeading(`Triage: #${target.number} (${isPr ? 'PR' : 'issue'})`)
        .addRaw(`\nViolations: ${violations.map(v => v.id).join(', ') || 'none'}\n`)
        .addRaw(`AI signals: ${aiSignals.join(', ') || 'none detected'}\n`)
        .write();
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
