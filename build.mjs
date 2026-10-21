// Builds the site into public/ from src/. No dependencies: `node build.mjs`.
//
// Each file in src/pages/ starts with a JSON comment holding its metadata:
//   <!--{"path": "/servicios/", "title": "...", "description": "...", "nav": "servicios"}-->
// followed by the page's <main> content. The shared head, header and footer
// come from src/partials/ and wrap every page.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const ROOT = dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.datatech.com.ar';

// Links that live outside this site. The client area runs on Datatech's existing server.
const CONFIG = {
  clientArea: 'https://www.datatech.com.ar/jornada_de_actualizacion.asp',
  phone: '(54-11) 4374-1002',
  phoneHref: 'tel:+541143741002',
  address: 'Av. Córdoba 1184, 5º piso',
  city: 'C1055AAO · Ciudad Autónoma de Buenos Aires',
  maps: 'https://www.google.com/maps/search/?api=1&query=Av.+C%C3%B3rdoba+1184%2C+C1055AAO+CABA',
  year: '2026',
};

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const hash = (p) => createHash('sha1').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8);
const version = { css: hash('public/assets/site.css'), js: hash('public/assets/site.js') };

const partials = Object.fromEntries(
  readdirSync(join(ROOT, 'src/partials')).map((f) => [f.replace('.html', ''), read(`src/partials/${f}`)])
);

function fill(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

const pages = readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'));
const sitemap = [];

for (const file of pages) {
  const src = read(`src/pages/${file}`);
  const m = src.match(/^<!--(\{[\s\S]*?\})-->\n?/);
  if (!m) throw new Error(`${file}: missing metadata comment`);
  const meta = JSON.parse(m[1]);
  const body = src.slice(m[0].length);
  const nav = meta.nav || '';
  const vars = {
    ...CONFIG,
    title: meta.title,
    description: meta.description,
    canonical: SITE + meta.path,
    ogImage: SITE + '/og.jpg',
    cssv: version.css,
    jsv: version.js,
    robots: meta.noindex ? 'noindex' : 'index, follow',
    jsonld: meta.path === '/' ? partials.jsonld : '',
    flow: partials.flow,
    cta: fill(partials.cta, CONFIG),
  };
  for (const key of ['soluciones', 'servicios', 'empresa', 'calidad', 'contacto']) {
    vars[`cur_${key}`] = nav === key ? ' aria-current="page"' : '';
  }
  const html =
    fill(partials.head, vars) +
    fill(partials.header, vars) +
    '<main id="contenido">\n' + fill(body, vars) + '</main>\n' +
    fill(partials.footer, vars);

  const out = meta.path === '/404' ? 'public/404.html' : join('public', meta.path, 'index.html');
  mkdirSync(join(ROOT, dirname(out)), { recursive: true });
  writeFileSync(join(ROOT, out), html);
  if (!meta.noindex) sitemap.push({ loc: SITE + meta.path, priority: meta.priority || '0.7' });
  console.log('built', out);
}

sitemap.sort((a, b) => b.priority - a.priority || a.loc.localeCompare(b.loc));
writeFileSync(
  join(ROOT, 'public/sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemap.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n') +
    '\n</urlset>\n'
);
console.log('built public/sitemap.xml');
