# datatech.com.ar

Website for Datatech S.A., software de gestión para instituciones de salud (since 1978).

A static site with no dependencies: HTML, one stylesheet, one small script, self-hosted fonts.
It is served by Cloudflare Workers (static assets), with a tiny `worker.js` that only redirects old `?Cod=` addresses.

## Structure

```
src/pages/        one file per page: a JSON metadata comment, then the page's <main> content
src/partials/     head, header, footer, call-to-action band, the "circuit" graphic
build.mjs         wraps every page, adds structured data (JSON-LD), writes public/, sitemap.xml, llms.txt, llms-full.txt
worker.js         301s for old producto_detalle.asp?Cod= and novedades_detalle.asp?Cod= links
tools/            check-page.mjs (validate one page), indexnow.mjs (notify Bing after a deploy)
public/           the published site (built pages + assets)
  assets/site.css, assets/site.js
  assets/brand/   logo (vector), white logo, isotype
  assets/img/     photos, WebP in 800/1400/2000 px
  assets/fonts/   Outfit and Hanken Grotesk (variable, latin)
  _headers        security and cache headers (noindex only for the preview host)
  _redirects      old .asp addresses → new pages
  robots.txt      allows all crawlers, including AI answer engines
```

## Edit, build, deploy

```bash
node tools/check-page.mjs src/pages/servicios.html   # validate a page after editing it
node build.mjs                                       # regenerate public/
npx wrangler deploy                                  # publish (needs a Cloudflare login)
```

Each page's metadata holds its title, description, breadcrumbs (`crumbs`), FAQ (`faq`, rendered as a visible accordion and as FAQPage data from the same text) and any extra structured data (`schema`). See the comment at the top of `build.mjs`.
Phone, address and the client-area link are in `CONFIG`; the organization's structured data is `ORG`, both at the top of `build.mjs`.
The stylesheet and script are cache-busted automatically by a hash added during the build.

To preview locally: `cd public && python3 -m http.server 4300`, then open http://localhost:4300.

## Settings to review

- **Contact and careers forms** send email through [Web3Forms](https://web3forms.com). The access key is `FORM_KEY` at the top of `public/assets/site.js`; the messages go to the address the key was created with. Create a key with the address that should receive inquiries and replace it.
- **Área de clientes** links to the login on Datatech's existing server (`CONFIG.clientArea` in `build.mjs`). Before `datatech.com.ar` points to this site, that server needs its own address (for example `clientes.datatech.com.ar`), and `CONFIG.clientArea` must be updated to it.
- **Photos** are free stock (Pexels and Unsplash licenses, no attribution required) and can be replaced with photos of real client institutions.
- **Client cases** on `/casos/` come from news Datatech published on its old site. Confirm each institution still agrees to be named.

## Moving datatech.com.ar to this site

1. Give the old server a separate hostname for the client area, and update `CONFIG.clientArea`.
2. Add the domain to Cloudflare, then add these routes to `wrangler.jsonc` and deploy:
   `{ "pattern": "datatech.com.ar", "custom_domain": true }` and `{ "pattern": "www.datatech.com.ar", "custom_domain": true }`.
3. Check that `curl -I https://www.datatech.com.ar/` does NOT return `x-robots-tag: noindex` (only the preview host should).
4. Verify the domain in Google Search Console (keep Settings > "Search generative AI" included) and submit `https://www.datatech.com.ar/sitemap.xml`.
5. Verify it in Bing Webmaster Tools, then run `node tools/indexnow.mjs`. Run it again after each content change.
6. Retire the preview: remove the `datatech.matiasd.com` route and its block in `public/_headers`.
