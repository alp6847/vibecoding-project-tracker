/**
 * M9 context — shared constants and helpers for the Context field on the task
 * modal. The Context block is a curated Markdown briefing for the next AI or
 * teammate (PRD §5 / §10): what the task is, what limits it, what's been tried,
 * and the exact next step to pick up.
 */

/**
 * The AI tools a task's context might be aimed at. Optional — `contextTool`
 * stays `null` until the user picks one. Order matches the modal dropdown.
 * @type {readonly string[]}
 */
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

/**
 * Placeholder scaffold pre-filled into a new task's Context field. Four mono
 * uppercase headings the writer fills in — the same shape every curated block
 * ends up in, so the "Copy as Prompt Context" output (M10) reads consistently.
 */
export const CONTEXT_TEMPLATE = `## Background
What is this task about? Link any prior work or prompts.

## Constraints
Tech, time, or design limits the next person must respect.

## Tried so far
What's been attempted and what happened.

## Pick up
The exact next step to take.`;

/**
 * Human "last updated …" label from an ISO timestamp — the small freshness hint
 * shown next to the Context field. Mirrors the matter-of-fact, lowercase voice
 * of DESIGN.md §5: "just now", "5 m ago", "2 h ago", "3 d ago", or a date once
 * it's more than a week old.
 *
 * @param {string|null|undefined} iso  ISO timestamp from `contextUpdatedAt`
 * @param {Date} [now]                 injectable clock for tests
 * @returns {string|null}              null when there's nothing to show
 */
export function formatRelativeTime(iso, now = new Date()) {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;

  const diffMs = now.getTime() - then.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 45) return 'just now';
  if (min < 60) return `${min} m ago`;
  if (hr < 24) return `${hr} h ago`;
  if (day <= 7) return `${day} d ago`;

  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
