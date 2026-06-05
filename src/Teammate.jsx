/**
 * Shared visual identity for the three teammates (PRD §8 / DESIGN.md §2).
 *
 * Each person gets a flat ink-bordered avatar in a distinct brand color so a
 * card reads "whose task is this?" at a glance. One blue, one red, one green —
 * the palette's "always one red moment".
 */

/** @typedef {'Alex'|'Eva'|'Franzi'} Teammate */

export const TEAMMATE_META = {
  Alex:   { initials: 'AL', color: '#0A4FFF' }, // brand-primary
  Eva:    { initials: 'EV', color: '#E8001C' }, // type-bug
  Franzi: { initials: 'FR', color: '#2A7A2A' }, // due-safe
};

/**
 * Look up a teammate's badge meta, with a graceful fallback for any name that
 * isn't one of the three (keeps the UI from crashing on legacy data).
 *
 * @param {string} name
 */
export function getTeammateMeta(name) {
  return (
    TEAMMATE_META[name] ?? {
      initials: (name ?? '?').slice(0, 2).toUpperCase(),
      color: '#888880', // text-muted
    }
  );
}

const SIZE_CLASS = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

/**
 * Sharp-edged initials badge per DESIGN.md §4 — solid teammate color, 1.5px ink
 * border, no rounding. The whole point of M7: see the owner instantly.
 *
 * @param {{ name: string, size?: 'sm'|'md'|'lg', className?: string }} props
 */
export function Avatar({ name, size = 'md', className = '' }) {
  const meta = getTeammateMeta(name);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border-[1.5px] border-text-primary font-mono font-medium uppercase tracking-wide text-surface-page ${SIZE_CLASS[size]} ${className}`}
      style={{ backgroundColor: meta.color }}
      title={name}
      aria-label={name}
    >
      {meta.initials}
    </span>
  );
}
