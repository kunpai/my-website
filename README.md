# Academic & Researcher Portfolio Template 🚀

A modern, high-performance, and fully configurable personal portfolio website designed for PhD students, researchers, professors, and software engineers. Built with **Next.js 13**, **React**, **Bootstrap**, and **LaTeX**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkunpai%2Fmy-website)

---

## ✨ Features

- ⚙️ **100% Config-Driven**: Control name, title, bio, SEO, social links, and theme accents from a single [`website.config.json`](website.config.json).
- 🧭 **Modular Navigation & Feature Toggles**: Easily enable or disable sections (`publications`, `projects`, `workExperience`, `blogs`, `games`, `chatbot`) with a boolean switch.
- 📄 **Automated LaTeX Resume & CV Generator**: Keep your resume and CV synced with your JSON data. Generates formatted LaTeX files and compiles production-ready PDFs via Python and GitHub Actions.
- 📊 **Interactive SVG Research Graph**: Clustered research topics and publication graph that dynamically computes layout from your data.
- 📝 **Markdown Blog & RSS Feed**: Write articles in `public/blogs/*.md` with syntax highlighting, automatic reading time, and an auto-generated RSS 2.0 feed (`public/rss.xml`).
- 🤖 **AI Search & LLM Ready**: Automatically generates `public/llms.txt`, `public/llms-full.txt`, and JSON-LD schema for Perplexity, ChatGPT, and search crawlers.
- 🎨 **Adaptive Light/Dark Mode**: Built-in system preference detection, theme toggler, and customizable CSS color variables.

---

## ⚡ Quickstart

### 1. Clone or Use as Template
Click **"Use this template"** above or clone the repository:
```bash
git clone https://github.com/kunpai/my-website.git my-portfolio
cd my-portfolio
npm install
```

### 2. Run the Interactive Setup Wizard
Run the built-in CLI to personalize your website configuration:
```bash
npm run setup
```
This wizard will prompt for your name, institution, contact links, feature selections, and theme colors, automatically updating `website.config.json`.

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```text
├── website.config.json        # Main configuration (identity, SEO, features, theme)
├── website.config.example.json# Documented configuration template
├── public/
│   ├── about.md               # User-editable About page content
│   ├── blogs/                 # Markdown blog posts
│   ├── jsons/                 # Structured portfolio data
│   │   ├── education.json
│   │   ├── projects.json
│   │   ├── publications.json
│   │   ├── work-experience.json
│   │   ├── skills.json
│   │   └── examples/          # Minimal starter examples for new users
│   └── latex_src/             # Generated LaTeX resume files
├── scripts/
│   ├── setup.js               # Interactive setup wizard CLI (npm run setup)
│   ├── generate_resumes.py    # Generates & compiles LaTeX CV/Resume from JSON
│   ├── generate_llms_txt.js   # Generates llms.txt and llms-full.txt
│   └── generate_rss.js        # Generates public/rss.xml
├── pages/                     # Next.js routes
└── components/                # Modular React UI components
```

---

## 🛠️ Customization Guide

### 1. Enabling or Disabling Sections
In `website.config.json`, toggle any section under `features`:
```json
"features": {
    "about": true,
    "projects": true,
    "publications": true,
    "workExperience": true,
    "blogs": true,
    "games": false,
    "chatbot": false,
    "researchGraph": true
}
```
Disabling a feature automatically updates the topbar navigation and hides the corresponding homepage section.

### 2. Customizing Theme & Accent Colors
Personalize brand colors without writing CSS:
```json
"theme": {
    "accentColor": "#0d6efd",
    "gradientStart": "#0d6efd",
    "gradientEnd": "#00d2ff"
}
```

### 3. Updating Publications & Research
Add entries to `public/jsons/publications.json`:
```json
{
    "title": "Your Paper Title",
    "authors": ["Your Name", "Co-author Name"],
    "conference": "Conference or Journal Name (ISCA '26)",
    "date": "June 2026",
    "type": "Conference",
    "tags": ["Machine Learning", "Computer Architecture"],
    "links": [
        { "label": "Paper", "url": "https://arxiv.org/..." },
        { "label": "Code", "url": "https://github.com/..." }
    ],
    "bibtex": "@inproceedings{...}"
}
```

### 4. Compiling LaTeX Resumes
To generate and compile your CV and Resume PDFs locally:
```bash
python3 scripts/generate_resumes.py
```
*(Requires a local LaTeX installation such as `pdflatex` or MacTeX. In GitHub, this compiles automatically via GitHub Actions on every push.)*

### 5. Writing Blog Posts
Create a markdown file in `public/blogs/my-first-post.md`:
```markdown
---
title: "My First Blog Post"
date: "2026-09-15"
description: "A summary of my latest research findings."
tags: ["Systems", "Research"]
authors: ["Your Name"]
image: "/images/blog-cover.jpg"
---

Your content here in standard Markdown...
```

---

## 🚢 Deployment

### Deploy with Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. The default Next.js build settings will build and deploy your site automatically.

### Automated GitHub Actions
This repository includes `.github/workflows/auto-resume-and-llm.yml` which automatically compiles your LaTeX resumes and generates `llms.txt` and `rss.xml` upon each push to `main`.

---

## 📄 License
Open source and available under the [MIT License](LICENSE). Contributions, forks, and suggestions are welcome!
