/**
 * Retonar un array con los JSON dentro de la entrada "datos" que tienen
 * el término de búsqueda proveído en alguno de los campos especificados.
 * @param {Array[JSON]} datos - Datos a buscar.
 * @param {String} termino - Término de búsqueda.
 * @param {Array[String]} campos - Campos en los que se buscará el término.
 * @returns Array
 */
export function buscar(datos, termino, campos) {
    termino = termino.toString();
    termino = termino.trim();

    return datos.filter((i) => {
        for (const campo of campos) {
            const aux = i[campo].toString().toLowerCase();
            if (aux.includes(termino.toLowerCase())) {
                return true;
            }
        }
        return false;
    });
};