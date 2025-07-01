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

        if (validarXlsx(data, json)) {
            return { success: true, data: json, error: null };
        }

        return { success: false, data: [], error: {
            code: 401, message: "El archivo no tiene la estructura correcta o contiene datos inválidos.",
        } };
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
export function validarXlsx (archivo, filas) {
    const hojas = archivo.SheetNames.length == 1 && archivo.SheetNames[0] == "Datos";
    const campos = Object.keys(filas[0]).sort();
    const ord = COMORBILIDADES.concat(["cedula","nombre","sexo","telefono","fechaNacimiento","otraEnfermedad"]).sort();
    let igual = true;

    // comparar los arrays no funciona con el operador de igualdad
    for (let i = 0; i < campos.length; i++) {
        igual &= campos[i] == ord[i];
        console.log(campos[i], ord[i], igual);
    }

    return hojas && campos.length == ord.length && igual && validarFilas(filas);
};

/**
 * Valida que las filas del archivo XLSX tengan los valores permitidos.
 * @param {Array} filas - Lista de filas a validar como JSON.
 * @returns boolean
 */
export function validarFilas (filas) {
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
};