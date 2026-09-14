#!/usr/bin/env node
/**
 * Checks content/ against schemas/ before a build, with messages that name the file, entry and field.
 *
 * Usage:
 *   node scripts/validate-content.js [--content-dir <dir>] [--public-dir <dir>]
 *
 * Errors (exit 1): invalid JSON, schema violations, missing data files the site imports,
 * bad blog frontmatter. Warnings: deprecated or unknown config keys, local files that don't exist
 * under public/, cross-file inconsistencies. Notes: informational only.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const parseMD = require('parse-md').default;

const { ROOT_DIR, CONTENT_DIR, PUBLIC_DIR } = require('../lib/content-paths');
const { resolveFeatures, legacyFeatureWarnings } = require('../lib/features');

const SCHEMA_DIR = path.join(ROOT_DIR, 'schemas');
// Site code that imports data files; any file imported here must exist or the build fails.
const SOURCE_DIRS = ['components', 'pages', 'lib'].map((d) => path.join(ROOT_DIR, d));
const DATA_IMPORT = /@\/content\/data\/([\w.-]+)\.json/g;

// Config objects whose keys are a fixed set: an unknown key there is almost always a typo.
const CLOSED_CONFIG_OBJECTS = ['features', 'labels', 'theme', 'chatbot', 'resume_contact'];

// Friendlier text for schema patterns (keyed by the pattern string).
const PATTERN_HINTS = {
    '^/': 'must be a path under public/ starting with "/", e.g. "/images/photo.png"',
    '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$': 'must be a hex colour like "#2f6fed" or "#26e"',
    '^https?://': 'must be an absolute URL starting with http:// or https://',
    '^https?://[^\\s/]+(/[^\\s]*[^\\s/])?$': 'must be an absolute URL without a trailing slash, e.g. "https://janedoe.example.com"',
    '^(?!https?://)': 'must not start with http:// or https:// (it is added automatically), e.g. "github.com/janedoe"',
    '^[^@\\s]+@[^@\\s]+$': 'must be an email address',
    '^[a-z0-9][a-z0-9 -]*$': 'must be lowercase, e.g. "conference", "workshop", "preprint", "poster"',
    '^(?!archived-conferences$)[A-Za-z0-9][A-Za-z0-9_-]*$': 'must be a URL slug (letters, digits, - and _) other than "archived-conferences"',
    '^\\S+( \\S+)*$': 'must not have leading, trailing or double spaces (the navbar monogram is built from it; or set "initials")',
};

// Common wrong key names, to turn "missing organization" into a fix.
const KEY_ALIASES = {
    organization: ['company', 'employer', 'institution', 'org'],
    university: ['school', 'institution', 'college'],
    awarder: ['issuer', 'organization', 'from'],
    date: ['year'],
    title: ['name', 'role'],
    authors: ['author'],
    type: ['kind', 'category'],
    start: ['from', 'startDate', 'start_date'],
    end: ['to', 'endDate', 'end_date'],
    description: ['summary', 'details', 'bullets'],
    links: ['link', 'urls'],
    items: ['entries'],
    category: ['name', 'title'],
    url: ['link', 'href'],
    label: ['name', 'title', 'text'],
    path: ['slug'],
};

// ---------------------------------------------------------------------------
// CLI

function parseArgs(argv) {
    const opts = { contentDir: CONTENT_DIR, publicDir: PUBLIC_DIR };
    for (let i = 0; i < argv.length; i++) {
        const [flag, inline] = argv[i].split(/=(.*)/s);
        const value = () => (inline !== undefined ? inline : argv[++i]);
        if (flag === '--content-dir') opts.contentDir = path.resolve(value());
        else if (flag === '--public-dir') opts.publicDir = path.resolve(value());
        else if (flag === '-h' || flag === '--help') {
            console.log('Usage: node scripts/validate-content.js [--content-dir <dir>] [--public-dir <dir>]');
            process.exit(0);
        } else {
            console.error(`Unknown argument: ${argv[i]}`);
            process.exit(2);
        }
    }
    return opts;
}

// ---------------------------------------------------------------------------
// Reporting

const report = { errors: [], warnings: [], notes: [] };
const rel = (p) => path.relative(process.cwd(), p) || '.';
const error = (msg) => report.errors.push(msg);
const warn = (msg) => report.warnings.push(msg);
const note = (msg) => report.notes.push(msg);

function levenshtein(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
    }
    return d[a.length][b.length];
}

function closest(key, candidates) {
    const lower = key.toLowerCase();
    let best = null;
    let bestDist = 3;
    for (const c of candidates) {
        const dist = c.toLowerCase() === lower ? 0 : levenshtein(lower, c.toLowerCase());
        if (dist < bestDist) [best, bestDist] = [c, dist];
    }
    return best;
}

// ---------------------------------------------------------------------------
// Schema validation and error formatting

const ajv = new Ajv({ allErrors: true, verbose: true, strict: true });

function loadSchemas() {
    const schemas = {};
    if (!fs.existsSync(SCHEMA_DIR)) return schemas;
    for (const file of fs.readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.schema.json'))) {
        const name = file.slice(0, -'.schema.json'.length);
        const full = path.join(SCHEMA_DIR, file);
        try {
            const schema = JSON.parse(fs.readFileSync(full, 'utf8'));
            schemas[name] = { schema, validate: ajv.compile(schema) };
        } catch (e) {
            error(`${rel(full)}: schema does not compile: ${e.message}`);
        }
    }
    return schemas;
}

function readJson(file) {
    try {
        return { data: JSON.parse(fs.readFileSync(file, 'utf8')) };
    } catch (e) {
        return { err: `invalid JSON: ${e.message}` };
    }
}

const pointerSegments = (pointer) => pointer.split('/').slice(1).map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));

function valueAt(data, segments) {
    return segments.reduce((obj, seg) => (obj == null ? undefined : obj[seg]), data);
}

function entryLabel(entry) {
    if (!entry || typeof entry !== 'object') return '';
    const label = entry.title || entry.name || entry.university || entry.category || entry.path || '';
    if (typeof label !== 'string' || !label) return '';
    return label.length > 60 ? `${label.slice(0, 57)}...` : label;
}

/** "/2/links/View Pre-Print" in an array file -> '[2] "Title" links["View Pre-Print"]'. */
function describeLocation(data, segments) {
    const parts = [];
    let rest = segments;
    if (Array.isArray(data) && segments.length > 0) {
        const label = entryLabel(data[segments[0]]);
        parts.push(`[${segments[0]}]${label ? ` "${label}"` : ''}`);
        rest = segments.slice(1);
    }
    let fieldPath = '';
    let node = Array.isArray(data) && segments.length > 0 ? data[segments[0]] : data;
    for (const seg of rest) {
        if (Array.isArray(node)) fieldPath += `[${seg}]`;
        else if (/^[A-Za-z_$][\w$-]*$/.test(seg)) fieldPath += fieldPath ? `.${seg}` : seg;
        else fieldPath += `[${JSON.stringify(seg)}]`;
        node = node == null ? undefined : node[seg];
    }
    if (fieldPath) parts.push(fieldPath);
    return parts.join(' ');
}

