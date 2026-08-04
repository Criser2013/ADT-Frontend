import { CAMPOS_BIN, CAMPOS_NUM, COMORBILIDADES, INTERVALOS_PREPROCESAMIENTO, TXT_MESES } from "../constants";


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
    const textos = await fetch(`/locales/${idioma}/translation.json`).then((res) => res.json());

    datos.ID = esAdmin ? instancia.idCompuesto : instancia.id;

    if (!esAdmin) {
        datos[textos.txtPaciente] = detTextoPersona("paciente", instancia.nombrePaciente, (key) => textos[key]);
        datos[textos.txtCamposSignificativos] = JSON.stringify(instancia.explicacion.toJson());
        datos[textos.txtCampoProbabilidad] = (instancia.probabilidad * 100).toFixed(2);
    } else {
        datos[textos.txtUsuario] = detTextoPersona("usuario", instancia.usuario, (key) => textos[key]);
    }

    datos[textos.txtCampoSexo] = (!esAdmin || (esAdmin && !preprocesar)) ? (instancia.sexo == 0 ? "M" : "F") : instancia.sexo;
    datos[textos.otra_enfermedad] = procBool(instancia.otraEnfermedad);
    datos[textos.txtCampoDiagModelo] = procBool(instancia.diagnosticoModelo);
    datos[textos.txtCampoDiagMedico] = instancia.validado ? procBool(instancia.validado) : "N/A";
    datos[textos.txtFecha] = instancia.fecha.toLocaleDateString(idioma);

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

    return datos;
};

/**
 * Determina qué nombre se debería mostrar para una persona según su rol y nombre. 
 * Útil para mostrar correctamente los nombres de pacientes y usuarios que han sido eliminados o anonimizados.
 * @param {String} rol Rol de la persona (paciente o usuario).
 * @param {String} nombre Nombre de la persona (puede ser "eliminado" o "anonimo").
 * @param {Function} t Función para traducir los textos.
 * @returns {String} Texto correspondiente según el rol y nombre de la persona.
 */
export function detTextoPersona(rol, nombre, t) {
    if (rol == "paciente" && nombre == "paciente eliminado") {
        return `${t("txtPaciente")} ${t("txtEliminado")}`;
    } else if (rol == "paciente" && nombre == "paciente anónimo") {
        return `${t("txtPaciente")} ${t("txtAnonimo")}`;
    } else if (rol == "usuario" && nombre == "usuario eliminado") {
        return `${t("txtUsuario")} ${t("txtEliminado")}`;
    } else {
        return nombre;
    }
};

/**
 * Obtiene un objeto con la cantidad de datos por mes.
 * @param {Array<Object>} datos - Datos con fechas a filtrar.
 * @param {String} clave - Clave del objeto que contiene la fecha.
 * @param {Dayjs} fechaInicio - Fecha de inicio para calcular los meses.
 * @param {Dayjs} fechaFinal - Fecha final para calcular los meses.
 * @returns {Object} Objeto con la cantidad de datos por mes, donde las claves son los nombres de 
 * los meses y los valores son la cantidad de datos.
 */
export function obtenerDatosPorMes(datos, clave, fechaInicio, fechaFinal) {
    const mapeo = {};
    const mesesDiferencia = fechaFinal.diff(fechaInicio, "month");
    const mesInicio = fechaInicio.get("month");

    for (let i = 0; i < mesesDiferencia + 1; i++) {
        mapeo[(mesInicio + i) % 12] = 0;
    }

    datos.forEach((x) => {
        const mesInstancia = x[clave].get("month");
        if (x[clave] >= fechaInicio && x[clave] <= fechaFinal) {
            mapeo[mesInstancia] += 1;
        }
    });

    return mapeo;
};

/**
 * Establece los textos de los meses en un objeto.
 * @param {Object} datos Objeto con la cantidad de datos por mes, donde las claves son los índices 
 * de los meses (0-11) y los valores son la cantidad de datos.
 * @param {Function} t Función para traducir los textos.
 * @returns {Object} Objeto con los nombres de los meses como claves y la cantidad de datos como valores.
 */
export function establecerTextoMeses(datos, t) {
    const res = {};
    for (const i in datos) {
        res[t(TXT_MESES[i])] = datos[i];
    }

    return res;
};

/**
 * Obtiene los datos del mes actual.
 * @param {Object} datos Objeto con la cantidad de datos por mes, donde las claves son los índices 
 * de los meses (0-11) y los valores son la cantidad de datos.
 * @returns {Number} Cantidad de datos del mes actual.
 */
export function obtenerDatosMesActual(datos) {
    const tam = Object.keys(datos).length;
    return tam > 0 ? datos[Object.keys(datos)[tam - 1]] : 0;
};