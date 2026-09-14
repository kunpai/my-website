# Changelog

All notable changes to the template. Your site records the release it came from in
`.template-version`; `npm run update` brings in everything listed above that release.

## 1.0.0 (2026-09-14)

The first stable release.

### What you get

- **Your content in one folder.** `npm run setup` creates `content/` from `examples/content/`:
  config, JSON data, the About page and blog posts. The template never ships that folder.
- **Updates without conflicts.** `npm run update` merges new releases into your site, including
  sites made with "Use this template" that share no git history with it.
- **Sections you can switch off** (`features` in `content/config.json`). A disabled section's
  pages return 404 and it disappears from the navigation, homepage, sitemap, RSS and `llms.txt`.
- **Publications** with tabs by type, an interactive topic graph, BibTeX, and your name
  highlighted in author lists.
- **CV and short resume PDFs** compiled with LaTeX from the same data, locally or by the
  included GitHub Action.
- **Blog** in Markdown with an RSS feed, and **`llms.txt`**, JSON-LD and a sitemap for search
  engines and LLMs.
- **Checked content:** JSON Schemas for every file (with autocomplete in VS Code) and
  `npm run validate`, which also runs before every build.
- Light and dark mode, a configurable heading font and accent colours, and overridable UI labels.
- Runs on Next.js 16, React 19 and Bootstrap 5; deploys to Vercel with no configuration.

### If you started from a preview version (before 2026-09-14)

- The AI chatbot and the games were removed. Delete `features.chatbot`, `features.games`,
  `botName` and `chatbot` from `content/config.json`; `npm run validate` lists them as unknown
  keys until you do.
- Run `npm install` after updating: the Next.js 16 upgrade changes most dependencies.
