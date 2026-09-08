var UTIL = {
  byId: function (id) {
    return document.getElementById(id);
  },

  leerNumero: function (el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v >= 0 ? v : null;
  },

  formatearMoneda: function (valor, moneda, decimales) {
    return valor.toLocaleString("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: typeof decimales === "number" ? decimales : (valor < 100 ? 2 : 0)
    });
  }
};
if (typeof module !== "undefined") module.exports = UTIL;
