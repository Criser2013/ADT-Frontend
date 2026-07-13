import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import { CAMPOS_BIN, CAMPOS_TXT, COMORBILIDADES } from "../constants";
import { oneHotDecoderOtraEnfermedad } from "../utils/TratarDatos";

dayjs.extend(customParseFormat);

/**
 * Modelo que representa un diagnóstico con sus atributos y métodos relacionados.
 */
export default class Diagnostico {
    #comorbilidades = {};

    /**
     * Instancia de diagnóstico de TEP realizada por un usuario.
     * @param {String} id ID del diagnóstico.
     * @param {String} usuario UID del usuario que realizó el diagnóstico.
     * @param {String} paciente UID del paciente al que pertenece el diagnóstico.
     * @param {Array<String>} comorbilidades Lista de comorbilidades del paciente.
     * @param {String} fecha Fecha del diagnóstico en formato "DD-MM-YYYY".
     * @param {Boolean} otraEnfermedad Indicador de si el paciente tiene otra enfermedad.
     * @param {Object} sintomasBinarios Objeto con los síntomas binarios del paciente.
     * @param {Object} sintomasNumericos Objeto con los síntomas numéricos del paciente.
     * @param {Number} diagnosticoModelo Valor del diagnóstico generado por el modelo. Los valores son:
     * - 0: Negativo
     * - 1: Positivo
     * - 2: No diagnosticado
     * @param {Number} diagnosticoMedico Valor del diagnóstico realizado por el médico toma los mismos 
     * valores que el diagnóstico del modelo.
     * @param {Number} probabilidad Probabilidad del diagnóstico estimada por el modelo.
     * @param {String} explicacion Explicación del diagnóstico generada por el modelo LIME.
     */
    constructor(id, usuario, paciente, comorbilidades, fecha, otraEnfermedad, sintomasBinarios,
        sintomasNumericos, diagnosticoModelo, diagnosticoMedico, probabilidad, explicacion) {
        this.id = id;
        this.usuario = usuario;
        this.paciente = paciente;
        this.fecha = fecha;
        this.otraEnfermedad = otraEnfermedad;
        this.comorbilidades = comorbilidades;
        this.diagnosticoModelo = diagnosticoModelo ? diagnosticoModelo : 2;
        this.diagnosticoMedico = diagnosticoMedico ? diagnosticoMedico : 2;
        this.probabilidad = probabilidad ? probabilidad : 0;
        this.explicacion = explicacion ? explicacion : null;
        this.sintomasBinarios = sintomasBinarios || {};
        this.sintomasNumericos = sintomasNumericos || {};

        this.validado = this.diagnosticoMedico != 2;
    }

    /**
     * @param {Array<String>} comorbilidades Lista de comorbilidades del paciente.
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
        return oneHotDecoderOtraEnfermedad(this.#comorbilidades);
    }

    get comorbilidadesCodificadas() {
        return this.#comorbilidades;
    }

    get fechaFormateada() {
        return dayjs(this.fecha, "DD-MM-YYYY");
    }

    /**
     * @param {Object} json JSON con los datos del paciente.
     * @returns {Diagnostico} Una instancia de la clase Diagnostico creada a partir de un objeto JSON.
     */
    static fromJson(json) {
        const { id, usuario, paciente, otraEnfermedad, fecha,
            probabilidad, explicacion, diagnosticoModelo, diagnosticoMedico } = json;
        const comorbilidades = {};
        const sintomasBinarios = {};
        const sintomasNumericos = {};

        for (const i of COMORBILIDADES) {
            comorbilidades[i] = json[i] || 0;
        }

        for (const i of CAMPOS_BIN) {
            sintomasBinarios[i] = json[i] || 0;
        }

        for (const i of CAMPOS_TXT) {
            sintomasNumericos[i] = json[i] || "";
        }

        return new Diagnostico(
            id, usuario, paciente, comorbilidades, fecha, otraEnfermedad,
            sintomasBinarios, sintomasNumericos, diagnosticoModelo, diagnosticoMedico,
            probabilidad, explicacion
        );
    }

    toJson() {
        return {
            id: this.id,
            otraEnfermedad: this.otraEnfermedad,
            fecha: this.fecha,
            paciente: this.paciente,
            diagnosticoModelo: this.diagnosticoModelo,
            diagnosticoMedico: this.diagnosticoMedico,
            probabilidad: this.probabilidad,
            usuario: this.usuario,
            explicacion: this.explicacion.toJson(),
            ...this.sintomasBinarios,
            ...this.sintomasNumericos,
            ...this.#comorbilidades
        };
    }
}