import { useState, useEffect } from 'react';
import { getTaskTypeMeta } from './taskType';
import { TaskTypeAccent, TaskTypeLabel } from './TaskTypeAccent';
import { DueDateTag } from './DueDateTag';
import { Avatar } from './Teammate';
import { ContextSection } from './ContextSection';
import { CONTEXT_TEMPLATE } from './context';
import { buildPromptContext } from './promptContext';
import { copyText } from './clipboard';

/**
 * Vibecoding Project Tracker — Okinawa Pop.
 *
 * M4 data-model : four columns + task cards (done).
 * M5 crud-modal : "+" add modal, click-to-edit modal, delete, status dropdown,
 *                 everything persisted to localStorage. (done)
 * M6 tag-style  : per-type accent colour + corner icon, applied on the board,
 *                 in the modal, and on every type label. (done)
 * M7 task-owner : prominent assignee avatar on every card, a "Hand off to…"
 *                 dropdown that reassigns, a toast that acknowledges the handoff,
 *                 and a top strip showing who's driving what. (done)
 * M8 due-tint   : a CSS-only due-date tag whose color is derived live from the
 *                 task's existing dueDate + status — safe / warning / overdue,
 *                 and neutral once done (overrides the date). (done)
 * M9 context    : a curated Markdown Context briefing on the task modal — a
 *                 textarea with a live preview pane, an optional "AI tool"
 *                 dropdown (contextTool), an auto-stamped contextUpdatedAt with
 *                 a "last updated …" hint, and a placeholder template on new
 *                 tasks. (done — context.js / markdown.js / ContextSection)
 * M10 copy-prompt: a "Copy Context" button on every card and in the modal that
 *                 serializes title + description + Context into a clean Markdown
 *                 briefing (promptContext.js), copies it to the clipboard
 *                 (clipboard.js), and fires a success toast. (this file)
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 * @property {string} context          M9 — curated Markdown briefing
 * @property {string|null} contextTool M9 — 'Claude' | 'ChatGPT' | … | 'Other'
 * @property {string|null} contextUpdatedAt M9 — ISO timestamp, auto-set on edit
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// The three teammates from PRD §8 — the only valid values for `Task.assignee`.
export const TEAM = ['Alex', 'Eva', 'Franzi'];

// The two task types from PRD §5 / DESIGN.md §2.
export const TYPES = ['feature', 'bug'];

// M11 anchors — the four pinned final-project deliverables (PRD §3 / §5).
// Use these IDs everywhere — do not invent new ones.
export const ANCHORS = [
  { id: 'presentation',  label: 'Presentation' },
  { id: 'demo',          label: 'Demo' },
  { id: 'report',        label: 'Report' },
  { id: 'documentation', label: 'Documentation' },
];

// The empty anchor map: { presentation: '', demo: '', … } — every slot starts
// linkless so the status dots all read "empty" until the team drops a URL in.
const EMPTY_ANCHOR_LINKS = Object.fromEntries(
  ANCHORS.map((anchor) => [anchor.id, '']),
);

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

/** Today as an ISO 'YYYY-MM-DD' string. */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** A fresh, empty task draft used to pre-fill the "add" modal. */
function emptyDraft() {
  return {
    id: null,
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: '',
    createdDate: todayISO(),
    context: CONTEXT_TEMPLATE,
    contextTool: null,
    contextUpdatedAt: null,
  };
}

