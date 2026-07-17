import {
    cambiarDiagnostico, eliminarDiagnostico, verDiagnostico,
    verDiagnosticos, verDiagnosticosPorMedico
} from "../services/Firestore";
import { Diagnostico, ExplicacionLime } from "../models";
import { peticionApi } from "../services/Api";


/**
 * Clase que ayuda a manejar los diagnósticos, incluyendo la comunicación con la API y la base de datos.
 */
export default class DiagnosticosHelper {
    #token = "";
    #db = null;
    #diagnosticos = [];
    #peticiones = [];

    /**
     * @param {String} token Access token de Firebase para la autenticación con la API.
     * @param {import("firebase/firestore").Firestore} firestore Instancia de Firestore.
     */
    constructor(token, firestore) {
        this.#token = token;
        this.#db = firestore;
    }

    set token(token) {
        this.#token = token;
    }

    cancelarPeticiones() {
        for (const peticion of this.#peticiones) {
            peticion.abort();
        }
        this.#peticiones = [];
    }

    /**
     * @param {Diagnostico} diagnostico Instancia de la clase Diagnostico.
     * @param {String} idioma Código del idioma en el que se desea recibir la respuesta.
     * @param {String} txtErrorPredet Texto de error predeterminado en caso de fallo.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async diagnosticar(diagnostico, idioma, txtErrorPredet) {
        const controlador = new AbortController();
        this.#peticiones.push(controlador);
        const { success, data, error } = await peticionApi("diagnosticar", "POST", {},
            diagnostico.toJsonApi(), this.#token, idioma, txtErrorPredet, controlador
        );
        this.#peticiones.pop();

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
     * @param {String} idInstancia ID del diagnóstico.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     * - "data" (Diagnostico) - Contiene la instancia de la clase Diagnostico si la operación fue 
     * exitosa, de lo contrario es null.
     */
    async cargarDiagnostico(idInstancia) {
        const { id, uid } = await this.#obtenerIdentificador(idInstancia);
        const { success, data, error } = await verDiagnostico(id, uid, this.#db);
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
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     * - "data" (Array<Diagnostico>) - Contiene un array con las instancias de la clase Diagnostico si la operación fue 
     * exitosa, de lo contrario es null.
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
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     * - "data" (Array<Diagnostico>) - Contiene un array con las instancias de la clase Diagnostico 
     * si la operación fue exitosa, de lo contrario es null.
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
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     */
    async eliminarDiagnosticos(ids) {
        let error = null;
        let success = true;
        const pets = [];

        ids.forEach((id) => {
            const pet = this.#eliminarDiagnostico(id);
            pets.push(pet);
        });

        for (const pet of pets) {
            const res = await pet;
            success &&= res.success;
            if (!res.success) {
                error = res.error;
            }
        }

        return { success, error };
    }

    /**
     * @param {String} idInstancia ID del diagnóstico a eliminar.
     * @returns {Promise<Object>} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo 
     * contrario es null.
     */
    async #eliminarDiagnostico(idInstancia) {
        const { id, uid } = this.#obtenerIdentificador(idInstancia);
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
     * @returns {Object} Un objeto con las propiedades `id` y `uid`.
     */
    #obtenerIdentificador(id) {
        const idDiagnostico = id.substring(0, 36);
        const uid = id.substring(37);
        return { id: idDiagnostico, uid: uid };
    }
}