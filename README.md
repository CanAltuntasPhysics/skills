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

**Scope:** Header & Footer
**Mode:** full

## 🔴 Confirmed findings

### Every footer column link points to `#`
All footer column links render as `<Link href="#">` even though
the matching routes (`/about`, `/services`, `/contact`) exist.

📁 `components/Footer.tsx:49`

### Header social links are bare domain placeholders
The utility bar links to `https://instagram.com`, `https://twitter.com`
with no company handle.

📁 `components/Header.tsx:74`

## 🟡 Questions for you

### Is the fixed header expected to overlap page heroes?
The header is `fixed top-0 z-50` and starts transparent until 20px of scroll.
Pages with light-coloured heroes may render unreadable.

📁 `components/Header.tsx:62`

## Summary

- 2 confirmed findings
- 1 question
- Suggested next step: wire footer links to real routes, then walk through the question.
```

### Design principles

- **Confirmed vs. questions split** — the skill doesn't ask about anything it can see in the code. Buttons with working handlers are not flagged. The questions list is reserved for things static analysis genuinely cannot resolve.
- **Near-duplicate grouping** — five placeholder footer links are reported as one grouped finding, not five separate ones.
- **One sentence per finding** — terse, scannable, no narration about what the file does or what you might want.
- **No interview** — the skill uses the argument you passed (or its absence) and starts. It does not ask clarifying questions before running.

### Contributing

Issues and pull requests welcome. If the skill misses a category of forgotten detail you keep running into, open an issue with an example — I'm happy to consider adding it.

### License

MIT