import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import ExplicacionLime from "./ExplicacionLime";
import { CAMPOS_BIN, CAMPOS_DECIMALES, CAMPOS_ENTEROS, CAMPOS_NUM, COMORBILIDADES } from "../constants";
import { oneHotDecoderOtraEnfermedad } from "../utils/TratarDatos";
import { procBool } from "../utils/TratarDatos";
import { Timestamp } from "firebase/firestore";

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
     * @param {Date} fecha Fecha del diagnóstico.
     * @param {Boolean} otraEnfermedad Indicador de si el paciente tiene otra enfermedad.
     * @param {Object} sintomasBinarios Objeto con los síntomas binarios del paciente.
     * @param {Object} sintomasNumericos Objeto con los síntomas numéricos del paciente.
     * @param {Number|null} probabilidad Probabilidad de TEP según el modelo.
     * @param {ExplicacionLime|null} explicacion Explicación del modelo de diagnóstico.
     * @param {Boolean|null} diagnosticoModelo Diagnóstico de TEP dado por el modelo.
     * @param {Boolean|null} diagnosticoMedico Diagnóstico de TEP dado por el médico. 
     */
    constructor(
        id, usuario, paciente, comorbilidades, fecha, otraEnfermedad, sintomasBinarios,
        sintomasNumericos, diagnosticoModelo = null, diagnosticoMedico = null, probabilidad = null,
        explicacion = null
    ) {
        this.id = id;
        this.usuario = usuario;
        this.paciente = paciente;
        this.fecha = fecha;
        this.otraEnfermedad = otraEnfermedad;
        this.comorbilidades = comorbilidades;
        this.sintomasBinarios = sintomasBinarios;
        this.sintomasNumericos = sintomasNumericos;
        this.diagnosticoModelo = diagnosticoModelo;
        this.diagnosticoMedico = diagnosticoMedico;
        this.probabilidad = probabilidad;
        this.explicacion = explicacion;
        this.validado = diagnosticoMedico !== null;
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
        return dayjs(this.fecha).format("DD-MM-YYYY");
    }

    /**
     * @param {Object} json JSON con los datos del paciente.
     * @returns {Diagnostico} Una instancia de la clase Diagnostico creada a partir de un objeto JSON.
     */
    static fromJson(json) {
        const { id, usuario, paciente, otraEnfermedad, fecha, probabilidad,
            explicacion, diagnosticoModelo, diagnosticoMedico, comorbilidades
        } = json;
        const sintomasBinarios = {};
        const sintomasNumericos = {};

        for (const i of CAMPOS_BIN) {
            sintomasBinarios[i] = json[i];
        }

        for (const i of CAMPOS_NUM) {
            sintomasNumericos[i] = json[i];
        }

        return new Diagnostico(
            id, usuario, paciente, comorbilidades, fecha.toDate(), otraEnfermedad,
            sintomasBinarios, sintomasNumericos, diagnosticoModelo, diagnosticoMedico,
            probabilidad, new ExplicacionLime(explicacion)
        );
    }

    toJson() {
        return {
            otraEnfermedad: this.otraEnfermedad,
            fecha: Timestamp.fromDate(this.fecha),
            paciente: this.paciente,
            diagnosticoModelo: this.diagnosticoModelo,
            diagnosticoMedico: this.diagnosticoMedico,
            probabilidad: this.probabilidad,
            explicacion: this.explicacion?.toJson(),
            comorbilidades: this.comorbilidades,
            ...this.sintomasBinarios,
            ...this.sintomasNumericos,
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
            json[i] = this.sintomasNumericos[i];
        }
        for (const i of CAMPOS_ENTEROS) {
            json[i] = this.sintomasNumericos[i];
        }
        for (const i of COMORBILIDADES) {
            let clave = "";

            if (i == "Enfermedad coronaria") {
                clave = "enfermedad_coronaria";
            } else {
                clave = i.replace("Enfermedad ", "").toLocaleLowerCase().normalize('NFD').
                replace(/[\u0300-\u036f]/g, "").replace(" ", "_");
            }

            json[clave] = this.#comorbilidades[i];
        }
        return json;
    }

    /**
     * @param {Boolean} diagnosticoMedico Diagnóstico de TEP dado por el médico. 
     */
    validar(diagnosticoMedico) {
        if (this.validado) {
            throw new Error("El diagnóstico ya ha sido validado previamente.");
        } else {
            this.diagnosticoMedico = diagnosticoMedico;
            this.validado = true;
        }
    }
}