import { useState, useEffect, useRef } from 'react';

/**
 * Vibecoding Project Tracker — Okinawa Pop.
 *
 * M4 data-model : four columns + task cards (done).
 * M5 crud-modal : "+" add modal, click-to-edit modal, delete, status dropdown,
 *                 everything persisted to localStorage. (this file)
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
  },
];

/**
 * A solid, sharp-edged button per DESIGN.md §4 — inverts to ink-black on hover.
 */
function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center border-[1.5px] border-text-primary px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-card disabled:opacity-40';
  const variants = {
    primary:
      'bg-brand-primary text-white hover:bg-text-primary hover:text-white',
    ghost:
      'bg-transparent text-text-primary hover:bg-text-primary hover:text-white',
    danger:
      'bg-type-bug text-white hover:bg-text-primary hover:text-white',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

/** Shared input styling — flat, sharp-edged, ink border. */
const fieldClass =
  'w-full border-[1.5px] border-text-primary bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary';

const labelClass =
  'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-text-muted';

/**
 * The add / edit modal. Renders every editable Task field, including a
 * status dropdown (no drag-and-drop). One component covers both modes:
 * `draft.id == null` → create, otherwise → edit.
 *
 * @param {{
 *   draft: Task,
 *   onSave: (task: Task) => void,
 *   onClose: () => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function TaskModal({ draft, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(draft);
  const titleRef = useRef(null);
  const isEditing = draft.id != null;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      titleRef.current?.focus();
      return;
    }
    onSave({
      ...form,
      title,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-backdrop/50 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md border-[1.5px] border-text-primary bg-surface-card"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit task' : 'New task'}
      >
        <div className="flex items-center justify-between border-b-[1.5px] border-text-primary px-5 py-3">
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-text-primary">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-lg leading-none text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className={labelClass} htmlFor="task-title">Title</label>
            <input
              id="task-title"
              ref={titleRef}
              className={fieldClass}
              value={form.title}
              onChange={set('title')}
              placeholder="What needs doing?"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className={`${fieldClass} resize-none`}
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Add detail, links, acceptance criteria…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="task-type">Type</label>
              <select id="task-type" className={fieldClass} value={form.type} onChange={set('type')}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-status">Status</label>
              <select id="task-status" className={fieldClass} value={form.status} onChange={set('status')}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-assignee">Assignee</label>
              <select id="task-assignee" className={fieldClass} value={form.assignee} onChange={set('assignee')}>
                {TEAM.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-due">Due date</label>
              <input
                id="task-due"
                type="date"
                className={fieldClass}
                value={form.dueDate ?? ''}
                onChange={set('dueDate')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t-[1.5px] border-text-primary pt-4">
            {isEditing ? (
              <Button type="button" variant="danger" onClick={() => onDelete(form.id)}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * @param {{ task: Task, onClick: () => void }} props
 */
function TaskCard({ task, onClick }) {
  const stripe = task.type === 'bug' ? 'bg-type-bug' : 'bg-type-feature';
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex cursor-pointer border-[1.5px] border-text-primary bg-surface-card transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      <span className={`w-1.5 shrink-0 ${stripe}`} aria-hidden="true" />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {task.type}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
            {task.assignee}
          </p>
          {task.dueDate && (
            <p className="font-mono text-xs text-text-muted">{task.dueDate}</p>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * @param {{ stage: typeof STAGES[number], tasks: Task[], onCardClick: (task: Task) => void }} props
 */
function KanbanColumn({ stage, tasks, onCardClick }) {
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
            <TaskCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  // `draft` is the task currently open in the modal:
  //   null            → modal closed
  //   { id: null,… }   → creating a new task
  //   { id: 'task-x' } → editing an existing task
  const [draft, setDraft] = useState(null);

  const openNew = () => setDraft(emptyDraft());
  const openEdit = (task) => setDraft(task);
  const closeModal = () => setDraft(null);

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

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((task) => task.status === stage.id)}
            onCardClick={openEdit}
          />
        ))}
      </main>

      {draft && (
        <TaskModal
          draft={draft}
          onSave={saveTask}
          onClose={closeModal}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
