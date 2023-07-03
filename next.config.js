/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [],
    },
    env: {
        LAST_UPDATED: process.env.LAST_UPDATED,
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
        });
        return config;
    },
}

module.exports = nextConfig
