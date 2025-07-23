import { API_URL } from "../../constants";

/**
 * Llama al API para generar un diagnóstico.
 * @param {JSON} datos - Datos del formulario para generar el diagnóstico
 * @param {String} token - Access token de Firebase del usuario.
 * @returns JSON
 */
export async function generarDiagnostico(datos, token) {
    try {
        const res = await fetch(`${API_URL}/diagnosticar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const json = await res.json();

        if (!res.ok && res.status != 200) {
            return {
                success: false,
                data: null,
                error: json.error
            };
        }

        return { success: true, data: json, error: null };
    } catch {
        return {
            success: false, data: null,
            error: "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente."
        };
    }
};