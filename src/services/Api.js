import { API_URL } from "../constants";


/**
 * Función para realizar peticiones fácilmente al backend.
 * @param {String} ruta Ruta del API a consultar.
 * @param {String} metodo Método HTTP a utilizar (GET, POST, PUT, DELETE).
 * @param {Object} parametros Parámetros de la petición (opcional).
 * @param {Object|FormData|ArrayBuffer|null} cuerpo Cuerpo de la petición (opcional).
 * @param {String|null} token Token de autenticación (opcional).
 * @param {String} idioma Idioma actual de la aplicación (opcional).
 * @param {String} txtError Mensaje de error a mostrar en caso de fallo (opcional).
 * @param {AbortController} controlador Controlador para abortar la petición si es necesario (opcional).
 * @returns {Object} Objeto con las claves:
 * - success (Boolean) - Indicador de éxito de la operación.
 * - data - (Object) - Contiene la respuesta del servidor si la operación fue exitosa.
 * - cancelled (Boolean) - Indicador de si la petición fue cancelada.
 * - error  (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
 */
export async function peticionApi(ruta, metodo, parametros = {}, cuerpo = null, token = null, idioma = "es", txtError = "", controlador = null) {
    try {
        let resultado = { success: false, error: null };
        const params = new URLSearchParams(parametros).toString();
        const opciones = {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Language": idioma
            },
            body: cuerpo ? JSON.stringify(cuerpo) : null,
            signal: controlador?.signal || null
        };

        if (!token) {
            delete opciones.headers["Authorization"];
        }

        const res = await fetch(`${API_URL}/${ruta}?${params}`, opciones);
        const json = await res.json();

        if (!res.ok) {
            resultado.error = json.error;
        } else {
            resultado.success = true;
            resultado.data = json;
            delete json.error;
        }

        return resultado;
    } catch (error) {
        return { success: false, error: txtError, cancelled: error.name == "AbortError" };
    }
};