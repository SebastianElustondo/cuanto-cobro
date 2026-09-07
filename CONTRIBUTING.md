# Contribuir

Gracias por pasar. Este proyecto es chico a propósito; las contribuciones más valiosas son las que lo mantienen así y correcto.

## Qué es bienvenido

- **Datos desactualizados**: escalas del monotributo, comisiones de plataformas, rangos de referencia. Abrí un issue con la fuente oficial (link) y la fecha de vigencia.
- **Errores en una cuenta**: si un resultado está mal, decí qué ingresaste, qué salió y qué esperabas. Mejor todavía si agregás el caso a `test.js`.
- **Accesibilidad, rendimiento, textos**: bienvenidos con la medición o el motivo.
- **Guías nuevas**: primero un issue con el tema y por qué le sirve a un freelancer argentino.

## Qué no va a entrar

- Frameworks, bundlers, preprocesadores o dependencias en producción. El sitio es HTML, CSS y JS ES5 sin build, y esa es una decisión, no una deuda (ver "Decisiones" en el README).
- Publicidad, tracking o cookies.
- Sintaxis moderna en `js/`: tiene que correr en teléfonos viejos tal como está.

## Cómo trabajar

```bash
git clone https://github.com/SebastianElustondo/cuanto-cobro
cd cuanto-cobro
npm ci
python3 -m http.server 8080   # http://localhost:8080
```

Antes de abrir el pull request:

```bash
npm test && npm run lint && npm run lint:html && npm run check:links
```

El CI corre eso mismo más Lighthouse. Un PR pequeño con un solo cambio se revisa rápido; uno que mezcla varias cosas, no.

## Estilo

- Español rioplatense en textos y comentarios, con voseo. Código en español también (nombres de funciones y variables), salvo APIs del navegador.
- Las fórmulas van en `js/calc.js` o `js/monotributo-data.js` como funciones puras, con su test.
- Todo dato oficial lleva fuente y fecha de vigencia en un comentario.
