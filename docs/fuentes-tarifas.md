# Fuentes de las tarifas de referencia

Las páginas de `/tarifas/` solo citan valores publicados por una entidad identificable, con fecha. Cada cifra del sitio tiene que poder encontrarse en una de estas fuentes. Última verificación: **11/11/2026**.

| Fuente | Qué publica | Vigencia leída | Dónde se usa | URL |
|---|---|---|---|---|
| CPCIBA (Consejo Profesional de Ciencias Informáticas de la Provincia de Buenos Aires) | Honorario mensual y hora mínima y máxima por rol, en pesos | "Actualización Noviembre 2026" | programador, diseñador, community manager, índice | https://plataforma.cpciba.org.ar/autogestion/honorarios (datos en `/autogestion/honorarios/index_table/`) |
| CTPCBA (Colegio de Traductores Públicos de la Ciudad de Buenos Aires) | Aranceles mínimos orientativos: por palabra, por foja, por minuto | 1/9/2026 | traductor, índice (subtitulado) | https://www.traductores.org.ar/matriculados/aranceles-orientativos/ |
| AATI (Asociación Argentina de Traductores e Intérpretes) | Aranceles orientativos mínimos por palabra | 10/10/2026 | traductor | https://aati.org.ar/aranceles-orientativos |
| FCEDU-UNER y SETPyC | Tarifario sugerido de periodismo y comunicación (Entre Ríos), bandas mínimas | "Actualización AGOSTO 2026" | diseñador, community manager, índice (redacción y video) | https://www.fcedu.uner.edu.ar/wp-content/uploads/2026/08/Tarifario-Agosto.pdf |

La encuesta de sueldos de Sysarmy y openqube está enlazada desde la página de programador como lectura, sin cifras.

## Lo que quedó afuera y por qué

- **Tarifarios web sin entidad ni metodología** (tarifario.org y similares): no se citan.
- **Redacción publicitaria por palabra y edición de video freelance**: no se encontró un tarifario 2026 publicado por una entidad. El índice lo dice y muestra lo poco que hay con fuente.
- **Corrección de textos y nota periodística** del tarifario de la UNER: las columnas del PDF son ambiguas al extraer el texto; no se publican hasta leerlas en el original.

## Cómo actualizar

1. Abrir cada URL y comparar con las cifras de las páginas. El CPCIBA actualiza varias veces por año; el CTPCBA y la AATI, cada pocos meses.
2. Cambiar las cifras, la fecha de vigencia en el texto y en las notas de fuente, `dateModified` en el JSON-LD y `lastmod` en `sitemap.xml`.
3. Las cifras del CPCIBA aparecen también en los enlaces precargados al presupuestador y a la calculadora (`tarifa=` y `objetivo=`).
4. Si una fuente deja de publicar o pasa más de seis meses sin actualizar, decirlo en la página en vez de dejar el número viejo como vigente.
