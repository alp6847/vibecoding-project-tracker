import { getTaskTypeMeta } from './taskType';

/**
 * @param {{ type: 'feature'|'bug', className?: string }} props
 */
export function TaskTypeIcon({ type, className = '' }) {
  const meta = getTaskTypeMeta(type);

  if (type === 'bug') {
    return (
      <svg
        className={`h-3.5 w-3.5 shrink-0 ${meta.textClass} ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        aria-hidden="true"
      >
        <path d="M8 2v2M16 2v2M12 6v2M4 10h2M18 10h2M6 14l-1 4M18 14l1 4M9 18h6" />
        <rect x="8" y="8" width="8" height="8" rx="0" />
      </svg>
    );
  }

  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 ${meta.textClass} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l1 3M19 19l-1 3M3 14l3 1M21 14l-3 1" />
    </svg>
  );
}
