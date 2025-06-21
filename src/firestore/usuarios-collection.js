import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

/**
 * Edita el contenido de un documento. Sino existe lo crea.
 * @param {JSON} datos - Datos del usuario a modificar o crear.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const cambiarUsuario = async (datos, db) => {
    try {
        const docRef = doc(db, "usuarios", datos.correo);
        const datosUsuario = await setDoc(docRef, datos);

        return { success: true, data: datosUsuario };
    } catch (error) {
        return { success: false, data: error };
    }
};

/**
 * Determina si ya hay una cuenta de usuario registrada con el correo dado.
 * @param {String} correo - Correo del usuario a verificar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verSiEstaRegistrado = async (correo, db) => {
    try {
        const docRef = doc(db, "usuarios", correo);
        const docSnap = await getDoc(docRef);

        return { success: true, data: docSnap.exists() };
    } catch {
        return { success: false, data: false };
    }
};

/**
 * Obtiene la información de un usuario dentro de la BD
 * @param {String} correo - Correo del usuario a buscar.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verUsuario = async (correo, db) => {
    try {
        const docRef = doc(db, "usuarios", correo);
        const docSnap = await getDoc(docRef);

        return docSnap.exists() ? { success: 1, data: docSnap.data() }
            : { success: 2, data: "El usuario no está registrado." };

    } catch (error) {
        return { success: 0, data: error };
    }
};

/**
 * Obtiene la información de todos los usuarios.
 * @param {Object} db - Instancia de Firestore.
 * @returns JSON
 */
export const verUsuarios = async (db) => {
    try {
        const usuariosCollection = collection(db, "usuarios");
        const querySnapshot = await getDocs(usuariosCollection);

        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: users };
    } catch (error) {
        return { success: false, data: error };
    }
};