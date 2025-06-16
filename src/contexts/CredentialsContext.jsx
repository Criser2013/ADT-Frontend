import { createContext, useState, useContext, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { API_URL, ENTORNO } from "../../constants";

export const credentialsContext = createContext();

export const useCredentials = () => {
    const context = useContext(credentialsContext);
    if (!context) {
        console.log("Error creando el contexto.");
    }
    return context;
};

export function CredentialsProvider({ children }) {

    const [credsInfo, setCredsInfo] = useState({
        apiKey: null, authDomain: null, projectId: null,
        storeBucket: null, messagingSenderId: null,
        appId: null, measurementId: null, app: null,
        db: null, auth: null
    });

    const [driveCreds, setDriveCreds] = useState({
        clientId: null, authUrl: null, tokenUrl: null,
        authProviderX509CertUrl: null, authClientSecret: null,
        redirectUrl: null, javascriptOrigins: null, drive: null
    });

    /**
     * Inicializa Firebase dependiendo del entorno de ejecución.
     */
    useEffect(() => {
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

            inicializarDrive({
                clientId: import.meta.env.VITE_DRIVE_CLIENT_ID,
                authUrl: import.meta.env.VITE_DRIVE_AUTH_URL,
                tokenUrl: import.meta.env.VITE_DRIVE_TOKEN_URL,
                authProviderX509CertUrl: import.meta.env.VITE_DRIVE_AUTH_PROVIDER_X509_CERT_URL,
                authClientSecret: import.meta.env.VITE_DRIVE_AUTH_CLIENT_SECRET,
                redirectUrl: import.meta.env.VITE_DRIVE_REDIRECT_URL.split(","),
                javascriptOrigins: import.meta.env.VITE_DRIVE_JAVASCRIPT_ORIGINS.split(","),
                scopes: import.meta.env.VITE_DRIVE_SCOPES.split(",")
            });
        }
        else {
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

                    inicializarDrive({
                        clientId: json.data.drive_clientId,
                        authUrl: json.data.drive_authUrl,
                        tokenUrl: json.data.drive_tokenUrl,
                        authProviderX509CertUrl: json.data.drive_authProviderX509CertUrl,
                        authClientSecret: json.data.drive_authClientSecret,
                        redirectUrl: json.data.drive_redirectUrl,
                        javascriptOrigins: json.data.drive_javascriptOrigins,
                        scopes: json.data.scopes
                    });
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

    const inicializarDrive = (cliente) => {
        setDriveCreds({
            clientId: cliente.clientId,
            authUrl: cliente.authUrl,
            tokenUrl: cliente.tokenUrl,
            authProviderX509CertUrl: cliente.authProviderX509CertUrl,
            authClientSecret: cliente.authClientSecret,
            redirectUrl: cliente.redirectUrl,
            javascriptOrigins: cliente.javascriptOrigins,
            scopes: cliente.scopes
        });
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

    const verScopesDrive = () => {
        return driveCreds.scopes;
    };


    return (
        <credentialsContext.Provider value={{ useCredentials, obtenerInstanciaAuth, obtenerInstanciaDB, verSiCredsFirebaseEstancargadas, verScopesDrive }}>
            {children}
        </credentialsContext.Provider>
    );
}