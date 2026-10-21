// Redirects old datatech.com.ar (ASP) addresses that carry a ?Cod= query string,
// which public/_redirects cannot match. Everything else is served from public/.

const PRODUCTS = {
  1: '/soluciones/hospitales-y-sanatorios/',
  2: '/soluciones/laboratorios/',
  3: '/soluciones/medicina-prepaga/',
  4: '/soluciones/centros-de-diagnostico/',
  5: '/soluciones/centros-de-diagnostico/',
};
// News items that became client cases on /casos/.
const CASES = new Set([41, 43, 44, 46, 48, 49]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cod = Number(url.searchParams.get('Cod') ?? url.searchParams.get('cod'));
    const path = url.pathname.toLowerCase();
    let to = null;
    if (path === '/producto_detalle.asp') to = PRODUCTS[cod] || '/soluciones/';
    else if (path === '/novedades_detalle.asp') to = CASES.has(cod) ? '/casos/' : '/';
    if (to) return Response.redirect(new URL(to, url.origin).toString(), 301);
    return env.ASSETS.fetch(request);
  },
};
