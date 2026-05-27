import { expect, describe, test } from '@jest/globals';
import { comparadorStrNum, obtenerComparadorStrNum } from '../../../src/utils/Ordenamiento';

describe("Validar la función 'comparadorStrNum'", () => {
    // ------------------ Parámetros -------------------
    const params1 = {
        a: {id: 1, campo1: "Hola", campo2: "texto"},
        b: {id: 2, campo1: "Adios", campo2: "texto"},
        campo: "campo1"
    };
    const params2 = {
        a: {id: 1, campo1: 1, campo2: "texto"},
        b: {id: 2, campo1: 5, campo2: "texto"},
        campo: "campo1"
    };
    const params3 = {
        a: {id: 1, campo1: "Hola", campo2: "texto"},
        b: {id: 2, campo1: "Hola", campo2: "texto"},
        campo: "campo1"
    };

    // ------------------ Resultados esperados -------------------
    const res1 = 1;
    const res2 = -1;
    const res3 = 0;

    test.each([
        ["55", params1, res1],
        ["56", params2, res2],
        ["57", params3, res3]
    ])("CP - %s", (idPrueba, params, resEsperado) => {
        const { a, b, campo } = params1;

        const res = comparadorStrNum(a, b, campo);
        expect(res).toEqual(resEsperado);
    });
});

describe("Validar la función 'obtenerComparadorStrNum'", () => {
    // ------------------ Parámetros -------------------
    const params1 = {
        orden: "asc",
        campo: "campo1"
    };
    const params2 = {
        orden: "desc",
        campo: "campo2"
    };

    // ------------------ Resultados esperados -------------------
    const res1 = "-comparadorStrNum(a, b, campo)";
    const res2 = "comparadorStrNum(a, b, campo)";

    test.each([
        ["58", params1, res1],
        ["59", params2, res2]
    ])("CP - %s", (idPrueba, params, resEsperado) => {
        const { orden, campo } = params;
        const res = obtenerComparadorStrNum(orden, campo).toString();
        expect(res).toMatch(resEsperado);
    });
});