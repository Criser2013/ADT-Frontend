import { AuthContext } from "../hooks/auth-hook";
import { cerrarSesion as cerrarSesionFirebase, cargarCredsOAuth, verRolUsuario } from "../services/Autenticacion";
import { DriveHelper, iniciarSesion as iniciarSesionFirebase } from "../helpers";
import { onAuthStateChanged } from "firebase/auth";
import { UsuarioAutenticado } from "../models";
import { useAppConfig } from "../hooks";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/**
 * Proveedor del contexto que permite gestionar el estado de la autenticación.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
    const idTareaRefresco = useRef(null);
    const { firebaseAuth, scopesDrive } = useAppConfig();
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [requiereRefresco, setRequiereRefresco] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const autenticado = useMemo(() => usuario instanceof UsuarioAutenticado, [usuario]);
    const helper = useMemo(() => {
        if (autenticado) {
            return new DriveHelper(usuario.tokenDrive);
        } else {
            return null;
        }
    }, [usuario, autenticado]);

    /**
     * @returns {Promise<Boolean>} Retorna true si la sesión se cerró correctamente, de lo contrario retorna false.
     */
    const cerrarSesion = useCallback(async () => {
        let res = false;

        setCargando(true);

        const { success, error } = await cerrarSesionFirebase(firebaseAuth, idTareaRefresco);

        if (!success) {
            setError(error);
        } else {
            setUsuario(null);
            setRequiereRefresco(false);
        }
        res = success;

        setCargando(false);

        return res;
    }, [firebaseAuth, idTareaRefresco, setCargando, setError, setUsuario, setRequiereRefresco]);

    /**
     * @param {Boolean} modo Indica si se debe activar o desactivar el modo de usuario.
     */
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
     * @returns {Promise<Boolean>} Retorna true si la sesión se inició correctamente, de lo contrario retorna false.
     */
    const iniciarSesion = useCallback(async (usuario = null) => {
        setCargando(true);

        const res = await iniciarSesionFirebase(firebaseAuth, scopesDrive, usuario ? usuario.usuarioFirebase : null);

        if (res.success) {
            const { usuario, accessToken, rol, tiempoExpiracion } = res;
            const user = new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken);
            const idTarea = setTimeout(mostrarRefrescoTokens, tiempoExpiracion);

            idTareaRefresco.current = idTarea;
            setError(null);
            setUsuario(user);
            setRequiereRefresco(false);
        } else {
            setError(res.error);
        }

        setCargando(false);

        return res.success;
    }, [firebaseAuth, scopesDrive, setCargando, setError, setUsuario, mostrarRefrescoTokens]);

    /**
     * Maneja los cambios en la autenticación del usuario.
     * @param {import("firebase/auth").User} usuario Usuario actual de Firebase.
     */
    const manejadorCambiosAuth = useCallback(async (usuario) => {
        if (usuario) {
            const { success, expires, accessToken } = cargarCredsOAuth();
            const tiempoPrevioRefresco = success ? ((parseInt(expires) - Date.now()) / 1000) : null;
            const urlExcenta = location.pathname == "/";

            if (tiempoPrevioRefresco > 180) {
                const rol = await verRolUsuario(usuario);
                const idTarea = setTimeout(mostrarRefrescoTokens, (tiempoPrevioRefresco - 180) * 1000);

                clearTimeout(idTareaRefresco.current);
                idTareaRefresco.current = idTarea;

                setUsuario(new UsuarioAutenticado(usuario, usuario.uid, rol, accessToken));
                setCargando(false);
            } else if (!urlExcenta && (tiempoPrevioRefresco > 20) && (tiempoPrevioRefresco <= 180)) {
                mostrarRefrescoTokens();
            } else if (!urlExcenta) {
                await iniciarSesion(usuario);
            }
        } else {
            if (location.pathname != "/") {
                location.replace("/");
            }
        }
    }, [setUsuario, setCargando, mostrarRefrescoTokens, iniciarSesion]);

    /**
     * Retira el indicador de carga cuando se tiene la instancia de FirebaseAuth y permisos de Drive requeridos.
     */
    useEffect(() => {
        if (firebaseAuth && scopesDrive) {
            setCargando(false);
        }
    }, [firebaseAuth, scopesDrive, setCargando]);

    /**
     * Recupera la sesión si el usuario no la ha cerrado. También refresca los tokens
     * cuando caducan.
     */
    useEffect(() => {
        if (firebaseAuth) {
            const suscribed = onAuthStateChanged(firebaseAuth, manejadorCambiosAuth);
            return () => suscribed();
        }
    }, [firebaseAuth, manejadorCambiosAuth]);

    const value = useMemo(() => ({
        cargando, error, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, datosHelper: helper
    }), [cargando, error, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion, helper
    ]);

    return (
        <AuthContext value={value}>
            {children}
        </AuthContext>
    );
};