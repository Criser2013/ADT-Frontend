import { signInWithPopup, reauthenticateWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { peticionApi } from "./Api";
import { AES, enc } from "crypto-js";
import i18n from "i18next";
import { AES_KEY } from "../../constants";

/**
 * Inicia sesión con Google dentro de Firebase, registra al usuario en la base de datos si es su primera vez y obtiene su rol.
 * @param {import("firebase/auth").FirebaseAuth} firebaseAuth Instancia de Firebase Auth.
 * @param {Array<String>} permisos Permisos de OAuth requeridos para la aplicación.
 * @param {import("firebase/auth").User} usuario Instancia de Usuario de Firebase. Si se proporciona,
 * se asume que es para reautenticar al usuario y refrescar las credenciales de acceso a Google, de lo contrario se inicia una nueva sesión.
 * @returns {Object} Objeto con la propiedad success indicando si la autenticación fue exitosa, el usuario autenticado (clave usuario),
 * token de acceso a Google (clave accessToken), el rol del usuario (clave rol), el tiempo (en milisegundos) de expiración del token OAuth (clave tiempoExpiracion).
 * En caso de algún fallo se retorna la clave correspondiente al mensaje de error.
 */
export async function iniciarSesion(firebaseAuth, permisos, usuario = null) {
    const { success, res, user, credencialOAuth, error } = await iniciarSesionGoogle(firebaseAuth, permisos, usuario);

    if (success) {
        const registrado = await registrarUsuario(user);
        const permisosOtorgados = JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes;
        const permisosRequeridos = permisos.every(permiso => permisosOtorgados.includes(permiso));

        if (!permisosRequeridos) {
            await cerrarSesion(firebaseAuth);
            return { success: false, error: "errPermisos" };
        }

        if (!registrado.success) {
            await cerrarSesion(firebaseAuth);
            return { success: false, error: "errVerificarRegistro" };
        }

        // Exige refresco de token 3 minutos antes de su expiración
        const tiempoExpiracion = (res._tokenResponse.oauthExpireIn - 180) * 1000;
        const rol = await verRolUsuario(user);

        guardarCredsOAuth(credencialOAuth);

        return { success: true, usuario: user, accessToken: credencialOAuth.accessToken, rol: rol, tiempoExpiracion: tiempoExpiracion };

    } else {
        return { success: false, error: error };
    }
}

/**
 * Inicia sesión con Google dentro de Firebase. Si la autenticación es exitosa almacena las credenciales
 * del usuario. También puede reautenticar usuarios para refrescar credenciales de acceso.
 * @param {import("firebase/auth").FirebaseAuth} firebaseAuth Instancia de autenticación de Firebase.
 * @param {Array<String>} permisos Lista de permisos OAuth requeridos.
 * @param {import("firebase/auth").User} usuario Instancia del usuario de Firebase. Si se proporciona, 
 * se asume que es para reautenticar al usuario y refrescar las credenciales de acceso a Google, de lo contrario se inicia una nueva sesión.
 * @returns {Object} Objeto con la propiedad success indicando si la autenticación fue exitosa, el
 * usuario autenticado (clave usuario), las credenciales OAuth (clave credencialOAuth) y un mensaje
 * de error en caso de que la autenticación falle (clave error).
 */
export async function iniciarSesionGoogle(firebaseAuth, permisos, usuario = null) {
    try {
        const provider = new GoogleAuthProvider();
        provider.setDefaultLanguage(i18n.language);

        for (const i of permisos) {
            provider.addScope(i);
        }

        const res = usuario ? await reauthenticateWithPopup(usuario, provider) : await signInWithPopup(firebaseAuth, provider);
        const oauth = GoogleAuthProvider.credentialFromResult(res).toJSON();

        oauth.expires = `${Date.now() + (res._tokenResponse.oauthExpireIn * 1000)}`;
        oauth.scopesDrive = JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes;
        
        return { success: true, res: res, user: res.user, credencialOAuth: oauth };
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
            clearTimeout(idTareaRefresco);
        }
        borrarCredsOAuth();
        return { success: true };
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return { success: false, error: "errCerrarSesion" };
    }
};

/**
 * Verifica si el usuario está registrado, sino lo está, lo registra.
 * @param {import("firebase/auth").User} usuario Instancia de usuario de Firebase.
 * @returns {Object} Objeto con la propiedad success indicando si el registro fue exitoso.
 */
export async function registrarUsuario(usuario) {
    const { createdAt, lastLoginAt } = usuario.metadata;
    const estaRegistrado = createdAt !== lastLoginAt;

    if (estaRegistrado) {
        return { success: true };
    } else {
        const res = await peticionApi(
            "registrar", "POST", { uid: usuario.uid }, null, null, i18n.language, "errRegistrarUsuario"
        );
        return { success: res.success };
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
 * Maneja los errores de autenticación que se presenten.
 * @param {import("firebase/auth").AuthError} error Error de Firebase Auth.
 * @param {Location} loc Objeto Location para redirigir al usuario en caso de que cierre el popup de autenticación antes de iniciar sesión. Por defecto se toma el objeto global location.
 * @returns {String} Mensaje de error traducido para mostrar al usuario. En caso de
 * que el error sea "auth/popup-closed-by-user" redirige a la página de inicio.
 */
export function manejadorErroresAuth(error, loc = location) {
    switch (error.code) {
        // Cierra el popup de Google antes de iniciar sesión
        case "auth/popup-closed-by-user":
            if (loc.pathname != "/") {
                loc.replace("/");
            }
            break;

        // El usuario cancela la autenticación y no otorga los permisos
        case "auth/user-cancelled":
            return "errPermisos";

        // Usuario que intenta iniciar sesión no coincide con el usuario actual
        case "auth/user-mismatch":
            return "errSesionIniciada";

        // Usuario deshabilitado
        case "auth/user-disabled":
            return "errUsuarioBaneado";

        // Todo lo demás
        default:
            console.error("Error de autenticación:", error);
            return "errIniciarSesion";
    }
};
