# Seguridad

## Qué protege este sitio

Es un sitio estático sin backend, sin cuentas y sin base de datos. No guarda datos personales: lo único que persiste es, en el `localStorage` del navegador de cada persona, el tema elegido y la última cotización del dólar descargada.

Medidas activas (definidas en `_headers`, aplicadas por Cloudflare Pages):

- `Content-Security-Policy` con `script-src 'self'` sin `unsafe-inline`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'` y `form-action 'self'`. Los únicos orígenes externos permitidos son Google Fonts, DolarApi y Cloudflare Web Analytics.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva.
- Cero dependencias en producción. Las de desarrollo (ESLint, html-validate) no llegan al sitio.

## Reportar una vulnerabilidad

Si encontrás algo (por ejemplo, una forma de inyectar contenido a través de los parámetros de la URL que la calculadora restaura, o una cabecera mal configurada), escribí a **sebastianelustondo@gmail.com** con el asunto "cuanto-cobro: seguridad". No abras un issue público hasta que esté corregido.

Respuesta en menos de 72 horas. Al ser un proyecto personal no hay programa de recompensas, pero el reporte queda acreditado en el changelog si querés.
