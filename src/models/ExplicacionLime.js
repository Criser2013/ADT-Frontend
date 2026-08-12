/**
 * Modelo que representa la explicación de LIME sobre el diagnóstico 
 * generado por el modelo de predicción de TEP.
 * @class ExplicacionLime
 */
export default class ExplicacionLime {
    #explicacion = [];

    /**
     * Instancia de la clase ExplicacionLime.
     * @param {Array<Object>} explicacion Explicacón del modelo en la forma de un arreglo 
     * de objetos con la siguiente estructura:
     * - campo (String): Nombre del campo de entrada.
     * - contribucion (Number): Contribución del campo al diagnóstico.
     */
    constructor(explicacion) {
        this.#explicacion = explicacion;
    }

    get datosGrafico() {
        const campos = [];
        const datosPositivos = [];
        const datosNegativos = [];
        for (const i of this.#explicacion) {
            campos.push(i.campo);
            if (i.contribucion > 0) {
                datosPositivos.push(i.contribucion);
                datosNegativos.push(0);
            } else {
                datosPositivos.push(0);
                datosNegativos.push(Math.abs(i.contribucion));
            }
        }
        return { campos, datosPositivos, datosNegativos };
    }

    /**
     * @returns {Array<Object>} Explicacón del modelo en la forma de un arreglo 
     * de objetos con la siguiente estructura:
     * - campo (String): Nombre del campo de entrada.
     * - contribucion (Number): Contribución del campo al diagnóstico.
     */
    toJson() {
        return this.#explicacion;
    }
}