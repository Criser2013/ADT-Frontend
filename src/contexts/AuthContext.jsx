import { AuthContext } from "../hooks/auth-hook";
import { cerrarSesion as cerrarSesionFirebase, cargarCredsOAuth, verRolUsuario } from "../services/Autenticacion";
import { DriveHelper, iniciarSesion as iniciarSesionFirebase } from "../helpers";
import { onAuthStateChanged } from "firebase/auth";
import { UsuarioAutenticado } from "../models";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

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
            return new DriveHelper(usuario.accessToken);
        } else {
            return null;
        }
    }, [usuario, autenticado]);

    /**
     * Retira el indicador de carga cuando se tiene la instancia de FirebaseAuth y permisos de Drive requeridos.
     */
    useEffect(() => {
        const ruta = location.pathname == "/";
        if (auth && scopes && ruta) {
            setCargando(false);
        }
    }, [auth, scopes, setCargando]);

    const cerrarSesion = useCallback(async () => {
        let res = false;
        setCargando(true);
        if (auth) {
            const { success, error } = await cerrarSesionFirebase(auth, idTareaRefresco);
            if (!success) {
                setError(error);
            } else {
                setUsuario(null);
                setRequiereRefresco(false);
            }
            res = success;
        }
        setCargando(false);
        return res;
    }, [auth, idTareaRefresco, setCargando, setError, setUsuario, setRequiereRefresco]);

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

    /**
     * @param {UsuarioAutenticado} usuario Instancia del usuario autenticado.
     */
    const iniciarSesion = useCallback(async (usuario = null) => {
        setCargando(true);

        const res = await iniciarSesionFirebase(auth, scopes, usuario ? usuario.usuarioFirebase : null);

        if (res.success) {
            const { usuario, accessToken, rol, tiempoExpiracion } = res;
            const user = new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken);
            const idTarea = setTimeout(mostrarRefrescoTokens, tiempoExpiracion);

            idTareaRefresco.current = idTarea;
            setError(null);
            setUsuario(user);
        } else {
            setError(res.error);
        }

        setCargando(false);

        return res.success;
    }, [auth, scopes, setCargando, setError, setUsuario, mostrarRefrescoTokens]);

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {import("firebase/auth").User} usuario Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = useCallback(async (usuario) => {
        if (usuario) {
            const { success, expires, accessToken } = cargarCredsOAuth();
            const tiempoPrevioRefresco = success ? ((parseInt(expires) - Date.now()) / 1000) : null;
            const urlExcentas = ["/cerrar-sesion", "/"].includes(location.pathname);

            if (!urlExcentas && tiempoPrevioRefresco > 180) {
                console.log("xd")
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

    const value = useMemo(() => ({
        cargando, error, setAuth, setScopes, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, datosHelper: helper
    }), [cargando, error, setAuth, setScopes, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, helper
    ]);

    console.log("Instancia: ", auth)
    console.log("Autenticado: ", autenticado)
    console.log("Usuario: ",usuario)
    console.log("Error: ", error)
    console.log("Cargando ", cargando)
    console.log("Requiere refresco", requiereRefresco)

    return (
        <AuthContext value={value}>
            {children}
        </AuthContext>
    );
};