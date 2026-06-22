import { createContext, useState, useContext, useEffect, useMemo, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { cerrarSesion as cerrarSesionFirebase, iniciarSesion as iniciarSesionFirebase, cargarCredsOAuth, verRolUsuario } from "../services/Autenticacion";
import UsuarioAutenticado from "../models/UsuarioAutenticado";

export const authContext = createContext();

/**
 * Otorga acceso al contexto de autenticación de la aplicación.
 * @returns {Object}
 */
export const useAuth = () => {
    const context = useContext(authContext);

    if (!context) {
        throw new Error(
            "useAuth debe usarse dentro de AuthProvider."
        );
    }

    return context;
};

/**
 * Proveedor del contexto que permite gestionar el estado de la autenticación.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {

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
    const idTareaRefresco = useRef(null);

    const autenticado = useMemo(() => usuario instanceof UsuarioAutenticado, [usuario]);

    const value = useMemo(() => ({
        useAuth, cargando, error, setAuth,
        setScopes, cerrarSesion, autenticado,
        requiereRefresco, usuario, cambiarModoUsuario, autenticar
    }), [cargando, error, setAuth, setScopes, cerrarSesion, autenticado, requiereRefresco, usuario, cambiarModoUsuario, iniciarSesion]);

    /**
     * Retira el indicador de carga cuando se tiene la instancia de FirebaseAuth y permisos de Drive requeridos.
     */
    useEffect(() => {
        const ruta = location.pathname == "/";
        if (auth && scopes && ruta) {
            setCargando(false);
        }
    }, [auth, scopes, location.pathname]);

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
    async function manejadorCambiosAuth(usuario) {
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
    };


    async function iniciarSesion(usuario = null) {
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
    };

    async function cerrarSesion() {
        setCargando(true);
        const { success, error } = await cerrarSesionFirebase(auth, idTareaRefresco);
        if (!success) {
            setError(error);
        }
        setCargando(false);
    };

    function cambiarModoUsuario(modo) {
        setUsuario((x) => {
            const nuevoUsuario = structuredClone(x);
            nuevoUsuario.cambiarModoUsuario(modo);
            return nuevoUsuario;
        });
    };

    function mostrarRefrescoTokens() {
        setRequiereRefresco(true);
        idTareaRefresco.current = null;
    };

    async function autenticar() {
        return await iniciarSesion(usuario);
    };

    return (
        <authContext.Provider value={value}>
            {children}
        </authContext.Provider>
    );
};