import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';


dayjs.extend(customParseFormat);
/**
 * Modelo que representa un usuario del sistema.
 */
export default class Usuario {
    #uid = "";
    #correo = "";
    #nombre = "";
    #esAdmin = false;
    #estado = true;
    #fechaRegistro = null;
    #fechaUltimoAcceso = null;

    /**
     * Instancia de la clase Usuario.
     * @param {String} uid UID del usuario.
     * @param {String} correo Correo electrónico del usuario.
     * @param {String} nombre Nombre del usuario.
     * @param {Boolean} esAdmin Indicador de si el usuario es administrador.
     * @param {Boolean} estado Estado del usuario.
     * @param {String} fechaRegistro Fecha de registro del usuario en el formato: "DD/MM/YYYY HH:mm ".
     * @param {String} fechaUltimoAcceso Fecha del último acceso del usuario.
     */
    constructor(uid, correo, nombre, esAdmin, estado, fechaRegistro, fechaUltimoAcceso) {
        this.#uid = uid;
        this.#correo = correo;
        this.#nombre = nombre;
        this.#esAdmin = esAdmin;
        this.#estado = estado;
        this.#fechaRegistro = dayjs(fechaRegistro, "DD/MM/YYYY HH:mm A").toDate();
        this.#fechaUltimoAcceso = dayjs(fechaUltimoAcceso, "DD/MM/YYYY HH:mm A").toDate();
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