/*
 * ¿Cuánto cobro? — lógica de la calculadora ("editorial financiera").
 * Sin dependencias. Cotizaciones desde https://dolarapi.com/v1/dolares
 * Respuesta confirmada: array de objetos
 *   { moneda, casa, nombre, compra, venta, fechaActualizacion }
 * con casas: oficial, blue, bolsa (MEP), contadoconliqui, mayorista, cripto, tarjeta.
 */
(function () {
  "use strict";

  var API_URL = "https://dolarapi.com/v1/dolares";
  var CASAS = ["blue", "bolsa", "oficial", "cripto"];
  var ETIQUETAS = { blue: "Blue", bolsa: "MEP", oficial: "Oficial", cripto: "Cripto" };
  var NOMBRES = {
    blue: "dólar blue vendedor",
    bolsa: "dólar MEP vendedor",
    oficial: "dólar oficial vendedor",
    cripto: "dólar cripto vendedor"
  };
  var WEEKS_PER_YEAR = 52;

  // Rangos de referencia por rubro y seniority (USD por hora, clientes del
  // exterior). Misma tabla que se muestra en "Tarifas de referencia".
  var RUBROS = {
    "dev-jr": [10, 20], "dev-ssr": [20, 40], "dev-sr": [40, 60],
    "dis-jr": [8, 15],  "dis-ssr": [15, 28], "dis-sr": [28, 40],
    "red-jr": [5, 12],  "red-ssr": [12, 20], "red-sr": [20, 30],
    "mkt-jr": [8, 15],  "mkt-ssr": [15, 30], "mkt-sr": [30, 45]
  };
  // valores que usaban los enlaces compartidos antes de tener claves por rubro
  var RUBROS_LEGADO = {
    "10-20": "dev-jr", "20-40": "dev-ssr", "40-60": "dev-sr",
    "8-15": "dis-jr", "15-28": "dis-ssr", "28-40": "dis-sr",
    "5-12": "red-jr", "12-20": "red-ssr", "20-30": "red-sr",
    "8-15m": "mkt-jr", "15-30": "mkt-ssr", "30-45": "mkt-sr"
  };

  var state = {
    rates: {},          // casa -> { venta, fecha }
    fechaRates: null,   // Date de la cotización más nueva
    tab: "convertir"
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
      maximumFractionDigits: value < 100 ? 2 : 0
    });
  }

  function parseInput(el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v >= 0 ? v : null;
  }

  // Cotización activa según el select (o la manual)
  function currentRate() {
    var casa = $("casa-cambio").value;
    if (casa === "personalizado") return parseInput($("cambio-manual"));
    var r = state.rates[casa];
    return r ? r.venta : null;
  }

  function currentRateLabel() {
    var casa = $("casa-cambio").value;
    if (casa === "personalizado") return "tipo de cambio personalizado";
    return NOMBRES[casa] || "";
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
        var latest = null;
        data.forEach(function (item) {
          if (item && item.casa && isFinite(item.venta)) {
            state.rates[item.casa] = {
              venta: item.venta,
              fecha: item.fechaActualizacion || null
            };
            if (item.fechaActualizacion && (!latest || item.fechaActualizacion > latest)) {
              latest = item.fechaActualizacion;
            }
          }
        });
        if (!state.rates.blue && !state.rates.oficial && !state.rates.bolsa) {
          throw new Error("Sin cotizaciones útiles");
        }
        state.fechaRates = latest ? new Date(latest) : null;
        renderFranja();
        renderSelect();
        loadMonedas();
      })
      .catch(function () {
        $("franja-valores").textContent =
          "No pudimos obtener la cotización. Elegí “Personalizado” en el tipo de cambio e ingresala a mano: todo sigue funcionando.";
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        recalcAll();
      });
  }

  // ---------- Ticker: los tres dólares + euro y real ----------

  function loadMonedas() {
    fetch("https://dolarapi.com/v1/cotizaciones")
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (data) {
        var MONEDAS = { EUR: "Euro", BRL: "Real", UYU: "Peso uruguayo", CLP: "Peso chileno" };
        var orden = ["EUR", "BRL", "UYU", "CLP"];
        var extras = [];
        if (Array.isArray(data)) {
          orden.forEach(function (cod) {
            data.forEach(function (item) {
              if (item && item.moneda === cod && isFinite(item.venta)) {
                extras.push({ nombre: MONEDAS[cod], venta: item.venta });
              }
            });
          });
        }
        renderTicker(extras);
      })
      .catch(function () { renderTicker([]); });
  }

  function renderTicker(extras) {
    var items = [];
    var nombresTicker = { blue: "Dólar blue", bolsa: "Dólar MEP", oficial: "Dólar oficial", cripto: "Dólar cripto" };
    CASAS.forEach(function (casa) {
      var r = state.rates[casa];
      if (r) items.push({ nombre: nombresTicker[casa], venta: r.venta });
    });
    items = items.concat(extras);
    if (!items.length) return;

    // monedas chicas (peso chileno ~$1,50) necesitan decimales
    function fmtTicker(v) {
      return v.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: v < 100 ? 2 : 0
      });
    }
    var base = items.map(function (it) {
      return '<span class="t-item"><span class="t-nombre">' + it.nombre +
        '</span><span class="t-valor">' + fmtTicker(it.venta) + "</span></span>";
    }).join("");

    // La animación corre hasta -50%, así que cada mitad tiene que cubrir al
    // menos el ancho de la ventana o queda un hueco al final del loop.
    var pista = $("ticker-pista");
    pista.innerHTML = base;
    $("ticker").hidden = false;
    var anchoBase = pista.scrollWidth || 1;
    var copias = Math.max(1, Math.ceil((window.innerWidth * 1.25) / anchoBase));
    var mitad = new Array(copias + 1).join(base);
    pista.innerHTML = mitad + mitad;
    // velocidad constante (~30 px/s) sin importar el ancho de pantalla
    pista.style.animationDuration = Math.round((anchoBase * copias) / 30) + "s";
    state.tickerAncho = anchoBase;
  }

  // si agrandan la ventana, la tanda puede quedar corta: rearmar
  var tickerResizeTimer = null;
  window.addEventListener("resize", function () {
    if (!state.tickerAncho) return;
    clearTimeout(tickerResizeTimer);
    tickerResizeTimer = setTimeout(function () { loadMonedas(); }, 400);
  });

  function renderFranja() {
    var partes = [];
    CASAS.forEach(function (casa) {
      var r = state.rates[casa];
      if (!r) return;
      partes.push(
        '<span class="cot"><span>' + ETIQUETAS[casa] + "</span><b>" +
        fmtARS(r.venta) + "</b></span>"
      );
    });
    $("franja-valores").innerHTML = partes.join("");
    actualizarHaceCuanto();
  }

  function actualizarHaceCuanto() {
    if (!state.fechaRates) return;
    var min = Math.max(0, Math.round((Date.now() - state.fechaRates.getTime()) / 60000));
    var texto;
    if (min < 1) texto = "recién";
    else if (min < 60) texto = "hace " + min + (min === 1 ? " minuto" : " minutos");
    else {
      var hs = Math.round(min / 60);
      texto = "hace " + hs + (hs === 1 ? " hora" : " horas");
    }
    $("franja-meta").textContent = "Actualizado " + texto + " · precio vendedor";
  }

  // el select muestra el precio junto a cada casa cuando ya lo tenemos
  function renderSelect() {
    var sel = $("casa-cambio");
    for (var i = 0; i < sel.options.length; i++) {
      var opt = sel.options[i];
      var r = state.rates[opt.value];
      if (r) {
        opt.textContent =
          "Dólar " + ETIQUETAS[opt.value].toLowerCase() + " — " + fmtARS(r.venta);
      }
    }
  }

  // ---------- Tabs ----------

  function setTab(tab) {
    state.tab = tab;
    var esConv = tab === "convertir";
    $("tab-convertir").classList.toggle("on", esConv);
    $("tab-hora").classList.toggle("on", !esConv);
    $("tab-convertir").setAttribute("aria-selected", esConv ? "true" : "false");
    $("tab-hora").setAttribute("aria-selected", esConv ? "false" : "true");
    $("tab-convertir").tabIndex = esConv ? 0 : -1;
    $("tab-hora").tabIndex = esConv ? -1 : 0;
    $("panel-convertir").hidden = !esConv;
    $("panel-convertir").classList.toggle("oculto", !esConv);
    $("panel-hora").hidden = esConv;
    $("panel-hora").classList.toggle("oculto", esConv);
    recalcAll();
  }

  // el resultado "se apoya" al aparecer: una vez por cálculo, no por tecla
  var REDUCE_MOTION = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mostrarResultado(out) {
    var estabaOculto = out.hidden;
    out.hidden = false;
    if (estabaOculto && !REDUCE_MOTION) {
      out.classList.remove("se-apoya");
      void out.offsetWidth;
      out.classList.add("se-apoya");
    }
  }

  // ---------- Convertir una tarifa ----------

  function recalcConversor() {
    var out = $("resultado-convertir");
    var monto = parseInput($("monto"));
    var rate = currentRate();
    var com = parseInput($("comision")) || 0;

    if (!monto || monto <= 0) {
      out.hidden = true;
      actualizarAcciones();
      return;
    }

    if (!rate) {
      $("conv-resultado").textContent = "—";
      $("conv-detalle").textContent = "Esperando la cotización del dólar… Si no carga, elegí “Personalizado” e ingresala a mano.";
      mostrarResultado(out);
      actualizarAcciones();
      return;
    }

    var bruto = monto * rate;
    var neto = bruto * (1 - Math.min(com, 99) / 100);
    $("conv-resultado").textContent = fmtARS(neto);

    var detalle = "Usando " + currentRateLabel() + " a " + fmtARS(rate) + ".";
    if (com > 0) {
      detalle += " Descontamos " + com + "% de comisión (" + fmtARS(bruto - neto) + ").";
    }
    $("conv-detalle").textContent = detalle;
    mostrarResultado(out);
    actualizarAcciones();
  }

  // ---------- Calcular mi valor por hora ----------

  function recalcInversa() {
    var out = $("resultado-hora");
    var objetivo = parseInput($("objetivo-monto"));
    var moneda = $("objetivo-moneda").value;
    var horasSemana = parseInput($("horas-semana"));
    var vacaciones = parseInput($("vacaciones")) || 0;
    var gastos = parseInput($("gastos")) || 0;
    var margen = parseInput($("margen")) || 0;
    var rate = currentRate();

    if (!objetivo || objetivo <= 0 || !horasSemana || horasSemana <= 0) {
      out.hidden = true;
      actualizarAcciones();
      return;
    }

    // semanas facturables del año: vacaciones en días hábiles (semana de 5)
    var semanas = Math.max(1, WEEKS_PER_YEAR - vacaciones / 5);
    var horasMes = horasSemana * semanas / 12;
    var necesarioMes = (objetivo + gastos) * (1 + margen / 100);
    var tarifa = necesarioMes / horasMes;

    var fmt = moneda === "USD" ? fmtUSD : fmtARS;
    $("inv-resultado").textContent = fmt(tarifa);

    var detalle = "Para alcanzar " + fmt(objetivo) + " mensuales trabajando " +
      Math.round(horasMes) + " horas facturables por mes";
    if (gastos > 0) detalle += ", cubriendo " + fmt(gastos) + " de gastos";
    if (margen > 0) detalle += ", con " + margen + "% de margen";
    detalle += ".";
    if (rate) {
      if (moneda === "USD") {
        detalle += " Equivale a " + fmtARS(tarifa * rate) + " por hora al " + currentRateLabel() + ".";
      } else {
        detalle += " Equivale a " + fmtUSD(tarifa / rate) + " por hora al " + currentRateLabel() + ".";
      }
    }
    $("inv-detalle").textContent = detalle;

    // comparación con el rango del rubro (siempre en USD por hora)
    var ver = $("inv-veredicto");
    var rubro = $("rubro").value;
    var tarifaUSD = moneda === "USD" ? tarifa : (rate ? tarifa / rate : null);
    if (RUBROS[rubro] && tarifaUSD) {
      var lo = RUBROS[rubro][0], hi = RUBROS[rubro][1];
      var rango = "US$ " + lo + "–" + hi;
      if (tarifaUSD < lo) {
        ver.textContent = "▲ Por debajo del rango de tu rubro (" + rango + " por hora): tenés margen para apuntar más alto.";
        ver.className = "veredicto bajo";
      } else if (tarifaUSD > hi) {
        ver.textContent = "◆ Por encima del rango típico (" + rango + " por hora): sostenelo con especialización y portfolio.";
        ver.className = "veredicto ok";
      } else {
        ver.textContent = "✓ Dentro del rango de tu rubro (" + rango + " por hora).";
        ver.className = "veredicto ok";
      }
      ver.hidden = false;
    } else {
      ver.hidden = true;
    }

    mostrarResultado(out);
    actualizarAcciones();
  }

  function recalcAll() {
    recalcConversor();
    recalcInversa();
  }

  // ---------- Acciones: copiar resultado / enlace ----------

  function resultadoVisible() {
    if (state.tab === "convertir") {
      return $("resultado-convertir").hidden ? null :
        $("conv-resultado").textContent + " — " + $("conv-detalle").textContent;
    }
    return $("resultado-hora").hidden ? null :
      $("inv-resultado").textContent + " por hora — " + $("inv-detalle").textContent;
  }

  function actualizarAcciones() {
    $("acciones").hidden = !resultadoVisible();
  }

  function copiar(texto, aviso) {
    function ok() {
      var el = $("aviso-copiado");
      el.textContent = aviso;
      setTimeout(function () { el.textContent = ""; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(ok).catch(function () {});
    }
  }

  function enlaceActual() {
    var p = new URLSearchParams();
    p.set("tab", state.tab);
    if (state.tab === "convertir") {
      if ($("monto").value) p.set("monto", $("monto").value);
      p.set("cambio", $("casa-cambio").value);
      if ($("casa-cambio").value === "personalizado" && $("cambio-manual").value) {
        p.set("valor", $("cambio-manual").value);
      }
      if ($("comision").value) p.set("com", $("comision").value);
    } else {
      if ($("objetivo-monto").value) p.set("objetivo", $("objetivo-monto").value);
      p.set("moneda", $("objetivo-moneda").value);
      p.set("horas", $("horas-semana").value);
      p.set("vac", $("vacaciones").value || "0");
      if ($("gastos").value) p.set("gastos", $("gastos").value);
      p.set("margen", $("margen").value || "0");
      if ($("rubro").value) p.set("rubro", $("rubro").value);
    }
    return location.origin + location.pathname + "?" + p.toString();
  }

  // restaurar un enlace compartido
  function restaurarDesdeURL() {
    var p = new URLSearchParams(location.search);
    if (!p.has("tab")) return;
    if (p.get("tab") === "hora") state.tab = "hora";
    if (p.has("monto")) $("monto").value = p.get("monto");
    if (p.has("cambio")) {
      $("casa-cambio").value = p.get("cambio");
      toggleManual();
      if (p.has("valor")) $("cambio-manual").value = p.get("valor");
    }
    if (p.has("com")) $("comision").value = p.get("com");
    if (p.has("objetivo")) $("objetivo-monto").value = p.get("objetivo");
    if (p.has("moneda")) $("objetivo-moneda").value = p.get("moneda");
    if (p.has("horas")) $("horas-semana").value = p.get("horas");
    if (p.has("vac")) $("vacaciones").value = p.get("vac");
    if (p.has("gastos")) $("gastos").value = p.get("gastos");
    if (p.has("margen")) $("margen").value = p.get("margen");
    if (p.has("rubro")) {
      var rubroURL = p.get("rubro");
      $("rubro").value = RUBROS_LEGADO[rubroURL] || rubroURL;
    }
  }

  // ---------- Tema claro/oscuro ----------

  function reflejarTema() {
    var oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
    $("btn-tema").setAttribute("aria-pressed", oscuro ? "true" : "false");
  }

  function toggleTema() {
    var raiz = document.documentElement;
    var oscuro = raiz.getAttribute("data-tema") === "oscuro";
    if (oscuro) raiz.removeAttribute("data-tema");
    else raiz.setAttribute("data-tema", "oscuro");
    try { localStorage.setItem("cc-tema", oscuro ? "claro" : "oscuro"); } catch (e) {}
    reflejarTema();
  }

  // ---------- Varios ----------

  function toggleManual() {
    var manual = $("casa-cambio").value === "personalizado";
    $("grupo-manual").classList.toggle("oculto", !manual);
  }

  // la moneda de los gastos acompaña a la del objetivo
  function sincronizarMonedaGastos() {
    $("gastos-moneda").textContent = $("objetivo-moneda").value;
  }

  // ---------- Eventos ----------

  function bindEvents() {
    $("tab-convertir").addEventListener("click", function () { setTab("convertir"); });
    $("tab-hora").addEventListener("click", function () { setTab("hora"); });

    // patrón WAI-ARIA de tabs: flechas, Home y End mueven la selección y el foco
    document.querySelector(".tabs").addEventListener("keydown", function (e) {
      var teclas = { ArrowLeft: 1, ArrowRight: 1, Home: 1, End: 1 };
      if (!teclas[e.key]) return;
      e.preventDefault();
      var destino;
      if (e.key === "Home") destino = "convertir";
      else if (e.key === "End") destino = "hora";
      else destino = state.tab === "convertir" ? "hora" : "convertir";
      setTab(destino);
      $("tab-" + destino).focus();
    });

    $("casa-cambio").addEventListener("change", function () {
      toggleManual();
      recalcAll();
    });

    ["monto", "comision", "cambio-manual"].forEach(function (id) {
      $(id).addEventListener("input", recalcConversor);
    });

    ["objetivo-monto", "horas-semana", "vacaciones", "gastos", "margen"].forEach(function (id) {
      $(id).addEventListener("input", recalcInversa);
    });
    $("objetivo-moneda").addEventListener("change", function () {
      sincronizarMonedaGastos();
      recalcInversa();
    });
    $("rubro").addEventListener("change", recalcInversa);

    // chips de comisión típica por plataforma
    Array.prototype.forEach.call(document.querySelectorAll(".chip[data-com]"), function (chip) {
      chip.addEventListener("click", function () {
        $("comision").value = chip.getAttribute("data-com");
        Array.prototype.forEach.call(document.querySelectorAll(".chip[data-com]"), function (c) {
          c.classList.toggle("on", c === chip);
        });
        recalcConversor();
      });
    });
    $("comision").addEventListener("input", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".chip[data-com]"), function (c) {
        c.classList.remove("on");
      });
    });

    $("btn-copiar").addEventListener("click", function () {
      var r = resultadoVisible();
      if (r) copiar(r, "Resultado copiado");
    });
    $("btn-enlace").addEventListener("click", function () {
      copiar(enlaceActual(), "Enlace copiado");
    });

    $("btn-tema").addEventListener("click", toggleTema);
  }

  bindEvents();
  reflejarTema();
  restaurarDesdeURL();
  setTab(state.tab);
  sincronizarMonedaGastos();
  loadRates();
  setInterval(actualizarHaceCuanto, 60000);
})();

/* Tilt 3D de las tarjetas de guías y herramientas (periferia; la
   calculadora no participa). Solo mouse fino, sin reduced-motion. */
(function () {
  "use strict";
  if (!window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var MAX = 5, EASE = 0.1;
  document.querySelectorAll(".card").forEach(function (card) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function frame() {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      card.style.transform = "rotateX(" + cx.toFixed(2) + "deg) rotateY(" + cy.toFixed(2) + "deg)";
      card.style.boxShadow = (-cy * 1.5).toFixed(1) + "px " + (3 + cx * 1.5).toFixed(1) + "px 12px rgba(28, 24, 19, 0.09)";
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.02) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        if (!tx && !ty) { card.style.transform = ""; card.style.boxShadow = ""; }
      }
    }

    function wake() { if (!raf) raf = requestAnimationFrame(frame); }

    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      ty = (Math.max(0, Math.min(1, px)) - 0.5) * 2 * MAX;
      tx = (0.5 - Math.max(0, Math.min(1, py))) * 2 * MAX;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      wake();
    });

    card.addEventListener("pointerleave", function () {
      tx = 0; ty = 0; wake();
    });
  });
})();
