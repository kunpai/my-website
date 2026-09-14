#!/usr/bin/env node
/**
 * Setup wizard: creates content/ from the examples (first run) and fills in your identity.
 *
 * Usage:
 *   npm run setup                 interactive
 *   npm run setup -- --defaults   non-interactive: install the example site as-is (demo / CI)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ROOT_DIR, CONTENT_DIR, CONFIG_PATH, PUBLIC_DIR } = require('../lib/content-paths');

const EXAMPLES_DIR = path.join(ROOT_DIR, 'examples');
const BACKUP_PATH = `${CONFIG_PATH}.bak`;

/** Copy src into dest recursively, never overwriting existing files. Returns copied paths. */
function copyMissing(src, dest) {
    const copied = [];
    if (!fs.existsSync(src)) return copied;
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(to, { recursive: true });
            copied.push(...copyMissing(from, to));
        } else if (!fs.existsSync(to)) {
            fs.copyFileSync(from, to);
            copied.push(path.relative(ROOT_DIR, to));
        }
    }
    return copied;
}

/** First run: content/ comes from examples/content; the demo's PDFs only when installing it as-is. */
function installExamples(withDemoFiles) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    const copied = [
        ...copyMissing(path.join(EXAMPLES_DIR, 'content'), CONTENT_DIR),
        ...(withDemoFiles ? copyMissing(path.join(EXAMPLES_DIR, 'public'), PUBLIC_DIR) : []),
    ];
    console.log(`Created ${copied.length} starter files from examples/.`);
}

function ask(rl, query, defaultValue = '') {
    const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
    return new Promise((resolve) => rl.question(prompt, (answer) => resolve(answer.trim() || defaultValue)));
}

function askYesNo(rl, query, defaultValue) {
    return new Promise((resolve) => {
        rl.question(`${query} (${defaultValue ? 'Y/n' : 'y/N'}): `, (answer) => {
            const clean = answer.trim().toLowerCase();
            resolve(clean ? clean === 'y' || clean === 'yes' : defaultValue);
        });
    });
}

const withArticle = (phrase) => `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`;

/** Drop keys whose value is '' so optional fields are omitted rather than empty. */
const withoutEmpty = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

const stripProtocol = (url) => url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const withProtocol = (url) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** IndexNow proves site ownership with a key file served at /<key>.txt. */
function ensureIndexNowKey() {
    const keyPath = path.join(PUBLIC_DIR, 'indexnow-key.txt');
    if (fs.existsSync(keyPath)) return;
    const key = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(keyPath, `${key}\n`);
    fs.writeFileSync(path.join(PUBLIC_DIR, `${key}.txt`), `${key}\n`);
    console.log('Created an IndexNow key in public/ (used by `npm run indexnow`).');
}

