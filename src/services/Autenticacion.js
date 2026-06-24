import { iniciarSesionGoogle, cerrarSesion, registrarUsuario, verRolUsuario, guardarCredsOAuth } from "../helpers/autenticacion-helper";

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