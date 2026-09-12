const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'public', 'blogs');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://www.kunpai.space',
    generateRobotsTxt: true,
    changefreq: 'weekly',
    priority: 0.7,
    // Keep low-value toys out of the sitemap; they only dilute crawl budget.
    exclude: ['/games/*', '/linktree', '/linktree/*'],
    transform: async (config, loc) => {
        const high = ['/', '/publications', '/blogs', '/projects'];
        return {
            loc,
            changefreq: high.includes(loc) ? 'weekly' : 'monthly',
            priority: loc === '/' ? 1.0 : high.includes(loc) ? 0.9 : 0.6,
            lastmod: new Date().toISOString(),
        };
    },
    // Blog posts are dynamic routes; list them explicitly with their file mtime.
    additionalPaths: async () => {
        if (!fs.existsSync(BLOG_DIR)) return [];
        return fs.readdirSync(BLOG_DIR)
            .filter((f) => f.endsWith('.md'))
            .map((f) => ({
                loc: `/blogs/${f.slice(0, -3)}`,
                changefreq: 'monthly',
                priority: 0.8,
                lastmod: fs.statSync(path.join(BLOG_DIR, f)).mtime.toISOString(),
            }));
    },
};
