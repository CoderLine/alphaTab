// Central configuration for the contribution-triage workflows.
//
// Consumed by:
//   * .github/scripts/triage.mjs             (event-triggered rule check)
//   * .github/scripts/close-unaddressed.mjs  (scheduled auto-close)
//
// Edit here to change the deadline, label metadata, or the close-message
// texts. Rule detection lives in triage.mjs; the warning-comment framing
// lives there too.

// ── Timing ───────────────────────────────────────────────────────────────
export const gracePeriodDays = 7;

// ── Labels ───────────────────────────────────────────────────────────────
// Keys are JS names (camelCase). Values are the actual GitHub label names
// (kebab-case). Labels are auto-created on demand.
export const labels = {
    needsUpdates: 'state-needs-updates',
    rulesNotFollowed: 'state-rules-not-followed',
    aiAuthored: 'ai-authored',
    bypassAutoClose: 'do-not-auto-close'
};

// Colors and descriptions used when a managed label needs to be created.
// `bypassAutoClose` is intentionally omitted — the maintainer creates it
// manually when they want to exempt a specific submission.
export const labelDefs = {
    [labels.needsUpdates]: {
        color: 'fbca04',
        description: 'Author needs to update the description to match the contribution rules.'
    },
    [labels.rulesNotFollowed]: {
        color: 'f9d0c4',
        description: 'Closed because the contribution rules were not followed.'
    },
    [labels.aiAuthored]: {
        color: 'c5def5',
        description: 'Contribution was drafted with help of an AI agent.'
    }
};

// ── Detection ────────────────────────────────────────────────────────────
// AI-authored disclosure marker (see AGENTS.md). Rule detection patterns
// live next to their rules in triage.mjs.
export const aiDisclosureToken = 'alphatab-ai-authored-v1';

// NOTE: the list of `author_association` values that skip triage entirely
// (OWNER / COLLABORATOR / MEMBER) is hardcoded in contribution-rules.yml so
// maintainer submissions don't even start a job.

// ── Close messages ───────────────────────────────────────────────────────
// Posted when the grace period expires without an update. The warning
// comment posted at triage time is composed in triage.mjs so it can list
// the specific violations.

const closeIssue = `Closing automatically — the description wasn't updated within the ${gracePeriodDays}-day grace period, so \`${labels.rulesNotFollowed}\` is applied and this issue is closed.

The earlier bot comment lists what needs fixing. Reopen any time by updating the description.`;

const closePr = `Closing automatically — the description wasn't updated within the ${gracePeriodDays}-day grace period, so \`${labels.rulesNotFollowed}\` is applied and this pull request is closed.

The earlier bot comment lists what needs fixing. Reopen any time by updating the description.`;

export const messages = {
    closeIssue,
    closePr
};
