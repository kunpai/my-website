<!-- personal-only:start -->
> **This repository is the source of [kunpai.space](https://www.kunpai.space).**
> To build your own site from it, start from the template instead:
> **[kunpai/academic-site-template](https://github.com/kunpai/academic-site-template)**. It is generated from
> this repo automatically, with the example content in place of mine
> ([live demo](https://academic-site-template.vercel.app)).

<!-- personal-only:end -->
# Academic Site Template

A personal website for researchers, PhD students and academics: publications with a topic graph,
a blog, a CV/resume built from the same data, and a site that search engines and LLMs can read.
Built with Next.js 13, React and Bootstrap. All your content lives in one folder, `content/`, so
you can take updates to the site code without merge conflicts.

**Live demo: [academic-site-template.vercel.app](https://academic-site-template.vercel.app)**,
built from this repository with the example content for the fictional Jane Doe.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkunpai%2Facademic-site-template)

## Features

- **Everything personal lives in `content/`**: config, data (JSON), about page, blog posts.
  Photos and PDFs go in `public/`.
- **Sections you can switch off.** Turning off `projects`, `blogs` and so on removes the page (it
  returns 404), its nav link, its homepage block, and its entries in the sitemap, RSS, `llms.txt`
  and the chatbot.
- **Publications** with tabs by type, a topic graph built from your tags, BibTeX, and your name
  highlighted in author lists.
- **Blog** in Markdown (GitHub-flavoured, raw HTML allowed), with reading time and an RSS feed.
- **CV and resume PDFs** generated with LaTeX from the same data. A GitHub Action rebuilds them
  when you push.
- **Readable by search engines and LLMs:** JSON-LD, a sitemap, and `llms.txt` / `llms-full.txt`.
- **Checked content:** JSON Schemas give editor autocomplete, and `npm run validate` runs before
  every build.
- Light and dark mode, a configurable accent colour and heading font.
- Optional extras (off by default): an AI chatbot (NVIDIA NIM), small games, and link pages for
  posters (`linktree`).

## Quickstart

1. Click **Use this template** on GitHub (or clone the repo), then:
   ```bash
   npm install
   npm run setup     # creates content/ from examples/ and asks for your name, links, sections
   npm run dev       # http://localhost:3000
   ```
2. Replace the example entries in `content/data/*.json` with yours. See
   [docs/CONTENT.md](docs/CONTENT.md) for every field.
3. Deploy: import the repository in [Vercel](https://vercel.com). The default Next.js settings
   work as they are.

Until `content/` exists, `npm run dev` and `npm run build` use the example site in `examples/`.
So a fresh clone, or the Deploy button above, shows a working demo straight away.

## What lives where

| Path | What it is |
|---|---|
| `content/config.json` | Name, links, SEO, feature flags, theme, UI labels |
| `content/data/*.json` | Publications, education, experience, projects, skills, awards, news, talks, service |
| `content/about.md` | The About page |
| `content/blogs/*.md` | Blog posts (front matter: `title`, `date`, `tags`, `authors`, `image`) |
| `public/` | Your photo, images, and CV/resume PDFs, served as-is |
| `examples/` | The starter content that `npm run setup` copies |
| `schemas/` | JSON Schemas for everything in `content/` |
| `components/`, `pages/`, `lib/`, `styles/`, `scripts/` | Site code |

Your editor (VS Code, via `.vscode/settings.json`) autocompletes and checks `content/` files
against `schemas/`.

## Customising

**Sections.** Set `features.<name>` to `false` in `content/config.json`:

```json
"features": { "projects": false, "blogs": true, "games": false }
```

All sections are on by default except `games`, `chatbot` and `linktree`. The full table is in
[docs/CONTENT.md](docs/CONTENT.md#feature-flags).

**Look.** Pick any Google Fonts family for headings, and optionally an accent colour:

```json
"theme": { "headingFont": "Audiowide", "accentColor": "#0d6efd", "gradientStart": "#0d6efd", "gradientEnd": "#00d2ff" }
```

Without colours the site uses Bootstrap's default palette. Setting `gradientStart` and
`gradientEnd` adds a gradient to your name in the hero.

**Wording.** Button and heading text can be overridden under `labels`, for example
`"labels": { "resumeButton": "Download CV" }`.

**Homepage.** Work and project entries appear on the homepage unless they set
`"show_on_homepage": false`. The full pages always list everything.

## CV and resume

```bash
python3 scripts/generate_resumes.py   # needs a LaTeX install (MacTeX, TeX Live)
```

This writes the PDFs named by `resume` and `resume_short` in your config into `public/`. Entries
opt in or out with `show_in_resume` and `show_in_resume_short`. On GitHub, the **Build Resumes**
workflow does the same on every push that changes `content/`.

## Scripts

| Command | What it does |
|---|---|
| `npm run setup` | First-time setup and identity wizard |
| `npm run dev` | Development server (regenerates `llms.txt` and RSS first) |
| `npm run validate` | Check `content/` against the schemas |
| `npm run build` | Validate, generate `llms.txt`/RSS, build, write the sitemap |
| `npm run indexnow` | After a deploy, tell Bing and others about your pages |

**Environment variables:** `NVIDIA_API_KEY` is needed only if the chatbot is on. `SITE_URL`
optionally overrides `siteUrl` for the sitemap.

## Getting updates

Your content lives in `content/` and `public/`, and template updates only touch site code. To
pull updates:

```bash
git remote add template https://github.com/kunpai/academic-site-template.git
git fetch template
git merge template/main --allow-unrelated-histories   # the flag is only needed the first time
```

You only get conflicts in files you changed yourself (for example if you edited a component).

## License

The code is under the [MIT License](LICENSE). The example content in `examples/` is yours to
replace.
