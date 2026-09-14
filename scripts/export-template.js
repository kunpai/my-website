#!/usr/bin/env node
/**
 * Export the forkable template: site code + examples/, without this site's personal content.
 *
 *   node scripts/export-template.js --out <dir>
 *
 * Only git-tracked files under an explicit allowlist are exported, so anything new (a folder of
 * slides, say) stays private until it is added here. content/ is never exported, and public/
 * only contributes the site assets listed below. As a last guard, the export fails if any
 * exported file's path or bytes mention the owner (name, emails, domain, phone, profile ids).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT_DIR, loadConfig } = require('../lib/content-paths');

// Where the template is published; mentions of it are allowed in exported files.
const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'kunpai/academic-site-template';
const TEMPLATE_PACKAGE_NAME = 'academic-site-template';

// Tracked paths that are exported (exact files, or directories ending in '/').
const EXPORTED = [
    '.eslintrc.json',
    '.github/workflows/build-resume.yml',
    '.gitignore',
    '.vscode/',
    'LICENSE',
    'README.md',
    'components/',
    'docs/',
    'examples/',
    'jsconfig.json',
    'lib/',
    'middleware.js',
    'next-sitemap.config.js',
    'next.config.js',
    'package-lock.json',
    'package.json',
    'pages/',
    'public/images/favicon.ico',
    'public/images/placeholder.png',
    'schemas/',
    'scripts/',
    'styles/',
];
// Exceptions inside exported directories.
const NOT_EXPORTED = ['scripts/export-template.js'];

// Marked blocks in text files that only make sense in this repo (e.g. README banner).
const PERSONAL_BLOCK = /<!-- personal-only:start -->[\s\S]*?<!-- personal-only:end -->\n?/g;
const TEXT_EXT = /\.(js|jsx|json|md|css|yml|yaml|txt|tex|py|html|svg|xml)$|^(LICENSE|\.gitignore)$/;

function parseArgs() {
    const i = process.argv.indexOf('--out');
    const out = i > -1 ? process.argv[i + 1] : null;
    if (!out) {
        console.error('Usage: node scripts/export-template.js --out <dir>');
        process.exit(2);
    }
    return path.resolve(out);
}

/** Resolve symlinks (e.g. /tmp -> /private/tmp) through the deepest existing ancestor of p. */
function realpathLoose(p) {
    let existing = p;
    while (!fs.existsSync(existing)) existing = path.dirname(existing);
    return path.join(fs.realpathSync(existing), path.relative(existing, p));
}

/** True for a directory holding a previous export (safe to replace). */
function isPreviousExport(dir) {
    try {
        return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name === TEMPLATE_PACKAGE_NAME;
    } catch {
        return false;
    }
}

/** Refuse locations overlapping the repo, or existing non-empty folders that aren't an export. */
function prepareOutDir(outDir) {
    const out = realpathLoose(outDir).toLowerCase();
    const root = fs.realpathSync(ROOT_DIR).toLowerCase();
    if (out === root || out.startsWith(root + path.sep) || root.startsWith(out + path.sep)) {
        console.error('Choose an --out directory outside the repository (and not one of its parents).');
        process.exit(2);
    }
    if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) {
        if (!isPreviousExport(outDir)) {
            console.error(`${outDir} is not empty and doesn't hold a previous export; choose an empty or new directory.`);
            process.exit(2);
        }
        fs.rmSync(outDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outDir, { recursive: true });
}

function trackedFiles() {
    const out = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT_DIR, encoding: 'utf8' });
    return out.split('\0').filter(Boolean).filter((f) => fs.existsSync(path.join(ROOT_DIR, f)));
}

function isExported(file) {
    if (NOT_EXPORTED.includes(file)) return false;
    return EXPORTED.some((entry) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry));
}

