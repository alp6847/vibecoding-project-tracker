# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with..

Cool, confident, and culturally aware — the tracker feels like an editorial studio that moves between Tokyo and Berlin: calm but charged, with always one red moment.

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- Neo-Japanese editorial layouts: bold grotesque display type, electric blue dominance, mosaic panel rhythm
- Berlin-style graphic design: sharp edges, ink-black borders, no rounded corners, depth from overlap not shadow
- Tokyo–Berlin typographic fusion: overscaled Latin + Kanji in the same line, mono uppercase section markers

Anti-references — what we are explicitly **not** trying to look like:

- Generic AI-era purple gradients and rounded pill buttons

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#0A4FFF` | Header, "+" button, focus rings |
| `brand-accent` | `#5A8FFF` | Highlights, hover states, links |
| `surface-page` | `#F5F4F0` | Page background |
| `surface-card` | `#E8DCC8` | Card background |
| `text-primary` | `#0D0D0D` | Body text |
| `text-muted` | `#888880` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#0A4FFF` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#E8001C` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#2A7A2A` | More than 2 days out |
| `due-warning` | `#FFD166` | Less than 24 hours |
| `due-overdue` | `#E8001C` | Past due |
| `due-neutral` | `#888880` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `"Suisse Int'l Condensed", "Neue Haas Grotesk Display", system-ui, sans-serif` | Bold grotesque display type treats typography as layout itself — characters are graphic elements, not decoration. |
| Body | `"Suisse Int'l", "Apertura", system-ui, sans-serif` | Clean, neutral grotesque keeps reading comfortable at 14–16 px while staying consistent with the editorial voice. |
| Monospace (tags, badges, code) | `"IBM Plex Mono", "Monaspace", ui-monospace, monospace` | Mono uppercase tracked labels mark sections, coordinates, and metadata without competing with display type. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** Flat, sharp-edged panels with a 1.5 px ink border and no shadow; depth comes from color overlap and panel offset, never blur.
- **Buttons:** Solid fill, no gradient, sharp corners (border-radius: 0), uppercase tracked label, inverts to ink-black on hover.
- **Modal:** Centered, max-width-md, deep navy (`#001040`) backdrop at 50% opacity; panel itself uses `surface-card` with a 1.5 px ink border.
- **Empty states:** 1.5 px dashed ink border, muted text in `text-muted`, mono uppercase label — matter-of-fact, never apologetic.
- **Drag affordance (if used):** None — we use a status dropdown.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ Task` |
| Empty column placeholder | `Nothing here yet — keep going.` |
| Toast after "Copy as Prompt Context" | `Copied. Now paste it into the AI.` |
| Confirm-delete message | `Delete this task? You can't undo.` |
| Handoff toast (M7 `task-owner`) | `Handed off to {name}. They've got it.` |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** Okinawa Pop (match PRD §11 team identity)
- **Wordmark style:** The product name set in the heading font (`Suisse Int'l Condensed`), `brand-primary` electric blue (`#0A4FFF`), all-caps, no icon — typography is the identity.

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*