const typeName = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const article = (t) => (/^[aeiou]/.test(t) ? `an ${t}` : `a ${t}`);

function formatError(e, data) {
    const segments = pointerSegments(e.instancePath);
    switch (e.keyword) {
        case 'required': {
            const missing = e.params.missingProperty;
            const obj = valueAt(data, segments) || {};
            const alias = (KEY_ALIASES[missing] || []).find((k) => k in obj);
            const hint = alias ? ` (found "${alias}"; rename it to "${missing}")` : '';
            return { segments, msg: `missing required property "${missing}"${hint}` };
        }
        case 'type':
            return { segments, msg: `must be ${article(e.params.type)} (got ${typeName(e.data)})` };
        case 'pattern':
            return { segments, msg: `${PATTERN_HINTS[e.params.pattern] || `must match pattern ${e.params.pattern}`} (got ${JSON.stringify(e.data)})` };
        case 'minLength':
            return { segments, msg: 'must not be empty' };
        case 'minItems':
            return { segments, msg: `must have at least ${e.params.limit} item${e.params.limit === 1 ? '' : 's'}` };
        case 'anyOf': {
            const types = (Array.isArray(e.schema) ? e.schema : []).map((s) => s.type).filter(Boolean);
            const msg = types.length ? `must be ${types.map(article).join(' or ')} (got ${typeName(e.data)})` : e.message;
            return { segments, msg };
        }
        default:
            return { segments, msg: e.message };
    }
}

function schemaErrors(validate, data) {
    if (validate(data)) return [];
    let errors = validate.errors.filter((e) => e.keyword !== 'if');
    // Branch errors of an anyOf are summarised by the anyOf error itself.
    const anyOfPaths = errors.filter((e) => e.keyword === 'anyOf').map((e) => `${e.schemaPath}/`);
    errors = errors.filter((e) => !anyOfPaths.some((p) => e.schemaPath.startsWith(p)));
    const seen = new Set();
    return errors
        .map((e) => formatError(e, data))
        .map(({ segments, msg }) => ({ where: describeLocation(data, segments), msg }))
        .filter(({ where, msg }) => !seen.has(`${where}\0${msg}`) && seen.add(`${where}\0${msg}`));
}

