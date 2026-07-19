import { peticionApi } from "../services/Api";

/**
 * Clase para manejar las operaciones relacionadas con la gestión de usuarios de la 
 * aplicación, incluyendo la carga, modificación y eliminación de usuarios.
 */
export default class UsuariosHelper {
    #token = "";

    /**
     * Instancia de la clase UsuariosHelper para manejar operaciones sobre usuarios.
     * @param {String} token Token de Firebase para verificar la autenticidad.
     * @param {String} idioma Código de idioma para la internacionalización (por ejemplo, "es" 
     * para español).
     */
    constructor(token, idioma) {
        this.#token = token;
        this.idioma = idioma;
    }

    /**
     * @param {String} id UID del usuario a cargar.
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - data (Usuario) - Contiene los datos del usuario si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async cargarUsuario(id) {
        const { success, data, error } = await peticionApi(
            `admin/usuarios/${id}`, "GET", {}, null, this.#token, this.idioma,
            "errCargarDatosUsuarios"
        );
        if (success) {
            return { success: true, data };
        } else {
            return { success: false, error };
        }
    }

    /**
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - data (Array<Usuario>) - Contiene los datos de los usuarios si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async cargarUsuarios() {
        const { success, data, error } = await peticionApi(
            "admin/usuarios", "GET", {}, null, this.#token, this.idioma,
            "errCargarUsuarios"
        );
        if (success) {
            return { success: true, data: data };
        } else {
            return { success: false, error };
        }
    }

    /**
     * @param {Array<Usuario>} usuarios Lista de usuarios a desactivar. 
     * @returns {Promise<Object>} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "data" (Array<Usuario>) - Contiene un array con las instancias de usuarios actualizadas 
     * si la operación fue exitosa, de lo contrario es null.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     */
    async eliminarUsuarios(usuarios) {
        let error = null;
        let success = true;
        const pets = [];

        usuarios.forEach((usuario) => {
            pets.push(this.#desactivarUsuario(usuario));
        });


        for (const pet of pets) {
            const res = await pet;
            success &&= res.success;
            if (!res.success) {
                error = res.error;
            }
        };

        if (success) {
            return await this.cargarUsuarios();
        } else {
            return { success, error };
        }
    }

    /**
     * 
     * @param {String} id UID del usuario a actualizar.
     * @param {Boolean} rol Nuevo rol del usuario (true para administrador, false para usuario normal).
     * @param {Boolean} desactivar Indicador para desactivar el usuario.
     * @returns {Object} Objeto con las claves:
     * - success (Boolean) - Indica si la operación fue exitosa.
     * - data (Array<Usuario>) - Contiene los datos de los usuarios actualizados si la operación fue exitosa.
     * - error (String) - Contiene el mensaje de error si la operación no fue exitosa.
     */
    async modificarUsuario(id, rol, desactivar) {
        const cuerpo = { administrador: rol, desactivar: desactivar, eliminado: false };
        const { success, error } = await await peticionApi(
            `admin/usuarios/${id}`, "PATCH", {}, cuerpo, this.#token, this.idioma, ""
        );

        if (success) {
            return await this.cargarUsuarios();
        } else {
            return { success, error };
        }
    }

    /**
     * @param {Usuario} usuario Instancia de usuario a desactivar.
     * @returns {Promise<Object>} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo
     */
    async #desactivarUsuario(usuario) {
        const cuerpo = { desactivar: true, administrador: usuario.rol, eliminado: true };
        return await peticionApi(
            `admin/usuarios/${usuario.id}`, "PATCH", {}, cuerpo, this.#token, this.idioma, ""
        );
    }
}