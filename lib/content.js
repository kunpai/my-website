// Site configuration for components and pages. Import config from here rather than from
// content/config.json directly, so defaults and derived values live in one place.
// Data files are imported individually from '@/content/data/<name>.json' to keep bundles small.
import rawConfig from '@/content/config.json';
import { resolveFeatures } from '@/lib/features';

const config = rawConfig;

/** Resolved feature flags (see lib/features.js for the full list and defaults). */
export const features = resolveFeatures(config);

const LABEL_DEFAULTS = {
    resumeButton: 'Download Full Resume',
    resumeShortButton: 'Download Short Resume',
    experienceTitle: 'Research & Professional Experience',
    footerHeading: 'Connect with Me',
    contactHeading: 'Get in Touch',
    contactIntro: "Hello there! Whether it's about research, collaboration, or just an idea you'd like to share, don't hesitate to reach out!",
    // Display names for skills.json keys, e.g. { "systems-and-compilers": "Systems & Compilers" }.
    // Keys without an entry are title-cased ("programming-languages" -> "Programming Languages").
    skillCategories: {},
};

/** UI copy, overridable per key via config.labels. */
export const labels = { ...LABEL_DEFAULTS, ...(config.labels || {}) };

const CHATBOT_DEFAULTS = {
    title: 'AI Assistant',
    model: 'meta/llama-3.1-8b-instruct', // NVIDIA NIM model id; needs NVIDIA_API_KEY
    availability: '',
};

/**
 * Visual theme from config.theme. Every colour is optional; with none set the site keeps
 * Bootstrap's default palette. headingFont is any Google Fonts family name.
 */
export const theme = { headingFont: 'Audiowide', ...(config.theme || {}) };

// "#0d6efd" / "#0df" -> "13, 110, 253" (Bootstrap 5.3 colours links via --bs-*-rgb variables).
const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(', ');
};

/** CSS applying config.theme, or '' when no colours are configured. */
export function themeCss() {
    const { accentColor, gradientStart, gradientEnd } = theme;
    const rules = [];
    if (accentColor) {
        const hover = gradientEnd || accentColor;
        rules.push(`:root,[data-bs-theme]{--brand-accent:${accentColor};--bs-primary:${accentColor};--bs-primary-rgb:${hexToRgb(accentColor)};` +
            `--bs-link-color:${accentColor};--bs-link-color-rgb:${hexToRgb(accentColor)};--bs-link-hover-color:${hover};--bs-link-hover-color-rgb:${hexToRgb(hover)};}`);
        rules.push(`.btn-primary{--bs-btn-bg:${accentColor};--bs-btn-border-color:${accentColor};}`);
        rules.push(`.btn-outline-primary{--bs-btn-color:${accentColor};--bs-btn-border-color:${accentColor};--bs-btn-hover-bg:${accentColor};--bs-btn-hover-border-color:${accentColor};}`);
    }
    if (gradientStart && gradientEnd) {
        rules.push(`.name{background:linear-gradient(135deg,${gradientStart} 0%,${gradientEnd} 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}`);
    }
    return rules.join('\n');
}

/** Chatbot settings, overridable via config.chatbot. */
export const chatbot = { ...CHATBOT_DEFAULTS, ...(config.chatbot || {}) };

/**
 * getStaticProps for pages that belong to a feature: 404 at build time when it is off.
 * Pass `getProps` to run the page's own data loading when the feature is on.
 */
export function featureGate(key, getProps = async () => ({ props: {} })) {
    return async (ctx) => (features[key] ? getProps(ctx) : { notFound: true });
}

/**
 * True when an author string names the site owner: it contains both the first and last word of
 * config.name ("Jane Q. Doe" matches "Jane Doe"), or equals one of config.authorAliases.
 */
export function isSiteOwner(author = '') {
    const words = (config.name || '').toLowerCase().split(/\s+/).filter(Boolean);
    const tokens = author.toLowerCase().split(/[\s.,]+/).filter(Boolean);
    const aliases = (config.authorAliases || []).map((a) => a.toLowerCase());
    if (aliases.includes(author.toLowerCase().trim())) return true;
    return words.length >= 2 && tokens.includes(words[0]) && tokens.includes(words[words.length - 1]);
}

export default config;
