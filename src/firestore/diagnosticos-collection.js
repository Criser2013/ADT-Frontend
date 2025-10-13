import { collection, doc, getDoc, getDocs, setDoc, where, query, deleteDoc, and } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {String} uid - UID del médico.
 * @param {JSON} json - Datos del diagnóstico a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const cambiarDiagnostico = async (uid, json, db) => {
    try {
        const docRef = doc(db, `usuarios/${uid}/diagnosticos/`, json.id);
        const datos = await setDoc(docRef, json);

        return { success: true, data: datos };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Obtiene la información de un diagnóstico dentro de la BD
 * @param {String} uid - UID del médico.
 * @param {String} id - ID del diagnóstico.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const verDiagnostico = async (uid, id, db) => {
    try {
        const docRef = doc(db, `usuarios/${uid}/diagnosticos/${id}`);
        const datos = await getDoc(docRef);

        if (!datos.exists()) {
            return { success: false, data: "El diagnóstico no existe." };
        }

        return { success: true, data: datos.data() };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Obtiene la información de todos los diagnósticos.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const verDiagnosticos = async (db) => {
    try {
        const coleccion = collection(db, "usuarios");
        const datos = await getDocs(coleccion);

        const diagnosticos = [];
        datos.forEach((doc) => {
            diagnosticos.push({ id: doc.id, ...doc.data() });
        });
        console.log(diagnosticos)

        return { success: true, data: diagnosticos };
    } catch (error) {
        console.log(error)
        return { success: false, data: error };
    }
};

/**
 * Obtiene los diagnósticos de un médico específico.
 * @param {String} uid - UID del médico.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const verDiagnosticosPorMedico = async (uid, db, fecha = null) => {
    try {
        const coleccion = collection(db, `usuarios/${uid}/diagnosticos`);
        let consulta = coleccion //query(coleccion, where("medico", "==", uid));

        if (fecha != null) {
            consulta = query(coleccion, where("fecha", ">=", fecha));
        }
        const datos = await getDocs(consulta);

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
 * Elimina el diagnóstico de la BD.
 * @param {String} uid - UID del médico.
 * @param {String} id - ID del diagnóstico a eliminar.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const eliminarDiagnosticos = async (uid, id, db) => {
    try {
        await deleteDoc(
            doc(db, `usuarios/${uid}/diagnosticos`, id)
        );

        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};