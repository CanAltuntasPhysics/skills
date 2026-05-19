---
name: client-doc
description: Generate client-facing documentation about features, recent changes, or full project overviews. Translates technical work into the language a non-technical client understands. Produces markdown and self-contained HTML (with inline SVG diagrams, tables, and timelines — no external dependencies). Use when the user needs to document something for a client, customer, or stakeholder who is not a developer. Triggers include "client doc", "müşteriye doküman", "explain this feature for the client", "what did we ship this week".
---

# Client Doc

Generate documentation written for a non-technical client. The defining rule of this skill is that **the audience is not a developer**. Every word, every example, every diagram must serve someone who cares about what their product does, not how the code works.

## Modes

The user must specify a mode as the first argument:

- `/client-doc feature <feature name or description>` — document a single feature
- `/client-doc changelog [--last-week | --last-month | --since YYYY-MM-DD]` — summarise recent changes
- `/client-doc overview` — document the entire project at a high level

If no mode is given, ask once which mode the user wants. Do not assume.

## Flags

- `--quick` — skip the grilling step and generate from current understanding
- `--md` — output markdown only
- `--html` — output HTML only
- (default) — output both markdown and HTML

## The grilling step (default behaviour)

Grilling is the heart of this skill. **It is on by default.** A document written without grilling is generic; a document written after grilling sounds like the user wrote it themselves.

The goal of grilling is not to collect a long form survey — it is to **arrive at the user's mental model** so the document reflects their judgement about what to include, what to omit, and how to frame things.

### How to grill (mode-specific)

Before grilling, **first scan the codebase** so questions are specific, not generic. Look at the relevant feature/commits/routes so you can ask about real things in the project, not hypothetical ones.

Then ask **2-4 focused questions, one message at a time**, not all at once. Wait for each answer before asking the next. A typical grilling exchange lasts 2-4 turns. Stop grilling once you have enough — do not ask for the sake of asking.

**Always include questions about:**

1. **Audience** — "Who is this going to? Do they have any technical background, or should I assume zero?"
2. **Scope** — "I see X, Y, and Z related to this feature. Should I cover all of them, or focus on just one?"
3. **Things to omit** — "Anything you'd rather not mention? (e.g. half-finished work, internal limitations, vendor names)"
4. **Key concern** — "Is the client asking a specific question this doc should answer?" (often this is the most useful answer — it tells you what to lead with)

**Mode-specific questions to consider:**

For `feature` mode:
- "I see the integration uses Stripe. Should I mention Stripe by name or just say 'payment provider'?"
- "Do you want the doc to cover edge cases (failed payments, refunds) or just the happy path?"

For `changelog` mode:
- "I see 14 commits in the date range. Some look like refactors and dependency updates — should I skip those, or rephrase them as 'performance improvements'?"
- "Any commits you'd rather not mention to the client?"

For `overview` mode:
- "Should I include features that exist in code but aren't live yet?"
- "How much detail per section — one paragraph or several?"

