import { createContext, useState, useContext, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { AES_KEY, API_URL } from "../../constants";
import Cookies from "js-cookie";
import { AES, enc } from "crypto-js";

export const credencialesContext = createContext();

/**
 * Otorga acceso al contexto de credenciales de la aplicación.
 * @returns {import("react").Context}
 */
export const useCredenciales = () => {
    const context = useContext(credencialesContext);
    if (!context) {
        console.log("Error creando el contexto de credenciales.");
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

    const [claveRecaptcha, setClaveRecaptcha] = useState(null);
    const [instanciaFirestore, setInstanciaFirestore] = useState(null);
    const [instanciaFirebase, setInstanciaFirebase] = useState(null);
    const [instanciaFirebaseAuth, setInstanciaFirebaseAuth] = useState(null);
    const [scopesDrive, setScopesDrive] = useState(null);

    /**
     * Inicializa Firebase si las credenciales de la aplicación están en las cookies de sesión.
     */
    useEffect(() => {
        const res = cargarCredsCookies();

        if (!res) {
            obtenerCredenciales();
        }
    }, []);

    /**
     * Carga las credenciales de la aplicación desde el servidor.
     * @returns {boolean} Resultado de la operación de carga de credenciales.
     */
    const cargarCredenciales = async () => {
        try {
            const pet = await fetch(`$${API_URL}/credenciales`, { method: "GET" });
            if (pet.status == 200 && pet.ok) {
                const json = await pet.json();
                inicializarFirebase(json, json.driveScopes, json.reCAPTCHA);
            }
            return pet.ok;
        } catch (error) {
            console.log("Error al cargar las credenciales: ", error);
            return false;
        }
    };

    /**
     * Realiza una petición al servidor para obtener las credenciales de Firebase.
     * Reintenta hasta 4 veces en caso de error. Si tiene éxito, inicializa Firebase con las credenciales obtenidas.
     */
    const obtenerCredenciales = async () => {
        for (let i = 0; i < 4; i++) {
            const res = await cargarCredenciales();

            if (res) {
                break;
            }
        }
    };

    /**
     * Inicializa Firebase con la información de credenciales proporcionada.
     * @param {JSON} credsInfo 
     */
    const inicializarFirebase = (credsFirebase, scopesDrive, tokenRecaptcha) => {
        delete credsFirebase.driveScopes;
        delete credsFirebase.reCAPTCHA;

        const app = initializeApp(credsFirebase);
        const db = getFirestore(app);
        const auth = getAuth(app);

        almacenarCredenciales(credsFirebase, scopesDrive, tokenRecaptcha);

        setInstanciaFirebase(app);
        setInstanciaFirestore(db);
        setInstanciaFirebaseAuth(auth);
        setClaveRecaptcha(tokenRecaptcha);
        setScopesDrive(scopesDrive);
    };

    /**
     * Almacena las dredenciales de los servicios de la aplicación en las cookies de sesión.
     * @param {JSON} firebaseCreds - Credenciales de Firebase.
     * @param {Array} scopesDrive - Scopes de acceso a Google Drive.
     * @param {string} tokenRecaptcha - Clave del cliente de reCAPTCHA.
     */
    const almacenarCredenciales = (credsFirebase, scopesDrive, tokenRecaptcha) => {
        const txtCreds = JSON.stringify(credsFirebase);
        const encCreds = AES.encrypt(txtCreds, AES_KEY).toString();
        const encCaptcha = AES.encrypt(tokenRecaptcha, AES_KEY).toString();

        Cookies.set("session-credentials", encCreds);
        Cookies.set("session-recaptcha", encCaptcha);
        Cookies.set("session-drive-scopes", scopesDrive);
    };

    /**
     * Carga las credenciales de los servicios desde las cookies. 
     * @returns {boolean} Resultado de la operación de carga de las credenciales desde las cookies.
     */
    const cargarCredsCookies = () => {
        const firebaseCreds = Cookies.get("session-credentials");
        const tokenRecaptcha = Cookies.get("session-recaptcha");
        const scopesDrive = Cookies.get("session-drive-scopes");
        let res = [firebaseCreds, tokenRecaptcha, scopesDrive].every((x) => x != undefined && x != null);

        if (res) {
            const txtCreds = AES.decrypt(firebaseCreds, AES_KEY).toString(enc.Utf8);
            const tokenCaptcha = AES.decrypt(tokenRecaptcha, AES_KEY).toString(enc.Utf8);
            const creds = JSON.parse(txtCreds);

            setScopesDrive(scopesDrive.split(","));
            setClaveRecaptcha(tokenCaptcha);

            inicializarFirebase(creds, scopesDrive.split(","), tokenCaptcha);
        }

        return res;
    };

    /**
     * Verificar si las instancias de los servicios de Firebase fueron
     * inicializadas correctamente.
     * @returns {boolean}
     */
    const verFirebaseIniciado = () => {
        return [instanciaFirebase, instanciaFirestore, instanciaFirebaseAuth].every((x) => x != null);
    };

    return (
        <credencialesContext.Provider value={{
            verSiCredsFirebaseEstancargadas: verFirebaseIniciado, firebase: instanciaFirebase,
            scopesDrive: scopesDrive, reCAPTCHA: claveRecaptcha,
            firestore: instanciaFirestore, firebaseAuth: instanciaFirebaseAuth
        }}>
            {children}
        </credencialesContext.Provider>
    );
}