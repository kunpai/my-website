#!/usr/bin/env node
/**
 * Export the forkable template: site code + examples/, without this site's personal content.
 *
 *   node scripts/export-template.js --out <dir>
 *
 * Only git-tracked files are considered. Personal content is left out by construction:
 * content/ is never copied, and public/ is copied from an explicit allowlist only.
 * As a last guard, the export fails if any exported text file mentions the owner
 * (name, email, domain, profile handles from content/config.json).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT_DIR, loadConfig } = require('../lib/content-paths');

// Where the template is published; mentions of it are allowed in exported files.
const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'kunpai/academic-site-template';

// Tracked paths that are never exported (prefix match).
const EXCLUDED = [
    'content/',
    'plan/',
    'public/',                               // re-added below from PUBLIC_ALLOWLIST
    '.github/workflows/publish-template.yml', // only meaningful in this repo
];

// Site assets under public/ that the code itself depends on.
const PUBLIC_ALLOWLIST = [
    'public/images/placeholder.png',
    'public/images/favicon.ico',
];

// Marked blocks in text files that only make sense in this repo (e.g. README banner).
const PERSONAL_BLOCK = /<!-- personal-only:start -->[\s\S]*?<!-- personal-only:end -->\n?/g;

function parseArgs() {
    const i = process.argv.indexOf('--out');
    const out = i > -1 ? process.argv[i + 1] : null;
    if (!out) {
        console.error('Usage: node scripts/export-template.js --out <dir>');
        process.exit(2);
    }
    return path.resolve(out);
}

function trackedFiles() {
    const out = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT_DIR, encoding: 'utf8' });
    return out.split('\0').filter(Boolean).filter((f) => fs.existsSync(path.join(ROOT_DIR, f)));
}

function isExported(file) {
    if (PUBLIC_ALLOWLIST.includes(file)) return true;
    return !EXCLUDED.some((prefix) => file === prefix || file.startsWith(prefix));
}

/** Per-file rewrites so the exported copy reads as a template, not as this site. */
function transform(file, text) {
    let result = text.replace(PERSONAL_BLOCK, '');
    if (file === 'LICENSE') {
        // Drop the section reserving rights on this site's personal content.
        result = `${result.split('\n---\n')[0].trimEnd()}\n`;
    }
    if (file === 'package.json') {
        const pkg = JSON.parse(result);
        pkg.name = 'academic-site-template';
        result = `${JSON.stringify(pkg, null, 2)}\n`;
    }
    return result;
}

/** Strings identifying the site owner, taken from the personal config. */
function ownerFingerprints() {
    const config = loadConfig();
    const contact = config.resume_contact || {};
    const handle = (url) => (url || '').replace(/^https?:\/\//, '').split('/').filter(Boolean).pop();
    const candidates = [
        config.name,
        ...(config.name || '').split(/\s+/).filter((w) => w.length >= 4),
        config.email,
        ...(config.contactEmails || []),
        contact.email,
        (config.siteUrl || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, ''),
        handle(contact.github),
        handle(contact.linkedin),
    ];
    return [...new Set(candidates.filter((c) => c && c.length >= 4).map((c) => c.toLowerCase()))];
}

const TEXT_EXT = /\.(js|jsx|json|md|css|yml|yaml|txt|tex|py|html|svg|xml)$|^(LICENSE|\.gitignore)$/;

function main() {
    const outDir = parseArgs();
    if (outDir.startsWith(ROOT_DIR + path.sep)) {
        console.error('Choose an --out directory outside the repository.');
        process.exit(2);
    }
    fs.rmSync(outDir, { recursive: true, force: true });

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

    const fingerprints = ownerFingerprints();
    const leaks = [];
    // LICENSE keeps the MIT copyright notice (required by the licence), so it is exempt.
    for (const file of files.filter((f) => TEXT_EXT.test(path.basename(f)) && f !== 'LICENSE')) {
        let text = fs.readFileSync(path.join(outDir, file), 'utf8').toLowerCase();
        for (const allowed of [TEMPLATE_REPO, encodeURIComponent(TEMPLATE_REPO)]) {
            text = text.split(allowed.toLowerCase()).join('');
        }
        for (const fp of fingerprints) {
            if (text.includes(fp)) leaks.push(`${file}: mentions "${fp}"`);
        }
    }
    if (leaks.length) {
        console.error(`Refusing to export: personal details found in ${leaks.length} place(s):\n  ${leaks.join('\n  ')}`);
        fs.rmSync(outDir, { recursive: true, force: true });
        process.exit(1);
    }
    console.log(`Exported ${files.length} files to ${outDir} (checked for: ${fingerprints.join(', ')})`);
}

main();
