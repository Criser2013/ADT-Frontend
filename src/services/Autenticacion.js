import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import i18n from "i18next";
import { peticionApi } from "./Api";
import { AES, enc } from "crypto-js";

const { language, t } = i18n;

export async function iniciarSesion(firebaseAuth, permisos, idTareaRefresco = null) {
    const { success, usuario, credencialOAuth, error } = iniciarSesionGoogle(firebaseAuth, permisos);

    if (success) {
        const registrado = await registrarUsuario(usuario);
        const permisosOtorgados = JSON.parse(usuario._tokenResponse.rawUserInfo).granted_scopes;

        if (!registrado.success) {
            const res = await cerrarSesion(firebaseAuth);
            return { success: false, usuario: null, credencialOAuth: null, error: t("errVerificarRegistro") };
        }

        if (idTareaRefresco) {
            eliminarTareaRefresco(idTareaRefresco);
        }

        const idTareaRefresco = setTimeout(eliminarTareaRefresco, (usuario._tokenResponse.oauthExpireIn - 180) * 1000)
        const rol = await verRolUsuario(usuario);

        guardarCredsOAuth(credencialOAuth);

        return { success: true, usuario: usuario.user, accessToken: credencialOAuth.accessToken, rol: rol, idTareaRefresco: idTareaRefresco, error: null };

    } else {
        return { success: false, usuario: null, credencialOAuth: null, error: error };
    }
}

/**
 * Inicia sesión con Google dentro de Firebase. Si la autenticación es exitosa 
 * almacena las credenciales del usuario.
 * @param {import("firebase/auth").FirebaseAuth} firebaseAuth Instancia de autenticación de Firebase.
 * @param {Array<String>} permisos Lista de permisos OAuth requeridos.
 * @returns {Object} Objeto con la propiedad success indicando si la autenticación fue exitosa, el
 * usuario autenticado (clave usuario), las credenciales OAuth (clave credencialOAuth) y un mensaje
 * de error en caso de que la autenticación falle (clave error).
 */
export async function iniciarSesionGoogle(firebaseAuth, permisos) {
    try {
        const idioma = i18n.language;
        const provider = new GoogleAuthProvider();
        provider.setDefaultLanguage(idioma);

        for (const i of permisos) {
            provider.addScope(i);
        }

        const res = await signInWithPopup(firebaseAuth, provider);
        const oauth = GoogleAuthProvider.credentialFromResult(res).toJSON();

        oauth.expires = `${Date.now() + (res._tokenResponse.oauthExpireIn * 1000)}`;
        oauth.scopesDrive = JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes;
        
        return { success: true, usuario: res, credencialOAuth: oauth };
    } catch (error) {
        return { success: false, error: manejadorErroresAuth(error) };
    }
};

/**
 * Cierra la sesión del usuario, borra la crendenciales almacenadas en el sessionStorage y 
 * elimina la tarea programada para refrescar los tokens OAuth.
 * @param {import("firebase/auth").FirebaseAuth} firebaseAuth Instancia de Firebase Auth.
 * @param {Number} idTareaRefresco ID de la tarea de refresco de tokens.
 */
export async function cerrarSesion(firebaseAuth, idTareaRefresco = null) {
    try {
        await signOut(firebaseAuth);
        if (idTareaRefresco) {
            eliminarTareaRefresco(idTareaRefresco);
        }
        borrarCredsOAuth();
        return { success: true };
    } catch (error) {
        return { success: false, error: t("errCerrarSesion") };
    }
};

/**
 * Verifica si el usuario está registrado, sino lo está, lo registra.
 * @param {import("firebase/auth").User} usuario Instancia de usuario de Firebase.
 * @returns {Object} Objeto con la propiedad success indicando si el registro fue exitoso.
 */
export async function registrarUsuario(usuario) {
    const { createdAt, lastSignInTime } = usuario.metadata;
    const estaRegistrado = createdAt == lastSignInTime;

    if (estaRegistrado) {
        return { success: true };
    } else {
        const res = await peticionApi(
            "registrar", "POST", { uid: usuario.uid }, null, null, language, t("errRegistrarUsuario")
        );
        return res.success ? { success: true } : { success: false, error: res.error };
    }
};

/**
 * Obtiene el rol del usuario a partir de los claims personalizados del token de Firebase.
 * @param {import("firebase/auth").User} usuario Instancia del usuario de Firebase.
 * @returns {Boolean} Valor del claim personalizado "admin" que indica si el usuario es administrador o no.
 */
export async function verRolUsuario(usuario) {
    const token = await usuario.getIdTokenResult(true);
    return token.claims.admin;
};

/**
 * Maneja los errores de autenticación que se presenten.
 * @param {import("firebase/auth").AuthError} error Error de Firebase Auth.
 * @param {import("firebase/auth").User} usuario Instancia del usuario de Firebase.
 * @returns {String} Mensaje de error traducido para mostrar al usuario. En caso de
 * que el error sea "auth/popup-closed-by-user" redirige a la página de inicio.
 */
export function manejadorErroresAuth(error, usuario = null) {
    switch (error.code) {
        // Cierra el popup de Google antes de iniciar sesión
        case "auth/popup-closed-by-user":
            if (location.pathname != "/") {
                location.replace("/");
            }
            break;

        // El usuario cancela la autenticación y no otorga los permisos
        case "auth/user-cancelled":
            return t("errPermisos");

        // Usuario que intenta iniciar sesión no coincide con el usuario actual
        case "auth/user-mismatch":
            return t("errSesionIniciada", { usuario: usuario.displayName, correo: usuario.email });

        // Usuario deshabilitado
        case "auth/user-disabled":
            return t("errUsuarioBaneado");

        // Todo lo demás
        default:
            console.error("Error de autenticación:", error);
            return t("errIniciarSesion");
    }
};


/**
 * Carga las credenciales de sesión desde el sessionStorage.
 * @returns {Object} Objeto con el resultado de la operación en la clave "success". Si se pudieron cargar
 * las credenciales, se incluye el "accessToken", "permisos" y "expires".
 */
export function cargarCredsOAuth() {
    const valores = sessionStorage.getItem("session-tokens");

    if (valores) {
        const credsDesencriptadas = AES.decrypt(valores, AES_KEY).toString(enc.Utf8);
        const tokens = JSON.parse(credsDesencriptadas);
        return { success: true, expires: tokens.expires, accessToken: tokens.accessToken, permisos: tokens.scopesDrive };
    } else {
        return { success: false };
    }
};

/**
 * Borra las credenciales de sesión almacenadas en el sessionStorage.
 */
export function borrarCredsOAuth() {
    sessionStorage.removeItem("session-tokens");
    sessionStorage.removeItem("modo-usuario");
    sessionStorage.removeItem("ejecutar-callback");
};

/**
 * Guarda las credenciales de sesión encriptadas dentro del sessionStorage.
 * @param {Object} tokens Credenciales OAuth de Google.
 */
export function guardarCredsOAuth(tokens) {
    const res = AES.encrypt(JSON.stringify(tokens), AES_KEY).toString();
    sessionStorage.setItem("session-tokens", res);
};

/**
 * Elimina la tarea programada para refrescar los tokens OAuth.
 * @param {Number} idTareaRefresco Id de la tarea para refrescar los tokens
 */
export function eliminarTareaRefresco(idTareaRefresco) {
    clearTimeout(idTareaRefresco);
};