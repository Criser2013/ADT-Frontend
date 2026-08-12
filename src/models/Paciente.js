import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import { COMORBILIDADES } from "../constants";
import { decoderOtraEnfermedad } from "../utils/TratarDatos";

dayjs.extend(customParseFormat);

/**
 * Modelo que representa a un paciente con sus atributos y métodos relacionados.
 */
export default class Paciente {
    #comorbilidades = {};

    /**
     * Instancia de paciente registrado en el sistema.
     * @param {String} id ID del paciente.
     * @param {String} cedula Número de cédula del paciente.
     * @param {String} nombre Nombre del paciente.
     * @param {Number} sexo Sexo del paciente. Los valores son:
     * - 0: Masculino
     * - 1: Femenino
     * @param {String} fechaNacimiento Fecha de nacimiento del paciente en formato "DD-MM-YYYY".
     * @param {String} telefono Número de teléfono del paciente.
     * @param {String} fechaCreacion Fecha de creación del registro del paciente en formato "DD-MM-YYYY".
     * @param {Boolean} otraEnfermedad Indicador de si el paciente tiene otra enfermedad.
     * @param {Array<String>} comorbilidades Lista de comorbilidades del paciente.
     */
    constructor(id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad,
        comorbilidades = []) {
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

        if ((comorbilidades instanceof Object) && (!Array.isArray(comorbilidades))) {
            this.#comorbilidades = comorbilidades;
            return;
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
        return decoderOtraEnfermedad(this.#comorbilidades);
    }

    get comorbilidadesCodificadas() {
        return this.#comorbilidades;
    }

    get edad() {
        return dayjs().diff(dayjs(
            this.fechaNacimiento, "DD-MM-YYYY"), "year", false
        );
    }

    get fechaNacimientoFormateada() {
        return dayjs(
            this.fechaNacimiento, "DD-MM-YYYY"
        );
    }

    get fechaCreacionFormateada() {
        return dayjs(
            this.fechaCreacion, "DD-MM-YYYY"
        ).toDate();
    }

    /**
     * @param {Object} json JSON con los datos del paciente.
     * @returns {Paciente} Una instancia de la clase Paciente creada a partir de un objeto JSON.
     */
    static fromJson(json) {
        const { id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad } = json;
        const aux = {};

        for (const i of COMORBILIDADES) {
            aux[i] = json[i] || 0;
        }

        return new Paciente(id, cedula, nombre, sexo, fechaNacimiento, telefono, fechaCreacion, otraEnfermedad, aux);
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