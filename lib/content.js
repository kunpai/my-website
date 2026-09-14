// Site configuration for components and pages. Import config from here rather than from
// content/config.json directly, so defaults and derived values live in one place.
// Data files are imported individually from '@/content/data/<name>.json' to keep bundles small.
import rawConfig from '@/content/config.json';
import { resolveFeatures } from '@/lib/features';

const config = rawConfig;

/** Resolved feature flags (see lib/features.js for the full list and defaults). */
export const features = resolveFeatures(config);

/**
 * getStaticProps for pages that belong to a feature: 404 at build time when it is off.
 * Pass `getProps` to run the page's own data loading when the feature is on.
 */
export function featureGate(key, getProps = async () => ({ props: {} })) {
    return async (ctx) => (features[key] ? getProps(ctx) : { notFound: true });
}

export default config;
