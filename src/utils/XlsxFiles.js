import { utils, writeXLSX, writeFileAsync, read } from "xlsx";
import { COMORBILIDADES, EXPORT_FILENAME } from "../../constants";
import { validarFecha, validarNombre, validarNumero, validarTelefono } from "./Validadores";

/**
 * Genera un archivo en memoria XLSX a partir de un Array de JSON.
 * @param {Array} datos - Datos como un Array de JSON.
 * @returns JSON[boolean, UInt8Array, Error|null]
 */
export function crearArchivoXlsx (datos) {
    try {
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, "Datos");
        const xlsxFile = writeXLSX(wb, {
            bookType: "xlsx",
            type: "buffer",
            cellDates: true
        });
        return { success: true, data: xlsxFile, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Crea un archivo XLSX a partir de un Array de JSON y lo descarga
 * @param {Array} datos - Datos como un Array de JSON.
 * @param {String} nombreArchivo - Nombre de archivo a sobreescribir. De forma predeterminada es "HADT - Diagnósticos.xlsx".
 * se coloca el nombre del archivo en la constante EXPORT_FILENAME.
 * @returns JSON
 */
export function descargarArchivoXlsx (datos, nombreArchivo = EXPORT_FILENAME) {
    try {
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, "Diagnósticos");
        
        writeFileAsync(nombreArchivo, wb, {
            bookType: "xlsx", type: "file", cellDates: true
        });
        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Lee un archivo XLSX y lo convierte a un Array de JSON.
 * @param {Uint8Array} archivo - Archivo XLSX a leer.
 * @returns Array[JSON]
 */
export function leerArchivoXlsx (archivo) {
    try {
        const data = read(archivo, { type: "buffer" });
        const json = utils.sheet_to_json(data.Sheets["Datos"]);

        if (!validarXlsx(data, json[0], json)) {
            return { success: true, data: [], error: null };
        }

        return { success: true, data: json, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
}

/**
 * Valida la estructura del archivo XLSX de pacientes.
 * @param {Object} archivo - Archivo XLSX a validar.
 * @param {JSON} json - 1º instancia del JSON del archivo.
 * @returns {boolean}
 */
function validarXlsx (archivo, filas) {
    const hojas = archivo.SheetNames.length == 1 && archivo.SheetNames[0] == "Datos";
    const campos = Object.keys(filas[0]).sort();
    const ord = COMORBILIDADES.concat(["cedula","nombre","sexo","telefono","fechaNacimiento"]).sort();

    return hojas && campos.length == ord.length && campos == ord && validarFilas(filas);
};

/**
 * Valida que las filas del archivo XLSX tengan los valores permitidos.
 * @param {Array} filas - Lista de filas a validar como JSON.
 * @returns boolean
 */
function validarFilas (filas) {
    for (const fila of filas) {
        let res = true;
        res &= validarNumero(fila.cedula);
        res &= validarNombre(fila.nombre);
        res &= validarTelefono(fila.telefono);
        res &= validarFecha(fila.fechaNacimiento);
        res &= fila.sexo == 0|| fila.sexo == 1;

        for (const enfermedad of COMORBILIDADES) {
            res &= fila[enfermedad] == 0 || fila[enfermedad] == 1;
        }

        if (!res) {
            return false;
        }
    }

    return true;
}