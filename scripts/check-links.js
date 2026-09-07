#!/usr/bin/env node
/*
 * Chequea que todos los links, scripts, estilos e imágenes internos de las
 * páginas apunten a archivos que existen. Entiende las URLs limpias de
 * Cloudflare Pages (/monotributo → monotributo.html, /guias/ → guias/index.html).
 * Sin dependencias. Sale con código 1 si hay algo roto.
 */
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const paginas = [];
(function recorrer(dir) {
  for (const nombre of fs.readdirSync(dir)) {
    if (["node_modules", ".git", ".wrangler"].includes(nombre)) continue;
    const p = path.join(dir, nombre);
    if (fs.statSync(p).isDirectory()) recorrer(p);
    else if (nombre.endsWith(".html")) paginas.push(p);
  }
})(raiz);

function existe(destino, desde) {
  let ruta = destino.split("#")[0].split("?")[0];
  if (!ruta) return true; // ancla en la misma página
  const base = ruta.startsWith("/") ? raiz : path.dirname(desde);
  ruta = ruta.startsWith("/") ? ruta.slice(1) : ruta;
  const candidatos = [ruta, ruta + ".html", path.join(ruta, "index.html")];
  return candidatos.some((c) => {
    const abs = path.join(base, c);
    return fs.existsSync(abs) && fs.statSync(abs).isFile();
  });
}

const rotos = [];
const patron = /\b(?:href|src)="([^"]+)"/g;
for (const pagina of paginas) {
  const html = fs.readFileSync(pagina, "utf8");
  let m;
  while ((m = patron.exec(html))) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(url)) continue;
    if (!existe(url, pagina)) rotos.push(`${path.relative(raiz, pagina)} → ${url}`);
  }
}

// las URLs del sitemap también tienen que existir
const sitemap = fs.readFileSync(path.join(raiz, "sitemap.xml"), "utf8");
for (const m of sitemap.matchAll(/<loc>https:\/\/cobro\.quovra\.com(\/[^<]*)<\/loc>/g)) {
  if (!existe(m[1], path.join(raiz, "sitemap.xml"))) rotos.push(`sitemap.xml → ${m[1]}`);
}

if (rotos.length) {
  console.error("Links internos rotos:\n  " + rotos.join("\n  "));
  process.exit(1);
}
console.log(`OK: ${paginas.length} páginas, sin links internos rotos.`);
