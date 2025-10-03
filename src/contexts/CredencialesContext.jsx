import { createContext, useState, useContext, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { AES_KEY, API_URL, ENTORNO } from "../../constants";
import Cookies from "js-cookie";
import { AES, enc } from "crypto-js";

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
 * @returns {JSX.Element}
 */
export function CredencialesProvider({ children }) {

    const [credsInfo, setCredsInfo] = useState({
        apiKey: null, authDomain: null, projectId: null,
        storeBucket: null, messagingSenderId: null,
        appId: null, measurementId: null, app: null,
        db: null, auth: null, reCAPTCHA: null
    });

    const [scopesDrive, setScopesDrive] = useState(null);

    /**
     * Inicializa Firebase dependiendo del entorno de ejecución.
     */
    useEffect(() => {
        // Entorno de desarrollo solo frontend
        const res = cargarCredsCookies();

        if (ENTORNO == "0" && !res) {
            inicializarFirebase({
                apiKey: import.meta.env.VITE_API_KEY,
                authDomain: import.meta.env.VITE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_PROJECT_ID,
                storeBucket: import.meta.env.VITE_STORE_BUCKET,
                messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_APP_ID,
                measurementId: import.meta.env.VITE_MEASUREMENT_ID,
                scopes: import.meta.env.VITE_DRIVE_SCOPES.split(","),
                reCAPTCHA: import.meta.env.VITE_RECAPTCHA_SITE_KEY
            });

            setScopesDrive(import.meta.env.VITE_DRIVE_SCOPES.split(","));
        } else if (!res) {
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
        let parar = false;
        while (intentos < 4 && !parar) {
            try {
                const res = await fetch(`${API_URL}/credenciales`, {
                    method: "GET"
                });

                if (res.status == 200 && res.ok) {
                    parar = true;
                    const json = await res.json();
                    inicializarFirebase({
                        apiKey: json.apiKey,
                        authDomain: json.authDomain,
                        projectId: json.projectId,
                        storeBucket: json.storageBucket,
                        messagingSenderId: json.messagingSenderId,
                        appId: json.appId,
                        measurementId: json.measurementId,
                        scopes: json.driveScopes,
                        reCAPTCHA: json.reCAPTCHA
                    });

                    setScopesDrive(json.data.scopes);
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
            const scopes = credsInfo.scopes;

            delete credsInfo.scopes;

            const app = initializeApp(credsInfo);
            const db = getFirestore(app);
            const auth = getAuth(app);

            almacenarCredenciales(credsInfo, scopes);

            setScopesDrive(scopes);
            setCredsInfo((x) => ({ ...x, app: app, db: db, auth: auth, reCAPTCHA: credsInfo.reCAPTCHA }));
        }
    };

    /**
     * Almacena las dredenciales de los servicios de la aplicación en una cookie de sesión.
     * @param {JSON} firebaseCreds - Credenciales de Firebase.
     * @param {Array} scopes - Scopes de acceso a Google Drive.
     */
    const almacenarCredenciales = (firebaseCreds, scopes) => {
        const json = AES.encrypt(JSON.stringify(firebaseCreds), AES_KEY).toString();
        Cookies.set("session-credentials", json);
        Cookies.set("session-drive-scopes", scopes);
    };

    /**
     * Carga las credenciales de los servicios desde las cookies.
     * Devuelve el resultado de las operación.
     * @returns {Boolean}
     */
    const cargarCredsCookies = () => {
        const firebaseCreds = Cookies.get("session-credentials");
        const driveScopes = Cookies.get("session-drive-scopes");
        let res = (firebaseCreds != undefined && firebaseCreds != null);

        if (res && (driveScopes != undefined && driveScopes != null)) {
            const creds = JSON.parse(AES.decrypt(firebaseCreds, AES_KEY).toString(enc.Utf8));

            setScopesDrive(driveScopes.split(","));
            setCredsInfo((x) => ({ ...x, ...creds }));

            creds.scopes = driveScopes.split(",");

            inicializarFirebase(creds);

            res &= true;
        }

        return res;
    };

    /**
     * Obtiene la instancia de Firestore.
     * @returns {Object}
     */
    const obtenerInstanciaDB = () => {
        return credsInfo.db;
    };

    /**
     * Obtiene la instancia de autenticación de Firebase.
     * @returns {Object}
     */
    const obtenerInstanciaAuth = () => {
        return credsInfo.auth;
    };

    /**
     * Verificar si las credenciales de Firebase están cargadas.
     * @returns {Boolean}
     */
    const verSiCredsFirebaseEstancargadas = () => {
        return credsInfo.app != null && credsInfo.db != null && credsInfo.auth != null;
    };

    /**
     * Obtiene la clave de reCAPTCHA de las credenciales.
     * @returns {String}
     */
    const obtenerRecaptcha = () => {
        return credsInfo.reCAPTCHA;
    };

    return (
        <credencialesContext.Provider value={{
            useCredenciales, obtenerInstanciaAuth, obtenerInstanciaDB,
            verSiCredsFirebaseEstancargadas, scopesDrive, obtenerRecaptcha
        }}>
            {children}
        </credencialesContext.Provider>
    );
}