import { COMORBILIDADES } from "../../constants";

/**
 * Convierte la lista de comorbilidades en un JSON cuyas claves son las comorbilidades
 * y los valores son 0 o 1, dependiendo si el paciente la padece o no.
 * @param {Array} datos - Lista de comorbilidades.
 * @returns JSON
 */
export function oneHotEncondingOtraEnfermedad (datos) {
    const aux = {};

    for (const i of COMORBILIDADES) {
        aux[i] = 0;
    }

    for (const i of datos) {
        aux[i] = 1;
    }

    return aux;
};