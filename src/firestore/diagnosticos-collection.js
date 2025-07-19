import { collection, doc, getDoc, getDocs, setDoc, where, query, deleteDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {JSON} json - Datos del diagnóstico a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const cambiarDiagnostico = async (json, db) => {
    try {
        const docRef = doc(db, "diagnosticos", json.id);
        const datos = await setDoc(docRef, json);

        return { success: true, data: datos };
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
        const datos = await getDoc(docRef);

        return { success: true, data: datos.data() };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Obtiene la información de todos los diagnósticos.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verDiagnosticos = async (db) => {
    try {
        const coleccion = collection(db, "diagnosticos");
        const datos = await getDocs(coleccion);

        const diagnosticos = [];
        datos.forEach((doc) => {
            diagnosticos.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: diagnosticos };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Obtiene los diagnósticos de un médico específico.
 * @param {String} id - Correo del médico.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verDiagnosticosPorMedico = async (id, db) => {
    try {
        const coleccion = collection(db, "diagnosticos");
        const datos = await getDocs(
            query(coleccion, where("medico", "==", id))
        );

        const diagnosticos = [];
        datos.forEach((doc) => {
            diagnosticos.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: diagnosticos };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Elimina los diagnósticos seleccionados de la BD.
 * @param {Array[String]} ids - Lista de IDs de diagnósticos a eliminar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const eliminarDiagnosticos = async (ids, db) => {
    try {
        for (const id of ids) {
            await deleteDoc(
                doc(db, "diagnosticos", id)
            );
        }

        return { success: true, data: null };
    } catch (error) {
        return { success: false, data: error };
    }
};