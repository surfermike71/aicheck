# AICHECK

Find out in 10 seconds whether your computer can run Anthropic's AI tools — Claude Code and Claude Cowork.

AICHECK reads your computer's specs (memory, storage, operating system, and processor), compares them against what each tool actually needs, and gives you a clear green, yellow, or red result — plus plain-English advice on anything that needs fixing.

Nothing is sent over the internet. Everything stays on your computer.

---

## Download and run on Windows

1. Go to the [Releases page](../../releases) and download the latest `AICHECK x.x.x.exe` file.
2. Save it anywhere you like — your Desktop, Downloads folder, wherever.
3. Double-click the file to run it. No installation needed.

### First-launch security warning

Because AICHECK is not yet signed with a paid certificate, Windows will show a blue warning the first time you run it:

> "Windows protected your PC"

This is normal for independent apps. To get past it:

1. Click **More info**
2. Click **Run anyway**

You'll only see this warning the first time. After that it opens normally.

---

## What AICHECK checks

| What it looks at | Why it matters |
|---|---|
| How much memory (RAM) you have | Claude Code needs at least 8 GB; Claude Cowork needs 16 GB |
| How much free storage you have | Both tools need at least 20 GB free |
| Your operating system version | Older versions of Windows or macOS may not be supported |
| Your processor type | Must be 64-bit (nearly all computers made after 2010 are) |

It also shows your RAM type and GPU for reference — those don't affect the verdict, but some people find them useful to know.

---

## Privacy

AICHECK never connects to the internet. It reads your system specs locally, shows you the results, and that's it. No data is collected, stored, or transmitted anywhere — not to Anthropic, not to us, not to anyone.

The only time anything leaves your computer is if you click **Save as PDF** — and even then, the file goes straight to wherever you choose to save it on your own machine.

---

## Mac support

Mac builds are coming. When available, they'll be listed on the Releases page alongside the Windows version.

---

## Questions or problems

Open an issue on this repository and we'll take a look.
