/* Calculadora de monotributo: categoría y cuota según facturación (datos en monotributo-data.js). */
(function () {
  "use strict";
  var TABLA = MONOTRIBUTO.tabla;
  var $ = UTIL.byId;
  function ars(v) { return UTIL.formatearMoneda(v, "ARS", 0); }

  // tabla visible
  var filas = "";
  for (var i = 0; i < TABLA.length; i++) {
    var f = TABLA[i];
    filas += "<tr><th scope=row>" + f[0] + "</th><td>" + ars(f[1]) + "</td><td>" + ars(f[2]) + "</td><td>" + ars(f[3]) + "</td></tr>";
  }
  $("tabla-mono").innerHTML = filas;

  function calc() {
    var v = parseFloat(String($("fact").value).replace(",", "."));
    var res = $("res"), fuera = $("res-fuera");
    if (!isFinite(v) || v <= 0) { res.hidden = true; fuera.hidden = true; return; }
    var anual = $("fact-periodo").value === "mensual" ? v * 12 : v;
    var mensual = anual / 12;
    var esServ = $("actividad").value === "serv";
    var cat = MONOTRIBUTO.categoria(anual, esServ);
    if (!cat) {
      res.hidden = true;
      $("res-fuera-texto").innerHTML = "Con " + ars(anual) + " anuales superás el tope de la categoría K (" + ars(TABLA[10][1]) + "): quedás fuera del monotributo y corresponde el régimen general (autónomos + IVA + ganancias). Ahí sí o sí conviene un contador.";
      fuera.hidden = false;
      return;
    }
    fuera.hidden = true;
    var cuota = cat.cuota;
    var pct = (cuota / mensual) * 100;
    $("res-cat").textContent = cat.cat;
    $("res-detalle").innerHTML = "Cuota mensual: <strong>" + ars(cuota) + "</strong> (impuesto + jubilación + obra social). Sobre una facturación de " + ars(mensual) + " por mes, la cuota representa el <strong>" + pct.toFixed(1) + "%</strong> de tus ingresos: te quedan " + ars(mensual - cuota) + " antes de tus gastos.";
    res.hidden = false;
  }

  ["fact"].forEach(function (id) { $(id).addEventListener("input", calc); });
  $("fact-periodo").addEventListener("change", calc);
  $("actividad").addEventListener("change", calc);
})();
