---
name: forgotten-corners
description: Find forgotten details in a frontend codebase — placeholder links, dead buttons, unconnected forms, z-index conflicts, leftover TODOs. Statically analyses Next.js/React code and produces a dated markdown report split into confirmed findings and questions for the user. Use when the user wants to audit a site for overlooked bugs, mentions "forgotten corners", or is preparing a frontend project for launch.
---

# Forgotten Corners

Audit a frontend codebase for the small, easily-overlooked bugs that survive into production: placeholder social links, dead buttons, unconnected forms, layering conflicts, leftover TODOs, broken hrefs.

This skill does **static analysis only** — it reads the code, it does not run a browser. Findings that require visual verification are surfaced as questions for the user, not assertions.

## Scope

The user may pass an argument to scope the audit:

- `/forgotten-corners` — audit the entire site
- `/forgotten-corners <page or component>` — audit a specific area (e.g. "About page", "footer", "checkout flow")
- `/forgotten-corners --quick` — audit only the most commonly-forgotten categories (1, 2, 7, 9, 11 below)

If the argument is ambiguous (e.g. "the form"), pick the most likely target from the codebase and state your assumption in the report. Do not interview the user.

## Categories to check

Walk these categories in order. Within each category, gather all findings before moving on. Do **not** invent categories outside this list — the discipline of a fixed checklist is what keeps the skill fast.

1. **External links** — Social media links, footer links, "powered by" badges. Flag anything that points to a placeholder (`https://instagram.com/` with no handle, `https://twitter.com/`, `https://facebook.com/`, `#`, `about:blank`).

2. **Internal links** — Broken `href` values, routes that do not exist in the app router, links to pages that were deleted, `<a>` tags with no `href`.

3. **Form integrations** — Forms whose `onSubmit` is empty, logs to console, points to a localhost URL, or calls an API route that does not exist. Forms that look complete but have no obvious backend should be flagged as a question.

4. **Interactive elements** — `<button>` elements with no `onClick`, `onClick` handlers that are empty or only contain `console.log`, links styled as buttons (or vice versa) with mismatched behaviour.

5. **Z-index & layering** — Sticky/fixed headers without explicit `z-index`, hero sections likely to render under the header, transparent dropdowns/menus with no backdrop. These can only be **suspected** from static code — surface them as questions.

6. **Visual consistency** — Dropdowns, modals, hover states implemented with different libraries or patterns across the codebase. Surface as questions for the user to verify visually.

7. **Placeholder content** — `Lorem ipsum`, `TODO`, `FIXME`, `XXX`, `test@test.com`, `Your Company`, `Coming soon` left in production code, dummy phone numbers like `555-` or `+1 234 567 8900`.

8. **Empty / dead states** — Component imports that are never used, commented-out JSX, `if (false)` blocks, `.map()` calls over arrays that are always empty, conditionally-rendered components whose condition is never true.

9. **Meta & SEO** — Pages with missing or default `<title>` ("Create Next App", "Untitled"), empty `<meta description>`, missing Open Graph tags / OG image, default Next.js favicon still in place. Silent until the site is shared on social media or appears in search results, then immediately embarrassing.

10. **404 & error pages** — Default framework 404 page still in place (e.g. Next.js generic "This page could not be found"), no custom `not-found.tsx`, no styled error page. The user only sees these when something goes wrong, which is exactly when polish matters.

11. **Stale dates & hardcoded years** — Footer copyright like `© 2023` instead of `© {new Date().getFullYear()}`, hardcoded "Updated January 2024" strings, version numbers frozen in the past. Makes a live site look abandoned.

## Process

### 1. Map the codebase

Quickly identify the route structure (App Router or Pages Router) and the main shared components (header, footer, layout). If the scope is the whole site, list the routes you found before starting. If the scope is targeted, navigate directly to the relevant files.

Use the project's domain glossary (`CONTEXT.md`) if present, so the report refers to areas in the user's vocabulary rather than generic terms.

### 2. Scan each category

For each category in the list above:

- Search for the relevant patterns across the in-scope files
- Classify every finding as **confirmed** (visible in code) or **question** (suspected, needs human verification)
- Group near-duplicate findings into one (e.g. "all 5 footer social links are placeholders" rather than 5 separate items)

Stop scanning a category once you have a clear picture — do not exhaustively list every minor instance if a pattern is obvious.

### 3. Write the report

Create the report at `docs/forgotten-corners/YYYY-MM-DD-HHMM.md` (create the directory if it does not exist). Use the local date and time.

Report structure:

```markdown
# Forgotten Corners Audit — <human-readable date>

**Scope:** <whole site | specific page/component>
**Mode:** <full | quick>

## 🔴 Confirmed findings

### <Human-readable headline>
<One sentence stating what is wrong. Maximum two sentences if a second sentence adds critical context (e.g. "even though X exists"). Do NOT explain what the file does, what the user might want, or speculate on causes.>

📁 `<relative/path/to/file>:<line>`

(repeat per finding)

## 🟡 Questions for you

### <Human-readable question>
<One sentence asking the question. Optionally one short sentence explaining why static analysis cannot answer it.>

📁 `<relative/path/to/file>` (if applicable)

(repeat per question)

## Summary

- <N> confirmed findings
- <N> questions
- Suggested next step: <e.g. "fix confirmed findings, then walk through the questions">
```

### 4. Present the report

After writing the file, summarise in the chat:

- The path to the report
- A count of confirmed findings and questions
- The top 2-3 most impactful items (not the full list — the user will open the file)

Do not paste the full report into chat.

## What this skill must NOT do

- **Do not write long explanations.** One sentence per finding. A second sentence only if it adds critical context (like "the route already exists"). Do not narrate what the code does, what the user might intend, or what should be done about it — the user knows their own codebase.
- **Do not ask about things that are visible in the code.** If a button has a working `onClick`, do not ask whether it works. The user expects the skill to filter signal from noise.
- **Do not list more than three near-identical findings separately.** Group them.
- **Do not flag design choices.** Colour, spacing, copywriting tone — out of scope. Only flag *forgottenness*, not taste.
- **Do not interview the user before starting.** Use the argument (or its absence) and proceed.
- **Do not run the dev server, open a browser, or modify code.** Read-only static analysis. Fixes are a follow-up the user requests separately.

## When the skill finishes

End with one short question offering three options:

> Want me to turn these into a to-do list, open issues in the tracker, or leave the report as-is?

If the user picks **to-do list**, write a checklist file at `docs/forgotten-corners/YYYY-MM-DD-HHMM-todo.md` containing only the confirmed findings as `- [ ]` items, grouped by category. Skip the questions (they need human input first).

If the user picks **issues**, open one issue per confirmed finding in the project issue tracker, using the report's headlines as titles and the explanation + file reference as the body.

If the user picks **leave as-is** or does not respond, do nothing further. The user knows where the report is.