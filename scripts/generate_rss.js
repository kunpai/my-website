// Generates public/rss.xml from public/blogs/*.md (run at prebuild).
const fs = require('fs');
const path = require('path');
const parseMD = require('parse-md').default || require('parse-md');

const SITE_URL = 'https://www.kunpai.space';
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'public', 'blogs');
const OUT = path.join(ROOT, 'public', 'rss.xml');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (md) => (md || '').replace(/<button[\s\S]*?<\/button>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^#+\s*/gm, '').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim();

const posts = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const { metadata, content } = parseMD(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'));
    const date = new Date(metadata.date);
    const text = strip(content);
    return {
        name: f.slice(0, -3), title: metadata.title ?? f, date: isNaN(date) ? new Date(0) : date,
        description: metadata.description ?? (text.length > 300 ? text.slice(0, 299).replace(/\s+\S*$/, '') + '…' : text),
        tags: metadata.tags ?? [], authors: metadata.authors ?? [],
    };
}).sort((a, b) => b.date - a.date);

const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/blogs/${p.name}</link>
      <guid isPermaLink="true">${SITE_URL}/blogs/${p.name}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
${p.authors.map((a) => `      <dc:creator>${esc(a)}</dc:creator>`).join('\n')}
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Kunal Pai — Blog</title>
    <link>${SITE_URL}/blogs</link>
    <description>Posts by Kunal Pai on computer architecture simulation, LLMs for software engineering, and side projects.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
fs.writeFileSync(OUT, xml);
console.log(`rss.xml: ${posts.length} posts`);
