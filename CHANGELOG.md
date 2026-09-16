# Changelog

All notable changes to the template. Your site records the release it came from in
`.template-version`; `npm run update` brings in everything listed above that release.

## 1.2.0 (2026-09-16)

- **Links inside bullets.** Experience and project `description` lines are now rendered as
  markdown, so `[text](url)` becomes an inline link that opens in a new tab. The resumes already
  turned such links into `\href`, so a bullet now reads the same on the site and in the PDFs.
- **Link button labels.** A `links` key containing the word "Resources" (for example
  `"Docs: gem5 Resources"`) no longer shows as a GitHub "Code" button; only a whole word
  `source` (as in `"View Source"`) does.
- **Resume workflow race fix.** If you push twice within a couple of minutes, the resume build
  triggered by the first push used to fail with "Updates were rejected" when it tried to commit
  the regenerated PDFs. Runs now queue one after another and rebase the bot commit before
  pushing.
- **Plain-text `pages/index.js`.** The awards grouping key used a literal NUL byte, which made
  `grep`, `file` and GitHub diffs treat the file as binary. It is now the `\u0000` escape.

Nothing to do after updating beyond `npm run update`. If you customised
`components/experience.js` or `.github/workflows/build-resume.yml`, expect a merge conflict there.

## 1.1.2 (2026-09-14)

- **Skills section text.** Category names now use the same size and weight as the award titles
  instead of small uppercase lettering, and the skill pills are the same size as the pills on
  experience and project cards.

Nothing to do after updating beyond `npm run update`.

## 1.1.1 (2026-09-14)

- **Resume fix.** A backslash that isn't a LaTeX command (for example `C:\>DIR`) and `<` or `>`
  outside `$...$` math now print as written in the PDFs. Before, a stray backslash could break the
  LaTeX build and `<`/`>` printed as "¡" and "¿". Intentional LaTeX such as `\textbf{...}`, `\&` and
  `$\times$` is unchanged.
- **"Service" heading.** The homepage section formerly titled "Academic Services" is now "Service",
  matching the CV.

Nothing to do after updating beyond `npm run update`.

## 1.1.0 (2026-09-14)

- **Compact Skills section.** Each category is one row: a small label and the skills as pill
  badges, instead of a full-size heading per category. Keys containing `and` now display it as
  "&" (`tools-and-technologies` → "Tools & Technologies"); `labels.skillCategories` still wins.
- **Compact Awards section.** Each award is one row with a small trophy, the title, the awarder
  and the date on the right. Awards with the same title and awarder (for example, a Dean's List
  entry for every term) are grouped into one row listing all their dates, as the resumes already do.

Nothing to do after updating beyond `npm run update`. If you customised the Skills or Awards markup
in `pages/index.js` or `styles/globals.css`, expect a merge conflict there.

## 1.0.1 (2026-09-14)

- **Credits.** The README now credits [Parth Shah](https://helloparthshah.vercel.app/) and
  [Harshil Patel](https://harshilpatel.vercel.app/), who helped build the original site this
  template grew out of, and the repository history lists them as co-authors.
- **`npm run update` fix.** When two template releases carried the same `.template-version`
  stamp, the first update could start from the newer one and skip a change. It now starts from
  the oldest match, which is always safe.

Nothing to do after updating beyond `npm run update`.

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
- If example entries show broken images, copy the example artwork in once:
  `cp -n examples/public/images/* public/images/` (setup does this for new sites now).
