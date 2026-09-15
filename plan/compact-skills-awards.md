# Plan: Compact Skills and Awards Sections

## Problem

Measured on the dev server (1280px wide), the Skills and Awards sections together are about 1,470px tall.

- **Skills:** each category name is an `<h1>`, the same size as the "Skills" section title, so there is no visual hierarchy. Each category takes about 95px: a large heading plus one short line of text. "Tools And Technologies" is miscapitalised, and "Systems & Compilers" only renders correctly because of a hard-coded special case (`pages/index.js:264`).
- **Awards:** every award has three lines (title, awarder, date) and a 50px trophy icon, about 110px each. Dean's List appears as four separate cards that differ only by term. The resume generator already groups these into one line.

## Proposed layout

```
Skills
  PROGRAMMING LANGUAGES   (Python) (C++) (Java) (JavaScript)
  FRAMEWORKS              (React) (Next.js) (TensorFlow) (PyTorch) (Django)
                          (Flask) (scikit-learn) (pandas) (NumPy) (Matplotlib)
  SYSTEMS & COMPILERS     (LLVM) (Clang) (gem5)
  TOOLS & TECHNOLOGIES    (Git) (Docker) (MongoDB) (Unix/Linux) (LaTeX)
  LANGUAGES               (English) (Gujarati) (Hindi) (Spanish)

Awards
  🏆 Finalist (Agentic Financial & High-Stakes AI Advice)            2026
     Cambridge C:\>DIR Global ‘Agentic Regulator’ Hackathon
  🏆 2nd Place (Agent Safety) · UC Berkeley RDI AgentBeats            2026
  🏆 Dean's List · UC Davis College of Engineering
                        Fall 2019, Fall 2020, Winter 2022, Spring 2022
  🏆 Provost Award · UC Davis                                    2019–2023
```

At phone width (400px), each skills label sits above its list, and each award's date wraps under the awarder.

Estimated height: about 550px, a little over a third of the current height. The pills are slightly taller than plain text, and Frameworks wraps to two rows on desktop.

## Phases

### Phase 1: Skills (`pages/index.js`)

- Replace the per-category `<h1>` and `Row` blocks with a two-column grid: a small muted uppercase label and a wrapping row of pill badges.
- Render the pills with `<Badge bg="secondary">`, the same component and colour already used for tags in `components/experience.js`, `education.js` and `blogTile.js`, so skills match the rest of the site. Use flex `gap` for spacing instead of `me-1`, so wrapped rows line up.
- Replace the `systems-and-compilers` special case with a general rule for display names: `and` becomes `&`, and each word is title-cased. This gives "Tools & Technologies" and "Systems & Compilers".
- Animate the section once, instead of once per category.

### Phase 2: Awards (`pages/index.js`)

- Group awards that share both title and awarder, merging their dates. This is the same rule `generate_awards_section` uses for the resume. Each group appears where its first entry sits in the JSON.
- Show each award as one compact row: a trophy icon of about 18px inline with the text, the title in bold, the awarder in muted text (a link when `link` is set), and the date right-aligned.
- Keep the `badge` and `spotlight` pills and the spotlight trophy style.

### Phase 3: Styles (`styles/globals.css`)

- Add `.skills-grid` and `.award-row` classes with dark-mode variants, reusing the existing `.bi-trophy-fill` colour rules.
- Below 576px, stack the skills grid into one column and let award rows wrap.

### Phase 4: Verify

- Take screenshots at desktop and phone widths in light and dark mode, and compare section heights with the current 1,470px.
- Run `npm run build` to confirm the build passes.

## Risks

- **Low:** Grouped awards take the first non-empty `link`. There is no current data where grouped entries have different links.
- **Low:** Category names stop being headings, which changes the page outline slightly. This probably helps, because there will be one heading per section.
- **Low:** This fits the template-ify plan. The rendering stays data-driven, and the display-name rule replaces a hard-coded category.
- **Out of scope:** `llms.txt` and the resume output. Only the web page changes.

## Complexity: Low

The work is about 60 lines of JSX in `pages/index.js` and 40 lines of CSS, with no data changes.