/** @type {Task[]} */
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Wire four-column Kanban layout',
    description: 'Render STAGES as columns and filter tasks by status.',
    type: 'feature',
    status: 'done',
    assignee: 'Alex',
    dueDate: '2026-06-03',
    createdDate: '2026-06-01',
    context: `## Background
The board is the spine of the tracker — everything else hangs off **STAGES**.

## Constraints
- Desktop only (PRD §12).
- No drag-and-drop; status is a \`<select>\` in the modal.

## Tried so far
Filtered \`tasks\` by \`status\` per column. Empty columns show the
\`Nothing here yet — keep going.\` placeholder.

## Pick up
Layout is shipped. Next milestone wires the [CRUD modal](https://example.com).`,
    contextTool: 'Cursor',
    contextUpdatedAt: '2026-06-03T09:12:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Modal focus trap breaks on mobile',
    description: 'Tab cycling escapes the dialog on narrow viewports.',
    type: 'bug',
    status: 'in-progress',
    assignee: 'Eva',
    dueDate: '2026-06-06',
    createdDate: '2026-06-02',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 'task-3',
    title: 'Assignee badge styling',
    description: 'Mono uppercase label with ink border per DESIGN.md.',
    type: 'feature',
    status: 'review',
    assignee: 'Franzi',
    dueDate: '2026-06-08',
    createdDate: '2026-06-03',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 'task-4',
    title: 'Paste palette into Tailwind config',
    description: 'Brand, surface, and type tokens from DESIGN.md §2.',
    type: 'feature',
    status: 'todo',
    assignee: 'Alex',
    dueDate: '2026-06-10',
    createdDate: '2026-06-04',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
];

/**
 * Sharp-edged, mono-uppercase button per DESIGN.md §4 — inverts to ink on hover.
 *
 * @param {{ variant?: 'primary'|'secondary'|'danger' } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'label-mark inline-flex items-center justify-center border-[1.5px] px-4 py-2 text-xs font-medium transition-all duration-150 ease-out active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40';
  const variants = {
    primary:
      'border-brand-primary bg-brand-primary text-surface-page hover:border-text-primary hover:bg-text-primary',
    secondary:
      'border-text-primary bg-transparent text-text-primary hover:bg-text-primary hover:text-surface-page',
    danger:
      'border-type-bug bg-transparent text-type-bug hover:bg-type-bug hover:text-surface-page',
  };
  return (
    <button
      type="button"
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    />
  );
}

/**
 * "Hand off to…" — a compact reassignment dropdown. Lists only the teammates
 * who don't already own the task; picking one fires `onReassign` and the select
 * snaps back to its placeholder so it always reads as an action, never a state.
 *
 * @param {{ task: Task, onReassign: (task: Task, name: string) => void }} props
 */
