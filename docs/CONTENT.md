# Content reference

Everything that makes the site *yours* is in `content/` and `public/`. You never need to edit the
site code to change what it shows. This page lists every file and field the code reads.

The JSON Schemas in `schemas/` are the source of truth for this page. VS Code picks them up through
`.vscode/settings.json`, so you get autocomplete and hover docs in the content files.

Check your content before you build:

```bash
npm run validate                                      # checks content/ and public/
node scripts/validate-content.js --content-dir examples/content   # checks another folder
```

It prints one line per problem (`content/data/projects.json [2] "My Project": missing required property "start"`)
and exits with 1 if anything would break the build.

## What lives where

| Path | What it is |
|---|---|
| `content/config.json` | Your name, links, feature flags, labels, theme. |
| `content/data/*.json` | One file per section: publications, projects, experience, and so on. |
| `content/about.md` | The `/about` page (Markdown). |
| `content/blogs/*.md` | Blog posts. The file name is the URL: `hello-world.md` becomes `/blogs/hello-world`. |
| `public/` | Files served as-is: your photo, logos, CV PDFs, slides. `public/images/me.jpg` is referenced as `/images/me.jpg`. |
| `examples/content/` | A complete example site for the fictional Jane Doe. `npm run setup` copies it to `content/`. |
| `schemas/` | JSON Schemas for `config.json` and each data file. |

Rules that apply everywhere:

- **Every data file must exist**, even for sections you turned off: the site imports all of them when it builds.
  To leave a section empty, use `[]` (or `{}` for `skills.json`).
- **Image fields** (`image` in config, data entries and blog posts) are paths under `public/` that start
  with `/`. They are rendered with `next/image`, so remote URLs and paths without the leading slash break the page.
- **Dates** in data files are free text, shown exactly as you write them (`"Sep 2024"`, `"Present"`).
- **Markdown** works in `config.intro`, `news.json`, `talks.json`, service item names, `about.md` and blog posts.
- **Resume fields** (`resume_*`) are LaTeX: `&`, `%`, `_` and `$` are escaped for you, and other commands such as
  `\\textbf{...}` (written with a double backslash in JSON) pass through.
- Extra fields in data entries are ignored, so you can keep your own notes there. (In `config.json` the validator warns
  about unknown keys, since those are usually typos such as `siteURL`.)

### Visibility flags

Most data entries accept these booleans:

| Field | Default | Effect |
|---|---|---|
| `show_on_website` | `true` | `false` hides the entry on the site's pages, search and topic graph, and leaves it out of `llms.txt`, `llms-full.txt` and the chatbot. The resume uses its own flags below. |
| `show_on_homepage` | `true` | `projects.json` and `work-experience.json` only: `false` lists the entry on `/projects` or `/work-experiences` but not on the homepage. |
| `show_in_resume` | `true` | Include in the full CV built by `scripts/generate_resumes.py`. |
| `show_in_resume_short` | `false` (`true` for education) | Include in the short resume. |

---

## config.json

Only `name` is required. Everything else has a sensible default.

### Identity

| Field | Type | Meaning |
|---|---|---|
| `name` | string, **required** | Your full name: hero, page titles, metadata. Publication authors containing its first and last word are highlighted. |
| `initials` | string | Navbar monogram. Default: first letter of each word of `name`. |
| `title` | string | Job title, e.g. `"PhD Student in Computer Science"`. |
| `homepageTitle` | string | Browser title of the homepage. Default: `"<name> — <title>"`. |
| `bio` | string | One-paragraph third-person bio: default meta description and JSON-LD description. |
| `intro` | Markdown | Hero text under your name. |
| `image` | path | Profile photo, e.g. `"/images/me.jpg"`. Default: `/images/placeholder.png`. |
| `favicon` | path or URL | Default: `/images/favicon.ico`. |
| `institution`, `institutionUrl` | string, URL | Current institution (structured data for search engines). |
| `alumniOf`, `alumniOfUrl` | string, URL | Previous institution (structured data). |
| `knowsAbout` | string[] | Research areas (structured data). |
| `authorAliases` | string[] | Other spellings of your name in author lists, e.g. `["J. Doe"]`. Exact, case-insensitive match. |

### Site, contact and footer

