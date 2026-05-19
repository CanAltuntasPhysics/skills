# skills

Agent skills for Claude Code and other AI coding agents.

[![skills.sh](https://skills.sh/b/CanAltuntasPhysics/skills)](https://skills.sh/CanAltuntasPhysics/skills)

---

## forgotten-corners

Find the small, easily-overlooked bugs that survive into production: placeholder social links, dead buttons, unconnected forms, leftover TODOs, stale dates, default 404 pages, missing meta tags.

Statically analyses Next.js/React code and produces a dated markdown report split into **confirmed findings** (visible in code) and **questions for the user** (things that need visual verification or business context).

### When to use

Use `forgotten-corners` when you:

- Are **preparing a frontend project for launch** and want a final pass before going live
- Just inherited a codebase and want to find what the previous developer left half-finished
- Have been **moving fast for weeks** and suspect small details slipped through (placeholder Instagram link, footer that still says © 2023, forms that don't go anywhere)
- Want a **second pair of eyes** on a specific page, component, or flow before you ship it
- Are doing a **pre-launch checklist sweep** and want to start from a real audit instead of a generic template

Do not use it for code quality, performance audits, or accessibility — those need different tools. This skill is specifically about *forgottenness*: things that exist in the code but were never finished, connected, or updated.

### Install

```bash
npx skills add https://github.com/CanAltuntasPhysics/skills --skill forgotten-corners
```

### Usage

```
/forgotten-corners                       # audit the entire site
/forgotten-corners About page            # audit a specific page or component
/forgotten-corners footer                # works for any named area
/forgotten-corners --quick               # only the most commonly-forgotten categories
```

The skill writes a timestamped report to `docs/forgotten-corners/YYYY-MM-DD-HHMM.md` and summarises the top findings in chat.

At the end it asks whether you want to turn the findings into a to-do list, open issues in your tracker, or leave the report as-is.

### What it checks

The skill walks 11 fixed categories:

1. **External links** — placeholder social URLs (`instagram.com/` with no handle), `#` hrefs
2. **Internal links** — broken `href`s, routes that don't exist, missing `href` on `<a>` tags
3. **Form integrations** — empty `onSubmit`, forms with no backend, `console.log` handlers
4. **Interactive elements** — buttons without `onClick`, empty handlers
5. **Z-index & layering** — sticky headers without explicit `z-index`, transparent dropdowns
6. **Visual consistency** — dropdowns/modals/hover states using different patterns across the codebase
7. **Placeholder content** — `Lorem ipsum`, `TODO`, `test@test.com`, `Your Company`
8. **Empty / dead states** — unused imports, commented-out JSX, `if (false)` blocks
9. **Meta & SEO** — missing or default `<title>`, empty meta description, missing OG tags, default favicon
10. **404 & error pages** — default framework 404 still in place, no custom `not-found.tsx`
11. **Stale dates & hardcoded years** — `© 2023` instead of `{new Date().getFullYear()}`

`--quick` mode runs only categories 1, 2, 7, 9, and 11 — the highest signal-to-noise ones for a fast pre-launch check.

### Example output

```markdown
# Forgotten Corners Audit — 18 May 2026

**Scope:** entire site
**Mode:** quick

## 🔴 Confirmed findings

### Footer social icons point to bare domains
The Instagram, Twitter, and LinkedIn buttons link to `https://instagram.com`,
`https://twitter.com`, `https://linkedin.com` with no company handle.

📁 `components/Footer.tsx:42`

### Newsletter signup button has no onClick
The "Subscribe" button is rendered and styled but has no handler attached.

📁 `components/NewsletterCTA.tsx:18`

### Default Next.js title on three routes
`/blog`, `/pricing`, and `/about` all still render the default
"Create Next App" page title.

📁 `app/blog/page.tsx`, `app/pricing/page.tsx`, `app/about/page.tsx`

### Footer copyright reads © 2024
Hardcoded year in footer instead of `{new Date().getFullYear()}`.

📁 `components/Footer.tsx:67`

## 🟡 Questions for you

### Is the contact form connected to a backend?
The form posts to `/api/contact`, but that route file does not exist
in the repo. Either the endpoint is hosted elsewhere or the form
silently fails on submit.

📁 `components/ContactForm.tsx:23`

## Summary

- 4 confirmed findings
- 1 question
- Suggested next step: fix the confirmed findings, then verify the contact form endpoint.
```

### Design principles

- **Confirmed vs. questions split** — the skill doesn't ask about anything it can see in the code. Buttons with working handlers are not flagged. The questions list is reserved for things static analysis genuinely cannot resolve.
- **Near-duplicate grouping** — five placeholder footer links are reported as one grouped finding, not five separate ones.
- **One sentence per finding** — terse, scannable, no narration about what the file does or what you might want.
- **No interview** — the skill uses the argument you passed (or its absence) and starts. It does not ask clarifying questions before running.

---

## client-doc

Generate **client-facing documentation** for features, recent changes, or full project overviews. Translates technical work into the language a non-technical client understands. Produces both markdown and self-contained HTML (with inline SVG diagrams, tables, and timelines — no external dependencies, no CDN, the HTML file works offline).

### When to use

Use `client-doc` when you:

- Need to **explain a feature** to a non-technical client (e.g. "explain the Stripe integration", "document the booking flow")
- Have to send a **changelog or status update** to a client at the end of the week, sprint, or milestone
- Want a **project overview document** to onboard a new stakeholder or to attach to a proposal
- Are wrapping up a project and need a **deliverable document** that summarises what was built

Do not use it for internal technical documentation, API references, or developer-facing docs — those need different skills like `doc-it`. This skill is specifically for translating engineering work into language that someone managing the project (but not building it) needs.

### Install

```bash
npx skills add https://github.com/CanAltuntasPhysics/skills --skill client-doc
```

### Usage

```
/client-doc feature stripe checkout              # document one feature
/client-doc changelog                             # last ~10 commits, this week
/client-doc changelog --last-month                # broader window
/client-doc overview                              # whole project at a high level

# Flags
/client-doc feature ... --quick                   # skip grilling, generate fast
/client-doc feature ... --md                      # markdown only
/client-doc feature ... --html                    # html only
# (default outputs both)
```

The skill writes timestamped files to `docs/client/YYYY-MM-DD-<mode>.md` (and `.html`).

### How it works

**Grilling is on by default.** Before writing, the skill asks 2-4 focused, project-specific questions to understand your mental model — who the audience is, what to include, what to omit. The goal is not a survey; it's to make sure the document reflects your judgement, not a generic template. Add `--quick` to skip grilling when you already know what you want.

**Translation rule.** Every technical term gets translated to client language, or omitted:

| Technical | Client language |
|---|---|
| Added `POST /api/contacts` | Contact form messages are now saved |
| Integrated Stripe webhook | Payment confirmations are processed automatically |
| Migrated database to PostgreSQL | *(omit — internal change)* |
| Set up next-auth with JWT | User login was added |
| Fixed TypeScript errors | *(omit)* |
| Server-rendered the listings page | The listings page now loads faster |

When in doubt about whether to mention something, the skill omits it. A 3-page doc the client reads beats a 10-page doc they skim.

**HTML output is self-contained.** No CDN dependencies. The file opens offline in any browser. It includes:

- Cover page with project name and date
- Anchor-linked table of contents
- Inline SVG diagrams (user flows, timelines, architecture maps) generated for the specific document
- Styled tables and callout boxes
- Print stylesheet so the client can save as PDF
- Optional light/dark toggle

### Design principles

- **The audience is never a developer.** Every word serves someone who cares about what the product does, not how it works.
- **Grilling is project-specific.** The skill scans the codebase first, then asks about real things in your project, not hypothetical ones.
- **When in doubt, omit.** Completeness is not the goal — usefulness is.
- **One question at a time.** Grilling is a conversation, not a form.

### Example modes

**Feature doc** — covers a single feature end to end (overview, user journey, supported options, limitations).

**Changelog** — summarises what changed in a date window. Filters out refactors, dependency bumps, type fixes; rephrases technical work into outcomes the client cares about.

**Overview** — full project at a high level (site structure, integrations, user flows, admin features).

---

## Contributing

Issues and pull requests welcome. If a skill misses a category, pattern, or use case you keep running into, open an issue with an example — happy to consider adding it.

## License

MIT