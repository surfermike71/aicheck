# CLAUDE.md — AICHECK project context

This is the standing context for the AICHECK project. Read this file at the start of every session before doing any work. Everything here applies to every action you take, every session, no exceptions.

---

## 1. About the project

AICHECK is a free desktop app that helps non-technical users figure out whether their computer has the resources to run Anthropic's AI tools (Claude Code and Claude Cowork). It detects the user's system specs, runs them against minimum-requirement rules, and shows a clear green/yellow/red verdict with specific, actionable advice for any failures.

The audience is non-technical. Every UI string and every error message must be readable by someone who doesn't know what RAM is. The app must never feel intimidating.

The developer building this app (the user you're working with) is a beginner. They are learning by doing. They will ask you to explain things in plain English. Always do so without condescension.

---

## 2. Standing operating rules

These five rules apply to every action you take, every session, no exceptions. If a request conflicts with one of these rules, stop and discuss it with the user before proceeding.

### Rule 1 — Plain-English communication

Always explain what you're about to do in non-technical language before doing it. When a technical term is unavoidable, define it briefly in parentheses the first time it appears in a session. After completing any step, give a one-paragraph plain-English summary of what was done and what it means in practice.

### Rule 2 — Approval before action

Always ask for approval before any of these actions:

- Creating, modifying, or deleting a file
- Installing or removing a package
- Running a terminal command
- Changing project configuration

Describe what you're about to do, explain why it's needed, and wait for the user to say "yes," "go ahead," or similar before proceeding. When unsure whether something needs approval, default to asking. Never batch multiple actions into one approval request — ask separately for each meaningful step.

### Rule 3 — GitHub safety

Never run any command that affects GitHub remotely. This includes (but isn't limited to): `git push`, `git push --force`, creating or merging pull requests, changing branch protection rules, editing repository settings, deploying to GitHub Pages, or anything else that publishes code beyond the user's local machine.

Local git operations (`git status`, `git add`, `git commit`, `git log`, creating local branches) are allowed without explicit approval, but always tell the user when you've made a commit so they can see the history.

If the user asks to push to GitHub, repeat back exactly what files and which branch will be pushed, then wait for explicit confirmation before running the command.

### Rule 4 — Cost and usage warnings

If a step would consume a meaningful amount of Claude Code tokens (reading large files, generating long outputs, running many tool calls in sequence), warn the user before starting. Brief and matter-of-fact: "This step will read all the files in /src — about X tokens. Proceed?"

### Rule 5 — No silent fixes

If you encounter an error, stop and explain what happened in plain English. Do not attempt to fix it without telling the user first. The user is trying to learn — silent fixes prevent learning.

---

## 3. Tech stack

- **Runtime:** Electron (desktop app framework)
- **Language:** Vanilla JavaScript (no React, no TypeScript)
- **Styling:** Plain CSS with CSS variables for the palette
- **Detection:** `systeminformation` npm package
- **Icons:** `@tabler/icons-webfont` (outline style only)
- **Packaging:** `electron-builder`
- **PDF export:** Electron's built-in `webContents.printToPDF()`
- **Build automation:** GitHub Actions (for the Mac build; added in a later phase)

Reasons for these choices: vanilla JS keeps the project simple for a beginner. `systeminformation` is the standard package for hardware detection in Node.js / Electron. The Tabler webfont gives consistent outline icons without bundling complexity.

### Electron security pattern

Detection code runs in the **main process** (where Node modules are available). The renderer (UI) cannot run Node code directly. Use this pattern:

- `main.js` performs detection using `systeminformation` and exposes IPC handlers.
- `preload.js` uses `contextBridge` to expose a safe `window.api.getSpecs()` function to the renderer.
- `renderer.js` calls `window.api.getSpecs()` and renders the result.

Set `contextIsolation: true` and `nodeIntegration: false` in the BrowserWindow options. This is the modern, secure pattern.

---

## 4. File structure

```
aicheck/
├── CLAUDE.md             ← this file
├── README.md             ← public-facing description
├── package.json
├── .gitignore
├── main.js               ← Electron main process (window setup, IPC, detection)
├── preload.js            ← Secure bridge between main and renderer
├── src/
│   ├── index.html        ← Dashboard markup
│   ├── styles.css        ← Beachy palette + layout
│   ├── renderer.js       ← UI logic, event handlers, rendering
│   ├── detection.js      ← System spec detection (called from main)
│   ├── recommendations.js ← Green/yellow/red evaluation rules
│   └── copy.js           ← All user-facing strings (centralized for tone)
├── assets/
│   ├── bear-logo.png     ← Placeholder; user will provide California bear
│   └── icon.ico          ← Windows app icon
└── .github/
    └── workflows/
        └── release.yml   ← GitHub Actions config (added in a later phase)
```

Keep files small and single-purpose. If a file grows past ~200 lines, suggest splitting it.

---

## 5. What the app detects

Using the `systeminformation` package in `main.js` (then sent to the renderer via IPC):

| Spec | Function |
|---|---|
| OS name + version | `si.osInfo()` |
| Total RAM | `si.mem()` |
| RAM type + speed | `si.memLayout()` |
| Disk free / total | `si.fsSize()` |
| CPU model + architecture | `si.cpu()` |
| GPU model | `si.graphics()` |

If any detection fails (returns null/undefined or throws), show "Unknown" in the UI for that spec and continue. Never let one failed detection crash the whole app. Wrap each detection call in its own try/catch.

---

## 6. Recommendation thresholds (realistic mode)

Each spec earns one of: `pass`, `warn`, `fail`.

### RAM

- **Claude Code:** ≥ 8 GB = pass, 4–7.99 GB = warn, < 4 GB = fail
- **Claude Cowork:** ≥ 16 GB = pass, 8–15.99 GB = warn, < 8 GB = fail

### Free disk space (same rule for both tools)

- ≥ 20 GB = pass, 5–19.99 GB = warn, < 5 GB = fail

### Operating system

- **Claude Code:** macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+ / Debian 10+) = pass. Anything older = fail.
- **Claude Cowork:** macOS 12+ or Windows 10+ = pass. Linux or anything older = fail.
- No warn state for OS.

### CPU architecture

- 64-bit (x86_64 or ARM64) = pass
- 32-bit only = fail
- No warn state.

### Verdict aggregation rules

- All checks pass for both tools → **green**
- Any check is `warn`, or one tool fully fails but the other passes → **yellow**
- Both tools fail any check → **red**

In other words: if Claude Cowork can't run but Claude Code can, the verdict stays yellow (not red). The user still has a working AI tool.

### Specs displayed but NOT scored

- **RAM type / speed** (DDR3/4/5, MHz) — shown for transparency only; not part of the verdict
- **GPU** — shown for transparency only; Claude tools run in the cloud, the user's GPU doesn't matter

---

## 7. Design system

### Color palette

Define these as CSS variables at the root of `styles.css`:

```css
:root {
  /* Backgrounds */
  --sand: #FBF6EC;
  --foam: #FFFFFF;

  /* Text */
  --deep-ocean: #0B3B5E;   /* primary text */
  --tide: #3E5E72;         /* secondary text */
  --mist: #6B8294;         /* muted / footer */

  /* Borders */
  --shell: #E5DAC4;
  --shell-strong: #C9BBA0;

  /* Status — pass (sea green) */
  --seafoam-bg: #DCF5EF;
  --seafoam-ink: #0F6E5F;

  /* Status — warn (sunset coral) */
  --sunset-bg: #FCE5C8;
  --sunset-ink: #9A4517;

  /* Status — fail (deep coral) */
  --coral-bg: #FBDDDC;
  --coral-ink: #A02B2B;

  /* Accent — info / links / buttons */
  --ocean-bg: #DCEEF4;
  --ocean-ink: #0E6E8C;
}
```

Every text-on-background pairing in this palette meets WCAG AA contrast standards.

### Typography

- Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;`
- Sizes: 12px (small), 13px (body small), 15px (body), 18px (subhead), 22–24px (title)
- Line height: 1.6 for body text
- Sentence case for ALL UI text. Never Title Case. Never ALL CAPS. The one exception: the brand name "AICHECK" is always uppercase.

### Icons

Use Tabler outline icons via `@tabler/icons-webfont`. Used as `<i class="ti ti-icon-name"></i>`.

Specific icons in the app:

- Refresh button: `ti-refresh`
- Save PDF button: `ti-file-text`
- Green verdict: `ti-circle-check`
- Yellow verdict: `ti-alert-triangle`
- Red verdict: `ti-alert-circle`
- Pass status: `ti-check`
- Fail status: `ti-x`
- Unknown spec: `ti-help`
- External link: `ti-external-link`
- Privacy lock (footer): `ti-lock`
- App logo: use `ti-paw` as a placeholder until the user provides their California bear logo image

### Layout

- Single-window app, minimum size 720px wide × 720px tall, resizable
- Sand-colored background fills the window
- Single scroll column. Section order, top to bottom:
  1. **Header** — logo + "AICHECK" on the left, Refresh and Save PDF buttons on the right
  2. **Verdict card** — large colored hero block (sunset/seafoam/coral background by state)
  3. **Tool readiness** — one row per tool (Claude Code, Claude Cowork) with status icon
  4. **Your system** — responsive grid of spec cards
  5. **What to fix** — numbered fix items (only rendered when verdict is yellow or red)
  6. **What each tool needs** — comparison table (rendered in all states)
  7. **Footer** — privacy line + version number

---

## 8. Copy and tone

All user-facing strings live in `src/copy.js`. Import where needed. This keeps tone consistent and makes future text edits easy.

### Tone rules

- Warm but to-the-point. No fluff. No exclamation marks unless something genuinely deserves one.
- Always name the exact number ("You have 8 GB" not "Your RAM is low").
- Always name the requirement ("Claude Cowork needs 16 GB" not "more is needed").
- Always provide a specific fix where possible ("Free 15 GB" not "Free some space").
- Avoid blame. "Your machine isn't ready yet" not "Your machine is too weak."
- Use "we" sparingly — only for things the app actually does ("We couldn't detect your GPU"). Use "you" for everything about the user's machine and choices.

### OS-aware fix links

When generating the URL for a fix guide, swap the destination based on the detected OS:

- macOS → links to Apple Support articles
- Windows → links to Microsoft Support or generic Windows guides
- Linux → links to the appropriate distro's docs or a reputable Linux site

The text of the link should also adapt ("How to free up space on a Mac" vs. "How to free up space on Windows 11").

### Verdict messages (template form)

**Green title:** "You're ready for AI work"
**Green detail:** "Your machine has everything it needs to run both Claude Code and Claude Cowork smoothly."

**Yellow title:** "Almost there — [N] thing(s) to sort out"
**Yellow detail:** Summarize what works, what doesn't, and point to the fix section below.

**Red title:** "This machine isn't ready for AI work yet"
**Red detail:** "[N] things are blocking it: [short list]. The good news — each fix is straightforward and we'll walk you through it below."

---

## 9. Privacy commitment

This is non-negotiable. The app must:

- Never send system information anywhere over the network.
- Never write detected specs to disk, except for the PDF that the user explicitly chooses to save.
- Include no analytics, no telemetry, no tracking code of any kind.
- Display this privacy line in the footer at all times: "Everything stays on your computer. Nothing is sent or saved anywhere."

If a future feature would conflict with this commitment, stop and discuss with the user before implementing.

---

## 10. Out of scope for v1

Do not add these features unless the user explicitly requests them later:

- Account systems, login, or user profiles
- Scan history or saved past scans
- Multi-language support
- Dark mode
- Internet speed test
- Battery health check
- Telemetry, analytics, or anything sent off the user's machine
- Auto-update mechanism

If the user requests one of these mid-build, pause and confirm they want to expand scope before proceeding.

---

## 11. Build and distribution

- Windows build target: **portable .exe** (no installer, no registry changes — single self-contained file the user can run from anywhere or delete with no trace).
- Mac build target: **.zip containing the .app bundle** (equivalent to portable).
- For v1, builds are **unsigned**. Document this in the README so users know about the first-launch security warning and how to bypass it.
- Mac builds will be produced via GitHub Actions because the user develops on Windows. The Actions workflow file is added in a later phase, not at project init.
- Final installer files are uploaded to **GitHub Releases** (manually for v1; can be automated later).
- The landing page (separate Next.js project on Vercel) links to the GitHub Releases URLs.

---

## 12. Acceptance criteria for v1

The app is "done" (for v1) when:

- [ ] Opens to the dashboard in under 3 seconds on a typical machine
- [ ] All seven spec cards display real detected values for the current machine
- [ ] Verdict color and message correctly reflect the threshold rules in section 6
- [ ] Refresh button re-runs detection and updates the UI
- [ ] Save as PDF produces a one-page PDF of the dashboard
- [ ] App runs on Windows 10 and 11 (portable .exe)
- [ ] App runs on macOS 12 and newer (when built on a Mac via GitHub Actions)
- [ ] No data leaves the user's machine
- [ ] No console errors in the renderer or main process
- [ ] Portable Windows .exe is under 250 MB

---

*End of CLAUDE.md*
