---
name: optimize-build
description: Audit and optimize a project's Coolify + Nixpacks deployment to make builds faster, lighter, and more predictable — without changing application behavior or migrating to Dockerfile unless truly necessary. Works across any project type (Vite/React SPA, Astro, Next.js, Express/Nest/Fastify, Turborepo/Nx monorepos). Always inspects and classifies the project first, then presents a written plan for approval before touching any files. Use this skill whenever the user mentions slow builds, long deploy times, high build-time RAM/memory, Nixpacks, Coolify, build caching, `nixpacks.toml`, `.dockerignore`, image bloat, or wants to "optimize", "speed up", or "make my build lighter".
---

# Optimize Build

Make a Coolify + Nixpacks deployment **faster on repeated builds, lighter on memory, and less likely to invalidate cache** — without changing what the application does, and without migrating to a Dockerfile unless the project is clearly too heavy for Nixpacks.

The deployment target is assumed to be **Coolify with the Nixpacks build pack**. The project framework can be anything — this skill generalizes across SPAs, static sites, SSR apps, plain Node servers, and monorepos.

## The cardinal rule: plan first, never surprise

Builds are load-bearing. A change that looks harmless (dropping a dependency, flipping to static, editing the build command) can break a production deploy. So this skill is **inspect → classify → plan → get approval → implement**, in that order. **Always stop and present the plan, and wait for the user to approve before writing or changing any file.** Do not "just fix it" even when a change looks low-risk — the user decides what ships.

## Workflow

### 1. Inspect and classify

Read the repository before saying anything. Gather:

- **Package manager + lockfile**: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`. Check that the lockfile matches the declared manager.
- **Node version**: `.nvmrc`, `engines.node`, `packageManager` field.
- **Framework**: Vite, CRA, Astro, Next.js, Express/Nest/Fastify, etc.
- **Build scripts**: the `build`, `start`, `lint`, `typecheck` scripts in `package.json`.
- **Server vs static**: does it actually need a running server? (see "Static vs server" below)
- **Existing build config**: `nixpacks.toml`, `.dockerignore`, `next.config.*`, framework config.
- **Monorepo markers**: `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `apps/`, `packages/`.
- **Heavy/native deps**: sharp, canvas, prisma, playwright, puppeteer, cypress, bcrypt, sqlite3, node-gyp packages — and whether they're in `dependencies` or `devDependencies`.

Then classify the project as **small**, **medium**, or **large**. This sets the default direction — see `references/optimization-recipes.md` for the full classification rubric and per-class recommendations.

### 2. Decide whether the app is static or server

This is the single highest-leverage question. An app that only emits static assets should not run a Node server in production.

Look for SSR, API routes, server actions, auth/session logic, file uploads, websockets, scheduled jobs, or a real backend (Express/Nest/Fastify). If **none** exist and the build output is just static files (`dist`, `build`, `out`), recommend static deployment and skip any Node `start` command.

If it's an SPA (e.g. Vite), recommend enabling Coolify's static-site option for the resource when available.

### 3. Build the plan

Produce the audit in the exact format below (this is the deliverable the user approves). Keep recommendations small and reversible. Pull the concrete recipes — `nixpacks.toml` contents, cache directories, `.dockerignore`, monorepo filters — from `references/optimization-recipes.md`, picking only what fits this project. **Do not blindly add `.next/cache` to a non-Next project, or a Node `start` command to a static app.**

ALWAYS use this exact template:

```markdown
# Nixpacks Optimization Audit

## Project Classification
- Type:
- Framework:
- Package manager:
- Node version:
- Static or server runtime:
- Estimated size: small / medium / large

## Current Risks
- (what's making builds slow, heavy, or cache-unfriendly today)

## Quick Wins
- (small, reversible, high-leverage changes)

## Recommended Files to Change
- (e.g. package.json, nixpacks.toml, .dockerignore, next.config.js)

## Proposed Changes
For each file: show the exact new contents or a diff, and one line on why.

## Coolify Manual Checklist
Settings the human must verify in the Coolify UI (the agent cannot see them).
See references/optimization-recipes.md "Coolify checklist".

## When to Consider Dockerfile
State plainly whether this project should stay on Nixpacks or move to a
Dockerfile later, and why.
```

### 4. Stop and get approval

Present the plan. Ask the user to confirm, adjust, or pick a subset. **Do not proceed to implementation until they approve.** If they only approve part of the plan, implement only that part.

### 5. Implement on a branch, open a PR

Once approved, by default ship the changes as a pull request — never commit straight to `main`:

1. **Create a branch automatically** if the user didn't name one. Use a descriptive name like `optimize-build/nixpacks-cache` or `optimize-build/<short-summary>`. If the current branch is already a feature branch the user is clearly working on, ask before switching.
2. Apply the approved file changes.
3. Commit with a clear conventional message (e.g. `perf(build): add nixpacks cache dirs and explicit install/build commands`). End the commit body with the `Co-Authored-By` line from your environment instructions.
4. **Open a PR targeting `main`** (use `gh pr create`) unless the user specified a different base or asked not to open one. The PR body should summarize the audit, the changes, and the Coolify manual checklist so the reviewer knows what to verify in the UI. End it with the generated-with line from your environment instructions.
5. Report the branch name and PR URL back to the user.

If the user explicitly asks to commit directly or to a different target, follow that instead.

## Principles

These keep the skill safe and useful across every project type:

1. **Prefer small, reversible changes.** A two-line `nixpacks.toml` that caches the right directory beats a sweeping rewrite.
2. **Never change runtime behavior.** Optimization is invisible to users of the app.
3. **Don't delete lint/typecheck** — only recommend separating them from the *deploy* build (so production deploys don't re-run them on every push), and only if the team wants that. Show both scripts.
4. **Make the package manager and Node version explicit** — implicit versions are the #1 cause of "works locally, breaks in deploy".
5. **Make Nixpacks commands explicit** when it improves predictability — but don't add a `nixpacks.toml` just to have one.
6. **Cache dependency stores and framework build caches**, matched to the actual manager and framework.
7. **Treat static apps as static.** Don't run a server the app doesn't need.
8. **In monorepos, build only the target app.** Never build the whole repo to deploy one app.
9. **Don't auto-remove dependencies.** Report heavy deps and where they belong; let the user decide.
10. **Dockerfile is a last resort**, considered only when the project is clearly too heavy for Nixpacks — and even then, proposed, not done silently.

## Reference

`references/optimization-recipes.md` contains the concrete, copy-ready material: the small/medium/large classification rubric, `nixpacks.toml` templates for npm and pnpm, cache-directory lists per manager and framework, the `.dockerignore` template, monorepo filter env vars and commands, the heavy-dependency triage table, Next.js-specific checks, and the Coolify manual checklist. Read it when building the plan — pull only what the inspected project needs.
