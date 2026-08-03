/*
 * ¿Cuánto cobro? — lógica de la calculadora.
 * Sin dependencias. Cotizaciones desde https://dolarapi.com/v1/dolares
 * Respuesta confirmada: array de objetos
 *   { moneda, casa, nombre, compra, venta, fechaActualizacion }
 * con casas: oficial, blue, bolsa (MEP), contadoconliqui, mayorista, cripto, tarjeta.
 */
(function () {
  "use strict";

  var API_URL = "https://dolarapi.com/v1/dolares";
  var CASAS = ["blue", "oficial", "bolsa"];
  var WEEKS_PER_MONTH = 4.33;

  var state = {
    rates: {},        // casa -> { compra, venta, nombre, fecha }
    selectedCasa: "blue",
    manualRate: null, // número si el usuario carga cotización a mano
    apiOk: false
  };

  // ---------- Helpers ----------

  function $(id) {
    return document.getElementById(id);
  }

  function fmtARS(value) {
    return value.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    });
  }

  function fmtUSD(value) {
    return value.toLocaleString("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    });
  }

  function parseInput(el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v > 0 ? v : null;
  }

  // Cotización activa: venta de la casa seleccionada, o la manual.
  function currentRate() {
    if (state.manualRate) return state.manualRate;
    var r = state.rates[state.selectedCasa];
    return r ? r.venta : null;
  }

  function currentRateLabel() {
    if (state.manualRate) return "cotización manual";
    var r = state.rates[state.selectedCasa];
    return r ? "dólar " + r.nombre.toLowerCase() + " (venta)" : "";
  }

  // ---------- Cotizaciones ----------

  function loadRates() {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller
      ? setTimeout(function () { controller.abort(); }, 8000)
      : null;

    fetch(API_URL, controller ? { signal: controller.signal } : {})
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("Formato inesperado");
        data.forEach(function (item) {
          if (item && item.casa && isFinite(item.venta)) {
            state.rates[item.casa] = {
              compra: item.compra,
              venta: item.venta,
              nombre: item.nombre || item.casa,
              fecha: item.fechaActualizacion || null
            };
          }
        });
        if (!state.rates.blue && !state.rates.oficial && !state.rates.bolsa) {
          throw new Error("Sin cotizaciones útiles");
        }
        state.apiOk = true;
        renderRates();
      })
      .catch(function () {
        showManualFallback();
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        recalcAll();
      });
  }

  function renderRates() {
    $("rates-status").hidden = true;
    $("rates-grid").hidden = false;
    $("rate-hint").hidden = false;

    var latest = null;
    CASAS.forEach(function (casa) {
      var r = state.rates[casa];
      if (!r) return;
      $("rate-" + casa).textContent = fmtARS(r.venta);
      $("rate-" + casa + "-detail").textContent = "compra " + fmtARS(r.compra);
      if (r.fecha && (!latest || r.fecha > latest)) latest = r.fecha;
    });

    if (latest) {
      var d = new Date(latest);
      $("rates-updated").textContent =
        "Actualizado: " + d.toLocaleDateString("es-AR") + " " +
        d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
    }

    updateSelectedCard();
  }

  function showManualFallback() {
    state.apiOk = false;
    $("rates-status").textContent =
      "No pudimos obtener la cotización en este momento. Ingresala manualmente y la calculadora funciona igual.";
    $("manual-rate").hidden = false;
  }

  function updateSelectedCard() {
    var cards = document.querySelectorAll(".rate-card");
    Array.prototype.forEach.call(cards, function (card) {
      card.classList.toggle(
        "selected",
        !state.manualRate && card.getAttribute("data-casa") === state.selectedCasa
      );
    });
    $("selected-rate-label").textContent = currentRateLabel() || "—";
  }

  // ---------- Conversor: USD/h -> ARS ----------

  function recalcConversor() {
    var out = $("resultado-conversor");
    var usdHora = parseInput($("usd-hora"));
    var horasSemana = parseInput($("horas-semana-conv"));
    var rate = currentRate();

    if (!usdHora) {
      out.hidden = true;
      return;
    }

    // Hay tarifa pero todavía no hay cotización: avisar en vez de quedarse mudo.
    if (!rate) {
      $("conv-ars-hora").textContent = "—";
      $("conv-ars-mes").textContent = "—";
      $("conv-usd-mes").textContent = "";
      $("conv-cotizacion-usada").textContent = state.apiOk
        ? "Tocá una cotización arriba para calcular."
        : "Esperando la cotización del dólar… Si no carga, ingresala manualmente arriba.";
      out.hidden = false;
      return;
    }

    var arsHora = usdHora * rate;
    $("conv-ars-hora").textContent = fmtARS(arsHora);

    if (horasSemana) {
      var horasMes = horasSemana * WEEKS_PER_MONTH;
      $("conv-ars-mes").textContent = fmtARS(arsHora * horasMes);
      $("conv-usd-mes").textContent = "(" + fmtUSD(usdHora * horasMes) + ")";
    } else {
      $("conv-ars-mes").textContent = "—";
      $("conv-usd-mes").textContent = "";
    }

    $("conv-cotizacion-usada").textContent =
      "Calculado con " + currentRateLabel() + ": " + fmtARS(rate) + " por dólar.";
    out.hidden = false;
  }

  // ---------- Calculadora inversa ----------

  function recalcInversa() {
    var out = $("resultado-inversa");
    var objetivo = parseInput($("objetivo-monto"));
    var moneda = $("objetivo-moneda").value;
    var horasSemana = parseInput($("horas-semana-inv"));
    var pct = parseInput($("pct-facturable"));
    var rate = currentRate();

    if (!objetivo || !horasSemana || !pct || pct > 100) {
      out.hidden = true;
      return;
    }

    var horasFacturables = horasSemana * WEEKS_PER_MONTH * (pct / 100);
    if (horasFacturables <= 0) {
      out.hidden = true;
      return;
    }

    var tarifa = objetivo / horasFacturables;
    var detalle =
      "Sobre " + horasFacturables.toFixed(0) + " horas facturables al mes (" +
      horasSemana + " h/semana × 4,33 semanas × " + pct + "% facturable).";

    if (moneda === "USD") {
      $("inv-tarifa").textContent = fmtUSD(tarifa);
      if (rate) detalle += " Equivale a " + fmtARS(tarifa * rate) + " por hora al " + currentRateLabel() + ".";
    } else {
      $("inv-tarifa").textContent = fmtARS(tarifa);
      if (rate) detalle += " Equivale a " + fmtUSD(tarifa / rate) + " por hora al " + currentRateLabel() + ".";
    }

    $("inv-detalle").textContent = detalle;
    out.hidden = false;
  }

  function recalcAll() {
    recalcConversor();
    recalcInversa();
  }

  // ---------- Eventos ----------

  function bindEvents() {
    Array.prototype.forEach.call(document.querySelectorAll(".rate-card"), function (card) {
      card.addEventListener("click", function () {
        state.selectedCasa = card.getAttribute("data-casa");
        state.manualRate = null;
        $("manual-rate-input").value = "";
        updateSelectedCard();
        recalcAll();
      });
    });

    $("manual-rate-input").addEventListener("input", function () {
      state.manualRate = parseInput($("manual-rate-input"));
      updateSelectedCard();
      recalcAll();
    });

    ["usd-hora", "horas-semana-conv"].forEach(function (id) {
      $(id).addEventListener("input", recalcConversor);
    });

    ["objetivo-monto", "horas-semana-inv", "pct-facturable"].forEach(function (id) {
      $(id).addEventListener("input", recalcInversa);
    });
    $("objetivo-moneda").addEventListener("change", recalcInversa);
  }

  bindEvents();
  loadRates();
})();
