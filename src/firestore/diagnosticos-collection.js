import { collection, doc, getDoc, getDocs, setDoc, where, query, deleteDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {String} id - ID del diagnóstico.
 * @param {String} uid - UID del médico.
 * @param {JSON} json - Datos del diagnóstico a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns {JSON}
 */
export const cambiarDiagnostico = async (id, uid, json, db) => {
    try {
        const docRef = doc(db, `usuarios/${uid}/diagnosticos/${id}`);
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

        return { success: true, data: { id: datos.id, medico: uid, ...datos.data() } };
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
        const usuarios = [];
        datos.forEach((doc) => usuarios.push(doc.id));

        const diagnosticos = [];
        for (const i of usuarios) {
            const consulta = collection(db, `usuarios/${i}/diagnosticos`);
            const datos = await getDocs(consulta);
            datos.forEach((doc) => {
                const medico = doc.id.split(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/);
                diagnosticos.push({ id: doc.id, medico: medico[1], ...doc.data() });
            });
        }

        return { success: true, data: diagnosticos };
    } catch (error) {
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
        let consulta = collection(db, `usuarios/${uid}/diagnosticos`);

        if (fecha != null) {
            consulta = query(consulta, where("fecha", ">=", fecha));
        }
        const datos = await getDocs(consulta);

        const diagnosticos = [];
        datos.forEach((doc) => {
            const medico = doc.id.split(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/);
            diagnosticos.push({ id: doc.id, medico: medico[1], ...doc.data() });
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
            doc(db, `usuarios/${uid}/diagnosticos/${id}`)
        );

        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};