import { collection, doc, getDoc, getDocs, setDoc, where, query, deleteDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {String} id ID del diagnóstico.
 * @param {String} uid UID del médico que realiza el cambio.
 * @param {Object} json Datos del diagnóstico a modificar o crear.
 * @param {Object} db Instancia de Firestore.
 * @returns {Object} Resultado el resultado de la operación en la clave "data" y un booleano en la clave "success" indicando si la operación fue exitosa o no.
 */
export async function cambiarDiagnostico(id, uid, json, db) {
    try {
        const docRef = doc(db, `usuarios/${uid}/diagnosticos/${id}`);
        const datos = await setDoc(docRef, json);

        return { success: true, data: datos, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Carga un diagnóstico de la base de datos y obtiene su información.
 * @param {String} id ID del diagnóstico.
 * @param {String} uid UID del médico.
 * @param {Object} db Instancia de Firestore.
 * @returns {Object} Resultado el resultado de la operación en la clave "data" y un booleano en la clave "success" indicando si la operación fue exitosa o no.
 */
export async function verDiagnostico(id, uid, db) {
    try {
        const docRef = doc(db, `usuarios/${uid}/diagnosticos/${id}`);
        const datos = await getDoc(docRef);

        if (!datos.exists()) {
            return { success: false, data: null, error: "El diagnóstico no existe." };
        }

        return { success: true, data: { id: datos.id, medico: uid, ...datos.data() }, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Carga todos los diagnósticos de la base de datos y obtiene su información.
 * @param {Array<String>} usuarios Array con los UID de los médicos.
 * @param {object} db Instancia de Firestore.
 * @returns {Object} Resultado el resultado de la operación en la clave "data" y un booleano en la clave "success" indicando si la operación fue exitosa o no.
 */
export async function verDiagnosticos(usuarios, db) {
    try {
        const diagnosticos = [];
        for (const i of usuarios) {
            const consulta = collection(db, `usuarios/${i}/diagnosticos`);
            const datos = await getDocs(consulta);
            datos.forEach((doc) => {
                const medico = doc.id.split(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/);
                diagnosticos.push({ id: doc.id, medico: medico[1], ...doc.data() });
            });
        }

        return { success: true, data: diagnosticos, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Carga los diagnósticos de un médico a partir de su UID y obtiene su información.
 * @param {String} uid UID del médico.
 * @param {Object} db Instancia de Firestore.
 * @param {import("firebase/firestore").Timestamp} fecha (Opcional) Fecha a partir de la cual se quieren obtener los diagnósticos. Si no se proporciona, se obtendrán todos los diagnósticos del médico.
 * @returns {Object} Resultado el resultado de la operación en la clave "data" y un booleano en la clave "success" indicando si la operación fue exitosa o no.
 */
export async function verDiagnosticosPorMedico(uid, db, fecha = null) {
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

        return { success: true, data: diagnosticos, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};

/**
 * Elimina el diagnóstico con el ID especificado de la base de datos.
 * @param {String} id - ID del diagnóstico a eliminar.
 * @param {String} uid - UID del médico.
 * @param {Object} db - Instancia de Firestore.
 * @returns {Object} Resultado el resultado de la operación en la clave "data" y un booleano en la clave "success" indicando si la operación fue exitosa o no.
 */
export async function eliminarDiagnostico(id, uid, db) {
    try {
        await deleteDoc(
            doc(db, `usuarios/${uid}/diagnosticos/${id}`)
        );

        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};