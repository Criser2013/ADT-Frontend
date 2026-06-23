import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Modelo que representa a un paciente con sus atributos y métodos relacionados.
 */
export default class Paciente {
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

    get edad() {
        return dayjs().diff(dayjs(
            this.fechaNacimiento, "DD-MM-YYYY"), "year", false
        )
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
            comorbilidades: this.comorbilidades
        }
    }
}