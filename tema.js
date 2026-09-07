/*
 * Tema claro/oscuro compartido por todas las páginas.
 * Se carga en el <head> sin defer a propósito: aplica el tema guardado antes
 * del primer render y así no hay destello de fondo claro en modo oscuro.
 */
(function () {
  "use strict";
  var raiz = document.documentElement;

  function esOscuro() {
    return raiz.getAttribute("data-tema") === "oscuro";
  }

  try {
    var t = localStorage.getItem("cc-tema");
    if (t === "oscuro" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      raiz.setAttribute("data-tema", "oscuro");
    }
  } catch (e) {}

  function reflejar(boton) {
    boton.setAttribute("aria-pressed", esOscuro() ? "true" : "false");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var boton = document.getElementById("btn-tema");
    if (!boton) return;
    reflejar(boton);
    boton.addEventListener("click", function () {
      var oscuro = esOscuro();
      if (oscuro) raiz.removeAttribute("data-tema");
      else raiz.setAttribute("data-tema", "oscuro");
      try { localStorage.setItem("cc-tema", oscuro ? "claro" : "oscuro"); } catch (e) {}
      reflejar(boton);
    });
  });
})();
