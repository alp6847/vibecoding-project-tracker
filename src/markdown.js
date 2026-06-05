/**
 * M9 context — a tiny, dependency-free Markdown → HTML renderer for the live
 * preview pane next to the Context textarea. Deliberately small: it covers the
 * subset writers actually use in a briefing (headings, bold/italic, inline code
 * and fenced blocks, links, blockquotes, ordered/unordered lists, paragraphs).
 *
 * Security: the raw source is HTML-escaped *before* any Markdown is applied, so
 * the only tags in the output are the ones we emit here. That makes the result
 * safe to drop in via `dangerouslySetInnerHTML` for this local-only tool.
 */

/** Escape the four characters that could break out of our generated HTML. */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CODE_CLASS =
  'rounded-none border border-text-primary bg-surface-page px-1 py-0.5 font-mono text-[12px]';
const LINK_CLASS = 'text-brand-primary underline hover:text-brand-accent';

/**
 * Inline spans within a single block of already-escaped text. Inline code is
 * pulled out first so its contents aren't re-formatted as bold/italic/links.
 */
function renderInline(text) {
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });

  t = t
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      `<a href="$2" target="_blank" rel="noreferrer" class="${LINK_CLASS}">$1</a>`,
    );

  return t.replace(
    /\u0000(\d+)\u0000/g,
    (_, i) => `<code class="${CODE_CLASS}">${codes[Number(i)]}</code>`,
  );
}

const HEADING_SIZE = {
  1: 'text-lg',
  2: 'text-base',
  3: 'text-sm',
  4: 'text-sm',
  5: 'text-xs',
  6: 'text-xs',
};

function isBlockStart(line) {
  return (
    /^```/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  );
}

/**
 * Render a Markdown string to an HTML string.
 *
 * @param {string} src
 * @returns {string} HTML — empty string when there's nothing to show.
 */
export function renderMarkdown(src) {
  if (!src || !src.trim()) return '';

  const lines = escapeHtml(src).split('\n');
  const out = [];
  let listType = null; // 'ul' | 'ol' | null
  let i = 0;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (/^```/.test(line)) {
      closeList();
      const buf = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // skip the closing fence
      out.push(
        `<pre class="overflow-x-auto border border-text-primary bg-surface-page p-2 font-mono text-[12px] leading-relaxed"><code>${buf.join('\n')}</code></pre>`,
      );
      continue;
    }

    // Heading.
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      out.push(
        `<h${level} class="mt-3 font-heading font-semibold uppercase tracking-wide text-text-primary first:mt-0 ${HEADING_SIZE[level]}">${renderInline(heading[2])}</h${level}>`,
      );
      i += 1;
      continue;
    }

    // Blockquote (consecutive `>` lines).
    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(
        `<blockquote class="border-l-[3px] border-text-muted pl-3 italic text-text-muted">${renderInline(buf.join(' '))}</blockquote>`,
      );
      continue;
    }

    // Unordered list item.
    if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul class="list-disc space-y-1 pl-5">');
        listType = 'ul';
      }
      out.push(`<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      i += 1;
      continue;
    }

    // Ordered list item.
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol class="list-decimal space-y-1 pl-5">');
        listType = 'ol';
      }
      out.push(`<li>${renderInline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      i += 1;
      continue;
    }

    // Blank line ends any open list / paragraph.
    if (!line.trim()) {
      closeList();
      i += 1;
      continue;
    }

    // Paragraph — gather consecutive plain lines, soft-break with <br/>.
    closeList();
    const buf = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      buf.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${renderInline(buf.join('<br/>'))}</p>`);
  }

  closeList();
  return out.join('\n');
}
