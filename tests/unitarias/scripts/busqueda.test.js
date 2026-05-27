import { expect, describe, test } from '@jest/globals';
import { buscar } from '../../../src/utils/Busqueda';
describe("Validar la función 'buscar'", () => {
    // ---------------- Parámetros de prueba ----------------
    const params1 = {
        datos: [
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" },
            { nombre: "mario", edad: 99, cedula: "654311" }
        ],
        termino: "2",
        campos: ["edad", "cedula"]
    };
    const params2 = {
        datos: [
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" },
            { nombre: "mario", edad: 99, cedula: "654311" }
        ],
        termino: "mario",
        campos: ["edad", "cedula"]
    }
    
    // ---------------- Respuestas esperadas ----------------
    const res1 = [
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" }
        ];
    const res2 = [];

    test.each([
        ["60", params1, res1]
    ])("CP - %s", (idPrueba, params, resEsperado) => {
        const { datos, termino, campos } = params;

        const res = buscar(datos, termino, campos);
        expect(res).toEqual(resEsperado);
    });
});