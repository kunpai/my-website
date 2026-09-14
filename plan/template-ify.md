# Plan: Turn my-website into a forkable academic-site template

Status: IMPLEMENTED on branch `feature/template-ify` (2026-09-13). Not merged yet.

Decisions taken: D1 (a) separate generated template repo; D2 MIT for code, content all rights
reserved; D3 games and chatbot kept but off by default, linktree kept behind a flag (on for
kunpai.space because poster QR codes point at /linktree/*); D4 the earlier zip was ignored.

How the implementation differs from the plan below:
- The site-code-only README note is a `<!-- personal-only -->` block that the export strips.
- Generated files are rebuilt by `npm run generate`, which now also runs before `npm run dev`.
- llms.txt/llms-full.txt now omit disabled sections. For kunpai.space that drops Projects and
  Work, Research and Teaching Experience, because `projects` and `experience` are off.
- Also fixed along the way:
  - hydration error #418 on /blogs
  - the Education section's `id="publications"`
  - the mailto: link not being URL-encoded
  - an empty "GPA:" line
  - the chatbot reading `tags` for projects instead of `skills`

Still needed from the owner: create the empty repo `kunpai/academic-site-template` (and mark
it as a template), then add the secret `TEMPLATE_REPO_TOKEN` (a fine-grained PAT with
Contents: read and write on that repo only).

## Goal

Anyone can start their own academic site from this code in a few minutes, and can later pull
improvements to the site code **without merge conflicts with their own content**. At the same time,
kunpai.space keeps working and there is one codebase to maintain, not two.

Invariant for every phase: **kunpai.space renders identically** (checked with a Playwright
screenshot at 390 / 768 / 1280 / 1920 px against a baseline taken before Phase 1).

## Where things stand

Already present: `website.config.json`, `website.config.example.json`, `npm run setup` wizard,
feature flags, a README that calls the repo a template, `public/jsons/examples/`.

What's broken or missing (from the audit):

| Area | Problem |
|---|---|
| Content mixed with code | Personal data lives in `public/jsons`, `public/about.md`, `public/blogs`, `public/*.pdf`, `public/images`, `public/assets` (38 MB), next to site files. A fork gets all of Kunal's content and history. |
| Hardcoded values (~25) | `kunpai.space` in `indexnow.js`, `generate_llms_txt.js`, `next-sitemap.config.js`. `"Kunal Pai"` defaults in `generate_resumes.py`. Kunal's research categories and colours in `publication.js`. June-2023 / 2025 date filters and a `"gem5 Vision"` special case in `pages/index.js`. Fixed labels in hero, contact, footer and chatbot. Repo URL in `setup.js`. Audiowide font. |
| Config that does nothing | `theme.*` (removed in dbeba12), `features.chatbot`, `features.researchGraph`, `contactEmails`. The wizard asks for theme colours that nothing reads. |
| Undocumented flags | `contact`, `news`, `education`, `talks`, `services`, `skills`, `awards` are read by code but appear in neither config. `workExperience` and `experience` duplicate each other. |
| Flags only hide links | Every route still works by direct URL. Sitemap, search, RSS, llms.txt and the chatbot prompt ignore flags. |
| Wrong examples | `examples/*.json` use key names the components don't read (`company`, not `organization`). The README's publication example uses the wrong `links` shape and the wrong `type` casing. |
| Wrong docs | The README points to `LICENSE` (missing) and `auto-resume-and-llm.yml` (the file is really `build-resume.yml`). |
| Dead code and risk | `api/getBlogContent.js` builds a file path from the request body without sanitising it (path traversal) and has no callers. Unused: `api/getBlogNames.js`, 9 dependencies, `extra.json`, the unused imports, commented-out blocks in `pages/index.js`, linktree. |
| Generated files tracked | `llms*.txt`, `index.md`, `rss.xml`, `sitemap*.xml`, `robots.txt` are committed but are regenerated on every build anyway. |

## Target architecture

```
content/                    ← everything personal that isn't a served file (you own this folder)
  config.json               (was website.config.json)
  data/*.json               (was public/jsons/*.json)
  about.md                  (was public/about.md)
  blogs/*.md                (was public/blogs/*.md)
public/                     ← served files; personal media stays here, no path changes
  images/, assets/, *.pdf   (personal; never copied into the template)
  placeholder.png, …        (site assets, on an explicit allowlist)
examples/                   ← starter content that ships with the template
  content/…                 (Jane Doe: complete, valid, matches the schemas)
  public/…                  (placeholder avatar, one sample PDF)
schemas/*.schema.json       ← one JSON Schema per data file (validation + editor autocomplete)
lib/content.js              ← the only module that loads content: applies defaults, resolves flags
```

Why media stays in `public/`: moving it would change every image and PDF URL, which breaks SEO and
existing links, or would need a copy-on-build step. Upstream never ships files with your media
paths, so forks still don't get conflicts.

**Distribution:** `kunpai/my-website` stays your site. A script, `scripts/export-template.js`,
builds a clean tree: site code + `examples/` + allowlisted `public/` files. It leaves out `content/`,
your media and generated files. A GitHub Action pushes that tree to a **separate repo**
(`kunpai/academic-site-template`, marked as a GitHub template) as a squashed commit with fresh
history, so your git history never leaks. Forkers run `npm run setup`, which copies `examples/` to
`content/`. From then on they own `content/` completely, so `git pull upstream` only touches site code.

## Phases

### Phase 0: Housekeeping (low risk)
1. Commit the current hero/title fix.
2. Add `.claude/` to `.gitignore`. It's untracked but not ignored, so `git add -A` would commit it.
3. Add `LICENSE` (MIT for code, pending decision D2) and `CONTENT-LICENSE` or a README note that
   `content/` and personal media are all rights reserved.
4. Take a Playwright baseline of kunpai.space at 4 widths (home, publications, blogs, about).

### Phase 1: Content layer (medium risk; biggest change)
1. Create `lib/content.js`: `getConfig()`, `getData(name)`, `getAbout()`, `features`, with defaults.
2. Move `website.config.json` → `content/config.json`, `public/jsons/*.json` → `content/data/`,
   `public/about.md` → `content/about.md`, `public/blogs/` → `content/blogs/` (`git mv`, so history
   is kept).
3. Rewrite the 29 `/public/jsons/*` imports plus all config imports to go through `lib/content.js`.
4. Point the generators at `content/`: `generate_llms_txt.js`, `generate_rss.js`,
   `generate_resumes.py`, `indexnow.js`, `next-sitemap.config.js`, `lib/blogs.js`, and the `paths:`
   filter in `build-resume.yml`.
5. Remove the `env.CONFIG` duplication in `next.config.js`.
6. Check: `npm run build` passes and screenshots match the baseline.

### Phase 2: Feature flags (medium)
1. Define every flag once in `lib/content.js`, with defaults: about, publications, projects,
   experience (merges `workExperience`), blogs, news, education, talks, services, skills, awards,
   contact, games, chatbot (replaces top-level `enableChatbot`), researchGraph (actually wired to
   the graph), linktree.
2. Gate routes: disabled pages return `notFound` from `getStaticProps` (a 404, not just a hidden link).
3. Make the sitemap, search index, RSS (skipped when blogs are off), llms.txt and the chatbot prompt
   respect the flags.
4. Read old key names for one release (`workExperience`, `enableChatbot`) and print a deprecation
   warning, so existing configs keep working.

### Phase 3: Remove the hardcoded values (medium)
1. URLs: everything comes from `config.siteUrl`. Fix `indexnow.js`, the llms fallbacks, the sitemap
   fallback, the `_document.js` `my-website` filter, and the `setup.js` repo link.
2. `generate_resumes.py`: remove the `"Kunal Pai"` defaults, fixed skill categories, `[Spotlight]`,
   `2 copy.pdf` fallbacks and forced `www.`. Check `resume_template.tex` for personal text.
3. `publication.js`: category colours come from the category's position in
   `config.publicationCategories` (palette in CSS variables), not from three fixed names. Remove
   the default categories. Author bolding uses exact `config.name` plus an optional
   `config.authorAliases`, not a first-name substring match.
4. `pages/index.js`: replace the date filters and the gem5 special case with a per-entry
   `show_on_homepage` field (same style as the existing `show_in_resume*`). Set it on your current
   entries so the homepage doesn't change.
5. Copy: hero button labels, section titles, contact intro, footer heading, and the chatbot
   greeting/model move to a `config.labels` / `config.chatbot` block, with neutral defaults.
6. Theme: wire `theme.accentColor`, `gradientStart`, `gradientEnd` and `headingFont` into CSS
   variables in `_app.js`. Leave accent **unset** in your config so your current look is unchanged.
   Load `Inter` properly or drop it.

### Phase 4: Examples + schemas (low)
1. Write `schemas/*.schema.json` for config and each data file, from what the components actually
   read. Add `"$schema"` to each content file so VS Code autocompletes and flags mistakes.
2. `npm run validate` (ajv, dev dependency), run in `prebuild`. It fails with a readable message such
   as `content/data/projects.json[2]: missing "start"`.
3. Rebuild `examples/`: a complete Jane Doe site (every section, one blog post, about.md, placeholder
   avatar, sample PDF) that passes validation. Delete `public/jsons/examples/`.
4. Fix the README examples so they match the schemas.

### Phase 5: Setup wizard (low)
1. `npm run setup`: when `content/` is missing, copy `examples/` into place, then ask identity
   questions.
2. Stop keeping the previous owner's `bio` / `intro` / `knowsAbout` / `categories` when
   initialising from the examples. Stop writing dead keys. Write the new flag names.
3. Generate a fresh IndexNow key file (don't reuse yours).
4. Keep the `--defaults` mode so CI can run it non-interactively.

### Phase 6: Cleanup (low)
1. Delete `api/getBlogContent.js` (path traversal) and `api/getBlogNames.js`.
2. Remove unused dependencies: nodemailer, html-react-parser, react-truncate-markup, remark,
   remark-html, rehype, github-markdown-css (or actually import it), fs. Keep highlight.js
   (rehype-highlight uses it).
3. Remove unused imports, commented-out blocks, `console.log`s, the empty `DarkModeToggle`,
   `next.svg`, `vercel.svg`.
4. Fix the small bugs: the Education section's `id="publications"`, the `Containter` typo, the
   malformed rehype plugin list in `blogTile.js`.
5. Linktree: move it behind its flag, off by default (pending decision D3).
6. Stop tracking generated files: `git rm --cached` llms*, index.md, rss.xml, sitemap*, robots.txt
   and add them to `.gitignore`. They are rebuilt in `prebuild` / `postbuild`. Narrow the resume
   workflow to committing PDFs and .tex only.

### Phase 7: Template distribution (medium)
1. `scripts/export-template.js --out <dir>`: copy site code, `examples/`, `schemas/` and
   allowlisted `public/` files. Refuse to finish if any tracked file under `content/` or any
   non-allowlisted media would be included. Grep the output for `kunpai|Kunal|UCLA` and fail on a
   match.
2. `.github/workflows/publish-template.yml`: on push to main (site-code paths only), export → run
   `setup --defaults` → `npm run build`, then push a squashed commit to
   `kunpai/academic-site-template`. Needs one secret: a fine-grained PAT or deploy key for the
   template repo.
3. Mark the template repo as a GitHub template and point the README's Deploy-to-Vercel button at it.

### Phase 8: Docs (low)
1. README (the template's): quickstart, what lives where, the flag table, theming, deploy, and how to
   pull updates (`git remote add upstream … && git pull upstream main`).
2. `docs/CONTENT.md`: one section per data file, generated from or kept in sync with the schemas.
3. Your repo's README: a short note that this is the source of kunpai.space and the template lives
   at `…/academic-site-template`.

### Checks (in every phase and in CI)
- Your site: `npm run build` + screenshots compared with the baseline.
- Template: the export → setup → build pipeline in CI; Playwright smoke test of the Jane Doe site.
- Flag matrix: build with every flag off and with every flag on; disabled routes return 404.

## Risks

| Level | Risk | Mitigation |
|---|---|---|
| HIGH | Personal data or git history leaks into the template | Allowlist export (not a denylist), grep guard, squashed fresh history, never "Use this template" on the personal repo |
| MEDIUM | Phase 1 breaks the live site (29 import sites, generators, workflow paths) | Move and rewire in a single phase, baseline screenshot diff, Vercel preview deploy before merging |
| MEDIUM | Flag renames break existing configs | Read both old and new keys for one release, with warnings |
| MEDIUM | The export workflow needs cross-repo push credentials | Fine-grained PAT limited to the one template repo |
| LOW | Moving `public/jsons` out of `public/` makes `/jsons/*.json` URLs return 404 | Nothing links to them (checked); llms.txt / sitemap don't reference them |
| LOW | `show_on_homepage` misses an entry and changes your homepage | Screenshot diff catches it |

## Decisions needed

- **D1: Distribution.** (a) Separate generated template repo (recommended). (b) A `template`
  branch in this repo: simpler, but forks inherit your history and content. (c) Just make this
  repo forkable: least work, but forks carry your content and history.
- **D2: License.** MIT for code, all rights reserved for content (recommended)?
- **D3: Optional features in the template.** Keep games and chatbot as opt-in (off by default)?
  Keep linktree (flagged, off) or remove it?
- **D4: Earlier attempt.** `Claude outputs/academic-site-template.zip` (328 files, gitignored) is a
  previous attempt at this. Mine it for example content, or ignore it?

## Estimated complexity: MEDIUM–HIGH

Phase 1 is the only structurally risky change. Everything else can be reviewed one phase at a
time. Suggested order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, one commit (or small PR) per phase,
each passing the screenshot invariant.
