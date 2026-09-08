var CALC = {
  SEMANAS_POR_ANIO: 52,

  convertir: function (monto, tipoCambio, comisionPct) {
    var com = Math.min(Math.max(comisionPct || 0, 0), 99);
    var bruto = monto * tipoCambio;
    var neto = bruto * (1 - com / 100);
    return { bruto: bruto, neto: neto, comision: bruto - neto };
  },

  tarifaInversa: function (o) {
    var vacaciones = o.vacaciones || 0;
    var gastos = o.gastos || 0;
    var margen = o.margen || 0;
    var semanas = Math.max(1, CALC.SEMANAS_POR_ANIO - vacaciones / 5);
    var horasMes = o.horasSemana * semanas / 12;
    var necesarioMes = (o.objetivo + gastos) * (1 + margen / 100);
    return { tarifa: necesarioMes / horasMes, horasMes: horasMes, necesarioMes: necesarioMes };
  },

  presupuesto: function (o) {
    var base = o.horas * o.tarifa;
    var imprevistos = base * (o.margen || 0) / 100;
    var total = base + imprevistos + (o.gastos || 0);
    return { base: base, imprevistos: imprevistos, total: total, anticipo: total * (o.adelanto || 0) / 100 };
  },

  posicionEnRango: function (tarifa, lo, hi) {
    if (tarifa < lo) return "bajo";
    if (tarifa > hi) return "alto";
    return "dentro";
  }
};
if (typeof module !== "undefined") module.exports = CALC;
