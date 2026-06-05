import { useState } from 'react';
import { AI_TOOLS, formatRelativeTime } from './context';
import { renderMarkdown } from './markdown';

const LABEL_CLASS = 'font-mono text-xs uppercase tracking-wide text-text-muted';
const FIELD_CLASS =
  'mt-1 w-full border-[1.5px] border-text-primary bg-surface-page px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none';

/**
 * M9 context — the curated-briefing block on the task modal.
 *
 * A Markdown textarea (left) with a live preview pane (right, bonus) so writers
 * see formatting as they type, an optional "AI tool" dropdown the briefing is
 * aimed at, and a small "last updated …" freshness hint. The parent owns the
 * data and the timestamp: every keystroke calls `onContextChange`, which is
 * where `contextUpdatedAt` gets stamped, so the hint reads "just now" while you
 * type and persists through reload once the task is saved.
 *
 * @param {{
 *   context: string,
 *   contextTool: string | null,
 *   contextUpdatedAt: string | null,
 *   onContextChange: (value: string) => void,
 *   onToolChange: (tool: string | null) => void,
 * }} props
 */
export function ContextSection({
  context,
  contextTool,
  contextUpdatedAt,
  onContextChange,
  onToolChange,
}) {
  const [showPreview, setShowPreview] = useState(true);

  const value = context ?? '';
  const updatedLabel = formatRelativeTime(contextUpdatedAt);
  const previewHtml = renderMarkdown(value);

  return (
    <section className="border-t-[1.5px] border-dashed border-text-primary pt-4">
      <div className="flex items-center justify-between gap-2">
        <span className={LABEL_CLASS}>Context · Markdown</span>
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className="font-mono text-[10px] uppercase tracking-wide text-text-muted underline hover:text-text-primary"
        >
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <p className="mt-1 text-xs text-text-muted">
        A paste-ready briefing for the next AI or teammate. Supports Markdown.
      </p>

      <div
        className={`mt-2 grid gap-3 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}
      >
        <label className="block">
          <span className="sr-only">Context (Markdown)</span>
          <textarea
            className={`${FIELD_CLASS} min-h-[200px] resize-y font-mono text-[13px] leading-relaxed`}
            rows={10}
            value={value}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Background / Constraints / Tried so far / Pick up"
          />
        </label>

        {showPreview ? (
          <div className="block">
            <span className="sr-only">Markdown preview</span>
            <div className="mt-1 min-h-[200px] space-y-2 overflow-y-auto border-[1.5px] border-text-primary bg-surface-page px-3 py-2 text-sm text-text-primary">
              {previewHtml ? (
                <div
                  className="space-y-2 break-words"
                  // eslint-disable-next-line react/no-danger -- renderMarkdown escapes all input first; see markdown.js
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <label className="block">
          <span className={LABEL_CLASS}>AI tool (optional)</span>
          <select
            className={`${FIELD_CLASS} w-auto min-w-[10rem]`}
            value={contextTool ?? ''}
            onChange={(e) => onToolChange(e.target.value || null)}
          >
            <option value="">None</option>
            {AI_TOOLS.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </label>

        <span className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
          {updatedLabel ? `Last updated ${updatedLabel}` : 'Not saved yet'}
        </span>
      </div>
    </section>
  );
}
