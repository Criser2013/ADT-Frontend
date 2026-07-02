import {
    cargarCredencialesServidor,
    cargarCredencialesCache,
    almacenarCredencialesCache
} from "../services/Credenciales";
import { CredencialesContext } from "../hooks/credenciales-hook";
import { inicializarFirebase } from "../services/Firebase";
import { useEffect, useMemo, useReducer } from "react";


/**
 * Estado inicial del contexto.
 */
const estadoInicial = {
    firebase: null, firestore: null,
    firebaseAuth: null, reCAPTCHA: null,
    scopesDrive: null, cargando: true,
    error: null
};

/**
 * Reducer encargado de administrar el estado global credenciales de la aplicación.
 * @param {import("react").ReducerState} state Estado actual del contexto.
 * @param {Object} action Acción a ejecutar sobre el estado.
 * @returns {Object} Nuevo estado del contexto.
 */
function credencialesReducer(state, action) {
    switch (action.type) {
        case "INICIALIZAR_APP":
            return {
                ...state,
                firebase: action.payload.firebase,
                firestore: action.payload.firestore,
                firebaseAuth: action.payload.firebaseAuth,
                reCAPTCHA: action.payload.reCAPTCHA,
                scopesDrive: action.payload.scopesDrive,
                cargando: false,
                error: null
            };
        case "ERROR":
            return { ...state, cargando: false, error: action.payload };
        case "CARGANDO":
            return { ...state, cargando: true, error: null };
        case "RESET":
            return estadoInicial;
        default:
            return state;
    }
}

/**
 * Provider de credenciales globales de la aplicación.
 * Inicializa Firebase y expone las instancias necesarias.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function CredencialesProvider({ children }) {
    const [state, dispatch] = useReducer(
        credencialesReducer, estadoInicial
    );
    const aplicacionIniciada = useMemo(() => (
        [state.firebase, state.firestore, state.firebaseAuth].every((x) => x)
    ), [state.firebase, state.firestore, state.firebaseAuth
    ]);

    // Valor expuesto por el contexto.
    const value = useMemo(() => ({
        ...state, aplicacionIniciada
    }), [state, aplicacionIniciada]);

    /**
     * Inicializa las credenciales de la aplicación.
     */
    useEffect(() => {
        let mounted = true;
        const controlador = new AbortController();
        const inicializar = async () => {
            dispatch({ type: "CARGANDO" });

            const cache = cargarCredencialesCache();
            if (cache.success) {
                inicializarAplicacion(cache.firebase, cache.recaptcha, cache.scopesDrive);
                return;
            }

            const res = await cargarCredencialesServidor(controlador);
            if (!mounted) {
                return;
            }

            if (res.success) {
                inicializarAplicacion(res.data.firebase, res.data.recaptcha, res.data.scopesDrive);
                return;
            }

            dispatch({ type: "ERROR", payload: res.error });
        };

        inicializar();

        return () => { 
            mounted = false;
            controlador.abort();
         };
    }, []);

    /**
     * Inicializa la aplicación con la información de credenciales proporcionada.
     * @param {Object} credsFirebase Credenciales de Firebase.
     * @param {String} tokenRecaptcha Clave del cliente de reCAPTCHA.
     * @param {Array<String>} scopesDrive Scopes de acceso a Google Drive.
     */
    const inicializarAplicacion = (credsFirebase, tokenRecaptcha, scopesDrive) => {
        const { app, auth, firestore } = inicializarFirebase(credsFirebase);

        almacenarCredencialesCache(credsFirebase, tokenRecaptcha, scopesDrive);
        dispatch({
            type: "INICIALIZAR_APP",
            payload: {
                firebase: app,
                firestore,
                firebaseAuth: auth,
                reCAPTCHA: tokenRecaptcha,
                scopesDrive
            }
        });
    };

    return (
        <CredencialesContext value={value}>
            {children}
        </CredencialesContext>
    );
}