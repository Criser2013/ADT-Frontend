import { DRIVE_API_URL } from "../../constants";

/**
 * Codifica los parámetros de consulta a una URL.
 * @param {String} params - Parámetros de consulta de la URL.
 * @returns String
 */
export function codificarParamsURL (params) {
    let url = encodeURIComponent(params);

    url = url.replace("'","%27");

    return url;
};

/**
 * Determina el tipo de error basado en la respuesta HTTP y el cuerpo de la respuesta.
 * @param {Response} res - Respuesta de la petición HTTP.
 * @param {JSON} cuerpo - Cuerpo de la respuesta en formato JSON.
 * @returns JSON
 */
function clasificarError(res, cuerpo) {
    switch (true) {
        case res.status == 200 || res.status == 201:
            return { success: true, data: cuerpo, error: null };
        case res.status == 403 && cuerpo.error.message == "Rate Limit Exceeded":
            return { success: false, data: [], error: `${res.status} Límite de peticiones alcanzado` };
        case res.status == 403 && cuerpo.error.message.includes("Drive storage quota has been exceeded"):
            return { success: false, data: [], error: `${res.status} Límite de almacenamiento alcanzado` };
        case res.status == 308 && cuerpo.error.includes("Resume Incomplete"):
            return { success: false, data: [], error: `${res.status} Carga resumible incompleta` };
        case res.status == 404 && cuerpo.error.message.includes("Not found"):
            return { success: false, data: [], error: `${res.status} Sesión de carga resumible vencida` };
        case res.status == 404 && cuerpo.error.message.includes("File not found"):
            return { success: false, data: [], error: `${res.status} Archivo no encontrado` };
    }
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
 * @returns JSON
 */
export async function buscarArchivo(params, token) {
    try {
        params = codificarParamsURL(params);
        const pet = await fetch(`${DRIVE_API_URL}/files?q=${params}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            }
        );
        const res = await pet.json();

        return clasificarError(pet, res);
    } catch (error) {
        return { success: false, data: [], error: error };
    }
};

/**
 * Crea un archivo de Google Drive a partir de los metadatos.
 * No sube contenido al mismo. Para crear una carpeta coloque 
 * @param {JSON} cuerpo - Metadatos del archivo a crear.
 * @param {String} token - Token OAuth de Google.
 * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
 * @returns JSON
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

        return clasificarError(pet, res);
    } catch (error) {
        return { success: false, data: [], error: error };
    }
};

/**
 * Crea una carga resumible para un archivo de Google Drive. En la clave 
 * "data" del JSON de respuesta se devuelve la URL a la cual se debe hacer
 * la petición "PUT" con el contenido del archivo.
 * @param {String} idArchivo - ID del archivo de Drive.
 * @param {String} token - Token OAuth de Google.
 * @returns JSON
 */
export async function crearCargaResumible (idArchivo, token) {
    try {
        const pet = await fetch(`${DRIVE_API_URL}/files/${idArchivo}?uploadType=resumable`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        return clasificarError(pet, pet.headers.get("Location"));
    } catch (error) {
        return { success: false, data: [], error: error };
    }
};

/**
 * Sube un archivo a Google Drive de forma resumible.
 * @param {String} url - URL para la carga resumible.
 * @param {File|Blob|Uint8Array} contenido - Archivo a subir.
 * @param {String} token - Token OAuth de Google.
 * @returns JSON
 */
export async function subirArchivoResumible(url, contenido, token) {
    try {
        const pet = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/octet-stream",
                "Content-Length": contenido.size
            },
            body: contenido
        });
        const res = await pet.json();

        return clasificarError(pet, res);
    } catch (error) {
        return { success: false, data: [], error: error };
    }
};

/**
 * Descarga un archivo de Google Drive.
 * La clave "data" del JSON de respuesta es un Blob que contiene el archivo.
 * @param {String} idArchivo - ID del archivo a descargar.
 * @param {String} token - Token OAuth de Google.
 * @returns JSON
 */
export async function descargarArchivo(idArchivo, token) {
    try {
        const pet = await fetch(`${DRIVE_API_URL}/files/${idArchivo}?alt=media&source=downloadUrl`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const res = await pet.blob();

        return (res instanceof Blob) ? { success: true, data: res, error: null } : clasificarError(pet, res);
    } catch (error) {
        return { success: false, data: [], error: error };
    }
};