# skills 

Agent skills for Claude Code and other AI coding agents.

## Skills

### forgotten-realms

Find forgotten details in a frontend codebase — placeholder links, dead buttons, unconnected forms, leftover TODOs, stale dates, default 404 pages, missing meta tags.

Statically analyses Next.js/React code and produces a dated markdown report split into confirmed findings and questions for the user.

**Install:**

```bash
npx skills add https://github.com/CanAltuntasPhysics/skills --skill forgotten-realms
```

**Usage:**

- `/forgotten-realms` — audit the entire site
- `/forgotten-realms About page` — audit a specific page or component
- `/forgotten-realms --quick` — audit only the most commonly-forgotten categories