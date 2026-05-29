import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { cerrarSesion as cerrarSesionFirebase, iniciarSesion as iniciarSesionFirebase, cargarCredsOAuth, verRolUsuario } from "../services/Autenticacion";
import UsuarioAutenticado from "../models/UsuarioAutenticado";

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
    // Permisos necesarios para usar Google Drive
    const [scopes, setScopes] = useState(null);

    // Información del usuario autenticado
    const [usuario, setUsuario] = useState(null);

    // Información sobre errores
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);

    const [requiereRefresco, setRequiereRefresco] = useState(false);
    const [idTareaRefresco, setIdTareaRefresco] = useState(null);

    const autenticado = useMemo(() => usuario instanceof UsuarioAutenticado, [usuario]);

    const value = {
        useAuth, cargando, error, setAuth,
        setScopes, cerrarSesion, autenticado,
        requiereRefresco, setCargando, usuario, cambiarModoUsuario, iniciarSesion
    };

    /**
     * Retira el indicador de carga cuando se tiene la instancia de FirebaseAuth y permisos de Drive requeridos.
     */
    useEffect(() => {
        const ruta = location.pathname == "/";
        if (auth && scopes && ruta) {
            setCargando(false);
        }
    }, [auth, scopes]);

    /**
     * Recupera la sesión si el usuario no la ha cerrado. También refresca los tokens
     * cuando caducan.
     */
    useEffect(() => {
        if (auth) {
            const suscribed = onAuthStateChanged(auth, manejadorCambiosAuth);
            return () => suscribed();
        }
    }, [auth]);

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {import("firebase/auth").User} usuario Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = async (usuario) => {
        if (usuario) {
            const { success, expires, accessToken, permisos } = cargarCredsOAuth();
            const tiempoPrevioRefresco = success ? ((parseInt(expires) - Date.now()) / 1000) : null;
            const urlExcentas = ["/cerrar-sesion", "/"].includes(location.pathname);

            if (!urlExcentas && (tiempoPrevioRefresco > 180)) {
                const rol = await verRolUsuario(usuario);
                const idTarea = setTimeout(mostrarRefrescoTokens, (tiempoPrevioRefresco - 180) * 1000);

                clearTimeout(idTareaRefresco);
                setIdTareaRefresco(idTarea);

                setUsuario(new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken));

            } else if (!urlExcentas && (tiempoPrevioRefresco > 20) && (tiempoPrevioRefresco <= 180)) {
                mostrarRefrescoTokens();

            } else if (!urlExcentas) {
                await iniciarSesion(usuario);
            }
        } else {
            const rutasNoRedirigidas = ["/", "/cerrar-sesion"];
            if (!rutasNoRedirigidas.includes(location.pathname)) {
                location.replace("/");
            }
        }
    };


    const iniciarSesion = async (usuario = null) => {
        setCargando(true);

        const res = await iniciarSesionFirebase(auth, scopes, usuario);

        if (res.success) {
            const { usuario, accessToken, rol, expiracion } = res;
            const usuario = new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken);
            const idTarea = setTimeout(mostrarRefrescoTokens, expiracion);

            setIdTareaRefresco(idTarea);
            setUsuario(usuario);
        } else {
            setError(res.error);
        }

        setCargando(false);
    };

    const cerrarSesion = async () => {
        setCargando(true);
        const { success, error } = await cerrarSesionFirebase(auth, idTareaRefresco);
        if (!success) {
            setError(error);
        }
        setCargando(false);
    };

    const cambiarModoUsuario = (modo) => {
        setUsuario((x) => {
            x.cambiarModoUsuario(modo);
            return x;
        })
    };

    const mostrarRefrescoTokens = () => {
        setRequiereRefresco(true);
        setIdTareaRefresco(null);
    };

    return (
        <authContext.Provider value={value}>
            {children}
        </authContext.Provider>
    );
};