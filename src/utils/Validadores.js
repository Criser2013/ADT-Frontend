/**
 * Valida si un texto es un nombre.
 * @param {String} val 
 * @returns Boolean
 */
export function validarNombre (val) {
    const exprReg = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;
    const tam = (val.length > 4) && (val.length < 150);

    return tam && exprReg.test(val) && !validarNumero(val);
}

/**
 * Valida si un texto es un número de teléfono.
 * @param {String} val 
 * @returns Boolean
 */
export function validarTelefono(val) {
    return validarNumero(val) && val.length >= 7 && val.length <= 10;
}

/**
 * Valida si un texto es un número natural.
 * @param {String} val 
 * @returns Boolean
 */
export function validarNumero(val) {
    const exprReg = /^\d+$/;

    return exprReg.test(val);
}

/**
 * Verifica si una fecha es válida.
 * @param {String} val - Fecha como "dd-mm-yyyy"
 */
export function validarFecha(val) {
    const exp = /^([0-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-(\d{4})$/;

    return exp.test(val);
}