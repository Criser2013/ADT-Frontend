import Paciente from "./Paciente";

/**
 * Clase que representa el archivo que almacena los pacientes registrados en la aplicación. 
 * Provee funcionalidades para agregar, modificar, eliminar y consultar pacientes, así como para convertir el archivo a y desde formato JSON.
 */
export default class ArchivoPacientes {
    #pacientes = [];
    #claves = {};

    /**
     * @param {Array<Paciente>} pacientes 
     */
    constructor(pacientes = []) {
        this.#pacientes = pacientes;

        for (const paciente of pacientes) {
            this.#claves[paciente.id] = paciente.cedula;
        }
    };

    get pacientes() {
        return this.#pacientes;
    };

    /**
     * @param {Array<Object>} json Arreglo con las instancias de pacientes como objetos JSON
     * @returns {ArchivoPacientes} Una instancia de la clase ArchivoPacientes creada a partir de un arreglo de objetos JSON
     */
    static fromJson(json) {
        const archivo = new ArchivoPacientes();
        for (const paciente of json) {
            const p = Paciente.fromJson(paciente);
            archivo.anadirPaciente(p);
        }
        return archivo;
    };

    /**
     * @returns {Array<Object>} Para cada paciente, un objeto con sus datos en formato JSON
     */
    toJson() {
        return this.pacientes.map(p => p.toJson());
    };

    /**
     * @param {Paciente} paciente 
     */
    anadirPaciente(paciente) {
        const res = this.#verSiExisteCedula(paciente.cedula);
        if (res) {
            throw new Error(`El paciente con cédula ${paciente.cedula} ya existe`);
        } else {
            this.#pacientes.push(paciente);
            this.#claves[paciente.id] = paciente.cedula;
        }
    };

    /**
     * @param {String} id ID del paciente a modificar
     * @param {Paciente} paciente Instancia de la clase Paciente con los datos actualizados
     * @throws {Error} Si el paciente no existe
     */
    modificarPaciente(id, paciente) {
        const res = this.#verSiExistePaciente(id);
        if (res) {
            const resCedula = this.#verSiExisteCedula(paciente.cedula);
            if (resCedula && this.#claves[id] !== paciente.cedula) {
                throw new Error(`El paciente con cédula ${paciente.cedula} ya existe`);
            }
            const indice = this.#pacientes.findIndex(p => p.id === id);
            this.#pacientes[indice] = paciente;
            this.#claves[id] = paciente.cedula;
        } else {
            throw new Error(`El paciente con id ${id} no existe`);
        }
    };

    /**
     * @param {String|Array<String>} ids ID del paciente a eliminar o un array de IDs de pacientes a eliminar
     * @param {Boolean} varios Indicador de si se van a eliminar varios pacientes o solo uno
     * @throws {Error} Si alguno de los pacientes no existe
     */
    eliminarPacientes(ids, varios = false) {
        if (varios) {
            const aux = [];
            for (const id of ids) {
                this.#eliminarPaciente(id);
                aux.push(id);
            }
        } else {
            this.#eliminarPaciente(ids);
        }

        this.#pacientes = this.#pacientes.filter(p => !ids.includes(p.id));
    };

    /**
     * @param {String} id ID del paciente a consultar
     * @returns {Paciente} Instancia de la clase Paciente con el ID proporcionado
     * @throws {Error} Si el paciente no existe
     */
    verPaciente(id) {
        const res = this.#verSiExistePaciente(id);
        if (res) {
            return this.#pacientes.find(p => p.id === id);
        } else {
            throw new Error(`El paciente con id ${id} no existe`);
        }
    };

    /**
     * @param {String} id ID del paciente a eliminar
     * @throws {Error} Si el paciente no existe
     */
    #eliminarPaciente(id) {
        const res = this.#verSiExistePaciente(id);
        if (res) {
            delete this.#claves[id];
        } else {
            throw new Error(`El paciente con id ${id} no existe`);
        }
    };

    /**
     * @param {String} id ID del paciente a verificar.
     * @returns {Boolean} Indica si el paciente existe
     */
    #verSiExistePaciente(id) {
        return id in this.#claves;
    };

    /**
     * @param {String} cedula Cédula del paciente a verificar.
     * @returns {Boolean} Indica si la cédula ya se encuentra registrada en algún paciente.
     */
    #verSiExisteCedula(cedula) {
        return Object.values(this.#claves).includes(cedula);
    };
};