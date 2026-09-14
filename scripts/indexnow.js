// Notify Bing/Yandex/Naver/Seznam (IndexNow) about every URL in the sitemap.
// Run after a deploy:  npm run indexnow
// Needs public/indexnow-key.txt (created by `npm run setup`) and a copy at public/<key>.txt,
// so the key is served at <siteUrl>/<key>.txt.
const fs = require('fs');
const path = require('path');
const { PUBLIC_DIR, loadConfig, resolveSiteUrl } = require('../lib/content-paths');

const SITE_URL = resolveSiteUrl(loadConfig());
const KEY_PATH = path.join(PUBLIC_DIR, 'indexnow-key.txt');

async function main() {
    if (!SITE_URL) throw new Error('Set siteUrl in content/config.json first.');
    if (!fs.existsSync(KEY_PATH)) throw new Error('Missing public/indexnow-key.txt; run `npm run setup` to create one.');
    const key = fs.readFileSync(KEY_PATH, 'utf8').trim();
    const host = new URL(SITE_URL).host;

    const res = await fetch(`${SITE_URL}/sitemap-0.xml`);
    if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
    const xml = await res.text();
    const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    urlList.push(`${SITE_URL}/rss.xml`, `${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`);

    const body = { host, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList };
    const r = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
    });
    console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${r.status} ${r.statusText}`);
    if (r.status >= 400) console.log(await r.text());
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
