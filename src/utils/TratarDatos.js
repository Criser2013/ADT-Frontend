import { COMORBILIDADES } from "../../constants";

/**
 * Convierte la lista de comorbilidades en un JSON cuyas claves son las comorbilidades
 * y los valores son 0 o 1, dependiendo si el paciente la padece o no.
 * @param {Array} datos - Lista de comorbilidades.
 * @returns JSON
 */
export function oneHotEncondingOtraEnfermedad(datos) {
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
 * Elimina los datos personales de los pacientes. Solo deja los datos de comorbilidades.
 * @param {JSON} datos - JSON con los datos de los pacientes.
 * @returns JSON
 */
export function quitarDatosPersonales(datos) {
    const aux = { ...datos };
    for (const j of COMORBILIDADES) {
        if (aux[j] != undefined) {
            delete aux[j];
        }
    }
    return aux;
};

/**
 * Transforma los datos de comorbilidades codificados como one-hot a un Arrray.
 * @param {JSON} datos - JSON con las comorbilidades codificadas como one-hot.
 * @returns Array
 */
export function oneHotInversoOtraEnfermedad(datos) {
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
 * @returns Boolean
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
 * Transforma los datos del paciente a un formato adecuado para el modelo.
 * @param {JSON} datos - JSON con los datos del paciente sin incluir las comorbildiades.
 * @param {JSON} comorbilidades - JSON OneHot con las comorbilidades del paciente.
 * @returns JSON
 */
export function transformarDatos(datos, comorbilidades) {
    return {
        edad: parseInt(datos.edad, 10),
        sexo: datos.sexo,
        bebedor: procBool(datos.bebedor),
        fumador: procBool(datos.fumador),
        cirugia_reciente: procBool(datos.cirugiaReciente),
        inmovilidad_de_m_inferiores: procBool(datos.inmovilidad),
        viaje_prolongado: procBool(datos.viajeProlongado),
        TEP_TVP_previo: procBool(datos.tepPrevio),
        malignidad: procBool(datos.malignidad),
        disnea: procBool(datos.disnea),
        dolor_toracico: procBool(datos.dolorToracico),
        tos: procBool(datos.tos),
        hemoptisis: procBool(datos.hemoptisis),
        sintomas_disautonomicos: procBool(datos.disautonomicos),
        edema_de_m_inferiores: procBool(datos.edema),
        frecuencia_respiratoria: parseFloat(datos.frecRes.replace(",", ".")),
        saturacion_de_la_sangre: parseFloat(datos.so2.replace(",", ".")),
        frecuencia_cardiaca: parseInt(datos.frecCard.replace(",", "."), 10),
        presion_sistolica: parseInt(datos.presionSis.replace(",", "."), 10),
        presion_diastolica: parseInt(datos.presionDias.replace(",", "."), 10),
        fiebre: procBool(datos.fiebre),
        crepitaciones: procBool(datos.crepitaciones),
        sibilancias: procBool(datos.sibilancias),
        soplos: procBool(datos.soplos),
        wbc: parseFloat(datos.wbc.replace(",", ".")),
        hb: parseFloat(datos.hemoglobina.replace(",", ".")),
        plt: parseInt(datos.plaquetas.replace(",", "."), 10),
        derrame: procBool(datos.derrame),
        otra_enfermedad: procBool(datos.otraEnfermedad),
        hematologica: comorbilidades["Enfermedad hematológica"],
        cardiaca: comorbilidades["Enfermedad cardíaca"],
        enfermedad_coronaria: comorbilidades["Enfermedad coronaria"],
        diabetes_mellitus: comorbilidades["Diabetes"],
        endocrina: comorbilidades["Enfermedad endocrina"],
        neurologica: comorbilidades["Enfermedad neurológica"],
        gastrointestinal: comorbilidades["Enfermedad gastrointestinal"],
        hepatopatia_cronica: comorbilidades["Hepatopatía crónica"],
        hipertension_arterial: comorbilidades["Hipertensión arterial"],
        pulmonar: comorbilidades["Enfermedad pulmonar"],
        renal: comorbilidades["Enfermedad renal"],
        trombofilia: comorbilidades["Trombofilia"],
        urologica: comorbilidades["Enfermedad urológica"],
        vascular: comorbilidades["Enfermedad vascular"],
        vih: comorbilidades["VIH"]
    };
};

/**
 * Convierte un valor booleano a un entero.
 * @param {Boolean} valor 
 * @returns Integer
 */
export function procBool(valor) {
    return valor ? 1 : 0;
};

/**
 * Determina a qué intervalo pertenece un valor dado.
 * @param {Int} valor - Valor a clasificar.
 * @param {Array[Array]} intervalos - Lista de intervalos con sus valores asociados.
 * El último elemento de cada tripa es el valor del intervalo. El 1º es el mínimo y el 2º es el máximo. 
 * Tener un "null" en los primeros 2 valores es equivalente al infinito.
 * @returns Integer
 */
export function evaluarIntervalo(valor, intervalos) {
    for (const i of intervalos) {
        if ((i[0] !== null) && (i[1] !== null) && (valor >= i[0]) && (valor < i[1])) {
            return i[2];
        } else if ((i[0] !== null) && (i[1] === null) && (valor >= i[0])) {
            return i[2];
        } else if ((i[0] === null) && (i[1] !== null) && (valor < i[1])) {
            return i[2];
        }
    }
    return -1;
};

/**
 * Convierte un valor de presión sistólica a un entero. Valores del grupo:
 * 1 = [50, 70)
 * 2 = [70, 90)
 * 3 = [90, 110)
 * 4 = [110, 130)
 * 5 = [130, 150)
 * 6 = [150, 170)
 * 7 = [170, 190)
 * 8 = [190, 210)
 * 9 = (-∞ , 50)
 * 10 = [210, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procPresionSist(valor) {
    return evaluarIntervalo(valor, [
        [50, 70, 1], [70, 90, 2], [90, 110, 3], [110, 130, 4],
        [130, 150, 5], [150, 170, 6], [170, 190, 7], [190, 210, 8],
        [null, 50, 9], [210, null, 10]
    ]);
};

/**
 * Convierte un valor de presión diastólica a un entero. Valores del grupo:
 * 1 = [40, 50)
 * 2 = [50, 60)
 * 3 = [60, 70)
 * 4 = [70, 80)
 * 5 = [80, 90)
 * 6 = [90, 100)
 * 7 = [100, 110)
 * 8 = [110, 120)
 * 9 = (-∞ , 40)
 * 10 = [120, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procPresionDiast(valor) {
    return evaluarIntervalo(valor, [
        [40, 50, 1], [50, 60, 2], [60, 70, 3], [70, 80, 4],
        [80, 90, 5], [90, 100, 6], [100, 110, 7], [110, 120, 8],
        [null, 40, 9], [120, null, 10]
    ]);
};

/**
 * Convierte un valor de conteo de globulos blancos (WBC) a un entero. Valores del grupo:
 * 1 = [2000, 4000)
 * 2 = [4000, 10000)
 * 3 = [10000, 15000)
 * 4 = [15000, 20000)
 * 5 = [20000, 30000)
 * 6 = [30000, 35000)
 * 7 = (-∞ , 2000)
 * 8 = [35000, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procWbc(valor) {
    return evaluarIntervalo(valor, [
        [2000, 4000, 1], [4000, 10000, 2], [10000, 15000, 3],
        [15000, 20000, 4], [20000, 30000, 5], [30000, 35000, 6],
        [null, 2000, 7], [35000, null, 7]
    ]);
};

/**
 * Convierte un valor de hemoglobina (HB) a un entero. Valores del grupo:
 * 1 = [6, 8)
 * 2 = [8, 10)
 * 3 = [10, 12)
 * 4 = [12, 14)
 * 5 = [14, 16)
 * 6 = [16, 18)
 * 7 = [18, 20)
 * 8 = [20, 22)
 * 9 = (-∞ , 6)
 * 10 = [22, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procHb(valor) {
    return evaluarIntervalo(valor, [
        [6, 8, 1], [8, 10, 2], [10, 12, 3], [12, 14, 4], [14, 16, 5],
        [16, 18, 6], [18, 20, 7], [20, 22, 8], [null, 6, 9], [22, null, 10]
    ]);
};

/**
 * Convierte el conteo de plaquetas (PLT) a un entero. Valores del grupo:
 * 1 = [10000, 50000)
 * 2 = [50000, 100000)
 * 3 = [100000, 150000)
 * 4 = [150000, 400000)
 * 5 = [400000, 500000)
 * 6 = [500000, 600000)
 * 7 = [600000, 700000)
 * 8 = (-∞ , 10000)
 * 9 = [700000, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procPlt(valor) {
    return evaluarIntervalo(valor, [
        [10000, 50000, 1], [50000, 100000, 2], [100000, 150000, 3],
        [150000, 400000, 4], [400000, 500000, 5], [500000, 600000, 6],
        [600000, 700000, 7], [null, 10000, 9], [700000, null, 10]
    ]);
};

/**
 * Convierte un valor de frecuencia respiratoria a un entero. Valores del grupo:
 * 1 = [15, 20)
 * 2 = [20, 25)
 * 3 = [25, 30)
 * 4 = [30, 35)
 * 5 = [35, 40)
 * 6 = [40, 45)
 * 7 = [45, 50)
 * 8 = [50, 55)
 * 9 = [55, 60)
 * 10 = (-∞,15]
 * 11 = [60, ∞)
 * @param {String} valor - Valor a convertir
 * @returns Number
 */
export function procFrecRes(valor) {
    return evaluarIntervalo(valor, [
        [15, 20, 1], [20, 25, 2], [25, 30, 3], [30, 35, 4], [35, 40, 5],
        [40, 45, 6], [45, 50, 7], [50, 55, 8], [55, 60, 9], [null, 15, 10],
        [60, null, 11]
    ]);
};

/**
 * Convierte un valor de saturación de oxígeno (SO2) a un entero. Valores del grupo:
 * 1 = [50, 55)
 * 2 = [55, 60)
 * 3 = [60, 65)
 * 4 = [65, 70)
 * 5 = [70, 75)
 * 6 = [75, 80)
 * 7 = [80, 85)
 * 8 = [85, 90)
 * 9 = [90, 95)
 * 10 = [95, 100)
 * 11 = (-∞ , 50)
 * 12 = [100, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procSo2(valor) {
    return evaluarIntervalo(valor, [
        [50, 55, 1], [55, 60, 2], [60, 65, 3], [65, 70, 4], [70, 75, 5],
        [75, 80, 6], [80, 85, 7], [85, 90, 8], [90, 95, 9], [95, 100, 10],
        [null, 50, 11], [100, null, 12]
    ]);
};

/**
 * Convierte un valor de frecuencia cardíaca a un entero. Valores del grupo:
 * 1 = [50, 70)
 * 2 = [70, 90)
 * 3 = [90, 110)
 * 4 = [110, 130)
 * 5 = [130, 150)
 * 6 = [150, 170)
 * 7 = [170, 190)
 * 8 = [190, 210)
 * 9 = (-∞ , 50)
 * 10 = [210, ∞)
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procFrecCard(valor) {
    return evaluarIntervalo(valor, [
        [50, 70, 1], [70, 90, 2], [90, 110, 3], [110, 130, 4], [130, 150, 5],
        [150, 170, 6], [170, 190, 7], [190, 210, 8], [null, 50, 9], [210, null, 10]
    ]);
};

/**
 * Convierte un valor de edad a un entero. Valores del grupo:
 * 0 = [0, 20) - Menor de 20 años.
 * 1 = [20, 40) - 20 a 40 años.
 * 2 = [40, 60) - 41 a 60 años.
 * 3 = [60, 80) - 60 a 80 años.
 * 4 = [81, ∞) - Mayor de 80 años.
 * @param {String} valor - Valor a convertir.
 * @returns Number
 */
export function procEdad(valor) {
    return evaluarIntervalo(valor, [
        [0, 20, 0], [20, 41, 1], [41, 61, 2],
        [61, 81, 3], [81, null, 4]
    ]);
};

/**
 * Determina el texto del diagnóstico según su valor.
 * @param {Integer} diagnostico 
 * @returns {String}
 */
export function detTxtDiagnostico(diagnostico) {
    switch (diagnostico) {
        case 0:
            return "Negativo";
        case 1:
            return "Positivo";
        default:
            return "No diagnósticado";
    }
};

/**
 * Transforma una instancia de la base de datos al formato de campos de Excel.
 * @param {JSON} instancia - Instancia de diagnóstico.
 * @param {Boolean} esAdmin - Indica si el usuario es administrador.
 * @returns {JSON}
 */
export function nombresCampos(instancia, esAdmin, preprocesar = false) {
    const datos = {
        "ID": instancia.id,
        "Edad": preprocesar ? procEdad(instancia.edad) : instancia.edad,
        "Género": preprocesar ? instancia.sexo: (instancia.sexo == 0 ? "M" : "F"),
        "Bebedor": instancia.bebedor,
        "Fumador": instancia.fumador,
        "Cirugía reciente": instancia.cirugiaReciente,
        "Inmovilidad de M inferiores": instancia.inmovilidad,
        "Viaje prolongado": instancia.viajeProlongado,
        "TEP - TVP Previo": instancia.tepPrevio,
        "Malignidad": instancia.malignidad,
        "Disnea": instancia.disnea,
        "Dolor toracico": instancia.dolorToracico,
        "Tos": instancia.tos,
        "Hemoptisis": instancia.hemoptisis,
        "Síntomas disautonomicos": instancia.disautonomicos,
        "Edema de M inferiores": instancia.edema,
        "Frecuencia respiratoria": preprocesar ? procFrecRes(instancia.frecRes) : instancia.frecRes,
        "Saturación de la sangre": preprocesar ? procSo2(instancia.so2) : instancia.so2,
        "Frecuencia cardíaca": preprocesar ? procFrecCard(instancia.frecCard) : instancia.frecCard,
        "Presión sistólica": preprocesar ? procPresionSist(instancia.presionSis) : instancia.presionSis,
        "Presión diastólica": preprocesar ? procPresionDiast(instancia.presionDias) : instancia.presionDias,
        "Fiebre": instancia.fiebre,
        "Crepitaciones": instancia.crepitaciones,
        "Sibilancias": instancia.sibilancias,
        "Soplos": instancia.soplos,
        "WBC": preprocesar ? procWbc(instancia.wbc) : instancia.wbc,
        "HB": preprocesar ? procHb(instancia.hemoglobina) : instancia.hemoglobina,
        "PLT": preprocesar ? procPlt(instancia.plaquetas) : instancia.plaquetas,
        "Derrame": instancia.derrame,
        "Otra Enfermedad": instancia.otraEnfermedad,
        "Hematologica": instancia["Enfermedad hematológica"],
        "Cardíaca": instancia["Enfermedad cardíaca"],
        "Enfermedad coronaria": instancia["Enfermedad coronaria"],
        "Diabetes Mellitus": instancia["Diabetes"],
        "Endocrina": instancia["Enfermedad endocrina"],
        "Gastrointestinal": instancia["Enfermedad gastrointestinal"],
        "Hepatopatía crónica": instancia["Hepatopatía crónica"],
        "Hipertensión arterial": instancia["Hipertensión arterial"],
        "Neurológica": instancia["Enfermedad neurológica"],
        "Pulmonar": instancia["Enfermedad pulmonar"],
        "Renal": instancia["Enfermedad renal"],
        "Trombofilia": instancia["Trombofilia"],
        "Urológica": instancia["Enfermedad urológica"],
        "Vascular": instancia["Enfermedad vascular"],
        "VIH": instancia["VIH"],
        "TEP": (instancia.validado != 2) ? instancia.validado : "N/A",
    };

    if (!esAdmin) {
        datos["Paciente"] = instancia.paciente;
        datos["Fecha"] = instancia.fecha.toDate().toLocaleDateString("es-CO");
        datos["Diagnóstico modelo"] = instancia.diagnostico;
        datos["Probabilidad"] = (instancia.probabilidad * 100).toFixed(2);
    }

    return datos;
};