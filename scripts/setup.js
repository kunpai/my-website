#!/usr/bin/env node
/**
 * Setup wizard: creates content/ from the examples (first run) and fills in your identity.
 * Re-running it on an existing site only changes the answers you change.
 *
 * Usage:
 *   npm run setup                 interactive
 *   npm run setup -- --defaults   non-interactive: install the example site as-is (demo / CI)
 *   node scripts/setup.js --ensure  silent unless content/ is missing, then same as --defaults
 *                                   (runs before dev/build, so a fresh clone or a Vercel
 *                                   deploy of the template shows the example site)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ROOT_DIR, CONTENT_DIR, CONFIG_PATH, PUBLIC_DIR, resolveSiteUrl } = require('../lib/content-paths');

const EXAMPLES_DIR = path.join(ROOT_DIR, 'examples');

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

/**
 * First run: content/ comes from examples/content, plus the images its entries point at.
 * The demo's CV/resume PDFs are only copied when installing the example site as-is.
 */
function installExamples(withDemoFiles) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    const copied = [
        ...copyMissing(path.join(EXAMPLES_DIR, 'content'), CONTENT_DIR),
        ...copyMissing(path.join(EXAMPLES_DIR, 'public', 'images'), path.join(PUBLIC_DIR, 'images')),
        ...(withDemoFiles ? copyMissing(path.join(EXAMPLES_DIR, 'public'), PUBLIC_DIR) : []),
    ];
    console.log(`Created ${copied.length} starter files from examples/.`);
}

const withArticle = (phrase) => `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`;
/** Drop keys whose value is '' or undefined so optional fields are omitted rather than empty. */
const withoutEmpty = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));
const stripProtocol = (url) => url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const withProtocol = (url) => (!url || /^https?:\/\//.test(url) ? url : `https://${url}`);
const profileUrl = (value, host) => value && withProtocol(value.includes('/') ? value : `${host}/${value}`);

/** IndexNow proves site ownership with a key file served at /<key>.txt. */
function ensureIndexNowKey() {
    const keyPath = path.join(PUBLIC_DIR, 'indexnow-key.txt');
    if (fs.existsSync(keyPath)) return;
    const key = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(keyPath, `${key}\n`);
    fs.writeFileSync(path.join(PUBLIC_DIR, `${key}.txt`), `${key}\n`);
    console.log('Created an IndexNow key in public/ (used by `npm run indexnow`).');
}

/** Ask every question; resolves to { key: { value, changed } } without writing anything. */
async function collectAnswers(config, isFreshInstall) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let finished = false;
    rl.on('close', () => {
        if (!finished) {
            console.log('\nSetup cancelled; nothing was written.');
            process.exit(1);
        }
    });
    const answers = {};
    // On a fresh install nothing is prefilled from the example; on a re-run the current value is.
    const ask = (key, query, current = '', { required = false } = {}) => new Promise((resolve) => {
        const shown = isFreshInstall ? '' : current || '';
        const prompt = shown ? `${query} [${shown}]: ` : `${query}: `;
        rl.question(prompt, (raw) => {
            const value = raw.trim() || shown;
            if (required && !value) {
                console.log('  This one is required.');
                resolve(ask(key, query, current, { required }));
                return;
            }
            answers[key] = { value, changed: isFreshInstall || value !== shown };
            resolve(value);
        });
    });
    const askYesNo = (key, query, current) => new Promise((resolve) => {
        rl.question(`${query} (${current ? 'Y/n' : 'y/N'}): `, (raw) => {
            const clean = raw.trim().toLowerCase();
            const value = clean ? clean === 'y' || clean === 'yes' : current;
            answers[key] = { value, changed: value !== current };
            resolve(value);
        });
    });

    const contact = config.resume_contact || {};
    console.log('--- About you ---');
    const name = await ask('name', 'Full name', config.name, { required: true });
    const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('');
    await ask('initials', `Monogram shown in the navbar${isFreshInstall ? ` (blank = ${initials})` : ''}`, config.initials || initials);
    if (!answers.initials.value) answers.initials = { value: initials, changed: true };
    await ask('title', 'Title (e.g. PhD Student in Computer Science)', config.title);
    await ask('institution', 'Institution', config.institution);
    await ask('institutionUrl', 'Institution URL (optional)', config.institutionUrl);
    await ask('siteUrl', 'Your site URL (e.g. https://jane.example.com)', resolveSiteUrl(config));
    await ask('email', 'Contact email', config.email);

    console.log('\n--- Profiles (leave blank to skip) ---');
    await ask('github', 'GitHub (username or URL)', contact.github);
    await ask('linkedin', 'LinkedIn (username or URL)', contact.linkedin);
    await ask('scholar', 'Google Scholar URL', config.footerLinks?.['Google Scholar']);

    console.log('\n--- Sections ---');
    const features = config.features || {};
    for (const [key, label, fallback] of [
        ['publications', 'Publications', true],
        ['projects', 'Projects', true],
        ['experience', 'Research & work experience', true],
        ['blogs', 'Blog', true],
    ]) {
        await askYesNo(`feature:${key}`, `Enable ${label}?`, typeof features[key] === 'boolean' ? features[key] : fallback);
    }

    console.log('\n--- Look ---');
    await ask('accentColor', 'Accent colour as hex (blank = Bootstrap default)', config.theme?.accentColor);
    if (answers.accentColor.value) {
        await ask('gradientEnd', 'Second colour for a gradient on your name (blank = none)', config.theme?.gradientEnd);
    }
    finished = true;
    rl.close();
    return answers;
}

