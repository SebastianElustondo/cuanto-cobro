/*
 * Escalas del monotributo (ARCA), vigentes desde el 1/8/2026.
 * Única fuente para la calculadora de monotributo y el comparador
 * empleado vs freelance. Al actualizar las escalas, tocar solo este archivo.
 *
 * Cada fila: [categoría, tope de facturación anual, cuota servicios, cuota comercio]
 * La cuota incluye impuesto integrado + aporte jubilatorio + obra social.
 */
var MONOTRIBUTO = {
  vigencia: "1/8/2026",
  tabla: [
    ["A", 12009410.45, 49527.18, 49527.18],
    ["B", 17595182.74, 56379.08, 56379.08],
    ["C", 24670494.31, 66020.12, 64530.58],
    ["D", 30628651.43, 84612.93, 82564.81],
    ["E", 36028231.33, 119811.45, 108267.51],
    ["F", 45151659.41, 150784.21, 129930.65],
    ["G", 53995798.87, 230312.94, 158815.05],
    ["H", 81924660.37, 522706.68, 317895.01],
    ["I", 91699761.90, 963747.86, 474992.78],
    ["J", 105012519.20, 1167299.76, 580793.69],
    ["K", 126610838.75, 1614446.04, 702103.24]
  ],
  // categoría y cuota mensual para una facturación anual; null si supera K
  categoria: function (facturacionAnual, esServicios) {
    for (var i = 0; i < this.tabla.length; i++) {
      var f = this.tabla[i];
      if (facturacionAnual <= f[1]) {
        return { cat: f[0], tope: f[1], cuota: esServicios ? f[2] : f[3] };
      }
    }
    return null;
  }
};
if (typeof module !== "undefined") module.exports = MONOTRIBUTO;
