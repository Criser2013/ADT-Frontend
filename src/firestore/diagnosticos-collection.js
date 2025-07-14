import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {JSON} datos - Datos del diagnóstico a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const cambiarDiagnostico = async (datos, db) => {
    try {
        const docRef = doc(db, "diagnosticos", datos.id);
        const datosDiagnostico = await setDoc(docRef, datos);

        return { success: true, data: datosDiagnostico };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Obtiene la información de un diagnóstico dentro de la BD
 * @param {String} id - ID del diagnóstico.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verDiagnostico = async (id, db) => {
    try {
        const docRef = doc(db, "diagnosticos", id);
        const docSnap = await getDoc(docRef);

        return { success: 1, data: docSnap.data() };
    } catch (error) {
        return { success: 0, data: error };
    }
};

/**
 * Obtiene la información de todos los diagnósticos.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verDiagnosticos = async (db) => {
    try {
        const diagnosticosCollection = collection(db, "diagnosticos");
        const querySnapshot = await getDocs(diagnosticosCollection);

        const diagnosticos = [];
        querySnapshot.forEach((doc) => {
            diagnosticos.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: diagnosticos };
    } catch (error) {
        return { success: false, data: error };
    }
};