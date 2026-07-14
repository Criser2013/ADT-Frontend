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
     * @param {Number} probabilidad Probabilidad de TEP según el modelo.
     * @param {ExplicacionLime} explicacion Explicación del modelo de diagnóstico.
     * @param {Number} diagnosticoModelo Diagnóstico de TEP dado por el modelo. 
     * Toma los siguientes valores:
     * - 0: Negativo
     * - 1: Positivo
     * - 2: No determinado
     * @param {Number} diagnosticoMedico Diagnóstico de TEP dado por el médico. 
     * Toma los mismos valores que el diagnóstico del modelo.
     */
    constructor(
        id, usuario, paciente, comorbilidades, fecha, otraEnfermedad, sintomasBinarios,
        sintomasNumericos, diagnosticoModelo = 2, diagnosticoMedico = 2, probabilidad = null,
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
        this.validado = diagnosticoMedico != 2;
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
        const { id, //string
            usuario, //string
            paciente, //string
            otraEnfermedad, //string
            fecha, //timeStamp de Firebase
            probabilidad, // numero
            explicacion, // Arreglo de JSON [{ campo: string, contribucion: number }]
            diagnosticoModelo, // booleano
            diagnosticoMedicom, // booleano
            comorbilidades // Arreglo de strings
        } = json;
        const sintomasBinarios = {};
        const sintomasNumericos = {};

        for (const i of COMORBILIDADES) {
            comorbilidades[i] = json[i]; // ya es booleano
        }

        for (const i of CAMPOS_BIN) {
            sintomasBinarios[i] = json[i]; // ya es booleano
        }

        for (const i of CAMPOS_NUMERICOS) {
            sintomasNumericos[i] = json[i]; // ya vienen convertidos a numero
        }

        return new Diagnostico(
            id, usuario, paciente, comorbilidades, fecha.toDate(), otraEnfermedad,
            sintomasBinarios, sintomasNumericos, diagnosticoModelo, diagnosticoMedico,
            probabilidad, new ExplicacionLime(explicacion)
        );
    }

    toJson() {
        return {
            id: this.id,
            otraEnfermedad: this.otraEnfermedad,
            fecha: Timestamp.fromDate(this.fecha),
            paciente: this.paciente,
            diagnosticoModelo: this.diagnosticoModelo,
            diagnosticoMedico: this.diagnosticoMedico,
            probabilidad: this.probabilidad,
            usuario: this.usuario,
            explicacion: this.explicacion.toJson(),
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
            json[i] = parseFloat(this.sintomasNumericos[i].replace(",", "."));
        }
        for (const i of CAMPOS_ENTEROS) {
            json[i] = parseInt(this.sintomasNumericos[i].replace(",", "."), 10);
        }
        for (const i of COMORBILIDADES) {
            const clave = "enfermedad_" + i.toLocaleLowerCase().replace(" ", "_").normalize('NFD').
                replace(/[\u0300-\u036f]/g, "");
            json[clave] = this.#comorbilidades[i];
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
        if (this.validado) {
            throw new Error("El diagnóstico ya ha sido validado previamente.");
        } else {
            this.diagnosticoMedico = diagnosticoMedico;
            this.validado = true;
        }
    }
}