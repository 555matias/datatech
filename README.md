# datatech.com.ar

Website for Datatech S.A., software de gestión para instituciones de salud (since 1978).

A static site with no dependencies: HTML, one stylesheet, one small script, self-hosted fonts.
It is served by Cloudflare Workers (static assets).

## Structure

```
src/pages/       one file per page: a JSON metadata comment, then the page's <main> content
src/partials/    head, header, footer, call-to-action band, the "circuit" graphic, JSON-LD
build.mjs        wraps every page with the partials and writes public/
public/          the published site (built pages + assets)
  assets/site.css, assets/site.js
  assets/brand/  logo (vector), white logo, isotype
  assets/img/    photos, WebP in 800/1400/2000 px
  assets/fonts/  Outfit and Hanken Grotesk (variable, latin)
  _headers       security and cache headers
  _redirects     old .asp addresses → new pages
```

## Edit, build, deploy

```bash
node build.mjs          # regenerate public/ after editing src/ or assets
npx wrangler deploy     # publish (needs a Cloudflare login)
```

Edit text in `src/pages/*.html`. Phone, address and the client-area link are in `CONFIG` at the top of `build.mjs`.
The stylesheet and script are cache-busted automatically by a hash added during the build.

To preview locally: `cd public && python3 -m http.server 4300`, then open http://localhost:4300.

## Settings to review

- **Contact and careers forms** send email through [Web3Forms](https://web3forms.com). The access key is `FORM_KEY` at the top of `public/assets/site.js`; the messages go to the address the key was created with. Create a key with the address that should receive inquiries and replace it.
- **Área de clientes** links to the login on Datatech's existing server (`CONFIG.clientArea` in `build.mjs`). Before `datatech.com.ar` points to this site, that server needs its own address (for example `clientes.datatech.com.ar`), and `CONFIG.clientArea` must be updated to it.
- **Photos** are from Unsplash (free license, no attribution required) and can be replaced with photos of real client institutions.

## Moving datatech.com.ar to this site

1. Give the old server a separate hostname for the client area, and update `CONFIG.clientArea`.
2. Add the domain to Cloudflare, then add these routes to `wrangler.jsonc` and deploy:
   `{ "pattern": "datatech.com.ar", "custom_domain": true }` and `{ "pattern": "www.datatech.com.ar", "custom_domain": true }`.
3. Remove the `datatech.matiasd.com` block from `public/_headers` if the preview is retired.
