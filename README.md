# skills

Agent skills for Claude Code and other AI coding agents.

## Skills

### forgotten-corners

Find forgotten details in a frontend codebase — placeholder links, dead buttons, unconnected forms, leftover TODOs, stale dates, default 404 pages, missing meta tags.

Statically analyses Next.js/React code and produces a dated markdown report split into confirmed findings and questions for the user.

**Install:**

```bash
npx skills add https://github.com/CanAltuntasPhysics/skills --skill forgotten-corners
```

**Usage:**

- `/forgotten-corners` — audit the entire site
- `/forgotten-corners About page` — audit a specific page or component
- `/forgotten-corners --quick` — audit only the most commonly-forgotten categories