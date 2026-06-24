# Optimization Recipes

Concrete, copy-ready material for the optimize-build skill. Pull only what the inspected project actually needs — do not apply everything.

## Contents
- [Project classification rubric](#project-classification-rubric)
- [Package manager & Node version](#package-manager--node-version)
- [Build scripts](#build-scripts)
- [.dockerignore template](#dockerignore-template)
- [nixpacks.toml templates](#nixpackstoml-templates)
- [Cache directories](#cache-directories)
- [Monorepos](#monorepos)
- [Heavy dependencies](#heavy-dependencies)
- [Next.js-specific checks](#nextjs-specific-checks)
- [Coolify checklist](#coolify-checklist)
- [When to consider Dockerfile](#when-to-consider-dockerfile)

---

## Project classification rubric

### Small
Vite/React SPA, static landing page, Astro static site, simple frontend. No SSR, no server runtime. Output is usually `dist`, `build`, or `out`.

**Direction:** keep Nixpacks; deploy as static if possible; ensure correct publish directory; do not run a Node server if static files are enough.

### Medium
Next.js website, small dashboard, Express/Nest backend. Moderate dependency count, some SSR or API usage. Build time noticeable but not extreme.

**Direction:** keep Nixpacks; make install/build/start commands explicit; add cache directories; pin Node and package manager versions; clean up scripts.

### Large
Large Next.js app, admin/portal, monorepo (Turborepo/Nx/Moon), heavy deps (Prisma, Playwright, Sharp, Canvas, Cypress). Long build time, high RAM, large image, frequent deploys.

**Direction:** optimize Nixpacks first; ensure only the relevant app is built; add explicit cache config; remove unnecessary deploy-time checks; consider Dockerfile only if Nixpacks remains too heavy.

---

## Package manager & Node version

Report: detected manager, whether it's explicit, whether Node is pinned, whether the lockfile matches the manager.

Make both explicit. For npm:
```json
{
  "engines": { "node": "22" },
  "packageManager": "npm@10"
}
```
For pnpm:
```json
{
  "engines": { "node": "22" },
  "packageManager": "pnpm@9"
}
```

If the project already uses another stable Node version, **do not force Node 22** — prefer consistency and minimal risk. Pin to what's already working.

---

## Build scripts

Flag build scripts that bundle validation into the deploy build, e.g.:
```json
{ "build": "npm run lint && npm run typecheck && next build" }
```

Recommend separating validation from the deploy build (keep the checks, just don't run them on every production deploy):
```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "next build"
  }
}
```
Same idea for Vite (`vite build`), Astro, etc. **Never recommend removing lint/typecheck entirely** — only separating them, and only if the team wants it.

---

## .dockerignore template

Add only if missing. Keeps the build context small (faster uploads, fewer cache busts):
```dockerignore
node_modules
.next
dist
build
out
.git
.github
.env
.env.*
*.log
.cache
coverage
.vscode
.idea
.DS_Store
README.md
```

**Be careful:** do not exclude source files, public assets, package manifests, or config files the framework needs at build time.

---

## nixpacks.toml templates

Add a minimal `nixpacks.toml` only if it makes the build more predictable. Set `[start]` **only** if the app has a real server runtime — static apps should be served statically, not via a Node start command.

npm:
```toml
[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

pnpm:
```toml
[phases.setup]
cmds = ["corepack enable"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "pnpm start"
```

---

## Cache directories

Add `cacheDirectories` matched to the actual manager and framework.

- npm: `/root/.npm`
- pnpm: `/root/.local/share/pnpm/store`
- Next.js build cache: `.next/cache`, `node_modules/.cache`

**Do not add `.next/cache` to a non-Next project.**

npm + Next.js example:
```toml
[phases.install]
cmds = ["npm ci"]
cacheDirectories = ["/root/.npm"]

[phases.build]
cmds = ["npm run build"]
cacheDirectories = [".next/cache", "node_modules/.cache"]

[start]
cmd = "npm run start"
```

pnpm + Next.js example:
```toml
[phases.setup]
cmds = ["corepack enable"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]
cacheDirectories = ["/root/.local/share/pnpm/store"]

[phases.build]
cmds = ["pnpm build"]
cacheDirectories = [".next/cache", "node_modules/.cache"]

[start]
cmd = "pnpm start"
```

---

## Monorepos

If the repo has `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `apps/`, or `packages/`, check whether Coolify/Nixpacks is building the whole monorepo when it should build one app.

Turborepo — set one of:
```text
NIXPACKS_TURBO_APP_NAME=<app-name>
```
```bash
pnpm turbo build --filter=<app-name>
```

Nx — set one of:
```text
NIXPACKS_NX_APP_NAME=<app-name>
```
```bash
pnpm nx build <app-name>
```

**Do not change monorepo commands without confirming the target app name and its deployment output** — the wrong filter ships the wrong app.

---

## Heavy dependencies

Inspect `package.json` for heavy/native deps and report whether each is a `dependency` or `devDependency`:

| Dependency | Common concern |
|---|---|
| sharp, canvas | native build, large install |
| prisma | generation step; client must exist at runtime |
| playwright, puppeteer, cypress | browser binaries; test-only, rarely needed at deploy |
| bcrypt, sqlite3, node-gyp packages | native compilation, slow installs |

Recommendations (report only — **do not auto-remove**):
- Move build/test-only tools to `devDependencies`.
- Avoid installing browser automation tools during deploy unless required.
- Don't run Cypress/Playwright in production deploy builds.
- Run Prisma generation only when needed.
- Verify native deps are actually used.

---

## Next.js-specific checks

Inspect `next.config.js`/`.mjs`, `package.json`, router usage, and whether SSR is actually required.

Consider `output: 'standalone'` to clarify runtime requirements:
```js
const nextConfig = { output: 'standalone' }
module.exports = nextConfig
```
Caveat: under Nixpacks, `standalone` may not shrink the image as much as a custom Dockerfile would — set expectations accordingly.

Also check for unnecessary build-time work:
- generating huge numbers of static pages
- fetching external APIs at build time
- building all locales when only one is needed
- running lint/typecheck inside `build`

---

## Coolify checklist

The agent usually cannot see the Coolify UI. Output this for the human operator to verify:

- Build Pack: Nixpacks
- Static Site enabled when appropriate
- Publish Directory correct (`dist` / `build` / `out`)
- Install Command explicit
- Build Command explicit
- Start Command explicit **only** for server apps
- Application Port correct
- Environment variables not duplicated unnecessarily
- Deploy-time secrets not baked into frontend builds by accident
- Source commit injection not invalidating cache unnecessarily
- Automated Docker cleanup enabled on the server
- Concurrent builds not too high for server RAM

Common publish directories:
```text
Vite / React: dist
Create React App: build
Astro: dist
Next static export: out
```

---

## When to consider Dockerfile

Stay on Nixpacks unless the project is clearly too heavy for it. Consider proposing a Dockerfile only when, after Nixpacks optimization, builds are still too slow/memory-heavy, image size is unacceptable, or the build needs control Nixpacks can't express. Even then: **propose it, don't migrate silently.** The goal is a deployment that's predictable, fast on repeated builds, light on memory, cache-friendly, and ready for a future Dockerfile migration if it ever becomes necessary.