**Do not ask questions that:**
- Could be answered by reading the code (don't ask "is there a contact form?" — go look)
- Are about formatting or output choice already decided by flags
- Are generic ("what tone do you prefer?")

### Quick mode

With `--quick`, skip grilling entirely. Read the codebase, make sensible defaults (no technical names, cover happy paths, omit obvious internal-only changes), and generate. Mention in the chat summary that grilling was skipped — the user can re-run without `--quick` if the result doesn't match their mental model.

## The translation rule

Every technical concept must be translated to client language. **The client should never see:**

- API endpoints, method names, function names
- Database, schema, or table names
- Library or framework names unless the user explicitly approved
- Code-level concepts (state, hooks, middleware, JWT, webhooks)
- Internal refactors, dependency updates, type fixes, linter changes
- Build, deployment, or CI/CD details

**Translation examples:**

| Technical | Client language |
|---|---|
| Added `POST /api/contacts` endpoint | Contact form messages are now saved |
| Integrated Stripe webhook handler | Payment confirmations are processed automatically |
| Migrated database to PostgreSQL | No client-facing wording — omit |
| Added `useState` for cart persistence | The shopping cart remembers items between visits |
| Set up next-auth with JWT | User login was added |
| Fixed TypeScript errors | Omit |
| Bumped dependencies | Omit |
| Refactored components | Omit (unless behaviour changed) |
| Added Tailwind config | Omit |
| Server-rendered the listings page | The listings page now loads faster |

When in doubt about whether to mention something, **omit it**. The client's time is worth more than completeness. A 3-page doc that the client reads beats a 10-page doc they skim.

## Output

Default behaviour writes **both** markdown and HTML to `docs/client/`:

- `docs/client/YYYY-MM-DD-<mode>.md`
- `docs/client/YYYY-MM-DD-<mode>.html`

If the user specified `--md` or `--html`, write only that one. Create the `docs/client/` directory if it doesn't exist.

### Language

Conduct grilling and write all output in **the same language the user is using in this conversation**, unless the user explicitly asks for a different language ("write the doc in English"). If the user is writing to you in Turkish, grill in Turkish, write the doc in Turkish. If English, English. The skill instructions are in English but that does not constrain how the skill speaks to the user or what it produces.

### Markdown structure

```markdown
# <Project or feature name>

<One-paragraph executive summary — what this document covers and who it's for>

## <Section heading>

<Plain-language explanation, short paragraphs, no jargon>

## <Next section>

...
```

Use real, descriptive section headings — not "Introduction" or "Conclusion". For example:
- Feature mode: "Genel Bakış", "Nasıl Çalışıyor?", "Hangi Ödeme Yöntemleri Destekleniyor?", "Güvenlik", "Bilinen Sınırlamalar"
- Changelog mode: "Yeni Özellikler", "İyileştirmeler", "Düzeltmeler"
- Overview mode: "Site Yapısı", "Kullanıcı Akışları", "Entegrasyonlar", "Yönetim Paneli"

### HTML structure

A single self-contained `.html` file with no external dependencies. No CDN calls, no fonts loaded from Google, no Mermaid script. Everything inline.

**Required elements:**

1. **Cover** — project/feature name, date, and an optional subtitle. Centered, large typography. Generous whitespace.

2. **Table of contents** — anchor links to each section. Sticky on scroll if feasible with pure CSS.

3. **Body sections** — same content as the markdown, but with:
   - Proper typography (system font stack, comfortable line-height, max-width ~70ch for readability)
   - Styled tables (alternating row colours, padded cells)
   - Styled callout boxes for important notes (use semantic colours: info, warning, success)
   - Inline SVG diagrams where they help (see below)

4. **Print stylesheet** — `@media print` rules so the client can save as PDF cleanly. Hide the TOC, remove backgrounds, ensure page breaks land on sensible boundaries.

**Inline SVG diagrams to include when relevant:**

- **User flow diagram** (feature mode) — boxes connected by arrows, showing the journey through a feature
- **Timeline** (changelog mode) — vertical timeline with dates on one side, descriptions on the other
- **Architecture map** (overview mode) — boxes representing major site areas, lines showing connections

Generate these as inline `<svg>` elements directly in the HTML. Keep them simple: rectangles, text, arrows. The skill is not a diagramming tool — these are explanatory illustrations, not technical schematics.

**Styling guidelines:**

- **Type** — system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`), 16-18px base, 1.6 line-height
- **Colour** — neutral palette, one accent colour. Default to a calm blue or green. The document should look professional, not playful.
- **Spacing** — generous. Sections separated by clear vertical rhythm.
- **Width** — content max-width around 70-75ch (~720px). Wider documents are tiring to read.
- **No animations** — except possibly a subtle fade-in on page load. The client is reading, not browsing.

**Interactivity allowed (only what genuinely helps):**

- Collapsible sections for "more detail" content (using `<details>` and `<summary>` — no JS needed)
- Light/dark mode toggle (CSS variables + small JS snippet) — useful if the client is presenting on a projector
- Smooth scroll on anchor links (CSS only)

**Interactivity to avoid:**

- Buttons that don't do something the client needs
- Tabs for content that should just be sections
- Animations on hover for decorative reasons
- Anything that breaks if JavaScript is disabled (except the dark mode toggle, which should default to light)

## Process

1. **Parse the arguments.** Confirm mode and any flags. If mode is missing, ask once.

2. **Explore the codebase.** Read relevant files for the chosen mode:
   - `feature` — files implementing the named feature
   - `changelog` — recent commits (use `git log`), recent issues if accessible, the changed files
   - `overview` — route structure, main components, integrations visible in package.json or env vars
   
   Spend the time on this step — questions in step 3 will be sharper.

3. **Grill the user** (unless `--quick`). Ask 2-4 focused questions, one at a time. Wait for answers.

4. **Draft the markdown.** Write the full document, applying the translation rule rigorously.

5. **Generate the HTML.** Convert markdown to a self-contained styled HTML document with inline SVG diagrams where they help.

6. **Write both files** to `docs/client/`.

7. **Summarise in chat.** Show:
   - Paths to the written files
   - A 2-3 sentence preview of what the document covers
   - One question: "Anything you'd like changed before sending this to the client?"

## What this skill must NOT do

- **Do not use technical terms** the client doesn't need to know. When in doubt, translate or omit.
- **Do not include internal-only changes** (refactors, dependency updates, type fixes, linting) in changelog mode.
- **Do not ask more than 4 grilling questions.** If the user wanted a survey, they'd fill out a form.
- **Do not ask all questions at once.** One per message, wait for the answer.
- **Do not assume the audience.** Always ask about technical background unless `--quick` is set.
- **Do not invent features.** If something isn't in the code, it doesn't go in the doc — even if the user might want it.
- **Do not write a long executive summary.** One short paragraph, then get to the content.
- **Do not narrate the work to the client.** "We added", "we fixed", "we built" is fine. "We refactored the auth middleware" is not.
- **Do not include broken interactivity in the HTML.** If a button is there, it must do something the client needs.

## When the skill finishes

Summarise in chat:

> Wrote two files:
> - `docs/client/<date>-<mode>.md`
> - `docs/client/<date>-<mode>.html`
>
> <2-3 sentence preview of what the doc covers>
>
> Anything you'd like changed before sending this to the client?

Do not push further. Wait for feedback or move on.