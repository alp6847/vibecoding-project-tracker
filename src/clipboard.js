/**
 * M10 copy-prompt — copy text to the clipboard with a graceful fallback.
 *
 * Prefers the async Clipboard API; if it's unavailable (older browser, or a
 * non-secure context like plain http on a LAN demo) it falls back to a hidden
 * textarea + `execCommand('copy')`. Resolves to whether the copy succeeded so
 * callers can show the right toast.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