| Field | Type | Meaning |
|---|---|---|
| `siteUrl` | URL | Where the site is deployed, **no trailing slash**: `"https://janedoe.example.com"`. Used for canonical URLs, sitemap, RSS, llms.txt. Falls back to `resume_contact.website_url`. |
| `email` | email | The `/contact` form sends here; the chatbot quotes it. |
| `contactText` | string | Paragraph on `/contact`. Only `**bold**` is supported. Default: a sentence with `email`. |
| `contactEmails` | string[] | Written by `npm run setup`; not displayed. Put addresses in `contactText`. |
| `footerLinks` | object | Label → URL, e.g. `{"Google Scholar": "https://…", "GitHub": "https://…"}`. Also listed in llms.txt; labels without "source" become JSON-LD `sameAs` profiles. |
| `footerText` | string | Small print at the bottom of every page. |
| `blogDescription` | string | Meta description of `/blogs` and the RSS feed. |

### Resumes

`scripts/generate_resumes.py` builds a full CV and a short resume from your data files.

| Field | Type | Meaning |
|---|---|---|
| `resume` | path | Full CV, e.g. `"/Jane_Doe_CV.pdf"`. Shows a download button in the hero; the generator writes the PDF here. |
| `resume_short` | path | Short resume, e.g. `"/Jane_Doe_Resume.pdf"`. Second hero button. |
| `resume_contact.website` | string | Shown on the resume, without `https://`: `"janedoe.example.com"`. |
| `resume_contact.website_url` | URL | Default: `https://<website>`. |
| `resume_contact.email` | email | |
| `resume_contact.phone` | string | Optional. |
| `resume_contact.github` | string | Without `https://`: `"github.com/janedoe"`. |
| `resume_contact.linkedin` | string | Without `https://`: `"linkedin.com/in/janedoe"`. |

### Publications topic graph

| Field | Type | Meaning |
|---|---|---|
| `publicationCategories` | string[] | The graph's category nodes (use 3–4). Each should also be a tag on your papers. Default: your 3 most frequent tags. |
| `categoryDescriptions` | object | Category → sentence shown when hovering the node. |

### Feature flags

`features` turns sections on or off; omitted keys use the default. Turning a feature off removes its
homepage section and navigation link, makes its routes return 404 and drops them from the sitemap.
llms.txt, RSS, the search box and the chatbot skip it too.

| Key | Default | Controls | Routes |
|---|---|---|---|
| `about` | on | About page from `content/about.md` | `/about` |
| `publications` | on | Publications on the homepage and their page, navbar search | `/publications` |
| `researchGraph` | on | Topic graph on `/publications` | — |
| `projects` | on | Projects section and page | `/projects` |
| `experience` | on | Experience section and page (`work-experience.json`); research and teaching experience in llms-full.txt and the chatbot | `/work-experiences` |
| `education` | on | Education section | — |
| `blogs` | on | Blog and RSS feed | `/blogs`, `/blogs/*` |
| `news` | on | News list | — |
| `talks` | on | Talks & Presentations list | — |
| `services` | on | Academic Services section | — |
| `skills` | on | Skills section | — |
| `awards` | on | Awards section | — |
| `contact` | on | Contact page with a mailto form | `/contact` |
| `games` | off | Games menu (cricket, hangman, tic-tac-toe) | `/games/*` |
| `chatbot` | off | Floating AI assistant; needs the `NVIDIA_API_KEY` environment variable | `/api/chat` (403 when off) |
| `linktree` | off | Link-in-bio pages from `linktree.json` | `/linktree`, `/linktree/*` |

### Chatbot

| Field | Default | Meaning |
|---|---|---|
| `botName` | `"<first name>AI"` | Name used in the greeting. |
| `chatbot.title` | `"AI Assistant"` | Chat window title. |
| `chatbot.model` | `"meta/llama-3.1-8b-instruct"` | NVIDIA NIM model id. |
| `chatbot.availability` | `""` | Your current availability, given to the bot as context. |

### Labels

`labels` overrides UI text; omitted keys keep their default.

