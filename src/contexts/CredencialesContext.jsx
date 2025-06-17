import { createContext, useState, useContext, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { API_URL, ENTORNO } from "../../constants";

export const credencialesContext = createContext();

/**
 * Otorga acceso al contexto de credenciales de la aplicación.
 * @returns React.Context<CredentialsContextType>
 */
export const useCredenciales = () => {
    const context = useContext(credencialesContext);
    if (!context) {
        console.log("Error creando el contexto.");
    }
    return context;
};

/**
 * Proveedor del contexto que permite gestionar las credenciales de Firebase
 * de la aplicación.
 * @param {JSX.Element} children
 * @returns JSX.Element
 */
export function CredencialesProvider({ children }) {

    const [credsInfo, setCredsInfo] = useState({
        apiKey: null, authDomain: null, projectId: null,
        storeBucket: null, messagingSenderId: null,
        appId: null, measurementId: null, app: null,
        db: null, auth: null
    });

    const [scopesDrive, setScopesDrive] = useState(null);

    /**
     * Inicializa Firebase dependiendo del entorno de ejecución.
     */
    useEffect(() => {
        // Entorno de desarrollo solo frontend
        if (ENTORNO == "0") {
            inicializarFirebase({
                apiKey: import.meta.env.VITE_API_KEY,
                authDomain: import.meta.env.VITE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_PROJECT_ID,
                storeBucket: import.meta.env.VITE_STORE_BUCKET,
                messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_APP_ID,
                measurementId: import.meta.env.VITE_MEASUREMENT_ID
            });

            setScopesDrive(import.meta.env.VITE_DRIVE_SCOPES.split(","));
        }
        else {
            // Producción o entorno de pruebas con backend funcionando
            obtenerCredenciales();
        }
    }, []);

    /**
     * Realiza una petición al servidor para obtener las credenciales de Firebase.
     * Reintenta hasta 4 veces en caso de error. Si tiene éxito, inicializa Firebase con las credenciales obtenidas.
     */
    const obtenerCredenciales = async () => {
        let intentos = 0;
        while (intentos < 4) {
            try {
                const res = await fetch(`${API_URL}/credentials`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": `${API_URL}`
                    }
                });

                const json = await res.json();

                if (json.success) {
                    inicializarFirebase({
                        apiKey: json.data.firebase_apiKey,
                        authDomain: json.data.firebase_authDomain,
                        projectId: json.data.firebase_projectId,
                        storeBucket: json.data.firebase_storeBucket,
                        messagingSenderId: json.data.firebase_messagingSenderId,
                        appId: json.data.firebase_appId,
                        measurementId: json.data.firebase_measurementId
                    });

                    setScopesDrive(json.data.scopes);
                    break;
                } else {
                    intentos++;
                }
            } catch {
                intentos++;
            };
        }
    };

    /**
     * Inicializa Firebase con la información de credenciales proporcionada.
     * @param {JSON} credsInfo 
     */
    const inicializarFirebase = (credsInfo) => {
        if (credsInfo != undefined && credsInfo != null) {
            const app = initializeApp(credsInfo);
            const db = getFirestore(app);
            const auth = getAuth(app);

            setCredsInfo((x) => ({ ...x, app: app, db: db, auth: auth }));
        }
    };

    /**
     * Obtiene la instancia de Firestore.
     * @returns Object
     */
    const obtenerInstanciaDB = () => {
        return credsInfo.db;
    };

    /**
     * Obtiene la instancia de autenticación de Firebase.
     * @returns Object
     */
    const obtenerInstanciaAuth = () => {
        return credsInfo.auth;
    };

    /**
     * Verificar si las credenciales de Firebase están cargadas.
     * @returns Boolean
     */
    const verSiCredsFirebaseEstancargadas = () => {
        return credsInfo.app != null && credsInfo.db != null && credsInfo.auth != null;
    };

    return (
        <credencialesContext.Provider value={{ useCredentials: useCredenciales, obtenerInstanciaAuth, obtenerInstanciaDB, verSiCredsFirebaseEstancargadas, scopesDrive }}>
            {children}
        </credencialesContext.Provider>
    );
}