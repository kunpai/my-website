#!/usr/bin/env node
/**
 * Pull the latest template into your site:  npm run update
 *
 * Sites made with "Use this template" start with fresh git history that shares no commit with
 * the template, so a plain `git merge` has no common base and conflicts on every file the
 * template changed. On the first run this script finds the template commit your site started
 * from (via the .template-version stamp every template release carries) and records it as
 * already merged. Every update after that is a normal three-way merge: you only get conflicts
 * in site files you edited yourself, never in content/.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REMOTE = 'template';
const DEFAULT_URL = 'https://github.com/kunpai/academic-site-template.git';
const BRANCH = 'main';
const VERSION_FILE = '.template-version';

function git(args, { quiet = false } = {}) {
    return execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8', stdio: quiet ? ['ignore', 'pipe', 'ignore'] : ['ignore', 'pipe', 'pipe'] }).trim();
}

function tryGit(args) {
    try {
        return git(args, { quiet: true });
    } catch {
        return null;
    }
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

/** The template commit whose .template-version matches ours: where this site started. */
function findStartingCommit(target) {
    const stamp = fs.existsSync(path.join(ROOT_DIR, VERSION_FILE))
        ? fs.readFileSync(path.join(ROOT_DIR, VERSION_FILE), 'utf8').trim()
        : null;
    if (!stamp) return null;
    // Oldest match first: if two releases share a stamp, re-merging a change the site already has
    // is harmless, while starting from the newer one could skip a change.
    const commits = git(['rev-list', '--reverse', target]).split('\n');
    return commits.find((c) => tryGit(['show', `${c}:${VERSION_FILE}`]) === stamp) || null;
}

function main() {
    if (tryGit(['rev-parse', '--is-inside-work-tree']) !== 'true') fail('Run this inside your site\'s git repository.');
    if (git(['status', '--porcelain', '--untracked-files=no'])) {
        fail('You have uncommitted changes. Commit or stash them, then run `npm run update` again.');
    }

    const url = process.env.TEMPLATE_URL || tryGit(['remote', 'get-url', REMOTE]) || DEFAULT_URL;
    if (!tryGit(['remote', 'get-url', REMOTE])) git(['remote', 'add', REMOTE, url]);
    console.log(`Fetching the template (${url})...`);
    git(['fetch', '--quiet', REMOTE, BRANCH]);
    const target = `${REMOTE}/${BRANCH}`;

    if (!tryGit(['merge-base', 'HEAD', target])) {
        const start = findStartingCommit(target);
        if (!start) {
            fail(`Couldn't tell which template version this site started from (no matching ${VERSION_FILE}).\n` +
                `Merge by hand instead: git merge ${target} --allow-unrelated-histories`);
        }
        console.log('Connecting your history to the template (first update only)...');
        git(['merge', '--quiet', '--allow-unrelated-histories', '-s', 'ours', '-m', 'Connect history to the template', start]);
    }

    const incoming = Number(git(['rev-list', '--count', `HEAD..${target}`]));
    if (!incoming) {
        console.log('Already up to date.');
        return;
    }
    const before = git(['rev-parse', 'HEAD']);
    console.log(`Merging ${incoming} template update${incoming === 1 ? '' : 's'}...`);
    try {
        git(['merge', '--quiet', '--no-edit', '-m', 'Update from the template', target], { quiet: true });
    } catch {
        const conflicted = tryGit(['diff', '--name-only', '--diff-filter=U']) || '';
        fail(`The merge stopped with conflicts in files you changed:\n  ${conflicted.split('\n').join('\n  ')}\n` +
            'Resolve them, then run `git commit`. (Or `git merge --abort` to undo.)');
    }

    const changed = git(['diff', '--name-only', before, 'HEAD']).split('\n').filter(Boolean);
    const touchedContent = changed.filter((f) => f.startsWith('content/'));
    console.log(`Updated ${changed.length} files, 0 conflicts.` +
        (touchedContent.length ? '' : ' Nothing in content/ was touched.'));
    console.log('Run `npm install` if package.json changed, then `npm run dev` to check.');
}

main();
