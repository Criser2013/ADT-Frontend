import { peticionApi } from "./Api";

/**
 * Realiza una petición al servidor para obtener las credenciales de Firebase.
 * Reintenta hasta 5 veces en caso de error. Si tiene éxito, inicializa Firebase con las credenciales obtenidas.
 * @param {AbortController} controlador - Controlador para abortar la petición si es necesario.
 * @return {Object} Resultado de la operación, con las credenciales obtenidas o un mensaje de error.
 */
export async function cargarCredencialesServidor(controlador) {
    const res = { success: false, data: null, error: "No se ha podido cargar las credenciales del servidor." };
    for (let i = 0; i < 5; i++) {
        if (controlador.signal.aborted) {
            res.error = "La petición de credenciales ha sido cancelada.";
            break;
        }

        const pet = await peticionApi(
            "credenciales", "GET", {}, null, null, "es", "Error al cargar las credenciales de la aplicación.", controlador
        );

        await new Promise(r => setTimeout(r, 500));
        if (pet.success) {
            const tokenRecaptcha = pet.data.reCAPTCHA;
            const scopesDrive = pet.data.driveScopes;

            delete pet.data.driveScopes;
            delete pet.data.reCAPTCHA;

            res.data = { firebase: pet.data, recaptcha: tokenRecaptcha, scopesDrive };
            res.success = true;
            res.error = null;
            break;
        }
    }
    return res;
};

/**
 * Almacena las credenciales de los servicios de la aplicación en el sessionStorage
 * del navegador para evitar tener que cargarlas desde el servidor.
 * @param {Object} credsFirebase - Credenciales de Firebase.
 * @param {String} tokenRecaptcha - Clave del cliente de reCAPTCHA.
 * @param {Array<String>} scopesDrive - Scopes de acceso a Google Drive.
 * @return {Boolean} Resultado de la operación de almacenamiento, True si fue exitosa.
 */
export function almacenarCredencialesCache(credsFirebase, tokenRecaptcha, scopesDrive) {
    const txtCreds = JSON.stringify(credsFirebase);
    sessionStorage.setItem("session-credenciales-firebase", txtCreds);
    sessionStorage.setItem("session-credenciales-recaptcha", tokenRecaptcha);
    sessionStorage.setItem("session-drive-scopes", scopesDrive);

    return true;
};

/**
 * Carga las credenciales de los servicios desde el sessionStorage si están disponibles.
 * @returns {Boolean} Resultado de la operación de carga desde el sessionStorage, True si fue exitosa.
 */
export function cargarCredencialesCache() {
    const firebaseCreds = sessionStorage.getItem("session-credenciales-firebase");
    const tokenRecaptcha = sessionStorage.getItem("session-credenciales-recaptcha");
    const scopesDrive = sessionStorage.getItem("session-drive-scopes");
    const res = [firebaseCreds, tokenRecaptcha, scopesDrive].every((x) => x);

    if (res) {
        const creds = JSON.parse(firebaseCreds);
        return { success: true, firebase: creds, recaptcha: tokenRecaptcha, scopesDrive: scopesDrive.split(",") };
    }

    return { success: false };
};