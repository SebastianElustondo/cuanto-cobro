const test = require("node:test");
const assert = require("node:assert/strict");
const CALC = require("./js/calc.js");
const MONOTRIBUTO = require("./js/monotributo-data.js");

const cerca = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test("convertir: sin comisión es monto × tipo de cambio", () => {
  const r = CALC.convertir(100, 1500, 0);
  assert.equal(r.bruto, 150000);
  assert.equal(r.neto, 150000);
  assert.equal(r.comision, 0);
});

test("convertir: descuenta la comisión y la acota a 99%", () => {
  cerca(CALC.convertir(100, 1500, 5.4).neto, 141900);
  cerca(CALC.convertir(100, 1000, 250).neto, 1000);
  cerca(CALC.convertir(100, 1000, -10).neto, 100000);
});

test("tarifaInversa: caso base sin vacaciones ni extras", () => {
  const r = CALC.tarifaInversa({ objetivo: 2000, horasSemana: 25 });
  cerca(r.horasMes, 25 * 52 / 12);
  cerca(r.tarifa, 2000 / (25 * 52 / 12));
});

test("tarifaInversa: vacaciones, gastos y margen suben la tarifa", () => {
  const base = CALC.tarifaInversa({ objetivo: 2000, horasSemana: 25 }).tarifa;
  const conVac = CALC.tarifaInversa({ objetivo: 2000, horasSemana: 25, vacaciones: 15 }).tarifa;
  const conGastos = CALC.tarifaInversa({ objetivo: 2000, horasSemana: 25, gastos: 200 }).tarifa;
  const conMargen = CALC.tarifaInversa({ objetivo: 2000, horasSemana: 25, margen: 10 }).tarifa;
  assert.ok(conVac > base && conGastos > base && conMargen > base);
  cerca(conMargen, base * 1.1);
  cerca(conGastos, base * 1.1);
});

test("tarifaInversa: nunca divide por cero aunque las vacaciones sean absurdas", () => {
  const r = CALC.tarifaInversa({ objetivo: 1000, horasSemana: 10, vacaciones: 100000 });
  assert.ok(Number.isFinite(r.tarifa) && r.tarifa > 0);
});

test("presupuesto: desglose y adelanto", () => {
  const p = CALC.presupuesto({ horas: 40, tarifa: 30, margen: 15, gastos: 100, adelanto: 50 });
  assert.equal(p.base, 1200);
  assert.equal(p.imprevistos, 180);
  assert.equal(p.total, 1480);
  assert.equal(p.anticipo, 740);
});

test("posicionEnRango: bordes inclusivos", () => {
  assert.equal(CALC.posicionEnRango(9.99, 10, 20), "bajo");
  assert.equal(CALC.posicionEnRango(10, 10, 20), "dentro");
  assert.equal(CALC.posicionEnRango(20, 10, 20), "dentro");
  assert.equal(CALC.posicionEnRango(20.01, 10, 20), "alto");
});

test("monotributo: la tabla está ordenada y las cuotas crecen", () => {
  const t = MONOTRIBUTO.tabla;
  assert.equal(t.length, 11);
  for (let i = 1; i < t.length; i++) {
    assert.ok(t[i][1] > t[i - 1][1], `tope ${t[i][0]}`);
    assert.ok(t[i][2] >= t[i - 1][2], `cuota servicios ${t[i][0]}`);
    assert.ok(t[i][3] >= t[i - 1][3], `cuota comercio ${t[i][0]}`);
  }
});

test("monotributo: categoría por facturación anual", () => {
  assert.equal(MONOTRIBUTO.categoria(1, true).cat, "A");
  assert.equal(MONOTRIBUTO.categoria(12009410.45, true).cat, "A");
  assert.equal(MONOTRIBUTO.categoria(12009410.46, true).cat, "B");
  const c = MONOTRIBUTO.categoria(20e6, false);
  assert.equal(c.cat, "C");
  assert.equal(c.cuota, 64530.58);
  assert.equal(MONOTRIBUTO.categoria(126610838.76, true), null);
});
