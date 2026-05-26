import { reauthenticateWithPopup, signOut } from "firebase/auth";
import { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { AES_KEY } from "../../constants";
import { useTranslation } from "react-i18next";
import { AES, enc } from "crypto-js";
import { peticionApi } from "../services/Api";

export const authContext = createContext();

/**
 * Otorga acceso al contexto de autenticación de la aplicación.
 * @returns {React.Context}
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
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
    const { i18n, t } = useTranslation();
    // Instancia de autenticación de Firebase
    const [auth, setAuth] = useState(null);
    // Instancia de la base de datos de Firebase
    const [tokenDrive, setTokenDrive] = useState(null);
    // Información del usuario autenticado
    const [authInfo, setAuthInfo] = useState({
        user: null, // Instancia del usuario de Firebase
        uid: null, // UID del usuario
        rol: null, // Rol del usuario (0 - Usuario normal, 1001 - Administrador)
        modoUsuario: null, // Modo de usuario (false - desactivado, true - activado)
        rolVisible: null
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
    const [autenticado, setAutenticado] = useState(null);
    const [requiereRefresco, setRequiereRefresco] = useState(false);
    const [idTareaRefresco, setIdTareaRefresco] = useState(null);

    /**
     * Si el usuario ya está autenticado, obtiene sus datos.
     */
    useEffect(() => {
        const { user, uid, rol } = authInfo;
        const ruta = window.location.pathname != "/";
        if (user != null && uid != null && rol == null && ruta) {
            setCargando(true);
            verDatosUsuario(user).then(() => {
                setCargando(false);
            });
        }
    }, [authInfo.user, authInfo.uid, authInfo.rol]);

    /**
     * Retira el indicador de carga cuando se tienen las instancias de la base de datos,
     * autenticación y permisos de Drive requeridos.
     */
    useEffect(() => {
        const ruta = window.location.pathname == "/";
        if (auth != null && scopes != null && ruta) {
            setCargando(false);
        }
    }, [auth, scopes]);

    /**
     * Recupera la sesión si el usuario no la ha cerrado. También refresca los tokens
     * cuando caducan.
     */
    useEffect(() => {
        if (auth != null) {
            const suscribed = onAuthStateChanged(auth, manejadorCambiosAuth);
            return () => suscribed();
        }
    }, [auth]);

    /**
     * Refresca los tokens OAuth del usuario si este se encuentra autenticado.
     */
    const refrescarTokens = () => {
        clearTimeout(idTareaRefresco);
        setRequiereRefresco(true);
    };

    /**
     * Verifica que el usuario tenga los permisos necesarios para usar la aplicación.
     * @param {String} permisos - Permisos del usuario.
     * @param {Array[string]} scopes  - Lista de permisos requeridos.
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
     * @param {import("firebase/auth").User} usuario - Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = async (usuario) => {
        if (usuario != null) {
            const resCredsSesion = cargarAuthCredsSesion();
            const fecha = (resCredsSesion.success && resCredsSesion.expires != undefined) ? ((parseInt(resCredsSesion.expires, 10) - Date.now()) / 1000) : null;
            const urlConds = ["/cerrar-sesion", "/"].includes(location.pathname);

            if (fecha != null && fecha > 180) {
                clearTimeout(idTareaRefresco);              // Se refresca el token de acceso sino faltan mas de 3 minutos para que caduque el token - Cuando se recarga la página
                setIdTareaRefresco(setTimeout(refrescarTokens, (fecha - 180) * 1000));
            } else if (fecha != null && (fecha <= 180 && fecha > 20)) {
                refrescarTokens();
            } else if (!urlConds) {
                await reautenticarUsuario(usuario);
            }

            setAutenticado(true);
            setAuthInfo((x) => ({ ...x, user: usuario, uid: usuario.uid }));
        } else {
            setAutenticado(false);
            setAuthInfo({ user: null, uid: null, rol: null, modoUsuario: null, rolVisible: null });

            if (!["/", "/404"].includes(location.pathname)) {
                location.replace("/");
            }
        }
    };

    /**
     * Inicia sesión con Google dentro de Firebase. Si la autenticación es exitosa 
     * almacena las credenciales del usuario.
     */
    const iniciarSesionGoogle = async () => {
        let resultado = { res: false, operacion: 0, error: "" };
        setCargando(true);

        try {
            let provider = new GoogleAuthProvider();

            provider.setDefaultLanguage(i18n.language);
            // Se añaden los permisos necesarios para usar Drive
            for (const i of scopes) {
                provider.addScope(i);
            }

            // Se abre el popup de Google para iniciar sesión
            const res = await signInWithPopup(auth, provider);
            // Se verifica si el usuario ya está registrado en la base de datos y esté activado
            const reg = await verRegistrado(res.user);
            const oauth = GoogleAuthProvider.credentialFromResult(res).toJSON();
            oauth.expires = `${Date.now() + (res._tokenResponse.oauthExpireIn * 1000)}`;
            oauth.scopesDrive = JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes;

            verificarPermisos(JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes, scopes);
            clearTimeout(idTareaRefresco);
            setIdTareaRefresco(
                setTimeout(refrescarTokens, (res._tokenResponse.oauthExpireIn - 180) * 1000)
            );

            // Guardando el token de acceso a Google Drive
            setTokenDrive(oauth.accessToken);
            guardarAuthCredsSesion(oauth);

            // Si no se pudo registrar al usuario, se cierra la sesión
            if (!reg.success) {
                cerrarSesion();
                resultado = { res: true, operacion: 0, error: t("errVerificarRegistro") };
            } else {
                if (location.pathname == "/") {
                    await verDatosUsuario(res.user);
                }
            }
            setAuthError(resultado);
            return resultado;
        } catch (error) {
            manejadorErroresAuth(error, 0, null);
            return { res: true, operacion: 0, error: t("errIniciarSesion") };
        } finally {
            setCargando(false);
        }
    };

    /**
     * Reautentica al usuario para actualizar las credenciales de acceso a Google.
     * @param {import("firebase/auth").User} usuario - Instancia del usuario de Firebase.
     */
    const reautenticarUsuario = async (usuario) => {
        setCargando(true);
        try {
            let provider = new GoogleAuthProvider();

            provider.setDefaultLanguage(i18n.language);
            // Se añaden los permisos necesarios para usar Drive
            for (const i of scopes) {
                provider.addScope(i);
            }

            // Se vuelve a abrir el popup de Google para obtener el token de acceso a Drive
            const res = await reauthenticateWithPopup(usuario, provider);
            const oauth = GoogleAuthProvider.credentialFromResult(res).toJSON();
            oauth.expires = `${Date.now() + (res._tokenResponse.oauthExpireIn * 1000)}`;
            oauth.scopesDrive = JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes;

            clearTimeout(idTareaRefresco);
            setIdTareaRefresco(
                setTimeout(refrescarTokens, (res._tokenResponse.oauthExpireIn - 180) * 1000)
            );

            verificarPermisos(JSON.parse(res._tokenResponse.rawUserInfo).granted_scopes, scopes);
            setTokenDrive(oauth.accessToken);
            guardarAuthCredsSesion(oauth);
            setAuthError({ res: false, operacion: 2, error: "" });
            setRequiereRefresco(false);

            if (location.pathname == "/") {
                await verDatosUsuario(res.user);
            }

            return { res: false, operacion: 2, error: "" };
        } catch (error) {
            // Necesario por si cierra el popup de Google antes de reautenticarse cuando el token caduca
            setRequiereRefresco(requiereRefresco);
            manejadorErroresAuth(error, 2, usuario);
            return { res: true, operacion: 2, error: t("errReautenticar") };
        } finally {
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

            if (idTareaRefresco != null) {
                clearTimeout(idTareaRefresco);
                setIdTareaRefresco(null);
            }

            borrarAuthCredsSesion();
            setTokenDrive(null);
            setAuthInfo({ user: null, uid: null, rol: null, modoUsuario: null, rolVisible: null });
            setAuthError({ res: false, operacion: 1, error: "" });
        } catch (error) {
            console.error(error);
            setAuthError({ res: true, operacion: 1, error: t("errCerrarSesion") });
        } finally {
            setCargando(false);
        }
    };

    /**
     * Actualiza la información del usuario dentro del contexto.
     * @param {import("firebase/auth").User} usuario - Instancia del usuario de Firebase.
     */
    const verDatosUsuario = async (usuario) => {
        const token = await usuario.getIdTokenResult(true);
        
        setAuthInfo((x) => {
            const modoUsuario = cargarModoUsuario();
            const rol = (modoUsuario && token.claims.admin) ? false : token.claims.admin;
            return ({
                user: x.user, uid: x.user.uid, rol: token.claims.admin, modoUsuario: modoUsuario, rolVisible: rol
            });
        });
    };

    /**
     * Registra un nuevo usuario en la base de datos.
     * @param {string} uid - UID del usuario.
     * @returns {JSON}
     */
    const registrarUsuario = async (uid) => {
        const params = { uid: uid };
        const res = await peticionApi(
            "registrar", "POST", params, null, null, i18n.language, t("errRegistrarUsuario")
        );

        return { success: res.success };
    };

    /**
     * Verifica si un usuario está registrado en la base de datos.
     * @param {import("firebase/auth").User} usuario - Instancia de usuario de Firebase.
     */
    const verRegistrado = async (usuario) => {
        const fechaActual = new Date().valueOf();
        const dif = fechaActual - parseInt(usuario.metadata.createdAt, 10);

        /* El usuario no está registrado, se procede a registrarlo, se considera que no
           está registrado si su cuenta fue creada hace menos de 1 minuto.
        */
        if (dif < 60000) {
            return await registrarUsuario(usuario.uid);
        } else {
            return { success: true };
        }
    };

    /**
     * Carga las credenciales de sesión en el sessionStorage.
     * @returns Boolean
     */
    const cargarAuthCredsSesion = () => {
        const valores = sessionStorage.getItem("session-tokens");

        if (valores != null) {
            const tokens = JSON.parse(AES.decrypt(valores, AES_KEY).toString(enc.Utf8));
            setTokenDrive(tokens.accessToken);
            verificarPermisos(tokens.scopesDrive, scopes);

            return { success: true, expires: tokens.expires };
        }

        return { success: false };
    };

    /**
     * Borra las credenciales de sesión almacenadas en el sessionStorage.
     */
    const borrarAuthCredsSesion = () => {
        sessionStorage.removeItem("session-tokens");
        sessionStorage.removeItem("modo-usuario");
        sessionStorage.removeItem("ejecutar-callback");
    };

    /**
     * Guarda las credenciales de sesión en las cookies del navegador.
     * @param {JSON} tokens - Credenciales OAuth de Google.
     */
    const guardarAuthCredsSesion = (tokens) => {
        const res = AES.encrypt(JSON.stringify(tokens), AES_KEY).toString();
        sessionStorage.setItem("session-tokens", res);
    };

    /**
     * Maneja los errores de autenticación que se presenten.
     * @param {FirebaseError} error - Error de Firebase Auth.
     * @param {Int} codigo - Código de la operación que produjo el error.
     */
    const manejadorErroresAuth = (error, codigo, usuario) => {
        switch (error.code) {
            case "auth/popup-closed-by-user":
                // Esto es cuando el usuario cierra el popup de Google antes de iniciar sesión
                if (location.pathname != "/") {
                    location.replace("/");
                }
                break;
            case "auth/user-cancelled":
                // Esto es cuando el usuario cancela la autenticación y no otorga los permisos
                setAuthError({ res: true, operacion: codigo, error: t("errPermisos") });
                break;
            case "auth/user-mismatch":
                // Esto es cuando el usuario que intenta iniciar sesión no coincide con el usuario actual
                setAuthError({
                    res: true, operacion: codigo,
                    error: t("errSesionIniciada", { usuario: usuario.displayName, correo: usuario.email })
                });
                break;
            case "auth/user-disabled":
                setAuthError({
                    res: true, operacion: codigo,
                    error: t("errUsuarioBaneado")
                });
                break;
            default:
                console.error("Error de autenticación:", error);
                setAuthError({ res: true, operacion: codigo, error: t("errIniciarSesion") });
                break;
        }
    };

    /**
     * Quita el indicador de carga. Solo se usa cuando se ha cargado la información.
     */
    const quitarPantallaCarga = () => {
        setCargando(false);
    };

    /**
     * Coloca el indicador de carga sobre toda la aplicación (solo se utiliza en casos especiales).
     */
    const mostrarPantallaCarga = () => {
        setCargando(true);
    };

    /**
     * Permite activar o desactivar el modo de usuario de los administradores.
     * @param {Boolean} modo - Modo de usuario (false - desactivado, true - activado).
     */
    const cambiarModoUsuario = (modo) => {
        setCargando(true);
        setAuthInfo((x) => ({ ...x, modoUsuario: modo, rolVisible: (modo ? 0 : x.rol) }));
        sessionStorage.setItem("modo-usuario", modo ? "true" : "false");
        setTimeout(() => setCargando(false), 500);
    };

    /**
     * Carga el modo de usuario desde el almacenamiento local.
     */
    const cargarModoUsuario = () => {
        const modo = sessionStorage.getItem("modo-usuario");

        return (modo != null && modo != undefined && modo == "true");
    };

    return (
        <authContext.Provider value={{
            useAuth, auth, cargando, authInfo, authError, tokenDrive, setAuth, setTokenDrive,
            setScopes, cerrarSesion, iniciarSesionGoogle, reautenticarUsuario, permisos, autenticado,
            requiereRefresco, quitarPantallaCarga, cambiarModoUsuario, mostrarPantallaCarga
        }}>
            {children}
        </authContext.Provider>
    );
};