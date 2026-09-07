# ¿Cuánto cobro?

[![CI](https://github.com/SebastianElustondo/cuanto-cobro/actions/workflows/ci.yml/badge.svg)](https://github.com/SebastianElustondo/cuanto-cobro/actions/workflows/ci.yml)

**[cobro.quovra.com](https://cobro.quovra.com)** — herramientas y guías de plata para freelancers argentinos.

[![¿Cuánto cobro? — conversor de tarifa USD/hora a ARS con blue, oficial y MEP](og.png)](https://cobro.quovra.com)

Sitio 100% estático: HTML + CSS + JS vanilla, sin build ni dependencias. Todo corre en el navegador; el único dato externo es la cotización del dólar, que viene de [DolarApi.com](https://dolarapi.com).

## Herramientas

| Página | Qué hace |
|---|---|
| `index.html` | **Conversor de tarifa** (USD/hora → ARS con blue, oficial y MEP en vivo), **calculadora inversa** ("quiero ganar X por mes trabajando Y horas") y **tarifas de referencia** por rubro. |
| `presupuesto.html` | **Presupuestador de proyectos**: horas estimadas, tarifa, margen de imprevistos, gastos directos y adelanto a pedir. |
| `monotributo.html` | **Calculadora de monotributo 2026**: categoría según facturación y cuánto pagás por mes. |
| `empleado-vs-freelance.html` | **Empleado vs freelance**: cuánto tenés que facturar para igualar un sueldo en relación de dependencia. |

Si la API de cotizaciones no responde, cada herramienta muestra un campo para cargar la cotización a mano y sigue funcionando.

## Guías (`guias/`)

Monotributo para freelancers · Factura E y exportación de servicios · Cómo cobrar del exterior (PayPal, Payoneer, Wise, cripto) · Dólar MEP paso a paso · Cómo presupuestar un proyecto · Cómo subirle la tarifa a un cliente.

## Correr local

No hay build. Cualquier servidor estático sirve:

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Tests

Las fórmulas viven en `js/calc.js` y `js/monotributo-data.js` como funciones puras, sin DOM, y se prueban con el runner de Node (sin dependencias):

```bash
npm ci
npm test          # node --test
npm run lint      # eslint (única dependencia de desarrollo)
npm run check     # node --check de cada script
```

El workflow de GitHub Actions corre las dos cosas en cada push y pull request.

## Deploy

Cloudflare Pages, publicando la raíz del repo. `_headers` define CSP y cabeceras de seguridad; `404.html` corta el fallback SPA de Pages. Cada merge a `main` despliega.

## Estructura

```
index.html, presupuesto.html, monotributo.html, empleado-vs-freelance.html   herramientas
guias/                                                                        guías (una página por tema)
js/                                                                           un archivo por herramienta + calc.js (fórmulas), util.js, tema.js, monotributo-data.js
style.css                                                                     estilos compartidos
privacidad.html, privacy.html, sobre.html                                     legales y "sobre"
_headers, robots.txt, sitemap.xml, 404.html                                   infraestructura del sitio
```

## Licencia

MIT. Las cifras de monotributo y las tarifas de referencia son orientativas; verificá siempre contra la fuente oficial.
