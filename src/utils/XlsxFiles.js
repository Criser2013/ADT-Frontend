import { COMORBILIDADES } from "../constants";
import { utils, writeXLSX, read, writeFile } from "xlsx";
import { validarFecha, validarId, validarNombre, validarNumero, validarTelefono } from "./Validadores";

/**
 * Genera un archivo XLSX en memoria a partir de un Array de objetos.
 * @param {Array<Object>} datos Datos como un Array de objetos.
 * @param {String} tipo Tipo de archivo, puede ser "xlsx" o "csv".
 * @param {String} nombreHoja Nombre de la hoja en el archivo XLSX.
 * @returns {Object} Objeto con la propiedad "data" que contiene el archivo generado o "error" si ocurrió un error.
 */
export function crearArchivoXlsx (datos, tipo, nombreHoja) {
    try {
        let archivo;
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, nombreHoja);
        const options = {
            bookType: tipo,
            type: tipo == "csv" ? "string" : "buffer",
            cellDates: true
        };

        archivo = (tipo == "csv") ? utils.sheet_to_csv(ws, options) : writeXLSX(wb, options);

        return { success: true, data: archivo };
    } catch (error) {
        return { success: false, error: error };
    }
};

/**
 * Crea un archivo XLSX a partir de un Array de objetos e inicia su descarga.
 * @param {Array<Object>} datos Datos como un Array de objetos.
 * @param {String} tipo - Tipo de archivo, puede ser "xlsx" o "csv".
 * @param {String} nombreArchivo Nombre de archivo.
 * @param {String} nombreHoja - Nombre de la hoja en el archivo XLSX.
 * @returns {Object} Objeto con la propiedad "success" que indica el resultado y "error" si ocurrió un error.
 */
export function descargarArchivoXlsx (datos, tipo, nombreArchivo, nombreHoja) {
    try {
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, nombreHoja);

        writeFile(wb, `${nombreArchivo}.${tipo}`, {
            bookType: tipo, cellDates: true, compression: true
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error };
    }
};

/**
 * Lee los bytes de un archivo XLSX y lo convierte a un Array de objetos.
 * @param {Uint8Array|ArrayBuffer} archivo Arreglo de bytes del archivo XLSX.
 * @param {String} nombreHoja Nombre de la hoja en el archivo XLSX.
 * @param {String} txtErrorLectura Texto de error a mostrar si la lectura del archivo falla. De forma predeterminada es "Error de lectura".
 * @returns {Array<Object>} Array de objetos con los datos del archivo o un objeto con la propiedad "error" si ocurrió un error.
 */
export function leerArchivoXlsx (archivo, nombreHoja, txtErrorLectura = "Error de lectura") {
    try {
        const data = read(archivo, { type: "buffer" });
        const json = utils.sheet_to_json(data.Sheets[nombreHoja]);

        if (json.length == 0 || validarXlsxPacientes(json)) {
            return { success: true, data: json };
        } else {
            return { success: false, error: txtErrorLectura };
        }
    } catch (error) {
        return { success: false, error: error };
    }
}

/**
 * Valida la estructura del archivo XLSX de pacientes.
 * @param {Array<Object>} filas Lista de filas a validar como JSON.
 * @returns {Boolean} True si el archivo tiene la estructura correcta, false en caso contrario.
 */
export function validarXlsxPacientes (filas) {
    let mismosCampos = true;
    const camposArchivo = Object.keys(filas[0]).map(c => c.trim().toLowerCase());
    const camposEsperados = COMORBILIDADES.map(x => x.trim().toLowerCase()).concat([
        "id", "cedula", "nombre", "sexo", "telefono", "fechanacimiento", "otraenfermedad", "fechacreacion"
    ]);

    for (const campo of camposEsperados) {
        mismosCampos &&= camposArchivo.includes(campo);
    }

    return mismosCampos && validarFilasXlsxPacientes(filas);
};

/**
 * Valida que las filas del archivo XLSX tengan los valores permitidos en cada campo.
 * @param {Array<Object>} filas Filas del archivo XLSX a validar como un array de objetos.
 * @returns {Boolean} True si todas las filas son válidas, false en caso contrario.
 */
export function validarFilasXlsxPacientes (filas) {
    for (const fila of filas) {
        let res = true;
        res &&= validarId(fila.id);
        res &&= validarNumero(fila.cedula);
        res &&= validarNombre(fila.nombre);
        res &&= validarTelefono(fila.telefono);
        res &&= validarFecha(fila.fechaNacimiento);
        res &&= fila.sexo == 0 || fila.sexo == 1;
        res &&= validarFecha(fila.fechaCreacion);

        for (const enfermedad of COMORBILIDADES) {
            res &&= fila[enfermedad] == 0 || fila[enfermedad] == 1;
        }

        if (!res) {
            return false;
        }
    }

    return true;
};