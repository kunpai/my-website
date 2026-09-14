// Feature flags: the single definition of which site sections exist and their defaults.
// CommonJS so components, pages, next-sitemap and build scripts all share it.

/** Every flag with its default. A section is on unless config.features sets it to false. */
const FEATURE_DEFAULTS = Object.freeze({
    about: true,
    publications: true,
    researchGraph: true, // topic graph on /publications
    projects: true,
    experience: true, // work & research experience
    education: true,
    blogs: true,
    news: true,
    talks: true,
    services: true,
    skills: true,
    awards: true,
    contact: true,
    linktree: false,
});

/** Routes owned by a feature; they return 404 and leave the sitemap when it is off. */
const FEATURE_ROUTES = Object.freeze({
    about: ['/about'],
    publications: ['/publications'],
    projects: ['/projects'],
    experience: ['/work-experiences'],
    blogs: ['/blogs', '/blogs/*'],
    contact: ['/contact'],
    linktree: ['/linktree', '/linktree/*'],
});

/**
 * Resolve config.features against the defaults.
 * Still honours the older key `features.workExperience`.
 */
function resolveFeatures(config = {}) {
    const raw = config.features || {};
    const features = { ...FEATURE_DEFAULTS };
    for (const key of Object.keys(FEATURE_DEFAULTS)) {
        if (typeof raw[key] === 'boolean') features[key] = raw[key];
    }
    if (typeof raw.experience !== 'boolean' && typeof raw.workExperience === 'boolean') {
        features.experience = raw.workExperience;
    }
    return features;
}

/** Messages for config keys that still work but should be renamed. */
function legacyFeatureWarnings(config = {}) {
    const raw = config.features || {};
    const warnings = [];
    if ('workExperience' in raw) warnings.push('features.workExperience is deprecated; use features.experience');
    return warnings;
}

/** Sitemap-style route patterns for every disabled feature. */
function disabledRoutes(features) {
    return Object.entries(FEATURE_ROUTES)
        .filter(([key]) => !features[key])
        .flatMap(([, routes]) => routes);
}

module.exports = {
    FEATURE_DEFAULTS,
    FEATURE_ROUTES,
    resolveFeatures,
    legacyFeatureWarnings,
    disabledRoutes,
};