function HandoffMenu({ task, onReassign }) {
  return (
    <label className="shrink-0">
      <span className="sr-only">Hand off {task.title} to a teammate</span>
      <select
        value=""
        onChange={(e) => {
          const name = e.target.value;
          if (name) onReassign(task, name);
          e.target.value = '';
        }}
        className="cursor-pointer border-[1.5px] border-text-primary bg-surface-page px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-text-primary transition-colors hover:bg-text-primary hover:text-surface-page focus:border-brand-primary focus:outline-none"
      >
        <option value="">Hand off to…</option>
        {TEAM.filter((name) => name !== task.assignee).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * "Copy Context" — serializes the task to a Markdown briefing and copies it to
 * the clipboard (M10). Used both on the board card (compact) and in the modal.
 * Stops propagation so a click on a card never also opens the edit modal.
 *
 * @param {{ task: Task, onCopy: (task: Task) => void, className?: string }} props
 */
function CopyContextButton({ task, onCopy, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCopy(task);
      }}
      title="Copy a Markdown briefing for this task"
      className={`inline-flex shrink-0 items-center border-[1.5px] border-text-primary bg-surface-page px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-text-primary transition-colors hover:bg-text-primary hover:text-surface-page focus:border-brand-primary focus:outline-none ${className}`}
    >
      Copy Context
    </button>
  );
}

/**
 * A board card. The type accent (left stripe + corner icon) and the mono type
 * label both come from the shared `type-feature` / `type-bug` scheme so a card
 * reads the same here as it does in the modal.
 *
 * The card body opens the edit modal; the footer carries the owner avatar
 * (M7 — see whose task it is at a glance) and the "Hand off to…" dropdown.
 * The footer is kept out of the click-to-open region so the dropdown is its own
 * action and we avoid nesting interactive controls inside a button.
 *
 * @param {{ task: Task, onOpen: (task: Task) => void, onReassign: (task: Task, name: string) => void, onCopyContext: (task: Task) => void }} props
 */
function TaskCard({ task, onOpen, onReassign, onCopyContext }) {
  return (
    <TaskTypeAccent
      type={task.type}
      className="group hover-lift p-4 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-brand-primary hover:shadow-offset-sm"
    >
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="block w-full text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <TaskTypeLabel type={task.type} />
          <DueDateTag task={task} />
        </div>
        <h3 className="mt-3 font-heading text-base font-semibold leading-snug tracking-tight text-text-primary transition-colors duration-150 group-hover:text-brand-primary">
          {task.title}
        </h3>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-text-muted/40 pt-3">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={task.assignee} size="sm" />
          <span className="label-mark truncate text-[11px] text-text-muted">
            {task.assignee}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <CopyContextButton task={task} onCopy={onCopyContext} />
          <HandoffMenu task={task} onReassign={onReassign} />
        </span>
      </div>
    </TaskTypeAccent>
  );
}

/**
 * @param {{ stage: typeof STAGES[number], index: number, tasks: Task[], onOpen: (task: Task) => void, onReassign: (task: Task, name: string) => void, onCopyContext: (task: Task) => void }} props
 */
function KanbanColumn({ stage, index, tasks, onOpen, onReassign, onCopyContext }) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <section
      className="flex min-w-0 flex-1 flex-col animate-reveal-up"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="mb-4 border-b-[1.5px] border-text-primary pb-2">
        <span className="label-mark text-[10px] text-brand-primary">{num}</span>
        <h2 className="mt-1 flex items-baseline justify-between gap-2 font-display text-2xl font-medium uppercase tracking-tight text-text-primary">
          <span>{stage.label}</span>
          <span className="label-mark text-xs font-normal text-text-muted">
            {String(tasks.length).padStart(2, '0')}
          </span>
        </h2>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border-[1.5px] border-dashed border-text-muted p-6">
            <p className="label-mark text-center text-[11px] text-text-muted">
              Nothing here yet —<br />keep going.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpen}
              onReassign={onReassign}
              onCopyContext={onCopyContext}
            />
          ))
        )}
      </div>
    </section>
  );
}

/** Shared field styling — sharp ink-bordered inputs per DESIGN.md §4. */
const FIELD_CLASS =
  'mt-1 w-full border-[1.5px] border-text-primary bg-surface-page px-3 py-2 text-sm text-text-primary transition-colors focus:border-brand-primary focus:outline-none';
const LABEL_CLASS = 'label-mark text-[11px] text-text-muted';

/**
 * Create/edit task modal. The panel reuses the same type color scheme as the
 * board (left accent stripe + corner icon via TaskTypeAccent, mono label via
 * TaskTypeLabel) and the accent updates live as you switch the type select.
 *
 * @param {{
 *   task: Task | null,
 *   onClose: () => void,
 *   onSave: (task: Task) => void,
 *   onDelete: (id: string) => void,
 *   onCopyContext: (task: Task) => void,
 * }} props
 */
