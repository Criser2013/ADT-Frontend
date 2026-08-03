import { peticionApi } from "../services/Api";
import { Usuario } from "../models";


/**
 * Clase para manejar las operaciones relacionadas con la gestión de usuarios de la 
 * aplicación, incluyendo la carga, modificación y eliminación de usuarios.
 */
export default class UsuariosHelper {
    #token = "";

    /**
     * Instancia de la clase UsuariosHelper para manejar operaciones sobre usuarios.
     * @param {String} token Token de Firebase para verificar la autenticidad.
     */
    constructor(token) {
        this.#token = token;
    }

    /**
     * @param {String} id UID del usuario a cargar.
     * @param {String} idioma Idioma en el que se desea recibir la información.
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - data (Usuario) - Contiene los datos del usuario si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async cargarUsuario(id, idioma) {
        const { success, data, error } = await peticionApi(
            `admin/usuarios/${id}`, "GET", {}, null, this.#token, idioma,
            "errCargarDatosUsuarios"
        );
        if (success) {
            const datosSerializados = new Usuario(
                data.uid, data.correo, data.nombre, data.administrador, data.estado,
                data.fecha_registro, data.ultima_conexion
            );
            return { success: true, data: datosSerializados };
        } else {
            return { success: false, error };
        }
    }

    /**
     * @param {String} idioma Idioma en el que se desea recibir la información.
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - data (Array<Usuario>) - Contiene los datos de los usuarios si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async cargarUsuarios(idioma) {
        const { success, data, error } = await peticionApi(
            "admin/usuarios", "GET", {}, null, this.#token, idioma,
            "errCargarUsuarios"
        );
        if (success) {
            const datosSerializados = data.usuarios.map((usuario) => new Usuario(
                usuario.uid, usuario.correo, usuario.nombre, usuario.administrador,
                usuario.estado, usuario.fecha_registro, usuario.ultima_conexion
            ));
            return { success: true, data: datosSerializados };
        } else {
            return { success: false, error };
        }
    }

    /**
     * @param {Array<Usuario>} usuarios Lista de usuarios a desactivar. 
     * @param {String} idioma Idioma en el que se desea recibir la información.
     * @returns {Promise<Object>} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     */
    async eliminarUsuarios(usuarios, idioma) {
        let error = null;
        let success = true;
        const pets = [];

        usuarios.forEach((usuario) => {
            pets.push(this.#desactivarUsuario(usuario, idioma));
        });

        for (const pet of pets) {
            const res = await pet;
            success &&= res.success;
            if (!res.success) {
                error = res.error;
            }
        };

        return { success, error };
    }

    /**
     * 
     * @param {String} id UID del usuario a actualizar.
     * @param {Boolean} rol Nuevo rol del usuario (true para administrador, false para usuario normal).
     * @param {Boolean} desactivar Indicador para desactivar el usuario.
     * @param {String} idioma Idioma en el que se desea recibir la información.
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async modificarUsuario(id, rol, desactivar, idioma) {
        const cuerpo = { administrador: rol, desactivar: desactivar, eliminado: false };
        return await await peticionApi(
            `admin/usuarios/${id}`, "PATCH", {}, cuerpo, this.#token, idioma, ""
        );
    }

    /**
     * @param {Usuario} usuario Instancia de usuario a desactivar.
     * @param {String} idioma Idioma en el que se desea recibir la información.
     * @returns {Promise<Object>} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo
     * contrario es null.
     */
    async #desactivarUsuario(usuario, idioma) {
        const cuerpo = { desactivar: true, administrador: usuario.esAdmin, eliminado: true };
        return await peticionApi(
            `admin/usuarios/${usuario.uid}`, "PATCH", {}, cuerpo, this.#token, idioma, ""
        );
    }
}