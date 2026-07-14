import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import ExplicacionLime from "./ExplicacionLime";
import { CAMPOS_BIN, CAMPOS_DECIMALES, CAMPOS_ENTEROS, CAMPOS_NUM, COMORBILIDADES } from "../constants";
import { oneHotDecoderOtraEnfermedad } from "../utils/TratarDatos";
import { procBool } from "../utils/TratarDatos";

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
     */
    constructor(id, usuario, paciente, comorbilidades, fecha, otraEnfermedad, sintomasBinarios,
        sintomasNumericos) {
        this.id = id;
        this.usuario = usuario;
        this.paciente = paciente;
        this.fecha = fecha;
        this.otraEnfermedad = otraEnfermedad;
        this.comorbilidades = comorbilidades;
        this.sintomasBinarios = sintomasBinarios;
        this.sintomasNumericos = sintomasNumericos;

        this.diagnosticoModelo = 2;
        this.diagnosticoMedico = 2;
        this.probabilidad = null;
        this.explicacion = null;
        this.validado = false;
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

        for (const i of CAMPOS_NUM) {
            sintomasNumericos[i] = json[i] || 0;
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
            explicacion: this.explicacion.explicacion,
            ...this.sintomasBinarios,
            ...this.sintomasNumericos,
            ...this.#comorbilidades
        };
    }

    /**
     * Transforma los datos del diagnóstico en un objeto JSON con el formato requerido por la API.
     * @returns {Object} Objeto JSON con los datos del diagnóstico en el formato requerido por la 
     * API.
     */
    toJsonApi() {
        const json = {};
        for (const i of CAMPOS_BIN) {
            json[i] = procBool(this.sintomasBinarios[i]);
        }
        for (const i of CAMPOS_DECIMALES) {
            json[i] = parseFloat(this.sintomasNumericos[i].replace(",", "."));
        }
        for (const i of CAMPOS_ENTEROS) {
            json[i] = parseInt(this.sintomasNumericos[i].replace(",", "."), 10);
        }
        return json;
    }

    /**
     * @param {Number} diagnosticoMedico Diagnóstico de TEP dado por el médico. 
     * Toma los mismos valores que el diagnóstico del modelo:
     * - 0: Negativo
     * - 1: Positivo
     * - 2: No determinado
     */
    validar(diagnosticoMedico) {
        this.diagnosticoMedico = diagnosticoMedico;
        this.validado = true;
    }
}