| Key | Default |
|---|---|
| `resumeButton` | `"Download Full Resume"` |
| `resumeShortButton` | `"Download Short Resume"` |
| `experienceTitle` | `"Research & Professional Experience"` |
| `footerHeading` | `"Connect with Me"` |
| `contactHeading` | `"Get in Touch"` |
| `contactIntro` | A friendly invitation to reach out. |
| `skillCategories` | `{}`: display names for `skills.json` keys, e.g. `{"ml-and-data": "ML & Data"}`. Unlisted keys are title-cased (`programming-languages` → "Programming Languages"). |

### Theme

With no colours set, the site uses Bootstrap's default palette.

| Key | Meaning |
|---|---|
| `headingFont` | Any Google Fonts family for headings. Default `"Audiowide"`. |
| `accentColor` | Hex colour (`#2f6fed` or `#26e`) for links and primary buttons. |
| `gradientStart`, `gradientEnd` | Hex colours for the gradient on your name. Set both. `gradientEnd` is also the link hover colour. |

### Deprecated keys

Still honoured, with a warning from the validator:

| Old | New |
|---|---|
| `features.workExperience` | `features.experience` |
| `enableChatbot` (top level) | `features.chatbot` |

### Example

```json
{
    "name": "Jane Doe",
    "title": "PhD Student in Computer Science",
    "siteUrl": "https://janedoe.example.com",
    "email": "jane.doe@example.com",
    "image": "/images/placeholder.png",
    "intro": "I am a PhD student at **Example University**, advised by [Prof. Ada Advisor](https://example.org/ada-advisor).",
    "resume": "/Jane_Doe_CV.pdf",
    "footerLinks": { "Google Scholar": "https://scholar.example.org/janedoe" },
    "publicationCategories": ["Machine Learning", "Systems", "Software Engineering"],
    "features": { "games": false, "chatbot": false, "linktree": false },
    "theme": { "accentColor": "#2f6fed", "gradientStart": "#2f6fed", "gradientEnd": "#14b8a6" }
}
```

`examples/content/config.json` uses every key.

---

## Data files

Every file below is a JSON array of entries, except `skills.json`, which is an object. Entries appear in file order, so put the newest first.

### publications.json

Shown on `/publications` (tabs per `type`, topic graph, Cite button), on the homepage (type `conference` only), in the navbar search, llms.txt and the resumes.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `title` | string | yes | Paper title. |
| `authors` | string[] | yes | In order. Your name is underlined in bold (see `name`, `authorAliases`). |
| `type` | string | yes | Lowercase. `conference` (tab "Papers"), `workshop`, `preprint`, `poster`; other lowercase values get their own tab. |
| `conference` | string | | Venue, shown in bold and on the resumes. |
| `description` | string | | Short summary; searchable. |
| `tags` | string[] | | Topics. Tags listed in `publicationCategories` are graph categories; the rest become subtopics linked to the categories they appear with. |
| `links` | object | | Button label → URL, e.g. `{"View Publication": "…", "View Pre-Print": "…", "View Source": "…"}`. **An object, not an array.** |
| `bibtex` | string | | Shown by Cite (`\n` for line breaks). A `doi = {…}` becomes the resume link. Generated when absent. |
| `badge` | string | | Highlight such as `"Spotlight"` or `"Best Paper"`, also on the resumes. |
| `resume_link` | URL | | Resume title link. Default: the DOI in `bibtex`, then `View Publication`, `View Pre-Print`, `View Source`, `View Artifact`, then the first link. |
| `date` | string | | Only for the year of the generated BibTeX. |
| visibility | | | `show_on_website`, `show_in_resume`, `show_in_resume_short`. |

Legacy fields still read: `spotlight` (`true` or a string, same as `badge`) and `link` (single URL for the generated BibTeX).

```json
{
    "title": "Stress-Testing Image Classifiers Under Realistic Distribution Shift",
    "authors": ["Jane Doe", "John Roe", "Ada Advisor"],
    "type": "conference",
    "conference": "Example Conference on Learning Systems (ECLS 2025)",
    "description": "A benchmark of 40 natural distribution shifts.",
    "tags": ["Machine Learning", "Robustness", "Benchmarking"],
    "links": { "View Publication": "https://example.org/papers/stress-testing" },
    "bibtex": "@inproceedings{doe2025stress,\n  title={Stress-Testing ...},\n  year={2025}\n}",
    "badge": "Spotlight",
    "show_in_resume_short": true
}
```

### projects.json

