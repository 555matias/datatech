// Tells Bing (and other IndexNow engines) that pages changed. Run after a deploy to the real domain:
//   node tools/indexnow.mjs            (submits every URL in public/sitemap.xml)
// The key file public/3cfb7bc78b9ba965fcca54349d7011f3.txt must be live at https://www.datatech.com.ar/3cfb7bc78b9ba965fcca54349d7011f3.txt first.
import { readFileSync } from 'node:fs';

const KEY = '3cfb7bc78b9ba965fcca54349d7011f3';
const HOST = 'www.datatech.com.ar';
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(res.status, res.statusText, `(${urlList.length} URLs)`);
