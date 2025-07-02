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
    for (const j of COMORBILIDADES) {
        if (datos[j] != undefined) {
            delete datos[j];
        }
    }
    return datos;
};

/**
 * Transforma los datos de comorbilidades codificados como one-hot a un Arrray.
 * @param {JSON} datos - JSON con las comorbilidades codificadas como one-hot.
 * @returns Array
 */
export function oneHotInversoOtraEnfermedad(datos) {
    const aux = [];
    for (const i in datos) {
        if (datos[i] == 1) {
            aux.push(i);
        }
    }
    return aux;
};