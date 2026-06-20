/**
 * Modelo de usuario autenticado que encapsula información y métodos relevantes para
 * la autenticación del usuario, su rol y el token de acceso a Google Drive.
 */
export default class UsuarioAutenticado {
    constructor(usuarioFirebase, uid, rol, tokenDrive) {
        this.#usuarioFirebase = usuarioFirebase;
        this.#uid = uid;
        this.#rol = rol;
        this.#tokenDrive = tokenDrive;
        this.modoUsuario = false;
        this.rolVisible = rol;

        #cargarModoUsuarioCache();
    }

    set modoUsuario(modo) {
        this.modoUsuario = modo;
        this.rolVisible = (modo ? false : this.#rol);
        this.#guardarModoUsuarioCache();
    }

    get uid() {
        return this.#uid;
    }

    get rol() {
        return this.#rol;
    }

    get tokenDrive() {
        return this.#tokenDrive;
    }

    get usuarioFirebase() {
        return this.#usuarioFirebase;
    }

    get fotoUrl() {
        return this.#usuarioFirebase.photoURL;
    }

    get nombre() {
        return this.#usuarioFirebase.displayName;
    }

    get correo() {
        return this.#usuarioFirebase.email;
    }

    /**
     * Carga el modo de usuario desde el sessionStorage. Si no hay un modo de usuario
     * almacenado, se mantiene el valor por defecto (false).
     */
    #cargarModoUsuarioCache() {
        const modoUsuario = sessionStorage.getItem("modo-usuario");

        if (modoUsuario) {
            this.modoUsuario = (modoUsuario == "true");
            this.rolVisible = (this.modoUsuario ? false : this.#rol);
        }
    }

    /**
     * Guarda el modo de usuario actual en el sessionStorage para mantenerlo entre recargas de página.
     */
    #guardarModoUsuarioCache() {
        sessionStorage.setItem("modo-usuario", `${this.modoUsuario}`);
    }

    /**
     * Actualiza el estado de autenticación del usuario.
     * @param {import("firebase/auth").User} usuarioFirebase Instancia de usuario de Firebase Auth.
     * @param {String} uid ID del usuario autenticado.
     * @param {Boolean} rol Especifica si el usuario es administrador o no.
     * @param {String} tokenDrive Access token de Google Drive para el usuario autenticado.
     */
    actualizarEstadoAutenticacion(usuarioFirebase, uid, rol, tokenDrive) {
        this.#usuarioFirebase = usuarioFirebase;
        this.#uid = uid;
        this.#rol = rol;
        this.#tokenDrive = tokenDrive;
        this.rolVisible = (this.modoUsuario ? false : this.#rol);
    }
};