import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { COMORBILIDADES } from "../../constants";
import { oneHotDecoderOtraEnfermedad } from "../utils/TratarDatos";

dayjs.extend(customParseFormat);

/**
 * Modelo que representa a un paciente con sus atributos y métodos relacionados.
 */
export default class Paciente {
    #comorbilidades = {};

    constructor(id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad, comorbilidades = []) {
        this.id = id;
        this.cedula = cedula;
        this.nombre = nombre;
        this.sexo = sexo;
        this.fechaNacimiento = fechaNacimiento;
        this.telefono = telefono;
        this.fechaCreacion = fechaCreacion;
        this.otraEnfermedad = otraEnfermedad;
        this.comorbilidades = comorbilidades;
    }

    /**
     * @param {Array<String>} comorbilidades Lista de comorbilidades del paciente. Se valida que cada comorbilidad esté dentro de las comorbilidades permitidas.
     */
    set comorbilidades(comorbilidades) {
        const claves = {};

        if (!Array.isArray(comorbilidades)) {
            throw new Error("Las comorbilidades deben ser un array de strings.");
        }

        for (const i of COMORBILIDADES) {
            if (comorbilidades.includes(i)) {
                claves[i] = 1;
            } else {
                claves[i] = 0;
            }
        }

        this.#comorbilidades = claves;
    }

    get comorbilidades() {
        return oneHotDecoderOtraEnfermedad(this.#comorbilidades);
    }

    get comorbilidadesCodificadas() {
        return this.#comorbilidades;
    }

    get edad() {
        return dayjs().diff(dayjs(
            this.fechaNacimiento, "DD-MM-YYYY"), "year", false
        );
    }

    /**
     * @param {Object} json JSON con los datos del paciente.
     * @returns {Paciente} Una instancia de la clase Paciente creada a partir de un objeto JSON.
     */
    static fromJson(json) {
        const { id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad, comorbilidades } = json;
        return new Paciente(id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad, comorbilidades);
    }

    /**
     * @returns {Object} Objeto JSON que representa al paciente, útil para enviar datos a la base de datos o a una API.
     */
    toJson() {
        return {
            id: this.id,
            cedula: this.cedula,
            nombre: this.nombre,
            sexo: this.sexo,
            fechaNacimiento: this.fechaNacimiento,
            telefono: this.telefono,
            fechaCreacion: this.fechaCreacion,
            otraEnfermedad: this.otraEnfermedad,
            ...this.#comorbilidades
        };
    }
}