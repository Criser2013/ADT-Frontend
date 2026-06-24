import { DRIVE_API_URL, DRIVE_UPLOAD_API_URL } from "../../constants";

/**
 * Determina el tipo de error basado en la respuesta HTTP y el cuerpo de la respuesta.
 * @param {Response} codigoPet - Respuesta de la petición HTTP.
 * @param {JSON} contenido - Cuerpo de la respuesta en formato JSON o ArrayBuffer si se trata de una respuesta binaria.
 * @returns {Object} Resultado de la operación con las claves:
 * - "success" (Boolean) - Indica si la operación fue exitosa o no.
 * - "data" (JSON|String) - Contiene la respuesta de la API de Google Drive si la operación fue exitosa, de lo contrario es null.
 * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export function clasificarError(codigoPet, contenido) {
    let res = { success: false, data: null, error: `${codigoPet} ${JSON.stringify(contenido)}` };

    if (codigoPet >= 200 && codigoPet < 300) {
        return { success: true, data: contenido, error: null };
    }

    const errores = [
        { status: 308, includes: "Resume Incomplete", error: "errCargaResumible" },
        { status: 401, includes: "Invalid Credentials", error: "errCreds" },
        { status: 403, includes: "Drive storage quota has been exceeded", error: "errEspacioDrive" },
        { status: 404, includes: "Not found", error: "errCargaVencida" },
        { status: 404, includes: "File not found", error: "errArchivoInexistente" },
        { status: [403, 429], includes: "Rate Limit Exceeded", error: "errLimPeticiones" },
        { status: 403, includes: "Daily Limit Exceeded", error: "errLimPeticiones" }
    ];

    const errorDetectado = errores.find((x) => (
        (x instanceof Array) ? x.includes(codigoPet) : x.status == codigoPet) 
        && contenido.error?.message?.includes(x.includes)
    );

    res.error = errorDetectado ? errorDetectado.error : res.error;

    return res;

};

/**
 * Busca un archivo en Google Drive. La clave "data" del JSON es la respuesta
 * si la petición es exitosa, tendrá un JSON con las claves 
 * - "files" (array) — Estará vacío sino se encuentra un archivo, de lo contrario tendrá metadatos del archivo.
 * - "kind" (string) - Indica el tipo de respuesta, predeterminadamente responde con: "drive#fileList".
 * - "incompleteSearch" (boolean) - Indica si la búsqueda fue completa o no.
 * Cada elemento de files tiene las siguientes claves:
 * - "id" (string) - ID del archivo.
 * - "name" (string) - Nombre del archivo.
 * - "mimeType" (string) - Tipo MIME del archivo.
 * - "kind" (string) - Tipo de archivo.
 * @param {String} params - Parámetros de consulta de la URL codificados.
 * @param {String} token - Token OAuth de Google.
 * @returns {Object} Resultado de la operación con las claves:
 * - "success" (Boolean) - Indica si la operación fue exitosa o no.
 * - "data" (JSON) - Contiene la respuesta de la API de Google Drive si la operación fue exitosa, de lo contrario es null.
 * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export async function buscarArchivo(params, token) {
    try {
        params = new URLSearchParams({q: params}).toString();
        const pet = await fetch(`${DRIVE_API_URL}/files?${params}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            }
        );
        const res = await pet.json();

        return clasificarError(pet.status, res);
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Crea un archivo de Google Drive a partir de los metadatos.
 * No sube contenido al mismo. Para crear una carpeta coloque 
 * @param {Object} cuerpo - Metadatos del archivo a crear.
 * @param {String} token - Token OAuth de Google.
 * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
 * @returns {Object} Resultado de la operación con las claves:
 * - "success" (Boolean) - Indica si la operación fue exitosa o no.
 * - "data" (JSON) - Contiene los metadatos del archivo creado si la operación fue exitosa, de lo contrario es null.
 * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export async function crearArchivo(cuerpo, token, esCarpeta = false) {
    try {
        if (esCarpeta) {
            cuerpo["mimeType"] = "application/vnd.google-apps.folder";
        }

        const pet = await fetch(`${DRIVE_API_URL}/files`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cuerpo)
        });

        const res = await pet.json();

        return clasificarError(pet.status, res);
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Sube un archivo a Google Drive.
 * @param {String} idArchivo - ID del archivo de Drive.
 * @param {File|Blob|Uint8Array} contenido - Archivo a subir.
 * @param {String} token - Token OAuth de Google.
 * @param {String} mimeType - Tipo MIME del archivo.
 * @returns {Object} Resultado de la operación con las claves:
 * - "success" (Boolean) - Indica si la operación fue exitosa o no.
 * - "data" (JSON) - Contiene los metadatos del archivo subido si la operación fue exitosa, de lo contrario es null.
 * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export async function subirArchivo(idArchivo, contenido, token, mimeType = "application/octet-stream") {
    try {
        const pet = await fetch(`${DRIVE_UPLOAD_API_URL}/files/${idArchivo}?uploadType=media`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": mimeType,
                "Content-Length": contenido.length
            },
            body: contenido
        });
        const res = await pet.json();

        return clasificarError(pet.status, res);
    } catch (error) {        
        return { success: false, data: null, error: error };
    }
};

/**
 * Descarga un archivo de Google Drive.
 * La clave "data" del JSON de respuesta es un ArrayBuffer que contiene el archivo.
 * @param {String} idArchivo - ID del archivo a descargar.
 * @param {String} token - Token OAuth de Google.
 * @returns {Object} Resultado de la operación con las claves:
 * - "success" (boolean) - Indica si la operación fue exitosa o no.
 * - "data" (ArrayBuffer) - Contiene el archivo descargado si la operación fue exitosa, de lo contrario es null.
 * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export async function descargarArchivo(idArchivo, token) {
    try {
        const pet = await fetch(`${DRIVE_API_URL}/files/${idArchivo}?alt=media`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const res = await pet.arrayBuffer();
        
        return clasificarError(pet.status, (res instanceof ArrayBuffer) ? res : await pet.json());
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};