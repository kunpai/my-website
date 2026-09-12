// Server-side helpers for reading blog posts from /public/blogs.
// Only import this from getStaticProps / getStaticPaths / build scripts (uses fs).
import fs from 'fs';
import path from 'path';
import parseMD from 'parse-md';

export const BLOG_DIR = path.join(process.cwd(), 'public', 'blogs');

export function stripMarkdown(md) {
    return (md || '')
        .replace(/<button[\s\S]*?<\/button>/gi, ' ').replace(/<[^>]+>/g, ' ')            // html tags (e.g. download buttons)
        .replace(/```[\s\S]*?```/g, ' ')     // fenced code
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
        .replace(/^#+\s*/gm, '')             // headings
        .replace(/[*_`>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function excerpt(md, n = 160) {
    const text = stripMarkdown(md);
    if (text.length <= n) return text;
    return text.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

// Blog dates are written MM/DD/YYYY in frontmatter; normalize to ISO for feeds/JSON-LD.
export function toISODate(d) {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.toISOString().slice(0, 10);
}

export function calculateReadingTime(text) {
    if (!text) return '< 1';
    const wpm = 225;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const time = words / wpm;
    if (time < 1) {
        return '< 1';
    }
    return `${Math.ceil(time)}`;
}

export function readBlog(name) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, name + '.md'), 'utf8');
    const { metadata, content } = parseMD(raw);
    return {
        name,
        title: metadata.title ?? name,
        date: metadata.date ?? null,
        isoDate: toISODate(metadata.date),
        tags: metadata.tags ?? [],
        authors: metadata.authors ?? [],
        image: metadata.image ?? null,
        description: metadata.description ?? excerpt(content),
        readingTime: calculateReadingTime(content),
        content,
    };
}

export function readAllBlogs() {
    return fs.readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => readBlog(f.slice(0, -3)))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}