function TaskModal({ task, onClose, onSave, onDelete, onCopyContext }) {
  const [form, setForm] = useState(task);

  useEffect(() => setForm(task), [task]);

  useEffect(() => {
    if (!task) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, onClose]);

  if (!task || !form) return null;

  const meta = getTaskTypeMeta(form.type);
  const isExisting = Boolean(task.id);
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Editing the Context field auto-stamps `contextUpdatedAt` so the "last
  // updated …" hint stays honest and the freshness survives the next save.
  const updateContext = (context) =>
    update({ context, contextUpdatedAt: new Date().toISOString() });
  const updateContextTool = (contextTool) => update({ contextTool });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, dueDate: form.dueDate || null });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scrim-in sm:p-6"
      style={{ backgroundColor: 'rgba(0, 16, 64, 0.55)' }}
      onClick={onClose}
    >
      <TaskTypeAccent
        type={form.type}
        className="max-h-[90vh] w-full max-w-2xl animate-scale-in overflow-y-auto p-6 shadow-offset"
      >
        <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-text-primary pb-3">
            <div className="flex items-center gap-3">
              <TaskTypeLabel type={form.type} />
              <span className="label-mark text-[10px] text-text-muted">
                {isExisting ? `Rec · ${task.id}` : 'Rec · New'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="label-mark text-[11px] text-text-muted transition-colors hover:text-accent-red"
            >
              Close ✕
            </button>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="label-mark text-[11px] text-brand-primary">§</span>
            <h2 className={`font-heading text-3xl font-bold uppercase tracking-tight ${meta.textClass}`}>
              {isExisting ? 'Edit task' : 'New task'}
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={LABEL_CLASS}>Title</span>
              <input
                className={FIELD_CLASS}
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="What needs doing?"
                autoFocus
              />
            </label>

            <label className="block">
              <span className={LABEL_CLASS}>Description</span>
              <textarea
                className={FIELD_CLASS}
                rows={3}
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={LABEL_CLASS}>Type</span>
                <select
                  className={FIELD_CLASS}
                  value={form.type}
                  onChange={(e) => update({ type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {getTaskTypeMeta(t).label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={LABEL_CLASS}>Status</span>
                <select
                  className={FIELD_CLASS}
                  value={form.status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={LABEL_CLASS}>Assignee</span>
                <span className="mt-1 flex items-center gap-2">
                  <Avatar name={form.assignee} size="sm" />
                  <select
                    className={`${FIELD_CLASS} mt-0`}
                    value={form.assignee}
                    onChange={(e) => update({ assignee: e.target.value })}
                  >
                    {TEAM.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <label className="block">
                <span className="flex items-center justify-between gap-2">
                  <span className={LABEL_CLASS}>Due</span>
                  <DueDateTag task={form} />
                </span>
                <input
                  type="date"
                  className={FIELD_CLASS}
                  value={form.dueDate ?? ''}
                  onChange={(e) => update({ dueDate: e.target.value })}
                />
              </label>
            </div>

            <ContextSection
              context={form.context}
              contextTool={form.contextTool ?? null}
              contextUpdatedAt={form.contextUpdatedAt ?? null}
              onContextChange={updateContext}
              onToolChange={updateContextTool}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t-[1.5px] border-text-primary pt-4">
            {isExisting ? (
              <Button variant="danger" onClick={() => onDelete(task.id)}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => onCopyContext(form)}>
                Copy Context
              </Button>
              <Button variant="primary" type="submit">
                {isExisting ? 'Save' : 'Add task'}
              </Button>
            </div>
          </div>
        </form>
      </TaskTypeAccent>
    </div>
  );
}

/**
 * A single deliverable slot in the Anchor Board (M11). One URL field plus a
 * status dot: a hollow ink ring while empty, a solid brand-primary fill the
 * moment a link is present. The dot is derived live from the URL, so it flips
 * as you type and stays correct across reloads.
 *
 * @param {{ anchor: typeof ANCHORS[number], url: string, onChange: (id: string, url: string) => void }} props
 */
function AnchorCard({ anchor, url, onChange }) {
  const filled = url.trim().length > 0;
  const inputId = `anchor-${anchor.id}`;

  return (
    <div className="hover-lift flex min-w-0 flex-col gap-3 border-[1.5px] border-text-primary bg-surface-card p-4 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-brand-primary">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="label-mark text-[11px] font-medium text-text-primary"
        >
          {anchor.label}
        </label>
        <span
          aria-hidden="true"
          title={filled ? 'Link added' : 'No link yet'}
          className={`h-3 w-3 shrink-0 border-[1.5px] border-text-primary transition-colors ${
            filled ? 'bg-brand-primary' : 'bg-transparent'
          }`}
        />
        <span className="sr-only">
          {filled ? `${anchor.label} link added` : `${anchor.label} has no link yet`}
        </span>
      </div>

      <input
        id={inputId}
        type="url"
        inputMode="url"
        placeholder="Paste a link…"
        value={url}
        onChange={(e) => onChange(anchor.id, e.target.value)}
        className="w-full border-[1.5px] border-text-primary bg-surface-page px-3 py-2 font-mono text-xs text-text-primary transition-colors placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
      />

      {filled ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="label-mark truncate text-[10px] text-brand-primary transition-colors hover:text-text-primary"
        >
          Open ↗
        </a>
      ) : (
        <span className="label-mark text-[10px] text-text-muted">Empty</span>
      )}
    </div>
  );
}

/**
 * The Anchor Board (M11) — a pinned top banner that homes the four final-project
 * deliverables (PRD §3). Always visible above the Kanban board; each slot saves
 * its URL to localStorage so links survive a reload.
 *
 * @param {{ links: Record<string, string>, onChange: (id: string, url: string) => void }} props
 */
function AnchorBoard({ links, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ANCHORS.map((anchor, i) => (
        <div
          key={anchor.id}
          className="animate-reveal-up"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <AnchorCard
            anchor={anchor}
            url={links[anchor.id] ?? ''}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Top strip: who is currently driving what. "Driving" = the teammate's
 * In Progress tasks. Gives the team a one-glance answer to "who's on what right
 * now?" and updates live as tasks are handed off or moved across columns.
 *
 * @param {{ tasks: Task[] }} props
 */
function DriverStrip({ tasks }) {
  return (
    <div className="grid grid-cols-1 border-[1.5px] border-text-primary bg-surface-card divide-y-[1.5px] divide-text-primary md:grid-cols-3 md:divide-x-[1.5px] md:divide-y-0">
      {TEAM.map((name) => {
        const driving = tasks.filter(
          (t) => t.assignee === name && t.status === 'in-progress',
        );
        const primary = driving[0];
        const extra = driving.length - 1;

        return (
          <div key={name} className="flex items-center gap-4 p-5">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <p className="label-mark text-[11px] font-medium text-text-primary">
                {name}
              </p>
              {primary ? (
                <p className="mt-0.5 truncate text-sm text-text-secondary">
                  {primary.title}
                  {extra > 0 ? (
                    <span className="label-mark text-[10px] text-brand-primary"> +{extra} more</span>
                  ) : null}
                </p>
              ) : (
                <p className="label-mark mt-0.5 text-[10px] text-text-muted">
                  Not driving anything
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Handoff acknowledgment toast — DESIGN.md §5 microcopy, §7 "200 ms fade".
 * Fades in on mount, fades out after a beat, then calls `onDone` to unmount.
 *
 * @param {{ message: string, onDone: () => void }} props
 */
function Toast({ message, onDone }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setShown(true));
    const hide = setTimeout(() => setShown(false), 2400);
    const done = setTimeout(onDone, 2600);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(hide);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div
        role="status"
        aria-live="polite"
        className={`label-mark flex items-center gap-2 border-[1.5px] border-text-primary bg-text-primary px-4 py-2.5 text-xs text-surface-page shadow-offset-sm transition-all duration-200 ease-out ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span aria-hidden="true" className="h-2 w-2 bg-accent-red" />
        {message}
      </div>
    </div>
  );
}

/**
 * Numbered editorial section marker — mono index, condensed-grotesque title, an
 * optional bilingual JP echo, and a hairline rule that runs to the page edge.
 * Typography *is* the layout: this is the recurring structural device.
 *
 * @param {{ index: string, title: string, jp?: string, action?: import('react').ReactNode }} props
 */
function SectionLabel({ index, title, jp, action }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-end gap-4">
        <span className="label-mark shrink-0 text-[11px] text-brand-primary">§{index}</span>
        <h2 className="flex items-baseline gap-3 font-display text-3xl font-medium uppercase leading-none tracking-tight text-text-primary sm:text-4xl">
          {title}
          {jp ? (
            <span className="font-jp text-lg font-medium tracking-normal text-text-muted">
              {jp}
            </span>
          ) : null}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Concentric-ring motif (DESIGN §7) — quiet background texture behind the
 * masthead. Pure SVG, no blur, never competes with the type.
 */
function ConcentricRings({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {[40, 80, 120, 160, 196].map((r) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/**
 * The editorial spine — a thin navy utility bar that runs the full width above
 * the masthead. Inverse mono metadata: wordmark ©, a Tokyo–Berlin axis, and a
 * live task count. The single place deep navy appears in the chrome.
 *
 * @param {{ count: number }} props
 */
function UtilitySpine({ count }) {
  return (
    <div className="w-full border-b-[1.5px] border-text-primary bg-surface-navy text-text-inverse">
      <div className="mx-auto flex max-w-editorial items-center justify-between gap-4 px-6 py-2 md:px-10 xl:px-16">
        <span className="label-mark text-[10px] text-text-inverse/80">
          Okinawa Pop © 2026
        </span>
        <span className="label-mark hidden text-[10px] text-brand-accent sm:inline">
          Tokyo — Berlin
        </span>
        <span className="label-mark text-[10px] text-text-inverse/80">
          Tasks · {String(count).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/**
 * The masthead — overscaled wordmark on the off-white canvas with a single
 * Japan-Red punctuation dot, a bilingual JP echo, the tagline, and the primary
 * "+ Task" action. Full-bleed type; the layout breathes around it.
 *
 * @param {{ onAdd: () => void, stats: { total: number, active: number, done: number } }} props
 */
function Masthead({ onAdd, stats }) {
  return (
    <header className="relative overflow-hidden border-b-[1.5px] border-text-primary">
      <ConcentricRings className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-brand-accent/25 sm:-right-8" />

      <div className="relative mx-auto max-w-editorial px-6 py-12 md:px-10 md:py-16 xl:px-16">
        <div className="flex items-center justify-between gap-4">
          <span className="label-mark text-[11px] text-text-muted">
            Vibecoding Project Tracker
          </span>
          <span className="label-mark hidden text-[11px] text-text-muted md:inline">
            23–07–A / Active
          </span>
        </div>

        <div className="mt-6 animate-reveal-left">
          <h1 className="font-heading text-hero font-black uppercase text-text-primary">
            Okinawa
            <span className="text-brand-primary">
              {' '}Pop
              <span className="text-accent-red">.</span>
            </span>
          </h1>
          <p className="mt-2 font-jp text-2xl font-medium text-text-secondary sm:text-3xl">
            沖縄ポップ
            <span className="label-mark ml-3 align-middle text-xs text-text-muted">
              Editorial Studio
            </span>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 animate-reveal-up">
          <p className="max-w-md text-base leading-relaxed text-text-secondary">
            Track every vibecoding task and the prompt context that produced it —
            calm but charged, with always one red moment.
          </p>

          <div className="flex items-center gap-6">
            <dl className="hidden items-center gap-6 sm:flex">
              {[
                { k: 'Total', v: stats.total },
                { k: 'Active', v: stats.active },
                { k: 'Done', v: stats.done },
              ].map((s) => (
                <div key={s.k} className="text-right">
                  <dd className="font-display text-3xl font-semibold leading-none tracking-tight text-text-primary">
                    {String(s.v).padStart(2, '0')}
                  </dd>
                  <dt className="label-mark mt-1 text-[10px] text-text-muted">{s.k}</dt>
                </div>
              ))}
            </dl>
            <Button variant="primary" onClick={onAdd} className="px-6 py-3 text-sm">
              + Task
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Editorial footer — a barcode-style rule, the manifesto line, and a quiet
 * coordinate stamp. Closes the page like the back of a zine.
 */
function Footer() {
  return (
    <footer className="mt-24 border-t-[1.5px] border-text-primary bg-surface-navy text-text-inverse">
      <div className="mx-auto flex max-w-editorial flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10 xl:px-16">
        <div>
          <p className="font-display text-2xl font-medium uppercase tracking-tight">
            Typography is structure
            <span className="text-accent-red">.</span>
          </p>
          <p className="label-mark mt-2 text-[10px] text-text-inverse/60">
            Okinawa Pop · Neo-Japanese Editorial · v2
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-10 items-end gap-[3px]"
          title="barcode"
        >
          {[3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1].map((w, i) => (
            <span
              key={i}
              className="h-full bg-text-inverse/80"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  // M11 anchors — the four deliverable links, keyed by anchor id. Persisted on
  // its own key so the Anchor Board survives a reload independently of tasks.
  const [anchorLinks, setAnchorLinks] = useLocalStorage(
    'vibetracker.anchors',
    EMPTY_ANCHOR_LINKS,
  );

  const setAnchorLink = (id, url) =>
    setAnchorLinks((prev) => ({ ...prev, [id]: url }));

  // `draft` is the task currently open in the modal:
  //   null            → modal closed
  //   { id: null,… }   → creating a new task
  //   { id: 'task-x' } → editing an existing task
  const [draft, setDraft] = useState(null);

  // The current handoff acknowledgment, or null. `id` re-mounts <Toast/> so a
  // back-to-back handoff restarts the fade instead of being swallowed.
  const [toast, setToast] = useState(null);

  const openNew = () => setDraft(emptyDraft());
  const openEdit = (task) => setDraft(task);
  const closeModal = () => setDraft(null);

  const copyTaskContext = async (task) => {
    const ok = await copyText(buildPromptContext(task));
    setToast({
      id: Date.now(),
      message: ok
        ? 'Copied. Now paste it into the AI.'
        : "Couldn't copy — select the Context field manually.",
    });
  };

  const reassignTask = (task, name) => {
    if (name === task.assignee) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, assignee: name } : t)),
    );
    setToast({ id: Date.now(), message: `Handed off to ${name}. They've got it.` });
  };

  const saveTask = (task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      const created = { ...task, id: `task-${Date.now()}` };
      return [...prev, created];
    });
    closeModal();
  };

  const deleteTask = (id) => {
    if (!window.confirm("Delete this task? You can't undo.")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    closeModal();
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => t.status !== 'done').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <UtilitySpine count={stats.total} />
      <Masthead onAdd={openNew} stats={stats} />

      <div className="mx-auto max-w-editorial px-6 md:px-10 xl:px-16">
        <section className="sticky-band -mx-6 mb-16 border-b-[1.5px] border-text-primary bg-surface-page px-6 pb-6 pt-6 md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
          <SectionLabel
            index="01"
            title="Final Deliverables"
            jp="成果物"
            action={
              <span className="label-mark hidden text-[10px] text-text-muted sm:inline">
                Pinned
              </span>
            }
          />
          <AnchorBoard links={anchorLinks} onChange={setAnchorLink} />
        </section>

        <section className="mb-16">
          <SectionLabel index="02" title="Who's Driving" jp="担当" />
          <DriverStrip tasks={tasks} />
        </section>

        <section>
          <SectionLabel
            index="03"
            title="The Board"
            jp="進行"
            action={
              <Button variant="secondary" onClick={openNew} className="hidden sm:inline-flex">
                + Task
              </Button>
            }
          />
          <main className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage, index) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                index={index}
                tasks={tasks.filter((task) => task.status === stage.id)}
                onOpen={openEdit}
                onReassign={reassignTask}
                onCopyContext={copyTaskContext}
              />
            ))}
          </main>
        </section>
      </div>

      <Footer />

      <TaskModal
        task={draft}
        onClose={closeModal}
        onSave={saveTask}
        onDelete={deleteTask}
        onCopyContext={copyTaskContext}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
