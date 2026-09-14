// Filesystem locations of user content, shared by Next server code and Node build scripts.
// CommonJS so plain `node scripts/*.js` and next.config.js can require it.
const fs = require('fs');
const path = require('path');

// Webpack rewrites __dirname inside Next's server bundle, so fall back to the working directory there.
const ROOT_DIR = [path.resolve(__dirname, '..'), process.cwd()]
    .find((dir) => fs.existsSync(path.join(dir, 'lib', 'content-paths.js'))) || process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const CONFIG_PATH = path.join(CONTENT_DIR, 'config.json');
const DATA_DIR = path.join(CONTENT_DIR, 'data');
const BLOG_DIR = path.join(CONTENT_DIR, 'blogs');
const ABOUT_PATH = path.join(CONTENT_DIR, 'about.md');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function readJson(filePath, fallback) {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Parsed content/config.json, or {} when it doesn't exist yet (before `npm run setup`). */
function loadConfig() {
    return readJson(CONFIG_PATH, {});
}

/** Parsed content/data/<name>.json, or `fallback` when the file is missing. */
function loadData(name, fallback = null) {
    return readJson(path.join(DATA_DIR, `${name}.json`), fallback);
}

module.exports = {
    ROOT_DIR,
    CONTENT_DIR,
    CONFIG_PATH,
    DATA_DIR,
    BLOG_DIR,
    ABOUT_PATH,
    PUBLIC_DIR,
    loadConfig,
    loadData,
};
