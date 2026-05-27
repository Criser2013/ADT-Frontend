/**
 * Comparador para ordenar objetos usando un campo numérico o alfanumérico.
 * @param {String|Number} a Valor a comparar
 * @param {String|Number} b Valor a comparar
 * @param {String} campo Campo por el cual se ordenará
 * @returns {Int} 0 para valores iguales, -1 para a < b, 1 para a > b
 */
export function comparadorStrNum(a, b, campo) {
    if (a[campo] <  b[campo]) {
        return -1;
    } else if (a[campo] > b[campo]) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * Comparador para ordenar objetos por un campo numérico o alfanumérico dependiendo
 * del tipo de ordenamiento seleccionado.
 * @param {String} orden Criterio de ordenamiento ("asc" - ascendente, "desc" - descendente)
 * @param {String} campo Campo por el cual se ordenará
 * @returns {Function} Función que recibe 2 valores a comparar, cuyas salidas son 0 para valores iguales, -1 para a < b, 1 para a > b
 */
export function obtenerComparadorStrNum(orden, campo) {
    return (orden == 'desc')
        ? (a, b) => comparadorStrNum(a, b, campo)
        : (a, b) => -comparadorStrNum(a, b, campo);
};