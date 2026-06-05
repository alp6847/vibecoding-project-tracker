import { getDueMeta } from './dueDate';

/**
 * A small mono-uppercase due-date tag. Its color is derived live from the
 * task's `status` + `dueDate` (see `getDueMeta`) — the user never sets it, and
 * a done task always reads neutral. Renders nothing when there's no date to
 * show on an open task.
 *
 * @param {{ task: { status: string, dueDate: string|null }, className?: string }} props
 */
export function DueDateTag({ task, className = '' }) {
  const meta = getDueMeta(task);
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center border-[1.5px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${meta.tagClass} ${className}`}
    >
      {meta.label}
    </span>
  );
}
