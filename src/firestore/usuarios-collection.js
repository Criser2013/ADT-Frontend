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
        const datos = await setDoc(docRef, datos);

        return { success: true, data: datos };
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
        const datos = await getDoc(docRef);

        return { success: true, data: datos.exists() };
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
        const datos = await getDoc(docRef);

        return datos.exists() ? { success: 1, data: datos.data() }
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
        const coleccion = collection(db, "usuarios");
        const datos = await getDocs(coleccion);

        const usuarios = [];
        datos.forEach((doc) => {
            usuarios.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: usuarios };
    } catch (error) {
        return { success: false, data: error };
    }
};