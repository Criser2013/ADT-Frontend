import { reauthenticateWithPopup, signOut } from "firebase/auth";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { verUsuario } from "../firestore/usuarios-collection";
import { cambiarUsuario, verSiEstaRegistrado } from "../firestore/usuarios-collection";

export const authContext = createContext();

/**
 * Otorga acceso al contexto de autenticación de la aplicación.
 * @returns React.Context<AuthContextType>
 */
export const useAuth = () => {
    const context = useContext(authContext);

    if (!context) {
        console.log("Error creando el contexto.");
    }

    return context;
};

export function AuthProvider({ children }) {
    // Instancia de autenticación de Firebase
    const [auth, setAuth] = useState(null);
    // Instancia de la base de datos de Firebase
    const [db, setDb] = useState(null);
    const [tokenDrive, setTokenDrive] = useState(null);
    // Información del usuario autenticado
    const [authInfo, setAuthInfo] = useState({
        user: null, // Instancia del usuario de Firebase
        correo: null, // Correo del usuario
        rol: null // Rol del usuario (0 - Usuario normal, 1001 - Administrador)
    });
    // Permisos necesarios para usar Google Drive
    const [scopes, setScopes] = useState(null);
    // Información sobre errores
    const [authError, setAuthError] = useState({
        res: false, // true - Se produjo un error, false - Operación exitosa
        operacion: null, // 0 - Inicio de sesión, 1 - Cierre de sesión, 2 - Reautenticación del usuario
        error: "" // Mensaje de error a mostrar. Es vacío sino hay error
    });
    const [cargando, setCargando] = useState(true);

    /**
     * Reautentica al usuario para actualizar las credenciales de acceso a Google.
     * @param {User} usuario - Instancia del usuario de Firebase.
     */
    const reautenticarUsuario = useCallback(async (usuario) => {
        if (usuario != null) {
            let resultado = { res: false, operacion: 2, error: "" };
            setCargando(true);

            try {
                const provider = new GoogleAuthProvider();

                // Se añaden los permisos necesarios para usar Drive
                for (const i of scopes) {
                    provider.addScope(i);
                }

                // Se vuelve a abrir el popup de Google para obtener el token de acceso a Drive
                const res = await reauthenticateWithPopup(usuario, provider);

                setTokenDrive(GoogleAuthProvider.credentialFromResult(res).accessToken);
            } catch (error) {
                console.error(error);
                resultado = { res: true, operacion: 2, error: "Se ha producido un error durante el inicio de sesión, reintente nuevamente" };
            }

            setCargando(false);
            setAuthError(resultado);
        }
    }, [scopes, setTokenDrive]);

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {User} currentUser - Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = useCallback(async (currentUser) => {
        // Si ya estaba autenticado, se actualiza su información y refrescan los tokens de OAuth
        if (currentUser != null) {
            await reautenticarUsuario(currentUser);
            setAuthInfo({ user: currentUser, correo: currentUser.email, rol: null });
        } else {
            setAuthInfo({ user: null, correo: null, rol: null });
        }
    }, [reautenticarUsuario, setAuthInfo]);

    /**
     * Recupera la sesión si el usuario no la cerrado.
     */
    useEffect(() => {
        if (auth != null) {
            const suscribed = onAuthStateChanged(auth, manejadorCambiosAuth);
            return () => suscribed();
        }
    }, [auth, manejadorCambiosAuth]);

    /**
     * Actualiza la información del usuario dentro del contexto.
     * @param {String} correo 
     */
    const verDatosUsuario = useCallback(async (correo) => {
        if (correo != null) {
            const data = await verUsuario(correo, db);

            if ((data.success == 1) && (data.data != undefined)) {
                setAuthInfo({
                    user: authInfo.user, email: data.data.email, rol: data.data.rol
                });
            }

            return data;
        }
    }, [db, authInfo.user, setAuthInfo]);

    /**
     * Si el usuario ya está autenticado, obtiene sus datos.
     */
    useEffect(() => {
        if (auth != null && authInfo.user != null) {
            verDatosUsuario(authInfo.user.email);
        }
    }, [authInfo.user, verDatosUsuario, auth]);

    useEffect(() => {
        if (auth != null && scopes != null && db != null) {
            setCargando(false);
        }
    }, [auth, db, scopes]);

    /**
     * Cierra la sesión del usuario.
     * @returns JSON
     */
    const cerrarSesion = useCallback(async (ejecutar = false) => {
        if (ejecutar) {
            setCargando(true);

            try {
                await signOut(auth);
                setAuthInfo({ user: null, email: null, rol: null });
                setAuthError({ res: false, operacion: 1, error: "" });
            } catch (error) {
                console.error(error);
                setAuthError({ res: true, operacion: 1, error: "No se ha podido cerrar sesión. Reintente nuevamente." });
            }

            setCargando(false);
        }
    }, [auth, setAuthInfo, setAuthError]);

    /**
     * Registra un nuevo usuario en la base de datos.
     * @param {String} correo - Correo del usuario a registrar.
     * @returns JSON
     */
    const registrarUsuario = useCallback(async (correo) => {
        /* rol = 0 - Usuario normal
           rol = 1001 - Administrador */
        if (correo != null) {
            const res = await cambiarUsuario({ correo: correo, rol: 0 }, db);

            return { success: res.success };
        }
    }, [db]);

    /**
     * Verifica si un usuario está registrado en la base de datos.
     * @param {String} correo - Correo del usuario a verificar.
     * @returns JSON
     */
    const verRegistrado = useCallback(async (correo) => {
        if (correo != null) {
            const res = await verSiEstaRegistrado(correo, db);

            if (res.success && !res.data) {
                // El usuario no está registrado, se procede a registrarlo
                return await registrarUsuario(correo);
            } else if (res.success && res.data) {
                // El usuario está registrado
                return { success: true, data: 1 };
            } else if (!res.success) {
                // Ha ocurrido un error al verificar si está registrado
                return { success: false, data: 0 };
            }
        }
    }, [db, registrarUsuario]);

    /**
     * Inicia sesión con Google dentro de Firebase.
     * Si la autenticación es exitosa almacena las credenciales del usuario.
     * @returns JSON
     */
    const iniciarSesionGoogle = useCallback(async (ejecutar = false) => {
        if (ejecutar) {
            let resultado = { success: false, operacion: 0, error: "" };
            setCargando(true);

            try {
                const provider = new GoogleAuthProvider();

                // Se añaden los permisos necesarios para usar Drive
                for (const i of scopes) {
                    provider.addScope(i);
                }

                // Se abre el popup de Google para iniciar sesión
                const res = await signInWithPopup(auth, provider);
                // Se verifica si el usuario ya está registrado en la base de datos y esté activado
                const reg = await verRegistrado(res.user.email);

                // Guardando el token de acceso a Google Drive
                setTokenDrive(GoogleAuthProvider.credentialFromResult(res).accessToken);

                if (!reg.success) {
                    // Si no se pudo registrar al usuario, se cierra la sesión
                    cerrarSesion(true);
                    resultado = { res: true, operacion: 0, error: "No se pudo verificar si el usuario está registrado." };
                } else {
                    // Al iniciar sesión correctamente, se actualiza la información del usuario
                    setAuthInfo({ ...authInfo, user: res.user });
                }
            } catch (error) {
                console.error(error);
                resultado = { res: true, operacion: 0, error: "No se ha podido iniciar sesión. Reintente nuevamente." };
            }

            setCargando(false);
            setAuthError(resultado);
        }
    }, [auth, scopes, authInfo, setAuthInfo, setTokenDrive, cerrarSesion, verRegistrado]);

    return (
        <authContext.Provider value={{ useAuth, auth, cargando, authInfo, authError, tokenDrive, setAuth, setDb, setTokenDrive, setScopes, cerrarSesion, iniciarSesionGoogle, verDatosUsuario }}>
            {children}
        </authContext.Provider>
    );
}