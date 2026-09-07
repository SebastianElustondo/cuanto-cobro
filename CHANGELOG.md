# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico desde 1.0.0.

## [Sin publicar]

### Agregado
- Enlaces de afiliados de Wise y Binance en la guía de cobros del exterior, con `rel="sponsored"`, aviso de transparencia al pie y política en "Sobre este sitio".

## [1.0.0] — 2026-09-07

Primera versión etiquetada. El sitio está en producción desde agosto de 2026; esta versión marca el momento en que el repo pasó a ser público con licencia, tests y CI.

### Agregado
- Licencia MIT.
- Fórmulas extraídas a `js/calc.js` como funciones puras, con 9 tests (`node --test`).
- Escalas del monotributo en un único archivo, `js/monotributo-data.js`, compartido por las dos herramientas que las usan.
- Última cotización conocida guardada en `localStorage`: si DolarApi no responde, la calculadora sigue con ese valor y avisa su antigüedad.
- Tabs navegables con teclado (flechas, Home, End), enlace "Saltar al contenido" y `aria-pressed` en el botón de tema.
- Fallback de portapapeles cuando la Clipboard API no está disponible.
- CI en GitHub Actions: tests, ESLint, html-validate, chequeo de links internos y Lighthouse con umbrales.
- README con arquitectura y decisiones; CONTRIBUTING, SECURITY y plantillas de issues.

### Cambiado
- Todo el JavaScript en `js/`, sin scripts en línea; el CSP ya no necesita `unsafe-inline`.
- El select de rubros usa claves semánticas en vez de rangos como valor; los enlaces compartidos antiguos siguen funcionando.
- Un único `js/tema.js` para el modo claro/oscuro en todas las páginas (antes estaba copiado en once y faltaba en tres).
- Cajas de texto medidas en `em` en vez de `ch`, ticker con alto reservado y fuentes de respaldo con métricas ajustadas: CLS de 0,16 a 0,03 en la home y de 0,14 a 0,00 en las guías.

### Quitado
- Placeholder de AdSense, configuración de Render y otros restos de despliegues anteriores.
