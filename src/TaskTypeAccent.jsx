import { getTaskTypeMeta } from './taskType';
import { TaskTypeIcon } from './TaskTypeIcon';

/**
 * Wraps task UI with a left accent stripe and corner type icon.
 *
 * @param {{
 *   type: 'feature'|'bug',
 *   children: import('react').ReactNode,
 *   className?: string,
 *   onClick?: () => void,
 * }} props
 */
export function TaskTypeAccent({ type, children, className = '', onClick }) {
  const meta = getTaskTypeMeta(type);
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative w-full border-[1.5px] border-text-primary bg-surface-card text-left ${className}`}
    >
      <span
        className={`absolute bottom-0 left-0 top-0 w-[3px] ${meta.stripeClass}`}
        aria-hidden="true"
      />
      <span className="absolute right-2 top-2" aria-hidden="true">
        <TaskTypeIcon type={type} />
      </span>
      <div className="pl-4 pr-8">{children}</div>
    </Tag>
  );
}

/**
 * Mono uppercase type label — for modals and detail views.
 *
 * @param {{ type: 'feature'|'bug' }} props
 */
export function TaskTypeLabel({ type }) {
  const meta = getTaskTypeMeta(type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide ${meta.textClass}`}
    >
      <TaskTypeIcon type={type} />
      {meta.label}
    </span>
  );
}