Shown on the homepage and `/projects`, and in the resumes' Project Experience section.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `title` | string | yes | Project name. |
| `start`, `end` | string | yes | Free text, e.g. `"Jan 2024"`, `"Present"`. |
| `description` | string | yes | One bullet per line (`\n`). `""` shows "In progress". A string, not an array. |
| `organization` | string | | Lab or organization, shown under the image. |
| `image` | path | | Banner image. Default: placeholder. |
| `skills` | string[] | | Badges. |
| `links` | object | | Button label → URL. The resume links the title to `GitHub`, `Website`, `Poster` or `Paper` (first found). |
| `collaborators` | `{name, link}[]` | | Shown as "Collaborators: …". `name` is required. |
| `location` | string | | |
| `resume_title` | string | | Title on the resumes. |
| `resume_link` | URL | | Resume title link. |
| `resume_type`, `resume_type_short` | string | | Right-hand label on the resume heading (e.g. `"Research Project"`); `_short` for the short resume. |
| `resume_skills` | string | | Comma-separated skills in one string. The detailed heading needs both `resume_type` and `resume_skills`. |
| `resume_description`, `resume_short_description` | string[] | | Resume bullets. Default: the lines of `description`. |
| visibility | | | `show_on_website`, `show_on_homepage`, `show_in_resume`, `show_in_resume_short`. |

```json
{
    "title": "ShiftBench",
    "start": "Jan 2024",
    "end": "Present",
    "description": "Collected 40 natural distribution shifts.\nBuilt a nightly leaderboard.",
    "skills": ["Python", "PyTorch"],
    "links": { "GitHub": "https://example.com/janedoe/shift-bench" },
    "image": "/images/placeholder.png",
    "collaborators": [{ "name": "John Roe", "link": "https://example.org/john-roe" }]
}
```

### work-experience.json

The Experience section on the homepage and `/work-experiences` (heading: `labels.experienceTitle`), and the resumes.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `title` | string | yes | Your role. |
| `organization` | string | yes | Company, lab or university. **Not** `company`. |
| `start`, `end` | string | yes | Free text. |
| `description` | string | yes | One bullet per line (`\n`). |
| `location` | string | | |
| `image` | path | | Logo, shown as a circle. |
| `skills`, `links`, `collaborators` | | | As in projects. |
| `resume_organization` | string | | Shorter organization name for the resumes. |
| `resume_type`, `resume_skills` | string | | Detailed full-CV heading (both needed). |
| `resume_description`, `resume_short_description` | string[] | | Resume bullets. |
| visibility | | | `show_on_website`, `show_on_homepage`, `show_in_resume`, `show_in_resume_short`. |

```json
{
    "title": "Graduate Student Researcher",
    "organization": "Reliable ML Lab, Example University",
    "start": "Sep 2023",
    "end": "Present",
    "location": "Example City, CA",
    "image": "/images/placeholder.png",
    "description": "Lead the ShiftBench benchmark.\nMentor two undergraduates."
}
```

### research-experience.json and teaching-experience.json

Same fields as `work-experience.json` (`title`, `organization`, `start`, `end`, `description` required).
These files are not shown as a page section at the moment. They feed llms-full.txt and the chatbot
when `features.experience` is on, and they are not used by the resume generator.

```json
{ "title": "Teaching Assistant, Intro to ML", "organization": "Example University", "start": "Jan 2025", "end": "Mar 2025", "description": "Ran weekly discussion sections." }
```

### education.json

The Education section and the resumes.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `university` | string | yes | Institution. |
| `degree` | string | yes | e.g. `"Ph.D."`, shown as a badge. |
| `major` | string | yes | Field of study. |
| `start` | string | yes | Free text. |
| `end` | string | | `""` shows only `start`. |
| `gpa` | string or number | | Shown on the site; on resumes as `gpa/gpa_scale` (`""` leaves it off the resumes). |
| `description` | string | | Extra line, e.g. advisor or coursework. |
| `resume_degree` | string | | Resume text. Default: `"<degree>, <major>"`. |
| `resume_gpa` | string | | e.g. `"3.9/4.0"`; overrides `gpa`/`gpa_scale`. |
| `gpa_scale` | string | | Default `"4.0"`. |
| `resume_end` | string | | End date on the resumes. `"Ongoing"` prints `Expected: <end>`. |
| `resume_details` | string | | LaTeX appended after the university, e.g. `", \\textit{with Honors}"`. |
| visibility | | | `show_on_website`, `show_in_resume`, `show_in_resume_short` (default `true`). |

