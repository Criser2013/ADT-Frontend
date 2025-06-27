import { utils, writeXLSX, writeFileAsync, read } from "xlsx";
import { EXPORT_FILENAME } from "../../constants";

/**
 * Genera un archivo en memoria XLSX a partir de un Array de JSON.
 * @param {Array} datos - Datos como un Array de JSON.
 * @returns JSON[boolean, UInt8Array, Error|null]
 */
export function crearArchivoXlsx (datos) {
    try {
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Datos");
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
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Diagnósticos");
        
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
        const json = utils.sheet_to_json(data);

        return { success: true, data: json, error: null };

    } catch (error) {
        return { success: false, data: null, error: error };
    }
}