async function runWizard(config, isFreshInstall) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        console.log('--- About you ---');
        const name = await ask(rl, 'Full name', isFreshInstall ? '' : config.name);
        const defaultInitials = name.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('');
        const initials = await ask(rl, 'Monogram shown in the navbar', isFreshInstall ? defaultInitials : config.initials || defaultInitials);
        const title = await ask(rl, 'Title (e.g. PhD Student in Computer Science)', isFreshInstall ? '' : config.title);
        const institution = await ask(rl, 'Institution', isFreshInstall ? '' : config.institution);
        const institutionUrl = await ask(rl, 'Institution URL (optional)', isFreshInstall ? '' : config.institutionUrl);
        const siteUrl = withProtocol(await ask(rl, 'Your site URL', isFreshInstall ? 'https://example.com' : config.siteUrl));
        const email = await ask(rl, 'Contact email', isFreshInstall ? '' : config.email);

        console.log('\n--- Profiles (leave blank to skip) ---');
        const github = await ask(rl, 'GitHub (username or URL)', isFreshInstall ? '' : config.resume_contact?.github);
        const linkedin = await ask(rl, 'LinkedIn (username or URL)', isFreshInstall ? '' : config.resume_contact?.linkedin);
        const scholar = await ask(rl, 'Google Scholar URL', isFreshInstall ? '' : config.footerLinks?.['Google Scholar']);

        console.log('\n--- Sections ---');
        const features = config.features || {};
        const toggles = {};
        for (const [key, label, fallback] of [
            ['publications', 'Publications', true],
            ['projects', 'Projects', true],
            ['experience', 'Research & work experience', true],
            ['blogs', 'Blog', true],
            ['games', 'Games (cricket, hangman, tic-tac-toe)', false],
            ['chatbot', 'AI chatbot (needs NVIDIA_API_KEY)', false],
        ]) {
            toggles[key] = await askYesNo(rl, `Enable ${label}?`, typeof features[key] === 'boolean' ? features[key] : fallback);
        }

        console.log('\n--- Look ---');
        const accentColor = await ask(rl, 'Accent colour as hex (blank = Bootstrap default)', isFreshInstall ? '' : config.theme?.accentColor);
        const gradientEnd = accentColor
            ? await ask(rl, 'Second colour for a gradient on your name (blank = none)', isFreshInstall ? '' : config.theme?.gradientEnd)
            : '';
        rl.close();

        const githubUrl = github && withProtocol(github.includes('/') ? github : `github.com/${github}`);
        const linkedinUrl = linkedin && withProtocol(linkedin.includes('/') ? linkedin : `linkedin.com/in/${linkedin}`);
        const role = withArticle(title || 'researcher');
        const next = withoutEmpty({
            ...config,
            name,
            initials,
            title,
            homepageTitle: name,
            institution,
            institutionUrl,
            siteUrl,
            email,
            resume_contact: withoutEmpty({
                // A fresh install must not keep the example person's phone number and the like.
                ...(isFreshInstall ? {} : config.resume_contact),
                website: stripProtocol(siteUrl),
                website_url: siteUrl,
                email,
                github: githubUrl ? stripProtocol(githubUrl) : '',
                linkedin: linkedinUrl ? stripProtocol(linkedinUrl) : '',
            }),
            contactEmails: [email].filter(Boolean),
            features: { ...features, ...toggles },
            footerLinks: {
                ...(scholar ? { 'Google Scholar': scholar } : {}),
                ...(githubUrl ? { GitHub: githubUrl } : {}),
                ...(linkedinUrl ? { LinkedIn: linkedinUrl } : {}),
            },
        });
        const { accentColor: _a, gradientStart: _s, gradientEnd: _e, ...otherTheme } = config.theme || {};
        next.theme = withoutEmpty({
            ...otherTheme,
            accentColor,
            gradientStart: gradientEnd ? accentColor : '',
            gradientEnd,
        });
        if (isFreshInstall) {
            // The example's prose and profile describe Jane Doe; start from neutral values instead.
            const firstName = name.split(/\s+/)[0] || 'Site';
            Object.assign(next, withoutEmpty({
                bio: `${name} is ${role}${institution ? ` at ${institution}` : ''}.`,
                intro: `I am ${role}${institution ? ` at **${institution}**` : ''}.`,
                contactText: email ? `You can reach me at **${email.replace('@', ' AT ').replace(/\./g, ' DOT ')}**.` : '',
                blogDescription: `Posts by ${name}.`,
                botName: `${firstName}AI`,
                resume: '/CV.pdf',
                resume_short: '/Resume.pdf',
            }));
            for (const key of ['alumniOf', 'alumniOfUrl', 'authorAliases', 'knowsAbout', 'chatbot']) delete next[key];
        }
        return next;
    } catch (err) {
        rl.close();
        throw err;
    }
}

async function main() {
    const isDefaults = process.argv.includes('--defaults');
    const isFreshInstall = !fs.existsSync(CONFIG_PATH);

    console.log('\nAcademic site setup\n');
    if (isFreshInstall) installExamples(isDefaults);
    if (isDefaults) {
        console.log('Installed the example site as-is (--defaults). Edit content/ to make it yours.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const next = await runWizard(config, isFreshInstall);

    if (!isFreshInstall) {
        fs.copyFileSync(CONFIG_PATH, BACKUP_PATH);
        console.log(`\nBacked up the previous config to ${path.relative(ROOT_DIR, BACKUP_PATH)}`);
    }
    fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(next, null, 4)}\n`);
    console.log(`Wrote ${path.relative(ROOT_DIR, CONFIG_PATH)}`);
    ensureIndexNowKey();

    console.log(`
Next steps
  1. Replace the example entries in content/data/*.json with yours (see docs/CONTENT.md), and
     review publicationCategories / categoryDescriptions in content/config.json to match.
     Your editor autocompletes fields; \`npm run validate\` checks them.
  2. Write content/about.md and your posts in content/blogs/.
  3. Put your photo in public/images/ and set "image" in content/config.json.
  4. Build your CV/resume PDFs: python3 scripts/generate_resumes.py (needs LaTeX),
     or push to GitHub and let the "Build Resumes" workflow do it.
  5. npm run dev
`);
}

main().catch((err) => {
    console.error('Setup failed:', err.message || err);
    process.exit(1);
});
