/** @typedef {'feature'|'bug'} TaskType */

/**
 * Shared visual tokens for task type — used on cards, modals, and anywhere a task appears.
 * Colors from DESIGN.md §2 (`type-feature`, `type-bug`).
 */
export const TASK_TYPE_META = {
  feature: {
    label: 'Feature',
    stripeClass: 'bg-type-feature',
    textClass: 'text-type-feature',
    borderAccentClass: 'border-l-type-feature',
  },
  bug: {
    label: 'Bug',
    stripeClass: 'bg-type-bug',
    textClass: 'text-type-bug',
    borderAccentClass: 'border-l-type-bug',
  },
};

/** @param {TaskType} type */
export function getTaskTypeMeta(type) {
  return TASK_TYPE_META[type] ?? TASK_TYPE_META.feature;
}