```json
{ "university": "Example University", "degree": "Ph.D.", "major": "Computer Science", "start": "2023", "end": "2028", "resume_end": "Ongoing", "description": "Advisor: Prof. Ada Advisor" }
```

### awards.json

The Awards section and the full CV.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `title` | string | yes | Award name. |
| `awarder` | string | yes | Who gave it (needed by the resume generator). |
| `date` | string | yes | e.g. `"2025"`. Same title and awarder on several entries are merged into one CV line. |
| `link` | URL | | Links the awarder. |
| `badge` | string | | Highlight badge. (`spotlight` still works, as in publications.) |
| `description` | string | | Used in llms.txt. |
| visibility | | | `show_on_website`, `show_in_resume`. |

```json
{ "title": "Graduate Fellowship", "awarder": "Example University", "date": "2023-2025" }
```

### skills.json

An object. Every key except `resume_skills` is a homepage category with a list of skills. Keys are
title-cased for display unless `labels.skillCategories` names them.

`resume_skills` holds the categories for the resumes, llms.txt and the chatbot (display name → list),
plus two optional settings:

- `resume_skills_long_override`: category → list that replaces it on the full CV only.
- `resume_skills_short_merge`: `{"From": "Into"}` folds one category into another on the short resume.

```json
{
    "programming-languages": ["Python", "C++"],
    "ml-and-data": ["PyTorch", "JAX"],
    "resume_skills": {
        "Languages": ["Python", "C++"],
        "Systems": ["Slurm", "Ray"],
        "Tools": ["Git", "Docker"],
        "resume_skills_short_merge": { "Systems": "Tools" }
    }
}
```

### service.json

The Academic Services section and the full CV.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `category` | string | yes | Heading, e.g. `"Reviewer"`. |
| `items` | array | yes | Each: `name` (Markdown, required), `years` (numbers or strings), `link` (optional). |

```json
{ "category": "Reviewer", "items": [{ "name": "ECLS", "years": [2024, 2025], "link": "https://example.org/ecls" }] }
```

### news.json and talks.json

Arrays of Markdown strings, newest first. An empty array hides the section.

```json
["- **[Sep 2025]** Paper accepted at [ECLS 2025](https://example.org/ecls-2025)."]
```

### linktree.json

Link-in-bio pages at `/linktree/<path>`, e.g. for a poster QR code (only when `features.linktree` is on).
`/linktree` shows the last entry.

| Field | Type | Req. | Meaning |
|---|---|---|---|
| `path` | slug | yes | URL part: letters, digits, `-`, `_`. `archived-conferences` is reserved. |
| `title` | string | yes | Page heading. |
| `links` | `{label, url}[]` | yes | Buttons, top to bottom. |
| `authors` | string[] | | Shown under the title. |
| `conference` | string | | Event name. |
| `date` | string | | Informational. |

```json
{ "path": "ecls2025", "title": "Stress-Testing Image Classifiers", "links": [{ "label": "Paper", "url": "https://example.org/papers/stress-testing" }] }
```

---

## about.md

Plain Markdown (GitHub-flavoured, with tables, code blocks and inline HTML) for `/about`. Without the
file, the page shows placeholder text.

## Blog posts

One Markdown file per post in `content/blogs/`, starting with YAML frontmatter:

```markdown
---
title: Hello, World
date: 09/01/2025
tags:
  - website
authors:
  - Jane Doe
image: /images/placeholder.png
description: Why I set up this website.
---

Post body in Markdown.
```

| Key | Req. | Meaning |
|---|---|---|
| `title` | yes | Post title. |
| `date` | yes | `MM/DD/YYYY`. Don't write `2025-09-01` unquoted: YAML turns it into a date object the site can't render. |
| `tags` | | YAML list of strings. |
| `authors` | | YAML list of strings. |
| `image` | | Cover image path under `public/`. Default: placeholder. |
| `description` | | Meta description and RSS summary. Default: the start of the post. |

If `features.blogs` is on, `content/blogs/` must exist (it can be empty; add a `.gitkeep` to commit it).
