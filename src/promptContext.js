/**
 * M10 copy-prompt — serialize a task into a clean Markdown briefing that reads
 * naturally when pasted straight into Claude / ChatGPT / Cursor. This is the
 * demo's hero moment (PRD §4 step 4): one click turns a card into paste-ready
 * prompt context.
 *
 * Deliberately scoped to just three things — title, description, and the full
 * Context field. No owner / date / target-tool metadata: those are board
 * concerns, not part of the briefing the AI needs.
 *
 * Shape:
 *
 *   # <title>
 *
 *   ## Description
 *   <description>
 *
 *   ## Context
 *   <the curated Context field, verbatim>
 *
 * Empty sections are dropped so the output never has dangling headings.
 */

/**
 * Build the Markdown prompt-context block for a task.
 *
 * @param {{
 *   title?: string,
 *   description?: string,
 *   context?: string,
 * }} task
 * @returns {string} Markdown ready for the clipboard.
 */
export function buildPromptContext(task) {
  const blocks = [];

  const title = (task.title || '').trim() || 'Untitled task';
  blocks.push(`# ${title}`);

  const description = (task.description || '').trim();
  if (description) {
    blocks.push(`## Description\n${description}`);
  }

  const context = (task.context || '').trim();
  if (context) {
    blocks.push(`## Context\n${context}`);
  }

  // One blank line between blocks — clean, standard Markdown spacing.
  return `${blocks.join('\n\n')}\n`;
}
