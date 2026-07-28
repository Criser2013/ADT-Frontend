import { CAMPOS_NUM, CAMPOS_BIN, COMORBILIDADES, INTERVALOS_PREPROCESAMIENTO } from "../constants";

/**
 * Convierte la lista de comorbilidades en un JSON cuyas claves son las comorbilidades
 * y los valores son 0 o 1, dependiendo si el paciente la padece o no.
 * @param {Array} datos - Lista de comorbilidades.
 * @returns {JSON}
 */
export function oneHotEncoderOtraEnfermedad(datos) {
    const aux = {};

    for (const i of COMORBILIDADES) {
        aux[i] = 0;
    }

    for (const i of datos) {
        aux[i] = 1;
    }

    return aux;
};


/**
 * Transforma los datos de comorbilidades codificados como one-hot a un Arrray.
 * @param {JSON} datos - JSON con las comorbilidades codificadas como one-hot.
 * @returns {Array}
 */
export function oneHotDecoderOtraEnfermedad(datos) {
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
        if ((min != Infinity) && (max != Infinity)) {
            if ((valor >= min) && (valor < max)) {
                return etiqueta;
            }
        } else if ((min != Infinity) && (max == Infinity)) {
            if (valor >= min) {
                return etiqueta;
            }
        } else if ((min == Infinity) && (max != Infinity)) {
            if (valor < max) {
                return etiqueta;
            }
        }
    }
    return -1;
};

/**
 * Aplica el preprocesamiento de los campos numéricos de una instancia de diagnóstico.
 * @param {Object} instancia Instancia de diagnóstico convertida a JSON.
 * @returns {Object} Instancia de diagnóstico con los campos numéricos preprocesados.
 */
export function procCamposNumericos(instancia) {
    const aux = { ...instancia };
    for (const i in INTERVALOS_PREPROCESAMIENTO) {
        aux[i] = evaluarIntervalo(instancia[i], INTERVALOS_PREPROCESAMIENTO[i]);
    }
    return aux;
};

/**
 * Transforma una instancia de diagnóstico de Firestore a un formato JSON para ser exportado 
 * como hoja de Excel o archivo CSV.
 * @param {Object} instancia Instancia de diagnóstico (en formato JSON).
 * @param {Boolean} esAdmin Indica si el usuario es administrador
 * @param {Boolean} preprocesar Indicador para preprocesar los datos (interval encoding).
 * @param {String} idioma Idioma para los títulos, por defecto "es" (español). Opciones: "es", "en".
 * @returns {Object} Instancia de diagnóstico en formato JSON para exportación.
 */
export async function crearArchivoExportable(instancia, esAdmin, preprocesar = false, idioma = "es") {
    const datos = {};
    const textos = await import(`/locales/${idioma}/translation.json`);

    for (const i of CAMPOS_BIN) {
        datos[textos[i]] = procBool(instancia[i]);
    }

    for (const i of CAMPOS_NUM) {
        datos[textos[i]] = preprocesar ? evaluarIntervalo(instancia[i], INTERVALOS_PREPROCESAMIENTO[i]) : instancia[i];
    }

    for (const i of COMORBILIDADES) {
        datos[textos[i]] = procBool(instancia[i]);
    }

    datos.ID = esAdmin ? `${instancia.id}-${instancia.usuario}` : instancia.id;
    datos.sexo = instancia.sexo == 0 ? "M" : "F";
    datos[textos.otra_enfermedad] = instancia.otra_enfermedad;
    datos[textos.txtCampoDiagnostico] = instancia.diagnostico;
    datos[textos.txtCampoMedico] = instancia.validado ? instancia.validado : "N/A";
    datos[textos.txtFecha] = instancia.fecha.toDate().toLocaleDateString(idioma);

    if (!esAdmin) {
        datos[textos.txtPaciente] = instancia.paciente;
        datos[textos.txtCamposSignificativos] = instancia.explicacion;
        datos[textos.txtCampoProbabilidad] = (instancia.probabilidad * 100).toFixed(2);
    } else {
        datos[textos.txtUsuario] = instancia.usuario;
    }

    return datos;
};