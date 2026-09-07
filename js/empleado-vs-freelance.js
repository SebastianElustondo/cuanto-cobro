/* Empleado vs freelance: cuánto facturar para igualar un sueldo neto, monotributo incluido. */
(function () {
  "use strict";
  var $ = UTIL.byId;
  function num(id) { return UTIL.leerNumero($(id)); }
  function ars(v) { return UTIL.formatearMoneda(v, "ARS", 0); }

  function cuotaMono(factMensual) {
    return MONOTRIBUTO.categoria(factMensual * 12, true); // null = fuera del monotributo
  }

  var rateBlue = null;
  fetch("https://dolarapi.com/v1/dolares/blue").then(function (r) { return r.json(); })
    .then(function (d) { if (d && isFinite(d.venta)) { rateBlue = d.venta; calc(); } })
    .catch(function () {});

  function calc() {
    var sueldo = num("sueldo");
    var res = $("res");
    if (!sueldo || sueldo <= 0) { res.hidden = true; return; }
    var prepaga = num("prepaga") || 0;
    var colchon = num("colchon") || 0;
    var horasSem = num("horas-evf") || 25;

    // ingreso objetivo: neto + aguinaldo proporcional + prepaga, con colchón
    var objetivo = (sueldo * 13 / 12 + prepaga) * (1 + colchon / 100);
    // iterar: la facturación necesaria incluye la cuota de monotributo de su propia categoría
    var fact = objetivo, info = null;
    for (var i = 0; i < 6; i++) {
      info = cuotaMono(fact);
      if (!info) break;
      fact = objetivo + info.cuota;
    }
    var horasMes = horasSem * 4.33;
    var tarifa = fact / horasMes;

    $("res-fact").textContent = ars(fact);
    var d;
    if (info) {
      d = "Eso es " + ars(tarifa) + " por hora con " + Math.round(horasMes) +
        " horas facturables al mes. Incluye el aguinaldo proporcional (" + ars(sueldo / 12) + "), " +
        (prepaga > 0 ? "tu prepaga, " : "") +
        (colchon > 0 ? colchon + "% de colchón, " : "") +
        "y la cuota de monotributo categoría " + info.cat + " (" + ars(info.cuota) + "/mes).";
      if (rateBlue) d += " Al dólar blue equivale a facturar " + (fact / rateBlue).toLocaleString("es-AR", {style: "currency", currency: "USD", maximumFractionDigits: 0}) + " por mes.";
    } else {
      d = "Esa facturación supera el tope del monotributo: correspondería régimen general y estos números cambian — consultá un contador.";
    }
    $("res-detalle").textContent = d;
    res.hidden = false;
  }

  ["sueldo", "prepaga", "colchon", "horas-evf"].forEach(function (id) {
    $(id).addEventListener("input", calc);
  });
})();
