import { CAMPOS_BIN, CAMPOS_NUM, COMORBILIDADES, INTERVALOS_PREPROCESAMIENTO } from "../constants";
import textosEspanol from "/locales/es/translation.json";
import textosIngles from "/locales/en/translation.json";

/**
 * Transforma los datos de comorbilidades codificados como one-hot a un Arrray.
 * @param {JSON} datos - JSON con las comorbilidades codificadas como one-hot.
 * @returns {Array}
 */
export function decoderOtraEnfermedad(datos) {
    const aux = [];
    for (const i of COMORBILIDADES) {
        if (datos[i] == 1) {
            aux.push(i);
        }
    }
    return aux;
};

/**
 * Valida que los datos de un array cumplan con una condición.
 * @param {Array} array - Array de datos a validar.
 * @param {Function} funcEval - Función para evaluar cada elemento del array.
 * @param {Function} funcVal - Función para validar el resultado de la evaluación.
 * @returns {Boolean}
 */
export function validarArray(array, funcEval, funcVal, callback) {
    const errores = [];
    array.forEach((x) => {
        errores.push(funcEval(x));
    });

    const res = errores.every(funcVal);
    callback(errores);

    return res;
};

/**
 * Convierte un valor booleano a un entero.
 * @param {Boolean} valor 
 * @returns {Integer} 1 si el valor es true, 0 si es false.
 */
export function procBool(valor) {
    return valor ? 1 : 0;
};

/**
 * Determina a qué intervalo pertenece un valor dado.
 * @param {Number} valor Valor a clasificar.
 * @param {Array<Array<Number>>} intervalos Lista de intervalos con sus valores asociados.
 * - El primer elemento de cada tripla es el valor mínimo del intervalo.
 * - El segundo elemento de cada tripla es el valor máximo del intervalo.
 * - El último elemento de cada tripla es el valor del intervalo.
 * @returns {Number} Etiqueta del intervalo numérico al que pertenece el valor. Sino pertenece a 
 * ninguno, devuelve -1.
 */
export function evaluarIntervalo(valor, intervalos) {
    for (const i of intervalos) {
        const [min, max, etiqueta] = i;
        if ((min != -Infinity) && (max != Infinity)) {
            if ((valor >= min) && (valor < max)) {
                return etiqueta;
            }
        } else if ((min != -Infinity) && (max == Infinity)) {
            if (valor >= min) {
                return etiqueta;
            }
        } else if ((min == -Infinity) && (max != Infinity)) {
            if (valor < max) {
                return etiqueta;
            }
        }
    }
    return -1;
};

/**
 * Transforma una instancia de diagnóstico de Firestore a un formato JSON para ser exportado 
 * como hoja de Excel o archivo CSV.
 * @param {Diagnostico} instancia Instancia de diagnóstico.
 * @param {Boolean} esAdmin Indica si el usuario es administrador
 * @param {Boolean} preprocesar Indicador para preprocesar los datos (interval encoding).
 * @param {String} idioma Idioma para los títulos, por defecto "es" (español). Opciones: "es", "en".
 * @returns {Object} Instancia de diagnóstico en formato JSON para exportación.
 */
export async function convertirDiagnosticoExportable(instancia, esAdmin, preprocesar = false, idioma = "es") {
    const datos = {};
    const textos = idioma == "es" ? textosEspanol : textosIngles;

    for (const i of CAMPOS_BIN) {
        datos[textos[i]] = procBool(instancia.sintomasBinarios[i]);
    }

    for (const i of CAMPOS_NUM) {
        datos[textos[i]] = preprocesar ? evaluarIntervalo(
            instancia.sintomasNumericos[i], INTERVALOS_PREPROCESAMIENTO[i]
        ) : instancia.sintomasNumericos[i];
    }

    for (const i of COMORBILIDADES) {
        datos[textos[i]] = procBool(instancia.comorbilidadesCodificadas[i]);
    }

    datos.ID = esAdmin ? `${instancia.id}-${instancia.usuario}` : instancia.id;
    datos[textos.sexo] = !preprocesar ? instancia.sexo : (instancia.sexo == 0 ? "M" : "F");
    datos[textos.otra_enfermedad] = procBool(instancia.otraEnfermedad);
    datos[textos.txtCampoDiagModelo] = procBool(instancia.diagnosticoModelo);
    datos[textos.txtCampoDiagMedico] = instancia.validado ? procBool(instancia.validado) : "N/A";
    datos[textos.txtFecha] = instancia.fecha.toLocaleDateString(idioma);

    if (!esAdmin) {
        datos[textos.txtPaciente] = instancia.paciente;
        datos[textos.txtCamposSignificativos] = JSON.stringify(instancia.explicacion.toJson());
        datos[textos.txtCampoProbabilidad] = (instancia.probabilidad * 100).toFixed(2);
    } else {
        datos[textos.txtUsuario] = instancia.usuario;
    }

    return datos;
};