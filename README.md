# ¿Cuánto cobro?

Calculadora de tarifas para freelancers argentinos. Sitio 100% estático: HTML + CSS + JS vanilla, sin build ni dependencias.

**Qué hace:**

1. **Conversor de tarifa** — tarifa por hora en USD → equivalente en ARS con cotización en vivo (blue, oficial y MEP) desde [DolarApi.com](https://dolarapi.com).
2. **Calculadora inversa** — "quiero ganar X por mes trabajando Y horas/semana" → tarifa por hora necesaria, con ajuste por % de horas facturables.
3. **Tarifas de referencia** — rangos orientativos por rubro (dev, diseño, redacción, marketing).

Si la API de cotizaciones no responde, la página degrada con elegancia: muestra un campo para ingresar la cotización a mano y todo sigue funcionando.

## Correr local

No hay build. Cualquier servidor estático sirve:

```bash
cd cuanto-cobro
python3 -m http.server 8080
# abrir http://localhost:8080
```

(También funciona abriendo `index.html` directo en el navegador; el fetch a dolarapi.com anda igual porque la API tiene CORS abierto.)

## Deploy en Render (static site)

1. Subí la carpeta a un repo de GitHub.
2. En Render: **New → Static Site**, conectá el repo.
3. Configuración:
   - **Build command:** (vacío)
   - **Publish directory:** `.` (o la subcarpeta si el repo tiene más cosas)
4. Deploy. Opcional: dominio propio en Settings → Custom Domains.

Es el mismo esquema de costo cero que trazoloco.com.

**Pendientes antes de ir a producción:**

- Reemplazar el `href` del `<link rel="canonical">` en `index.html` por el dominio real.
- Reemplazar el bloque comentado "AdSense placeholder" en `index.html` por el snippet real cuando el sitio esté aprobado.

## Keywords SEO objetivo

- **"cuanto cobrar como freelancer argentina"** — intención directa, competencia baja, matchea el h1.
- **"calculadora tarifa freelance"** — término de herramienta, tráfico recurrente.
- **"cuanto cobrar por hora programador / diseñador freelance"** — long-tail por rubro, cubierto por la tabla de referencia.
- **"convertir tarifa dolares a pesos dolar blue"** — captura búsquedas de conversión con intención freelance, cubierto por el conversor con cotización en vivo.

El contenido de la página (guía de 300+ palabras, FAQ con schema.org FAQPage, tabla por rubro) está pensado para rankear en esas variantes y sus combinaciones.
