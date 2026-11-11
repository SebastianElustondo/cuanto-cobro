(function () {
  "use strict";
  var $ = UTIL.byId;
  function num(id) { return UTIL.leerNumero($(id)); }
  function ars(v) { return UTIL.formatearMoneda(v, "ARS", 0); }
  function usd(v) { return UTIL.formatearMoneda(v, "USD", 0); }

  var ETIQUETAS = { bolsa: "dólar MEP", oficial: "dólar oficial", blue: "dólar blue", cripto: "dólar cripto" };
  var cotizaciones = {};

  function esManual() { return $("casa").value === "personalizado"; }

  function tipoCambio() {
    if (esManual()) return num("cambio-manual");
    return cotizaciones[$("casa").value] || null;
  }

  function etiquetaCambio() {
    return esManual() ? "tipo de cambio que cargaste" : ETIQUETAS[$("casa").value];
  }

  function mostrarManual() {
    $("grupo-manual").classList.toggle("oculto", !esManual());
  }

  function pintarSelect() {
    var sel = $("casa");
    for (var i = 0; i < sel.options.length; i++) {
      var opt = sel.options[i];
      if (cotizaciones[opt.value]) {
        opt.textContent = ETIQUETAS[opt.value].replace("dólar", "Dólar") + " — " + ars(cotizaciones[opt.value]);
      }
    }
  }

  function mostrar(titulo, cifra, unidad, detalle) {
    $("res-etiqueta").textContent = titulo;
    $("res-cifra").textContent = cifra;
    $("res-unidad").textContent = unidad;
    $("res-detalle").textContent = detalle;
    $("res").hidden = false;
  }

  function sincronizarModo() {
    var oferta = $("modo").value === "oferta";
    $("monto-label").textContent = oferta ? "Lo que te ofrecen por mes" : "Tu sueldo neto mensual (de bolsillo)";
    $("monto-sufijo").textContent = oferta ? "USD" : "ARS";
    $("monto").placeholder = oferta ? "3.000" : "2.500.000";
  }

  function calc() {
    var monto = num("monto");
    var tc = tipoCambio();
    if (!monto || monto <= 0) { $("res").hidden = true; return; }
    if (!tc || tc <= 0) {
      mostrar("Falta la cotización", "—", "", "No pudimos obtener el dólar. Elegí “Personalizado” e ingresá el tipo de cambio a mano.");
      return;
    }
    var tcOficial = cotizaciones.oficial || tc;
    var comision = num("comision") || 0;
    var prepaga = num("prepaga") || 0;
    var colchon = num("colchon") || 0;
    var netoPorDolar = CALC.convertir(1, tc, comision).neto;
    var fueraDeEscala = "Con esa facturación superás el tope del monotributo (categoría K): corresponde régimen general y la cuenta cambia. Consultá a un contador.";
    var cat;

    if ($("modo").value === "oferta") {
      cat = MONOTRIBUTO.categoria(monto * 12 * tcOficial, true);
      if (!cat) { mostrar("Fuera del monotributo", "—", "", fueraDeEscala); return; }
      var cobrado = monto * netoPorDolar;
      var sueldo = CALC.sueldoEquivalente({ ingreso: cobrado, cuota: cat.cuota, prepaga: prepaga, colchon: colchon });
      if (sueldo <= 0) {
        mostrar("No alcanza", "—", "", "Con esos números, lo que cobrás no cubre la cuota de monotributo y la prepaga.");
        return;
      }
      mostrar("Equivale a un sueldo neto de", ars(sueldo), " por mes",
        usd(monto) + " al " + etiquetaCambio() + " (" + ars(tc) + ")" +
        (comision > 0 ? ", menos " + comision + "% de comisión," : "") +
        " son " + ars(cobrado) + " en mano. De ahí sale el monotributo categoría " + cat.cat + " (" + ars(cat.cuota) + " por mes)" +
        (prepaga > 0 ? ", la prepaga" : "") +
        (colchon > 0 ? ", un colchón de " + colchon + "%" : "") +
        " y el aguinaldo que ya no vas a cobrar. Categoría estimada con el dólar oficial (" + ars(tcOficial) + ").");
      return;
    }

    var objetivo = CALC.objetivoFreelance({ sueldo: monto, prepaga: prepaga, colchon: colchon });
    var pedir = objetivo / netoPorDolar;
    for (var i = 0; i < 6; i++) {
      cat = MONOTRIBUTO.categoria(pedir * 12 * tcOficial, true);
      if (!cat) break;
      pedir = (objetivo + cat.cuota) / netoPorDolar;
    }
    if (!cat) { mostrar("Fuera del monotributo", "—", "", fueraDeEscala); return; }
    mostrar("Pedí al menos", usd(pedir), " por mes",
      "Para igualar " + ars(monto) + " de bolsillo necesitás " + ars(objetivo + cat.cuota) + " por mes: tu sueldo, el aguinaldo proporcional (" + ars(monto / 12) + ")" +
      (prepaga > 0 ? ", la prepaga" : "") +
      (colchon > 0 ? ", " + colchon + "% de colchón" : "") +
      " y el monotributo categoría " + cat.cat + " (" + ars(cat.cuota) + " por mes). Al " + etiquetaCambio() + " (" + ars(tc) + ")" +
      (comision > 0 ? " y con " + comision + "% de comisión de cobro" : "") +
      " son " + usd(pedir) + " por mes, " + usd(pedir * 12) + " por año. Categoría estimada con el dólar oficial (" + ars(tcOficial) + ").");
  }

  ["monto", "cambio-manual", "comision", "prepaga", "colchon"].forEach(function (id) {
    $(id).addEventListener("input", calc);
  });
  $("modo").addEventListener("change", function () { sincronizarModo(); calc(); });
  $("casa").addEventListener("change", function () { mostrarManual(); calc(); });

  sincronizarModo();
  fetch("https://dolarapi.com/v1/dolares")
    .then(function (r) { return r.json(); })
    .then(function (datos) {
      datos.forEach(function (d) {
        if (d && d.casa && isFinite(d.venta)) cotizaciones[d.casa] = d.venta;
      });
      pintarSelect();
      calc();
    })
    .catch(function () {
      $("casa").value = "personalizado";
      mostrarManual();
      calc();
    });
})();
