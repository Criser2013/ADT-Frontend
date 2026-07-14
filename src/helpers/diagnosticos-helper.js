import { cambiarDiagnostico, verDiagnostico, verDiagnosticos, verDiagnosticosPorMedico } from "../services/Firestore";
import { Diagnostico, ExplicacionLime } from "../models";
import { peticionApi } from "../services/Api";

export default class DiagnosticosHelper {
    #token = "";
    #db = null;
    #diagnosticos = [];

    constructor(token, firestore) {
        this.#token = token;
        this.#db = firestore;
    }

    set db(db) {
        this.#db = db;
    }

    set token(token) {
        this.#token = token;
    }

    /**
     * @param {Diagnostico} diagnostico Instancia de la clase Diagnostico.
     * @param {String} idioma Código del idioma en el que se desea recibir la respuesta.
     * @param {String} txtErrorPredet Texto de error predeterminado en caso de fallo.
     */
    async diagnosticar(diagnostico, idioma, txtErrorPredet) {
        const { success, data, error } = await peticionApi("diagnosticar", "POST", {},
            diagnostico.toJsonApi(), this.#token, idioma, txtErrorPredet
        );

        if (success) {
            diagnostico.diagnosticoModelo = data.prediccion;
            diagnostico.probabilidad = data.probabilidad;
            diagnostico.explicacion = new ExplicacionLime(data.lime);
            return await this.#guardarDiagnostico(diagnostico);
        }

        return { success, error };
    }

    /**
     * @param {Diagnostico} instancia Diagnóstico a validar.
     * @param {Boolean} diagnosticoMedico Diagnóstico de TEP dado por el médico.
     * @returns {Diagnostico} Una instancia de la clase Diagnostico creada a partir del guardado.
     */
    async validarDiagnostico(instancia, diagnosticoMedico) {
        instancia.validar(diagnosticoMedico);
        const res = await this.#guardarDiagnostico(instancia);
        return Diagnostico.fromJson(res.data);
    }

    /**
     * @param {String} id ID del diagnóstico.
     * @returns {Diagnostico} Una instancia de la clase Diagnostico creada a partir del guardado.
     */
    async cargarDiagnostico(id) {
        const { id, uid } = this.#obtenerIdentificador(id);
        const { success, data, error } = await verDiagnostico(id, uid, this.#db)
        if (success) {
            return { success, data: Diagnostico.fromJson(data) };
        } else {
            return { success, error };
        }
    }

    /**
     * @param {Object} params Parámetros para la consulta. En el caso de cargar todos los diagnósticos, 
     * se debe pasar un objeto con la propiedad `usuarios` que contenga un array con los UIDs de los 
     * médicos. En el caso de cargar los diagnósticos de un médico, se debe pasar un objeto con las claves:
     * - uid (String): UID del médico
     * - fecha (Timestamp): Fecha a partir de la cual se quieren ver los diagnósticos. Si no se 
     * proporciona, se obtendrán todos los diagnósticos del médico.
     * @param {Boolean} cargarTodos Indica si se quieren cargar todos los diagnósticos.
     * @returns {Object} Resultado de la operación.
     */
    async cargarDiagnosticos(params, cargarTodos = false) {
        if (cargarTodos) {
            return await this.#cargarTodosDiagnosticos(params.usuarios);
        } else {
            return await this.#cargarDiagnosticosUsuario(params.uid, params.fecha);
        }
    }

    /**
     * @param {String} uid UID del usuario por el cual consultar.
     * @param {import("firebase/firestore").Timestamp|null} fecha Fecha a partir de la cual se 
     * quieren obtener los diagnósticos. Si no se proporciona, se obtendrán todos los diagnósticos del médico.
     * @returns {Object}
     */
    async #cargarDiagnosticosUsuario(uid, fecha = null) {
        const { success, data, error } = await verDiagnosticosPorMedico(uid, this.#db, fecha);

        if (success) {
            this.#diagnosticos = data.map((d) => Diagnostico.fromJson(d));
            return { success, data: this.#diagnosticos };
        } else {
            return { success, error };
        }
    }

    /**
     * @param {Array<String>} usuarios Lista de UIDs de todos los usuarios.
     * @returns {Object} Resultado de la operación en la clave `success` y un posible
     */
    async #cargarTodosDiagnosticos(usuarios) {
        const { success, data, error } = await verDiagnosticos(usuarios, this.#db);
        if (success) {
            this.#diagnosticos = data.map((d) => Diagnostico.fromJson(d));
            return { success, data: this.#diagnosticos };
        } else {
            return { success, error };
        }
    }

    /**
     * @param {Array<String>} ids IDs de los diagnósticos a eliminar.
     * @returns {Object} Resultado de la operación en la clave `success` y un posible 
     * error en la clave `error`.
     */
    async eliminarDiagnosticos(ids) {
        let error = null;
        let res = true;
        const pets = [];

        ids.forEach((id) => {
            const pet = eliminarDiagnostico(id, uid, firestore);
            peticiones.push(pet);
        });

        for (const pet of peticiones) {
            const res = await pet;
            res &&= res.success;
            if (!res) {
                error = res.error;
            }
        }

        return { success: res, error };
    }

    /**
     * @param {String} id ID del diagnóstico a eliminar.
     * @returns {Promise<Object>} Resultado de la operación en la clave `success` y un posible 
     * error en la clave `error`.
     */
    async #eliminarDiagnostico(id) {
        const { id, uid } = this.#obtenerIdentificador(id);
        return await eliminarDiagnostico(id, uid, this.#db);
    }

    /**
     * @param {Diagnostico} diagnostico Instancia de diagnóstico a guardar
     */
    async #guardarDiagnostico(diagnostico) {
        const { id, usuario } = diagnostico;
        return await cambiarDiagnostico(id, usuario, diagnostico.toJson(), this.#db);
    }

    /**
     * @param {String} id ID del diagnóstico que combina ID del documento y UID del usuario.
     * @returns {Object} Un objeto con las propiedades `id` y `usuario`.
     */
    #obtenerIdentificador(id) {
        const partes = id.split(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/);
        return { id: partes[0], usuario: partes[1] };
    }
}