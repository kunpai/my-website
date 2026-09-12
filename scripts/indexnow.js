// Notify Bing/Yandex/Naver/Seznam (IndexNow) about every URL in the sitemap.
// Run after a deploy:  npm run indexnow
// Key file: public/<key>.txt must be served at https://www.kunpai.space/<key>.txt
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.kunpai.space';
const HOST = new URL(SITE_URL).host;
const key = fs.readFileSync(path.join(__dirname, '..', 'public', 'indexnow-key.txt'), 'utf8').trim();

async function main() {
    const res = await fetch(`${SITE_URL}/sitemap-0.xml`);
    if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
    const xml = await res.text();
    const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    urlList.push(`${SITE_URL}/rss.xml`, `${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`);

    const body = { host: HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList };
    const r = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
    });
    console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${r.status} ${r.statusText}`);
    if (r.status >= 400) console.log(await r.text());
}

main().catch((e) => { console.error(e); process.exit(1); });
