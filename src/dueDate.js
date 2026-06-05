/** @typedef {'safe'|'warning'|'overdue'|'neutral'} DueState */

/**
 * Shared visual tokens for a task's due-date state — used by the card tag and
 * the modal. Colors from DESIGN.md §2 (`due-safe`, `due-warning`, `due-overdue`,
 * `due-neutral`). Each fill is paired with a foreground that stays readable:
 * the light warning yellow takes ink text, the darker fills take page text.
 * Every tag keeps the 1.5 px ink border from DESIGN.md §4.
 */
const DUE_STATE_META = {
  safe: {
    state: 'safe',
    tagClass: 'border-text-primary bg-due-safe text-surface-page',
  },
  warning: {
    state: 'warning',
    tagClass: 'border-text-primary bg-due-warning text-text-primary',
  },
  overdue: {
    state: 'overdue',
    tagClass: 'border-text-primary bg-due-overdue text-surface-page',
  },
  neutral: {
    state: 'neutral',
    tagClass: 'border-text-primary bg-due-neutral text-surface-page',
  },
};

/** Whole-day difference between today and an ISO 'YYYY-MM-DD' date (date-only). */
function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${iso}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/** Short, mono-friendly date label, e.g. 'Jun 10'. */
function formatDue(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Derive the due-date tag for a task purely from its existing `status` and
 * `dueDate` — no stored state, so the color is always live.
 *
 *   done                 → neutral   (overrides the date, even if it was overdue)
 *   past due             → overdue
 *   within 2 days        → warning
 *   more than 2 days out → safe
 *
 * @param {{ status: string, dueDate: string|null }} task
 * @returns {(typeof DUE_STATE_META[keyof typeof DUE_STATE_META] & { label: string }) | null}
 *          null when there is nothing to show (no due date on an open task).
 */
export function getDueMeta(task) {
  if (task.status === 'done') {
    return { ...DUE_STATE_META.neutral, label: 'Done' };
  }
  if (!task.dueDate) return null;

  const diff = daysUntil(task.dueDate);
  const when = formatDue(task.dueDate);

  if (diff < 0) {
    return { ...DUE_STATE_META.overdue, label: `Overdue ${when}` };
  }
  if (diff <= 2) {
    return { ...DUE_STATE_META.warning, label: `Due ${when}` };
  }
  return { ...DUE_STATE_META.safe, label: `Due ${when}` };
}
