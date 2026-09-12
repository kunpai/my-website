import Head from 'next/head';

export const SITE_URL = 'https://www.kunpai.space';
export const SITE_NAME = 'Kunal Pai';
export const DEFAULT_DESCRIPTION =
    'Kunal Pai — PhD student in Computer Science at UCLA (advised by Miryung Kim). Research on LLM-based software engineering, C-to-Rust transpilation, AI agent security, and gem5 computer architecture simulation.';
export const DEFAULT_IMAGE = `${SITE_URL}/images/kunal.jpeg`;

/**
 * Per-page SEO tags. Uses fixed `key`s so a page's values override the
 * defaults set in _app.js (next/head de-duplicates on key).
 */
export default function Seo({ title, description, path = '/', image, type = 'website', publishedTime, authors, tags, noTitleSuffix = false }) {
    const fullTitle = !title ? SITE_NAME : noTitleSuffix ? title : `${title} | ${SITE_NAME}`;
    const desc = description || DEFAULT_DESCRIPTION;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = SITE_URL + (normalizedPath === '/' ? '/' : normalizedPath.replace(/\/$/, ''));
    const img = image
        ? (image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`)
        : DEFAULT_IMAGE;
    return (
        <Head>
            <title key="title">{fullTitle}</title>
            <meta key="description" name="description" content={desc} />
            <link key="canonical" rel="canonical" href={url} />
            <meta key="og:type" property="og:type" content={type} />
            <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
            <meta key="og:title" property="og:title" content={fullTitle} />
            <meta key="og:description" property="og:description" content={desc} />
            <meta key="og:url" property="og:url" content={url} />
            <meta key="og:image" property="og:image" content={img} />
            <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta key="twitter:title" name="twitter:title" content={fullTitle} />
            <meta key="twitter:description" name="twitter:description" content={desc} />
            <meta key="twitter:image" name="twitter:image" content={img} />
            {publishedTime && <meta key="article:published_time" property="article:published_time" content={publishedTime} />}
            {authors && authors.map((a) => <meta key={`article:author:${a}`} property="article:author" content={a} />)}
            {tags && tags.map((t) => <meta key={`article:tag:${t}`} property="article:tag" content={t} />)}
        </Head>
    );
}
