import { cerrarSesion as cerrarSesionFirebase, iniciarSesion as iniciarSesionFirebase, cargarCredsOAuth, verRolUsuario } from "../services/Autenticacion";
import GoogleHelper from "../helpers/drive-helper";
import UsuarioAutenticado from "../models/UsuarioAutenticado";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { authContext } from "../hooks/auth-hook";

authContext;

/**
 * Proveedor del contexto que permite gestionar el estado de la autenticación.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);
    const [scopes, setScopes] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [requiereRefresco, setRequiereRefresco] = useState(false);
    const idTareaRefresco = useRef(null);
    const autenticado = useMemo(() => usuario instanceof UsuarioAutenticado, [usuario]);
    const helper = useMemo(() => {
        if (autenticado) {
            return new GoogleHelper(usuario.accessToken);
        } else {
            return null;
        }
    }, [usuario, autenticado]);

    const value = useMemo(() => ({
        cargando, error, setAuth, setScopes, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, datosHelper: helper
    }), [cargando, error, setAuth, setScopes, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, helper
    ]);

    /**
     * Retira el indicador de carga cuando se tiene la instancia de FirebaseAuth y permisos de Drive requeridos.
     */
    useEffect(() => {
        const ruta = location.pathname == "/";
        if (auth && scopes && ruta) {
            setCargando(false);
        }
    }, [auth, scopes, setCargando]);

    /**
     * Recupera la sesión si el usuario no la ha cerrado. También refresca los tokens
     * cuando caducan.
     */
    useEffect(() => {
        if (auth) {
            const suscribed = onAuthStateChanged(auth, manejadorCambiosAuth);
            return () => suscribed();
        }
    }, [auth, manejadorCambiosAuth]);

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {import("firebase/auth").User} usuario Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = useCallback(async (usuario) => {
        if (usuario) {
            const { success, expires, accessToken } = cargarCredsOAuth();
            const tiempoPrevioRefresco = success ? ((parseInt(expires) - Date.now()) / 1000) : null;
            const urlExcentas = ["/cerrar-sesion", "/"].includes(location.pathname);

            if (!urlExcentas && (tiempoPrevioRefresco > 180)) {
                const rol = await verRolUsuario(usuario);
                const idTarea = setTimeout(mostrarRefrescoTokens, (tiempoPrevioRefresco - 180) * 1000);

                clearTimeout(idTareaRefresco.current);
                idTareaRefresco.current = idTarea;

                setUsuario(new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken));
                setCargando(false);

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
    }, [setUsuario, setCargando, mostrarRefrescoTokens, iniciarSesion]);


    const iniciarSesion = useCallback(async (usuario = null) => {
        setCargando(true);

        const res = await iniciarSesionFirebase(auth, scopes, usuario);

        if (res.success) {
            const { usuario, accessToken, rol, tiempoExpiracion } = res;
            const user = new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken);
            const idTarea = setTimeout(mostrarRefrescoTokens, tiempoExpiracion);

            idTareaRefresco.current = idTarea;
            setUsuario(user);
        } else {
            setError(res.error);
        }

        setCargando(false);

        return res.success;
    }, [auth, scopes, setCargando, setError, setUsuario, mostrarRefrescoTokens]);

    const cerrarSesion = useCallback(async () => {
        setCargando(true);
        const { success, error } = await cerrarSesionFirebase(auth, idTareaRefresco);
        if (!success) {
            setError(error);
        }
        setCargando(false);
    }, [auth, idTareaRefresco, setCargando, setError]);

    const cambiarModoUsuario = useCallback((modo) => {
        setUsuario((x) => {
            const nuevoUsuario = structuredClone(x);
            nuevoUsuario.cambiarModoUsuario(modo);
            return nuevoUsuario;
        });
    }, [setUsuario]);

    const mostrarRefrescoTokens = useCallback(() => {
        setRequiereRefresco(true);
        idTareaRefresco.current = null;
    }, [setRequiereRefresco]);

    return (
        <authContext.Provider value={value}>
            {children}
        </authContext.Provider>
    );
};