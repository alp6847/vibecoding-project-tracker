import { useState, useEffect } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
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

// Replace these placeholders with the three names from PRD §8 before M4.
// They become the only valid values for `Task.assignee`.
export const TEAM = ['Teammate A', 'Teammate B', 'Teammate C'];

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

/** @type {Task[]} */
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Wire four-column Kanban layout',
    description: 'Render STAGES as columns and filter tasks by status.',
    type: 'feature',
    status: 'done',
    assignee: 'Teammate A',
    dueDate: '2026-06-03',
    createdDate: '2026-06-01',
  },
  {
    id: 'task-2',
    title: 'Modal focus trap breaks on mobile',
    description: 'Tab cycling escapes the dialog on narrow viewports.',
    type: 'bug',
    status: 'in-progress',
    assignee: 'Teammate B',
    dueDate: '2026-06-06',
    createdDate: '2026-06-02',
  },
  {
    id: 'task-3',
    title: 'Assignee badge styling',
    description: 'Mono uppercase label with ink border per DESIGN.md.',
    type: 'feature',
    status: 'review',
    assignee: 'Teammate C',
    dueDate: '2026-06-08',
    createdDate: '2026-06-03',
  },
  {
    id: 'task-4',
    title: 'Paste palette into Tailwind config',
    description: 'Brand, surface, and type tokens from DESIGN.md §2.',
    type: 'feature',
    status: 'todo',
    assignee: 'Teammate A',
    dueDate: '2026-06-10',
    createdDate: '2026-06-04',
  },
];

/**
 * @param {{ task: Task }} props
 */
function TaskCard({ task }) {
  return (
    <article className="border-[1.5px] border-text-primary bg-surface-card p-3">
      <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
      <p className="mt-2 font-mono text-xs uppercase tracking-wide text-text-muted">
        {task.assignee}
      </p>
    </article>
  );
}

/**
 * @param {{ stage: typeof STAGES[number], tasks: Task[] }} props
 */
function KanbanColumn({ stage, tasks }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h2 className="mb-3 font-heading text-base font-semibold uppercase tracking-wide text-text-primary">
        {stage.label}
      </h2>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border-[1.5px] border-dashed border-text-primary p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
              Nothing here yet — keep going.
            </p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  // TODO M5 crud-modal:
  //   const [editing, setEditing] = useState(null);
  //
  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-brand-primary">
            Okinawa Pop
          </h1>
          <p className="mt-1 text-sm text-text-muted">Project tracker</p>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}

      {/*
        TODO M5 crud-modal:
          Add a "+" button that opens a modal with every Task field.
          Clicking a card should open the same modal in edit mode.
      */}
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((task) => task.status === stage.id)}
          />
        ))}
      </main>
    </div>
  );
}
