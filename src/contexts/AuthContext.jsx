import { onIdTokenChanged, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from "firebase/auth";
import { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { verUsuario } from "../firestore/usuarios-collection";
import { cambiarUsuario, verSiEstaRegistrado } from "../firestore/usuarios-collection";
import { FirebaseError } from "firebase/app";

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

/**
 * Proveedor del contexto que permite gestionar el estado de la autenticación.
 * @param {JSX.Element} children
 * @returns JSX.Element
 */
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
        operacion: null, // 0 - Inicio de sesión, 1 - Cierre de sesión, 2 - Reautenticación del usuario, 3 - Refrescando los tokens
        error: "" // Mensaje de error a mostrar. Es vacío sino hay error
    });
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState(true);

    /**
     * Si el usuario ya está autenticado, obtiene sus datos.
     */
    useEffect(() => {
        if (authInfo.user != null && authInfo.correo != null && authInfo.rol == null) {
            setCargando(true);
            verDatosUsuario(authInfo.user.email).then(() => {
                setCargando(false);
            });
        }
    }, [authInfo]);

    /**
     * Retira el indicador de carga cuando se tienen las instancias de la base de datos,
     * autenticación y permisos de Drive requeridos.
     */
    useEffect(() => {
        if (auth != null && scopes != null && db != null) {
            setCargando(false);
        }
    }, [auth, db, scopes]);

    /**
     * Recupera la sesión si el usuario no la ha cerrado. También refresca los tokens
     * cuando caducan.
     */
    useEffect(() => {
        if (auth != null) {
            const suscribed = onAuthStateChanged(auth, manejadorCambiosAuth);
            const updated = onIdTokenChanged(auth, refrescartokens);
            return () => {
                suscribed();
                updated();
            };
        }
    }, [auth]);

    /**
     * Refresca los tokens OAuth del usuario si este se encuentra autenticado.
     * @param {User} currentUser - Ususario actual de Firebase.
     */
    const refrescartokens = async (currentUser) => {
        const creds = tokenDrive == null ? JSON.parse(sessionStorage.getItem("session-tokens")): tokenDrive;
        if (currentUser != null && creds != null) {
            try {
                const cred = GoogleAuthProvider.credential(currentUser.idToken, creds.accessToken);
                const res = await reauthenticateWithCredential(currentUser, cred);

                verificarPermisos(JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes, scopes);

                const prov = GoogleAuthProvider.credentialFromResult(res);
                guardarAuthCredsSesion(prov);
                setTokenDrive(prov);
            } catch (error) {
                console.error("Error al refrescar los tokens:", error);
                setAuthError({ res: true, operacion: 3, error: "Error al verificar la sesión. Reintenta nuevamente." });
            }
        }
    };

    /**
     * Verifica que el usuario tenga los permisos necesarios para usar la aplicación.
     * @param {String} permisos - Permisos del usuario.
     * @param {Array} scopes  - Lista de permisos requeridos.
     */
    const verificarPermisos = (permisos, scopes) => {
        let res = true;

        for (const i of scopes) {
            res &= permisos.includes(i);
        }

        setPermisos(res);
    };

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {User} currentUser - Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = async (currentUser) => {
        // Si ya estaba autenticado, se actualiza su información y refrescan los tokens de OAuth
        if (currentUser != null) {
            /* Evitando que se muestre el cuadro de seleccion de cuenta cuando se cierra sesión
               , el usuario se encuentre en la pestaña principal o cuando recargue la página */
            const resCredsSesion = cargarAuthCredsSesion();

            if (!resCredsSesion && window.location.pathname != "/cerrar-sesion" && window.location.pathname != "/") {
                await reautenticarUsuario(currentUser);
            }
            setAuthInfo((x) => ({ ...x, user: currentUser, correo: currentUser.email }));
        } else {
            setAuthInfo({ user: null, correo: null, rol: null });
        }
    };

    /**
     * Inicia sesión con Google dentro de Firebase. Si la autenticación es exitosa 
     * almacena las credenciales del usuario.
     * @param {boolean} ejecutar - Indica si se debe ejecutar el inicio de sesión. Por defecto es false.
     */
    const iniciarSesionGoogle = async () => {
        let resultado = { res: false, operacion: 0, error: "" };
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
            const oauth = GoogleAuthProvider.credentialFromResult(res);

            verificarPermisos(JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes, scopes);

            // Guardando el token de acceso a Google Drive
            setTokenDrive(oauth);
            guardarAuthCredsSesion(oauth);

            if (!reg.success) {
                // Si no se pudo registrar al usuario, se cierra la sesión
                cerrarSesion();
                resultado = { res: true, operacion: 0, error: "No se pudo verificar si el usuario está registrado." };
            } else {
                // Al iniciar sesión correctamente, se actualiza la información del usuario
                setAuthInfo((x) => ({ ...x, user: res.user }));
            }
            setAuthError(resultado);
        } catch (error) {
            manejadorErroresAuth(error, 0);
        }

        setCargando(false);
    };

    /**
     * Reautentica al usuario para actualizar las credenciales de acceso a Google.
     * @param {User} usuario - Instancia del usuario de Firebase.
     */
    const reautenticarUsuario = async (usuario) => {
        if (usuario != null && tokenDrive == null) {
            setCargando(true);

            try {
                const provider = new GoogleAuthProvider();

                // Se añaden los permisos necesarios para usar Drive
                for (const i of scopes) {
                    provider.addScope(i);
                }

                // Se vuelve a abrir el popup de Google para obtener el token de acceso a Drive
                const res = await reauthenticateWithPopup(usuario, provider);
                const oauth = GoogleAuthProvider.credentialFromResult(res);

                verificarPermisos(JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes, scopes);
                setTokenDrive(oauth);
                guardarAuthCredsSesion(oauth);

                setAuthError({ res: false, operacion: 2, error: "" });
            } catch (error) {
                manejadorErroresAuth(error, 2);
            }

            setCargando(false);
        }
    };

    /**
     * Cierra la sesión del usuario.
     */
    const cerrarSesion = async () => {
        setCargando(true);

        try {
            await signOut(auth);
            borrarAuthCredsSesion();
            setTokenDrive(null);
            setAuthInfo({ user: null, email: null, rol: null });
            setAuthError({ res: false, operacion: 1, error: "" });
        } catch (error) {
            console.error(error);
            setAuthError({ res: true, operacion: 1, error: "No se ha podido cerrar sesión. Reintente nuevamente." });
        }

        setCargando(false);
    };

    /**
     * Actualiza la información del usuario dentro del contexto.
     * @param {String} correo 
     */
    const verDatosUsuario = async (correo) => {
        if (correo != null) {
            const data = await verUsuario(correo, db);

            if ((data.success == 1) && (data.data != undefined)) {
                setAuthInfo((x) => ({
                    user: x.user, correo: data.data.correo, rol: data.data.rol
                }));
            }
        }
    };

    /**
     * Registra un nuevo usuario en la base de datos.
     * @param {String} correo - Correo del usuario a registrar.
     * @returns JSON
     */
    const registrarUsuario = async (correo) => {
        /* rol = 0 - Usuario normal
           rol = 1001 - Administrador */
        if (correo != null) {
            const res = await cambiarUsuario({ correo: correo, rol: 0 }, db);

            return { success: res.success };
        }
    };

    /**
     * Verifica si un usuario está registrado en la base de datos.
     * @param {String} correo - Correo del usuario a verificar.
     */
    const verRegistrado = async (correo) => {
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
    };

    /**
     * Carga las credenciales de sesión en el sessionStorage.
     * @returns Boolean
     */
    const cargarAuthCredsSesion = () => {
        const valores = sessionStorage.getItem("session-tokens");

        if (valores != null) {
            const tokens = JSON.parse(valores);
            setTokenDrive(tokens.accessToken);

            return true;
        }

        return false;
    };

    /**
     * Borra las credenciales de sesión almacenadas en el sessionStorage.
     */
    const borrarAuthCredsSesion = () => {
        sessionStorage.removeItem("session-tokens");
    };

    /**
     * Guarda las credenciales de sesión en las cookies del navegador.
     * @param {JSON} tokens - Credenciales OAuth de Google.
     */
    const guardarAuthCredsSesion = (tokens) => {
        sessionStorage.setItem("session-tokens", JSON.stringify(tokens));
    };

    /**
     * Maneja los errores de autenticación que se presenten.
     * @param {FirebaseError} error - Error de Firebase Auth.
     * @param {Int} codigo - Código de la operación que produjo el error.
     */
    const manejadorErroresAuth = (error, codigo) => {
        switch (error.code) {
            case "auth/popup-closed-by-user":
                // Esto es cuando el usuario cierra el popup de Google antes de iniciar sesión
                break;
            case "auth/user-cancelled":
                // Esto es cuando el usuario cancela la autenticación y no otorga los permisos
                setAuthError({ res: true, operacion: codigo, error: "Debes otorgar los permisos requeridos para usar la aplicación." });
                break;
            case "auth/user-mismatch":
                // Esto es cuando el usuario que intenta iniciar sesión no coincide con el usuario actual
                setAuthError({ res: true, operacion: codigo, error: `Ya tienes una sesión iniciada con el usuario: "${authInfo.user.displayName}" (${authInfo.user.email}).` });
                break;
            default:
                console.error("Error de autenticación:", error);
                setAuthError({ res: true, operacion: codigo, error: "Error al iniciar sesión. Reintenta nuevamente." });
                break;
        }
    };

    return (
        <authContext.Provider value={{ useAuth, auth, cargando, authInfo, authError, tokenDrive, setAuth, setDb, setTokenDrive, setScopes, cerrarSesion, iniciarSesionGoogle, verDatosUsuario, reautenticarUsuario, permisos }}>
            {children}
        </authContext.Provider>
    );
};