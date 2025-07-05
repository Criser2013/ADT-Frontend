import { expect, describe, test } from '@jest/globals';
import { buscar } from '../../../src/utils/Busqueda';
describe("Validar la función 'buscar'", () => {
    test("CP - 60", () => {
        const res = buscar([
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" },
            { nombre: "mario", edad: 99, cedula: "654311" }
        ], "2", ["edad", "cedula"]
        )
        expect(res).toEqual([
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" }
        ]);
    });

    test("CP - 61", () => {
        const res = buscar([
            { nombre: "jose", edad: 20, cedula: "193456" },
            { nombre: "maria", edad: 35, cedula: "654321" },
            { nombre: "mario", edad: 99, cedula: "654311" }
        ], "mario", ["edad", "cedula"]
        )
        expect(res).toEqual([]);
    });
});