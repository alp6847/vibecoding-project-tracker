import { writeFileSync } from 'node:fs';
const DBG = 'http://localhost:9222';
const APP = 'http://localhost:5173/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const l = await (await fetch(`${DBG}/json`)).json();
      const p = l.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch {}
    await sleep(250);
  }
  throw new Error('no target');
}
const t = await target();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pend.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: APP });
await sleep(1800);

// scroll to the bottom so we pass the whole board
await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
await sleep(500);

const info = await send('Runtime.evaluate', { returnByValue: true, expression: `(() => {
  const sec = document.querySelector('.sticky-band');
  const cs = getComputedStyle(sec);
  const r = sec.getBoundingClientRect();
  return JSON.stringify({ position: cs.position, top: cs.top, rectTop: Math.round(r.top), scrollY: Math.round(window.scrollY), docH: document.body.scrollHeight });
})()` });
console.log('STICKY:', info.result.value);

const { data } = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('/tmp/op-sticky2.png', Buffer.from(data, 'base64'));
console.log('saved /tmp/op-sticky2.png');
ws.close();
