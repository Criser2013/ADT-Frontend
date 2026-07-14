/**
 * Modelo que representa un usuario del sistema.
 */
export default class Usuario {

    /**
     * Instancia de la clase Usuario.
     * @param {String} uid UID del usuario.
     * @param {String} correo Correo electrónico del usuario.
     * @param {String} nombre Nombre del usuario.
     * @param {Boolean} esAdmin Indicador de si el usuario es administrador.
     * @param {Boolean} estado Estado del usuario.
     * @param {Date} fechaRegistro Fecha de registro del usuario.
     * @param {Date} fechaUltimoAcceso Fecha del último acceso del usuario.
     */
    constructor(uid, correo, nombre, esAdmin, estado, fechaRegistro, fechaUltimoAcceso) {
        this.#uid = uid;
        this.#correo = correo;
        this.#nombre = nombre;
        this.#esAdmin = esAdmin;
        this.#estado = estado;
        this.#fechaRegistro = fechaRegistro;
        this.#fechaUltimoAcceso = fechaUltimoAcceso;
    }

    get uid() {
        return this.#uid;
    }

    get correo() {
        return this.#correo;
    }

    get nombre() {
        return this.#nombre;
    }

    get esAdmin() {
        return this.#esAdmin;
    }

    get estado() {
        return this.#estado;
    }

    get fechaRegistro() {
        return this.#fechaRegistro;
    }

    get fechaUltimoAcceso() {
        return this.#fechaUltimoAcceso;
    }

}