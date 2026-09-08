(function () {
  "use strict";
  var $ = UTIL.byId;
  function num(id) { return UTIL.leerNumero($(id)); }
  function fmt(v, m) { return UTIL.formatearMoneda(v, m); }
  var ultimo = "";

  function calc() {
    var horas = num("horas"), tarifa = num("tarifa");
    var margen = num("margen") || 0, gastos = num("gastos") || 0, adelanto = num("adelanto") || 0;
    var m = $("moneda").value;
    $("gastos-mon").textContent = m;
    var res = $("res");
    if (!horas || !tarifa) { res.hidden = true; $("acciones").hidden = true; return; }
    var p = CALC.presupuesto({horas: horas, tarifa: tarifa, margen: margen, gastos: gastos, adelanto: adelanto});
    var base = p.base, imprevistos = p.imprevistos, total = p.total, anticipo = p.anticipo;
    $("res-total").textContent = fmt(total, m);
    var d = horas + " hs × " + fmt(tarifa, m) + " = " + fmt(base, m);
    if (margen > 0) d += " · imprevistos " + margen + "%: " + fmt(imprevistos, m);
    if (gastos > 0) d += " · gastos: " + fmt(gastos, m);
    if (adelanto > 0) d += ". Adelanto sugerido (" + adelanto + "%): " + fmt(anticipo, m) + " antes de empezar.";
    $("res-detalle").textContent = d;
    ultimo = "Presupuesto\n" +
      "Trabajo estimado: " + horas + " hs x " + fmt(tarifa, m) + " = " + fmt(base, m) + "\n" +
      (margen > 0 ? "Margen de imprevistos (" + margen + "%): " + fmt(imprevistos, m) + "\n" : "") +
      (gastos > 0 ? "Gastos directos: " + fmt(gastos, m) + "\n" : "") +
      "TOTAL: " + fmt(total, m) +
      (adelanto > 0 ? "\nAdelanto para comenzar (" + adelanto + "%): " + fmt(anticipo, m) : "");
    res.hidden = false;
    $("acciones").hidden = false;
  }

  ["horas", "tarifa", "margen", "gastos", "adelanto"].forEach(function (id) {
    $(id).addEventListener("input", calc);
  });
  $("moneda").addEventListener("change", calc);
  $("btn-pdf").addEventListener("click", function () {
    var horas = num("horas"), tarifa = num("tarifa");
    if (!horas || !tarifa) return;
    var margen = num("margen") || 0, gastos = num("gastos") || 0, adelanto = num("adelanto") || 0;
    var m = $("moneda").value;
    var p = CALC.presupuesto({horas: horas, tarifa: tarifa, margen: margen, gastos: gastos, adelanto: adelanto});
    var base = p.base, imprevistos = p.imprevistos, total = p.total;
    var hoy = new Date().toLocaleDateString("es-AR");
    var filas = "<tr><td>Trabajo estimado (" + horas + " hs \u00d7 " + fmt(tarifa, m) + ")</td><td>" + fmt(base, m) + "</td></tr>";
    if (margen > 0) filas += "<tr><td>Margen de imprevistos (" + margen + "%)</td><td>" + fmt(imprevistos, m) + "</td></tr>";
    if (gastos > 0) filas += "<tr><td>Gastos directos</td><td>" + fmt(gastos, m) + "</td></tr>";
    filas += "<tr class=hp-total><td>TOTAL</td><td>" + fmt(total, m) + "</td></tr>";
    if (adelanto > 0) filas += "<tr><td>Adelanto para comenzar (" + adelanto + "%)</td><td>" + fmt(p.anticipo, m) + "</td></tr>";
    document.getElementById("hoja-presupuesto").innerHTML =
      "<h1>Presupuesto</h1><p class=hp-meta>Fecha: " + hoy + " \u00b7 Validez sugerida: 30 d\u00edas</p>" +
      "<table>" + filas + "</table>" +
      "<p class=hp-pie>Presupuesto orientativo generado con cobro.quovra.com \u00b7 No incluye impuestos salvo indicaci\u00f3n.</p>";
    window.print();
  });

  function aviso(msg) {
    $("aviso").textContent = msg;
    setTimeout(function () { $("aviso").textContent = ""; }, 1800);
  }
  function copiarFallback(texto) {
    var ta = document.createElement("textarea");
    ta.value = texto; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "-1000px";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    aviso(ok ? "Desglose copiado" : "No se pudo copiar");
  }
  $("btn-copiar").addEventListener("click", function () {
    if (!ultimo) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ultimo).then(function () { aviso("Desglose copiado"); })
        .catch(function () { copiarFallback(ultimo); });
    } else {
      copiarFallback(ultimo);
    }
  });
})();
