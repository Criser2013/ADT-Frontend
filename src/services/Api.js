import { API_URL } from "../../constants";

/**
 * Llamadas al API.
 * @param {String} token - Access token de Firebase del usuario.
 * @param {String} metodo - Método HTTP a utilizar (GET, POST, PUT, DELETE).
 * @param {String} ruta - Ruta del API a consultar.
 * @param {JSON} cuerpo - Cuerpo de la petición (opcional).
 * @param {String} txtError - Mensaje de error a mostrar en caso de fallo
 * @returns JSON
 */
export async function peticionApi(token, ruta, metodo, cuerpo = null, txtError = "") {
    try {
        cuerpo = cuerpo ? JSON.stringify(cuerpo) : null;
        
        const res = await fetch(`${API_URL}/${ruta}`, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: cuerpo
        });

        const json = await res.json();

        if (!res.ok && res.status != 200) {
            return { success: false, data: null, error: json.error};
        }

        return { success: true, data: json, error: null };
    } catch {
        return {
            success: false, data: null,
            error: txtError != "" ? txtError : "Ha ocurrido un error. Por favor reintenta nuevamente."
        };
    }
};