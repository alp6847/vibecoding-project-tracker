import { useState, useEffect } from 'react';
import { getTaskTypeMeta } from './taskType';
import { TaskTypeAccent, TaskTypeLabel } from './TaskTypeAccent';
import { DueDateTag } from './DueDateTag';
import { Avatar } from './Teammate';
import { ContextSection } from './ContextSection';
import { CONTEXT_TEMPLATE } from './context';

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
 *                 tasks. (this file + context.js / markdown.js / ContextSection)
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
    'inline-flex items-center justify-center border-[1.5px] px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors';
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
 * A board card. The type accent (left stripe + corner icon) and the mono type
 * label both come from the shared `type-feature` / `type-bug` scheme so a card
 * reads the same here as it does in the modal.
 *
 * The card body opens the edit modal; the footer carries the owner avatar
 * (M7 — see whose task it is at a glance) and the "Hand off to…" dropdown.
 * The footer is kept out of the click-to-open region so the dropdown is its own
 * action and we avoid nesting interactive controls inside a button.
 *
 * @param {{ task: Task, onOpen: (task: Task) => void, onReassign: (task: Task, name: string) => void }} props
 */
function TaskCard({ task, onOpen, onReassign }) {
  return (
    <TaskTypeAccent type={task.type} className="p-3">
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="block w-full text-left transition-opacity hover:opacity-70"
      >
        <TaskTypeLabel type={task.type} />
        <h3 className="mt-2 text-sm font-medium text-text-primary">{task.title}</h3>
        <DueDateTag task={task} className="mt-2" />
      </button>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={task.assignee} size="sm" />
          <span className="truncate font-mono text-xs uppercase tracking-wide text-text-muted">
            {task.assignee}
          </span>
        </span>
        <HandoffMenu task={task} onReassign={onReassign} />
      </div>
    </TaskTypeAccent>
  );
}

/**
 * @param {{ stage: typeof STAGES[number], tasks: Task[], onOpen: (task: Task) => void, onReassign: (task: Task, name: string) => void }} props
 */
function KanbanColumn({ stage, tasks, onOpen, onReassign }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h2 className="mb-3 flex items-center justify-between font-heading text-base font-semibold uppercase tracking-wide text-text-primary">
        <span>{stage.label}</span>
        <span className="font-mono text-xs text-text-muted">{tasks.length}</span>
      </h2>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border-[1.5px] border-dashed border-text-primary p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
              Nothing here yet — keep going.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpen}
              onReassign={onReassign}
            />
          ))
        )}
      </div>
    </section>
  );
}

/** Shared field styling — sharp ink-bordered inputs per DESIGN.md §4. */
const FIELD_CLASS =
  'mt-1 w-full border-[1.5px] border-text-primary bg-surface-page px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none';
const LABEL_CLASS =
  'font-mono text-xs uppercase tracking-wide text-text-muted';

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
 * }} props
 */
function TaskModal({ task, onClose, onSave, onDelete }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0, 16, 64, 0.5)' }}
      onClick={onClose}
    >
      <TaskTypeAccent type={form.type} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5">
        <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-3">
            <TaskTypeLabel type={form.type} />
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-wide text-text-muted hover:text-text-primary"
            >
              Close
            </button>
          </div>

          <h2 className={`mt-3 font-heading text-xl font-semibold ${meta.textClass}`}>
            {isExisting ? 'Edit task' : 'New task'}
          </h2>

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

          <div className="mt-6 flex items-center justify-between gap-3">
            {isExisting ? (
              <Button variant="danger" onClick={() => onDelete(task.id)}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button variant="primary" type="submit">
              {isExisting ? 'Save' : 'Add task'}
            </Button>
          </div>
        </form>
      </TaskTypeAccent>
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
    <section className="mb-8 border-[1.5px] border-text-primary bg-surface-card">
      <h2 className="border-b-[1.5px] border-text-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-text-muted">
        Who's driving what
      </h2>
      <div className="grid grid-cols-1 divide-y-[1.5px] divide-text-primary md:grid-cols-3 md:divide-x-[1.5px] md:divide-y-0">
        {TEAM.map((name) => {
          const driving = tasks.filter(
            (t) => t.assignee === name && t.status === 'in-progress',
          );
          const primary = driving[0];
          const extra = driving.length - 1;

          return (
            <div key={name} className="flex items-center gap-3 p-4">
              <Avatar name={name} size="lg" />
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium uppercase tracking-wide text-text-primary">
                  {name}
                </p>
                {primary ? (
                  <p className="truncate text-sm text-text-muted">
                    {primary.title}
                    {extra > 0 ? (
                      <span className="font-mono text-xs"> +{extra} more</span>
                    ) : null}
                  </p>
                ) : (
                  <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
                    Not driving anything
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
        className={`border-[1.5px] border-text-primary bg-text-primary px-4 py-2 font-mono text-xs uppercase tracking-wide text-surface-page transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

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

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-brand-primary">
            Okinawa Pop
          </h1>
          <p className="mt-1 text-sm text-text-muted">Project tracker</p>
        </div>
        <Button variant="primary" onClick={openNew}>
          + Task
        </Button>
      </header>

      {/* TODO M11 anchors: render the Anchor Board above the board. */}

      <DriverStrip tasks={tasks} />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((task) => task.status === stage.id)}
            onOpen={openEdit}
            onReassign={reassignTask}
          />
        ))}
      </main>

      <TaskModal
        task={draft}
        onClose={closeModal}
        onSave={saveTask}
        onDelete={deleteTask}
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
