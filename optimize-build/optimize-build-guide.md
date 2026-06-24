# Nixpacks Build Optimization Audit Prompt

You are working on an existing project deployed through Coolify using Nixpacks. Your goal is to inspect the project and recommend safe optimizations to make Nixpacks builds lighter, faster, and more predictable without migrating to Dockerfile unless absolutely necessary.

Do not make risky changes immediately. First inspect the repository, classify the project, then propose a clear optimization plan. If the changes are low-risk, prepare a patch.

## Main Objective

Optimize the current Nixpacks-based deployment by reducing:

* build time
* memory usage during build
* unnecessary dependency installation
* unnecessary files in the build context
* repeated cache misses
* final image/runtime bloat where possible

Do not change application behavior.

## Step 1 — Identify Project Type

Inspect the repository and classify it as one of the following:

### Small project

Usually:

* Vite / React SPA
* static landing page
* Astro static site
* simple frontend
* no SSR
* no server runtime
* build output is usually `dist`, `build`, or `out`

Recommended direction:

* keep Nixpacks
* use static deployment if possible
* ensure correct publish directory
* avoid running a Node server if static files are enough

### Medium project

Usually:

* Next.js website
* small dashboard
* Express / Nest backend
* moderate dependency count
* some SSR or API usage
* build time is noticeable but not extreme

Recommended direction:

* keep Nixpacks
* make install/build/start commands explicit
* add cache directories
* pin Node and package manager versions
* clean up scripts

### Large project

Usually:

* large Next.js app
* admin panel / portal
* monorepo
* Turborepo / Nx / Moon
* Prisma, Playwright, Sharp, Canvas, Cypress, or other heavy dependencies
* long build time
* high RAM usage
* large image size
* frequent deploys

Recommended direction:

* first optimize Nixpacks
* ensure only the relevant app is built
* add explicit cache configuration
* remove unnecessary deploy-time checks
* consider Dockerfile only if Nixpacks remains too heavy

## Step 2 — Inspect Package Manager and Node Version

Check:

* `package.json`
* lockfiles:

  * `package-lock.json`
  * `pnpm-lock.yaml`
  * `yarn.lock`
  * `bun.lockb`
* `.nvmrc`
* `engines.node`
* `packageManager`

Report:

* detected package manager
* whether the package manager is explicit
* whether Node version is pinned
* whether lockfile and package manager match

Recommended improvements:

For npm projects:

```json
{
  "engines": {
    "node": "22"
  },
  "packageManager": "npm@10"
}
```

For pnpm projects:

```json
{
  "engines": {
    "node": "22"
  },
  "packageManager": "pnpm@9"
}
```

If the project already uses another stable Node version, do not force Node 22. Prefer consistency and minimal risk.

## Step 3 — Inspect Build Scripts

Inspect `package.json` scripts.

Look for build scripts like:

```json
{
  "build": "npm run lint && npm run typecheck && next build"
}
```

or:

```json
{
  "build": "eslint . && tsc --noEmit && vite build"
}
```

Flag this as potentially expensive for production deployment.

