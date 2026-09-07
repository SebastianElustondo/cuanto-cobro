/*
 * Utilidades compartidas por todas las herramientas: acceso al DOM, lectura
 * de números tal como los escribe un usuario argentino (coma decimal) y
 * formato de moneda en es-AR.
 */
var UTIL = {
  byId: function (id) {
    return document.getElementById(id);
  },

  // "1.234,5" o "1234.5" → 1234.5; null si está vacío, es negativo o no es número
  leerNumero: function (el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v >= 0 ? v : null;
  },

  // $ 1.500 / US$ 21,55 (dos decimales solo en montos chicos)
  formatearMoneda: function (valor, moneda, decimales) {
    return valor.toLocaleString("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: typeof decimales === "number" ? decimales : (valor < 100 ? 2 : 0)
    });
  }
};
if (typeof module !== "undefined") module.exports = UTIL;
