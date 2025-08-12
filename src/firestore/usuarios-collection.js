import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {JSON} json - Datos del usuario a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const cambiarUsuario = async (json, db) => {
    try {
        const docRef = doc(db, "usuarios", json.uid);
        delete json.uid;
        const datos = await setDoc(docRef, json);

        return { success: true, data: datos };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Determina si ya hay una cuenta de usuario registrada con el uid dado.
 * @param {String} uid - UID del usuario a verificar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verSiEstaRegistrado = async (uid, db) => {
    try {
        const docRef = doc(db, "usuarios", uid);
        const datos = await getDoc(docRef);

        return { success: true, data: datos.exists() };
    } catch {
        return { success: false, data: false };
    }
};

/**
 * Obtiene la información de un usuario dentro de la BD
 * @param {String} uid - UID del usuario a buscar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verUsuario = async (uid, db) => {
    try {
        const docRef = doc(db, "usuarios", uid);
        const datos = await getDoc(docRef);

        return datos.exists() ? { success: 1, data: datos.data() }
            : { success: 2, data: "El usuario no está registrado." };

    } catch (error) {
        return { success: 0, data: error };
    }
};

/**
 * Elimina el usuario proveído de la BD.
 * @param {String} uid - UID del usuario a eliminar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const eliminarUsuario = async (uid, db) => {
    try {
        await deleteDoc(
            doc(db, "usuarios", uid)
        );

        return { success: true, data: null, error: null };
    } catch (error) {
        return { success: false, data: null, error: error };
    }
};