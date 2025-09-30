import { utils, writeXLSX, read, writeFile } from "xlsx";
import { COMORBILIDADES, EXPORT_FILENAME } from "../../constants";
import { validarFecha, validarId, validarNombre, validarNumero, validarTelefono } from "./Validadores";
import textos from "../assets/textos/textos.json";

/**
 * Genera un archivo en memoria XLSX a partir de un Array de JSON.
 * @param {Array} datos - Datos como un Array de JSON.
 * @returns JSON[boolean, UInt8Array, Error|null]
 */
export function crearArchivoXlsx (datos, tipo = "xlsx") {
    try {
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, "Datos");
        let xlsxFile = null;
        const options = {
            bookType: tipo,
            type: tipo == "csv" ? "string" : "buffer",
            cellDates: true
        };

        xlsxFile = (tipo == "csv") ? utils.sheet_to_csv(ws, options) : xlsxFile = writeXLSX(wb, options);

        return { success: true, data: xlsxFile, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Crea un archivo XLSX a partir de un Array de JSON y lo descarga
 * @param {Array} datos - Datos como un Array de JSON.
 * @param {String} nombreArchivo - Nombre de archivo a sobreescribir. De forma predeterminada es "HADT - Diagnósticos.xlsx".
 * @param {String} tipo - Tipo de archivo. Predeterminadamente es "xlsx", pero puede ser "csv".
 * se coloca el nombre del archivo en la constante EXPORT_FILENAME.
 * @param {String} idioma - Idioma para el archivo.
 * @returns {JSON}
 */
export function descargarArchivoXlsx (datos, nombreArchivo = EXPORT_FILENAME, tipo = "xlsx", idioma = "es") {
    try {
        const txt = idioma == "es" ? "Diagnósticos" : "Diagnoses";
        const ws = utils.json_to_sheet(datos);
        const wb = utils.book_new(ws, txt);

        writeFile(wb, `${nombreArchivo}.${tipo}`, {
            bookType: tipo, cellDates: true, compression: true
        });

        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Lee un archivo XLSX y lo convierte a un Array de JSON.
 * @param {Uint8Array} archivo - Archivo XLSX a leer.
 * @param {String} idioma - Idioma para los mensajes de error.
 * @returns Array[JSON]
 */
export function leerArchivoXlsx (archivo, idioma) {
    try {
        const data = read(archivo, { type: "buffer" });
        const json = utils.sheet_to_json(data.Sheets["Datos"]);

        if (json.length == 0 || validarXlsx(data, json)) {
            return { success: true, data: json, error: null };
        }

        return { success: false, data: [], error: {
            code: 401, message: textos[idioma].translation.errEstrucArchivoInvalida,
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
    const ord = COMORBILIDADES.concat(["id","cedula","nombre","sexo","telefono","fechaNacimiento","otraEnfermedad","fechaCreacion"]).sort();
    let igual = true;

    // comparar los arrays no funciona con el operador de igualdad
    for (let i = 0; i < campos.length; i++) {
        igual &= campos[i] == ord[i];
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
        res &= validarId(fila.id);
        res &= validarNumero(fila.cedula);
        res &= validarNombre(fila.nombre);
        res &= validarTelefono(fila.telefono);
        res &= validarFecha(fila.fechaNacimiento);
        res &= fila.sexo == 0|| fila.sexo == 1;
        res &= validarFecha(fila.fechaCreacion);

        for (const enfermedad of COMORBILIDADES) {
            res &= fila[enfermedad] == 0 || fila[enfermedad] == 1;
        }

        if (!res) {
            return false;
        }
    }

    return true;
};