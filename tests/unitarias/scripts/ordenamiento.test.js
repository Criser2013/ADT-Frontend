import { expect, describe, test } from '@jest/globals';
import { comparadorStrNum, obtenerComparadorStrNum } from '../../../src/utils/Ordenamiento';

describe("Validar la función 'comparadorStrNum'", () => {
    test("CP - 55", () => {
        const res = comparadorStrNum(
            {id: 1, campo1: "Hola", campo2: "texto"},
            {id: 2, campo1: "Adios", campo2: "texto"},
            "campo1"
        )
        expect(res).toEqual(1);
    });

    test("CP - 56", () => {
        const res = comparadorStrNum(
            {id: 1, campo1: 1, campo2: "texto"},
            {id: 2, campo1: 5, campo2: "texto"},
            "campo1"
        )
        expect(res).toEqual(-1);
    });

    test("CP - 57", () => {
        const res = comparadorStrNum(
            {id: 1, campo1: "Hola", campo2: "texto"},
            {id: 1, campo1: "Hola", campo2: "texto"},
            "id"
        )
        expect(res).toEqual(0);
    });
});

describe("Validar la función 'obtenerComparadorStrNum'", () => {
    test("CP - 58", () => {
        const res = obtenerComparadorStrNum("asc", "campo1").toString();

        expect(res).toEqual(expect.stringContaining("(a, b) => -comparadorStrNum(a, b, campo)"));
    });

    test("CP - 59", () => {
        const res = obtenerComparadorStrNum("desc", "campo2").toString();

        expect(res).toEqual(expect.stringContaining("(a, b) => comparadorStrNum(a, b, campo)"));
    });
});