Recommend separating deploy build from validation scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "next build"
  }
}
```

or for Vite:

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

Do not remove lint/typecheck entirely. Only recommend not running them during every production deploy build unless the team explicitly wants that.

## Step 4 — Inspect Static vs Server Runtime

Determine whether the project actually needs a server runtime.

Check for:

* Next.js SSR
* API routes
* server actions
* authentication/session logic
* backend routes
* Express/Nest/Fastify server
* dynamic server-side rendering
* file uploads
* websockets
* scheduled jobs

If none of these exist and the app only outputs static assets, recommend static deployment.

Common publish directories:

```text
Vite / React: dist
Create React App: build
Astro: dist
Next static export: out
```

If it is a Vite SPA, check whether Nixpacks can serve it as SPA/static output. If Coolify has a static site option for this resource, recommend enabling it.

## Step 5 — Add or Improve `.dockerignore`

Check if `.dockerignore` exists.

If missing, recommend adding:

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

Be careful with excluding files that the build actually needs. Do not exclude source files, public assets, package manifests, or config files required by the framework.

## Step 6 — Make Nixpacks Behavior Explicit

Check whether the project has:

```text
nixpacks.toml
```

If it does not, recommend adding a minimal one only if it makes the build more predictable.

### For npm projects

```toml
[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

### For pnpm projects

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

Only set `[start]` if the app has a real server runtime.

For static apps, do not force a Node start command if static serving is more appropriate.

## Step 7 — Add Cache Directories

Inspect framework and package manager.

For Next.js, recommend caching:

```text
.next/cache
node_modules/.cache
```

For npm, recommend:

```text
/root/.npm
```

For pnpm, recommend:

```text
/root/.local/share/pnpm/store
```

Possible `nixpacks.toml` example for npm:

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

Possible `nixpacks.toml` example for pnpm:

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

If the project is not Next.js, do not blindly add `.next/cache`.

## Step 8 — Check Monorepo Behavior

If the repo contains:

```text
turbo.json
nx.json
pnpm-workspace.yaml
apps/
packages/
```

then inspect whether Coolify/Nixpacks is building the whole monorepo unnecessarily.

For Turborepo, check whether only the target app is being built.

Recommend one of:

```text
NIXPACKS_TURBO_APP_NAME=<app-name>
```

or an explicit build command:

```bash
pnpm turbo build --filter=<app-name>
```

For Nx, recommend one of:

```text
NIXPACKS_NX_APP_NAME=<app-name>
```

or:

```bash
pnpm nx build <app-name>
```

Do not change monorepo commands without confirming the target app name and deployment output.

## Step 9 — Check Heavy Dependencies

Inspect `package.json` for heavy/native dependencies such as:

* sharp
* canvas
* prisma
* playwright
* puppeteer
* cypress
* bcrypt
* sqlite3
* node-gyp-based packages

Report whether these are production dependencies or dev dependencies.

Recommendations:

* move unused build/test-only tools to `devDependencies`
* avoid installing browser automation tools during deploy unless required
* avoid running Cypress/Playwright in production deploy builds
* verify Prisma generation is only run if needed
* verify native dependencies are actually used

Do not remove dependencies automatically.

## Step 10 — Next.js Specific Checks

If this is a Next.js project, inspect:

* `next.config.js`
* `next.config.mjs`
* `package.json`
* usage of API routes / app router / pages router
* whether static export is possible
* whether SSR is required

Consider recommending:

```js
const nextConfig = {
  output: 'standalone'
}

module.exports = nextConfig
```

But be careful: with Nixpacks, `standalone` may not reduce the image as much as a custom Dockerfile would. Still, it may help clarify runtime requirements.

Also check whether the project is doing unnecessary work during build:

* generating huge static pages
* fetching external APIs at build time
* building all locales when only one is needed
* running lint/typecheck inside `build`

## Step 11 — Coolify Settings to Check Manually

The agent may not have access to Coolify UI. If not, output a checklist for the human operator:

Check in Coolify:

* Build Pack: Nixpacks
* Is Static Site enabled when appropriate
* Publish Directory is correct
* Install Command is explicit
* Build Command is explicit
* Start Command is explicit only for server apps
* Application Port is correct
* Environment variables are not duplicated unnecessarily
* Deploy-time secrets are not baked into frontend builds accidentally
* Source commit injection is not invalidating cache unnecessarily
* Automated Docker cleanup is enabled on the server
* Concurrent builds are not too high for server RAM

## Step 12 — Output Format

Return the result in this format:

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
- Risk 1
- Risk 2
- Risk 3

## Quick Wins
- Add/change X
- Add/change Y
- Add/change Z

## Recommended Files to Change
- package.json
- nixpacks.toml
- .dockerignore
- next.config.js
- other files if needed

## Suggested Patch
Provide a patch or exact file contents.

## Coolify Manual Checklist
List settings the human should verify in Coolify.

## When to Consider Dockerfile
Explain whether this project should remain on Nixpacks or move to Dockerfile later.
```

## Optimization Principles

Follow these principles:

1. Prefer small, reversible changes.
2. Do not migrate to Dockerfile unless the project is clearly too heavy for Nixpacks.
3. Do not change runtime behavior.
4. Do not remove checks like lint/typecheck; only separate them from deploy build if appropriate.
5. Make package manager and Node version explicit.
6. Make Nixpacks commands explicit.
7. Cache dependency and framework build caches.
8. Treat static apps as static.
9. In monorepos, build only the target app.
10. Keep production deployment simple and predictable.

## Final Goal

The final result should make the current Coolify + Nixpacks deployment:

* more predictable
* faster on repeated builds
* less memory-heavy
* less likely to invalidate cache
* easier to debug
* ready for a future Dockerfile or external build system migration if needed