/** Apply answers to the config: everything on a fresh install, only changed answers otherwise. */
function applyAnswers(config, answers, isFreshInstall) {
    const next = { ...config };
    const changed = (key) => answers[key]?.changed;
    const value = (key) => answers[key]?.value ?? '';
    const set = (key, v) => { if (v === '' || v === undefined) delete next[key]; else next[key] = v; };

    for (const key of ['name', 'initials', 'title', 'institution', 'institutionUrl']) {
        if (changed(key)) set(key, value(key));
    }
    if (changed('name')) next.homepageTitle = value('name');
    const siteUrl = withProtocol(value('siteUrl'));
    if (changed('siteUrl')) set('siteUrl', siteUrl);
    if (changed('email')) {
        set('email', value('email'));
        next.contactEmails = [value('email')].filter(Boolean);
    }

    // A fresh install must not keep the example person's phone number and the like.
    const contact = { ...(isFreshInstall ? {} : config.resume_contact) };
    if (changed('siteUrl')) Object.assign(contact, { website: siteUrl && stripProtocol(siteUrl), website_url: siteUrl });
    if (changed('email')) contact.email = value('email');
    const githubUrl = profileUrl(value('github'), 'github.com');
    const linkedinUrl = profileUrl(value('linkedin'), 'linkedin.com/in');
    if (changed('github')) contact.github = githubUrl && stripProtocol(githubUrl);
    if (changed('linkedin')) contact.linkedin = linkedinUrl && stripProtocol(linkedinUrl);
    next.resume_contact = withoutEmpty(contact);

    const links = { ...(isFreshInstall ? {} : config.footerLinks) };
    const setLink = (label, url) => { if (url) links[label] = url; else delete links[label]; };
    if (changed('scholar')) setLink('Google Scholar', value('scholar'));
    if (changed('github')) setLink('GitHub', githubUrl);
    if (changed('linkedin')) setLink('LinkedIn', linkedinUrl);
    next.footerLinks = links;

    next.features = { ...(config.features || {}) };
    for (const [key, answer] of Object.entries(answers)) {
        if (key.startsWith('feature:')) next.features[key.slice('feature:'.length)] = answer.value;
    }

    if (changed('accentColor') || changed('gradientEnd')) {
        const { accentColor: _a, gradientStart: _s, gradientEnd: _e, ...otherTheme } = config.theme || {};
        const accent = value('accentColor');
        const gradientEnd = accent ? value('gradientEnd') : '';
        next.theme = withoutEmpty({ ...otherTheme, accentColor: accent, gradientStart: gradientEnd ? accent : '', gradientEnd });
    }

    if (isFreshInstall) {
        // The example's prose and profile describe Jane Doe; start from neutral values instead.
        const name = value('name');
        const role = withArticle(value('title') || 'researcher');
        const institution = value('institution');
        const email = value('email');
        Object.assign(next, withoutEmpty({
            bio: `${name} is ${role}${institution ? ` at ${institution}` : ''}.`,
            intro: `I am ${role}${institution ? ` at **${institution}**` : ''}.`,
            contactText: email ? `You can reach me at **${email.replace('@', ' AT ').replace(/\./g, ' DOT ')}**.` : '',
            blogDescription: `Posts by ${name}.`,
            resume: '/CV.pdf',
            resume_short: '/Resume.pdf',
            image: '/images/placeholder.png', // the example avatar is Jane Doe's
        }));
        for (const key of ['alumniOf', 'alumniOfUrl', 'authorAliases', 'knowsAbout']) delete next[key];
    }
    return next;
}

async function main() {
    const isDefaults = process.argv.includes('--defaults');
    const isFreshInstall = !fs.existsSync(CONFIG_PATH);

    if (process.argv.includes('--ensure')) {
        if (isFreshInstall) {
            installExamples(true);
            console.log('No content/ yet, so the example site was installed. Run `npm run setup` to make it yours.');
        }
        return;
    }

    console.log('\nAcademic site setup\n');
    if (isDefaults) {
        if (!isFreshInstall) {
            console.log('content/config.json already exists, so there is nothing to install (--defaults only sets up a fresh copy).');
            return;
        }
        installExamples(true);
        console.log('Installed the example site as-is. Edit content/ to make it yours.');
        return;
    }

    const configSource = isFreshInstall ? path.join(EXAMPLES_DIR, 'content', 'config.json') : CONFIG_PATH;
    const config = JSON.parse(fs.readFileSync(configSource, 'utf8'));
    const answers = await collectAnswers(config, isFreshInstall);
    const next = applyAnswers(config, answers, isFreshInstall);

    // Nothing is written until every question has been answered.
    if (isFreshInstall) {
        installExamples(false);
    } else {
        const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
        const backup = `${CONFIG_PATH}.bak-${stamp}`;
        fs.copyFileSync(CONFIG_PATH, backup);
        console.log(`\nBacked up the previous config to ${path.relative(ROOT_DIR, backup)}`);
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
