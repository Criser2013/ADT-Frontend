import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Inicializa la aplicación de Firebase usando las credenciales proveídas.
 * Retorna la instancia de la aplicación, la autenticación y Firestore.
 * @param {Object} credenciales Credenciales de Firebase para inicializar la aplicación.
 * @returns {Object} Instancia de Firebase (clave app), autenticación (clave auth) y Firestore (clave firestore).
 */
export function inicializarFirebase(credenciales) {
    let app;
    if (getApps().length > 0) {
        app = getApp();
    } else {
        app = initializeApp(credenciales);
    }
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
};