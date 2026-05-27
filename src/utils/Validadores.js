/**
 * Valida si un texto es un nombre.
 * @param {String} val Texto a validar
 * @returns {Boolean} True si es un nombre válido, false en caso contrario
 */
export function validarNombre(val) {
    const exprReg = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;
    const tam = (val.length > 4) && (val.length < 150);

    return tam && exprReg.test(val);
}

/**
 * Valida si un texto es un número de teléfono (de 7 o 10 dígitos).
 * @param {String} val Texto a validar
 * @returns {Boolean} True si es un número de teléfono válido, false en caso contrario
 */
export function validarTelefono(val) {
    return validarNumero(val) && (val.length == 7 || val.length == 10);
}

/**
 * Valida si un texto es un número natural.
 * @param {String} val Texto a validar
 * @returns {Boolean} True si es un número natural válido, false en caso contrario
 */
export function validarNumero(val) {
    const exprReg = /^\d+$/;
    return exprReg.test(val);
}

/**
 * Verifica si una fecha es válida.
 * @param {String} val Fecha como "dd-mm-yyyy"
 * @return {Boolean} True si la fecha es válida, false en caso contrario
 */
export function validarFecha(val) {
    const exp = /^((0[1-9])|([1-2][0-9])|(3[0-1]))-((0[1-9])|(1[0-2]))-(\d{4})$/;
    return exp.test(val);
};

/**
 * Valida si un texto es un número decimal positivo (puede o no tener parte decimal,
 * no importa si se usa coma o punto como separador decimal).
 * @param {String} val Texto a validar
 * @returns {Boolean} True si es un número decimal positivo válido, false en caso contrario
 */
export function validarFloatPos(val) {
    val = val.replace(",", ".");
    const exp = /^\d+((\.\d+)?)$/;
    return exp.test(val);
};

/**
 * Valida que un texto es un UUID.
 * @param {String} val Texto a validar
 * @returns {Boolean} True si el texto es un UUID válido, false en caso contrario
 */
export function validarId(val) {
    const exp = /^([a-zA-Z0-9]){8}-([a-zA-Z0-9]){4}-([a-zA-Z0-9]){4}-([a-zA-Z0-9]){4}-([a-zA-Z0-9]){12}$/;
    return exp.test(val);
};