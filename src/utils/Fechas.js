import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

/**
 * Obtiene un objeto con la cantidad de datos por mes.
 * @param {Array[JSON]} datos - Datos con fechas a filtrar.
 * @param {String} clave - Clave del objeto que contiene la fecha.
 * @param {Number} numMesesAtras - Número de meses hacia atrás sin contar el mes actual.
 * @param {Dayjs} fechaActual - Fecha actual para calcular los meses.
 * @returns {JSON[Number]}
 */
export function obtenerDatosPorMes(datos, clave, numMesesAtras, fechaActual) {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const res = {};
    const fechaFinal = fechaActual.subtract(numMesesAtras, "month");
    const mes = fechaFinal.month();

    for (let i = 0; i < numMesesAtras + 1; i++) {
        res[meses[mes + i]] = 0;
    }

    datos.forEach((x) => {
        let fecha = null;
        let mes = null;

        if (typeof x[clave] == "string") {
            dayjs.extend(customParseFormat);
            fecha = dayjs(x[clave], "DD-MM-YYYY");
            mes = fecha.month();
        } else {
            fecha = x[clave].toDate();
            mes = fecha.getMonth();
        }

        if (res[meses[mes]] != undefined) {
            res[meses[mes]] += 1;
        }
    });

    return res;
};

/**
 * Obtiene el nombre del mes actual.
 * @param {Dayjs} fecha - Fecha para obtener el mes actual. Si no se proporciona, se usa la fecha actual.
 * @returns {String}
 */
export function obtenerMesActualStr (fecha) {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[fecha.get("month")];
}

/**
 * Obtiene la cantidad de datos del mes actual.
 * @param {Object} datos - Datos con fechas a filtrar. Las claves deben ser los nombres de los meses.
 * @param {Dayjs} fecha - Fecha para obtener el mes actual. Si no se proporciona, se usa la fecha actual.
 * @returns {Number}
 */
export function obtenerDatosMesActual(datos, fecha) {
    if (datos == null || Object.keys(datos).length === 0) {
        return 0;
    } else {
        return datos[obtenerMesActualStr(fecha)];
    }
}