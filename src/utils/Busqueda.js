/**
 * Retona un array con los objetos dentro de la entrada "datos" que tienen
 * el término de búsqueda proveído en alguno de los campos especificados.
 * @param {Array[Object]} datos Datos en los que se buscará.
 * @param {String} termino Término de búsqueda.
 * @param {Array[String]} campos Campos (claves del objeto) en los que se buscará el término.
 * @returns {Array[Object]} Array con los objetos que coinciden con la búsqueda.
 */
export function buscar(datos, termino, campos) {
    termino = termino.toString().trim().toLowerCase();

    return datos.filter((i) => {
        for (const campo of campos) {
            const aux = i[campo].toString().toLowerCase();
            if (aux.includes(termino)) {
                return true;
            }
        }
        return false;
    });
};