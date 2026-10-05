// Auto-close of issues/PRs that didn't get updated within the grace period.
//
// Runs on a daily schedule from .github/workflows/auto-close-unaddressed.yml.
// Enumerates every open item that still carries the `state-needs-updates`
// label; for each, reads the timestamp of the "labeled" event and closes
// the item if the grace period has elapsed. The `do-not-auto-close` label
// exempts a specific submission.
//
// This deliberately replaces actions/stale so that the warning posted by
// triage.mjs (which lists the specific violations) is not duplicated by an
// additional stale-marker comment.

import { gracePeriodDays, labelDefs, labels, messages } from './triage-config.mjs';

const dayMs = 24 * 60 * 60 * 1000;

export default async function closeUnaddressed({ github, context, core, dryRun = false }) {
    const { owner, repo } = context.repo;
    const graceMs = gracePeriodDays * dayMs;
    const now = Date.now();

    const items = await github.paginate(github.rest.issues.listForRepo, {
        owner,
        repo,
        state: 'open',
        labels: labels.needsUpdates,
        per_page: 100
    });

    core.info(`Found ${items.length} candidate(s) with \`${labels.needsUpdates}\`.`);

    let closed = 0;
    let skipped = 0;

    for (const item of items) {
        const decision = await decide(github, owner, repo, item, graceMs, now);
        core.info(`#${item.number}: ${decision.reason}`);
        if (decision.action !== 'close') {
            skipped++;
            continue;
        }
        if (dryRun) {
            continue;
        }
        await closeItem(github, owner, repo, item);
        closed++;
    }

    core.summary
        .addHeading('Auto-close unaddressed')
        .addRaw(`\nCandidates: ${items.length}, closed: ${closed}, skipped: ${skipped}${dryRun ? ' (dry-run)' : ''}\n`)
        .write();
}

async function decide(github, owner, repo, item, graceMs, now) {
    if (item.labels.some(l => l.name === labels.bypassAutoClose)) {
        return { action: 'skip', reason: `bypassed via \`${labels.bypassAutoClose}\`` };
    }

    const labeledAt = await findLabeledAt(github, owner, repo, item.number);
    if (labeledAt === null) {
        return { action: 'skip', reason: 'no matching "labeled" event found' };
    }

    const elapsedMs = now - labeledAt;
    if (elapsedMs < graceMs) {
        const remainingDays = Math.ceil((graceMs - elapsedMs) / dayMs);
        return { action: 'skip', reason: `${remainingDays}d remaining in grace period` };
    }

    return { action: 'close', reason: `${Math.floor(elapsedMs / dayMs)}d elapsed since labeling` };
}

async function findLabeledAt(github, owner, repo, issueNumber) {
    let latest = null;
    for await (const { data } of github.paginate.iterator(github.rest.issues.listEvents, {
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100
    })) {
        for (const event of data) {
            if (event.event === 'labeled' && event.label?.name === labels.needsUpdates) {
                const at = new Date(event.created_at).getTime();
                if (latest === null || at > latest) {
                    latest = at;
                }
            }
        }
    }
    return latest;
}

async function closeItem(github, owner, repo, item) {
    const isPr = !!item.pull_request;
    const body = isPr ? messages.closePr : messages.closeIssue;

    await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: item.number,
        body
    });
    await addLabelWithCreate(github, owner, repo, item.number, labels.rulesNotFollowed);

    // `state_reason` is meaningful for issues (shown as "closed as not planned")
    // but has no display effect for PRs — omit it there to keep the call clean.
    const updateParams = {
        owner,
        repo,
        issue_number: item.number,
        state: 'closed'
    };
    if (!isPr) {
        updateParams.state_reason = 'not_planned';
    }
    await github.rest.issues.update(updateParams);
}

async function addLabelWithCreate(github, owner, repo, issueNumber, name) {
    try {
        await github.rest.issues.addLabels({
            owner,
            repo,
            issue_number: issueNumber,
            labels: [name]
        });
    } catch (e) {
        if (e.status !== 422) {
            throw e;
        }
        const def = labelDefs[name];
        if (!def) {
            throw new Error(`No labelDefs entry for ${name}`);
        }
        try {
            await github.rest.issues.createLabel({ owner, repo, name, ...def });
        } catch (createErr) {
            if (createErr.status !== 422) {
                throw createErr;
            }
        }
        await github.rest.issues.addLabels({
            owner,
            repo,
            issue_number: issueNumber,
            labels: [name]
        });
    }
}