/** Per-file rewrites so the exported copy reads as a template, not as this site. */
function transform(file, text) {
    let result = text.replace(PERSONAL_BLOCK, '');
    if (file === 'LICENSE') {
        // Drop the section reserving rights on this site's personal content.
        result = `${result.split('\n---\n')[0].trimEnd()}\n`;
    }
    if (file === 'package.json' || file === 'package-lock.json') {
        const pkg = JSON.parse(result);
        pkg.name = TEMPLATE_PACKAGE_NAME;
        if (pkg.packages && pkg.packages['']) pkg.packages[''].name = TEMPLATE_PACKAGE_NAME;
        result = `${JSON.stringify(pkg, null, 2)}\n`;
    }
    return result;
}

// URL path segments / query values too generic to identify anyone.
const GENERIC_SEGMENTS = new Set(['citations', 'profile', 'user', 'users', 'people', 'author']);

/**
 * Strings identifying the site owner, taken from the personal config. Short ones (a three-letter
 * surname, say) are matched as whole words only, to avoid hits inside words like "repair".
 */
function ownerFingerprints() {
    const config = loadConfig();
    const contact = config.resume_contact || {};
    const urlParts = (url) => {
        try {
            const u = new URL(/^https?:\/\//.test(url) ? url : `https://${url}`);
            return [...u.pathname.split('/'), ...u.searchParams.values()];
        } catch {
            return [];
        }
    };
    const candidates = [
        config.name,
        ...(config.name || '').split(/\s+/).filter((w) => w.length >= 3),
        ...(config.authorAliases || []),
        config.email,
        ...(config.contactEmails || []),
        contact.email,
        (config.siteUrl || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, ''),
        (contact.phone || '').replace(/\D/g, ''),
        ...[contact.github, contact.linkedin, ...Object.values(config.footerLinks || {})]
            .filter(Boolean)
            .flatMap(urlParts)
            .filter((part) => part.length >= 5 && !GENERIC_SEGMENTS.has(part.toLowerCase())),
    ];
    const unique = [...new Set(candidates.filter((c) => c && c.length >= 3).map((c) => c.toLowerCase()))];
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return unique.map((text) => ({
        text,
        short: text.length < 5,
        matches: text.length < 5
            ? (haystack) => new RegExp(`\\b${escape(text)}\\b`).test(haystack)
            : (haystack) => haystack.includes(text),
    }));
}

function main() {
    const outDir = parseArgs();
    const fingerprints = ownerFingerprints();
    if (!fingerprints.length) {
        console.error('Refusing to export: content/config.json has no owner details to check against.');
        process.exit(1);
    }
    prepareOutDir(outDir);

    const files = trackedFiles().filter(isExported);
    for (const file of files) {
        const from = path.join(ROOT_DIR, file);
        const to = path.join(outDir, file);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        if (TEXT_EXT.test(path.basename(file))) {
            fs.writeFileSync(to, transform(file, fs.readFileSync(from, 'utf8')));
        } else {
            fs.copyFileSync(from, to);
        }
    }

    // Scan every exported file's path and bytes (latin1 keeps binary files searchable). Short
    // fingerprints only apply to text and paths: compressed binary data matches them by chance.
    // LICENSE keeps the MIT copyright notice, which the licence requires, so its body is exempt.
    const allowed = [TEMPLATE_REPO, encodeURIComponent(TEMPLATE_REPO)].map((a) => a.toLowerCase());
    const leaks = [];
    const strip = (s) => allowed.reduce((acc, a) => acc.split(a).join(''), s.toLowerCase());
    for (const file of files) {
        const isText = TEXT_EXT.test(path.basename(file));
        const body = file === 'LICENSE' ? '' : strip(fs.readFileSync(path.join(outDir, file), 'latin1'));
        const name = strip(file);
        for (const { text, short, matches } of fingerprints) {
            if (matches(name) || ((isText || !short) && matches(body))) leaks.push(`${file}: mentions "${text}"`);
        }
    }
    if (leaks.length) {
        console.error(`Refusing to export: personal details found in ${leaks.length} place(s):\n  ${leaks.join('\n  ')}`);
        fs.rmSync(outDir, { recursive: true, force: true });
        process.exit(1);
    }
    console.log(`Exported ${files.length} files to ${outDir} (checked ${fingerprints.length} owner fingerprints)`);
}

main();