/** "file [2] "Title" field: message", or "file: message" for the file as a whole. */
const located = (file, where, msg) => (where ? `${rel(file)} ${where}: ${msg}` : `${rel(file)}: ${msg}`);

// ---------------------------------------------------------------------------
// Checks

function importedDataFiles() {
    const names = new Set();
    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (/\.(jsx?|tsx?|mjs|cjs)$/.test(entry.name)) {
                for (const m of fs.readFileSync(full, 'utf8').matchAll(DATA_IMPORT)) names.add(m[1]);
            }
        }
    };
    SOURCE_DIRS.forEach(walk);
    return names;
}

function checkLocalFile(publicDir, filePath, ref) {
    if (typeof ref !== 'string' || !ref.startsWith('/') || ref.startsWith('//')) return;
    const bare = ref.split(/[?#]/)[0];
    let clean = bare;
    try {
        clean = decodeURI(bare);
    } catch {
        // A literal '%' (e.g. "/images/100%.png") isn't valid percent-encoding; use the path as written.
    }
    if (!fs.existsSync(path.join(publicDir, clean))) {
        warn(`${filePath}: "${ref}" not found in ${rel(publicDir)}/`);
    }
}

function checkConfig(configFile, config, schema) {
    const where = rel(configFile);
    for (const msg of legacyFeatureWarnings(config)) warn(`${where}: ${msg}`);

    const props = schema.properties || {};
    const unknown = (obj, known, prefix) => {
        for (const key of Object.keys(obj)) {
            if (key in known) continue;
            const guess = closest(key, Object.keys(known));
            warn(`${where} ${prefix}${key}: unknown key, ignored by the site${guess ? ` (did you mean "${guess}"?)` : ''}`);
        }
    };
    unknown(config, props, '');
    for (const key of CLOSED_CONFIG_OBJECTS) {
        const value = config[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) unknown(value, props[key].properties || {}, `${key}.`);
    }
}

function checkDataFiles(dataDir, schemas, imported) {
    const loaded = {};
    const present = fs.existsSync(dataDir)
        ? fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
        : [];

    for (const name of present) {
        const file = path.join(dataDir, `${name}.json`);
        const { data, err } = readJson(file);
        if (err) {
            error(`${rel(file)}: ${err}`);
            continue;
        }
        loaded[name] = data;
        if (!schemas[name]) {
            note(`${rel(file)}: no schema in schemas/, not checked${imported.has(name) ? '' : ' (the site does not read this file)'}`);
            continue;
        }
        for (const { where, msg } of schemaErrors(schemas[name].validate, data)) error(located(file, where, msg));
    }

    for (const name of [...imported].sort()) {
        if (present.includes(name)) continue;
        const empty = schemas[name]?.schema.type === 'object' ? '{}' : '[]';
        error(`${rel(path.join(dataDir, `${name}.json`))}: missing, but the site imports it at build time. Create it containing ${empty} to leave that section empty.`);
    }
    return loaded;
}

function checkImages(dataDir, publicDir, data) {
    for (const [name, entries] of Object.entries(data)) {
        if (!Array.isArray(entries)) continue;
        entries.forEach((entry, i) => {
            if (entry && typeof entry === 'object' && entry.image) {
                const label = entryLabel(entry);
                checkLocalFile(publicDir, `${rel(path.join(dataDir, `${name}.json`))} [${i}]${label ? ` "${label}"` : ''} image`, entry.image);
            }
        });
    }
}

function checkPublications(configFile, config, publications) {
    if (!Array.isArray(publications)) return;
    const visible = publications.filter((p) => p && p.show_on_website !== false);
    const tags = new Set(visible.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])));
    const categories = Array.isArray(config.publicationCategories) ? config.publicationCategories : [];
    for (const cat of categories) {
        if (!tags.has(cat)) warn(`${rel(configFile)} publicationCategories: "${cat}" is not a tag of any publication, so its graph node has no papers`);
    }
    if (categories.length && config.categoryDescriptions && typeof config.categoryDescriptions === 'object') {
        for (const key of Object.keys(config.categoryDescriptions)) {
            if (!categories.includes(key)) warn(`${rel(configFile)} categoryDescriptions: "${key}" is not in publicationCategories, so it is never shown`);
        }
    }
    // The homepage lists a single publication type; read it from the page so this stays in sync.
    const indexPage = path.join(ROOT_DIR, 'pages', 'index.js');
    const match = fs.existsSync(indexPage) && fs.readFileSync(indexPage, 'utf8').match(/<Publication\b[^>]*defaultType="([^"]+)"/);
    if (match && visible.length && !visible.some((p) => p.type === match[1])) {
        warn(`publications: no visible publication has type "${match[1]}", so the homepage Publications list is empty`);
    }
}

function checkBlogs(contentDir, publicDir, features) {
    const blogDir = path.join(contentDir, 'blogs');
    if (!fs.existsSync(blogDir)) {
        if (features.blogs) error(`${rel(blogDir)}/: missing while features.blogs is on. Create the folder (add a .gitkeep to commit it empty) or set features.blogs to false.`);
        return;
    }
    for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')).sort()) {
        const full = path.join(blogDir, file);
        const where = rel(full);
        let metadata;
        try {
            ({ metadata } = parseMD(fs.readFileSync(full, 'utf8')));
        } catch (e) {
            error(`${where}: frontmatter is not valid YAML: ${e.message.split('\n')[0]}`);
            continue;
        }
        metadata = metadata || {};
        if (typeof metadata.title !== 'string' || !metadata.title.trim()) error(`${where}: frontmatter needs a "title"`);

        const { date } = metadata;
        if (date === undefined || date === null || date === '') {
            error(`${where}: frontmatter needs a "date" (MM/DD/YYYY, e.g. 07/01/2023)`);
        } else if (date instanceof Date) {
            error(`${where}: date "${date.toISOString().slice(0, 10)}" is read by YAML as a Date object, which Next.js cannot pass to the page. Write it as MM/DD/YYYY or quote it ("${date.toISOString().slice(0, 10)}")`);
        } else if (typeof date !== 'string') {
            error(`${where}: date must be text like 07/01/2023 (got ${typeName(date)} ${JSON.stringify(date)})`);
        } else if (Number.isNaN(new Date(date).getTime())) {
            error(`${where}: date "${date}" is not a date JavaScript can parse; use MM/DD/YYYY`);
        }

        for (const key of ['tags', 'authors']) {
            const value = metadata[key];
            if (value === undefined || value === null) continue;
            if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
                error(`${where}: "${key}" must be a YAML list of strings, e.g. "${key}: [one, two]" (got ${typeName(value)})`);
            }
        }
        if (metadata.image !== undefined && metadata.image !== null) {
            if (typeof metadata.image !== 'string' || !metadata.image.startsWith('/')) {
                error(`${where}: image ${PATTERN_HINTS['^/']} (got ${JSON.stringify(metadata.image)})`);
            } else {
                checkLocalFile(publicDir, `${where} image`, metadata.image);
            }
        }
    }
}

// ---------------------------------------------------------------------------

function main() {
    const { contentDir, publicDir } = parseArgs(process.argv.slice(2));
    const configFile = path.join(contentDir, 'config.json');
    const dataDir = path.join(contentDir, 'data');

    const schemas = loadSchemas();
    const imported = importedDataFiles();

    let config = {};
    if (!fs.existsSync(configFile)) {
        error(`${rel(configFile)}: missing. Run "npm run setup" or copy examples/content/config.json.`);
    } else {
        const { data, err } = readJson(configFile);
        if (err) error(`${rel(configFile)}: ${err}`);
        else if (!data || typeof data !== 'object' || Array.isArray(data)) error(`${rel(configFile)}: must be a JSON object`);
        else {
            config = data;
            if (schemas.config) {
                for (const { where, msg } of schemaErrors(schemas.config.validate, config)) error(located(configFile, where, msg));
                checkConfig(configFile, config, schemas.config.schema);
            }
            for (const key of ['image', 'resume', 'resume_short', 'favicon']) checkLocalFile(publicDir, `${rel(configFile)} ${key}`, config[key]);
        }
    }
    const features = resolveFeatures(config);

    const data = checkDataFiles(dataDir, schemas, imported);
    checkImages(dataDir, publicDir, data);
    checkPublications(configFile, config, data.publications);
    checkBlogs(contentDir, publicDir, features);

    if (features.about && !fs.existsSync(path.join(contentDir, 'about.md'))) {
        note(`${rel(path.join(contentDir, 'about.md'))}: missing, so /about shows the built-in placeholder text`);
    }

    for (const msg of report.errors) console.log(`error: ${msg}`);
    for (const msg of report.warnings) console.log(`warning: ${msg}`);
    for (const msg of report.notes) console.log(`note: ${msg}`);

    const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    console.log(`validate-content: ${count(report.errors.length, 'error')}, ${count(report.warnings.length, 'warning')} in ${rel(contentDir)}/`);
    process.exit(report.errors.length ? 1 : 0);
}

main();
